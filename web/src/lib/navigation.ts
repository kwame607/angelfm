export interface NavItem {
  label: string;
  href: string;
}

/** Primary navigation. Routes are built in Phase 2. */
export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Programmes", href: "/programmes" },
  { label: "Presenters", href: "/presenters" },
  { label: "Listen Live", href: "/listen" },
];
