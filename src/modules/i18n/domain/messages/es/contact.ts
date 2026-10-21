import type { MessageDictionary } from "../index";

// The contact page, in Spanish. The address itself is not here: it comes from `CONTACT_EMAIL`, so
// no language can retype it wrong.
export const contact = {
  "contact.lede":
    "Una sola dirección, leída por la persona que lleva esto. No hay formulario, ni ticket, ni bot en medio, y ninguna promesa sobre lo rápido que llega una respuesta.",

  "contact.write.title": "escribe aquí",
  "contact.write.body":
    "Una síntesis que lee mal sus notas de la versión, una release que nunca apareció, una página que se rompe a tu anchura, una pregunta que la {faq} no responde: todo eso merece un mensaje. Si algo está mal en una página, la dirección de esa página es la línea más útil del mensaje.",

  "contact.noNeed.title": "dos cosas por las que no hace falta escribir",
  "contact.noNeed.delete.lead": "Borrar tu cuenta.",
  "contact.noNeed.delete.body":
    "Es un botón en la {account} y funciona al momento. Nadie tiene que aprobarlo.",
  "contact.noNeed.add.lead": "Añadir una tecnología.",
  "contact.noNeed.add.body":
    "El catálogo está curado a mano y no hay cola de peticiones, así que un correo sobre esto es algo que saber y no algo que seguir. Dilo de todos modos si te importa.",

  "contact.security.title": "algo que no debería ser público",
  "contact.security.body":
    "Un problema de seguridad, o cualquier cosa sobre los datos de otra persona, va a la misma dirección y a ningún sitio público. Di qué has encontrado y cómo verlo ocurrir, y da tiempo a que se arregle antes de contárselo a nadie más.",
} as const satisfies Partial<MessageDictionary>;
