import { Constants, type Enums } from '@/types/supabase';
import { deepgram } from '@ai-sdk/deepgram';
import { google } from '@ai-sdk/google';
import {
  experimental_transcribe as transcribe,
  generateText,
  Output,
} from 'ai';
import type { Attachment, Message } from 'chat';
import { z } from 'zod';

type IncidentSeverity = Enums<'incident_severity'>;
const INCIDENT_SEVERITIES = Constants.public.Enums
  .incident_severity as readonly IncidentSeverity[];

export interface ParsedIncidentReport {
  incidentTypeName: string;
  severity: IncidentSeverity;
  description: string;
  locationDescription: string;
}

function isMessageLike(
  input: unknown
): input is Pick<Message, 'text' | 'attachments'> {
  return Boolean(
    input &&
    typeof input === 'object' &&
    ('text' in input || 'attachments' in input)
  );
}

async function toAttachmentData(
  attachment: Attachment
): Promise<Uint8Array | Buffer | string | URL | undefined> {
  if (
    attachment.data instanceof Uint8Array ||
    Buffer.isBuffer(attachment.data)
  ) {
    return attachment.data;
  }

  if (attachment.data instanceof Blob) {
    return new Uint8Array(await attachment.data.arrayBuffer());
  }

  if (attachment.fetchData) {
    return attachment.fetchData();
  }

  if (attachment.url) {
    return attachment.url;
  }

  return undefined;
}

function isImageAttachment(attachment: Attachment): boolean {
  return (
    attachment.type === 'image' ||
    (attachment.type === 'file' &&
      typeof attachment.mimeType === 'string' &&
      attachment.mimeType.startsWith('image/'))
  );
}

function isAudioAttachment(attachment: Attachment): boolean {
  return (
    attachment.type === 'audio' ||
    ((attachment.type === 'file' || attachment.type === 'video') &&
      typeof attachment.mimeType === 'string' &&
      attachment.mimeType.startsWith('audio/'))
  );
}

async function transcribeAudioAttachment(
  attachment: Attachment
): Promise<string | undefined> {
  const audio = await toAttachmentData(attachment);
  if (!audio) {
    return undefined;
  }

  const result = await transcribe({
    model: deepgram.transcription('nova-3'),
    audio,
  });

  const transcript = result.text.trim();
  return transcript.length > 0 ? transcript : undefined;
}

export async function parseFreeformIncidentReport({
  input,
  allowedIncidentTypeNames,
  residentHomeContext,
}: {
  input: unknown;
  allowedIncidentTypeNames: string[];
  residentHomeContext?: string;
}): Promise<ParsedIncidentReport> {
  if (allowedIncidentTypeNames.length === 0) {
    throw new Error(
      'No incident types are configured yet. Please contact support.'
    );
  }

  const incidentTypeNameEnum = z.enum(
    allowedIncidentTypeNames as [string, ...string[]]
  );

  const parsedIncidentSchema = z.object({
    incidentTypeName: incidentTypeNameEnum.describe(
      'Incident type selected from the incident types table.'
    ),
    severity: z
      .enum(INCIDENT_SEVERITIES)
      .describe('Severity level of the incident.'),
    description: z
      .string()
      .min(10)
      .max(1200)
      .describe('Concise description of what happened.'),
    locationDescription: z
      .string()
      .min(3)
      .max(500)
      .describe(
        'Human-readable location (landmarks, street, barangay, city). Never coordinates.'
      ),
  });

  const userText =
    typeof input === 'string'
      ? input.trim()
      : isMessageLike(input) && typeof input.text === 'string'
        ? input.text.trim()
        : '';

  const audioAttachmentList =
    isMessageLike(input) && Array.isArray(input.attachments)
      ? input.attachments.filter(isAudioAttachment)
      : [];

  const attachmentList =
    isMessageLike(input) && Array.isArray(input.attachments)
      ? input.attachments.filter(isImageAttachment)
      : [];

  const transcriptionSegments: string[] = [];
  for (const attachment of audioAttachmentList) {
    try {
      const transcript = await transcribeAudioAttachment(attachment);
      if (!transcript) {
        continue;
      }

      transcriptionSegments.push(transcript);
    } catch (error) {
      console.error('Failed to transcribe incident audio attachment:', error);
    }
  }

  const transcribedText = transcriptionSegments.join('\n').trim();

  const userContent: Array<
    | { type: 'text'; text: string }
    | {
        type: 'image';
        image: Uint8Array | Buffer | string | URL;
        mediaType?: string;
      }
  > = [];

  if (userText) {
    userContent.push({
      type: 'text',
      text: userText,
    });
  }

  if (transcribedText) {
    userContent.push({
      type: 'text',
      text: `Transcribed voice report:\n${transcribedText}`,
    });
  }

  for (const attachment of attachmentList) {
    const image = await toAttachmentData(attachment);
    if (!image) {
      continue;
    }

    userContent.push({
      type: 'image',
      image,
      mediaType: attachment.mimeType,
    });
  }

  if (userContent.length === 0) {
    throw new Error(
      'Please provide a text description, an incident image, or a voice recording.'
    );
  }

  const result = await generateText({
    model: google('gemini-2.5-flash-lite'),
    output: Output.object({
      schema: parsedIncidentSchema,
    }),
    temperature: 0,
    system: [
      'Extract a structured incident report from the provided text and incident image(s).',
      residentHomeContext
        ? `Resident home context: ${residentHomeContext}`
        : undefined,
      'Use the residence context to resolve vague location references such as "near my home" or "around the house" into a specific nearby location description when possible.',
    ]
      .filter(Boolean)
      .join('\n\n'),
    messages: [
      {
        role: 'user',
        content: userContent,
      },
    ],
  });

  return {
    incidentTypeName: result.output.incidentTypeName,
    severity: result.output.severity,
    description: result.output.description.trim(),
    locationDescription: result.output.locationDescription.trim(),
  };
}
