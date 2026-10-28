import { execFileSync } from "node:child_process";

// L'Ignored Build Step di Vercel (`ignoreCommand` in `vercel.json`): decide se il commit appena
// spinto merita un deploy. **Uscita 0 = deploy annullato, uscita 1 = deploy fatto**, al contrario
// di come si leggono i codici di uscita di solito.
//
// Perché esiste: ogni deploy di produzione azzera la cache ISR, e riscaldarla di nuovo costa
// scritture (le misure stanno in `docs/handoff/PESO.md`). Un commit che tocca solo il diario o un
// documento produce un sito identico, byte per byte, e pagarlo due volte non ha senso.
//
// ⚠️ Node e non `tsx`: questo gira **prima** dell'installazione delle dipendenze, quindi non può
// importare niente che non sia di Node.
// ⚠️ Il confronto è `HEAD^..HEAD`, cioè **un commit solo**. Su `main` è esatto, perché le PR
// entrano con uno squash merge e un commit è una PR. Se un giorno si spingessero due commit insieme,
// uno di codice e uno di documenti, il filtro guarderebbe solo l'ultimo: in quel caso il deploy
// parte comunque al prossimo commit, e qui si preferisce quel rischio al suo contrario.
// ⚠️ Nel dubbio si deploya. Un clone superficiale senza il commit padre, un primo deploy, un push
// forzato: tutti i casi in cui `git` non sa rispondere finiscono con un deploy, non con un silenzio.

// Quello che non entra nel sito costruito. Tutto il resto, incluso un file di configurazione o un
// test, vale un deploy: `src/` non è l'unica cosa che cambia il risultato di `pnpm build`.
const IGNORED = [/^docs\//, /^design\//, /\.md$/, /^LICENSE$/];

const BUILD = 1;
const SKIP = 0;

function changedFiles() {
  const out = execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], { encoding: "utf8" });
  return out.split("\n").filter((line) => line.length > 0);
}

let files;
try {
  files = changedFiles();
} catch (cause) {
  console.log(`deploy: non riesco a leggere il commit precedente (${cause.message.trim()})`);
  process.exit(BUILD);
}

if (files.length === 0) {
  console.log("deploy: nessun file cambiato, nel dubbio si costruisce");
  process.exit(BUILD);
}

const relevant = files.filter((file) => !IGNORED.some((pattern) => pattern.test(file)));
if (relevant.length === 0) {
  console.log(`deploy annullato: ${files.length} file e nessuno costruisce il sito`);
  console.log(files.map((file) => `  ${file}`).join("\n"));
  process.exit(SKIP);
}

console.log(`deploy: ${relevant.length} file su ${files.length} cambiano il sito`);
console.log(relevant.slice(0, 10).map((file) => `  ${file}`).join("\n"));
process.exit(BUILD);
