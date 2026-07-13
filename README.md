# Ashirwad Hospital Management System (HMS)

Welcome to the **Ashirwad Hospital Management System (HMS)** — a modern, state-of-the-art clinic companion and hospital administration portal. This platform features automated patient check-in, inpatient bed management, billing desks, pharmaceutical/laboratory inventory, and full-featured WhatsApp CRM capabilities.

---

## 🏗️ Architecture Design & System Flow

The HMS is structured as a **decoupled, multi-service architecture** designed for high reliability, performance, and offline-first availability. It runs natively using a local PostgreSQL database with a fallback profile for cloud Supabase PostgreSQL databases.

```mermaid
graph TD
    %% Client/User interactions
    User((Hospital Staff / Doctor)) -->|HTTP/WS| Frontend[React + Vite Frontend (Port 5173 / 8080)]
    
    %% Internal flows
    subgraph Local Services
        Frontend -->|REST APIs| SpringBoot[Spring Boot Backend (Port 8080)]
        Frontend -->|HTTP Requests| ExpressNode[WhatsApp Node Server (Port 3001)]
        SpringBoot -->|REST / API Check| ExpressNode
        SpringBoot -->|JPA/JDBC| LocalDB[(Local PostgreSQL - Port 5432)]
    end

    %% External integration
    ExpressNode -->|Baileys Protocol| WhatsAppNet[WhatsApp Web API]
```

### Core Architecture Components

1. **Frontend App (`pixel-hms-frontend`)**: A fast, responsive single-page application built using React 18, TypeScript, TailwindCSS, and Lucide icons.
   - Built to run in development mode (hot reloading on port `5173`) or served statically in production from the Spring Boot embedded Tomcat server (port `8080`).
   - Replaced direct Supabase DB requests with REST API calls pointing directly to the local backend to enable complete offline/local operations.

2. **Backend API Service (`pixel-hms`)**: An enterprise-grade REST service powered by Spring Boot (v3.2.5), Spring Security, Hibernate, and Maven.
   - Protects critical administration endpoints using stateless JWT token security.
   - Automatically handles auditing of activities (logs stored inside the `audit_logs` database table).
   - Pre-packaged with database schemas, triggers, and sequences inside `src/main/resources/schema.sql`.

3. **WhatsApp Integration Daemon (`whatsapp-server`)**: A lightweight Node.js/Express service that hooks into the Baileys protocol to host virtual WhatsApp sessions.
   - Emits a dynamic QR code for staff authentication.
   - Auto-notifies patients upon registration, schedules check-in alerts, and manages auto-reply rules.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Lucide Icons | Responsive UI, SPA Routing, and Fast Hot-Reload |
| **Backend** | Java 17, Spring Boot 3.2.5, JPA, Hibernate | REST APIs, Security, Audit Logs, Business logic |
| **Database** | PostgreSQL 15, Hikari Connection Pool | Structured relational storage, schemas, triggers |
| **Integrations** | Express.js, Baileys Protocol, Pino Logger | Dynamic virtual WhatsApp CRM engine |

---

## 📂 Folder Structure

```
ashirwad-hospital/
├── README.md                           # Main project documentation (This file)
├── docker-compose.yml                  # Container configuration for local testing
├── local_dump.sql                      # Database schema dumps
├── local_dump_inserts.sql              # Core initial inserts and static master data
├── supabase_migration.sql              # Supabase production migration script
├── pixel-hms-frontend/                 # React Single Page Application
│   ├── src/
│   │   ├── components/                 # Administrative console views (Front Desk, Doctor, Ward, Billing, CRM)
│   │   ├── services/                   # Client-side endpoints & authentication
│   │   ├── utils/                      # Helper scripts (hmsUtils.ts)
│   │   └── App.tsx                     # Routing and Dashboard Entry point
│   ├── package.json
│   └── vite.config.ts                  # Vite configuration & Proxy middleware
├── pixel-hms/                          # Spring Boot Backend Project
│   ├── src/main/java/com/pixelhms/
│   │   ├── controller/                 # REST Controller endpoints (Patient, OP, Billing, IP, CRMS)
│   │   ├── entity/                     # JPA Models (Patient, Doctor, Bed, Bill, AuditLog)
│   │   ├── repository/                 # Database Query repositories
│   │   └── service/                    # Business services (WhatsApp Service, Billing Service)
│   ├── src/main/resources/
│   │   ├── static/                     # Built frontend assets served by Tomcat
│   │   ├── application-dev.yml         # Local Postgres database configuration
│   │   ├── application-prod.yml        # Cloud database credentials configuration
│   │   └── schema.sql                  # Main DDL & Sequence script
│   └── pom.xml                         # Maven dependencies & Plugins
└── whatsapp-server/                    # WhatsApp CRM NodeJS Daemon
    ├── whatsapp-server.js              # Server entry point (Express, QR generator, API routers)
    └── package.json
```

---

## ⚙️ Local Setup & Setup Guide

Ensure you have **Java 17 (JDK)**, **Node.js (v20+)**, **Apache Maven**, and **PostgreSQL** installed locally.

### 1. Database Initialization
Verify PostgreSQL is running locally on port `5432`. Create a database named `pixelhms` and run the initial schemas:
```sql
CREATE DATABASE pixelhms;
```
*(Hibernate `ddl-auto: update` is active, so the backend will automatically generate missing tables and schemas upon initial dev profile run).*

### 2. Start the WhatsApp Server
Navigate to the WhatsApp CRM directory, install dependencies, and launch the service:
```bash
cd whatsapp-server
npm install
npm start
```
*The server will start listening on [http://localhost:3001](http://localhost:3001).*

### 3. Start the Spring Boot Backend
Navigate to the backend directory, specify the active `dev` profile (points to your local database), and run:
```bash
cd pixel-hms
$env:SPRING_PROFILES_ACTIVE="dev"
mvn spring-boot:run
```
*The backend server will launch Tomcat on port `8080`. The application is fully accessible at [http://localhost:8080](http://localhost:8080).*

### 4. Optional: Run Frontend Dev Server (For UI development)
To run the hot-reloading frontend dev server on port `5173` (proxies all `/api` requests to Tomcat on `8080` automatically):
```bash
cd pixel-hms-frontend
npm install
npm run dev
```

---

## 🔐 Credentials & Quick Sign-in

The HMS is pre-configured with the following simulated roles for testing:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin123` | Full Master controls, reports, settings, audits |
| **Consulting Doctor** | `dr_rajesh` | `doctor123` | Prescription sheets, patient clinical records, OPCS |
| **Front Desk Operator** | `front_desk` | `front123` | Patient registration, appointments, check-ins |
| **Ward Nurse** | `nurse_jane` | `nurse123` | Bed admissions, vitals recording, daily notes |
| **Pharmacist** | `pharmacist` | `pharmacy123` | Pharmacy inventory tracking, medication sales |
| **Billing Accountant** | `accountant_bill` | `bill123` | Bill generation, discounts, payments, financial audits |

---

## 🛡️ Security & Audits
- **JWT Authentication**: All secure REST API calls require an `Authorization: Bearer <JWT_TOKEN>` header.
- **Activity logs**: Actions such as registering patients, updating beds, or generating bills write a permanent audit entry to the database containing timestamps, username, action type, IP address, and operation status.
