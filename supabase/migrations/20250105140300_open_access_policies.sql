-- Relax RLS policies so the anon (client) role can read/write during the demo.

drop policy if exists "patients_authenticated_full_access" on public.patients;
drop policy if exists "health_metrics_authenticated_full_access" on public.health_metrics;
drop policy if exists "vapi_prompts_authenticated_full_access" on public.vapi_prompts;
drop policy if exists "vapi_call_schedules_authenticated_full_access" on public.vapi_call_schedules;
drop policy if exists "vapi_calls_authenticated_full_access" on public.vapi_calls;

create policy "patients_public_access"
  on public.patients
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "health_metrics_public_access"
  on public.health_metrics
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "vapi_prompts_public_access"
  on public.vapi_prompts
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "vapi_call_schedules_public_access"
  on public.vapi_call_schedules
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "vapi_calls_public_access"
  on public.vapi_calls
  for all
  to anon, authenticated
  using (true)
  with check (true);
