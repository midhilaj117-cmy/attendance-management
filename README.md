# Attendance Management — React, Express, Supabase (No Prisma)

This starter project uses React + Vite for the frontend, Express for the backend, and Supabase's JavaScript client for the hosted database. It does **not** use Prisma and does not require PostgreSQL installed on your laptop.

## 1. Supabase setup
1. Create/open your Supabase project.
2. Open **SQL Editor → New query**.
3. Copy and run `supabase/schema.sql`.
4. In Supabase Authentication settings, choose your desired sign-up/email-confirmation settings. For a first local test, you may disable email confirmation in the Auth settings; enable it again for a real deployment.
5. In **Connect** / **Project Settings → API**, copy the Project URL and publishable key.

The SQL enables Row Level Security and permits authenticated users to read/write attendance rows. This is a starter policy, not a complete college role/ownership policy. Do not store real student records until you add role-based permissions and policies appropriate to your institution.

## 2. Configure environment variables
Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`.

Set the same Supabase project URL and publishable key in both files. Never put a Supabase secret/service-role key in the frontend or commit real keys to Git.

## 3. Install and run
Open PowerShell in this project folder:

```powershell
npm install
npm run install:all
npm run dev
```

Frontend: http://localhost:5173  
Backend health check: http://localhost:5000/api/health

## 4. How it works
- Users sign up or sign in using Supabase Auth in the React frontend.
- React sends the user's access token to Express.
- Express validates the token and performs database operations using the user's token, so Supabase RLS policies apply.
- Attendance rows are stored in the Supabase-hosted PostgreSQL database.

## 5. Existing project
This is a complete starter project generated to avoid overwriting your current files. Back up your existing project before replacing anything. This folder does not include your old Prisma setup.
