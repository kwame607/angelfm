import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";

async function AlreadySignedIn() {
  if (await getAdmin()) redirect("/admin");
  return null;
}

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Image src="/brand/angel-fm-logo.jpg" alt="Angel 96.1 FM" width={600} height={404} priority className="mx-auto h-28 w-auto" />
        <div className="mt-6 border border-rule bg-surface p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold">Administrator sign in</h1>
          <p className="mt-1 mb-5 text-sm text-muted">Authorised station staff only.</p>
          {configured ? (
            <LoginForm />
          ) : (
            <p role="status" className="border-l-4 border-angel-gold bg-amber-50 px-3 py-2 text-sm">
              Sign-in is unavailable: the Supabase connection has not been configured yet.
              See <code>web/docs/ADMIN_SETUP.md</code>.
            </p>
          )}
        </div>
        <Suspense>
          <AlreadySignedIn />
        </Suspense>
      </div>
    </div>
  );
}
