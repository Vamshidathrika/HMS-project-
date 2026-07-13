import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import {
  ClipboardList,
  RefreshCw,
  Save,
  Search,
  DollarSign,
  FileText,
  TrendingUp,
  ChevronRight,
  Printer,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Patient {
  id: number;
  uhid: string;
  patientName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  mobile: string;
  addressLine1: string;
  relationName: string;
}

interface OPRegistration {
  id: number;
  patient: Patient;
  uhid: string;
  entryNumber: number;
  visitDate: string;
  visitTime: string;
  ageValue: string;
  ageUnit: string;
  visitType: string;
  department: { id: number; deptName: string; deptCode: string } | null;
  assignedDoctor: { id: number; name: string; qualification: string; specialization: string } | null;
  tokenNumber: number;
  consultingFee: number;
  paymentStatus: string;
  paymentMode: string;
  status: string;
  chiefComplaint: string;
  remarks: string;
  tempF: string;
  pulseRate: string;
  respiratoryRate: string;
  spo2: string;
  bloodPressure: string;
  weight: string;
  height: string;
}

interface BillingDeskViewProps {
  role?: string;
  initialSubTab?: string;
}

export default function BillingDeskView({ initialSubTab }: BillingDeskViewProps) {
  const hospitalName = localStorage.getItem('hms_hospital_name') || 'ASHIRWAD';

  // Sub-tab routing
  const [subTab, setSubTab] = useState<'billing' | 'daybook' | 'collection' | 'dpsr' | 'tpa' | 'history'>(
    (initialSubTab as any) || 'billing'
  );

  // --- Billing Overview State ---
  const [billingRecords, setBillingRecords] = useState<OPRegistration[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingDate, setBillingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [billingError, setBillingError] = useState('');

  // --- OP Day Book State ---
  const [dayBookDate, setDayBookDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dayBookRecords, setDayBookRecords] = useState<OPRegistration[]>([]);
  const [dayBookLoading, setDayBookLoading] = useState(false);
  const [dayBookError, setDayBookError] = useState('');

  // --- DPSR State ---
  const [dpsrOpId, setDpsrOpId] = useState('');
  const [dpsrRecord, setDpsrRecord] = useState<OPRegistration | null>(null);
  const [dpsrError, setDpsrError] = useState('');
  const [isSearchingDpsr, setIsSearchingDpsr] = useState(false);
  const [isSavingDpsr, setIsSavingDpsr] = useState(false);
  const [dpsrSaveSuccess, setDpsrSaveSuccess] = useState('');

  // ─── Billing Overview ────────────────────────────────────────────────────
  const fetchBillingRecords = async () => {
    setBillingLoading(true);
    setBillingError('');
    try {
      const res = await fetch(`/api/v1/op/registrations?fromDate=${billingDate}&toDate=${billingDate}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load billing records');
      const data = await res.json();
      setBillingRecords(data);
    } catch (err: any) {
      setBillingError(err.message || 'Unknown error');
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'billing') fetchBillingRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab]);

  // ─── Day Book ────────────────────────────────────────────────────────────
  const fetchDayBook = async () => {
    setDayBookLoading(true);
    setDayBookError('');
    try {
      const res = await fetch(`/api/v1/op/registrations?fromDate=${dayBookDate}&toDate=${dayBookDate}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load day book');
      const data = await res.json();
      setDayBookRecords(data);
    } catch (err: any) {
      setDayBookError(err.message || 'Unknown error');
    } finally {
      setDayBookLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'daybook') fetchDayBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab]);

  // ─── DPSR Handlers ───────────────────────────────────────────────────────
  const handleDpsrSearch = async () => {
    if (!dpsrOpId.trim()) {
      setDpsrError('Please enter a valid OP ID.');
      return;
    }
    setIsSearchingDpsr(true);
    setDpsrError('');
    setDpsrRecord(null);
    setDpsrSaveSuccess('');
    try {
      const res = await fetch(`/api/v1/op/registrations/${dpsrOpId.trim()}`, { headers: getHeaders() });
      if (!res.ok) {
        if (res.status === 404) throw new Error(`OP Registration with ID ${dpsrOpId} not found.`);
        throw new Error('Failed to fetch patient data');
      }
      const data = await res.json();
      setDpsrRecord(data);
    } catch (err: any) {
      setDpsrError(err.message || 'Unknown error');
    } finally {
      setIsSearchingDpsr(false);
    }
  };

  const handleSaveDpsr = async () => {
    if (!dpsrRecord) return;
    setIsSavingDpsr(true);
    setDpsrError('');
    setDpsrSaveSuccess('');
    try {
      const payload = {
        tempF: dpsrRecord.tempF,
        pulseRate: dpsrRecord.pulseRate,
        respiratoryRate: dpsrRecord.respiratoryRate,
        spo2: dpsrRecord.spo2,
        bloodPressure: dpsrRecord.bloodPressure,
        weight: dpsrRecord.weight,
        height: dpsrRecord.height,
        chiefComplaint: dpsrRecord.chiefComplaint,
        remarks: dpsrRecord.remarks,
        status: dpsrRecord.status,
      };
      const res = await fetch(`/api/v1/op/registrations/modify/${dpsrRecord.id}`, {
        method: 'PUT',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save patient situation report');
      setDpsrSaveSuccess('Patient situation report saved successfully!');
    } catch (err: any) {
      setDpsrError(err.message || 'Unknown error');
    } finally {
      setIsSavingDpsr(false);
    }
  };

  // ─── Print Day Book ───────────────────────────────────────────────────────
  const handlePrintDayBook = () => {
    const printContent = `
      <html>
        <head>
          <title>OP Day Book - ${dayBookDate}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 16px; }
            h2 { text-align: center; font-size: 15px; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 4px; }
            h3 { text-align: center; font-size: 12px; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; }
            .total { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>${hospitalName} Hospital</h2>
          <h3>OP Day Book - ${dayBookDate}</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>OP ID</th>
                <th>UHID</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Dept</th>
                <th>Token</th>
                <th>Fees (Rs.)</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${dayBookRecords.map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${r.id}</td>
                  <td>${r.uhid}</td>
                  <td>${r.patient?.patientName || 'N/A'}</td>
                  <td>${r.assignedDoctor?.name || 'N/A'}</td>
                  <td>${r.department?.deptName || 'N/A'}</td>
                  <td>${r.tokenNumber}</td>
                  <td>${r.consultingFee}</td>
                  <td>${r.paymentMode || 'Cash'}</td>
                  <td>${r.status}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7" class="total">Total Collected</td>
                <td class="total">Rs. ${dayBookRecords.reduce((s, r) => s + (r.consultingFee || 0), 0)}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(printContent);
      w.document.close();
      w.print();
    }
  };

  // ─── Subtab Nav Tabs ─────────────────────────────────────────────────────
  const subTabs: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: 'billing', label: 'Billing Overview', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { key: 'daybook', label: 'OP Day Book', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'dpsr', label: 'DPSR- Entry', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { key: 'collection', label: 'Collection Report', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'tpa', label: 'TPA / Insurance', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'history', label: 'Billing History', icon: <ChevronRight className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-Tab Bar */}
      <div className="flex items-center space-x-1 bg-white border border-[#D7E8EA] rounded-2xl p-1.5 overflow-x-auto">
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key as any)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === t.key
                ? 'bg-[#147C8A] text-white shadow'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#EAF7F8]'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: Billing Overview ─────────────────────────────────────────── */}
      {subTab === 'billing' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#EAF7F8] text-[#147C8A] rounded-xl border border-[#147C8A]/20">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#1E293B]">Billing Overview</h1>
                  <p className="text-xs text-[#64748B] mt-0.5">Daily outpatient billing summary and payment tracking</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="date"
                  value={billingDate}
                  onChange={(e) => setBillingDate(e.target.value)}
                  className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
                <button
                  onClick={fetchBillingRecords}
                  disabled={billingLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#147C8A] hover:bg-[#0F6672] text-white transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{billingLoading ? 'Loading...' : 'Refresh'}</span>
                </button>
              </div>
            </div>
          </div>

          {billingError && (
            <div className="p-4 bg-red-50 border border-red-200/60 rounded-2xl flex items-center space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{billingError}</span>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Patients', value: billingRecords.length, color: 'text-[#147C8A]', bg: 'bg-[#147C8A]/10' },
              { label: 'Total Fees Collected', value: `Rs. ${billingRecords.reduce((s, r) => s + (r.consultingFee || 0), 0)}`, color: 'text-emerald-700', bg: 'bg-[#22C55E]/10' },
              { label: 'Paid', value: billingRecords.filter(r => r.paymentStatus === 'Paid').length, color: 'text-emerald-700', bg: 'bg-[#22C55E]/10' },
              { label: 'Pending', value: billingRecords.filter(r => r.paymentStatus !== 'Paid').length, color: 'text-amber-700', bg: 'bg-[#F59E0B]/10' },
            ].map((c) => (
              <div key={c.label} className={`${c.bg} border border-[#D7E8EA] rounded-2xl p-4`}>
                <p className="text-xs text-[#64748B]">{c.label}</p>
                <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#D7E8EA] bg-[#EAF7F8]">
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">OP ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">UHID</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Doctor</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Token</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Fees</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Payment</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billingLoading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-[#64748B]">Loading billing records...</td>
                    </tr>
                  ) : billingRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-[#64748B]">No records found for {billingDate}</td>
                    </tr>
                  ) : billingRecords.map((r, i) => (
                    <tr key={r.id} className="border-b border-[#D7E8EA]/60 hover:bg-[#EAF7F8] transition-colors">
                      <td className="py-3 px-4 text-[#64748B]">{i + 1}</td>
                      <td className="py-3 px-4 font-bold text-[#147C8A]">{r.id}</td>
                      <td className="py-3 px-4 font-mono text-[#1E293B]">{r.uhid}</td>
                      <td className="py-3 px-4 font-semibold text-[#1E293B]">{r.patient?.patientName || 'N/A'}</td>
                      <td className="py-3 px-4 text-[#1E293B]">{r.assignedDoctor?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-amber-700 font-bold">{r.tokenNumber}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#1E293B]">Rs. {r.consultingFee || 0}</td>
                      <td className="py-3 px-4 text-[#1E293B]">{r.paymentMode || 'Cash'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {r.paymentStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: OP Day Book ───────────────────────────────────────────────── */}
      {subTab === 'daybook' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#147C8A]/10 text-[#147C8A] rounded-xl border border-[#147C8A]/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#1E293B]">OP Day Book</h1>
                  <p className="text-xs text-[#64748B] mt-0.5">Daily register of all out-patient visits and fees</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="date"
                  value={dayBookDate}
                  onChange={(e) => setDayBookDate(e.target.value)}
                  className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
                <button
                  onClick={fetchDayBook}
                  disabled={dayBookLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#147C8A] hover:bg-[#0F6672] text-white transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{dayBookLoading ? 'Loading...' : 'Get Data'}</span>
                </button>
                {dayBookRecords.length > 0 && (
                  <button
                    onClick={handlePrintDayBook}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#1E293B] transition-all flex items-center space-x-1 border border-[#D7E8EA]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {dayBookError && (
            <div className="p-4 bg-red-50 border border-red-200/60 rounded-2xl flex items-center space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dayBookError}</span>
            </div>
          )}

          {/* Summary */}
          {dayBookRecords.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Patients', value: dayBookRecords.length, color: 'text-[#147C8A]' },
                { label: 'Total Fees', value: `Rs. ${dayBookRecords.reduce((s, r) => s + (r.consultingFee || 0), 0)}`, color: 'text-emerald-700' },
                { label: 'New Visits', value: dayBookRecords.filter(r => r.visitType === 'New').length, color: 'text-[#147C8A]' },
                { label: 'Follow-Up', value: dayBookRecords.filter(r => r.visitType !== 'New').length, color: 'text-amber-700' },
              ].map((c) => (
                <div key={c.label} className="bg-white border border-[#D7E8EA] rounded-2xl p-4">
                  <p className="text-xs text-[#64748B]">{c.label}</p>
                  <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Day Book Table */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-[#D7E8EA] px-6 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-[#1E293B]">Day Book — {dayBookDate}</span>
              <span className="text-xs text-[#64748B]">{dayBookRecords.length} record(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#D7E8EA] bg-[#EAF7F8]">
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">S.No</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">OP ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">UHID</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Patient Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Doctor</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Dept</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Token</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Visit</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Fee (Rs.)</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dayBookLoading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-[#64748B]">Loading day book...</td>
                    </tr>
                  ) : dayBookRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-[#64748B]">No patients registered on {dayBookDate}. Select a date and click Get Data.</td>
                    </tr>
                  ) : dayBookRecords.map((r, i) => (
                    <tr key={r.id} className="border-b border-[#D7E8EA]/60 hover:bg-[#EAF7F8] transition-colors">
                      <td className="py-3 px-4 text-[#64748B]">{i + 1}</td>
                      <td className="py-3 px-4 font-bold text-[#147C8A]">{r.id}</td>
                      <td className="py-3 px-4 font-mono text-[#1E293B]">{r.uhid}</td>
                      <td className="py-3 px-4 font-semibold text-[#1E293B]">{r.patient?.patientName || 'N/A'}</td>
                      <td className="py-3 px-4 text-[#1E293B]">{r.assignedDoctor?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-[#1E293B]">{r.department?.deptName || 'N/A'}</td>
                      <td className="py-3 px-4 text-amber-700 font-bold">{r.tokenNumber}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.visitType === 'New' ? 'bg-[#EAF7F8] text-[#147C8A]' : 'bg-[#147C8A]/10 text-purple-400'
                        }`}>
                          {r.visitType || 'New'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">Rs. {r.consultingFee || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          r.status === 'InConsultation' ? 'bg-[#EAF7F8] text-[#147C8A]' :
                          r.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {r.status || 'Waiting'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {dayBookRecords.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-[#D7E8EA] bg-[#EAF7F8]">
                      <td colSpan={8} className="py-3 px-4 text-sm font-bold text-[#1E293B] text-right">Total Collection:</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 text-sm">
                        Rs. {dayBookRecords.reduce((s, r) => s + (r.consultingFee || 0), 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: DPSR – Daily Patient Situation Report ─────────────────── */}
      {subTab === 'dpsr' && (
        <div className="space-y-6">
          {/* Header Banner matching the image */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 text-green-700 rounded-xl border border-emerald-500/20">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#1E293B]">
                    OP- Daily Patient Situation Report (DPSR)
                  </h1>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    View and update outpatient daily vital parameters &amp; complaints
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 self-end md:self-auto">
                <span className="text-xs font-semibold text-[#1E293B] bg-[#F8FBFB] px-3 py-1.5 rounded-lg border border-[#D7E8EA]">
                  Today: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={handleDpsrSearch}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F8FBFB] border border-[#D7E8EA] text-[#147C8A] hover:bg-[#F8FBFB] transition-all flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setSubTab('billing')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] hover:bg-[#F8FBFB] transition-all"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>

          {/* Search input row */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-[#1E293B]">OP ID :</span>
              <input
                type="text"
                value={dpsrOpId}
                onChange={(e) => setDpsrOpId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDpsrSearch()}
                placeholder="Enter OP ID (e.g. 1, 2, 3...)"
                className="px-4 py-2 rounded-lg text-sm text-[#1E293B] font-bold border border-[#D7E8EA] w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                style={{ backgroundColor: '#d1f7d9' }}
              />
              <button
                onClick={handleDpsrSearch}
                disabled={isSearchingDpsr}
                className="px-5 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-[#147C8A]/10 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSearchingDpsr ? 'Loading...' : 'Get Data'}
              </button>
            </div>
            {dpsrError && (
              <p className="text-red-400 text-xs mt-2 font-semibold">{dpsrError}</p>
            )}
            {dpsrSaveSuccess && (
              <div className="flex items-center space-x-2 mt-3 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{dpsrSaveSuccess}</span>
              </div>
            )}
          </div>

          {/* Patient Details & Situation Form */}
          {dpsrRecord && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Patient & Visit Info */}
              <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 space-y-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] border-b border-[#D7E8EA] pb-2">
                  Patient &amp; Visit Details
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">Patient Name</span>
                    <span className="font-semibold text-[#1E293B]">{dpsrRecord.patient?.patientName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">UHID</span>
                    <span className="font-mono font-bold text-[#147C8A]">{dpsrRecord.uhid}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">OP ID</span>
                    <span className="font-bold text-[#1E293B]">{dpsrRecord.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">Age / Gender</span>
                    <span className="font-semibold text-[#1E293B]">
                      {dpsrRecord.ageValue} {dpsrRecord.ageUnit} / {dpsrRecord.patient?.gender || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">Visit Date &amp; Time</span>
                    <span className="font-semibold text-[#1E293B]">
                      {dpsrRecord.visitDate} {dpsrRecord.visitTime ? dpsrRecord.visitTime.substring(0, 5) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">Assigned Doctor</span>
                    <span className="font-semibold text-[#1E293B]">
                      Dr. {dpsrRecord.assignedDoctor?.name || 'N/A'} ({dpsrRecord.assignedDoctor?.specialization || 'N/A'})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">Department</span>
                    <span className="font-semibold text-[#1E293B]">{dpsrRecord.department?.deptName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">Visit Type</span>
                    <span className="font-semibold text-[#1E293B]">{dpsrRecord.visitType || 'New'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">Token Number</span>
                    <span className="font-semibold text-amber-700">Token No: {dpsrRecord.tokenNumber || '0'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D7E8EA]/60 pb-2">
                    <span className="text-[#64748B]">Consulting Fee</span>
                    <span className="font-bold text-[#1E293B]">Rs. {dpsrRecord.consultingFee || 0}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-[#64748B]">Payment Status</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      dpsrRecord.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {dpsrRecord.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center & Right Column: Situation Form (Vitals, Chief Complaint, Remarks) */}
              <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 lg:col-span-2 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#D7E8EA] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Patient Situation &amp; Vitals Entry
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[#64748B]">Visit Status:</span>
                    <select
                      value={dpsrRecord.status}
                      onChange={(e) => setDpsrRecord({ ...dpsrRecord, status: e.target.value })}
                      className="border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Waiting">Waiting</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="InConsultation">InConsultation</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Completed">Completed</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-[#64748B] font-medium block mb-1">Temperature (°F)</label>
                    <input
                      type="text"
                      value={dpsrRecord.tempF || ''}
                      onChange={(e) => setDpsrRecord({ ...dpsrRecord, tempF: e.target.value })}
                      placeholder="e.g. 98.6"
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#64748B] font-medium block mb-1">Pulse Rate (bpm)</label>
                    <input
                      type="text"
                      value={dpsrRecord.pulseRate || ''}
                      onChange={(e) => setDpsrRecord({ ...dpsrRecord, pulseRate: e.target.value })}
                      placeholder="e.g. 72"
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#64748B] font-medium block mb-1">Respiratory Rate (rpm)</label>
                    <input
                      type="text"
                      value={dpsrRecord.respiratoryRate || ''}
                      onChange={(e) => setDpsrRecord({ ...dpsrRecord, respiratoryRate: e.target.value })}
                      placeholder="e.g. 18"
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#64748B] font-medium block mb-1">SpO2 (%)</label>
                    <input
                      type="text"
                      value={dpsrRecord.spo2 || ''}
                      onChange={(e) => setDpsrRecord({ ...dpsrRecord, spo2: e.target.value })}
                      placeholder="e.g. 98"
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#64748B] font-medium block mb-1">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      value={dpsrRecord.bloodPressure || ''}
                      onChange={(e) => setDpsrRecord({ ...dpsrRecord, bloodPressure: e.target.value })}
                      placeholder="e.g. 120/80"
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#64748B] font-medium block mb-1">Weight (kg)</label>
                    <input
                      type="text"
                      value={dpsrRecord.weight || ''}
                      onChange={(e) => setDpsrRecord({ ...dpsrRecord, weight: e.target.value })}
                      placeholder="e.g. 70"
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#64748B] font-medium block mb-1">Height (cm)</label>
                    <input
                      type="text"
                      value={dpsrRecord.height || ''}
                      onChange={(e) => setDpsrRecord({ ...dpsrRecord, height: e.target.value })}
                      placeholder="e.g. 175"
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                    />
                  </div>
                </div>

                {/* Chief Complaint */}
                <div>
                  <label className="text-xs text-[#64748B] font-medium block mb-1">Chief Complaint</label>
                  <textarea
                    rows={3}
                    value={dpsrRecord.chiefComplaint || ''}
                    onChange={(e) => setDpsrRecord({ ...dpsrRecord, chiefComplaint: e.target.value })}
                    placeholder="Describe patient's symptoms or complaints..."
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="text-xs text-[#64748B] font-medium block mb-1">Doctor Remarks / Notes</label>
                  <textarea
                    rows={3}
                    value={dpsrRecord.remarks || ''}
                    onChange={(e) => setDpsrRecord({ ...dpsrRecord, remarks: e.target.value })}
                    placeholder="Enter additional remarks or consultation notes..."
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={handleSaveDpsr}
                    disabled={isSavingDpsr}
                    className="px-5 py-2.5 bg-[#22C55E] hover:bg-emerald-400 text-[#1E293B] text-xs font-bold rounded-lg shadow-md hover:shadow-emerald-500/25 transition-all flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingDpsr ? 'Saving...' : 'Save Situation Report'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: Collection Report ─────────────────────────────────────── */}
      {subTab === 'collection' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-12 text-center shadow-sm">
          <TrendingUp className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#64748B]">Collection Report</h2>
          <p className="text-sm text-[#64748B] mt-2">Detailed collection analytics coming soon.</p>
        </div>
      )}

      {/* ── TAB 5: TPA / Insurance ──────────────────────────────────────── */}
      {subTab === 'tpa' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-12 text-center shadow-sm">
          <FileText className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#64748B]">TPA / Insurance</h2>
          <p className="text-sm text-[#64748B] mt-2">Third-party administration and insurance claim tracking coming soon.</p>
        </div>
      )}

      {/* ── TAB 6: Billing History ──────────────────────────────────────── */}
      {subTab === 'history' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-12 text-center shadow-sm">
          <ChevronRight className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#64748B]">Billing History</h2>
          <p className="text-sm text-[#64748B] mt-2">Historical billing records and audit trail coming soon.</p>
        </div>
      )}
    </div>
  );
}
