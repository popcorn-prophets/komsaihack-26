import type { MessageCatalog } from './types';

/**
 * Complete message catalog for resident-facing bot copy.
 */
export const messageCatalog: MessageCatalog = {
  // Onboarding flow
  'onboarding.prompt.language': {
    eng: "What's your preferred language?",
    fil: 'Anong wika ang gusto mong gamitin?',
    hil: 'Ano nga lengguwahe ang gusto mo gamiton?',
  },
  'onboarding.prompt.name': {
    eng: "What's your name?",
    fil: 'Ano ang pangalan mo?',
    hil: 'Ano ang imo ngalan?',
  },
  'onboarding.prompt.location': {
    eng: 'Where do you reside?',
    fil: 'Saan ka nakatira?',
    hil: 'Diin ka nagaestar?',
  },
  'onboarding.prompt.confirm': {
    eng: 'Done!',
    fil: 'Tapos na!',
    hil: 'Tapos na!',
  },
  'onboarding.success.title': {
    eng: 'Welcome!',
    fil: 'Maligayang pagdating!',
    hil: 'Maayong pag-abot!',
  },
  'onboarding.success.message': {
    eng: 'Thank you for registering with Project Hermes.',
    fil: 'Salamat sa pagrehistro sa Project Hermes.',
    hil: 'Salamat sa pagparehistro sa Project Hermes.',
  },
  'onboarding.cancel.title': {
    eng: 'Cancelled',
    fil: 'Nakansela',
    hil: 'Ginkansela',
  },
  'onboarding.cancel.message': {
    eng: 'Onboarding has been cancelled. You can start again anytime.',
    fil: 'Nakansela ang onboarding. Maaari mong simulan muli kahit kailan.',
    hil: 'Ginkansela ang onboarding. Pwede ka magsugod liwat bisan san-o.',
  },

  // Incident reporting flow
  'incident.prompt.type': {
    eng: 'What type of incident are you reporting?',
    fil: 'Anong klase ng insidente ang iyong iuulat?',
    hil: 'Ano nga klase sang insidente ang imo ireport?',
  },
  'incident.prompt.severity': {
    eng: 'How severe is the incident right now?',
    fil: 'Gaano kalala ang insidente ngayon?',
    hil: 'Ano na kabudlay ang sitwasyon sang insidente subong?',
  },
  'incident.severity.low': {
    eng: 'Low',
    fil: 'Mababa',
    hil: 'Manubo',
  },
  'incident.severity.moderate': {
    eng: 'Moderate',
    fil: 'Katamtaman',
    hil: 'Katamtaman',
  },
  'incident.severity.high': {
    eng: 'High',
    fil: 'Mataas',
    hil: 'Mataas',
  },
  'incident.severity.critical': {
    eng: 'Critical',
    fil: 'Kritikal',
    hil: 'Kritikal',
  },
  'incident.prompt.description': {
    eng: 'Please describe what happened.',
    fil: 'Ilarawan mo kung ano ang nangyari.',
    hil: 'Palihog ilarawan kon ano ang natabo.',
  },
  'incident.prompt.location': {
    eng: 'Please share the location of the incident.',
    fil: 'Sabihin mo kung saan nangyari ang insidente.',
    hil: 'Palihog ihatag ang lokasyon sang insidente.',
  },
  'incident.prompt.review': {
    eng: 'Please review your report before submission.',
    fil: 'Suriin mo muna ang ulat bago ipadala.',
    hil: 'Palihog usisaha anay ang imo report antes ipadala.',
  },
  'incident.review.incident_type_label': {
    eng: 'Incident Type',
    fil: 'Klase ng Insidente',
    hil: 'Klase sang Insidente',
  },
  'incident.review.severity_label': {
    eng: 'Severity',
    fil: 'Lalab ng Insidente',
    hil: 'Kabug-aton sang Insidente',
  },
  'incident.review.description_label': {
    eng: 'Description',
    fil: 'Paglalarawan',
    hil: 'Paglaragway',
  },
  'incident.review.location_label': {
    eng: 'Location',
    fil: 'Lokasyon',
    hil: 'Lokasyon',
  },
  'incident.review.submit_question': {
    eng: 'Submit this report?',
    fil: 'Ipapadala mo na ba ang ulat na ito?',
    hil: 'Ipadala mo na bala ini nga report?',
  },
  'incident.review.confirm': {
    eng: 'Confirm',
    fil: 'Kumpirmahin',
    hil: 'Kumpirmaha',
  },
  'incident.review.cancel': {
    eng: 'Cancel',
    fil: 'Ikansela',
    hil: 'Kanselahon',
  },
  'incident.review.edit': {
    eng: 'Edit',
    fil: 'I-edit',
    hil: 'Baguhon',
  },
  'incident.review.edit_prompt': {
    eng: 'Select the field you want to edit.',
    fil: 'Pumili ng field na gusto mong baguhin.',
    hil: 'Pilia ang field nga gusto mo baguhon.',
  },
  'incident.review.footer': {
    eng: 'Select a field to edit, cancel the report, or confirm to submit.',
    fil: 'Pumili ng field na babaguhin, kanselahin ang ulat, o kumpirmahin para maipadala.',
    hil: 'Pilia ang field nga baguhon, kanselahon ang report, ukon kumpirmaha para ipadala.',
  },
  'incident.submitted.title': {
    eng: 'Report Submitted',
    fil: 'Ulat Naipadala',
    hil: 'Naipadala na ang Report',
  },
  'incident.submitted.message': {
    eng: 'Your incident report has been received. Responders will review it as soon as possible.',
    fil: 'Natanggap na ang iyong ulat. Susuriin ito ng mga taga-responde sa lalong madaling panahon.',
    hil: 'Nabaton na ang imo report. Susihon ini sang mga responder sa labing madali nga tion.',
  },
  'incident.cancelled.title': {
    eng: 'Cancelled',
    fil: 'Nakansela',
    hil: 'Ginkansela',
  },
  'incident.cancelled.message': {
    eng: 'Incident reporting has been cancelled. Send "report" anytime to start again.',
    fil: 'Nakansela ang pag-ulat ng insidente. Ipadala ang "report" para magsimula muli.',
    hil: 'Ginkansela ang pagreport sang insidente. Ipadala ang "report" bisan san-o para magsugod liwat.',
  },
  'incident.error.title': {
    eng: 'Error',
    fil: 'Error',
    hil: 'Error',
  },
  'incident.error.submit_fallback': {
    eng: 'An error occurred while submitting your report. Please try again.',
    fil: 'Nagkaroon ng error habang ipinapasa ang ulat mo. Subukan muli.',
    hil: 'May nagluntad nga error samtang ginapadala ang imo report. Palihog liwat.',
  },

  // Freeform incident flow
  'incident.freeform.prompt': {
    eng: 'Describe the incident in one message, or send a photo of the incident, or both. Include what happened, where it happened, and how urgent it is.',
    fil: 'Ilarawan ang insidente sa isang mensahe, o magpadala ng larawan, o pareho. Isama kung ano ang nangyari, saan ito nangyari, at gaano ito ka-urgent.',
    hil: 'Ilaragway ang insidente sa isa ka mensahe, ukon magpadala sang litrato, ukon pareho. Ibutang kon ano ang natabo, diin natabo, kag kun daw ano ini ka-urgent.',
  },
  'incident.freeform.location.missing': {
    eng: 'I could not map the location from your report. Please send your location pin or type a nearby place/address.',
    fil: 'Hindi ko mahanap ang lokasyon mula sa ulat mo. Ipadala ang lokasyon mo o mag-type ng malapit na lugar/address.',
    hil: 'Wala ko nakilala ang lokasyon halin sa imo report. Palihog ipadala ang imo location pin ukon magsulat sang malapit nga lugar/address.',
  },
  'incident.freeform.location.label': {
    eng: 'Please share the location of the incident.',
    fil: 'Sabihin kung saan nangyari ang insidente.',
    hil: 'Palihog ihatag ang lokasyon sang insidente.',
  },
  'incident.freeform.submitted.title': {
    eng: 'Report Submitted',
    fil: 'Ulat Naipadala',
    hil: 'Naipadala na ang Report',
  },
  'incident.freeform.submitted.message': {
    eng: 'Your incident report has been received. Responders will review it as soon as possible.',
    fil: 'Natanggap na ang ulat mo. Susuriin ito ng mga taga-responde sa lalong madaling panahon.',
    hil: 'Nabaton na ang imo report. Susihon ini sang mga responder sa labing madali nga tion.',
  },

  // Generic step handlers
  'step.text.prompt': {
    eng: 'Please provide input',
    fil: 'Magbigay ng sagot, pakiusap.',
    hil: 'Palihog maghatag sang sabat.',
  },
  'step.text.content': {
    eng: 'Please send your response.',
    fil: 'Ipadala ang sagot mo.',
    hil: 'Palihog ipadala ang imo sabat.',
  },
  'step.location.prompt': {
    eng: 'Please share your location',
    fil: 'Ibahagi ang lokasyon mo.',
    hil: 'Palihog ihatag ang imo lokasyon.',
  },
  'step.location.content': {
    eng: 'Send your location to proceed.',
    fil: 'Ipadala ang lokasyon para magpatuloy.',
    hil: 'Ipadala ang imo lokasyon para makapadayon.',
  },
  'step.location.pin_error': {
    eng: 'I do not know where is that. Please send your location pin or a recognizable place/address.',
    fil: 'Hindi ko alam kung nasaan iyon. Ipadala ang lokasyon o isang kilalang lugar/address.',
    hil: 'Wala ko kabalo kun diin ina. Palihog ipadala ang location pin ukon kilala nga lugar/address.',
  },
  'step.location.address_error': {
    eng: 'I do not know where is that. Please send a more specific place/address or share your location pin.',
    fil: 'Hindi ko alam kung nasaan iyon. Ipadala ang mas tiyak na lugar/address o ang lokasyon mo.',
    hil: 'Wala ko kabalo kun diin ina. Palihog maghatag sang mas klaro nga lugar/address ukon ipadala ang imo location pin.',
  },
  'step.location.resolve_error': {
    eng: 'I could not resolve the location name. Please send a more specific place/address or share your location pin.',
    fil: 'Hindi ko mahanap ang pangalan ng lokasyon. Ipadala ang mas tiyak na lugar/address o ang lokasyon mo.',
    hil: 'Indi ko ma-identify ang ngalan sang lugar. Palihog maghatag sang mas klaro nga lugar/address ukon ipadala ang imo location pin.',
  },
  'step.confirmation.prompt': {
    eng: 'Thank you!',
    fil: 'Salamat!',
    hil: 'Salamat gid!',
  },
  'step.confirmation.message': {
    eng: 'Your information has been saved successfully.',
    fil: 'Na-save na ang impormasyon mo.',
    hil: 'Nakasave na ang imo impormasyon.',
  },

  // Bot handler and command hints
  'handler.start.welcome': {
    eng: 'Welcome!',
    fil: 'Maligayang pagdating!',
    hil: 'Maayong pag-abot!',
  },
  'handler.start.welcome_back': {
    eng: 'Welcome back!',
    fil: 'Maligayang pagbabalik!',
    hil: 'Maayong pagbalik!',
  },
  'handler.start.hint': {
    eng: 'Send "{{commands}}" to begin.',
    fil: 'Ipadala ang "{{commands}}" para magsimula.',
    hil: 'Ipadala ang "{{commands}}" para magsugod.',
  },
  'handler.stop': {
    eng: 'Goodbye!',
    fil: 'Paalam!',
    hil: 'Paalam!',
  },
  'handler.error': {
    eng: 'An error occurred. Please try again.',
    fil: 'Nagkaroon ng error. Subukan muli.',
    hil: 'May nagluntad nga error. Palihog liwat.',
  },
  'handler.flow_already_complete': {
    eng: 'The flow is already complete.',
    fil: 'Tapos na ang kasalukuyang flow.',
    hil: 'Tapos na ang flow.',
  },
  'handler.flow_complete.hint': {
    eng: 'Send a supported command to begin.',
    fil: 'Ipadala ang sinusuportahang utos para magsimula.',
    hil: 'Ipadala ang suportado nga command para magsugod.',
  },
  'handler.missing_resident': {
    eng: 'You need to complete onboarding before reporting incidents. Let us start your registration.',
    fil: 'Kailangan munang tapusin ang onboarding bago mag-ulat. Simulan natin ang pagpaparehistro mo.',
    hil: 'Kinahanglan mo anay tapuson ang onboarding antes magreport sang insidente. Sugdan ta ang imo pagparehistro.',
  },

  // Validation and errors
  'error.unexpected': {
    eng: 'An unexpected error occurred. Please try again.',
    fil: 'May nangyaring hindi inaasahang error. Subukan muli.',
    hil: 'May wala ginlalauman nga error. Palihog liwat.',
  },
  'error.input.required': {
    eng: 'This field is required.',
    fil: 'Kailangan punan ang field na ito.',
    hil: 'Kinahanglan ini nga field.',
  },
  'error.input.invalid_selection': {
    eng: 'Invalid selection. Please choose from the available options.',
    fil: 'Hindi valid ang pagpili. Pumili mula sa mga opsyon.',
    hil: 'Indi sakto ang ginpili. Palihog pili halin sa mga opsyon.',
  },
  'error.flow.cyclic': {
    eng: 'An error occurred. Please try again.',
    fil: 'Nagkaroon ng error. Subukan muli.',
    hil: 'May nagluntad nga error. Palihog liwat.',
  },
  'error.flow.invalid_step': {
    eng: 'An error occurred. Please start over.',
    fil: 'Nagkaroon ng error. Magsimula muli.',
    hil: 'May nagluntad nga error. Palihog magsugod liwat.',
  },
  'error.onboarding.fallback': {
    eng: 'An error occurred. Please try again.',
    fil: 'Nagkaroon ng error. Subukan muli.',
    hil: 'May nagluntad nga error. Palihog liwat.',
  },
  'error.resident.not_found': {
    eng: 'You need to complete onboarding before reporting incidents.',
    fil: 'Kailangan munang tapusin ang onboarding bago mag-ulat ng insidente.',
    hil: 'Kinahanglan mo anay tapuson ang onboarding antes magreport sang insidente.',
  },
  'error.resident.profile_error': {
    eng: 'An error occurred while checking your profile.',
    fil: 'Nagkaroon ng error habang tine-check ang profile mo.',
    hil: 'May nagluntad nga error samtang ginacheck ang imo profile.',
  },
  'error.flow.start_error': {
    eng: 'An error occurred. Please try again.',
    fil: 'Nagkaroon ng error. Subukan muli.',
    hil: 'May nagluntad nga error. Palihog liwat.',
  },
};
