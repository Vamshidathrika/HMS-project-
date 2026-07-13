DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.beds CASCADE;
DROP TABLE IF EXISTS public.bill_items CASCADE;
DROP TABLE IF EXISTS public.bills CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.daily_notes CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.financial_transactions CASCADE;
DROP TABLE IF EXISTS public.ip_registrations CASCADE;
DROP TABLE IF EXISTS public.lab_results CASCADE;
DROP TABLE IF EXISTS public.op_investigations CASCADE;
DROP TABLE IF EXISTS public.op_registrations CASCADE;
DROP TABLE IF EXISTS public.ot_bookings CASCADE;
DROP TABLE IF EXISTS public.patient_feedbacks CASCADE;
DROP TABLE IF EXISTS public.patient_followups CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.pharmacy_inventory CASCADE;
DROP TABLE IF EXISTS public.pharmacy_sale_items CASCADE;
DROP TABLE IF EXISTS public.pharmacy_sales CASCADE;
DROP TABLE IF EXISTS public.prescription_items CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.surgery_records CASCADE;
DROP TABLE IF EXISTS public.test_masters CASCADE;
DROP TABLE IF EXISTS public.tpa_claims CASCADE;
DROP TABLE IF EXISTS public.tpa_companies CASCADE;
DROP TABLE IF EXISTS public.uhid_sequences CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.wards CASCADE;
DROP TABLE IF EXISTS public.whatsapp_logs CASCADE;
DROP TABLE IF EXISTS public.whatsapp_templates CASCADE;
DROP TABLE IF EXISTS public.table_name CASCADE;
--
-- PostgreSQL database dump
--

-- \restrict 56dTqugRjudfEoWlRkraxrbz668d83cRF2RSz20dwDT18x1cezlvxlPHC0WUV7f

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    action character varying(50) NOT NULL,
    details text NOT NULL,
    ip_address character varying(45),
    role character varying(30) NOT NULL,
    status character varying(20) NOT NULL,
    "timestamp" timestamp(6) without time zone NOT NULL,
    username character varying(50) NOT NULL
);


-- ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: beds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beds (
    id bigint NOT NULL,
    bed_number character varying(20) NOT NULL,
    room_type character varying(50) NOT NULL,
    status character varying(30) NOT NULL,
    ward_id bigint NOT NULL
);


-- ALTER TABLE public.beds OWNER TO postgres;

--
-- Name: beds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.beds_id_seq OWNER TO postgres;

--
-- Name: beds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beds_id_seq OWNED BY public.beds.id;


--
-- Name: bill_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_items (
    id bigint NOT NULL,
    item_name character varying(150) NOT NULL,
    quantity integer NOT NULL,
    total double precision NOT NULL,
    unit_price double precision NOT NULL,
    bill_id bigint NOT NULL
);


-- ALTER TABLE public.bill_items OWNER TO postgres;

--
-- Name: bill_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bill_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.bill_items_id_seq OWNER TO postgres;

--
-- Name: bill_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bill_items_id_seq OWNED BY public.bill_items.id;


--
-- Name: bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills (
    id bigint NOT NULL,
    advance_adjusted double precision,
    bill_date date NOT NULL,
    bill_type character varying(20) NOT NULL,
    cash_drawer character varying(50),
    discount_amount double precision,
    discount_percent double precision,
    net_payable double precision NOT NULL,
    payment_mode character varying(30) NOT NULL,
    remarks text,
    status character varying(20) NOT NULL,
    total_amount double precision NOT NULL,
    uhid character varying(20) NOT NULL,
    patient_id bigint NOT NULL
);


-- ALTER TABLE public.bills OWNER TO postgres;

--
-- Name: bills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.bills_id_seq OWNER TO postgres;

--
-- Name: bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bills_id_seq OWNED BY public.bills.id;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    id bigint NOT NULL,
    launch_date timestamp(6) without time zone,
    message_text text NOT NULL,
    status character varying(20) NOT NULL,
    target_group character varying(20) NOT NULL,
    title character varying(150) NOT NULL
);


-- ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.campaigns_id_seq OWNER TO postgres;

--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- Name: daily_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_notes (
    id bigint NOT NULL,
    bp character varying(20),
    note_date_time timestamp(6) without time zone NOT NULL,
    progress_note text,
    pulse integer,
    recorded_by character varying(150),
    respiratory_rate integer,
    spo2 integer,
    temperature double precision,
    treatment_notes text,
    ip_registration_id bigint NOT NULL
);


-- ALTER TABLE public.daily_notes OWNER TO postgres;

--
-- Name: daily_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_notes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.daily_notes_id_seq OWNER TO postgres;

--
-- Name: daily_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_notes_id_seq OWNED BY public.daily_notes.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    dept_code character varying(20) NOT NULL,
    dept_name character varying(100) NOT NULL,
    dept_type character varying(50),
    is_active boolean
);


-- ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id bigint NOT NULL,
    consulting_fee numeric(10,2),
    doctor_code character varying(20) NOT NULL,
    email character varying(100),
    mobile character varying(15),
    name character varying(150) NOT NULL,
    qualification character varying(100),
    specialization character varying(100),
    department_id bigint
);


-- ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_transactions (
    id bigint NOT NULL,
    amount double precision NOT NULL,
    category character varying(50) NOT NULL,
    patient_name character varying(150),
    payment_mode character varying(30) NOT NULL,
    reference_id character varying(50),
    remarks text,
    tx_date date NOT NULL,
    tx_time time(6) without time zone NOT NULL,
    tx_type character varying(20) NOT NULL,
    uhid character varying(20)
);


