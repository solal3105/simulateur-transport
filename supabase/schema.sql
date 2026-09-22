-- Schéma de la communauté du simulateur, pour Supabase (PostgreSQL).
-- À appliquer dans l'éditeur SQL du projet, ou avec : supabase db push
--
-- Principes :
--   * Chaque joueur a un profil lié à un compte Supabase Auth. La connexion anonyme suffit pour
--     publier ; un lien magique par e-mail permet ensuite de retrouver ses réseaux ailleurs.
--   * Le score et le coût d'un réseau ne viennent jamais du navigateur : la fonction
--     publier_reseau les recalcule côté serveur à partir des choix (voir supabase/functions).
--   * Tout texte libre est court, et un réseau signalé plusieurs fois est masqué en attendant
--     une vérification.

create extension if not exists "pgcrypto";

-- Les villes jouables.
create table public.villes (
  slug text primary key,                       -- 'lyon', 'paris', 'marseille'…
  nom text not null,
  autorite text not null,                      -- l'autorité organisatrice des mobilités
  mode text not null check (mode in ('catalogue', 'trace_libre')),
  ouverte boolean not null default false,
  demandes integer not null default 0          -- pour « Votre ville n'est pas là ? »
);

-- Profils publics : pseudo et quartier, jamais l'adresse e-mail.
create table public.profils (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudo text not null check (char_length(pseudo) between 2 and 30),
  lieu text check (char_length(lieu) <= 60),
  cree_le timestamptz not null default now()
);

-- Un réseau publié : le résultat complet d'une partie.
create table public.reseaux (
  id uuid primary key default gen_random_uuid(),
  auteur uuid not null references public.profils (id) on delete cascade,
  ville text not null references public.villes (slug),
  titre text not null check (char_length(titre) between 3 and 60),
  intention text check (char_length(intention) <= 200),
  visibilite text not null default 'publique' check (visibilite in ('publique', 'lien')),
  -- La partie telle que le jeu l'enregistre : chantiers, lignes tracées, leviers.
  partie jsonb not null,
  -- Calculés par le serveur à la publication.
  voyageurs integer not null,
  cout integer not null,
  budget_tenu boolean not null,
  modes text[] not null default '{}',          -- pour filtrer : 'metro', 'tram'…
  inspire_de uuid references public.reseaux (id) on delete set null,
  defi uuid,
  soutiens integer not null default 0,
  reprises integer not null default 0,
  masque boolean not null default false,       -- masqué après signalements, en attente de vérification
  cree_le timestamptz not null default now()
);
create index reseaux_ville_soutiens on public.reseaux (ville, soutiens desc) where not masque and visibilite = 'publique';
create index reseaux_ville_recents on public.reseaux (ville, cree_le desc) where not masque and visibilite = 'publique';

-- Une ligne tracée, proposée séparément sur la carte des envies.
create table public.lignes (
  id uuid primary key default gen_random_uuid(),
  reseau uuid references public.reseaux (id) on delete cascade,
  auteur uuid not null references public.profils (id) on delete cascade,
  ville text not null references public.villes (slug),
  nom text not null check (char_length(nom) <= 60),
  mode text not null check (mode in ('tram', 'bus', 'metro', 'cable')),
  arrets jsonb not null,                       -- [[lon, lat], …]
  km numeric not null,
  cout integer not null,
  voyageurs integer not null,
  cree_le timestamptz not null default now()
);

