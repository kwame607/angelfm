#!/usr/bin/env node
/**
 * One-time, interactive creation of the Angel FM administrator.
 *
 *   cd web
 *   node --env-file=.env.local scripts/create-admin.mjs
 *
 * Security properties:
 *  - The password is typed at a hidden prompt. It is never read from a file,
 *    environment variable or command-line argument, so it cannot end up in
 *    shell history, process listings, logs or source control.
 *  - Uses the service-role key locally; that key never leaves your machine.
 *  - Refuses to run if an administrator already exists.
 */
import { createClient } from "@supabase/supabase-js";
import readline from "node:readline";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.\nRun: node --env-file=.env.local scripts/create-admin.mjs");
  process.exit(1);
}

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); else rl.output.write(""); };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function validatePassword(pw) {
  if (pw.length < 12) return "Use at least 12 characters.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return "Include lowercase, uppercase and a number.";
  return null;
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

const { count, error: countError } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin");
if (countError) {
  console.error("Could not check existing administrators (have the migrations been applied?):", countError.message);
  process.exit(1);
}
if (count && count > 0) {
  console.error("An administrator already exists. This script only creates the first one.");
  process.exit(1);
}

const email = (await ask("Administrator email: ")).trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { console.error("That does not look like an email address."); process.exit(1); }
const displayName = (await ask("Display name (optional): ")).trim() || null;
const password = await ask("Password: ", { hidden: true });
const problem = validatePassword(password);
if (problem) { console.error(problem); process.exit(1); }
if (password !== (await ask("Confirm password: ", { hidden: true }))) { console.error("Passwords do not match."); process.exit(1); }

const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (error || !data.user) { console.error("Could not create the user:", error?.message); process.exit(1); }

const { error: profileError } = await supabase.from("profiles").insert({ id: data.user.id, email, display_name: displayName, role: "admin" });
if (profileError) {
  await supabase.auth.admin.deleteUser(data.user.id); // roll back so no orphan login exists
  console.error("Could not create the admin profile; rolled back:", profileError.message);
  process.exit(1);
}

await supabase.from("audit_logs").insert({ actor_id: data.user.id, action: "admin.created", entity_type: "profile", entity_id: data.user.id, summary: "Initial administrator created" });
console.log(`\nAdministrator created: ${email}\nYou can now sign in at /admin/login.`);
