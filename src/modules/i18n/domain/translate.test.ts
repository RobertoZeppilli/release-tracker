import { describe, expect, it } from "vitest";
import { type Dictionary, interpolate, messageParts, placeholdersOf } from "./message";
import { createTranslator } from "./translate";

const dictionary = {
  plain: "safe to upgrade",
  named: "signed in as {handle}",
  twice: "{a} and {a}",
  counted: { one: "{count} breaking change", other: "{count} breaking changes" },
};

describe("createTranslator", () => {
  it("reads a plain message", () => {
    expect(createTranslator("en", dictionary)("plain")).toBe("safe to upgrade");
  });

  it("puts the parameters in", () => {
    expect(createTranslator("en", dictionary)("named", { handle: "robz" })).toBe("signed in as robz");
    expect(createTranslator("en", dictionary)("twice", { a: "x" })).toBe("x and x");
  });

  it("leaves a placeholder nobody filled visible", () => {
    // Loud on purpose: the braces in the page are how a forgotten parameter is found.
    expect(createTranslator("en", dictionary)("named")).toBe("signed in as {handle}");
  });

  it("chooses the English forms by the count", () => {
    const t = createTranslator("en", dictionary);
    expect(t("counted", { count: 1 })).toBe("1 breaking change");
    expect(t("counted", { count: 0 })).toBe("0 breaking changes");
    expect(t("counted", { count: 7 })).toBe("7 breaking changes");
  });

  it("chooses the forms of the language it was given, not of English", () => {
    // `Intl.PluralRules` is the whole reason the module writes no plural rules of its own, and this
    // is the difference it already makes inside the five languages of the product: **French counts
    // zero as one**, so `0 breaking change` is right there and wrong in English. Nothing in the
    // module had to know that.
    expect(createTranslator("fr", dictionary)("counted", { count: 0 })).toBe("0 breaking change");
    expect(createTranslator("en", dictionary)("counted", { count: 0 })).toBe("0 breaking changes");
  });

  it("falls back to `other` when a counted message is given no count", () => {
    expect(createTranslator("en", dictionary)("counted")).toBe("{count} breaking changes");
  });

  it("returns the key itself when the dictionary has not got it", () => {
    // Only a dictionary typed as one lets through a key that is not in it, which is the point: in
    // the product `t` is typed by the keys of English, so this is the state a page reaches when a
    // dictionary arrives short, not one a component can write.
    const short: Dictionary = {};
    expect(createTranslator("en", short)("shell.signIn")).toBe("shell.signIn");
  });
});

describe("placeholdersOf", () => {
  it("lists the names a message interpolates, once each and sorted", () => {
    expect(placeholdersOf("{b} then {a} then {b}")).toEqual(["a", "b"]);
  });

  it("reads every form of a counted message", () => {
    expect(placeholdersOf({ one: "{count} of {total}", other: "{count} of {total}" })).toEqual(["count", "total"]);
  });
});

describe("interpolate", () => {
  it("prints a number as the figure it is", () => {
    expect(interpolate("{count} of {limit} followed", { count: 3, limit: 10 })).toBe("3 of 10 followed");
  });
});

describe("messageParts", () => {
  it("cuts a sentence at the gaps a component fills with elements", () => {
    expect(messageParts("Signing in accepts the {terms}.")).toEqual([
      "Signing in accepts the ",
      { placeholder: "terms" },
      ".",
    ]);
  });

  it("keeps a sentence with no gap in one piece, and loses nothing at either end", () => {
    expect(messageParts("no page at this address")).toEqual(["no page at this address"]);
    expect(messageParts("{one} and {two}")).toEqual([
      { placeholder: "one" },
      " and ",
      { placeholder: "two" },
    ]);
  });
});
