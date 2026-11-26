import { ComingSoon } from "@/components/admin/ComingSoon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Media Library" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Media Library" description="Upload and manage images" phase="Phase 4" />;
}
