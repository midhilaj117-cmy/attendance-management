const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const { data, error } = await req.supabase
    .from("attendance")
    .select("id, student_name, student_email, subject, attendance_date, status, created_at")
    .order("attendance_date", { ascending: false })
    .order("id", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ data });
});

router.post("/", async (req, res) => {
  const student_name = String(req.body.student_name || "").trim();
  const student_email = String(req.body.student_email || "").trim();
  const subject = String(req.body.subject || "").trim();
  const status = String(req.body.status || "").trim();
  const attendance_date = req.body.attendance_date || undefined;

  if (!student_name || !student_email || !subject) {
    return res.status(400).json({ error: "Student name, email, and subject are required." });
  }
  if (!["Present", "Absent", "Late", "Excused"].includes(status)) {
    return res.status(400).json({ error: "Status must be Present, Absent, Late, or Excused." });
  }

  const record = { student_name, student_email, subject, status };
  if (attendance_date) record.attendance_date = attendance_date;

  const { data, error } = await req.supabase
    .from("attendance")
    .insert(record)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ data });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Attendance ID must be a positive integer." });
  }

  const { data, error } = await req.supabase
    .from("attendance")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return res.status(400).json({ error: error.message });
  if (!data || data.length === 0) {
    return res.status(403).json({ error: "You are not allowed to delete this record." });
  }
  res.json({ message: "Attendance record deleted." });
});

module.exports = router;