export interface AdminNavItem {
  label: string;
  href: string;
  description: string;
}

export const adminNav: AdminNavItem[] = [
  { label: "Overview", href: "/admin", description: "Site summary and recent activity" },
  { label: "News", href: "/admin/news", description: "Write, edit and publish articles" },
  { label: "Categories", href: "/admin/categories", description: "Organise news categories" },
  { label: "Programmes", href: "/admin/programmes", description: "Manage the broadcast schedule" },
  { label: "Presenters", href: "/admin/presenters", description: "Manage presenter profiles" },
  { label: "Advertisements", href: "/admin/advertisements", description: "Manage ad campaigns" },
  { label: "Media Library", href: "/admin/media", description: "Upload and manage images" },
  { label: "Radio Settings", href: "/admin/radio", description: "Stream and station configuration" },
  { label: "Website Settings", href: "/admin/settings", description: "Contact details and social links" },
  { label: "Admin Profile", href: "/admin/profile", description: "Your account" },
];
