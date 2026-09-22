# release-tracker

Traccia le Release delle Tecnologie di un Catalogo curato e ne genera Sintesi con l'AI.
Prodotto e dominio: `PRODUCT.md`, `CONTEXT.md`; decisioni: `docs/DECISIONI.md`, `docs/adr/`.

## Sviluppo locale

Servono Node 24, pnpm e Docker Desktop (su Windows con backend WSL2) avviato.

```sh
pnpm install
pnpm db:start                  # Supabase locale; applica le migrazioni
cp .env.example .env.local     # completa con i valori di `pnpm exec supabase status`
pnpm dev
```

Controlli: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:integration` (con Supabase avviato),
`pnpm test:e2e`. Nuova migrazione: `pnpm exec supabase migration new <nome>`, poi `pnpm db:reset`.

## Deploy

L'app gira su **Vercel** (Hobby, regione `fra1`) e usa un progetto **Supabase** separato (Free,
Frankfurt). Anteprime delle PR e produzione condividono lo stesso database.

- **App**: ogni push su `main` va in produzione, ogni PR riceve un deploy di anteprima (integrazione Git
  di Vercel, nessun workflow nel repository).
- **Database**: il workflow `Deploy database` gira a ogni push su `main`: prima `supabase db push`, poi
  `pnpm catalog:sync`, che porta il Catalogo (`catalog/*.json`) sul database remoto. Si può rilanciare a
  mano da GitHub → Actions → Deploy database → "Run workflow". Le migrazioni devono restare compatibili
  con la versione dell'app già online, perché app e database si aggiornano in parallelo.
- **Catalogo**: un file `catalog/<slug>.json` per Tecnologia, validato da `pnpm test`. Togliere un file
  ritira la Tecnologia, non la cancella. Il sync non gira mai nella build di Vercel: le anteprime
  condividono il database di produzione. In locale: `pnpm catalog:sync` con le variabili di `.env.local`.

### Configurazione manuale (una volta)

1. **Supabase**: progetto in regione Frankfurt con Data API attiva, "Automatically expose new tables" e
   "Enable automatic RLS" disattivati (permessi e RLS li definiscono le migrazioni).
2. **Vercel**: progetto importato da GitHub, senza l'integrazione Supabase del Marketplace. Variabili
   d'ambiente per Production e Preview:

   | Variabile | Valore |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | URL di produzione, senza `/` finale |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys (`sb_publishable_…`) |
   | `SUPABASE_SECRET_KEY` | Stessa pagina (`sb_secret_…`), marcata **Sensitive**; solo lato server |

3. **GitHub** → Settings → Secrets and variables → Actions:

   | Segreto | Valore |
   |---|---|
   | `SUPABASE_ACCESS_TOKEN` | Supabase → Account → Access Tokens; permessi minimi, scadenza 1 anno |
   | `SUPABASE_DB_PASSWORD` | Password del database (reimpostabile da Project Settings → Database) |
   | `SUPABASE_PROJECT_ID` | Project ref, l'ID nell'URL della dashboard |
   | `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys (`sb_secret_…`), per il sync del Catalogo |

Nessun segreto sta nel repository: `.env.local` è ignorato da git e la CI usa valori segnaposto.
