// Pure keyword/regex extraction — no AI, no medical interpretation.

const HEALTHCARE_KEYWORDS = [
  'appointment', 'visit', 'lab', 'results', 'reminder', 'doctor',
  'dr.', 'clinic', 'hospital', 'prescription', 'medication', 'rx',
  'refill', 'blood work', 'imaging', 'mri', 'ct scan', 'x-ray',
  'cardiology', 'oncology', 'therapy', 'physical therapy', 'follow-up',
  'check-up', 'wellness', 'annual', 'specialist', 'surgeon', 'dental',
  'ophthalmology', 'dermatology', 'pediatric', 'radiology', 'pathology',
];

const EVENT_TYPE_MAP = {
  lab:         ['lab result', 'test result', 'blood work', 'imaging', 'x-ray', 'mri', 'ct scan', 'pathology', 'specimen', 'radiology'],
  medication:  ['prescription', 'medication', 'rx', 'refill', 'pharmacy', 'dosage', 'pill', 'capsule', 'drug'],
  appointment: ['appointment', 'scheduled', 'confirmed', 'reminder', 'your visit', 'you have a visit'],
  visit:       ['visit', 'consultation', 'follow-up', 'follow up', 'check-up', 'checkup', 'wellness', 'annual'],
};

const PERSON_MAP = {
  Mom: ["mom's", "mother's", ' mom ', ' mom,', ' mom.', 'your mom', 'your mother', 'patient: mom', 'for mom'],
  Dad: ["dad's", "father's", ' dad ', ' dad,', ' dad.', 'your dad', 'your father', 'patient: dad', 'for dad'],
  Self: ['your appointment', 'you have an appointment', 'you are scheduled', 'you have a visit', 'your upcoming', 'dear patient'],
};

const MONTH_MAP = {
  january: 0, february: 1, march: 2,  april: 3,  may: 4,     june: 5,
  july: 6,   august: 7,   september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function isHealthcareEmail(subject, bodyText) {
  const text = `${subject} ${bodyText}`.toLowerCase();
  return HEALTHCARE_KEYWORDS.some((kw) => text.includes(kw));
}

function extractDates(text) {
  const dates = new Set();
  const currentYear = new Date().getFullYear();

  // ISO: 2024-01-15
  for (const m of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}`);
    if (!isNaN(d)) dates.add(d.toISOString().split('T')[0]);
  }

  // US: 1/15/2024 or 01/15/24
  for (const m of text.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g)) {
    let year = parseInt(m[3]);
    if (year < 100) year += 2000;
    const d = new Date(year, parseInt(m[1]) - 1, parseInt(m[2]));
    if (!isNaN(d)) dates.add(d.toISOString().split('T')[0]);
  }

  // "January 15, 2024" or "January 15th, 2024"
  const longRe = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/gi;
  for (const m of text.matchAll(longRe)) {
    const mo = MONTH_MAP[m[1].toLowerCase()];
    const d = new Date(parseInt(m[3]), mo, parseInt(m[2]));
    if (!isNaN(d)) dates.add(d.toISOString().split('T')[0]);
  }

  // "January 15" or "Jan 15" — assume current year
  const shortRe = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi;
  for (const m of text.matchAll(shortRe)) {
    const mo = MONTH_MAP[m[1].toLowerCase()];
    if (mo !== undefined) {
      const d = new Date(currentYear, mo, parseInt(m[2]));
      if (!isNaN(d)) dates.add(d.toISOString().split('T')[0]);
    }
  }

  return [...dates].sort();
}

function extractProvider(text) {
  const patterns = [
    /(?:Dr\.?\s+)([A-Z][a-zA-Z\-]+(?:\s+[A-Z][a-zA-Z\-]+)?)/g,
    /(?:Doctor\s+)([A-Z][a-zA-Z\-]+(?:\s+[A-Z][a-zA-Z\-]+)?)/g,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) return m[0].trim();
  }
  return null;
}

function classifyType(subject, bodyText) {
  const text = `${subject} ${bodyText}`.toLowerCase();
  // Check in priority order
  for (const [type, keywords] of Object.entries(EVENT_TYPE_MAP)) {
    if (keywords.some((kw) => text.includes(kw))) return type;
  }
  return 'unstructured_event';
}

function inferPerson(subject, bodyText) {
  const text = ` ${subject} ${bodyText} `.toLowerCase();
  for (const [person, patterns] of Object.entries(PERSON_MAP)) {
    if (patterns.some((p) => text.includes(p))) return person.toLowerCase();
  }
  return null;
}

function extractMedications(text) {
  const meds = [];
  // "Metformin 500mg" or "lisinopril 10 mg"
  const re = /\b([A-Z][a-zA-Z]{3,})\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|ml|iu|units?))\b/g;
  for (const m of text.matchAll(re)) {
    meds.push({ name: m[1], dosage: m[2].replace(/\s+/g, '') });
  }
  return meds;
}

export function extractEventsFromEmail(email) {
  const { id, subject = '', body_text = '', body_html = '' } = email;
  const bodyText = body_text || body_html.replace(/<[^>]*>/g, ' ');
  const fullText = `${subject} ${bodyText}`;

  if (!isHealthcareEmail(subject, bodyText)) {
    return { events: [], medications: [] };
  }

  const dates        = extractDates(fullText);
  const provider     = extractProvider(fullText);
  const type         = classifyType(subject, bodyText);
  const inferred_person_id = inferPerson(subject, bodyText);
  const medications  = type === 'medication' ? extractMedications(fullText) : [];

  const event = {
    type,
    title:              (subject || type).substring(0, 200),
    provider,
    date:               dates[0] || null,
    inferred_person_id,
    source_email_id:    id,
  };

  return { events: [event], medications };
}
