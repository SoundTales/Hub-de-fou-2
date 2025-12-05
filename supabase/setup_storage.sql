-- 1. Créer un Bucket de stockage pour les fichiers du Tale (JSON, Audio, Images)
insert into storage.buckets (id, name, public)
values ('tale-content', 'tale-content', true);

-- 2. Politique de sécurité : Tout le monde peut LIRE (Public)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'tale-content' );

-- 3. Politique de sécurité : Seuls les authentifiés peuvent UPLOAD (Optionnel, pour vous)
create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'tale-content' );

-- 4. Ajouter la colonne content_url à la table chapters si elle n'existe pas
alter table chapters 
add column if not exists content_url text;

-- Exemple de mise à jour (à adapter avec vos vrais liens après upload)
-- update chapters 
-- set content_url = 'https://votre-projet.supabase.co/storage/v1/object/public/tale-content/chapitre1.json'
-- where id = '...';
