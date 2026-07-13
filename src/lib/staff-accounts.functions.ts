import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Email domain used to back staff (username + PIN) logins. */
export const STAFF_EMAIL_DOMAIN = "staff.baitunnazat.app";

export type StaffAccount = {
  id: string;
  user_id: string;
  username: string;
  pin: string;
  name: string | null;
  created_at: string;
};

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Forbidden");
}

/** List all staff accounts. Admin only. */
export const listStaffAccounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("staff_accounts")
      .select("id, user_id, username, pin, name, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as StaffAccount[];
  });

/** Create a new staff account with a unique username + 6-digit PIN. Admin only. */
export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { username: string; pin: string; name?: string }) => {
    const username = (input.username ?? "").trim().toLowerCase();
    const pin = (input.pin ?? "").trim();
    const name = (input.name ?? "").trim();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      throw new Error("ইউজারনেম ৩-২০ অক্ষরের হতে হবে (শুধু ইংরেজি অক্ষর, সংখ্যা ও _)।");
    }
    if (!/^\d{6,32}$/.test(pin)) {
      throw new Error("পিন ৬ থেকে ৩২ সংখ্যার হতে হবে।");
    }
    return { username, pin, name };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Uniqueness check on username.
    const { data: existing } = await supabaseAdmin
      .from("staff_accounts")
      .select("id")
      .eq("username", data.username)
      .maybeSingle();
    if (existing) throw new Error("এই ইউজারনেম আগে থেকেই আছে। অন্যটি ব্যবহার করুন।");

    const email = `${data.username}@${STAFF_EMAIL_DOMAIN}`;
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.pin,
      email_confirm: true,
      user_metadata: { username: data.username, name: data.name },
    });
    if (createErr || !created.user) {
      throw new Error(createErr?.message || "অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে।");
    }
    const userId = created.user.id;

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "finance" });
    if (roleErr) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw roleErr;
    }

    const { error: accErr } = await supabaseAdmin.from("staff_accounts").insert({
      user_id: userId,
      username: data.username,
      pin: data.pin,
      name: data.name || null,
    });
    if (accErr) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw accErr;
    }
    return { ok: true };
  });

/** Update the PIN (and optionally name) of a staff account. Admin only. */
export const updateStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; pin?: string; name?: string }) => {
    const pin = input.pin != null ? String(input.pin).trim() : undefined;
    if (pin != null && pin !== "" && !/^\d{6,32}$/.test(pin)) {
      throw new Error("পিন ৬ থেকে ৩২ সংখ্যার হতে হবে।");
    }
    return { id: input.id, pin: pin || undefined, name: input.name?.trim() };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: acc, error: accErr } = await supabaseAdmin
      .from("staff_accounts")
      .select("id, user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (accErr) throw accErr;
    if (!acc) throw new Error("অ্যাকাউন্ট পাওয়া যায়নি।");

    if (data.pin) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(acc.user_id, {
        password: data.pin,
      });
      if (error) throw error;
    }

    const patch: { pin?: string; name?: string | null; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (data.pin) patch.pin = data.pin;
    if (data.name !== undefined) patch.name = data.name || null;
    const { error } = await supabaseAdmin
      .from("staff_accounts")
      .update(patch)
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/** Delete a staff account (removes the login too). Admin only. */
export const deleteStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: acc, error: accErr } = await supabaseAdmin
      .from("staff_accounts")
      .select("user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (accErr) throw accErr;
    if (!acc) return { ok: true };

    // Deleting the auth user cascades to user_roles and staff_accounts.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(acc.user_id);
    if (error) throw error;
    return { ok: true };
  });
