import { ComingSoon } from "@/components/admin/ComingSoon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "News" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="News" description="Write, edit and publish articles" phase="Phase 4" />;
}
