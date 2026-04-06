'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createAdvisoryAction } from '@/lib/advisories/actions';
import {
  INITIAL_ADVISORY_ACTION_STATE,
  type AdvisoryActionState,
  type AdvisoryTemplateItem,
} from '@/lib/advisories/types';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';

const TEMPLATE_CHIP_LIMIT = 3;

function fieldError(
  state: AdvisoryActionState,
  name: 'templateName' | 'title' | 'message'
) {
  return state.fieldErrors?.[name]?.[0];
}

export function AdvisoryComposeForm({
  templates,
  targetPolygon,
  targetResidentIds,
}: {
  templates: AdvisoryTemplateItem[];
  targetPolygon?: string;
  targetResidentIds?: string;
}) {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [templateName, setTemplateName] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [state, action, pending] = useActionState(
    createAdvisoryAction,
    INITIAL_ADVISORY_ACTION_STATE
  );

  const templateById = useMemo(
    () => new Map(templates.map((template) => [template.id, template])),
    [templates]
  );

  const visibleTemplates = showAllTemplates
    ? templates
    : templates.slice(0, TEMPLATE_CHIP_LIMIT);

  const hasOverflowTemplates = templates.length > TEMPLATE_CHIP_LIMIT;

  useEffect(() => {
    if (state.status === 'success' && !state.stats) {
      setIsTemplateDialogOpen(false);
    }
  }, [state.status, state.stats]);

  function applyTemplate(templateId: string) {
    const template = templateById.get(templateId);

    if (!template) {
      return;
    }

    setSelectedTemplateId(template.id);
    setTemplateName(template.name);
    setTitle(template.title);
    setMessage(template.message);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compose advisory</CardTitle>
        <CardDescription>
          Send an advisory to residents inside the selected target area.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="advisory-compose-form"
          action={action}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <Field
              data-invalid={Boolean(fieldError(state, 'title')) || undefined}
            >
              <FieldLabel htmlFor="advisory-title">Title</FieldLabel>
              <Input
                id="advisory-title"
                name="title"
                maxLength={120}
                placeholder="Heavy rainfall warning"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                aria-invalid={Boolean(fieldError(state, 'title')) || undefined}
              />
              <FieldDescription>
                Keep this short and specific. This appears as the advisory
                heading.
              </FieldDescription>
              <FieldError>{fieldError(state, 'title')}</FieldError>
            </Field>

            <Field
              data-invalid={Boolean(fieldError(state, 'message')) || undefined}
            >
              <FieldLabel htmlFor="advisory-message">Message</FieldLabel>
              <Textarea
                id="advisory-message"
                name="message"
                maxLength={2000}
                placeholder="Avoid low-lying areas near rivers. Move to designated evacuation sites if water levels rise."
                required
                rows={8}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                aria-invalid={
                  Boolean(fieldError(state, 'message')) || undefined
                }
                className={cn(
                  'w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
                  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
                )}
              />
              <FieldDescription>
                The full advisory details sent to residents in their subscribed
                chat threads.
              </FieldDescription>
              <FieldError>{fieldError(state, 'message')}</FieldError>
            </Field>
          </FieldGroup>

          <input type="hidden" name="templateName" value={templateName} />
          <input
            type="hidden"
            name="targetPolygon"
            value={targetPolygon ?? ''}
          />
          <input
            type="hidden"
            name="targetResidentIds"
            value={targetResidentIds ?? ''}
          />

          {templates.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Quick templates
              </p>
              <div className="flex flex-wrap gap-2">
                {visibleTemplates.map((template) => (
                  <Button
                    key={template.id}
                    type="button"
                    variant={
                      selectedTemplateId === template.id
                        ? 'secondary'
                        : 'outline'
                    }
                    size="xs"
                    className="max-w-full"
                    onClick={() => applyTemplate(template.id)}
                  >
                    <span className="truncate">{template.name}</span>
                  </Button>
                ))}
                {hasOverflowTemplates ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground"
                    onClick={() => setShowAllTemplates((current) => !current)}
                  >
                    {showAllTemplates ? 'Show less' : '...'}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {state.message ? (
            <p
              className={cn(
                'text-sm',
                state.status === 'success' ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              {state.message}
              {state.stats
                ? ` Targeted ${state.stats.targeted}, delivered ${state.stats.delivered}, failed ${state.stats.failed}.`
                : ''}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-3 ms-auto">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setIsTemplateDialogOpen(true)}
            >
              Save as template
            </Button>
            <Button type="submit" name="intent" value="send" disabled={pending}>
              {pending ? 'Processing...' : 'Send advisory'}
            </Button>
          </div>
        </form>

        {/* Template dialog */}
        <Dialog
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save advisory template</DialogTitle>
              <DialogDescription>
                Give this template a name so responders can reuse it quickly.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field
                data-invalid={
                  Boolean(fieldError(state, 'templateName')) || undefined
                }
              >
                <FieldLabel htmlFor="template-name-dialog">
                  Template name
                </FieldLabel>
                <Input
                  id="template-name-dialog"
                  maxLength={80}
                  placeholder="Flood Evacuation Quick Alert"
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  aria-invalid={
                    Boolean(fieldError(state, 'templateName')) || undefined
                  }
                />
                <FieldDescription>
                  Example: Flood Evacuation, Aftershock Reminder, Typhoon Alert.
                </FieldDescription>
                <FieldError>{fieldError(state, 'templateName')}</FieldError>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTemplateDialogOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="advisory-compose-form"
                name="intent"
                value="save_template"
                disabled={pending}
              >
                {pending ? 'Processing...' : 'Save template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
