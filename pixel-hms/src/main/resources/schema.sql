-- DDL for Hospital Management System (Supabase Backend)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create tables
create table if not exists public.clinics (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.roles (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    role_id uuid references public.roles(id) on delete restrict,
    clinic_id uuid references public.clinics(id) on delete cascade,
    full_name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.patients (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    uhid text not null,
    patient_name text not null,
    date_of_birth date not null,
    gender text not null,
    blood_group text,
    mobile text not null,
    relation_name text,
    address_line_1 text,
    abha_id text,
    abha_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.doctors (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    user_id uuid references public.users(id) on delete cascade,
    doctor_name text not null,
    specialization text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.appointments (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    patient_id uuid references public.patients(id) on delete cascade not null,
    doctor_id uuid references public.doctors(id) on delete cascade not null,
    appointment_date date not null,
    appointment_time time not null,
    status text not null default 'Scheduled',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.visits (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    patient_id uuid references public.patients(id) on delete cascade not null,
    doctor_id uuid references public.doctors(id) on delete cascade not null,
    visit_date date not null default current_date,
    visit_type text not null default 'OPD',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.prescriptions (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    visit_id uuid references public.visits(id) on delete cascade,
    doctor_id uuid references public.doctors(id) on delete cascade not null,
    patient_id uuid references public.patients(id) on delete cascade not null,
    prescription_date date not null default current_date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.prescription_items (
    id uuid primary key default uuid_generate_v4(),
    prescription_id uuid references public.prescriptions(id) on delete cascade not null,
    medicine_name text not null,
    dosage text not null,
    frequency text not null,
    duration text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.bills (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    patient_id uuid references public.patients(id) on delete cascade not null,
    bill_date date not null default current_date,
    total_amount numeric(12,2) not null default 0.00,
    status text not null default 'Unpaid',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.bill_items (
    id uuid primary key default uuid_generate_v4(),
    bill_id uuid references public.bills(id) on delete cascade not null,
    item_name text not null,
    quantity integer not null default 1,
    unit_price numeric(12,2) not null,
    amount numeric(12,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.payments (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    bill_id uuid references public.bills(id) on delete cascade not null,
    payment_date date not null default current_date,
    amount_paid numeric(12,2) not null,
    payment_mode text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Triggers for auto updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at_clinics before update on public.clinics for each row execute function public.handle_updated_at();
create trigger set_updated_at_roles before update on public.roles for each row execute function public.handle_updated_at();
create trigger set_updated_at_users before update on public.users for each row execute function public.handle_updated_at();
create trigger set_updated_at_patients before update on public.patients for each row execute function public.handle_updated_at();
create trigger set_updated_at_doctors before update on public.doctors for each row execute function public.handle_updated_at();
create trigger set_updated_at_appointments before update on public.appointments for each row execute function public.handle_updated_at();
create trigger set_updated_at_visits before update on public.visits for each row execute function public.handle_updated_at();
create trigger set_updated_at_prescriptions before update on public.prescriptions for each row execute function public.handle_updated_at();
create trigger set_updated_at_prescription_items before update on public.prescription_items for each row execute function public.handle_updated_at();
create trigger set_updated_at_bills before update on public.bills for each row execute function public.handle_updated_at();
create trigger set_updated_at_bill_items before update on public.bill_items for each row execute function public.handle_updated_at();
create trigger set_updated_at_payments before update on public.payments for each row execute function public.handle_updated_at();


-- RLS Configuration
alter table public.clinics enable row level security;
alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.visits enable row level security;
alter table public.prescriptions enable row level security;
alter table public.prescription_items enable row level security;
alter table public.bills enable row level security;
alter table public.bill_items enable row level security;
alter table public.payments enable row level security;

-- Helper functions for policies
create or replace function public.get_current_user_clinic()
returns uuid as $$
    select clinic_id from public.users where id = auth.uid();
$$ language sql security definer;

create or replace function public.get_current_user_role()
returns text as $$
    select r.name from public.users u
    join public.roles r on u.role_id = r.id
    where u.id = auth.uid();
$$ language sql security definer;

-- RLS Policies
-- Roles & Clinics
create policy "Allow read on roles" on public.roles for select using (true);
create policy "Allow read on clinics" on public.clinics for select using (true);
create policy "Allow users to read own details" on public.users for select using (id = auth.uid());

-- Clinic filter policies for core tables
-- Patients
create policy "Admin clinic full access on patients" on public.patients for all
    using (clinic_id = public.get_current_user_clinic());
create policy "Receptionist clinic manage on patients" on public.patients for all
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Receptionist');
create policy "Doctor clinic read on patients" on public.patients for select
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Doctor');

-- Doctors
create policy "Clinic doctor view" on public.doctors for select
    using (clinic_id = public.get_current_user_clinic());
create policy "Admin doctor manage" on public.doctors for all
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Admin');

-- Appointments
create policy "Admin clinic appointments" on public.appointments for all
    using (clinic_id = public.get_current_user_clinic());
create policy "Receptionist manage appointments" on public.appointments for all
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Receptionist');
create policy "Doctor view appointments" on public.appointments for select
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Doctor');

-- Visits
create policy "Admin clinic visits" on public.visits for all
    using (clinic_id = public.get_current_user_clinic());
create policy "Receptionist manage visits" on public.visits for all
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Receptionist');
create policy "Doctor manage visits" on public.visits for all
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Doctor');

-- Prescriptions
create policy "Admin clinic prescriptions" on public.prescriptions for all
    using (clinic_id = public.get_current_user_clinic());
create policy "Doctor manage prescriptions" on public.prescriptions for all
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Doctor');
create policy "Pharmacist view prescriptions" on public.prescriptions for select
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Pharmacist');

-- Prescription Items
create policy "Admin items access" on public.prescription_items for all
    using (prescription_id in (select id from public.prescriptions where clinic_id = public.get_current_user_clinic()));
create policy "Doctor items access" on public.prescription_items for all
    using (prescription_id in (select id from public.prescriptions where clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Doctor'));
create policy "Pharmacist items view" on public.prescription_items for select
    using (prescription_id in (select id from public.prescriptions where clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Pharmacist'));

-- Bills
create policy "Admin clinic bills" on public.bills for all
    using (clinic_id = public.get_current_user_clinic());
create policy "Receptionist manage bills" on public.bills for all
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Receptionist');
create policy "Pharmacist view bills" on public.bills for select
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Pharmacist');

-- Bill Items
create policy "Admin bill items" on public.bill_items for all
    using (bill_id in (select id from public.bills where clinic_id = public.get_current_user_clinic()));
create policy "Receptionist bill items" on public.bill_items for all
    using (bill_id in (select id from public.bills where clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Receptionist'));
create policy "Pharmacist bill items select" on public.bill_items for select
    using (bill_id in (select id from public.bills where clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Pharmacist'));

-- Payments
create policy "Admin clinic payments" on public.payments for all
    using (clinic_id = public.get_current_user_clinic());
create policy "Receptionist manage payments" on public.payments for all
    using (clinic_id = public.get_current_user_clinic() and public.get_current_user_role() = 'Receptionist');
