import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key. Never import this from
// client components — the service role key bypasses row-level security.
let client = null;

export function supabaseAdmin() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return client;
}
