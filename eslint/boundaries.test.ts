import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint();

async function ruleIds(code: string, filePath: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return result?.messages.map((message) => message.ruleId ?? "fatal") ?? [];
}

describe("module boundaries", () => {
  it("allows importing a module from its index", async () => {
    const code = 'import { SignificanceSchema } from "@/modules/releases";\nexport { SignificanceSchema };\n';
    expect(await ruleIds(code, "src/modules/dashboard/domain/fixture.ts")).toEqual([]);
  });

  it("allows importing a module's components from its ui index", async () => {
    const code = 'import { ReleaseList } from "@/modules/releases/ui";\nexport { ReleaseList };\n';
    expect(await ruleIds(code, "src/app/fixture.tsx")).toEqual([]);
  });

  it.each([
    ["src/modules/dashboard/domain/fixture.ts", "@/modules/releases/ui"],
    ["src/modules/releases/domain/fixture.ts", "../ui"],
  ])("rejects UI components in domain code (%s)", async (filePath, source) => {
    expect(await ruleIds(`export * from "${source}";\n`, filePath)).toContain("no-restricted-imports");
  });

  it("rejects importing past a module index", async () => {
    const code = 'export { SignificanceSchema } from "@/modules/releases/domain/significance";\n';
    expect(await ruleIds(code, "src/app/fixture.ts")).toContain("no-restricted-imports");
  });

  it("rejects a relative path into another module", async () => {
    const code = 'export { SignificanceSchema } from "../../releases/domain/significance";\n';
    expect(await ruleIds(code, "src/modules/dashboard/ui/fixture.ts")).toContain("no-restricted-imports");
  });

  it("rejects server code in a client component", async () => {
    const code = '"use client";\nexport * from "@/modules/releases/server";\n';
    expect(await ruleIds(code, "src/modules/dashboard/ui/fixture.tsx")).toContain(
      "local/no-server-import-in-client",
    );
  });

  it("rejects server code in domain code", async () => {
    const code = 'export * from "../server";\n';
    expect(await ruleIds(code, "src/modules/releases/domain/fixture.ts")).toContain(
      "local/no-server-import-in-client",
    );
  });

  it("allows server code in a server component", async () => {
    const code = 'export * from "@/modules/releases/server";\n';
    expect(await ruleIds(code, "src/app/fixture.tsx")).toEqual([]);
  });

  it("rejects any", async () => {
    const code = "export const value: any = 1;\n";
    expect(await ruleIds(code, "src/app/fixture.ts")).toContain("@typescript-eslint/no-explicit-any");
  });
});
