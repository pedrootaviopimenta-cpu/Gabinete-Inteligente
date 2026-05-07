create extension if not exists pgcrypto;

create type public.document_module as enum (
  'gi_oficios',
  'gi_ministerio_publico',
  'gi_pareceres',
  'gi_normas_municipais',
  'gi_checklists'
);

create type public.document_status as enum (
  'draft',
  'under_review',
  'approved',
  'archived'
);

create type public.document_request_status as enum (
  'recebido',
  'em_analise',
  'aguardando_documentos',
  'em_producao',
  'em_revisao',
  'concluido',
  'cancelado'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state char(2),
  cnpj text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  module public.document_module not null,
  title text not null,
  status public.document_status not null default 'draft',
  content_markdown text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  human_review_required boolean not null default true,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_requests (
  id uuid primary key default gen_random_uuid(),
  module_slug text not null,
  title text not null,
  requester_name text not null,
  requester_email text not null,
  requester_phone text,
  requester_department text not null,
  priority text not null default 'normal' check (priority in ('baixa', 'normal', 'alta', 'urgente')),
  status public.document_request_status not null default 'recebido',
  structured_fields jsonb not null default '{}'::jsonb,
  structured_context text not null default '',
  internal_notes text,
  final_document_text text,
  final_document_url text,
  protocol_number text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.document_requests(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  storage_path text not null,
  uploaded_by text,
  visibility text not null default 'internal',
  created_at timestamptz not null default now()
);

create table public.ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  module public.document_module not null,
  prompt_key text not null,
  model text,
  input_summary text,
  output_hash text,
  parameters jsonb not null default '{}'::jsonb,
  human_review_notice text not null,
  created_at timestamptz not null default now()
);

create table public.municipal_norms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  norm_type text not null,
  number text not null,
  year integer,
  title text,
  summary text,
  subject text,
  source_url text,
  published_at date,
  effective_from date,
  revoked_at date,
  content_markdown text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  module public.document_module not null default 'gi_checklists',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.checklist_templates(id) on delete cascade,
  position integer not null default 0,
  title text not null,
  guidance text,
  required boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.checklist_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid references public.checklist_templates(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  title text not null,
  responsible_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.checklist_run_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.checklist_runs(id) on delete cascade,
  item_id uuid references public.checklist_items(id) on delete set null,
  title text not null,
  completed boolean not null default false,
  evidence text,
  completed_at timestamptz
);

create index documents_organization_module_idx on public.documents (organization_id, module);
create index document_requests_status_created_idx on public.document_requests (status, created_at desc);
create index document_requests_module_created_idx on public.document_requests (module_slug, created_at desc);
create index document_requests_priority_created_idx on public.document_requests (priority, created_at desc);
create index document_request_attachments_request_idx on public.document_request_attachments (request_id, created_at desc);
create index ai_generation_logs_organization_created_idx on public.ai_generation_logs (organization_id, created_at desc);
create index municipal_norms_organization_subject_idx on public.municipal_norms (organization_id, subject);
create index checklist_runs_organization_created_idx on public.checklist_runs (organization_id, created_at desc);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_requests enable row level security;
alter table public.document_request_attachments enable row level security;
alter table public.ai_generation_logs enable row level security;
alter table public.municipal_norms enable row level security;
alter table public.checklist_templates enable row level security;
alter table public.checklist_items enable row level security;
alter table public.checklist_runs enable row level security;
alter table public.checklist_run_items enable row level security;

create or replace function public.current_profile_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.profiles
  where user_id = auth.uid()
  limit 1
$$;

create policy "Users can read their organization"
on public.organizations
for select
using (id = public.current_profile_organization_id());

create policy "Users can read profiles in their organization"
on public.profiles
for select
using (organization_id = public.current_profile_organization_id());

create policy "Users can read documents in their organization"
on public.documents
for select
using (organization_id = public.current_profile_organization_id());

create policy "Users can insert documents in their organization"
on public.documents
for insert
with check (organization_id = public.current_profile_organization_id());

create policy "Users can update documents in their organization"
on public.documents
for update
using (organization_id = public.current_profile_organization_id())
with check (organization_id = public.current_profile_organization_id());

create policy "Users can read ai logs in their organization"
on public.ai_generation_logs
for select
using (organization_id = public.current_profile_organization_id());

create policy "Users can insert ai logs in their organization"
on public.ai_generation_logs
for insert
with check (organization_id = public.current_profile_organization_id());

create policy "Users can manage municipal norms in their organization"
on public.municipal_norms
for all
using (organization_id = public.current_profile_organization_id())
with check (organization_id = public.current_profile_organization_id());

create policy "Users can manage checklist templates in their organization"
on public.checklist_templates
for all
using (organization_id = public.current_profile_organization_id())
with check (organization_id = public.current_profile_organization_id());

create policy "Users can read checklist items by organization"
on public.checklist_items
for select
using (
  exists (
    select 1
    from public.checklist_templates ct
    where ct.id = checklist_items.template_id
      and ct.organization_id = public.current_profile_organization_id()
  )
);

create policy "Users can insert checklist items by organization"
on public.checklist_items
for insert
with check (
  exists (
    select 1
    from public.checklist_templates ct
    where ct.id = checklist_items.template_id
      and ct.organization_id = public.current_profile_organization_id()
  )
);

create policy "Users can update checklist items by organization"
on public.checklist_items
for update
using (
  exists (
    select 1
    from public.checklist_templates ct
    where ct.id = checklist_items.template_id
      and ct.organization_id = public.current_profile_organization_id()
  )
)
with check (
  exists (
    select 1
    from public.checklist_templates ct
    where ct.id = checklist_items.template_id
      and ct.organization_id = public.current_profile_organization_id()
  )
);

create policy "Users can delete checklist items by organization"
on public.checklist_items
for delete
using (
  exists (
    select 1
    from public.checklist_templates ct
    where ct.id = checklist_items.template_id
      and ct.organization_id = public.current_profile_organization_id()
  )
);

create policy "Users can manage checklist runs in their organization"
on public.checklist_runs
for all
using (organization_id = public.current_profile_organization_id())
with check (organization_id = public.current_profile_organization_id());

create policy "Users can read checklist run items by organization"
on public.checklist_run_items
for select
using (
  exists (
    select 1
    from public.checklist_runs cr
    where cr.id = checklist_run_items.run_id
      and cr.organization_id = public.current_profile_organization_id()
  )
);

create policy "Users can insert checklist run items by organization"
on public.checklist_run_items
for insert
with check (
  exists (
    select 1
    from public.checklist_runs cr
    where cr.id = checklist_run_items.run_id
      and cr.organization_id = public.current_profile_organization_id()
  )
);

create policy "Users can update checklist run items by organization"
on public.checklist_run_items
for update
using (
  exists (
    select 1
    from public.checklist_runs cr
    where cr.id = checklist_run_items.run_id
      and cr.organization_id = public.current_profile_organization_id()
  )
)
with check (
  exists (
    select 1
    from public.checklist_runs cr
    where cr.id = checklist_run_items.run_id
      and cr.organization_id = public.current_profile_organization_id()
  )
);

create policy "Users can delete checklist run items by organization"
on public.checklist_run_items
for delete
using (
  exists (
    select 1
    from public.checklist_runs cr
    where cr.id = checklist_run_items.run_id
      and cr.organization_id = public.current_profile_organization_id()
  )
);
