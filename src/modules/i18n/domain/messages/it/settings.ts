import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Impostazioni",
  "settings.intro":
    "Come l'app si legge per te. Niente di qui è condiviso con nessuno, e niente nelle pagine pubbliche delle release e delle tecnologie dipende da questo.",
  "settings.language.note":
    "La lingua è parte dell'indirizzo, così una pagina si può condividere nella lingua in cui è stata letta. Le note di rilascio e le sintesi restano nella loro lingua originale.",
} as const satisfies Partial<MessageDictionary>;
