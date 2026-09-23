-- La communauté du simulateur : profils, réseaux publiés, soutiens, reprises et signalements.
--
-- Principes :
--   * Pas de compte : chaque navigateur tire une clé secrète au hasard et la garde. La base n'en
--     conserve qu'une empreinte, dans une table que personne ne peut lire depuis le site.
--   * Le site ne fait que lire. Toutes les écritures passent par la fonction « communaute », qui
--     recalcule le score, le coût et l'équilibre du budget de chaque réseau avant de l'enregistrer.
--   * Tout texte libre est court, et un réseau signalé trois fois est masqué en attendant une vérification.

create table public.villes (
  slug text primary key,
  nom text not null,
  ouverte boolean not null default false
);

-- Profils publics : un pseudo, rien d'autre.
create table public.profils (
  id uuid primary key default gen_random_uuid(),
  pseudo text not null check (char_length(pseudo) between 2 and 30),
  cree_le timestamptz not null default now()
);

-- Empreinte de la clé de chaque navigateur, et le profil qui lui est rattaché une fois créé.
create table public.cles (
  empreinte text primary key,
  profil uuid unique references public.profils (id) on delete cascade,
  cree_le timestamptz not null default now()
);

-- Un réseau publié : la partie au format des liens de partage, et ses chiffres recalculés.
create table public.reseaux (
  id uuid primary key default gen_random_uuid(),
  auteur uuid not null references public.profils (id) on delete cascade,
  ville text not null default 'lyon' references public.villes (slug),
  titre text not null check (char_length(titre) between 3 and 60),
  intention text check (char_length(intention) <= 200),
  visibilite text not null default 'publique' check (visibilite in ('publique', 'lien')),
  partie jsonb not null,
  voyageurs integer not null,
  investi integer not null,
  retenus integer not null,
  lignes integer not null default 0,
  modes text[] not null default '{}',
  inspire_de uuid references public.reseaux (id) on delete set null,
  soutiens integer not null default 0,
  reprises integer not null default 0,
  signalements integer not null default 0,
  masque boolean not null default false,
  cree_le timestamptz not null default now()
);
create index reseaux_populaires on public.reseaux (ville, soutiens desc, cree_le desc) where not masque and visibilite = 'publique';
create index reseaux_recents on public.reseaux (ville, cree_le desc) where not masque and visibilite = 'publique';
create index reseaux_auteur on public.reseaux (auteur);
create index reseaux_inspire_de on public.reseaux (inspire_de);

-- Un soutien par profil et par réseau.
create table public.soutiens (
  reseau uuid not null references public.reseaux (id) on delete cascade,
  profil uuid not null references public.profils (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (reseau, profil)
);
create index soutiens_profil on public.soutiens (profil);

-- Une reprise par navigateur et par réseau : quelqu'un est parti de ce réseau pour sa propre partie.
create table public.reprises (
  reseau uuid not null references public.reseaux (id) on delete cascade,
  empreinte text not null,
  cree_le timestamptz not null default now(),
  primary key (reseau, empreinte)
);

create table public.signalements (
  reseau uuid not null references public.reseaux (id) on delete cascade,
  empreinte text not null,
  motif text not null check (motif in ('propos', 'triche', 'autre')),
  cree_le timestamptz not null default now(),
  primary key (reseau, empreinte)
);

-- Les compteurs sont tenus par la base : le site ne peut pas les gonfler.
create function public.compter_soutiens() returns trigger language plpgsql security definer set search_path = '' as $$
declare cible uuid := coalesce(new.reseau, old.reseau);
begin
  update public.reseaux set soutiens = (select count(*) from public.soutiens s where s.reseau = cible) where id = cible;
  return null;
end $$;
create trigger soutiens_compte after insert or delete on public.soutiens for each row execute function public.compter_soutiens();

create function public.compter_reprises() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.reseaux set reprises = reprises + 1 where id = new.reseau;
  return null;
end $$;
create trigger reprises_compte after insert on public.reprises for each row execute function public.compter_reprises();

-- Au troisième signalement, le réseau est masqué en attendant une vérification.
create function public.compter_signalements() returns trigger language plpgsql security definer set search_path = '' as $$
declare total integer;
begin
  select count(*) into total from public.signalements s where s.reseau = new.reseau;
  update public.reseaux set signalements = total, masque = masque or total >= 3 where id = new.reseau;
  return null;
end $$;
create trigger signalements_compte after insert on public.signalements for each row execute function public.compter_signalements();

-- Ces fonctions ne servent qu'aux déclencheurs.
revoke execute on function public.compter_soutiens() from public, anon, authenticated;
revoke execute on function public.compter_reprises() from public, anon, authenticated;
revoke execute on function public.compter_signalements() from public, anon, authenticated;

-- Règles d'accès : le site lit ce qui est public, et n'écrit rien lui-même.
alter table public.villes enable row level security;
alter table public.profils enable row level security;
alter table public.cles enable row level security;
alter table public.reseaux enable row level security;
alter table public.soutiens enable row level security;
alter table public.reprises enable row level security;
alter table public.signalements enable row level security;

create policy "villes lisibles" on public.villes for select to anon, authenticated using (true);
create policy "profils lisibles" on public.profils for select to anon, authenticated using (true);
-- Un réseau « par lien » reste lisible par qui connaît son identifiant, mais n'apparaît dans aucune liste.
create policy "reseaux lisibles" on public.reseaux for select to anon, authenticated using (not masque);

-- Aucune écriture directe depuis le site, même si une règle venait à manquer.
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;

insert into public.villes (slug, nom, ouverte) values ('lyon', 'Lyon', true), ('toulouse', 'Toulouse', false);