-- ALTER TABLE public.financial_transactions OWNER TO postgres;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.financial_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.financial_transactions_id_seq OWNER TO postgres;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.financial_transactions_id_seq OWNED BY public.financial_transactions.id;


--
-- Name: ip_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ip_registrations (
    id bigint NOT NULL,
    admission_date date,
    admission_time time(6) without time zone,
    admission_type character varying(50),
    advance_paid numeric(12,2),
    bed_number character varying(20),
    diagnosis_provisional text,
    discharge_date date,
    discharge_instructions text,
    discharge_notes text,
    discharge_status character varying(50),
    ip_number character varying(50) NOT NULL,
    room_type character varying(50),
    status character varying(30) NOT NULL,
    total_bill numeric(12,2),
    uhid character varying(20) NOT NULL,
    admitting_doctor_id bigint,
    department_id bigint,
    patient_id bigint NOT NULL,
    ward_id bigint
);


-- ALTER TABLE public.ip_registrations OWNER TO postgres;

--
-- Name: ip_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ip_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.ip_registrations_id_seq OWNER TO postgres;

--
-- Name: ip_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ip_registrations_id_seq OWNED BY public.ip_registrations.id;


--
-- Name: lab_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_results (
    id bigint NOT NULL,
    lab_technician character varying(100),
    reference_range character varying(100),
    remarks text,
    result_value character varying(100) NOT NULL,
    verification_date_time timestamp(6) without time zone,
    verified_by character varying(100),
    investigation_id bigint NOT NULL
);


-- ALTER TABLE public.lab_results OWNER TO postgres;

--
-- Name: lab_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.lab_results_id_seq OWNER TO postgres;

--
-- Name: lab_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_results_id_seq OWNED BY public.lab_results.id;


--
-- Name: op_investigations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.op_investigations (
    id bigint NOT NULL,
    order_date_time timestamp(6) without time zone NOT NULL,
    sample_collected boolean,
    status character varying(30) NOT NULL,
    test_category character varying(50) NOT NULL,
    test_name character varying(150) NOT NULL,
    uhid character varying(20) NOT NULL,
    ordering_doctor_id bigint NOT NULL,
    patient_id bigint NOT NULL
);


-- ALTER TABLE public.op_investigations OWNER TO postgres;

--
-- Name: op_investigations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.op_investigations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.op_investigations_id_seq OWNER TO postgres;

--
-- Name: op_investigations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.op_investigations_id_seq OWNED BY public.op_investigations.id;


--
-- Name: op_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.op_registrations (
    id bigint NOT NULL,
    chief_complaint text,
    entry_number integer NOT NULL,
    payment_status character varying(20),
    status character varying(20),
    token_number integer,
    uhid character varying(20) NOT NULL,
    visit_date date NOT NULL,
    visit_time time(6) without time zone,
    visit_type character varying(20),
    assigned_doctor_id bigint,
    department_id bigint,
    patient_id bigint NOT NULL,
    age_unit character varying(10),
    age_value integer,
    blood_pressure character varying(15),
    consulting_fee double precision,
    height character varying(10),
    patient_category character varying(50),
    payment_mode character varying(20),
    pulse_rate character varying(10),
    referring_doctor character varying(100),
    remarks text,
    respiratory_rate character varying(10),
    spo2 character varying(10),
    temp_f character varying(10),
    weight character varying(10)
);


-- ALTER TABLE public.op_registrations OWNER TO postgres;

--
-- Name: op_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.op_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.op_registrations_id_seq OWNER TO postgres;

--
-- Name: op_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.op_registrations_id_seq OWNED BY public.op_registrations.id;


--
-- Name: ot_bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ot_bookings (
    id bigint NOT NULL,
    ot_room character varying(50) NOT NULL,
    pre_op_check_completed boolean,
    status character varying(30) NOT NULL,
    surgery_date date NOT NULL,
    surgery_name character varying(150) NOT NULL,
    surgery_time time(6) without time zone NOT NULL,
    uhid character varying(20) NOT NULL,
    patient_id bigint NOT NULL,
    surgeon_doctor_id bigint NOT NULL
);


-- ALTER TABLE public.ot_bookings OWNER TO postgres;

--
-- Name: ot_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ot_bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.ot_bookings_id_seq OWNER TO postgres;

--
-- Name: ot_bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ot_bookings_id_seq OWNED BY public.ot_bookings.id;


--
-- Name: patient_feedbacks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_feedbacks (
    id bigint NOT NULL,
    comments text,
    patient_name character varying(150) NOT NULL,
    rating integer NOT NULL,
    submission_date timestamp(6) without time zone,
    uhid character varying(20) NOT NULL
);


-- ALTER TABLE public.patient_feedbacks OWNER TO postgres;

--
-- Name: patient_feedbacks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_feedbacks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.patient_feedbacks_id_seq OWNER TO postgres;

--
-- Name: patient_feedbacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_feedbacks_id_seq OWNED BY public.patient_feedbacks.id;


--
-- Name: patient_followups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_followups (
    id bigint NOT NULL,
    doctor_name character varying(150) NOT NULL,
    notes text,
    patient_name character varying(150) NOT NULL,
    scheduled_date date NOT NULL,
    status character varying(20) NOT NULL,
    uhid character varying(20) NOT NULL
);


-- ALTER TABLE public.patient_followups OWNER TO postgres;

--
-- Name: patient_followups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_followups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.patient_followups_id_seq OWNER TO postgres;

