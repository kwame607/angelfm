import type { ReactNode } from "react";

/** Simple outline icons (24px grid, inherit colour). */
function Icon({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
type P = { className?: string };
export const IconOverview = (p: P) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Icon>;
export const IconNews = (p: P) => <Icon {...p}><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" /><path d="M18 8h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2" /><path d="M8.5 8.5h6M8.5 12h6M8.5 15.5h4" /></Icon>;
export const IconTag = (p: P) => <Icon {...p}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.2" /></Icon>;
export const IconCalendar = (p: P) => <Icon {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17M8 14h2M12 14h2M16 14h.01M8 17.5h2M12 17.5h2" /></Icon>;
export const IconUser = (p: P) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></Icon>;
export const IconUsers = (p: P) => <Icon {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-5.5 6.5-5.5S15.5 16.4 15.5 20" /><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c2.2.6 3.5 2.2 3.5 5.2" /></Icon>;
export const IconMegaphone = (p: P) => <Icon {...p}><path d="M3 10v4a1 1 0 0 0 1 1h3l9 5V4L7 9H4a1 1 0 0 0-1 1Z" /><path d="M19.5 9.5a4 4 0 0 1 0 5" /><path d="M7 15l1.5 5h2.2L9.5 15" /></Icon>;
export const IconImage = (p: P) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="9" cy="10" r="1.7" /><path d="m21 16-5-5-8 8" /></Icon>;
export const IconRadio = (p: P) => <Icon {...p}><rect x="3" y="8" width="18" height="12" rx="2.5" /><path d="m7 8 11-4.5M8 14h5M16.5 13.5h.01M16.5 16.5h.01" /></Icon>;
export const IconCog = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></Icon>;
export const IconSearch = (p: P) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
export const IconBell = (p: P) => <Icon {...p}><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /></Icon>;
export const IconMenu = (p: P) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
export const IconClose = (p: P) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
export const IconChevron = (p: P) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>;
export const IconExternal = (p: P) => <Icon {...p}><path d="M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Icon>;
export const IconLogout = (p: P) => <Icon {...p}><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" /></Icon>;
export const IconPlus = (p: P) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
export const IconClock = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
export const IconBolt = (p: P) => <Icon {...p}><path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" /></Icon>;
export const IconInfo = (p: P) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Icon>;
export const IconPlay = (p: P) => <Icon {...p}><path d="M7 4.5v15l13-7.5z" fill="currentColor" /></Icon>;
export const IconPause = (p: P) => <Icon {...p}><path d="M7 5v14M17 5v14" strokeWidth="3.2" /></Icon>;
export const IconVolume = (p: P) => <Icon {...p}><path d="M4 9.5v5h4l5 4v-13l-5 4H4Z" /><path d="M16.5 9a4 4 0 0 1 0 6" /></Icon>;
export const IconMusic = (p: P) => <Icon {...p}><path d="M9 18V6l11-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></Icon>;
export const IconKey = (p: P) => <Icon {...p}><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l3 3" /></Icon>;
export const IconCheck = (p: P) => <Icon {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>;
