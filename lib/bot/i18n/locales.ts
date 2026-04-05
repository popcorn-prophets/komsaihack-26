import type { MessageCatalog } from './types';

/**
 * Complete message catalog for resident-facing bot copy.
 */
export const messageCatalog: MessageCatalog = {
  // Onboarding flow
  'onboarding.prompt.language': {
    eng: "What's your preferred language?",
    fil: 'Anong wika ang gusto mong gamitin?',
  },
  'onboarding.prompt.name': {
    eng: "What's your name?",
    fil: 'Ano ang pangalan mo?',
  },
  'onboarding.prompt.location': {
    eng: 'Where do you reside?',
    fil: 'Saan ka nakatira?',
  },
  'onboarding.prompt.confirm': {
    eng: 'Done!',
    fil: 'Tapos na!',
  },
  'onboarding.success.title': {
    eng: 'Welcome!',
    fil: 'Maligayang pagdating!',
  },
  'onboarding.success.message': {
    eng: 'Thank you for registering with Project Hermes.',
    fil: 'Salamat sa pagrehistro sa Project Hermes.',
  },
  'onboarding.cancel.title': {
    eng: 'Cancelled',
    fil: 'Nakansela',
  },
  'onboarding.cancel.message': {
    eng: 'Onboarding has been cancelled. You can start again anytime.',
    fil: 'Nakansela ang onboarding. Maaari mong simulan muli kahit kailan.',
  },

  // Incident reporting flow
  'incident.prompt.type': {
    eng: 'What type of incident are you reporting?',
    fil: 'Anong klase ng insidente ang iyong iuulat?',
  },
  'incident.prompt.severity': {
    eng: 'How severe is the incident right now?',
    fil: 'Gaano kalala ang insidente ngayon?',
  },
  'incident.severity.low': {
    eng: 'Low',
    fil: 'Mababa',
  },
  'incident.severity.medium': {
    eng: 'Medium',
    fil: 'Katamtaman',
  },
  'incident.severity.high': {
    eng: 'High',
    fil: 'Mataas',
  },
  'incident.severity.critical': {
    eng: 'Critical',
    fil: 'Kritikal',
  },
  'incident.prompt.description': {
    eng: 'Please describe what happened.',
    fil: 'Ilarawan mo kung ano ang nangyari.',
  },
  'incident.prompt.location': {
    eng: 'Please share the location of the incident.',
    fil: 'Sabihin mo kung saan nangyari ang insidente.',
  },
  'incident.prompt.review': {
    eng: 'Please review your report before submission.',
    fil: 'Suriin mo muna ang ulat bago ipadala.',
  },
  'incident.review.incident_type_label': {
    eng: 'Incident Type',
    fil: 'Klase ng Insidente',
  },
  'incident.review.severity_label': {
    eng: 'Severity',
    fil: 'Lalab ng Insidente',
  },
  'incident.review.description_label': {
    eng: 'Description',
    fil: 'Paglalarawan',
  },
  'incident.review.location_label': {
    eng: 'Location',
    fil: 'Lokasyon',
  },
  'incident.review.submit_question': {
    eng: 'Submit this report?',
    fil: 'Ipapadala mo na ba ang ulat na ito?',
  },
  'incident.review.confirm': {
    eng: 'Confirm',
    fil: 'Kumpirmahin',
  },
  'incident.review.cancel': {
    eng: 'Cancel',
    fil: 'Ikansela',
  },
  'incident.review.edit': {
    eng: 'Edit',
    fil: 'I-edit',
  },
  'incident.review.edit_prompt': {
    eng: 'Select the field you want to edit.',
    fil: 'Pumili ng field na gusto mong baguhin.',
  },
  'incident.review.footer': {
    eng: 'Select a field to edit, cancel the report, or confirm to submit.',
    fil: 'Pumili ng field na babaguhin, kanselahin ang ulat, o kumpirmahin para maipadala.',
  },
  'incident.submitted.title': {
    eng: 'Report Submitted',
    fil: 'Ulat Naipadala',
  },
  'incident.submitted.message': {
    eng: 'Your incident report has been received. Responders will review it as soon as possible.',
    fil: 'Natanggap na ang iyong ulat. Susuriin ito ng mga taga-responde sa lalong madaling panahon.',
  },
  'incident.cancelled.title': {
    eng: 'Cancelled',
    fil: 'Nakansela',
  },
  'incident.cancelled.message': {
    eng: 'Incident reporting has been cancelled. Send "report" anytime to start again.',
    fil: 'Nakansela ang pag-ulat ng insidente. Ipadala ang "report" para magsimula muli.',
  },
  'incident.error.title': {
    eng: 'Error',
    fil: 'Error',
  },
  'incident.error.submit_fallback': {
    eng: 'An error occurred while submitting your report. Please try again.',
    fil: 'Nagkaroon ng error habang ipinapasa ang ulat mo. Subukan muli.',
  },

  // Freeform incident flow
  'incident.freeform.prompt': {
    eng: 'Describe the incident in one message, or send a photo of the incident, or both. Include what happened, where it happened, and how urgent it is.',
    fil: 'Ilarawan ang insidente sa isang mensahe, o magpadala ng larawan, o pareho. Isama kung ano ang nangyari, saan ito nangyari, at gaano ito ka-urgent.',
  },
  'incident.freeform.location.missing': {
    eng: 'I could not map the location from your report. Please send your location pin or type a nearby place/address.',
    fil: 'Hindi ko mahanap ang lokasyon mula sa ulat mo. Ipadala ang lokasyon mo o mag-type ng malapit na lugar/address.',
  },
  'incident.freeform.location.label': {
    eng: 'Please share the location of the incident.',
    fil: 'Sabihin kung saan nangyari ang insidente.',
  },
  'incident.freeform.submitted.title': {
    eng: 'Report Submitted',
    fil: 'Ulat Naipadala',
  },
  'incident.freeform.submitted.message': {
    eng: 'Your incident report has been received. Responders will review it as soon as possible.',
    fil: 'Natanggap na ang ulat mo. Susuriin ito ng mga taga-responde sa lalong madaling panahon.',
  },

  // Generic step handlers
  'step.text.prompt': {
    eng: 'Please provide input',
    fil: 'Magbigay ng sagot, pakiusap.',
  },
  'step.text.content': {
    eng: 'Please send your response.',
    fil: 'Ipadala ang sagot mo.',
  },
  'step.location.prompt': {
    eng: 'Please share your location',
    fil: 'Ibahagi ang lokasyon mo.',
  },
  'step.location.content': {
    eng: 'Send your location to proceed.',
    fil: 'Ipadala ang lokasyon para magpatuloy.',
  },
  'step.location.pin_error': {
    eng: 'I do not know where is that. Please send your location pin or a recognizable place/address.',
    fil: 'Hindi ko alam kung nasaan iyon. Ipadala ang lokasyon o isang kilalang lugar/address.',
  },
  'step.location.address_error': {
    eng: 'I do not know where is that. Please send a more specific place/address or share your location pin.',
    fil: 'Hindi ko alam kung nasaan iyon. Ipadala ang mas tiyak na lugar/address o ang lokasyon mo.',
  },
  'step.location.resolve_error': {
    eng: 'I could not resolve the location name. Please send a more specific place/address or share your location pin.',
    fil: 'Hindi ko mahanap ang pangalan ng lokasyon. Ipadala ang mas tiyak na lugar/address o ang lokasyon mo.',
  },
  'step.confirmation.prompt': {
    eng: 'Thank you!',
    fil: 'Salamat!',
  },
  'step.confirmation.message': {
    eng: 'Your information has been saved successfully.',
    fil: 'Na-save na ang impormasyon mo.',
  },

  // Bot handler and command hints
  'handler.start.welcome': {
    eng: 'Welcome!',
    fil: 'Maligayang pagdating!',
  },
  'handler.start.welcome_back': {
    eng: 'Welcome back!',
    fil: 'Maligayang pagbabalik!',
  },
  'handler.start.hint': {
    eng: 'Send "{{commands}}" to begin.',
    fil: 'Ipadala ang "{{commands}}" para magsimula.',
  },
  'handler.stop': {
    eng: 'Goodbye!',
    fil: 'Paalam!',
  },
  'handler.error': {
    eng: 'An error occurred. Please try again.',
    fil: 'Nagkaroon ng error. Subukan muli.',
  },
  'handler.flow_already_complete': {
    eng: 'The flow is already complete.',
    fil: 'Tapos na ang kasalukuyang flow.',
  },
  'handler.flow_complete.hint': {
    eng: 'Send a supported command to begin.',
    fil: 'Ipadala ang sinusuportahang utos para magsimula.',
  },
  'handler.missing_resident': {
    eng: 'You need to complete onboarding before reporting incidents. Let us start your registration.',
    fil: 'Kailangan munang tapusin ang onboarding bago mag-ulat. Simulan natin ang pagpaparehistro mo.',
  },

  // Validation and errors
  'error.unexpected': {
    eng: 'An unexpected error occurred. Please try again.',
    fil: 'May nangyaring hindi inaasahang error. Subukan muli.',
  },
  'error.input.required': {
    eng: 'This field is required.',
    fil: 'Kailangan punan ang field na ito.',
  },
  'error.input.invalid_selection': {
    eng: 'Invalid selection. Please choose from the available options.',
    fil: 'Hindi valid ang pagpili. Pumili mula sa mga opsyon.',
  },
  'error.flow.cyclic': {
    eng: 'An error occurred. Please try again.',
    fil: 'Nagkaroon ng error. Subukan muli.',
  },
  'error.flow.invalid_step': {
    eng: 'An error occurred. Please start over.',
    fil: 'Nagkaroon ng error. Magsimula muli.',
  },
  'error.onboarding.fallback': {
    eng: 'An error occurred. Please try again.',
    fil: 'Nagkaroon ng error. Subukan muli.',
  },
  'error.resident.not_found': {
    eng: 'You need to complete onboarding before reporting incidents.',
    fil: 'Kailangan munang tapusin ang onboarding bago mag-ulat ng insidente.',
  },
  'error.resident.profile_error': {
    eng: 'An error occurred while checking your profile.',
    fil: 'Nagkaroon ng error habang tine-check ang profile mo.',
  },
  'error.flow.start_error': {
    eng: 'An error occurred. Please try again.',
    fil: 'Nagkaroon ng error. Subukan muli.',
  },
};
