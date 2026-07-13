# HMS Developer Notes & Technical Reference

This document provides technical design notes, implementation details, and developmental guidelines for engineers working on the Hospital Management System (HMS) codebase.

---

## 🔌 1. Decoupling from Cloud Supabase

Originally, the system was configured to have the React frontend communicate directly with a Cloud Supabase instance for some features (vitals status, bed occupancy, patient search, and audit logs) while using the Spring Boot REST API for others.

Due to the cloud database going offline, the system was fully decoupled from Supabase:
- **Local DB Fallback**: The Spring Boot backend profile was switched to `dev` to use the local PostgreSQL server on port `5432` (database `pixelhms`).
- **REST Redirection**: Direct calls using `@supabase/supabase-js` inside `App.tsx` were replaced with secure `fetch` requests pointing to the corresponding REST controllers on the Spring Boot backend (`/api/v1/...`).
- **Field Mapping**: Mapped snake_case fields returned by database queries to camelCase format dynamically inside the frontend React state.

---

## 🔑 2. Authentication & Authorization Flow

The application utilizes stateless JWT token-based authentication.

```
[ Frontend Login View ] 
       │
       ▼ (POST /api/v1/auth/login)
[ AuthController ] ────► Queries Local DB (users table) 
       │
       ▼ (Generates and Returns JWT Token & User Metadata)
[ Frontend localStorage ] (Stores token, username, role, fullName)
       │
       ▼ (Appends Bearer <token> to headers for API calls)
[ Spring Boot Filters ] (Validates signature and claims via SecurityHelper)
```

- **Roles & Permissions**: Tab accessibility is filtered on the frontend via the `hasTabAccess(tab, role)` utility based on the user's role (`SuperAdmin`, `Doctor`, `FrontDesk`, `Nurse`, `Pharmacist`, `Accountant`).
- **Stateless Audits**: Every write operation (e.g. creating patient records, booking operations, pharmacy updates) automatically logs an entry via `AuditLogService` with the operator's details, IP address, and success/failure status.

---

## 💬 3. WhatsApp CRM Daemon Integration

The `whatsapp-server` daemon runs on Node.js and listens on port `3001`. It acts as a bridge between the hospital management system and WhatsApp Web using the socket-based Baileys library.

### Key API Endpoints (Invoked by Spring Boot & Frontend):
- `GET /api/status`: Returns current WhatsApp login status (`qr`, `connecting`, `connected`, `disconnected`).
- `POST /api/connect`: Triggers session initialization and QR code emission.
- `POST /api/logout`: Logs out the current session and purges cached session credentials.
- `POST /api/send`: Sends a text message to a specific phone number.

### Auto-Notifications Triggers:
The Spring Boot backend calls the Node server automatically upon critical events:
1. **Welcome Message**: Triggered when a new patient is registered, dispatching clinical registration information.
2. **Billing Notice**: Dispatches a digital receipt when a bill payment status changes to `Paid`.
3. **Prescription summary**: Dispatches medication details when a doctor saves a prescription.

---

## 🚀 4. Deployment & Build Pipeline

The production pipeline is designed to bundle the React frontend and package it into the Spring Boot backend jar for single-port deployments.

### Frontend Compilation:
```bash
# In pixel-hms-frontend/
npm run build
```
This generates optimized HTML, CSS, and JS chunks under the `dist/` directory.

### Static Resource Copy:
```powershell
# Clears the backend static assets directory and copies built assets
Remove-Item -Path ../pixel-hms/src/main/resources/static/* -Recurse -Force
Copy-Item -Path ./dist/* -Destination ../pixel-hms/src/main/resources/static -Recurse -Force
```

### Spring Boot Package:
The Spring Boot app uses `WelcomePageHandlerMapping` to automatically serve `index.html` from `classpath:/static/` as the homepage.
```bash
# In pixel-hms/
mvn clean package
```
This compiles the application and resources into a single executable JAR file.

---

## ⚠️ 5. Secret Protection & Scanning guidelines
- **Push Protection**: Never commit environment files (`.env`) or scripts containing active API secrets (such as Supabase service role keys).
- **Credential Storage**: Use system environment variables or the Spring Boot active profile yaml files (`application-prod.yml`) containing placeholder variables (e.g. `${SPRING_DATASOURCE_URL}`) resolved at runtime.
