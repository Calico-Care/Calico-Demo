-- Enable UUID generation helpers
create extension if not exists "pgcrypto";

-- Patients
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  date_of_birth date not null,
  time_zone text,
  primary_condition text not null check (primary_condition in ('CHF', 'COPD')),
  created_at timestamptz not null default now()
);

-- Health metrics captured from devices or manual entry
create table if not exists public.health_metrics (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  recorded_at timestamptz not null,
  weight_lbs numeric,
  systolic integer,
  diastolic integer,
  spo2 integer,
  heart_rate integer,
  created_at timestamptz not null default now()
);

-- Custom call prompts per patient
create table if not exists public.vapi_prompts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  name text not null,
  prompt text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Call schedules (recurring + one-off)
create table if not exists public.vapi_call_schedules (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  prompt_id uuid not null references public.vapi_prompts(id) on delete cascade,
  type text not null check (type in ('one-time', 'recurring', 'now')),
  scheduled_time timestamptz,
  recurrence_type text check (recurrence_type in ('none', 'daily', 'weekly', 'monthly')),
  recurrence_end_date timestamptz,
  day_of_week smallint,
  day_of_month smallint,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Call execution + transcript data
create table if not exists public.vapi_calls (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  prompt_id uuid not null references public.vapi_prompts(id) on delete cascade,
  schedule_id uuid references public.vapi_call_schedules(id) on delete set null,
  phone_number text not null,
  provider_call_id text,
  status text not null check (status in ('pending', 'in-progress', 'completed', 'failed')),
  started_at timestamptz,
  completed_at timestamptz,
  duration integer,
  transcript text,
  transcript_entries jsonb,
  artifacts jsonb,
  analysis jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_health_metrics_patient_recorded
  on public.health_metrics (patient_id, recorded_at desc);

create index if not exists idx_vapi_prompts_patient
  on public.vapi_prompts (patient_id);

create index if not exists idx_vapi_call_schedules_patient
  on public.vapi_call_schedules (patient_id, created_at desc);

create index if not exists idx_vapi_calls_patient_created
  on public.vapi_calls (patient_id, created_at desc);

-- Basic RLS: allow any authenticated user to manage data (tighten later)
alter table public.patients enable row level security;
alter table public.health_metrics enable row level security;
alter table public.vapi_prompts enable row level security;
alter table public.vapi_call_schedules enable row level security;
alter table public.vapi_calls enable row level security;

create policy "patients_authenticated_full_access"
  on public.patients
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "health_metrics_authenticated_full_access"
  on public.health_metrics
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "vapi_prompts_authenticated_full_access"
  on public.vapi_prompts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "vapi_call_schedules_authenticated_full_access"
  on public.vapi_call_schedules
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "vapi_calls_authenticated_full_access"
  on public.vapi_calls
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
