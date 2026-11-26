import { ComingSoon } from "@/components/admin/ComingSoon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Categories" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Categories" description="Organise news categories" phase="Phase 4" />;
}
