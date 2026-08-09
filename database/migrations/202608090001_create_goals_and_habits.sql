create table public.goals (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  description text,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  target_date date,
  progress smallint not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_status_idx on public.goals (status);
create index goals_target_date_idx on public.goals (target_date);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  is_active boolean not null default true,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index habits_is_active_idx on public.habits (is_active);
