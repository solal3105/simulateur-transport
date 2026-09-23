-- Le jeu libre : un réseau construit sans budget à tenir peut être publié, mais il est marqué comme tel et
-- listé à part des réseaux qui tiennent le budget. La fonction « communaute » remplit la colonne à partir de
-- la partie publiée, jamais de ce qu'envoie le navigateur.
alter table public.reseaux add column libre boolean not null default false;

drop index if exists public.reseaux_populaires;
drop index if exists public.reseaux_recents;
create index reseaux_populaires on public.reseaux (ville, libre, soutiens desc, cree_le desc) where not masque and visibilite = 'publique';
create index reseaux_recents on public.reseaux (ville, libre, cree_le desc) where not masque and visibilite = 'publique';
