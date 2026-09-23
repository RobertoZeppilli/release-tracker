import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidateReleasePages } from "./revalidate-pages";

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath }));

beforeEach(() => {
  revalidatePath.mockClear();
});

describe("revalidateReleasePages", () => {
  it("revalidates the Release page and its Technology page", () => {
    const paths = revalidateReleasePages([{ slug: "react", version: "19.0.0" }]);

    expect(revalidatePath.mock.calls).toEqual([["/technologies/react"], ["/technologies/react/19.0.0"]]);
    expect(paths).toEqual(["/technologies/react", "/technologies/react/19.0.0"]);
  });

  it("revalidates nothing when no Release changed", () => {
    expect(revalidateReleasePages([])).toEqual([]);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
