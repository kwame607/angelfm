import { ComingSoon } from "@/components/admin/ComingSoon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Radio Settings" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Radio Settings" description="Stream and station configuration" phase="Phase 5" />;
}
