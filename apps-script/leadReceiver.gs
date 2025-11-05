/**
 * OraLife - Réception des leads Quiz Vitalité & Longévité
 * Version 2.0.0
 *
 * ⚠️ Personnaliser avant déploiement :
 *  - SHEET_ID : ID du Google Sheet (https://docs.google.com/spreadsheets/d/ID/edit)
 *  - SHEET_NAME : Onglet de destination
 *  - DEFAULT_NOTIFICATION_EMAILS : destinataires par défaut (surchargés par payload.notifications.emails)
 */

const SHEET_ID = 'VOTRE_SHEET_ID_ICI';
const SHEET_NAME = 'Leads';
const DEFAULT_NOTIFICATION_EMAILS = ['leads@oralife.com'];
const NOTIFICATION_SUBJECT = 'Nouveau lead Quiz Vitalité & Longévité';

/**
 * Point d'entrée pour les requêtes POST provenant du quiz (fetch no-cors).
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  try {
    const payload = parseRequestBody_(e);
    const sheet = getOrCreateSheet_();
    const row = buildRow_(payload);
    sheet.appendRow(row);

    sendNotificationEmail_(payload, sheet);

    const response = { ok: true, receivedAt: new Date().toISOString() };
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Erreur doPost: ' + error);
    const response = { ok: false, error: String(error) };
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Parse le corps JSON de la requête.
 */
function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Payload vide');
  }
  return JSON.parse(e.postData.contents);
}

/**
 * Retourne l'onglet cible (le crée si nécessaire et ajoute les en-têtes).
 */
function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const existingSheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (existingSheet) {
    return existingSheet;
  }
  const sheet = spreadsheet.insertSheet(SHEET_NAME);
  const headers = [
    'timestamp_iso',
    'session_id',
    'quiz_id',
    'quiz_version',
    'language',
    'device',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'referrer',
    'completion_time_ms',
    'total_steps',
    'completed_steps',
    'completion_rate',
    'lead_firstname',
    'lead_lastname',
    'lead_email',
    'lead_phone',
    'lead_birthdate',
    'lead_language',
    'lead_consent',
    'metrics_height_cm',
    'metrics_weight_kg',
    'metrics_bmi',
    'metrics_bmi_category',
    'score_final',
    'profile_name',
    'profile_description',
    'strengths',
    'risks',
    'recommendations',
    'answers_json'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  return sheet;
}

/**
 * Construit la ligne à écrire dans Google Sheets.
 */
function buildRow_(payload) {
  const meta = payload.meta || {};
  const tracking = payload.tracking || {};
  const lead = payload.lead || {};
  const metrics = payload.metrics || {};
  const scoring = payload.scoring || {};
  const progression = payload.progression || {};

  return [
    new Date().toISOString(),
    meta.session_id || '',
    meta.quiz_id || '',
    meta.version || '',
    meta.language || '',
    tracking.device || '',
    tracking.utm_source || '',
    tracking.utm_medium || '',
    tracking.utm_campaign || '',
    tracking.utm_term || '',
    tracking.utm_content || '',
    tracking.referrer || '',
    tracking.completion_time_ms || '',
    progression.total_steps || '',
    progression.completed_steps || '',
    progression.completion_rate || '',
    lead.firstname || '',
    lead.lastname || '',
    lead.email || '',
    lead.phone || '',
    lead.birthdate || '',
    lead.language || '',
    lead.consent ? 'TRUE' : 'FALSE',
    metrics.height || '',
    metrics.weight || '',
    metrics.bmi || '',
    metrics.category || '',
    scoring.final || '',
    scoring.profile ? scoring.profile.name : '',
    scoring.profile ? scoring.profile.description : '',
    JSON.stringify(scoring.strengths || []),
    JSON.stringify(scoring.risks || []),
    JSON.stringify(scoring.recommendations || []),
    JSON.stringify(payload.answers || {})
  ];
}

/**
 * Envoie l'email de notification.
 */
function sendNotificationEmail_(payload, sheet) {
  const lead = payload.lead || {};
  const scoring = payload.scoring || {};
  const notifications = payload.notifications || {};
  const recipients = (notifications.emails && notifications.emails.length)
    ? notifications.emails
    : DEFAULT_NOTIFICATION_EMAILS;

  const profile = scoring.profile ? scoring.profile.name : 'Profil non calculé';
  const score = scoring.final != null ? scoring.final : '--';
  const sheetUrl = sheet ? sheet.getParent().getUrl() : '';

  const subject = notifications.subject || NOTIFICATION_SUBJECT;
  const body = [
    'Nouveau lead reçu via le Quiz Vitalité & Longévité',
    '',
    'Prénom : ' + (lead.firstname || 'NC'),
    'Nom : ' + (lead.lastname || 'NC'),
    'Email : ' + (lead.email || 'NC'),
    'Téléphone : ' + (lead.phone || 'NC'),
    'Date de naissance : ' + (lead.birthdate || 'NC'),
    '',
    'Score final : ' + score,
    'Profil : ' + profile,
    '',
    'Sheet : ' + sheetUrl
  ].join('\n');

  recipients.forEach(function (email) {
    if (email) {
      MailApp.sendEmail({
        to: email,
        subject: subject,
        body: body
      });
    }
  });
}
