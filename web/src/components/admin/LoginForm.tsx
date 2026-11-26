"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold">Email</label>
        <input
          id="email" name="email" type="email" autoComplete="username" required
          className="mt-1 w-full rounded-sm border border-rule bg-white px-3 py-2.5 text-base"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold">Password</label>
        <input
          id="password" name="password" type="password" autoComplete="current-password" required
          className="mt-1 w-full rounded-sm border border-rule bg-white px-3 py-2.5 text-base"
        />
      </div>
      {state.error && (
        <p role="alert" className="border-l-4 border-angel-red bg-red-50 px-3 py-2 text-sm text-angel-red-dark">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
