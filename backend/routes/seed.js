// Seed realistic demo data — no Gmail required.
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

const SEED_EMAILS = [
  {
    id: 'seed-email-1',
    subject: 'Appointment Reminder: Cardiology Follow-up – Dr. Elena Martinez',
    from_address: 'noreply@heartclinic.com',
    date: '2026-05-14T09:00:00Z',
    snippet: 'Reminder for your cardiology follow-up on May 15, 2026 at 2:30 PM with Dr. Martinez.',
    body_text: `Dear Patient,

This is a reminder for your upcoming cardiology follow-up appointment.

Doctor: Dr. Elena Martinez, MD
Date: May 15, 2026
Time: 2:30 PM
Location: Heart & Vascular Center, Suite 400
Phone: (555) 234-5678

Please arrive 15 minutes early to complete any necessary paperwork.
Bring your current medication list and insurance card.

If you need to reschedule, call us at (555) 234-5678.`,
  },
  {
    id: 'seed-email-2',
    subject: 'Lab Results Available – Quest Diagnostics',
    from_address: 'results@questdiagnostics.com',
    date: '2026-04-22T14:30:00Z',
    snippet: 'Your lab results from April 20 are now available in your patient portal.',
    body_text: `Hello,

Your lab results from your April 20, 2026 blood work are now available.

Test: Comprehensive Metabolic Panel + CBC
Ordered by: Dr. Sarah Kim
Collection Date: April 20, 2026

Please log into your patient portal to view your results.
Your provider will contact you if any values require immediate attention.`,
  },
  {
    id: 'seed-email-3',
    subject: 'Prescription Ready for Pickup – CVS Pharmacy',
    from_address: 'notifications@cvs.com',
    date: '2026-05-01T11:00:00Z',
    snippet: 'Your prescription for Metformin 500mg is ready for pickup at CVS on Main St.',
    body_text: `Your prescription is ready!

Medication: Metformin 500mg
Quantity: 90 tablets
Refills remaining: 2
Pharmacy: CVS – 1200 Main Street

Pick up by May 8, 2026 to avoid restocking.
Questions? Call your pharmacy at (555) 890-1234.`,
  },
  {
    id: 'seed-email-4',
    subject: "Reminder: Mom's Oncology Appointment – Dr. James Patel",
    from_address: 'reminders@cancercenter.org',
    date: '2026-05-10T08:00:00Z',
    snippet: "Reminder for mom's oncology follow-up on May 12, 2026.",
    body_text: `Dear Family Member,

This is a reminder for your mother's oncology follow-up appointment.

Patient: Margaret (Mom)
Doctor: Dr. James Patel, MD
Date: May 12, 2026
Time: 10:00 AM
Location: Oncology Associates, Building C, Room 205

Please bring a list of all current medications.
Parking is available in Lot B.`,
  },
  {
    id: 'seed-email-5',
    subject: "Dad's Prescription Refill – Lisinopril 10mg",
    from_address: 'refills@walgreens.com',
    date: '2026-04-15T10:00:00Z',
    snippet: "Refill ready for dad's Lisinopril 10mg at Walgreens.",
    body_text: `Prescription Refill Ready

Patient: Robert (Dad)
Medication: Lisinopril 10mg
Quantity: 30 tablets
Prescribing Doctor: Dr. Howard Chen
Pharmacy: Walgreens – 450 Oak Avenue

Auto-refill is enabled. Next refill: May 15, 2026.`,
  },
  {
    id: 'seed-email-6',
    subject: 'Annual Wellness Checkup Scheduled – Dr. Sarah Kim',
    from_address: 'scheduling@primarycare.com',
    date: '2026-05-05T09:00:00Z',
    snippet: 'Your annual wellness checkup is scheduled for June 3, 2026.',
    body_text: `Hello,

Your annual wellness checkup has been scheduled.

Doctor: Dr. Sarah Kim, MD
Date: June 3, 2026
Time: 9:00 AM
Type: Annual Physical / Wellness Visit
Location: Primary Care Associates, Suite 120

Please fast for 8 hours before your appointment if blood work is ordered.
Bring your insurance card and photo ID.

To reschedule: (555) 567-8901`,
  },
  {
    id: 'seed-email-7',
    subject: "Physical Therapy Reminder – Mom's Session",
    from_address: 'scheduler@physicaltherapy.com',
    date: '2026-05-18T07:00:00Z',
    snippet: "Reminder for mom's physical therapy session on May 22, 2026.",
    body_text: `Physical Therapy Appointment Reminder

Patient: Margaret (Mom)
Therapist: Amanda Torres, PT
Date: May 22, 2026
Time: 3:00 PM
Session: Hip Mobility – Session 4 of 8
Location: Active Physical Therapy, Room 3

Please wear comfortable clothing.
Arrive 5 minutes early.`,
  },
  {
    id: 'seed-email-8',
    subject: 'MRI Scan Scheduled – Radiology Department',
    from_address: 'radiology@hospitalcenter.org',
    date: '2026-05-20T16:00:00Z',
    snippet: 'Your MRI scan is scheduled for May 28, 2026 at 1:00 PM.',
    body_text: `Dear Patient,

Your MRI scan has been scheduled.

Imaging Type: MRI – Lumbar Spine
Date: May 28, 2026
Time: 1:00 PM
Location: Radiology Department, Level B2
Ordered by: Dr. Howard Chen

Important instructions:
- Remove all metal objects before entering the MRI suite
- Inform staff if you have any implanted medical devices
- The scan takes approximately 45 minutes

Questions: (555) 678-9012`,
  },
];

