import { PageHeader } from "@/components/admin/PageHeader";
import { ProfileForms } from "@/components/admin/ProfileForms";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Admin Profile" };

export default async function ProfilePage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader title="Admin Profile" description="Your administrator account." />
      <ProfileForms email={admin.email} displayName={admin.displayName ?? ""} />
    </>
  );
}