--
-- Name: patient_followups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_followups_id_seq OWNED BY public.patient_followups.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id bigint NOT NULL,
    aadhar_number character varying(12),
    abha_address character varying(50),
    abha_id character varying(50),
    address_line1 character varying(200),
    alternate_mobile character varying(15),
    blood_group character varying(5),
    city character varying(50),
    date_of_birth date,
    email character varying(100),
    gender character varying(10) NOT NULL,
    mobile character varying(15) NOT NULL,
    occupation character varying(50),
    patient_name character varying(150) NOT NULL,
    photo_path character varying(255),
    pincode character varying(10),
    registration_date timestamp(6) without time zone,
    relation_name character varying(150),
    state character varying(50),
    uhid character varying(20) NOT NULL
);


-- ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: pharmacy_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_inventory (
    id bigint NOT NULL,
    batch_number character varying(50) NOT NULL,
    current_stock integer NOT NULL,
    drug_code character varying(30) NOT NULL,
    drug_name character varying(150) NOT NULL,
    expiry_date date NOT NULL,
    purchase_price double precision NOT NULL,
    unit_price double precision NOT NULL
);


-- ALTER TABLE public.pharmacy_inventory OWNER TO postgres;

--
-- Name: pharmacy_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_inventory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.pharmacy_inventory_id_seq OWNER TO postgres;

--
-- Name: pharmacy_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pharmacy_inventory_id_seq OWNED BY public.pharmacy_inventory.id;


--
-- Name: pharmacy_sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_sale_items (
    id bigint NOT NULL,
    quantity integer NOT NULL,
    total double precision NOT NULL,
    unit_price double precision NOT NULL,
    pharmacy_inventory_id bigint NOT NULL,
    pharmacy_sale_id bigint NOT NULL
);


-- ALTER TABLE public.pharmacy_sale_items OWNER TO postgres;

--
-- Name: pharmacy_sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_sale_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.pharmacy_sale_items_id_seq OWNER TO postgres;

--
-- Name: pharmacy_sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pharmacy_sale_items_id_seq OWNED BY public.pharmacy_sale_items.id;


--
-- Name: pharmacy_sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_sales (
    id bigint NOT NULL,
    discount_amount double precision,
    net_payable double precision NOT NULL,
    payment_mode character varying(30),
    payment_status character varying(20) NOT NULL,
    sale_date date NOT NULL,
    total_amount double precision NOT NULL,
    uhid character varying(20),
    patient_id bigint
);


-- ALTER TABLE public.pharmacy_sales OWNER TO postgres;

--
-- Name: pharmacy_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.pharmacy_sales_id_seq OWNER TO postgres;

--
-- Name: pharmacy_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pharmacy_sales_id_seq OWNED BY public.pharmacy_sales.id;


--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_items (
    prescription_id bigint NOT NULL,
    dosage character varying(255),
    duration character varying(255),
    frequency character varying(255),
    instruction character varying(255),
    medicine_name character varying(255)
);


-- ALTER TABLE public.prescription_items OWNER TO postgres;

--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id bigint NOT NULL,
    created_date timestamp(6) without time zone,
    diagnosis text,
    notes text,
    symptoms text,
    doctor_id bigint NOT NULL,
    op_registration_id bigint NOT NULL,
    patient_id bigint NOT NULL
);


-- ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.prescriptions_id_seq OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescriptions_id_seq OWNED BY public.prescriptions.id;


--
-- Name: surgery_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.surgery_records (
    id bigint NOT NULL,
    anesthesia_type character varying(50),
    assistant_surgeon character varying(150),
    complications text,
    end_time time(6) without time zone,
    post_op_notes text,
    start_time time(6) without time zone,
    surgery_notes text,
    ot_booking_id bigint NOT NULL
);


-- ALTER TABLE public.surgery_records OWNER TO postgres;

--
-- Name: surgery_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.surgery_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.surgery_records_id_seq OWNER TO postgres;

--
-- Name: surgery_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.surgery_records_id_seq OWNED BY public.surgery_records.id;


--
-- Name: test_masters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_masters (
    id bigint NOT NULL,
    is_active boolean,
    price double precision NOT NULL,
    test_category character varying(50) NOT NULL,
    test_code character varying(20) NOT NULL,
    test_name character varying(150) NOT NULL
);


-- ALTER TABLE public.test_masters OWNER TO postgres;

--
-- Name: test_masters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_masters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.test_masters_id_seq OWNER TO postgres;

--
-- Name: test_masters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_masters_id_seq OWNED BY public.test_masters.id;


--
-- Name: tpa_claims; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tpa_claims (
    id bigint NOT NULL,
    approval_date date,
    approved_amount double precision,
    claim_amount double precision NOT NULL,
    ip_number character varying(50) NOT NULL,
    pre_auth_code character varying(50),
    pre_auth_status character varying(30) NOT NULL,
    remarks text,
    uhid character varying(20) NOT NULL,
    ip_registration_id bigint NOT NULL,
    tpa_company_id bigint NOT NULL
);


-- ALTER TABLE public.tpa_claims OWNER TO postgres;

--
-- Name: tpa_claims_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tpa_claims_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.tpa_claims_id_seq OWNER TO postgres;

--
-- Name: tpa_claims_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tpa_claims_id_seq OWNED BY public.tpa_claims.id;


--
-- Name: tpa_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tpa_companies (
    id bigint NOT NULL,
    contact_person character varying(100),
    email character varying(100),
    is_active boolean NOT NULL,
    mobile character varying(20),
    name character varying(150) NOT NULL
);


-- ALTER TABLE public.tpa_companies OWNER TO postgres;

--
-- Name: tpa_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tpa_companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.tpa_companies_id_seq OWNER TO postgres;

--
-- Name: tpa_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tpa_companies_id_seq OWNED BY public.tpa_companies.id;


