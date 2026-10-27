import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const emptyForm = {
  student_name: "",
  student_email: "",
  subject: "",
  attendance_date: new Date().toISOString().slice(0, 10),
  status: "Present"
};

export default function App() {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [records, setRecords] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.access_token) loadRecords();
    else setRecords([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  async function api(path, options = {}) {
    const token = session?.access_token;
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Request failed.");
    return body;
  }

  async function loadRecords() {
    setError("");
    try {
      const result = await api("/api/attendance");
      setRecords(result.data || []);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAuth(event) {
    event.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured. Create frontend/.env from .env.example and add your project URL and publishable key.");
      return;
    }
    setBusy(true); setError(""); setMessage("");
    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setMessage("Account created. Check your email to confirm the account, then sign in.");
      } else {
        setMessage("Signed in successfully.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function addAttendance(event) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      await api("/api/attendance", { method: "POST", body: JSON.stringify(form) });
      setForm({ ...emptyForm, attendance_date: new Date().toISOString().slice(0, 10) });
      setMessage("Attendance saved to Supabase.");
      await loadRecords();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm("Delete this attendance record?")) return;
    setError(""); setMessage("");
    try {
      await api(`/api/attendance/${id}`, { method: "DELETE" });
      setRecords((current) => current.filter((record) => record.id !== id));
      setMessage("Record deleted.");
    } catch (e) {
      setError(e.message);
    }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setMessage("");
  }

  if (!supabase) {
    return <main className="center"><section className="card setup">
      <div className="brand-mark">A</div><h1>Attendify</h1>
      <p>Supabase configuration is missing.</p>
      <p>Create <code>frontend/.env</code> using <code>frontend/.env.example</code>, add your Supabase URL and publishable key, then restart the app.</p>
    </section></main>;
  }

  if (!session) {
    return <main className="center"><section className="card auth-card">
      <div className="brand-mark">A</div>
      <p className="eyebrow">ATTENDANCE MANAGEMENT</p>
      <h1>{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="muted">Sign in to manage attendance records.</p>
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}
      <form onSubmit={handleAuth} className="stack">
        <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
        <label>Password<input type="password" minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>
        <button disabled={busy} className="primary">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
      </form>
      <p className="switch">{mode === "signin" ? "New here?" : "Already have an account?"} <button className="text-button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}>{mode === "signin" ? "Create account" : "Sign in"}</button></p>
    </section></main>;
  }

  return <main className="page">
    <header className="topbar">
      <div className="brand"><div className="brand-mark small">A</div><div><strong>Attendify</strong><span>Attendance management</span></div></div>
      <div className="user-area"><span>{session.user.email}</span><button className="secondary" onClick={signOut}>Sign out</button></div>
    </header>
    <section className="hero">
      <div><p className="eyebrow">DASHBOARD</p><h1>Attendance overview</h1><p>Record and review attendance in your Supabase database.</p></div>
      <div className="stat"><span>Total records</span><strong>{records.length}</strong></div>
    </section>
    {error && <div className="alert error">{error}</div>}
    {message && <div className="alert success">{message}</div>}
    <section className="content-grid">
      <section className="card">
        <div className="section-heading"><div><p className="eyebrow">NEW RECORD</p><h2>Mark attendance</h2></div></div>
        <form onSubmit={addAttendance} className="stack">
          <label>Student name<input value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} required placeholder="e.g. Amina Khan" /></label>
          <label>Student email<input type="email" value={form.student_email} onChange={(e) => setForm({ ...form, student_email: e.target.value })} required placeholder="student@example.com" /></label>
          <label>Subject<input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required placeholder="e.g. Web Development" /></label>
          <div className="form-row">
            <label>Date<input type="date" value={form.attendance_date} onChange={(e) => setForm({ ...form, attendance_date: e.target.value })} required /></label>
            <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Present</option><option>Absent</option><option>Late</option><option>Excused</option></select></label>
          </div>
          <button className="primary" disabled={busy}>{busy ? "Saving…" : "Save attendance"}</button>
        </form>
      </section>
      <section className="card records-card">
        <div className="section-heading"><div><p className="eyebrow">DATABASE</p><h2>Recent attendance</h2></div><button className="secondary" onClick={loadRecords}>Refresh</button></div>
        {records.length === 0 ? <div className="empty"><div className="empty-icon">✓</div><h3>No records yet</h3><p>Add an attendance record using the form.</p></div> :
          <div className="table-wrap"><table><thead><tr><th>Student</th><th>Subject</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>
            {records.map((r) => <tr key={r.id}><td><strong>{r.student_name}</strong><small>{r.student_email}</small></td><td>{r.subject}</td><td>{r.attendance_date}</td><td><span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span></td><td><button className="delete" onClick={() => deleteRecord(r.id)} aria-label={`Delete ${r.student_name}`}>Delete</button></td></tr>)}
          </tbody></table></div>}
      </section>
    </section>
    <footer>Connected to Supabase · React + Express · No Prisma</footer>
  </main>;
}
