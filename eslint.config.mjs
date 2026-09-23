import next from 'eslint-config-next'

export default [
  ...next,
  // La détection automatique de la version de React ne fonctionne pas encore avec ESLint 10.
  { settings: { react: { version: '19.3' } } },
  // La fonction serveur de la communauté tourne sous Deno, avec ses propres imports.
  { ignores: ['.next/**', 'data/**', 'public/**', 'next-env.d.ts', 'supabase/functions/**'] },
]
