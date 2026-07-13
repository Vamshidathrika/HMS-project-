--
-- PostgreSQL database dump
--

\restrict nAz3LVZVe2Rz75VFw3qdeOs9reZzRz61KVKrVY1MlGce2cuBCV4abXaCjfjvaGc

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
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


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

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


ALTER TABLE public.beds OWNER TO postgres;

--
-- Name: beds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beds_id_seq OWNER TO postgres;

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


ALTER TABLE public.bill_items OWNER TO postgres;

--
-- Name: bill_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bill_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bill_items_id_seq OWNER TO postgres;

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


ALTER TABLE public.bills OWNER TO postgres;

--
-- Name: bills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bills_id_seq OWNER TO postgres;

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


ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaigns_id_seq OWNER TO postgres;

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


ALTER TABLE public.daily_notes OWNER TO postgres;

--
-- Name: daily_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_notes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_notes_id_seq OWNER TO postgres;

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


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

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


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

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


ALTER TABLE public.financial_transactions OWNER TO postgres;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.financial_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_transactions_id_seq OWNER TO postgres;

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


ALTER TABLE public.ip_registrations OWNER TO postgres;

--
-- Name: ip_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ip_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ip_registrations_id_seq OWNER TO postgres;

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


ALTER TABLE public.lab_results OWNER TO postgres;

--
-- Name: lab_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_results_id_seq OWNER TO postgres;

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


ALTER TABLE public.op_investigations OWNER TO postgres;

--
-- Name: op_investigations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.op_investigations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.op_investigations_id_seq OWNER TO postgres;

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


ALTER TABLE public.op_registrations OWNER TO postgres;

--
-- Name: op_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.op_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.op_registrations_id_seq OWNER TO postgres;

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


ALTER TABLE public.ot_bookings OWNER TO postgres;

--
-- Name: ot_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ot_bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ot_bookings_id_seq OWNER TO postgres;

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


ALTER TABLE public.patient_feedbacks OWNER TO postgres;

--
-- Name: patient_feedbacks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_feedbacks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_feedbacks_id_seq OWNER TO postgres;

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


ALTER TABLE public.patient_followups OWNER TO postgres;

--
-- Name: patient_followups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_followups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_followups_id_seq OWNER TO postgres;

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


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

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


ALTER TABLE public.pharmacy_inventory OWNER TO postgres;

--
-- Name: pharmacy_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_inventory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pharmacy_inventory_id_seq OWNER TO postgres;

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


ALTER TABLE public.pharmacy_sale_items OWNER TO postgres;

--
-- Name: pharmacy_sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_sale_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pharmacy_sale_items_id_seq OWNER TO postgres;

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


ALTER TABLE public.pharmacy_sales OWNER TO postgres;

--
-- Name: pharmacy_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pharmacy_sales_id_seq OWNER TO postgres;

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


ALTER TABLE public.prescription_items OWNER TO postgres;

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


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescriptions_id_seq OWNER TO postgres;

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


ALTER TABLE public.surgery_records OWNER TO postgres;

--
-- Name: surgery_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.surgery_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.surgery_records_id_seq OWNER TO postgres;

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


ALTER TABLE public.test_masters OWNER TO postgres;

--
-- Name: test_masters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_masters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_masters_id_seq OWNER TO postgres;

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


ALTER TABLE public.tpa_claims OWNER TO postgres;

--
-- Name: tpa_claims_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tpa_claims_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tpa_claims_id_seq OWNER TO postgres;

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


ALTER TABLE public.tpa_companies OWNER TO postgres;

--
-- Name: tpa_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tpa_companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tpa_companies_id_seq OWNER TO postgres;

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


ALTER TABLE public.uhid_sequences OWNER TO postgres;

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


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

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


ALTER TABLE public.wards OWNER TO postgres;

--
-- Name: wards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wards_id_seq OWNER TO postgres;

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


ALTER TABLE public.whatsapp_logs OWNER TO postgres;

--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.whatsapp_logs_id_seq OWNER TO postgres;

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


ALTER TABLE public.whatsapp_templates OWNER TO postgres;

--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.whatsapp_templates_id_seq OWNER TO postgres;

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

