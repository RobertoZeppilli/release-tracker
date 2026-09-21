# Codice organizzato per moduli di dominio

`src/modules/<modulo>` (catalog, releases, detection, summaries, dashboard, plans) sostituisce la
divisione iniziale per tipo tecnico (`hooks/`, `services/`, `types/`, `validators/`, `stores/`),
che avrebbe sparso ogni concetto del glossario su più cartelle. Ogni modulo separa `domain/`
(TypeScript puro, testato unitariamente), `server/` (adattatori esterni, solo lato server) e `ui/`,
ed espone solo i propri indici: `index.ts` (domain e ui) e `server/index.ts` (con `server-only`,
importabile solo da codice server). ESLint vieta gli import più profondi, gli import relativi verso
altri moduli e gli import di codice server da componenti `"use client"` e da `domain`. I tipi
derivano sempre dagli schemi Zod, senza una cartella `types/` parallela.

Zustand non è installato: lo stato UI condivisibile (filtri, tab) vive nell'URL. Si introduce solo
quando emerge uno stato client globale che l'URL non può rappresentare.
