import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/**
 * Supabase client used for every server-side read and write.
 *
 * It uses the service role key on purpose: it bypasses RLS, so the same
 * client can serve both the public catalogue (explicitly filtered to
 * `status = 'available'`) and the admin panel. The anon key is never
 * exposed to the browser, and the RLS policies in supabase/schema.sql
 * still guard direct access with the anon key.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}
