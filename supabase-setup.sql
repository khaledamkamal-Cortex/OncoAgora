-- ============================================================================
-- OncoAgora — COMPLETE Supabase setup
-- Run this ONCE in the Supabase SQL editor of a NEW project dedicated to
-- OncoAgora (do not run it in the CAIRO Journal Club project).
-- Safe to re-run: uses IF NOT EXISTS / guards.
--
-- After running, follow the ADMIN BOOTSTRAP note at the very bottom.
-- ============================================================================

-- ---------- Members (profile; auth handled by Supabase Auth) ----------
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  phone text,
  grade text,
  specialty text,
  institution text,
  status text default 'active',
  joined date default now()
);

-- ---------- LMS: courses / modules / lessons ----------
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  level text,
  summary text,
  banner text,
  hours int,
  sort int default 0,
  created_at timestamptz default now()
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  sort int default 0
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  kind text check (kind in ('video','pdf','article','quiz')),
  url text,
  body text,
  pages int,
  duration text,
  questions jsonb,
  sort int default 0
);

-- ---------- LMS progress ----------
create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  unique (member_id, lesson_id)
);

-- Auto-create a members row whenever a new auth user signs up. Runs with
-- elevated rights so it works even before email confirmation. Profile fields
-- arrive as user metadata from the registration form.
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $fn$
begin
  insert into public.members (user_id, name, email, phone, grade, specialty, institution)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'grade',
    new.raw_user_meta_data->>'specialty',
    new.raw_user_meta_data->>'institution'
  )
  on conflict (email) do nothing;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Admins (who may manage content) ----------
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz default now()
);

-- is_admin(): true when the current auth user is in admins.
create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $fn$
  select exists (select 1 from admins where user_id = auth.uid());
$fn$;

-- ---------- Enable Row Level Security ----------
alter table members  enable row level security;
alter table courses  enable row level security;
alter table modules  enable row level security;
alter table lessons  enable row level security;
alter table progress enable row level security;
alter table admins   enable row level security;

-- ---------- Policies (idempotent: drop-if-exists then create) ----------

-- Public read of course content
drop policy if exists "read courses" on courses; create policy "read courses" on courses for select using (true);
drop policy if exists "read modules" on modules; create policy "read modules" on modules for select using (true);
drop policy if exists "read lessons" on lessons; create policy "read lessons" on lessons for select using (true);

-- Admin full write on course content
drop policy if exists "admin courses" on courses; create policy "admin courses" on courses for all using (is_admin()) with check (is_admin());
drop policy if exists "admin modules" on modules; create policy "admin modules" on modules for all using (is_admin()) with check (is_admin());
drop policy if exists "admin lessons" on lessons; create policy "admin lessons" on lessons for all using (is_admin()) with check (is_admin());

-- Members: each user manages own row; admins can read/delete for the members list
drop policy if exists "member select own"  on members; create policy "member select own"  on members for select using (auth.uid() = user_id or is_admin());
drop policy if exists "member insert own"  on members; create policy "member insert own"  on members for insert with check (auth.uid() = user_id);
drop policy if exists "member update own"  on members; create policy "member update own"  on members for update using (auth.uid() = user_id);
drop policy if exists "admin delete member" on members; create policy "admin delete member" on members for delete using (is_admin());

-- Progress: each member manages own
drop policy if exists "progress select own" on progress; create policy "progress select own" on progress for select using (member_id in (select id from members where user_id = auth.uid()));
drop policy if exists "progress insert own" on progress; create policy "progress insert own" on progress for insert with check (member_id in (select id from members where user_id = auth.uid()));
drop policy if exists "progress delete own" on progress; create policy "progress delete own" on progress for delete using (member_id in (select id from members where user_id = auth.uid()));

-- Admins table: a user may see their own admin row (needed by clients)
drop policy if exists "read own admin" on admins; create policy "read own admin" on admins for select using (auth.uid() = user_id);

