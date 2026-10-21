import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Paramètres",
  "settings.intro":
    "Comment l’app se lit pour vous. Rien ici n’est partagé avec personne, et rien sur les pages publiques des releases et des technologies n’en dépend.",
  "settings.language.note":
    "La langue fait partie de l’adresse, donc une page peut être partagée dans la langue où elle a été lue. Les notes de version et les synthèses restent dans leur langue d’origine.",
} as const satisfies Partial<MessageDictionary>;
