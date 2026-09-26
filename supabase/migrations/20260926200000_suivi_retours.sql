-- Le suivi des retours dans le tableau de bord : un commentaire sur ce que nous en avons fait, et un statut de plus pour
-- une idée acceptée qui reste à faire. Les statuts vont de « nouveau » à « corrigé » ou « écarté ».
alter table public.retours add column commentaire text check (char_length(commentaire) <= 2000);

alter table public.retours drop constraint retours_statut_check;
alter table public.retours
  add constraint retours_statut_check check (statut in ('nouveau', 'vu', 'accepte', 'corrige', 'ecarte'));
