import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

// `path` is the breadcrumb after the wordmark; the last item is the current page.
export function SiteHeader({ path }: { path: readonly string[] }) {
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
                return (
                  <li key={item} className="flex gap-2">
                    {index > 0 && <span aria-hidden>/</span>}
                    <span aria-current={current ? "page" : undefined} className={current ? "text-text" : undefined}>
                      {item}
                    </span>
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
