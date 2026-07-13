import { supabase } from './supabaseClient';

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PatientRow {
  id?: string;
  clinic_id: string;
  uhid: string;
  patient_name: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  mobile: string;
  email?: string;
  address?: string;
  created_at?: string;
}

export interface DoctorRow {
  id?: string;
  clinic_id: string;
  doctor_name: string;
  specialization: string;
  qualification?: string;
  mobile?: string;
  consulting_fee?: number;
  created_at?: string;
}

export interface AppointmentRow {
  id?: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
  created_at?: string;
}

export interface PrescriptionRow {
  id?: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  prescription_date: string;
  diagnosis?: string;
  notes?: string;
  created_at?: string;
}

export interface PrescriptionItemRow {
  id?: string;
  prescription_id?: string;
  medicine_name: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface BillRow {
  id?: string;
  clinic_id: string;
  patient_id: string;
  bill_date: string;
  total_amount: number;
  discount_amount?: number;
  net_amount: number;
  status: string;
  created_at?: string;
}

export interface BillItemRow {
  id?: string;
  bill_id?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PaymentRow {
  id?: string;
  bill_id: string;
  payment_date: string;
  amount_paid: number;
  payment_mode: string;
  transaction_ref?: string;
  created_at?: string;
}

export const supabaseDatabase = {
  // ==========================================
  // PATIENTS CRUD
  // ==========================================
  async getPatients(clinicId: string, options: PaginationOptions & { search?: string }) {
    const fromIndex = (options.page - 1) * options.pageSize;
    const toIndex = fromIndex + options.pageSize - 1;

    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .range(fromIndex, toIndex);

    if (options.search) {
      // search by name, phone, or uhid
      query = query.or(
        `patient_name.ilike.%${options.search}%,mobile.ilike.%${options.search}%,uhid.ilike.%${options.search}%`
      );
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data, totalCount: count || 0 };
  },

  async getPatientById(id: string) {
    const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createPatient(patientData: Partial<PatientRow>) {
    const { data, error } = await supabase.from('patients').insert(patientData).select().single();
    if (error) throw error;
    return data;
  },

  async updatePatient(id: string, patientData: Partial<PatientRow>) {
    const { data, error } = await supabase.from('patients').update(patientData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deletePatient(id: string) {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
  },

  // ==========================================
  // DOCTORS CRUD
  // ==========================================
  async getDoctors(clinicId: string, options?: { specialization?: string }) {
    let query = supabase.from('doctors').select('*').eq('clinic_id', clinicId);
    if (options?.specialization) {
      query = query.eq('specialization', options.specialization);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createDoctor(doctorData: Partial<DoctorRow>) {
    const { data, error } = await supabase.from('doctors').insert(doctorData).select().single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // APPOINTMENTS CRUD
  // ==========================================
  async getAppointments(
    clinicId: string,
    options?: { date?: string; doctorId?: string }
  ) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients ( uhid, patient_name, mobile ),
        doctors ( doctor_name, specialization )
      `)
      .eq('clinic_id', clinicId);

    if (options?.date) {
      query = query.eq('appointment_date', options.date);
    }
    if (options?.doctorId) {
      query = query.eq('doctor_id', options.doctorId);
    }

    const { data, error } = await query.order('appointment_time', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createAppointment(appointmentData: Partial<AppointmentRow>) {
    const { data, error } = await supabase.from('appointments').insert(appointmentData).select().single();
    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(id: string, status: string) {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // PRESCRIPTIONS CRUD
  // ==========================================
  async getPrescriptions(clinicId: string, options?: { patientId?: string }) {
    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        patients ( patient_name, uhid ),
        doctors ( doctor_name ),
        prescription_items ( * )
      `)
      .eq('clinic_id', clinicId);

    if (options?.patientId) {
      query = query.eq('patient_id', options.patientId);
    }

    const { data, error } = await query.order('prescription_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createPrescription(prescription: Partial<PrescriptionRow>, items: Partial<PrescriptionItemRow>[]) {
    // Start transaction-like behavior using separate sequential writes (standard client behavior)
    const { data: pData, error: pError } = await supabase
      .from('prescriptions')
      .insert(prescription)
      .select()
      .single();

    if (pError) throw pError;

    const prescriptionId = pData.id;
    const itemsWithId = items.map(item => ({ ...item, prescription_id: prescriptionId }));

    const { data: iData, error: iError } = await supabase
      .from('prescription_items')
      .insert(itemsWithId)
      .select();

    if (iError) {
      // Rollback main prescription if items fail
      await supabase.from('prescriptions').delete().eq('id', prescriptionId);
      throw iError;
    }

    return { ...pData, items: iData };
  },

  // ==========================================
  // BILLS & PAYMENTS CRUD
  // ==========================================
  async getBills(clinicId: string, options?: { startDate?: string; endDate?: string }) {
    let query = supabase
      .from('bills')
      .select(`
        *,
        patients ( patient_name, uhid ),
        bill_items ( * ),
        payments ( * )
      `)
      .eq('clinic_id', clinicId);

    if (options?.startDate) {
      query = query.gte('bill_date', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('bill_date', options.endDate);
    }

    const { data, error } = await query.order('bill_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createBill(bill: Partial<BillRow>, items: Partial<BillItemRow>[]) {
    const { data: bData, error: bError } = await supabase
      .from('bills')
      .insert(bill)
      .select()
      .single();

    if (bError) throw bError;

    const billId = bData.id;
    const itemsWithId = items.map(item => ({ ...item, bill_id: billId }));

    const { data: iData, error: iError } = await supabase
      .from('bill_items')
      .insert(itemsWithId)
      .select();

    if (iError) {
      await supabase.from('bills').delete().eq('id', billId);
      throw iError;
    }

    return { ...bData, items: iData };
  },

  async addPayment(payment: Partial<PaymentRow>) {
    const { data: pData, error: pError } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (pError) throw pError;

    // Fetch current total paid for the bill to update status
    const { data: payList, error: listError } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('bill_id', payment.bill_id);

    if (listError) throw listError;

    const { data: billData, error: billError } = await supabase
      .from('bills')
      .select('total_amount')
      .eq('id', payment.bill_id)
      .single();

    if (billError) throw billError;

    const totalPaid = payList.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const newStatus = totalPaid >= Number(billData.total_amount) ? 'Paid' : 'Partially Paid';

    const { error: updateError } = await supabase
      .from('bills')
      .update({ status: newStatus })
      .eq('id', payment.bill_id);

    if (updateError) throw updateError;

    return pData;
  }
};
