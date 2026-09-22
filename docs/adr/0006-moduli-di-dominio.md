# Codice organizzato per moduli di dominio

`src/modules/<modulo>` (catalog, releases, detection, summaries, dashboard, plans) sostituisce la
divisione iniziale per tipo tecnico (`hooks/`, `services/`, `types/`, `validators/`, `stores/`),
che avrebbe sparso ogni concetto del glossario su più cartelle. Ogni modulo separa `domain/`
(TypeScript puro, testato unitariamente), `server/` (adattatori esterni, solo lato server) e `ui/`,
ed espone solo i propri indici: `index.ts` (solo domain), `ui/index.ts` (componenti React) e
`server/index.ts` (con `server-only`, importabile solo da codice server). ESLint vieta gli import più
profondi, gli import relativi verso altri moduli, gli import di codice server da componenti
`"use client"` e da `domain`, e gli import di `ui` da `domain`. I tipi
derivano sempre dagli schemi Zod, senza una cartella `types/` parallela.

L'indice `ui` è separato perché il codice server e gli script Node (es. `pnpm catalog:sync`, eseguito
con la condizione `react-server`) importano il dominio di altri moduli: se l'indice includesse i
componenti, caricherebbero React e le sue librerie fuori da Next.js, dove non funzionano.

Zustand non è installato: lo stato UI condivisibile (filtri, tab) vive nell'URL. Si introduce solo
quando emerge uno stato client globale che l'URL non può rappresentare.
