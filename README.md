# Cadence Client — Frontend Setup & Developer Guide

Cadence Frontend is an enterprise engineering management workstation built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **SWR**, deployed seamlessly to **Vercel**.

---

## Architecture Overview

* **Frontend**: Next.js 15 hosted on **Vercel** (or local on `http://localhost:3000`).
* **Backend API**: NestJS 10 REST API hosted on **Vercel Cloud** (`https://cadence-server-j78w.vercel.app/api`) or running locally (`http://localhost:5000/api`).
* **Database**: **Supabase PostgreSQL** (queried via backend Prisma ORM).

---

## Prerequisites

* **Node.js**: v18.18.0 or newer (v20+ recommended)
* **Package Manager**: `npm` (v9+)
* **Cadence Backend**: Running locally on port `5000` OR deployed on Vercel

---

## 1. Installing Dependencies

From the `client` directory, install the required packages:

```bash
cd client
npm install
```

---

## 2. Running Frontend

### Option A: Local Development Mode
1. Ensure your `.env` or `.env.local` is configured:
   ```env
   # Local NestJS server
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open **[http://localhost:3000](http://localhost:3000)** in your desktop browser.

---

### Option B: Deploying Frontend to Vercel
1. Push your `client` repository to GitHub.
2. In the **Vercel Dashboard**, click **Add New Project** and import your frontend repo.
3. In **Project Settings → Environment Variables**, add:
   * **Key**: `NEXT_PUBLIC_API_URL`
   * **Value**: `https://cadence-server-j78w.vercel.app/api`
4. Click **Deploy**.
   * *Note: The built-in URL normalizer in `client/lib/api.ts` safely cleans trailing slashes or missing `/api` segments.*

---

## 3. Running Backend (Connecting to Frontend)

The client uses a centralized [`ApiClient`](./lib/api.ts) to communicate with the backend:
* **Local Backend**: Follow the [Server README](../server/README.md) to start NestJS locally:
  ```bash
  cd ../server
  npm run start:dev
  ```
* **Production Cloud Backend**: If your server is deployed on Vercel (`https://cadence-server-j78w.vercel.app`), point `NEXT_PUBLIC_API_URL` directly to it.
* **Health Diagnostic**: The frontend automatically verifies connectivity with `GET /api/health`.

---

## 4. Running Database (Supabase PostgreSQL)

You do **not** need Docker to run Cadence:
* The backend connects directly to your **Supabase PostgreSQL** cloud instance via Prisma.
* When using Cadence locally or on Vercel, all client operations (logging in, creating report drafts, submitting tasks, triaging blockers, managing projects) automatically read and write directly to your Supabase database through the API.
* To apply schema changes or seed sample data to Supabase, run the Prisma commands in the `server` directory (see [Server README](../server/README.md#3-supabase-database-migration--seeding)).

---

## Key Features & UI Workflows

* **Role-Based Portals**:
  * **Administrator**: Access to Dashboard, Team Reports, Weekly Blockers, Work Categories, and **Users & Roles Management** (`/admin/users`).
  * **Manager**: Access to Team Reports, Cross-Team Blockers triage, Work Categories, and Dashboard metrics (Users & Roles tab is strictly hidden).
  * **Team Member**: Access to Weekly Report authoring (`/reports/new`), Personal Report History (`/reports/history`), and Work Categories.
* **Brutalist Pagination**: 10-item and 9-item pagination controls across all data tables and card grids with dynamic range readouts (`Showing 1–10 of 24`).
* **Desktop Workstation Enforcement**:
  * Viewports `< 1024px` (mobile devices & portrait tablets) are disabled with a high-contrast desktop advisory screen displaying detected screen dimensions and minimum requirement (`≥ 1024px`).
* **AI Chat Drawer**: Floating assistant with role-scoped tools (team members can auto-fill tasks; admins and managers have report authoring strictly blocked).

---

## Default Seeded Login Credentials

Use any of these pre-seeded Supabase accounts:

| Role | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- |
| **Root Admin** | `admin@cadence.com` | `password123` | Full workspace governance, password resets, role assignment |
| **Manager** | `manager@company.com` | `password123` | Team oversight, report approvals/feedback, blockers triage |
| **Team Member** | `alex@company.com` | `password123` | Weekly report drafting, submission, and personal archive |
| **Team Member** | `dana@company.com` | `password123` | Weekly report drafting, submission, and personal archive |
| **Team Member** | `marcus@company.com` | `password123` | Weekly report drafting, submission, and personal archive |

---

## Troubleshooting

* **Chunk 404s after code updates**: Clear Next.js compilation cache and restart:
  ```bash
  rm -rf .next
  npm run dev
  ```
  Then hard refresh your browser (**`Ctrl + F5`** or **`Cmd + Shift + R`**).
* **Port 3000 in use**:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /F /PID <PID>
  
  # macOS / Linux
  lsof -ti:3000 | xargs kill -9
  ```
