# Clinic ERP — Project Doc

## What this is
A patient/appointment management system for a single Karachi clinic pilot, built the same way Nizamix was: real backend, real auth, real data isolation — not a mockup. Separate product, separate repo, separate business from Nizamix. Multi-tenant from day one (same lesson as Nizamix: don't build single-clinic and retrofit later).

## Who it's for
A general Karachi clinic — one doctor or a small group, walk-in + appointment patients, no existing digital system (paper register or nothing). This is the same shape of customer as Baaz Grammar School: small, local, no IT staff, needs something simple that works on a browser, no app install.

## Stack (100% free, same reasoning as Nizamix)
- **Frontend**: plain HTML + JavaScript, Supabase JS client — no framework. Same reasoning as before: fastest path to something real, no build tooling to fight.
- **Backend/Database**: Supabase (Postgres), separate project from Nizamix's — different clinic, different data, should never share a database with school data even though both are "your" products.
- **Auth**: Supabase Auth, same email/password pattern as Nizamix staff logins.
- **Hosting**: GitHub Pages, same as Nizamix — free, works for a static HTML file talking to Supabase.

## Core entities (draft — confirm with the clinic before building past Step 1)
- `clinics` — the multi-tenant root, same role as Nizamix's `schools` table
- `staff` — doctors, receptionists; `id` = `auth.users(id)`, same pattern as Nizamix
- `patients` — name, phone, age/DOB, gender, address, registered date
- `appointments` — patient_id, doctor (staff_id), date, time, status (scheduled/completed/cancelled/no-show)
- `visits` — a completed appointment becomes a visit record: diagnosis notes, prescribed medicine, follow-up date

## What a real Karachi clinic actually needs first (based on the customer type, to confirm on-site)
Likely priority order, cheapest to build and highest value first:
1. **Patient registry** — add/search patients (mirrors Nizamix's Student Records — the foundational entity everything else depends on)
2. **Appointment booking/queue** — today's patient list, walk-in vs scheduled, mark seen/waiting
3. **Visit history per patient** — what a doctor actually needs open during a consultation: past visits, diagnoses, prescriptions
4. *(Later, not now)* Billing, prescriptions as printable slips, SMS reminders — same discipline as Nizamix: these wait until the first three are shipped and used

## Build order — same discipline as Nizamix, no shortcuts
- **Step 1**: `clinics` + `patients` tables, RLS from the start (we know the mechanism now — no repeat of the Step 2 recursion bug), one page: add patient, list patients
- **Step 2**: real login + multi-tenant isolation, tested with two clinics before calling it done
- **Step 3**: appointments/queue for today
- **Step 4**: visit history per patient

## What "done" looks like for the clinic demo
Not a polished 10-feature product — a real, working Step 1 (patient registry) that the clinic can see live, understand in two minutes, and imagine using tomorrow. Same lesson as Baaz: a working narrow slice beats an impressive plan.

## Explicit non-goals for the first demo
No billing, no SMS, no prescriptions-as-PDF, no multi-doctor scheduling conflicts logic — these are real features for later, not blockers for a first conversation with the clinic.


 const supabaseClient = window.supabase.createClient(
    'https://rbgcyrlaoygugizuxste.supabase.co',
    'sb_publishable_R7qmvPIOIkWN0lu-oUDc8g_OBcVo59X',