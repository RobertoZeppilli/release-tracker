import type { MessageDictionary } from "../index";

// The titles and the descriptions, in German. `Dashboard` and `Account` are names and stay as they
// are (GLOSSARY.md); `Technologies` is the other kind and becomes `Technologien`.
export const page = {
  // The product name is inside this title, so this is the page where the layout's `%s · Verdict` is
  // turned off: it would say the name twice.
  "page.landing.title": "Verdict, verstehen vor dem Upgrade",
  "page.landing.description":
    "Verdict verfolgt die Releases der Technologien in deinem Stack und gibt jeder ein einziges Urteil: ob sie etwas von dir verlangt, was bricht und wie man migriert, und jede Aussage zeigt auf die Zeile der Release Notes, aus der sie gelesen wurde.",
  "page.dashboard.title": "Dashboard",
  "page.technologies.title": "Technologien",
  "page.account.title": "Account",
  "page.login.title": "Anmelden",
  "page.login.description":
    "Melde dich mit GitHub an, um Technologien zu folgen und dein Dashboard zu sehen.",
  // The five document pages. The title says the word the foot calls the page by, not a synonym:
  // `Nutzungsbedingungen` is the long form of `bedingungen`, which the foot keeps short to fit its
  // column at 320px.
  "page.faq.title": "FAQ",
  "page.faq.description":
    "Was Verdict verfolgt, wozu ein Account da ist, und wie weit man einer generierten Zusammenfassung trauen kann.",
  "page.terms.title": "Nutzungsbedingungen",
  "page.terms.description":
    "Was Verdict ist, was der kostenlose Plan hält, und warum eine generierte Zusammenfassung immer die Zeile zeigt, aus der sie gelesen wurde.",
  "page.privacy.title": "Datenschutz",
  "page.privacy.description":
    "Alles, was Verdict über einen Entwickler speichert, wer es berührt, und warum nie persönliche Daten in einen Prompt kommen.",
  "page.attributions.title": "Attributionen",
  "page.attributions.description":
    "Woher die Marken der Technologien, die Release Notes, die Schriften und die Icons in Verdict kommen, und unter welcher Lizenz.",
  "page.contact.title": "Kontakt",
  "page.contact.description":
    "Eine Adresse, beantwortet von der Person, die Verdict betreibt.",
  "page.technology.title": "Releases von {name}",
  "page.technology.holds":
    "Jedes Release von {name}, mit einer Zusammenfassung dessen, was sich geändert hat, wenn es eine gibt.",
  "page.technology.described": "{description} {holds}",
  "page.release.title": "Release {name} {version}",
  "page.release.published": "{name} {version}, veröffentlicht am {date}.",
  "page.release.notesOnly":
    "{published} Die Release Notes, wie sie veröffentlicht wurden, noch nicht zusammengefasst.",
  "page.opening": "{name} wird geöffnet",
  "page.notFound.claim": "keine Seite an dieser Adresse",
  "page.notFound.body":
    "Es ist nichts schiefgegangen. Diese Adresse nennt keine Technologie aus dem Katalog, oder eine Version ohne eigenes Release: der Katalog ist von Hand gepflegt, und ein Release bekommt eine Seite, sobald es erkannt wird.",
  "page.browseCatalog": "den Katalog durchsehen",
  "page.error.claim": "diese Seite konnte nicht geladen werden",
  "page.error.body":
    "Auf unserer Seite ist beim Bauen dieser Seite etwas fehlgeschlagen. Es wurde nichts gespeichert und nichts geändert, ein neuer Versuch ist also unbedenklich.",
  "page.error.retry": "Neu versuchen",
  "page.error.reference": "Referenz {digest}",
} as const satisfies Partial<MessageDictionary>;
