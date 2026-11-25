-- Tasklight – Supabase Schema
-- Run this in the Supabase SQL editor to set up or reset your database.

-- ─── 1. Drop existing tables safely (CASCADE handles foreign key dependencies) ─
drop table if exists public.tasks cascade;
drop table if exists public.projects cascade;

-- ─── 2. Projects ─────────────────────────────────────────────────────────────
create table public.projects (
  id          text primary key,
  name        text not null,
  color       text not null check (color in ('violet','blue','amber','rose','emerald')),
  created_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Allow all operations for anonymous / authenticated users
create policy "Allow all on projects"
  on public.projects for all
  using (true)
  with check (true);

-- ─── 3. Tasks ────────────────────────────────────────────────────────────────
create table public.tasks (
  id              text primary key,
  title           text not null,
  notes           text,
  completed       boolean not null default false,
  completed_at    text,
  due_bucket      text not null check (due_bucket in ('overdue','today','tomorrow','later')),
  due_label       text not null,
  due_time        text,
  duration        text,
  priority        text not null check (priority in ('urgent','high','medium','low')),
  project_id      text references public.projects(id) on delete set null,
  tags            text[] not null default '{}',
  subtasks        jsonb not null default '[]',
  assignee_group  text,
  created_at      bigint not null
);

alter table public.tasks enable row level security;

create policy "Allow all on tasks"
  on public.tasks for all
  using (true)
  with check (true);
