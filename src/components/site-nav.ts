// The signed-in pages, in the order DESIGN.md gives them. It lives in its own module because both
// shapes of the navigation need it and they sit on opposite sides of the client boundary: the row
// inside the bar is rendered on the server, the rows inside the account sheet by the client
// component that owns the sheet's open state.
export const NAV = [
  { label: "dashboard", href: "/dashboard" },
  { label: "technologies", href: "/technologies" },
] as const;

export type NavItem = (typeof NAV)[number]["label"];