--
-- Name: uhid_sequences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.uhid_sequences (
    facility_code character varying(255) NOT NULL,
    current_sequence bigint
);


-- ALTER TABLE public.uhid_sequences OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    full_name character varying(100) NOT NULL,
    is_active boolean NOT NULL,
    password character varying(100) NOT NULL,
    role character varying(30) NOT NULL,
    username character varying(50) NOT NULL
);


-- ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wards (
    id bigint NOT NULL,
    code character varying(20) NOT NULL,
    is_active boolean,
    name character varying(100) NOT NULL
);


-- ALTER TABLE public.wards OWNER TO postgres;

--
-- Name: wards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.wards_id_seq OWNER TO postgres;

--
-- Name: wards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wards_id_seq OWNED BY public.wards.id;


--
-- Name: whatsapp_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_logs (
    id bigint NOT NULL,
    error_message character varying(255),
    message_text text NOT NULL,
    mobile character varying(15) NOT NULL,
    patient_name character varying(150) NOT NULL,
    status character varying(20) NOT NULL,
    template_name character varying(50) NOT NULL,
    "timestamp" timestamp(6) without time zone NOT NULL,
    uhid character varying(20) NOT NULL
);


-- ALTER TABLE public.whatsapp_logs OWNER TO postgres;

--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.whatsapp_logs_id_seq OWNER TO postgres;

--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.whatsapp_logs_id_seq OWNED BY public.whatsapp_logs.id;


--
-- Name: whatsapp_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_templates (
    id bigint NOT NULL,
    is_active boolean NOT NULL,
    name character varying(50) NOT NULL,
    template_text text NOT NULL
);


-- ALTER TABLE public.whatsapp_templates OWNER TO postgres;

--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.whatsapp_templates_id_seq OWNER TO postgres;

--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.whatsapp_templates_id_seq OWNED BY public.whatsapp_templates.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: beds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beds ALTER COLUMN id SET DEFAULT nextval('public.beds_id_seq'::regclass);


--
-- Name: bill_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items ALTER COLUMN id SET DEFAULT nextval('public.bill_items_id_seq'::regclass);


