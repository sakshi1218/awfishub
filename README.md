# AWFIS HUB — Central Operating System for MindLyft

AWFIS HUB is an enterprise-grade company management and organizational operating platform built for **MindLyft**. It provides centralized visibility and governance across the company's organizational hierarchy, daily deliverables, review meetings, campus sales operations, attendance, and analytics.

---

## 🏛️ System Architecture & Technology Stack

- **Frontend & Framework:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Design & Icons:** Lucide Icons, Modern Responsive SaaS Layout with Light/Dark theme support
- **Data Visualizations:** Recharts, interactive KPI widgets, dynamic SVG hierarchy connectors
- **ORM & Database:** Prisma ORM with SQLite relational persistence (`prisma/schema.prisma`)
- **Document & Data Export:** SheetJS (`xlsx`) for Excel reports, automated PDF print styling
- **Multi-Role RBAC:** Founder, Director, Manager, Employee, Sales Director, Sales Executive

---

## 🌟 Key Modules

1. **Role-Based Master Dashboard (`/`)**
   - Automatically adapts layout and metrics for **Founder**, **Director**, **Manager**, or **Employee**.
   - Includes an interactive top navbar persona switcher to test permissions across all organizational tiers.

2. **Interactive Company Hierarchy & Org Chart (`/hierarchy`)**
   - Interactive zoomable tree mapping **Founder → Directors → Managers → Employees**.
   - Collapsible branches and profile peek drawer.

3. **Employee & Department Management (`/employees`, `/departments`)**
   - Complete employee directory with search, filtering, and profile modals.
   - Historical supervisor transitions tracked in `ReportingHistory`.
   - Department CRUD and mandate configurations for all 7 initial business units.

4. **Task Management & Workflow (`/tasks`)**
   - 5-stage Kanban board (**Not Started, In Progress, Submitted for Review, Changes Requested, Completed**) and Table view.
   - Progress sliders ($0-100\%$), comments activity feed, and Manager/Director approval workflows.

5. **Daily Work Reporting (`/daily-reports`)**
   - Daily logs with hours spent, deliverables, challenges faced, and tomorrow's plan.
   - Real-time submission counter with **Missing Submissions Alerts** for supervisors.

6. **Meetings & Review Sessions (`/meetings`)**
   - 6 meeting types: Founder Review, Director Review, Manager Review, 1-on-1s, Departmental Syncs, and Task Reviews.
   - Action items with **1-click conversion into trackable Tasks**.

7. **Sales Management Suite (`/sales/*`)**
   - **College Visits (`/sales/visits`)**: In-person campus visits, principal/dean contacts, discussions, and outcomes.
   - **FDP Sessions (`/sales/fdp`)**: Faculty Development Programs, trainers, attendee counts, feedback, and certificate dispatches.
   - **College Agreements (`/sales/agreements`)**: MoU database with **automated 30-day expiry calculation** and 1-click renewals.
   - **Interested Clients / CRM (`/sales/leads`)**: 8-stage sales pipeline with deal valuation and follow-up communication timeline.
   - **Sales Performance (`/sales/performance`)**: Department targets vs. achievements and sales rep leaderboard.

8. **Attendance, Leave & Analytics (`/attendance`, `/reports`, `/notifications`)**
   - Real-time daily Check-In & Check-Out.
   - Leave applications with balance deduction and supervisor approval actions.
   - Multi-dimensional reporting with **Excel export (.xlsx)** and PDF formatting.
   - In-app notification center for deliverables and agreement expiry alerts.

---

## 🚀 Quickstart & Setup Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/sakshi1218/awfishub.git
cd awfishub
npm install
```

### 2. Configure Environment & Database
```bash
cp .env.example .env
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Sample Personas for Testing

Use the **"Viewing as: [Name]"** dropdown in the top navbar to switch between personas:
- **Founder & CEO:** Pooja Ahire (`ML-F01`)
- **Director of Sales & Partnerships:** Anchal Agawane (`ML-D01`)
- **Director of Technology & Product:** Rutuja Botre (`ML-D02`)
- **Director of Operations & People:** Shubham Jadhav (`ML-D03`)
- **Sales Manager:** Ananya Iyer (`ML-M01`)
- **Senior Sales Executive:** Amit Patel (`ML-E01`)
- **Software Engineer:** Neha Gupta (`ML-E03`)
