import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth/session";
import { logout } from "@/app/admin/actions";

/**
 * Every dashboard page renders inside this layout, which verifies the
 * administrator on the server. Pages and server actions verify again
 * (defence in depth) because layouts do not re-run on every navigation.
 */
async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <AdminSidebar email={admin.email} logoutAction={logout} />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Loading…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
