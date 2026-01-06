-- Classification + Alias + Logos (Supabase RLS + Storage)
-- NOTE: Tables are defined in shared/schema.ts and created via `npm run db:push`.
-- Apply this file manually in Supabase to enable RLS policies and the logos bucket.

-- Enable RLS on new tables
alter table if exists taxonomy_level_1 enable row level security;
alter table if exists taxonomy_level_2 enable row level security;
alter table if exists taxonomy_leaf enable row level security;
alter table if exists app_category enable row level security;
alter table if exists app_category_leaf enable row level security;
alter table if exists rules enable row level security;
alter table if exists key_desc_map enable row level security;
alter table if exists alias_assets enable row level security;
alter table if exists transactions enable row level security;

-- Policies (Supabase auth.uid())
create policy if not exists "taxonomy_level_1_user" on taxonomy_level_1
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "taxonomy_level_2_user" on taxonomy_level_2
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "taxonomy_leaf_user" on taxonomy_leaf
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "app_category_user" on app_category
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "app_category_leaf_user" on app_category_leaf
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "rules_user" on rules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "key_desc_map_user" on key_desc_map
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "alias_assets_user" on alias_assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "transactions_user" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket for logos
insert into storage.buckets (id, name, public)
values ('logos', 'logos', false)
on conflict do nothing;

-- Storage policy: user can read/write within their folder
create policy if not exists "logos_read" on storage.objects
  for select using (bucket_id = 'logos' and auth.uid()::text = split_part(name, '/', 1));

create policy if not exists "logos_write" on storage.objects
  for insert with check (bucket_id = 'logos' and auth.uid()::text = split_part(name, '/', 1));

create policy if not exists "logos_update" on storage.objects
  for update using (bucket_id = 'logos' and auth.uid()::text = split_part(name, '/', 1));

create policy if not exists "logos_delete" on storage.objects
  for delete using (bucket_id = 'logos' and auth.uid()::text = split_part(name, '/', 1));
