import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export type PathItem = string | { label: string; href: string };

// `path` is the breadcrumb after the wordmark; the last item is the current page.
export function SiteHeader({ path }: { path: readonly PathItem[] }) {
  return (
    <>
      <a
        href="#content"
        className="absolute -left-[9999px] z-10 bg-raised px-3 py-2 focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <header className="border-b border-rule">
        <div className="mx-auto flex h-[56px] max-w-content items-center gap-5 px-4 sm:px-5">
          <Link href="/" className="font-mono text-[14px] no-underline [font-variant-ligatures:none]">
            release-tracker
          </Link>
          <nav aria-label="Breadcrumb" className="max-sm:hidden">
            <ol className="flex gap-2 font-mono text-label text-text-muted">
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
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
