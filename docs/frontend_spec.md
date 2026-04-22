# 🚀 Frontend Development Prompt — Smart Motorbike Parking SaaS (Vietnam - University Use)

You are a senior frontend engineer building a **production-quality SaaS web application**.

Your task is to design and implement a **modern, scalable, and clean frontend** for a **Motorbike Parking Management System** used in **Vietnamese universities/schools**.

---

## 🎯 Product Overview

This system helps manage motorbike parking in universities:
- Students register vehicles
- Guards scan/check vehicles in/out
- Admins monitor parking usage
- System tracks real-time occupancy

---

## 👥 User Roles

### 1. Student
- Register/login
- Add motorbike info (license plate)
- View parking history
- See current parking status

### 2. Parking Staff (Guard)
- Scan QR / input license plate
- Check-in / check-out vehicles
- See alerts (unregistered vehicles)

### 3. Admin
- Dashboard (analytics)
- Manage users & vehicles
- Monitor parking occupancy
- View logs/history

---

## 🧱 Tech Requirements

Use **modern SaaS best practices**:

### Core Stack
- Framework: **React (Next.js preferred)**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- UI Library: **shadcn/ui (preferred)** or similar
- State Management: **Zustand / Redux Toolkit**
- API Handling: **React Query / TanStack Query**

---

## 🎨 UI/UX Requirements

### Design Style
- Clean SaaS dashboard (inspired by Stripe, Vercel, Notion)
- Minimalistic, modern
- Soft shadows, rounded corners (2xl)
- Responsive (desktop-first, but mobile usable)

### Key Principles
- Fast, intuitive workflows
- Clear hierarchy
- Accessibility (basic a11y)
- Consistent spacing & typography

---

## 📱 Pages & Features

### 1. Authentication
- Login / Register
- Form validation
- Error states

---

### 2. Student Dashboard
- Overview:
  - Current parking status
  - Registered vehicles
- Parking history table
- Add/remove vehicle

---

### 3. Staff Interface (VERY IMPORTANT)
- Fast input UI (optimized for speed)
- Features:
  - Input license plate OR scan QR
  - Show:
    - Vehicle info
    - Owner info
    - Status (valid / invalid)
  - Buttons:
    - Check-in
    - Check-out

⚠️ This screen must be:
- Extremely fast
- Minimal clicks
- Large buttons (usable on tablet)

---

### 4. Admin Dashboard
- Metrics:
  - Total vehicles today
  - Current occupancy
  - Peak hours
- Charts (use Recharts)
- Tables:
  - Users
  - Parking logs

---

### 5. Real-time Parking Map (Optional but impressive)
- Visual slots (grid)
- Occupied vs available

---

## 🧩 Components to Build

- Navbar (role-based)
- Sidebar (dashboard layout)
- Data tables (sortable, paginated)
- Forms (reusable)
- Modal system
- Toast notifications
- Loading skeletons

---

## ⚡ Advanced (SaaS-Level Features)

- Dark mode toggle
- Role-based routing
- API abstraction layer
- Error boundaries
- Reusable hooks
- Clean folder structure

---

## 📁 Suggested Project Structure

```

/app
/components
/features
/auth
/student
/staff
/admin
/hooks
/lib
/services (API layer)
/types
/styles

```

---

## 🔌 API Assumptions

Assume backend exists with endpoints like:
- POST /auth/login
- GET /vehicles
- POST /checkin
- POST /checkout
- GET /logs

Mock API if needed.

---

## 🧪 Code Quality Requirements

- Strict TypeScript
- Modular, reusable components
- Clean naming
- No hardcoded values
- Proper loading & error states

---

## 🎯 Deliverables

1. Fully working frontend (no backend required)
2. Clean UI (portfolio-worthy)
3. Organized codebase
4. Dummy/mock data if needed

---

## 🚨 Important Notes

- This is a **final project**, so prioritize:
  - Clean UI
  - Real-world usability
  - Professional structure

- Do NOT build a toy UI — this must feel like a real SaaS product.

---

## 💡 Bonus (if time allows)

- QR code scanner integration (mock)
- Notifications system
- Multi-language (Vietnamese + English)

---

## ✅ Output Format

- Provide full codebase
- Explain setup steps
- Highlight key design decisions

---

Build this as if it will be deployed to real users.