--
-- Name: bills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills ALTER COLUMN id SET DEFAULT nextval('public.bills_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: daily_notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notes ALTER COLUMN id SET DEFAULT nextval('public.daily_notes_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: financial_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_transactions ALTER COLUMN id SET DEFAULT nextval('public.financial_transactions_id_seq'::regclass);


--
-- Name: ip_registrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ip_registrations ALTER COLUMN id SET DEFAULT nextval('public.ip_registrations_id_seq'::regclass);


--
-- Name: lab_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_results ALTER COLUMN id SET DEFAULT nextval('public.lab_results_id_seq'::regclass);


--
-- Name: op_investigations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.op_investigations ALTER COLUMN id SET DEFAULT nextval('public.op_investigations_id_seq'::regclass);


--
-- Name: op_registrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.op_registrations ALTER COLUMN id SET DEFAULT nextval('public.op_registrations_id_seq'::regclass);


--
-- Name: ot_bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ot_bookings ALTER COLUMN id SET DEFAULT nextval('public.ot_bookings_id_seq'::regclass);


--
-- Name: patient_feedbacks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_feedbacks ALTER COLUMN id SET DEFAULT nextval('public.patient_feedbacks_id_seq'::regclass);


--
-- Name: patient_followups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_followups ALTER COLUMN id SET DEFAULT nextval('public.patient_followups_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: pharmacy_inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_inventory ALTER COLUMN id SET DEFAULT nextval('public.pharmacy_inventory_id_seq'::regclass);


--
-- Name: pharmacy_sale_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_items ALTER COLUMN id SET DEFAULT nextval('public.pharmacy_sale_items_id_seq'::regclass);


--
-- Name: pharmacy_sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sales ALTER COLUMN id SET DEFAULT nextval('public.pharmacy_sales_id_seq'::regclass);


--
-- Name: prescriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN id SET DEFAULT nextval('public.prescriptions_id_seq'::regclass);


--
-- Name: surgery_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surgery_records ALTER COLUMN id SET DEFAULT nextval('public.surgery_records_id_seq'::regclass);


--
-- Name: test_masters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_masters ALTER COLUMN id SET DEFAULT nextval('public.test_masters_id_seq'::regclass);


--
-- Name: tpa_claims id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tpa_claims ALTER COLUMN id SET DEFAULT nextval('public.tpa_claims_id_seq'::regclass);


--
-- Name: tpa_companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tpa_companies ALTER COLUMN id SET DEFAULT nextval('public.tpa_companies_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wards ALTER COLUMN id SET DEFAULT nextval('public.wards_id_seq'::regclass);


--
-- Name: whatsapp_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_logs ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_logs_id_seq'::regclass);


--
-- Name: whatsapp_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_templates ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_templates_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: beds; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.beds VALUES (1, 'MMW-01', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (2, 'FMW-01', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (3, 'MMW-02', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (4, 'FMW-02', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (5, 'MMW-03', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (6, 'FMW-03', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (7, 'MMW-04', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (8, 'FMW-04', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (9, 'MMW-05', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (10, 'FMW-05', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (11, 'MMW-06', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (12, 'FMW-06', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (13, 'MMW-07', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (14, 'FMW-07', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (15, 'MMW-08', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (16, 'FMW-08', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (17, 'MMW-09', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (18, 'FMW-09', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (19, 'MMW-10', 'General', 'Available', 1);
INSERT INTO public.beds VALUES (20, 'FMW-10', 'General', 'Available', 2);
INSERT INTO public.beds VALUES (21, 'ICU-01', 'ICU', 'Available', 3);
INSERT INTO public.beds VALUES (22, 'ICU-02', 'ICU', 'Available', 3);
INSERT INTO public.beds VALUES (23, 'ICU-03', 'ICU', 'Available', 3);
INSERT INTO public.beds VALUES (24, 'ICU-04', 'ICU', 'Available', 3);
INSERT INTO public.beds VALUES (25, 'ICU-05', 'ICU', 'Available', 3);
INSERT INTO public.beds VALUES (26, 'PED-01', 'General', 'Available', 4);
INSERT INTO public.beds VALUES (27, 'PED-02', 'General', 'Available', 4);
INSERT INTO public.beds VALUES (28, 'PED-03', 'General', 'Available', 4);
INSERT INTO public.beds VALUES (29, 'PED-04', 'General', 'Available', 4);
INSERT INTO public.beds VALUES (30, 'PED-05', 'General', 'Available', 4);
INSERT INTO public.beds VALUES (31, 'PVT-01', 'Private', 'Available', 5);
INSERT INTO public.beds VALUES (32, 'PVT-02', 'Private', 'Available', 5);
INSERT INTO public.beds VALUES (33, 'PVT-03', 'Private', 'Available', 5);
INSERT INTO public.beds VALUES (34, 'PVT-04', 'Private', 'Available', 5);
INSERT INTO public.beds VALUES (35, 'PVT-05', 'Private', 'Available', 5);


--
-- Data for Name: bill_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: daily_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.departments VALUES (1, 'GENMED', 'General Medicine', 'Clinical', true);
INSERT INTO public.departments VALUES (2, 'PED', 'Pediatrics', 'Clinical', true);
INSERT INTO public.departments VALUES (3, 'CARD', 'Cardiology', 'Clinical', true);
INSERT INTO public.departments VALUES (4, 'ORTHO', 'Orthopedics', 'Clinical', true);


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.doctors VALUES (1, 500.00, 'DOC001', 'rajesh@pixelhms.com', '9876543201', 'Dr. Rajesh Sharma', 'MD (General Medicine)', 'Consulting Physician', 1);
INSERT INTO public.doctors VALUES (2, 400.00, 'DOC002', 'priya@pixelhms.com', '9876543202', 'Dr. Priya Patel', 'MD (Pediatrics)', 'Child Specialist', 2);
INSERT INTO public.doctors VALUES (3, 800.00, 'DOC003', 'amit@pixelhms.com', '9876543203', 'Dr. Amit Verma', 'DM (Cardiology)', 'Interventional Cardiologist', 3);
INSERT INTO public.doctors VALUES (4, 600.00, 'DOC004', 'sunita@pixelhms.com', '9876543204', 'Dr. Sunita Rao', 'MS (Orthopedics)', 'Joint Replacement Surgeon', 4);


--
-- Data for Name: financial_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ip_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: lab_results; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: op_investigations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: op_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ot_bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: patient_feedbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: patient_followups; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: pharmacy_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pharmacy_inventory VALUES (1, 'BAT-P887', 150, 'DRG001', 'Paracetamol 650mg', '2028-06-15', 6, 10);
INSERT INTO public.pharmacy_inventory VALUES (2, 'BAT-A992', 100, 'DRG002', 'Amoxicillin 500mg', '2027-06-15', 18, 25);
INSERT INTO public.pharmacy_inventory VALUES (3, 'BAT-I552', 200, 'DRG003', 'Ibuprofen 400mg', '2028-06-15', 9, 15);
INSERT INTO public.pharmacy_inventory VALUES (4, 'BAT-C441', 300, 'DRG004', 'Cetirizine 10mg', '2029-06-15', 4, 8);
INSERT INTO public.pharmacy_inventory VALUES (5, 'BAT-M110', 250, 'DRG005', 'Metformin 500mg', '2028-06-15', 7, 12);


--
-- Data for Name: pharmacy_sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: pharmacy_sales; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: surgery_records; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: test_masters; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tpa_claims; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tpa_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tpa_companies VALUES (1, 'Mr. Anand Kumar', 'anand@starhealth.in', true, '9845012345', 'Star Health Insurance');
INSERT INTO public.tpa_companies VALUES (2, 'Ms. Ritu Mehta', 'ritu@hdfcergo.com', true, '9845054321', 'HDFC Ergo General Insurance');
INSERT INTO public.tpa_companies VALUES (3, 'Mr. Vinay Rao', 'vinay@icicilombard.com', true, '9845098765', 'ICICI Lombard');


--
-- Data for Name: uhid_sequences; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.uhid_sequences VALUES ('AH', 0);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (1, 'System Administrator', true, '$2a$10$rQubfDFuuuh1iuOur3NiKeGrdgDHKeoZV6HBcEBoLfvzEsT6tpkaO', 'SuperAdmin', 'admin');
INSERT INTO public.users VALUES (2, 'Dr. Rajesh Sharma', true, '$2a$10$b8YCFs.9bze7Nq0MkZ49YeO217uE5OMm3Cg.FWqvLyYKzgmbHMLD6', 'Doctor', 'dr_rajesh');
INSERT INTO public.users VALUES (3, 'Front Desk Operator', true, '$2a$10$DUtHGMFpkJNE6lqz/naB3.pkH1/4ck0oNfImdBzftDpuSaezcvMnS', 'FrontDesk', 'front_desk');
INSERT INTO public.users VALUES (4, 'Nurse Jane Doe', true, '$2a$10$6T9CE78AJxBPB26IjjgX.OPgRNsYkzAgfM5Qvr3PDIPsfb0AkSn5y', 'Nurse', 'nurse_jane');
INSERT INTO public.users VALUES (5, 'Lead Pharmacist', true, '$2a$10$2WuwaA2gx5b/0xzCugHCFuAfsGX4u4yVPBgM8HRIXyVNpz2R3DQo.', 'Pharmacist', 'pharmacist');
INSERT INTO public.users VALUES (6, 'Accountant Bill', true, '$2a$10$z9D8H3p4.EwLXFEDHRnqhePURzwa6DiSUv5zN47bzkG9XPiknNPSe', 'Accountant', 'accountant_bill');


--
-- Data for Name: wards; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.wards VALUES (1, 'MMW', true, 'Male Medical Ward');
INSERT INTO public.wards VALUES (2, 'FMW', true, 'Female Medical Ward');
INSERT INTO public.wards VALUES (3, 'ICU', true, 'Intensive Care Unit');
INSERT INTO public.wards VALUES (4, 'PEDW', true, 'Pediatric Ward');
INSERT INTO public.wards VALUES (5, 'PVT', true, 'Private Rooms Ward');


--
-- Data for Name: whatsapp_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: whatsapp_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.whatsapp_templates VALUES (1, true, 'Welcome', 'Hello {{name}}! Welcome to Ashirwad Hospital. Your unique patient UHID is {{uhid}}. Thank you for choosing us.');
INSERT INTO public.whatsapp_templates VALUES (2, true, 'OPD Ticket', 'Dear {{name}}, your outpatient visit consultation is confirmed with {{doctor}}. Your queue token number is {{token}}. Please wait for your turn.');
INSERT INTO public.whatsapp_templates VALUES (3, true, 'IP Admission', 'Dear {{name}}, your inpatient admission is complete. Allocated Ward: {{ward}}, Bed: {{bed}}. We wish you a speedy recovery.');
INSERT INTO public.whatsapp_templates VALUES (4, true, 'Bill Invoice', 'Dear {{name}}, your billing invoice {{invoice}} for amount {{amount}} has been successfully generated. Thank you, Ashirwad Hospital.');


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 17, true);


--
-- Name: beds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.beds_id_seq', 35, true);


--
-- Name: bill_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_items_id_seq', 2, true);


--
-- Name: bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bills_id_seq', 1, true);


--
-- Name: campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaigns_id_seq', 1, false);


--
-- Name: daily_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_notes_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 4, true);


--
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctors_id_seq', 4, true);


--
-- Name: financial_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.financial_transactions_id_seq', 1, true);


--
-- Name: ip_registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ip_registrations_id_seq', 1, false);


--
-- Name: lab_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_results_id_seq', 1, false);


--
-- Name: op_investigations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.op_investigations_id_seq', 2, true);


--
-- Name: op_registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.op_registrations_id_seq', 3, true);


--
-- Name: ot_bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ot_bookings_id_seq', 1, false);


--
-- Name: patient_feedbacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_feedbacks_id_seq', 1, false);


--
-- Name: patient_followups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_followups_id_seq', 1, false);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_id_seq', 8, true);


--
-- Name: pharmacy_inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_inventory_id_seq', 6, true);


--
-- Name: pharmacy_sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_sale_items_id_seq', 1, false);


--
-- Name: pharmacy_sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_sales_id_seq', 1, false);


--
-- Name: prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescriptions_id_seq', 1, false);


--
-- Name: surgery_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.surgery_records_id_seq', 1, false);


--
-- Name: test_masters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_masters_id_seq', 1, false);


--
-- Name: tpa_claims_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tpa_claims_id_seq', 1, false);


--
-- Name: tpa_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tpa_companies_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: wards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wards_id_seq', 5, true);


--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.whatsapp_logs_id_seq', 8, true);


--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.whatsapp_templates_id_seq', 4, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: beds beds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_pkey PRIMARY KEY (id);


--
-- Name: bill_items bill_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_pkey PRIMARY KEY (id);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: daily_notes daily_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notes
    ADD CONSTRAINT daily_notes_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: ip_registrations ip_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ip_registrations
    ADD CONSTRAINT ip_registrations_pkey PRIMARY KEY (id);


--
-- Name: lab_results lab_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT lab_results_pkey PRIMARY KEY (id);


--
-- Name: op_investigations op_investigations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.op_investigations
    ADD CONSTRAINT op_investigations_pkey PRIMARY KEY (id);


--
-- Name: op_registrations op_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.op_registrations
    ADD CONSTRAINT op_registrations_pkey PRIMARY KEY (id);


--
-- Name: ot_bookings ot_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ot_bookings
    ADD CONSTRAINT ot_bookings_pkey PRIMARY KEY (id);


--
-- Name: patient_feedbacks patient_feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_feedbacks
    ADD CONSTRAINT patient_feedbacks_pkey PRIMARY KEY (id);


--
-- Name: patient_followups patient_followups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_followups
    ADD CONSTRAINT patient_followups_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: pharmacy_inventory pharmacy_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_inventory
    ADD CONSTRAINT pharmacy_inventory_pkey PRIMARY KEY (id);


--
-- Name: pharmacy_sale_items pharmacy_sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_items
    ADD CONSTRAINT pharmacy_sale_items_pkey PRIMARY KEY (id);


--
-- Name: pharmacy_sales pharmacy_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sales
    ADD CONSTRAINT pharmacy_sales_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: surgery_records surgery_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surgery_records
    ADD CONSTRAINT surgery_records_pkey PRIMARY KEY (id);


--
-- Name: test_masters test_masters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_masters
    ADD CONSTRAINT test_masters_pkey PRIMARY KEY (id);


--
-- Name: tpa_claims tpa_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tpa_claims
    ADD CONSTRAINT tpa_claims_pkey PRIMARY KEY (id);


--
-- Name: tpa_companies tpa_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tpa_companies
    ADD CONSTRAINT tpa_companies_pkey PRIMARY KEY (id);


--
-- Name: uhid_sequences uhid_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uhid_sequences
    ADD CONSTRAINT uhid_sequences_pkey PRIMARY KEY (facility_code);


--
-- Name: whatsapp_templates uk_9d3ygq9tp63dh49au39mku2ej; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT uk_9d3ygq9tp63dh49au39mku2ej UNIQUE (name);


--
-- Name: departments uk_a98yj7l53srcy6e08grm1tw90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT uk_a98yj7l53srcy6e08grm1tw90 UNIQUE (dept_code);


--
-- Name: prescriptions uk_cy7j4mrnh12ls437dfypo3sth; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT uk_cy7j4mrnh12ls437dfypo3sth UNIQUE (op_registration_id);


--
-- Name: surgery_records uk_dyks47xn2kmaxq9m17gphf4gl; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surgery_records
    ADD CONSTRAINT uk_dyks47xn2kmaxq9m17gphf4gl UNIQUE (ot_booking_id);


--
-- Name: lab_results uk_g3rlm7ma79nds9ijmx4ukinh2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT uk_g3rlm7ma79nds9ijmx4ukinh2 UNIQUE (investigation_id);


--
-- Name: test_masters uk_gmxv0vq5near5rykmpjmcir36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_masters
    ADD CONSTRAINT uk_gmxv0vq5near5rykmpjmcir36 UNIQUE (test_code);


--
-- Name: ip_registrations uk_i6q3meb0d0ccyrsspxi4qak2o; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ip_registrations
    ADD CONSTRAINT uk_i6q3meb0d0ccyrsspxi4qak2o UNIQUE (ip_number);


--
-- Name: patients uk_iugs9p7abuu5egd9fmtlx8wdx; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT uk_iugs9p7abuu5egd9fmtlx8wdx UNIQUE (uhid);


--
-- Name: beds uk_j7pgi2mbpbya6m8eu3ysfcut9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT uk_j7pgi2mbpbya6m8eu3ysfcut9 UNIQUE (bed_number);


--
-- Name: doctors uk_m9b9dtrqd29msht6lwqp0y1aw; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT uk_m9b9dtrqd29msht6lwqp0y1aw UNIQUE (doctor_code);


--
-- Name: tpa_companies uk_nnppi5o1yk6quok1xblaq1yb6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tpa_companies
    ADD CONSTRAINT uk_nnppi5o1yk6quok1xblaq1yb6 UNIQUE (name);


--
-- Name: wards uk_ntapeoauvvkx36nfnwsfhmo8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT uk_ntapeoauvvkx36nfnwsfhmo8 UNIQUE (code);


--
-- Name: pharmacy_inventory uk_o5dp1qvqmn2muwh7gi6cllv0r; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_inventory
    ADD CONSTRAINT uk_o5dp1qvqmn2muwh7gi6cllv0r UNIQUE (drug_code);


--
-- Name: users uk_r43af9ap4edm43mmtq01oddj6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_r43af9ap4edm43mmtq01oddj6 UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wards wards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_logs whatsapp_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_logs
    ADD CONSTRAINT whatsapp_logs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_templates whatsapp_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_pkey PRIMARY KEY (id);


--
-- Name: idx_inv_uhid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inv_uhid ON public.op_investigations USING btree (uhid);


--
-- Name: idx_ip_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ip_number ON public.ip_registrations USING btree (ip_number);


--
-- Name: idx_ip_uhid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ip_uhid ON public.ip_registrations USING btree (uhid);


--
-- Name: idx_mobile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mobile ON public.patients USING btree (mobile);


--
-- Name: idx_uhid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uhid ON public.patients USING btree (uhid);


--
-- Name: prescriptions fk24chc88e4so7cd6melh11rv6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fk24chc88e4so7cd6melh11rv6 FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: surgery_records fk5171s6t073pl14fc0pmxrvs0x; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surgery_records
    ADD CONSTRAINT fk5171s6t073pl14fc0pmxrvs0x FOREIGN KEY (ot_booking_id) REFERENCES public.ot_bookings(id);


--
-- Name: ip_registrations fk54s12clnr1o3eifr9k3nqtrc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ip_registrations
    ADD CONSTRAINT fk54s12clnr1o3eifr9k3nqtrc FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: ip_registrations fk5hhlq1arpy8hs8dh4l30hmrx; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ip_registrations
    ADD CONSTRAINT fk5hhlq1arpy8hs8dh4l30hmrx FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: op_investigations fk5kvjfnl3xh3iqveey9cal9pw5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.op_investigations
    ADD CONSTRAINT fk5kvjfnl3xh3iqveey9cal9pw5 FOREIGN KEY (ordering_doctor_id) REFERENCES public.doctors(id);


--
-- Name: prescription_items fk6uh7tdy2lv6sx34u1365acqsf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT fk6uh7tdy2lv6sx34u1365acqsf FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: ip_registrations fka0uune8vhvnh9dm1h4geqgtbf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ip_registrations
    ADD CONSTRAINT fka0uune8vhvnh9dm1h4geqgtbf FOREIGN KEY (admitting_doctor_id) REFERENCES public.doctors(id);


--
-- Name: ot_bookings fkb6davsckqp9ipk801l6iw5g8f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ot_bookings
    ADD CONSTRAINT fkb6davsckqp9ipk801l6iw5g8f FOREIGN KEY (surgeon_doctor_id) REFERENCES public.doctors(id);


--
-- Name: op_investigations fkc83imnjkauagmg4otnf2u5xv3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.op_investigations
    ADD CONSTRAINT fkc83imnjkauagmg4otnf2u5xv3 FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: beds fkccoswfceny9biqfp1jkcpcrqy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT fkccoswfceny9biqfp1jkcpcrqy FOREIGN KEY (ward_id) REFERENCES public.wards(id);


--
-- Name: ot_bookings fkdy5ye61xqt2te9t93uieduk1o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ot_bookings
    ADD CONSTRAINT fkdy5ye61xqt2te9t93uieduk1o FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: ip_registrations fke5qq76m3yhq31lqonqvyyxsjj; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ip_registrations
    ADD CONSTRAINT fke5qq76m3yhq31lqonqvyyxsjj FOREIGN KEY (ward_id) REFERENCES public.wards(id);


--
-- Name: pharmacy_sale_items fkfwrk550wmwwwbbtdodcd70e54; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_items
    ADD CONSTRAINT fkfwrk550wmwwwbbtdodcd70e54 FOREIGN KEY (pharmacy_sale_id) REFERENCES public.pharmacy_sales(id);


--
-- Name: lab_results fkgjn5n5buxev3i747lfo6t50nu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT fkgjn5n5buxev3i747lfo6t50nu FOREIGN KEY (investigation_id) REFERENCES public.op_investigations(id);


--
-- Name: bills fkiklkhnj1odoll0m9otela7gb9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT fkiklkhnj1odoll0m9otela7gb9 FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: bill_items fkj9o7g8krc56gf6t6f0sy4ic5p; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT fkj9o7g8krc56gf6t6f0sy4ic5p FOREIGN KEY (bill_id) REFERENCES public.bills(id);


--
-- Name: daily_notes fkke495rhggmyc6jx9anns0qk8w; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notes
    ADD CONSTRAINT fkke495rhggmyc6jx9anns0qk8w FOREIGN KEY (ip_registration_id) REFERENCES public.ip_registrations(id);


--
-- Name: pharmacy_sale_items fkl121wbresvtgc4pjks5ye187y; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sale_items
    ADD CONSTRAINT fkl121wbresvtgc4pjks5ye187y FOREIGN KEY (pharmacy_inventory_id) REFERENCES public.pharmacy_inventory(id);


--
-- Name: doctors fkl2mro81neln9topymd898urh1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fkl2mro81neln9topymd898urh1 FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: tpa_claims fkmp784dxuhavpxa2svdgjo01e0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tpa_claims
    ADD CONSTRAINT fkmp784dxuhavpxa2svdgjo01e0 FOREIGN KEY (tpa_company_id) REFERENCES public.tpa_companies(id);


--
-- Name: op_registrations fknkep9l22odft7w2y5628rgasc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.op_registrations
    ADD CONSTRAINT fknkep9l22odft7w2y5628rgasc FOREIGN KEY (assigned_doctor_id) REFERENCES public.doctors(id);


--
-- Name: op_registrations fkog2kp75r92lva5lmhjrofoda5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.op_registrations
    ADD CONSTRAINT fkog2kp75r92lva5lmhjrofoda5 FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: pharmacy_sales fkpiy3u1vfs0yr99ju0qf4c9vjw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_sales
    ADD CONSTRAINT fkpiy3u1vfs0yr99ju0qf4c9vjw FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: op_registrations fkpob7iwk1elowkft265pbpq6e1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.op_registrations
    ADD CONSTRAINT fkpob7iwk1elowkft265pbpq6e1 FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: prescriptions fkq21efuyws8ih7m40r33isjpof; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fkq21efuyws8ih7m40r33isjpof FOREIGN KEY (op_registration_id) REFERENCES public.op_registrations(id);


--
-- Name: prescriptions fkqydyol76jn1o37k1bdbkjgq74; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fkqydyol76jn1o37k1bdbkjgq74 FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: tpa_claims fkth5j5qmhkyh0jkk2bkp44r2ia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tpa_claims
    ADD CONSTRAINT fkth5j5qmhkyh0jkk2bkp44r2ia FOREIGN KEY (ip_registration_id) REFERENCES public.ip_registrations(id);


--
-- PostgreSQL database dump complete
--

-- \unrestrict 56dTqugRjudfEoWlRkraxrbz668d83cRF2RSz20dwDT18x1cezlvxlPHC0WUV7f



-- =======================================================
-- CUSTOM HMS TRIGGERS FOR AUTO UPDATED_AT
-- =======================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check and add updated_at columns if they don't exist, and create triggers
DO $$
DECLARE
    t text;
    tables_list text[] := ARRAY[
        'departments', 'doctors', 'patients', 'users', 'wards', 'beds',
        'op_registrations', 'ip_registrations', 'prescriptions', 
        'prescription_items', 'bills', 'bill_items', 'financial_transactions'
    ];
BEGIN
    FOREACH t IN ARRAY tables_list LOOP
        -- Add updated_at column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = t AND column_name = 'updated_at'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_at timestamp with time zone default now()', t);
        END IF;

        -- Drop existing trigger if any
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%I ON public.%I', t, t);

        -- Create trigger
        EXECUTE format('CREATE TRIGGER set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t, t);
    END LOOP;
END;
$$;

-- =======================================================
-- USER SPECIFIED TABLE: table_name
-- =======================================================

create table if not exists public.table_name (
  id bigint generated by default as identity primary key,
  inserted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb,
  name text
);
