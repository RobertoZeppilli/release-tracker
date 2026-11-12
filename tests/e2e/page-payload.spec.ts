import { expect, test } from "@playwright/test";

// What a page carries that the reader never sees. `LocaleProvider` hands the browser a dictionary,
// and for a while it handed it the whole one: 505 messages, 44.830 bytes, the words of every
// document page, inlined in the HTML of every page in the app and again in its RSC payload.
// `clientDictionary` ships the selection the client chunks can ask for instead, and these are the
// two halves of that claim: the words that must not travel, and the words that must.
//
// It reads the bytes of the response and not the rendered page on purpose: a string in the payload
// is invisible to a locator, which is exactly how 33.337 bytes went unnoticed for so long.

// A sentence from `privacy`, which only a Server Component reads, and one from `faq`. Both are
// quoted from `src/modules/i18n/domain/messages/en`: if the wording changes there, this fails and
// is to be updated, because what it guards is the key's absence and not the sentence.
const SERVER_ONLY = [
  "nothing about you is ever sent to a language model",
  "The questions this product is actually asked",
];

// A message a Client Component does ask for: the back-to-top control, which is `"use client"`.
const CLIENT_SIDE = "Back to top";

const PAGES = ["/", "/faq"];

for (const path of PAGES) {
  test(`${path} does not carry the messages only the server reads`, async ({ request }) => {
    const body = await (await request.get(path)).text();

    for (const sentence of SERVER_ONLY) expect(body).not.toContain(sentence);
    expect(body).toContain(CLIENT_SIDE);
  });
}

// The document pages print their own words, so the sentence is on the page: what must not happen is
// the rest of the dictionary travelling with them.
test("the privacy page prints its words and still leaves the faq behind", async ({ request }) => {
  const body = await (await request.get("/privacy")).text();

  expect(body).toContain(SERVER_ONLY[0]);
  expect(body).not.toContain(SERVER_ONLY[1]);
});
