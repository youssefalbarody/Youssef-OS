create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  slug text unique,
  description text,
  color text,
  icon text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_created_at_idx on public.projects (created_at desc);

create function public.set_projects_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_projects_updated_at();
