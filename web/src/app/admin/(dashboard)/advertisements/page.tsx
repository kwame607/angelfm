import { ComingSoon } from "@/components/admin/ComingSoon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Advertisements" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Advertisements" description="Manage ad campaigns" phase="Phase 4" />;
}
