import type { MessageDictionary } from "../index";

// I riconoscimenti, in italiano. I nomi delle licenze (CC0 1.0, SIL Open Font License, ISC) non
// sono qui e non si traducono: una licenza è un riferimento, e tradurne il nome sarebbe tradurre
// un numero di protocollo.
export const attributions = {
  "attributions.lede":
    "Quasi tutto quello che vedi qui l'ha fatto qualcun altro. Questa pagina dice chi, e sotto quale licenza, in un posto solo invece che in una nota a piè di pagina su ognuna.",

  "attributions.marks.title": "i marchi delle tecnologie",
  "attributions.marks.body":
    "Il marchietto monocromatico accanto a una tecnologia viene da {simpleIcons}, rilasciato sotto CC0 1.0. I tracciati sono copiati dentro questo repository e serviti da questo sito, quindi nessuna pagina di quest'app chiama una CDN per averli.",
  "attributions.marks.trademarks":
    "I marchi restano marchi registrati dei loro proprietari. Qui sono usati per dire di quale tecnologia parla una riga, nella forma e mai nel colore, e non implicano nessuna approvazione di questo prodotto né nessun rapporto con lui. Una tecnologia il cui marchio non è in simple-icons semplicemente qui non ne ha.",

  "attributions.notes.title": "le note di rilascio",
  "attributions.notes.body":
    "Ogni pagina di una release è costruita sulle note che il progetto stesso ha pubblicato, e quelle note appartengono a quel progetto e sono usate secondo i suoi termini. Una riga è citata perché la si possa controllare, e ogni pagina linka le note alla fonte. Una sintesi è la nostra lettura, non le parole del progetto, e non parla mai per il progetto.",

  "attributions.type.title": "i caratteri e le icone",
  "attributions.type.body":
    "La voce monospaziata è Fragment Mono e la prosa è Hanken Grotesk, pubblicati tutti e due su Google Fonts sotto la SIL Open Font License, e serviti tutti e due da questo sito invece che da Google. Le icone dell'interfaccia sono {lucide}, sotto licenza ISC.",

  "attributions.runs.title": "su cosa gira",
  "attributions.runs.body":
    "Next.js e React per l'app, Supabase per il database e l'accesso, Vercel per l'hosting, Anthropic per il modello che scrive le sintesi, e sotto a ognuno una lunga lista di pacchetti open source. Quali di questi tocchino qualcosa di tuo sta nell'{privacy}.",
} as const satisfies Partial<MessageDictionary>;
