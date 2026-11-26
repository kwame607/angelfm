import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Admin Profile" };

export default async function ProfilePage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader title="Admin Profile" description="Your administrator account." />
      <dl className="max-w-md space-y-3 border border-rule bg-surface p-5 text-sm">
        <div><dt className="font-semibold">Email</dt><dd className="text-muted">{admin.email}</dd></div>
        <div><dt className="font-semibold">Display name</dt><dd className="text-muted">{admin.displayName ?? "Not set"}</dd></div>
        <div><dt className="font-semibold">Role</dt><dd className="text-muted">Administrator</dd></div>
      </dl>
      <p className="mt-4 max-w-md text-sm text-muted">
        Editing your name and changing your password will be added in Phase 4. Until then, a password
        can be reset from the Supabase dashboard (see <code>docs/ADMIN_SETUP.md</code>).
      </p>
    </>
  );
}