COPY public.audit_logs (id, action, details, ip_address, role, status, "timestamp", username) FROM stdin;
1	PATIENT_REGISTER	Registered patient: Srinija with UHID: 260615AH0000003	127.0.0.1	FrontDesk	SUCCESS	2026-06-15 17:32:37.107483	anonymous
2	BILL_CREATE	Generated patient OP invoice: 260615AH0000003 for total: ₹773.5 via Cash	127.0.0.1	FrontDesk	SUCCESS	2026-06-15 18:27:15.708623	anonymous
3	PATIENT_REGISTER	Registered patient: Srinija with UHID: 150626185530	127.0.0.1	FrontDesk	SUCCESS	2026-06-15 18:58:03.048936	anonymous
4	OPD_REGISTER	Booked OP visit for patient: Srinija (UHID: 150626185530) with Doctor: Dr. Rajesh Sharma	127.0.0.1	FrontDesk	SUCCESS	2026-06-15 18:58:03.239637	anonymous
5	LOGIN	Successfully logged into the system.	127.0.0.1	Nurse	SUCCESS	2026-06-25 18:00:38.175888	nurse_jane
6	LOGIN	Successfully logged into the system.	127.0.0.1	FrontDesk	SUCCESS	2026-06-25 18:01:00.769493	front_desk
7	LOGIN	Successfully logged into the system.	127.0.0.1	FrontDesk	SUCCESS	2026-06-25 18:01:15.500417	front_desk
8	LOGIN	Successfully logged into the system.	127.0.0.1	SuperAdmin	SUCCESS	2026-06-25 18:01:35.757563	admin
9	MASTER_MEDICINE_CREATE	Created drug item: kbvcx (m nbv43)	127.0.0.1	SuperAdmin	SUCCESS	2026-06-25 18:02:24.278339	admin
10	PATIENT_REGISTER	Registered patient: ,mnbvcsdxc with UHID: 260625AH0000004	127.0.0.1	SuperAdmin	SUCCESS	2026-06-25 18:04:44.585887	admin
11	OPD_REGISTER	Booked OP visit for patient: ,mnbvcsdxc (UHID: 260625AH0000004) with Doctor: Dr. Rajesh Sharma	127.0.0.1	SuperAdmin	SUCCESS	2026-06-25 18:04:44.700487	admin
12	LOGIN	Successfully logged into the system.	127.0.0.1	SuperAdmin	SUCCESS	2026-06-26 10:24:06.695944	admin
13	LOGIN	Successfully logged into the system.	127.0.0.1	SuperAdmin	SUCCESS	2026-06-26 10:41:18.511895	admin
14	PATIENT_REGISTER	Registered patient: Srinija with UHID: 260626AH0000005	127.0.0.1	SuperAdmin	SUCCESS	2026-06-26 11:16:35.459633	admin
15	OPD_REGISTER	Booked OP visit for patient: Srinija (UHID: 260626AH0000005) with Doctor: Dr. Priya Patel	127.0.0.1	SuperAdmin	SUCCESS	2026-06-26 11:16:35.607462	admin
16	LOGIN	Successfully logged into the system.	127.0.0.1	SuperAdmin	SUCCESS	2026-06-26 11:59:58.581463	admin
17	LOGIN	Successfully logged into the system.	127.0.0.1	SuperAdmin	SUCCESS	2026-06-26 12:07:56.874149	admin
\.


--
-- Data for Name: beds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.beds (id, bed_number, room_type, status, ward_id) FROM stdin;
1	MMW-01	General	Available	1
2	FMW-01	General	Available	2
3	MMW-02	General	Available	1
4	FMW-02	General	Available	2
5	MMW-03	General	Available	1
6	FMW-03	General	Available	2
7	MMW-04	General	Available	1
8	FMW-04	General	Available	2
9	MMW-05	General	Available	1
10	FMW-05	General	Available	2
11	MMW-06	General	Available	1
12	FMW-06	General	Available	2
13	MMW-07	General	Available	1
14	FMW-07	General	Available	2
15	MMW-08	General	Available	1
16	FMW-08	General	Available	2
17	MMW-09	General	Available	1
18	FMW-09	General	Available	2
19	MMW-10	General	Available	1
20	FMW-10	General	Available	2
21	ICU-01	ICU	Available	3
22	ICU-02	ICU	Available	3
23	ICU-03	ICU	Available	3
24	ICU-04	ICU	Available	3
25	ICU-05	ICU	Available	3
26	PED-01	General	Available	4
27	PED-02	General	Available	4
28	PED-03	General	Available	4
29	PED-04	General	Available	4
30	PED-05	General	Available	4
31	PVT-01	Private	Available	5
32	PVT-02	Private	Available	5
33	PVT-03	Private	Available	5
34	PVT-04	Private	Available	5
35	PVT-05	Private	Available	5
\.


