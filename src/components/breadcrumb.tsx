import Link from "next/link";

export type PathItem = string | { label: string; href: string };

// The first step of every breadcrumb. `/technologies` sits behind sign-in, and the step is a link
// all the same: the breadcrumb says where the page sits, not what the viewer may open, and
// `requireDeveloper` brings a visitor back here once signed in.
export const TECHNOLOGIES_CRUMB = { label: "technologies", href: "/technologies" } as const;

// Where the page sits, at the top of the page it describes. It used to share the top bar's slot with
// the two sections, and the slot is one: on a public page the breadcrumb won and the Dashboard was
// left inside the account panel, a click away from being seen at all (issue #119). The bar says
// where the viewer may go; this says where they are, and it belongs to the content.
export function PageBreadcrumb({ path }: { path: readonly PathItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap gap-2 font-mono text-label text-text-muted">
        {path.map((item, index) => {
          const current = index === path.length - 1;
          const label = typeof item === "string" ? item : item.label;
          return (
            <li key={label} className="flex gap-2">
              {index > 0 && <span aria-hidden>/</span>}
              {typeof item === "string" ? (
                <span aria-current={current ? "page" : undefined} className={current ? "text-text" : undefined}>
                  {item}
                </span>
              ) : (
                <Link href={item.href} className="no-underline hover:text-text">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
