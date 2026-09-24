-- Aix-Marseille-Provence, Lignes d'Azur et Île-de-France Mobilités ouvrent en tracé libre : leurs réseaux
-- peuvent être publiés. Les données de leur modèle sont déposées dans public.modele par l'action « deposer »
-- de la fonction « communaute ».
insert into public.villes (slug, nom, ouverte)
values ('marseille', 'Aix-Marseille-Provence', true), ('nice', 'Lignes d’Azur', true), ('idf', 'Île-de-France Mobilités', true)
on conflict (slug) do update set nom = excluded.nom, ouverte = excluded.ouverte;