--
-- Data for Name: bill_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_items (id, item_name, quantity, total, unit_price, bill_id) FROM stdin;
1	OPD Consultation Fee	1	500	500	1
2	Complete Blood Count (CBC)	1	350	350	1
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills (id, advance_adjusted, bill_date, bill_type, cash_drawer, discount_amount, discount_percent, net_payable, payment_mode, remarks, status, total_amount, uhid, patient_id) FROM stdin;
1	0	2026-06-15	OP	Cash Drawer 1	76.5	9	773.5	Cash		Paid	850	260615AH0000003	5
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaigns (id, launch_date, message_text, status, target_group, title) FROM stdin;
\.


--
-- Data for Name: daily_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_notes (id, bp, note_date_time, progress_note, pulse, recorded_by, respiratory_rate, spo2, temperature, treatment_notes, ip_registration_id) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, dept_code, dept_name, dept_type, is_active) FROM stdin;
1	GENMED	General Medicine	Clinical	t
2	PED	Pediatrics	Clinical	t
3	CARD	Cardiology	Clinical	t
4	ORTHO	Orthopedics	Clinical	t
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (id, consulting_fee, doctor_code, email, mobile, name, qualification, specialization, department_id) FROM stdin;
1	500.00	DOC001	rajesh@pixelhms.com	9876543201	Dr. Rajesh Sharma	MD (General Medicine)	Consulting Physician	1
2	400.00	DOC002	priya@pixelhms.com	9876543202	Dr. Priya Patel	MD (Pediatrics)	Child Specialist	2
3	800.00	DOC003	amit@pixelhms.com	9876543203	Dr. Amit Verma	DM (Cardiology)	Interventional Cardiologist	3
4	600.00	DOC004	sunita@pixelhms.com	9876543204	Dr. Sunita Rao	MS (Orthopedics)	Joint Replacement Surgeon	4
\.


--
-- Data for Name: financial_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_transactions (id, amount, category, patient_name, payment_mode, reference_id, remarks, tx_date, tx_time, tx_type, uhid) FROM stdin;
1	773.5	OPD Consultation	Srinija	Cash	INV-1		2026-06-15	18:27:15.675	Credit	260615AH0000003
\.


--
-- Data for Name: ip_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ip_registrations (id, admission_date, admission_time, admission_type, advance_paid, bed_number, diagnosis_provisional, discharge_date, discharge_instructions, discharge_notes, discharge_status, ip_number, room_type, status, total_bill, uhid, admitting_doctor_id, department_id, patient_id, ward_id) FROM stdin;
\.


--
-- Data for Name: lab_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_results (id, lab_technician, reference_range, remarks, result_value, verification_date_time, verified_by, investigation_id) FROM stdin;
\.


--
-- Data for Name: op_investigations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.op_investigations (id, order_date_time, sample_collected, status, test_category, test_name, uhid, ordering_doctor_id, patient_id) FROM stdin;
1	2026-06-15 17:29:02.262109	f	Ordered	Lab	Complete Blood Count	260615AH0000001	1	1
2	2026-06-15 17:29:02.273093	f	Ordered	Imaging	Chest X-Ray	260615AH0000001	1	1
\.


--
-- Data for Name: op_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.op_registrations (id, chief_complaint, entry_number, payment_status, status, token_number, uhid, visit_date, visit_time, visit_type, assigned_doctor_id, department_id, patient_id, age_unit, age_value, blood_pressure, consulting_fee, height, patient_category, payment_mode, pulse_rate, referring_doctor, remarks, respiratory_rate, spo2, temp_f, weight) FROM stdin;
1		1	Paid	Waiting	1	150626185530	2026-06-15	18:58:03.209	New	1	1	6	Yrs	35		500		General	Cash		Dr. Ramesh (Gen Physician)					
2		1	Paid	Waiting	1	260625AH0000004	2026-06-25	18:04:44.668	New	1	1	7	Yrs	37		500		General	Cash		SELF					
3		1	Paid	Waiting	1	260626AH0000005	2026-06-26	11:16:35.582	New	2	2	8	Yrs	35		400		General	Cash		SELF					
\.


--
-- Data for Name: ot_bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ot_bookings (id, ot_room, pre_op_check_completed, status, surgery_date, surgery_name, surgery_time, uhid, patient_id, surgeon_doctor_id) FROM stdin;
\.


--
-- Data for Name: patient_feedbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_feedbacks (id, comments, patient_name, rating, submission_date, uhid) FROM stdin;
\.