-- ============================================================================
-- Seed: the two starter courses (only if no courses exist yet).
-- Video URLs are left blank on purpose — add the real recording links from the
-- admin panel (LMS Content). Articles and quizzes are ready to use immediately.
-- ============================================================================
do $seed$
declare c uuid; m uuid;
begin
  if exists (select 1 from courses) then return; end if;

  ----------------------------------------------------------------------------
  -- Course 1: Foundations of Critical Appraisal in Oncology
  ----------------------------------------------------------------------------
  insert into courses(title, level, summary, banner, hours, sort) values (
    'Foundations of Critical Appraisal in Oncology', 'Beginner',
    'Learn to read, appraise and apply oncology randomized controlled trials. Covers study design, bias, endpoints, statistics and applicability.',
    'linear-gradient(135deg,#2c3e8c,#0ea5a6)', 6, 1) returning id into c;

  insert into modules(course_id, title, sort) values (c, 'Module 1 — Study Design & Hierarchy of Evidence', 1) returning id into m;
  insert into lessons(module_id, title, kind, url, duration, sort) values (m, 'Why critical appraisal matters', 'video', '', '08:20', 1);
  insert into lessons(module_id, title, kind, body, sort) values (m, 'The hierarchy of evidence', 'article',
    $t$Not all evidence is equal. At the base sit case reports and expert opinion; above them cohort and case-control studies; then randomized controlled trials (RCTs); and at the apex, systematic reviews and meta-analyses of RCTs.

In oncology, the RCT remains the reference standard for demonstrating that a treatment causally improves outcomes. But hierarchy is a starting point, not a verdict — a poorly conducted RCT can be less reliable than a well-designed observational study. Always appraise the individual study, not just its label.$t$, 2);
  insert into lessons(module_id, title, kind, url, pages, sort) values (m, 'Randomization & allocation concealment', 'pdf', '', 4, 3);

  insert into modules(course_id, title, sort) values (c, 'Module 2 — Bias, Blinding & Confounding', 2) returning id into m;
  insert into lessons(module_id, title, kind, url, duration, sort) values (m, 'Sources of bias in clinical trials', 'video', '', '11:05', 1);
  insert into lessons(module_id, title, kind, body, sort) values (m, 'Intention-to-treat vs per-protocol', 'article',
    $t$Intention-to-treat (ITT) analysis keeps every randomized patient in their originally assigned group, regardless of what happened afterward. This preserves the benefit of randomization and gives a pragmatic, real-world estimate of effect.

Per-protocol analysis includes only patients who adhered to the protocol. It can exaggerate efficacy and break randomization. For superiority trials, ITT is conservative and preferred; for non-inferiority trials, both analyses should agree.$t$, 2);
  insert into lessons(module_id, title, kind, questions, sort) values (m, 'Knowledge check: Bias', 'quiz',
    $j$[{"q":"Which analysis preserves the benefit of randomization?","options":["Per-protocol","Intention-to-treat","As-treated","Subgroup analysis"],"answer":1},{"q":"Blinding primarily reduces which type of bias?","options":["Selection bias","Performance & detection bias","Attrition bias","Publication bias"],"answer":1}]$j$::jsonb, 3);

  insert into modules(course_id, title, sort) values (c, 'Module 3 — Endpoints & Statistics', 3) returning id into m;
  insert into lessons(module_id, title, kind, url, duration, sort) values (m, 'OS, PFS and surrogate endpoints', 'video', '', '13:40', 1);
  insert into lessons(module_id, title, kind, body, sort) values (m, 'Hazard ratios & confidence intervals', 'article',
    $t$A hazard ratio (HR) of 0.70 means a 30% relative reduction in the rate of the event at any given moment. But relative measures can mislead: always ask about the absolute difference and the baseline risk.

The 95% confidence interval (CI) tells you the precision. If the CI for an HR crosses 1.0, the result is not statistically significant. A wide CI signals an underpowered or small trial. Never read the point estimate without its interval.$t$, 2);
  insert into lessons(module_id, title, kind, questions, sort) values (m, 'Final assessment', 'quiz',
    $j$[{"q":"A hazard ratio of 0.65 (95% CI 0.52-0.81) indicates:","options":["A non-significant result","A significant 35% relative risk reduction","A 65% increase in risk","An underpowered study"],"answer":1},{"q":"Overall survival is generally considered:","options":["A surrogate endpoint","The most robust efficacy endpoint","Less reliable than PFS","Only relevant in phase I"],"answer":1},{"q":"A confidence interval crossing 1.0 for a hazard ratio means:","options":["Strong benefit","Not statistically significant","Definite harm","Perfect precision"],"answer":1}]$j$::jsonb, 3);

  ----------------------------------------------------------------------------
  -- Course 2: Biostatistics for the Practising Oncologist
  ----------------------------------------------------------------------------
  insert into courses(title, level, summary, banner, hours, sort) values (
    'Biostatistics for the Practising Oncologist', 'Intermediate',
    'Demystifying the statistics behind oncology trials — p-values, power, survival analysis and how to spot statistical spin.',
    'linear-gradient(135deg,#0ea5a6,#7cb518)', 4, 2) returning id into c;

  insert into modules(course_id, title, sort) values (c, 'Module 1 — Foundations', 1) returning id into m;
  insert into lessons(module_id, title, kind, url, duration, sort) values (m, 'p-values and what they really mean', 'video', '', '09:15', 1);
  insert into lessons(module_id, title, kind, body, sort) values (m, 'Type I & Type II error, power', 'article',
    $t$A Type I error (alpha) is a false positive — concluding a treatment works when it does not. A Type II error (beta) is a false negative — missing a real effect. Statistical power (1 - beta) is the probability of detecting a true effect, conventionally set at 80-90%.

Underpowered trials are common in oncology and frequently produce "negative" results that are really inconclusive. When a trial reports no significant difference, always ask: was it powered to find one?$t$, 2);

  insert into modules(course_id, title, sort) values (c, 'Module 2 — Survival Analysis', 2) returning id into m;
  insert into lessons(module_id, title, kind, url, duration, sort) values (m, 'Reading Kaplan-Meier curves', 'video', '', '10:30', 1);
  insert into lessons(module_id, title, kind, questions, sort) values (m, 'Quiz: Survival analysis', 'quiz',
    $j$[{"q":"The number at risk on a KM curve helps you judge:","options":["Statistical spin","Reliability of the tail of the curve","The p-value","The hazard ratio directly"],"answer":1}]$j$::jsonb, 2);
end
$seed$;

-- ============================================================================
-- ADMIN BOOTSTRAP (do this AFTER the site is deployed with Supabase keys):
--   1. Go to the live site → Join / Login → Register your own account.
--   2. Come back here and run, with YOUR email:
--
--        insert into admins (user_id)
--        select id from auth.users where email = 'you@example.com'
--        on conflict do nothing;
--
--   3. Now the Admin panel (logged in with that same account) can manage
--      all content. Anyone else is read-only.
-- ============================================================================
