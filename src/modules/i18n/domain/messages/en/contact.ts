// The contact page, one namespace because it is one page. The address itself is not here: it comes
// from `CONTACT_EMAIL`, so no language can retype it wrong.
export const contact = {
  "contact.lede":
    "One address, read by the person who runs this. There is no form, no ticket and no bot in between, and no promise about how fast an answer comes.",

  "contact.write.title": "write here",
  "contact.write.body":
    "A summary that misreads its release notes, a release that never appeared, a page that breaks at your width, a question the {faq} does not answer: all of it is worth writing about. If something is wrong on a page, the address of that page is the most useful line of the message.",

  "contact.noNeed.title": "two things you do not have to write for",
  // The lead of each pair is a `strong` and the rest is the sentence that follows it, so a language
  // keeps the two apart the way the page prints them.
  "contact.noNeed.delete.lead": "Deleting your account.",
  "contact.noNeed.delete.body": "It is a button on the {account} and it works at once. Nobody has to approve it.",
  "contact.noNeed.add.lead": "Adding a technology.",
  "contact.noNeed.add.body":
    "The catalog is curated and there is no request queue, so a mail about it is a thing to know and not a thing to track. Say it anyway if it matters to you.",

  "contact.security.title": "something that should not be public",
  "contact.security.body":
    "A security problem, or anything about another person’s data, goes to the same address and nowhere public. Say what you found and how to see it happen, and give it time to be fixed before telling anyone else.",
} as const;