const SEED_EVENTS = [
  { id: 'seed-ev-1', person_id: 'self', type: 'appointment', title: 'Appointment Reminder: Cardiology Follow-up – Dr. Elena Martinez', provider: 'Dr. Elena Martinez', date: '2026-05-15', source_email_id: 'seed-email-1' },
  { id: 'seed-ev-2', person_id: 'self', type: 'lab',         title: 'Lab Results Available – Quest Diagnostics', provider: 'Dr. Sarah Kim', date: '2026-04-20', source_email_id: 'seed-email-2' },
  { id: 'seed-ev-3', person_id: 'self', type: 'medication',  title: 'Prescription Ready for Pickup – CVS Pharmacy', provider: null, date: '2026-05-01', source_email_id: 'seed-email-3' },
  { id: 'seed-ev-4', person_id: 'mom',  type: 'appointment', title: "Reminder: Mom's Oncology Appointment – Dr. James Patel", provider: 'Dr. James Patel', date: '2026-05-12', source_email_id: 'seed-email-4' },
  { id: 'seed-ev-5', person_id: 'dad',  type: 'medication',  title: "Dad's Prescription Refill – Lisinopril 10mg", provider: 'Dr. Howard Chen', date: '2026-04-15', source_email_id: 'seed-email-5' },
  { id: 'seed-ev-6', person_id: 'self', type: 'visit',       title: 'Annual Wellness Checkup Scheduled – Dr. Sarah Kim', provider: 'Dr. Sarah Kim', date: '2026-06-03', source_email_id: 'seed-email-6' },
  { id: 'seed-ev-7', person_id: 'mom',  type: 'visit',       title: "Physical Therapy Reminder – Mom's Session", provider: 'Amanda Torres', date: '2026-05-22', source_email_id: 'seed-email-7' },
  { id: 'seed-ev-8', person_id: 'self', type: 'lab',         title: 'MRI Scan Scheduled – Radiology Department', provider: 'Dr. Howard Chen', date: '2026-05-28', source_email_id: 'seed-email-8' },
];

const SEED_MEDS = [
  { id: 'seed-med-1', person_id: 'self', name: 'Metformin', dosage: '500mg', source_email_id: 'seed-email-3' },
  { id: 'seed-med-2', person_id: 'dad',  name: 'Lisinopril', dosage: '10mg', source_email_id: 'seed-email-5' },
  { id: 'seed-med-3', person_id: 'self', name: 'Vitamin D', dosage: '2000IU', source_email_id: null },
];

router.post('/', (_req, res) => {
  const db = getDb();

  db.exec('BEGIN');
  try {
    db.prepare(`DELETE FROM medications WHERE id LIKE 'seed-%'`).run();
    db.prepare(`DELETE FROM events     WHERE id LIKE 'seed-%'`).run();
    db.prepare(`DELETE FROM emails     WHERE id LIKE 'seed-%'`).run();

    const insEmail = db.prepare(`
      INSERT OR IGNORE INTO emails (id, gmail_id, subject, from_address, date, snippet, body_text)
      VALUES (?, NULL, ?, ?, ?, ?, ?)
    `);
    const insEvent = db.prepare(`
      INSERT OR IGNORE INTO events (id, person_id, type, title, provider, date, source_email_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insMed = db.prepare(`
      INSERT OR IGNORE INTO medications (id, person_id, name, dosage, source_email_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const e of SEED_EMAILS) {
      insEmail.run(e.id, e.subject, e.from_address, e.date, e.snippet, e.body_text);
    }
    for (const e of SEED_EVENTS) {
      insEvent.run(e.id, e.person_id, e.type, e.title, e.provider, e.date, e.source_email_id);
    }
    for (const m of SEED_MEDS) {
      insMed.run(m.id, m.person_id, m.name, m.dosage, m.source_email_id);
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  res.json({ success: true, emails: SEED_EMAILS.length, events: SEED_EVENTS.length, medications: SEED_MEDS.length });
});

export default router;
