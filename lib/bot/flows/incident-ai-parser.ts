import { Constants, type Enums } from '@/types/supabase';
import { google } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
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

async function toImageData(
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

export async function parseFreeformIncidentReport({
  input,
  allowedIncidentTypeNames,
}: {
  input: unknown;
  allowedIncidentTypeNames: string[];
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

  const attachmentList =
    isMessageLike(input) && Array.isArray(input.attachments)
      ? input.attachments.filter(isImageAttachment)
      : [];

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

  for (const attachment of attachmentList) {
    const image = await toImageData(attachment);
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
    throw new Error('Please provide a text description or an incident image.');
  }

  const result = await generateText({
    model: google('gemini-2.5-flash-lite'),
    output: Output.object({
      schema: parsedIncidentSchema,
    }),
    temperature: 0,
    system:
      'Extract a structured incident report from the provided text and incident image(s).',
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