--
-- Data for Name: patient_followups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_followups (id, doctor_name, notes, patient_name, scheduled_date, status, uhid) FROM stdin;
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, aadhar_number, abha_address, abha_id, address_line1, alternate_mobile, blood_group, city, date_of_birth, email, gender, mobile, occupation, patient_name, photo_path, pincode, registration_date, relation_name, state, uhid) FROM stdin;
1	\N	aarav.mehta@ndhm	1234-5678-9012-34	123, MG Road, Mumbai	\N	O+	Mumbai	1990-05-12	aarav@pixelhms.com	M	9876543210	Software Engineer	Aarav Mehta	\N	400001	2026-06-15 17:29:02.116918	Sanjay Mehta	Maharashtra	260615AH0000001
2	\N	\N	\N	456, Park Street, Kolkata	\N	B+	Kolkata	1995-08-22	ishita@pixelhms.com	F	9876543211	Teacher	Ishita Sharma	\N	700016	2026-06-15 17:29:02.144385	Sunil Sharma	West Bengal	260615AH0000002
5	\N				\N	O+	\N	\N	\N	M	9182462006	\N	Srinija	\N	\N	2026-06-15 17:32:37.10017		\N	260615AH0000003
6		\N	\N		\N	O+	\N	\N	\N	F	9182462009	\N	Srinija	\N	\N	2026-06-15 18:58:02.947897	pappa	\N	150626185530
7		\N	\N		\N	O+	\N	1989-05-12	\N	F	0987654321	\N	,mnbvcsdxc	\N	\N	2026-06-25 18:04:44.554331	,mnbvcxvc	\N	260625AH0000004
8		\N	\N		\N	O+	\N	\N	\N	M	9182462006	\N	Srinija	\N	\N	2026-06-26 11:16:35.436861		\N	260626AH0000005
\.


--
-- Data for Name: pharmacy_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_inventory (id, batch_number, current_stock, drug_code, drug_name, expiry_date, purchase_price, unit_price) FROM stdin;
1	BAT-P887	150	DRG001	Paracetamol 650mg	2028-06-15	6	10
2	BAT-A992	100	DRG002	Amoxicillin 500mg	2027-06-15	18	25
3	BAT-I552	200	DRG003	Ibuprofen 400mg	2028-06-15	9	15
4	BAT-C441	300	DRG004	Cetirizine 10mg	2029-06-15	4	8
5	BAT-M110	250	DRG005	Metformin 500mg	2028-06-15	7	12
6	gfxdd	100	m nbv43	kbvcx	0234-02-01	6	10
\.


--
-- Data for Name: pharmacy_sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_sale_items (id, quantity, total, unit_price, pharmacy_inventory_id, pharmacy_sale_id) FROM stdin;
\.


--
-- Data for Name: pharmacy_sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_sales (id, discount_amount, net_payable, payment_mode, payment_status, sale_date, total_amount, uhid, patient_id) FROM stdin;
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (prescription_id, dosage, duration, frequency, instruction, medicine_name) FROM stdin;
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, created_date, diagnosis, notes, symptoms, doctor_id, op_registration_id, patient_id) FROM stdin;
\.


--
-- Data for Name: surgery_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.surgery_records (id, anesthesia_type, assistant_surgeon, complications, end_time, post_op_notes, start_time, surgery_notes, ot_booking_id) FROM stdin;
\.


--
-- Data for Name: test_masters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_masters (id, is_active, price, test_category, test_code, test_name) FROM stdin;
\.


--
-- Data for Name: tpa_claims; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tpa_claims (id, approval_date, approved_amount, claim_amount, ip_number, pre_auth_code, pre_auth_status, remarks, uhid, ip_registration_id, tpa_company_id) FROM stdin;
\.


--
-- Data for Name: tpa_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tpa_companies (id, contact_person, email, is_active, mobile, name) FROM stdin;
1	Mr. Anand Kumar	anand@starhealth.in	t	9845012345	Star Health Insurance
2	Ms. Ritu Mehta	ritu@hdfcergo.com	t	9845054321	HDFC Ergo General Insurance
3	Mr. Vinay Rao	vinay@icicilombard.com	t	9845098765	ICICI Lombard
\.


