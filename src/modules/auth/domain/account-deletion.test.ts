import { describe, expect, it } from "vitest";
import { confirmsDeletion, DELETION_WORD, githubRevokeUrl } from "./account-deletion";

describe("confirmsDeletion", () => {
  it("accepts the word, and what a keyboard adds around it", () => {
    expect(confirmsDeletion(DELETION_WORD)).toBe(true);
    expect(confirmsDeletion(" delete ")).toBe(true);
    // An autocapitalising phone writes this into an empty field.
    expect(confirmsDeletion("Delete")).toBe(true);
    expect(confirmsDeletion("DELETE")).toBe(true);
  });

  it("refuses anything that is not the word", () => {
    for (const typed of ["", " ", "del", "deleted", "delete account", "cancella", "yes"]) {
      expect(confirmsDeletion(typed)).toBe(false);
    }
  });

  it("refuses a field that was never filled", () => {
    expect(confirmsDeletion(null)).toBe(false);
    expect(confirmsDeletion(undefined)).toBe(false);
  });
});

describe("githubRevokeUrl", () => {
  it("points at the page of this app when the client ID is known", () => {
    expect(githubRevokeUrl("Iv1.0123456789abcdef")).toBe(
      "https://github.com/settings/connections/applications/Iv1.0123456789abcdef",
    );
  });

  it("falls back to the list of authorised applications", () => {
    expect(githubRevokeUrl(undefined)).toBe("https://github.com/settings/applications");
  });

  it("never lets a client ID write the rest of the address", () => {
    expect(githubRevokeUrl("../../settings/profile")).toBe(
      "https://github.com/settings/connections/applications/..%2F..%2Fsettings%2Fprofile",
    );
  });
});
