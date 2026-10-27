const { supabaseAuth, createUserClient } = require("../supabase");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ error: "Sign in first to use attendance APIs." });
    }
    if (!supabaseAuth) {
      return res.status(500).json({ error: "Supabase is not configured. Check backend/.env." });
    }

    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Session is invalid or expired. Please sign in again." });
    }

    req.user = data.user;
    req.supabase = createUserClient(token);
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    res.status(500).json({ error: "Could not validate session." });
  }
}

module.exports = requireAuth;
