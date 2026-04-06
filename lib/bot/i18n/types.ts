export type { ResidentLocale } from './config';
import type { ResidentLocale } from './config';

/**
 * Message key namespace for all resident-facing bot copy.
 * Ensures all messages are explicitly defined and translatable.
 */
export type MessageKey =
  // Onboarding flow
  | 'onboarding.prompt.language'
  | 'onboarding.prompt.name'
  | 'onboarding.prompt.location'
  | 'onboarding.prompt.confirm'
  | 'onboarding.success.title'
  | 'onboarding.success.message'
  | 'onboarding.cancel.title'
  | 'onboarding.cancel.message'
  // Incident reporting flow
  | 'incident.prompt.type'
  | 'incident.prompt.severity'
  | 'incident.severity.low'
  | 'incident.severity.moderate'
  | 'incident.severity.high'
  | 'incident.severity.critical'
  | 'incident.prompt.description'
  | 'incident.prompt.location'
  | 'incident.prompt.review'
  | 'incident.review.incident_type_label'
  | 'incident.review.severity_label'
  | 'incident.review.description_label'
  | 'incident.review.location_label'
  | 'incident.review.submit_question'
  | 'incident.review.confirm'
  | 'incident.review.cancel'
  | 'incident.review.edit'
  | 'incident.review.edit_prompt'
  | 'incident.review.footer'
  | 'incident.submitted.title'
  | 'incident.submitted.message'
  | 'incident.cancelled.title'
  | 'incident.cancelled.message'
  | 'incident.error.title'
  | 'incident.error.submit_fallback'
  | 'incident.status.title'
  | 'incident.status.empty'
  | 'incident.status.updated_prefix'
  | 'incident.status.new'
  | 'incident.status.validated'
  | 'incident.status.in_progress'
  | 'incident.status.resolved'
  | 'incident.status.dismissed'
  // Freeform incident flow
  | 'incident.freeform.prompt'
  | 'incident.freeform.location.missing'
  | 'incident.freeform.location.label'
  | 'incident.freeform.review.report_label'
  | 'incident.freeform.submitted.title'
  | 'incident.freeform.submitted.message'
  // Generic step handlers
  | 'step.text.prompt'
  | 'step.text.content'
  | 'step.location.prompt'
  | 'step.location.content'
  | 'step.location.pin_error'
  | 'step.location.address_error'
  | 'step.location.resolve_error'
  | 'step.confirmation.prompt'
  | 'step.confirmation.message'
  // Bot handler and command hints
  | 'handler.start.welcome'
  | 'handler.start.welcome_back'
  | 'handler.start.hint'
  | 'handler.start.hint_intro'
  | 'handler.start.hint_guided_report'
  | 'handler.start.hint_quick_report'
  | 'handler.start.hint_profile'
  | 'handler.start.option_guided_report_desc'
  | 'handler.start.option_quick_report_desc'
  | 'handler.start.option_profile_desc'
  | 'handler.start.option_status_desc'
  | 'handler.start.hint_tip'
  | 'handler.stop'
  | 'handler.error'
  | 'handler.flow_already_complete'
  | 'handler.flow_complete.hint'
  | 'handler.missing_resident'
  // Validation and errors
  | 'error.unexpected'
  | 'error.input.required'
  | 'error.input.invalid_selection'
  | 'error.flow.cyclic'
  | 'error.flow.invalid_step'
  | 'error.onboarding.fallback'
  | 'error.resident.not_found'
  | 'error.resident.profile_error'
  | 'error.flow.start_error';

/**
 * Message catalog structure: messageKey -> locale -> translation
 */
export type MessageCatalog = Record<MessageKey, Record<ResidentLocale, string>>;
