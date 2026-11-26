import { ComingSoon } from "@/components/admin/ComingSoon";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Website Settings" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Website Settings" description="Contact details and social links" phase="Phase 4" />;
}
