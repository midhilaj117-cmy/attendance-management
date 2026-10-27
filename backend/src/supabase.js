const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.warn("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in backend/.env");
}

const supabaseAuth = url && key
  ? createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null;

function createUserClient(accessToken) {
  if (!url || !key) throw new Error("Supabase environment variables are not configured.");
  return createClient(url, key, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

module.exports = { supabaseAuth, createUserClient };
