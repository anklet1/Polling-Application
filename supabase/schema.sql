-- Supabase schema for Polling App
-- Creates tables: polls, votes
-- Adds constraints, indexes, a validation trigger, and RLS policies

-- Extensions
create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.polls (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	question text not null check (char_length(question) between 5 and 300),
	options text[] not null,
	created_at timestamptz not null default now(),
	constraint options_min_len check (array_length(options, 1) is not null and array_length(options, 1) >= 2),
	constraint options_max_len check (array_length(options, 1) <= 20)
);

create table if not exists public.votes (
	id uuid primary key default gen_random_uuid(),
	poll_id uuid not null references public.polls(id) on delete cascade,
	user_id uuid not null references auth.users(id) on delete cascade,
	option_index integer not null check (option_index >= 0),
	created_at timestamptz not null default now(),
	constraint one_vote_per_user unique (poll_id, user_id)
);

-- Indexes
drop index if exists idx_polls_owner;
create index if not exists idx_polls_user on public.polls(user_id);
create index if not exists idx_votes_poll on public.votes(poll_id);
drop index if exists idx_votes_voter;
create index if not exists idx_votes_user on public.votes(user_id);

-- Validation function to ensure option_index is within bounds of poll.options
create or replace function public.validate_vote_option_index()
returns trigger
language plpgsql
as $$
declare
	opt_count integer;
begin
	select coalesce(array_length(p.options, 1), 0) into opt_count
	from public.polls p
	where p.id = new.poll_id;

	if opt_count is null or opt_count <= 0 then
		raise exception 'Poll % has no options', new.poll_id using errcode = '23514';
	end if;

	if new.option_index < 0 or new.option_index >= opt_count then
		raise exception 'option_index % out of bounds (0..%) for poll %', new.option_index, opt_count - 1, new.poll_id using errcode = '23514';
	end if;

	return new;
end;
$$;

drop trigger if exists trg_validate_vote_option_index on public.votes;
create trigger trg_validate_vote_option_index
before insert or update on public.votes
for each row execute function public.validate_vote_option_index();

-- RLS
alter table public.polls enable row level security;
alter table public.votes enable row level security;

-- Anyone can read polls
drop policy if exists polls_select_all on public.polls;
create policy polls_select_all on public.polls
	for select
	using (true);

-- Only owners can insert polls
drop policy if exists polls_insert_owner on public.polls;
create policy polls_insert_owner on public.polls
	for insert
	with check (auth.uid() = user_id);

-- Only owners can update their polls
drop policy if exists polls_update_owner on public.polls;
create policy polls_update_owner on public.polls
	for update
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

-- Only owners can delete their polls
drop policy if exists polls_delete_owner on public.polls;
create policy polls_delete_owner on public.polls
	for delete
	using (auth.uid() = user_id);

-- Policies for votes
-- Anyone can read votes (for public results). Adjust if needed.
drop policy if exists votes_select_all on public.votes;
create policy votes_select_all on public.votes
	for select
	using (true);

-- 1) They are logged in
-- 2) They have not already voted on the poll (enforced also by unique constraint)
-- 3) The referenced poll exists (implicit via FK), and option_index validity is enforced by trigger
drop policy if exists votes_insert_authenticated on public.votes;
create policy votes_insert_authenticated on public.votes
	for insert
	with check (
		auth.uid() is not null
		and auth.uid() = user_id
	);

-- Allow voters to update their vote within constraints (optional). Comment out to disallow.
drop policy if exists votes_update_self on public.votes;
create policy votes_update_self on public.votes
	for update
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

-- Allow voters to delete their own vote (optional)
drop policy if exists votes_delete_self on public.votes;
create policy votes_delete_self on public.votes
	for delete
	using (auth.uid() = user_id);

-- Helpful view: poll results with counts (optional)
-- Compatibility: if an old column name exists, fix it before creating the view
do $$
begin
	if exists (
		select 1 from information_schema.columns
		where table_schema = 'public'
		and table_name = 'votes'
		and column_name = 'option'
	) and not exists (
		select 1 from information_schema.columns
		where table_schema = 'public'
		and table_name = 'votes'
		and column_name = 'option_index'
	) then
		alter table public.votes rename column "option" to option_index;
	end if;
end $$;

create or replace view public.poll_results as
select
	p.id as poll_id,
	p.question,
	p.options,
	jsonb_agg(
		jsonb_build_object(
			'option', opt.elem,
			'index', opt.ord - 1,
			'votes', coalesce(vt.cnt, 0)
		)
		order by opt.ord - 1
	) as results
from public.polls p
join lateral (
	select elem, ord
	from jsonb_array_elements_text(to_jsonb(p.options)) with ordinality as j(elem, ord)
) opt on true
left join lateral (
	select count(*)::int as cnt
	from public.votes v
	where v.poll_id = p.id
	and coalesce(
		NULLIF(to_jsonb(v)->>'option_index', '')::int,
		NULLIF(to_jsonb(v)->>'option', '')::int
	) = opt.ord - 1
) vt on true
group by p.id, p.question, p.options;


