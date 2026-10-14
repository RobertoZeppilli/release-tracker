# Il peso delle pagine, il "prima" e il "dopo" della #142

Criterio della #142 ("il peso delle pagine misurato prima e dopo, perché un'app più moderna non deve
diventare più lenta") e misura di partenza che mancava anche alla **#130**. Preso il **2026-10-14**,
**prima di una riga di codice nuovo**: dopo, il "prima" non esisteva più.

## Come è stata presa

- **Build di produzione**, non il dev server: `pnpm build` e `pnpm start` sulla 3000 (il dev server
  dell'utente fermato e riacceso dopo). Il dev server serve chunk non compressi e il suo client HMR:
  i suoi numeri rispondono a una domanda che nessuno ha fatto.
- **Visita fredda, un contesto nuovo per pagina**: i chunk condivisi sono gratis dalla seconda pagina
  e cari alla prima, e la prima è quella che decide se l'app sembra lenta.
- **Viewport 1440x900**, Chromium headless. Byte **compressi** (`responseBodySize` +
  `responseHeadersSize` di Playwright), cioè quello che passa sul filo.
- Lo script è nel progetto, `scripts/page-weight.mts`, e si rilancia con **`pnpm page:weight`**
  (`--json <file>` per il dettaglio per tipo di risorsa). ⚠️ Vuole `next start` già in piedi.
- Commit `28bc49e`, Next.js 16.3.5, Supabase locale, `dev@local.test` autenticato dalla rotta
  `/auth/dev-sign-in`.

## Stato del catalogo locale, così com'era

1905 Release, **nessuna Sintesi `ready`**: la pagina Release cadeva nel suo stato più leggero, solo
titolo e Source View chiusa.

| Route | Req | Totale KB | Script KB | Document KB | Nodi DOM | Body px |
| --- | --: | --: | --: | --: | --: | --: |
| `/` | 22 | 408.1 | 322.4 | 15.6 | 272 | 3169 |
| `/login` | 21 | 397.9 | 323.5 | 5.6 | 78 | 493 |
| `/dashboard` | 25 | 458.1 | 368.6 | 15.6 | 338 | 937 |
| `/technologies` | 23 | 465.5 | 366.0 | 27.3 | 598 | 3237 |
| `/technologies/next` | 25 | 456.9 | 366.0 | 14.8 | 455 | 1147 |
| `/technologies/next/16.3.0` | 20 | 494.7 | 323.5 | 100.5 | 3303 | 541 |

## Il settimo stato, con una Sintesi finta sul Release vero

Senza una Sintesi `ready` lo stato che il redesign tocca più di tutti non si misurava. Messa a mano
sul Release reale `next 16.3.0` (verdetto *action required*, cinque key point, due breaking change,
ognuna con citazione **verbatim** dalle note, così si accendono anche le citazioni), ricostruita la
build e misurato di nuovo. ⚠️ **Il database locale è stato poi rimesso come era** (`pending`,
`content` nullo): la Sintesi finta non è rimasta.

| Route | Req | Totale KB | Script KB | Document KB | Nodi DOM | Body px |
| --- | --: | --: | --: | --: | --: | --: |
| `/` | 21 | 407.6 | 322.4 | 15.6 | 272 | 3169 |
| `/login` | 21 | 397.9 | 323.5 | 5.6 | 78 | 493 |
| `/dashboard` | 26 | 458.8 | 368.6 | 15.6 | 338 | 937 |
| `/technologies` | 23 | 465.5 | 366.0 | 27.3 | 598 | 3237 |
| `/technologies/next` | 27 | 460.5 | 366.0 | 16.9 | 479 | 1339 |
| `/technologies/next/16.3.0` | 21 | 499.3 | 323.5 | 104.0 | 3412 | 1454 |

Sul disco, dopo la build: `.next/static` **1.6 MB**, di cui 1.5 MB di chunk; il più grosso 676 KB,
poi 224, 160, 116, 112 KB. I font sono **49.3 KB su ogni pagina** e il CSS **8.9 KB**, identici
dappertutto: sono un costo dell'app, non di una schermata.

## Cosa dicono questi numeri

1. **Il peso è quasi tutto JavaScript condiviso**: 322-369 KB su ogni pagina, da 397 a 499 KB di
   totale. La differenza tra la pagina più leggera e la più pesante è **100 KB**, e sono l'HTML delle
   note di `next 16.3.0` (108 KB di testo nel database). Un redesign che cambia markup e CSS si
   vedrà in `Document KB` e nei nodi, **non** nel totale, a meno che non porti JavaScript nuovo.
2. ⚠️ **La regola da rispettare dopo**: `Script KB` non deve salire. È il numero che un componente
   client in più fa crescere senza che nessuno se ne accorga.
3. ⚠️ **3303 nodi DOM sulla pagina Release**, con 541px di pagina: sono le note intere renderizzate
   dentro la Source View chiusa. Nel settimo stato diventano 3412. È il posto dove un redesign può
   peggiorare molto e in silenzio.
4. ⚠️ `/technologies` è **3237px** di pagina e 598 nodi: il Catalogo è lungo, e la #149 lo ha appena
   messo nello spacco a destra. Lo spacco non è ancora misurato qui.

## Come si prende il "dopo"

Stessa procedura, nello stesso ordine, o i numeri non si confrontano:

1. Fermare il dev server, `pnpm build`, `pnpm start` sulla 3000.
2. `pnpm page:weight` per lo stato del catalogo così com'è.
3. Per il settimo stato: eseguire lo `update` qui sotto sul database locale, **ricostruire la build**
   (le pagine di Technology e Release sono SSG, prerenderizzate: senza una build nuova il database
   nuovo non si vede, ed è una trappola che costa mezz'ora), misurare, poi il `restore`.
4. Riaccendere `pnpm dev` sulla 3000.

```sql
-- Sintesi finta sul Release reale `next 16.3.0`, per il settimo stato.
update summaries set
  status = 'ready', model = 'claude-opus-5', prompt_version = 'v7',
  content = $j$
{
  "title": "Next.js 16.3.0 fixes a lodash CVE, renames the HMR endpoint and breaks two deployment paths.",
  "actionRequired": true,
  "notesJudgeable": true,
  "keyPoints": [
    { "text": "The vendored lodash goes to 4.17.23, closing CVE-2025-13465.", "quote": "Update vendored lodash to 4.17.23 to fix CVE-2025-13465: #91558" },
    { "text": "Turbopack now does server HMR for app route handlers.", "quote": "Turbopack: enable server HMR for app route handlers: #91466" },
    { "text": "Encoded dynamic placeholders are normalized in app routes.", "quote": "Normalize encoded dynamic placeholders in app routes: #91603" },
    { "text": "next start no longer pays the Lightning CSS binding check.", "quote": "Skip loadBindings() Lightning CSS check during next start: #91538" },
    { "text": "Webpack loaders can call importModule() under Turbopack.", "quote": "Turbopack: Add importModule() support to webpack loaders: #89630" }
  ],
  "breakingChanges": [
    {
      "change": "Route-level RSC requests no longer answer with the invalid HTML the deployment adapter used to return.",
      "migration": "Update the deployment adapter and re-check any proxy that parsed that HTML as a page.",
      "quote": "Fix invalid HTML response for route-level RSC requests in deployment adapter: #91541"
    },
    {
      "change": "The bundled tokio runtime moves from 1.43.0 to 1.47.3, so native addons built against the old one must be rebuilt.",
      "migration": "Rebuild native addons against tokio 1.47.3 before deploying.",
      "quote": "Update tokio from 1.43.0 to 1.47.3: #90945"
    }
  ]
}
$j$::jsonb
where release_id = (
  select r.id from releases r join technologies t on t.id = r.technology_id
  where t.slug = 'next' and r.version = '16.3.0'
);

-- restore
update summaries set status = 'pending', model = null, prompt_version = null, content = null
where release_id = (
  select r.id from releases r join technologies t on t.id = r.technology_id
  where t.slug = 'next' and r.version = '16.3.0'
);
```

Si esegue con
`docker exec -i supabase_db_release-tracker psql -U postgres -v ON_ERROR_STOP=1 < file.sql`
(`docker` non è nel PATH della shell di Claude: vedi `AMBIENTE.md`).

## Il "dopo", preso il 2026-10-14 su `a8b9a52`

Stessa procedura e stessa macchina, build di produzione, 1440x900, contesto nuovo per pagina.
⚠️ **Il "prima" è stato ripreso ricostruendo `28bc49e`** invece di fidarsi delle tabelle qui sopra:
le Script KB sono tornate identiche a quelle registrate (322.4, 323.5, 368.6, 366.0, 366.0, 323.5),
quindi la procedura è ripetibile e le differenze che seguono sono il codice, non il rumore.

Catalogo così com'è, **nessuna Sintesi `ready`**:

| Route | Req | Totale KB | Script KB | Document KB | Nodi DOM | Body px |
| --- | --: | --: | --: | --: | --: | --: |
| `/` | 22 | 409.8 | 323.7 | 15.6 | 272 | 3169 |
| `/login` | 21 | 399.6 | 324.8 | 5.5 | 78 | 493 |
| `/dashboard` | 25 | 459.9 | 369.7 | 15.5 | 338 | 937 |
| `/technologies` | 24 | 468.1 | 367.2 | 27.3 | 598 | 3237 |
| `/technologies/next` | 27 | 460.2 | 367.2 | 15.1 | 459 | 738 |
| `/technologies/next/16.3.0` | 20 | 496.7 | 324.8 | 100.2 | 3303 | 533 |

Settimo stato, la Sintesi finta sul Release vero `next 16.3.0` (poi **ritirata**, database rimesso
come era):

| Route | Req | Totale KB | Script KB | Document KB | Nodi DOM | Body px |
| --- | --: | --: | --: | --: | --: | --: |
| `/` | 22 | 409.8 | 323.7 | 15.6 | 272 | 3169 |
| `/login` | 21 | 399.6 | 324.8 | 5.5 | 78 | 493 |
| `/dashboard` | 25 | 459.6 | 369.7 | 15.6 | 338 | 937 |
| `/technologies` | 24 | 468.1 | 367.2 | 27.3 | 598 | 3237 |
| `/technologies/next` | 27 | 462.3 | 367.2 | 17.2 | 485 | 902 |
| `/technologies/next/16.3.0` | 19 | 499.2 | 324.8 | 103.9 | 3416 | 1427 |

Sul disco, dopo la build: `.next/static` **1607 KB** come prima, e i cinque chunk più grossi quasi
identici (676, 224, 160, 112 KB uguali al byte o quasi). Il JavaScript dell'app non è cresciuto in
blocco: è cresciuto in un punto solo, vedi sotto.

### Le due pagine del redesign

1. **La pagina Release non è peggiorata**, ed è la pagina da cui si temeva il peggio: nel settimo
   stato il totale scende da 499.3 a **499.2 KB**, `Document` da 104.0 a **103.9**, i nodi salgono di
   quattro, da 3412 a **3416**, e la pagina si accorcia da 1454 a **1427px**, che è esattamente il
   numero che `DESIGN.md` dichiara per il mock a 1240. Il Counts Panel, l'ordine invertito e il
   bordo unico sono passati **a costo zero**.
2. **La pagina Technology si accorcia di 437px** nel settimo stato (1339 → 902) e di 409px nello
   stato leggero (1147 → 738), con sei nodi in più e 0.3 KB di `Document`: è lo spacco, che mette il
   cammino accanto al nome invece che sotto.

### ⚠️ `Script KB` è salito di 1.2 KB su **ogni** rotta, e si sa esattamente perché

La regola del "prima" era che `Script KB` non salisse. È salito di 1.1-1.3 KB su tutte e sei le
rotte, `/login` compresa, che il redesign non ha toccato. Misurato richiesta per richiesta, il
delta è **+1345 byte sul filo, identico su `/` e su `/login`**, e viene da **un chunk solo**:
40.743 → 43.921 byte non compressi, +1403 compressi, meno 58 byte che altri due chunk restituiscono.

Dentro quel chunk, il diff degli export dice cosa è entrato e cosa è uscito: **`BarLegend` e
`ColumnTitle` dentro, `StatRows` fuori**. Sono la Stat Row diventata titolo di gruppo: il
`MajorBar` con la sua legenda sta sotto `UpgradePathView`, che è `"use client"`, quindi finisce nel
bundle del client.

⚠️ **La scoperta vera non è l'1.2 KB, è dove sta quel chunk**: `/login` ne scarica **14 KB
compressi**, e dentro ci sono `BreakingList`, `UpgradeForm`, `ReleaseVerdict`, `computeUpgradePath`
e le icone. La UI delle Release viaggia su ogni pagina dell'app, anche su una che mostra un form di
login. 1.2 KB su 324 è lo 0.4% e non è il problema; **i 14 KB che non servono a quella pagina lo
sono**, e sono lì da prima di questo redesign. Separarli è un lavoro suo, di chunking e di import
dai barrel, non una riga di questa misura.
