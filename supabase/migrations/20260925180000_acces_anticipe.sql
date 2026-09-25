-- L'accès anticipé, ouvert à tous : avant sa première partie, chaque joueur laisse son adresse électronique, et il
-- signale depuis le jeu les bugs qu'il trouve et les améliorations qu'il souhaite.
--
-- Comme le reste de la base, ces tables ne se lisent ni ne s'écrivent depuis le site : la fonction « communaute »
-- y écrit, et on les consulte depuis le tableau de bord de Supabase.

-- Une adresse par personne, même si elle joue sur plusieurs navigateurs.
create table public.inscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 5 and 254),
  -- Ce que la personne dit d'elle-même, si elle le dit.
  profil text check (profil in ('usager', 'etudiant', 'professionnel', 'elu', 'journaliste', 'autre')),
  -- Le réseau affiché quand elle est entrée dans le jeu.
  ville text references public.villes (slug),
  cree_le timestamptz not null default now()
);
create index inscriptions_cree_le on public.inscriptions (cree_le);

-- Chaque navigateur retient l'inscription faite depuis lui : ses signalements portent l'adresse de leur auteur.
alter table public.cles add column inscription uuid references public.inscriptions (id) on delete set null;
create index cles_inscription on public.cles (inscription);

-- Un bug ou une amélioration signalés depuis le jeu, avec de quoi les reproduire.
create table public.retours (
  id bigint generated always as identity primary key,
  type text not null check (type in ('bug', 'amelioration')),
  texte text not null check (char_length(texte) between 10 and 2000),
  -- Où en était le joueur : l'écran, le panneau ouvert, le réseau, le mandat, la taille de la fenêtre.
  contexte jsonb,
  -- Sa partie en cours, au format des liens de partage.
  partie jsonb,
  navigateur text check (char_length(navigateur) <= 300),
  empreinte text not null,
  inscription uuid references public.inscriptions (id) on delete set null,
  -- Où en est son traitement, à changer depuis le tableau de bord.
  statut text not null default 'nouveau' check (statut in ('nouveau', 'vu', 'corrige', 'ecarte')),
  cree_le timestamptz not null default now()
);
create index retours_recents on public.retours (cree_le desc);
create index retours_empreinte on public.retours (empreinte, cree_le);
create index retours_inscription on public.retours (inscription);

-- Ni lecture ni écriture depuis le site : ces tables contiennent des adresses.
alter table public.inscriptions enable row level security;
alter table public.retours enable row level security;
revoke all on table public.inscriptions, public.retours from anon, authenticated;
