import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { getAttention } from "@/lib/admin-overview";
import { logout } from "@/app/admin/actions";

/**
 * Every dashboard page renders inside this layout, which verifies the
 * administrator on the server. Pages and server actions verify again
 * (defence in depth) because layouts do not re-run on every navigation.
 */
async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const alerts = await getAttention();
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Accra" }).format(new Date());
  return (
    <AdminShell
      user={{ name: admin.displayName || admin.email, email: admin.email, lastSignIn: admin.lastSignInAt }}
      alerts={alerts}
      logoutAction={logout}
      today={today}
    >
      {children}
    </AdminShell>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Loading…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