--
-- Data for Name: uhid_sequences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.uhid_sequences (facility_code, current_sequence) FROM stdin;
AH	5
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, is_active, password, role, username) FROM stdin;
1	System Administrator	t	$2a$10$rQubfDFuuuh1iuOur3NiKeGrdgDHKeoZV6HBcEBoLfvzEsT6tpkaO	SuperAdmin	admin
2	Dr. Rajesh Sharma	t	$2a$10$b8YCFs.9bze7Nq0MkZ49YeO217uE5OMm3Cg.FWqvLyYKzgmbHMLD6	Doctor	dr_rajesh
3	Front Desk Operator	t	$2a$10$DUtHGMFpkJNE6lqz/naB3.pkH1/4ck0oNfImdBzftDpuSaezcvMnS	FrontDesk	front_desk
4	Nurse Jane Doe	t	$2a$10$6T9CE78AJxBPB26IjjgX.OPgRNsYkzAgfM5Qvr3PDIPsfb0AkSn5y	Nurse	nurse_jane
5	Lead Pharmacist	t	$2a$10$2WuwaA2gx5b/0xzCugHCFuAfsGX4u4yVPBgM8HRIXyVNpz2R3DQo.	Pharmacist	pharmacist
6	Accountant Bill	t	$2a$10$z9D8H3p4.EwLXFEDHRnqhePURzwa6DiSUv5zN47bzkG9XPiknNPSe	Accountant	accountant_bill
\.


--
-- Data for Name: wards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wards (id, code, is_active, name) FROM stdin;
1	MMW	t	Male Medical Ward
2	FMW	t	Female Medical Ward
3	ICU	t	Intensive Care Unit
4	PEDW	t	Pediatric Ward
5	PVT	t	Private Rooms Ward
\.


--
-- Data for Name: whatsapp_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_logs (id, error_message, message_text, mobile, patient_name, status, template_name, "timestamp", uhid) FROM stdin;
1	\N	Hello Srinija! Welcome to Ashirwad Hospital. Your unique patient UHID is 260615AH0000003. Thank you for choosing us.	9182462006	Srinija	Sent	Welcome	2026-06-15 17:32:37.14755	260615AH0000003
2	\N	Dear Srinija, your billing invoice 260615AH0000003 for amount 773.5 has been successfully generated. Thank you, Ashirwad Hospital.	9182462006	Srinija	Sent	Bill Invoice	2026-06-15 18:27:15.728878	260615AH0000003
3	\N	Hello Srinija! Welcome to Ashirwad Hospital. Your unique patient UHID is 150626185530. Thank you for choosing us.	9182462009	Srinija	Sent	Welcome	2026-06-15 18:58:03.078433	150626185530
4	\N	Dear Srinija, your outpatient visit consultation is confirmed with Dr. Rajesh Sharma. Your queue token number is 1. Please wait for your turn.	9182462009	Srinija	Sent	OPD Ticket	2026-06-15 18:58:03.250626	150626185530
5	\N	Hello ,mnbvcsdxc! Welcome to Ashirwad Hospital. Your unique patient UHID is 260625AH0000004. Thank you for choosing us.	0987654321	,mnbvcsdxc	Sent	Welcome	2026-06-25 18:04:44.595284	260625AH0000004
6	\N	Dear ,mnbvcsdxc, your outpatient visit consultation is confirmed with Dr. Rajesh Sharma. Your queue token number is 1. Please wait for your turn.	0987654321	,mnbvcsdxc	Sent	OPD Ticket	2026-06-25 18:04:44.720728	260625AH0000004
7	\N	Hello Srinija! Welcome to Ashirwad Hospital. Your unique patient UHID is 260626AH0000005. Thank you for choosing us.	9182462006	Srinija	Sent	Welcome	2026-06-26 11:16:35.483307	260626AH0000005
8	\N	Dear Srinija, your outpatient visit consultation is confirmed with Dr. Priya Patel. Your queue token number is 1. Please wait for your turn.	9182462006	Srinija	Sent	OPD Ticket	2026-06-26 11:16:35.615108	260626AH0000005
\.


--
-- Data for Name: whatsapp_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_templates (id, is_active, name, template_text) FROM stdin;
1	t	Welcome	Hello {{name}}! Welcome to Ashirwad Hospital. Your unique patient UHID is {{uhid}}. Thank you for choosing us.
2	t	OPD Ticket	Dear {{name}}, your outpatient visit consultation is confirmed with {{doctor}}. Your queue token number is {{token}}. Please wait for your turn.
3	t	IP Admission	Dear {{name}}, your inpatient admission is complete. Allocated Ward: {{ward}}, Bed: {{bed}}. We wish you a speedy recovery.
4	t	Bill Invoice	Dear {{name}}, your billing invoice {{invoice}} for amount {{amount}} has been successfully generated. Thank you, Ashirwad Hospital.
\.


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

\unrestrict nAz3LVZVe2Rz75VFw3qdeOs9reZzRz61KVKrVY1MlGce2cuBCV4abXaCjfjvaGc

