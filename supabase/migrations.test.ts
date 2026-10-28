import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Il presidio che mancava (#188). Il progetto remoto non espone una tabella nuova al service role
// come fanno i privilegi di default in locale, quindi un grant scritto a mano è l'unica cosa che la
// apre in produzione. Le cinque tabelle delle Notifiche sono nate senza, e nessuna prova poteva
// accorgersene: in locale il service role ha già tutto, quindi le prove di integrazione scrivevano
// verdi su tabelle che in produzione rispondevano `42501 permission denied`.
//
// Per questo la prova è **statica e sul testo delle migrazioni**, e non una query: il database
// locale non è il testimone giusto, perché risponde sempre di sì.

const DIR = fileURLToPath(new URL("./migrations", import.meta.url));

// I commenti nominano le tabelle per spiegarle, e un commento non dà permessi a nessuno.
function withoutComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, "");
}

function statements(): string[] {
  return readdirSync(DIR)
    .filter((name) => name.endsWith(".sql"))
    .flatMap((name) => withoutComments(readFileSync(`${DIR}/${name}`, "utf8")).split(";"));
}

// Il nome subito dopo `create table public.`, e non ogni `public.` dell'istruzione: una colonna
// nomina il suo tipo allo stesso modo (`preferred_locale public.locale`), e un tipo non è una tabella.
function created(): Set<string> {
  const found = new Set<string>();
  for (const statement of statements()) {
    for (const match of statement.matchAll(/create\s+table\s+public\.([a-z_]+)/gi)) found.add(match[1]);
  }
  return found;
}

// Qui invece ogni nome vale, perché un `grant` ne elenca quanti vuole in una istruzione sola.
function granted(): Set<string> {
  const found = new Set<string>();
  for (const statement of statements()) {
    if (!/grant[\s\S]*to\s+service_role/i.test(statement)) continue;
    for (const match of statement.matchAll(/public\.([a-z_]+)/g)) found.add(match[1]);
  }
  return found;
}

describe("le migrazioni", () => {
  it("danno al service role ogni tabella che creano", () => {
    const open = granted();
    const missing = [...created()].filter((table) => !open.has(table)).sort();
    expect(missing).toEqual([]);
  });
});
