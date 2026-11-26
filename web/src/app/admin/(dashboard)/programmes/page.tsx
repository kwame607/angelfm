import { ComingSoon } from "@/components/admin/ComingSoon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Programmes" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Programmes" description="Manage the broadcast schedule" phase="Phase 4" />;
}
