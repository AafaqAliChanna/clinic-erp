# clinic-erp# Clinic ERP

A patient registry and appointment queue system for small Pakistani clinics — built for a real pilot conversation with Karachi clinics.

## Stack
- Frontend: HTML + JavaScript (Supabase JS client) — no framework, chosen for shipping speed
- Backend/Database: Supabase (PostgreSQL), with Row Level Security enforcing clinic-level data isolation
- Auth: Supabase Auth (email/password)

## Status
- ✅ Patient registry — auto-generated patient IDs, search by name or ID
- ✅ Multi-clinic support — one codebase, isolated per clinic via RLS, zero hardcoded clinic data
- ✅ Today's Queue — appointment booking, doctor assignment, live status tracking
- 🔜 Visit history (diagnosis, prescription, follow-up) — next

## Architecture
One codebase, one database — every clinic isolated by `clinic_id` via Row Level Security, not a separate deployment per clinic. Same multi-tenant model as our school ERP product (Nizamix), applied to healthcare.