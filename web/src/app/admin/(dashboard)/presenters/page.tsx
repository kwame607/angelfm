import { ComingSoon } from "@/components/admin/ComingSoon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Presenters" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Presenters" description="Manage presenter profiles" phase="Phase 4" />;
}