-- Un soutien par personne et par réseau.
create table public.soutiens (
  reseau uuid references public.reseaux (id) on delete cascade,
  profil uuid references public.profils (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (reseau, profil)
);

-- Réactions prédéfinies sur une ligne : pas de texte libre, donc rien à modérer.
create table public.reactions (
  ligne uuid references public.lignes (id) on delete cascade,
  profil uuid references public.profils (id) on delete cascade,
  type text not null check (type in ('je_la_prendrais', 'trop_chere', 'deja_desservi')),
  primary key (ligne, profil)
);

create table public.signalements (
  id uuid primary key default gen_random_uuid(),
  reseau uuid references public.reseaux (id) on delete cascade,
  profil uuid references public.profils (id) on delete cascade,
  motif text not null check (motif in ('propos', 'triche', 'autre')),
  cree_le timestamptz not null default now(),
  unique (reseau, profil)
);

create table public.defis (
  id uuid primary key default gen_random_uuid(),
  ville text not null references public.villes (slug),
  titre text not null,
  regle text not null,
  -- Contraintes lues par le jeu : { "sans_mode": ["metro"], "communes": ["Bron", …] }
  contraintes jsonb not null default '{}',
  debut date not null,
  fin date not null
);
alter table public.reseaux add constraint reseaux_defi_fk foreign key (defi) references public.defis (id) on delete set null;

-- Compteurs tenus à jour par la base, pour que le navigateur ne puisse pas les gonfler.
create or replace function public.compter_soutiens() returns trigger language plpgsql security definer as $$
begin
  update public.reseaux set soutiens = (select count(*) from public.soutiens where reseau = coalesce(new.reseau, old.reseau))
  where id = coalesce(new.reseau, old.reseau);
  return null;
end $$;
create trigger soutiens_compte after insert or delete on public.soutiens for each row execute function public.compter_soutiens();

create or replace function public.compter_reprises() returns trigger language plpgsql security definer as $$
begin
  if new.inspire_de is not null then
    update public.reseaux set reprises = reprises + 1 where id = new.inspire_de;
  end if;
  return null;
end $$;
create trigger reprises_compte after insert on public.reseaux for each row execute function public.compter_reprises();

-- Au troisième signalement, le réseau est masqué en attendant une vérification.
create or replace function public.masquer_si_signale() returns trigger language plpgsql security definer as $$
begin
  update public.reseaux set masque = true
  where id = new.reseau and (select count(*) from public.signalements where reseau = new.reseau) >= 3;
  return null;
end $$;
create trigger signalements_masque after insert on public.signalements for each row execute function public.masquer_si_signale();

-- Carte des envies : part des réseaux publiés d'une ville qui contiennent chaque projet.
create or replace view public.envies as
select r.ville, c.value ->> 'id' as projet, count(*)::float / nullif(t.total, 0) as part
from public.reseaux r
cross join lateral jsonb_array_elements(r.partie -> 'chantiers') c
join (select ville, count(*) as total from public.reseaux where not masque and visibilite = 'publique' group by ville) t on t.ville = r.ville
where not r.masque and r.visibilite = 'publique'
group by r.ville, c.value ->> 'id', t.total;

-- Règles d'accès : tout le monde lit ce qui est public, chacun n'écrit que ce qui est à lui.
alter table public.villes enable row level security;
alter table public.profils enable row level security;
alter table public.reseaux enable row level security;
alter table public.lignes enable row level security;
alter table public.soutiens enable row level security;
alter table public.reactions enable row level security;
alter table public.signalements enable row level security;
alter table public.defis enable row level security;

create policy "villes lisibles" on public.villes for select using (true);
create policy "defis lisibles" on public.defis for select using (true);

create policy "profils lisibles" on public.profils for select using (true);
create policy "son profil" on public.profils for insert with check (auth.uid() = id);
create policy "modifier son profil" on public.profils for update using (auth.uid() = id);

-- Les réseaux « par lien » restent lisibles par qui connaît leur identifiant, mais ne sont pas listés.
create policy "reseaux lisibles" on public.reseaux for select using (not masque or auteur = auth.uid());
-- La publication passe par la fonction publier_reseau, qui recalcule le score : pas d'insertion directe.
create policy "retirer son reseau" on public.reseaux for delete using (auteur = auth.uid());
create policy "modifier son titre" on public.reseaux for update using (auteur = auth.uid());

create policy "lignes lisibles" on public.lignes for select using (true);

create policy "soutiens lisibles" on public.soutiens for select using (true);
create policy "soutenir" on public.soutiens for insert with check (profil = auth.uid());
create policy "retirer son soutien" on public.soutiens for delete using (profil = auth.uid());

create policy "reactions lisibles" on public.reactions for select using (true);
create policy "reagir" on public.reactions for insert with check (profil = auth.uid());
create policy "changer de reaction" on public.reactions for update using (profil = auth.uid());

create policy "signaler" on public.signalements for insert with check (profil = auth.uid());

insert into public.villes (slug, nom, autorite, mode, ouverte) values
  ('lyon', 'Lyon', 'Sytral Mobilités', 'catalogue', true),
  ('paris', 'Paris', 'Île-de-France Mobilités', 'trace_libre', false),
  ('marseille', 'Marseille', 'Métropole Aix-Marseille-Provence', 'trace_libre', false),
  ('toulouse', 'Toulouse', 'Tisséo Collectivités', 'trace_libre', false),
  ('nice', 'Nice', 'Métropole Nice Côte d''Azur', 'trace_libre', false);
