import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Activity, 
  Plus, 
  Printer, 
  ChevronRight, 
  Clock, 
  ArrowRight, 
  ClipboardList,
  AlertCircle
} from 'lucide-react';

interface Patient {
  id: number;
  uhid: string;
  patientName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  mobile: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  department: {
    id: number;
    deptName: string;
  };
}

interface OTBooking {
  id: number;
  patient: Patient;
  uhid: string;
  surgeon: Doctor;
  otRoom: string;
  surgeryDate: string;
  surgeryTime: string;
  surgeryName: string;
  preOpCheckCompleted: boolean;
  status: string; // Scheduled, InProgress, Completed, Cancelled
}

interface SurgeryRecord {
  id: number;
  otBooking: OTBooking;
  assistantSurgeon: string;
  anesthesiaType: string;
  startTime: string;
  endTime: string;
  complications: string;
  postOpNotes: string;
  surgeryNotes: string;
}

interface OPInvestigation {
  id: number;
  patient: Patient;
  uhid: string;
  orderingDoctor: Doctor;
  testName: string;
  testCategory: string; // Lab, Imaging
  orderDateTime: string;
  sampleCollected: boolean;
  status: string; // Ordered, SampleCollected, ResultEntered, Verified
}

interface LabResult {
  id: number;
  investigation: OPInvestigation;
  resultValue: string;
  referenceRange: string;
  remarks: string;
  labTechnician: string;
  verifiedBy?: string;
  verificationDateTime?: string;
}

export default function OPCSView({ initialSubTab = 'ot' }: { initialSubTab?: 'ot' | 'diagnostics' | 'reports' }) {
  const [subTab, setSubTab] = useState<'ot' | 'diagnostics' | 'reports'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Master data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [otBookings, setOtBookings] = useState<OTBooking[]>([]);
  const [activeInvestigations, setActiveInvestigations] = useState<OPInvestigation[]>([]);

  // Search Patient
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // OT Booking Form State
  const [bookingForm, setBookingForm] = useState({
    surgeonId: '',
    otRoom: 'OT-1',
    surgeryDate: '',
    surgeryTime: '',
    surgeryName: ''
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Surgery Log Form State
  const [selectedBookingForLog, setSelectedBookingForLog] = useState<OTBooking | null>(null);
  const [surgeryLogForm, setSurgeryLogForm] = useState({
    assistantSurgeon: '',
    anesthesiaType: 'General',
    startTime: '',
    endTime: '',
    complications: '',
    postOpNotes: '',
    surgeryNotes: ''
  });
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [printedSurgeryRecord, setPrintedSurgeryRecord] = useState<SurgeryRecord | null>(null);

  // Diagnostics Ordering Form State
  const [diagForm, setDiagForm] = useState({
    doctorId: '',
    testName: 'Complete Blood Count',
    testCategory: 'Lab'
  });
  const [isSubmittingDiag, setIsSubmittingDiag] = useState(false);

  // Results & Verification Forms
  const [selectedInvestigation, setSelectedInvestigation] = useState<OPInvestigation | null>(null);
  const [resultForm, setResultForm] = useState({
    resultValue: '',
    referenceRange: '',
    remarks: '',
    labTechnician: ''
  });
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  const [verifyForm, setVerifyForm] = useState({
    verifiedBy: ''
  });
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  // Patient Reports Search Desk
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [patientHistoryList, setPatientHistoryList] = useState<OPInvestigation[]>([]);
  const [isHistorySearching, setIsHistorySearching] = useState(false);
  const [viewedReportResult, setViewedReportResult] = useState<LabResult | null>(null);
  const [viewedReportInv, setViewedReportInv] = useState<OPInvestigation | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchOTBookings();
    fetchActiveInvestigations();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/v1/op/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchOTBookings = async () => {
    try {
      const res = await fetch('/api/v1/opcs/bookings');
      if (res.ok) {
        const data = await res.json();
        setOtBookings(data);
      }
    } catch (err) {
      console.error('Error fetching OT bookings:', err);
    }
  };

  const fetchActiveInvestigations = async () => {
    try {
      const res = await fetch('/api/v1/investigations/active');
      if (res.ok) {
        const data = await res.json();
        setActiveInvestigations(data);
      }
    } catch (err) {
      console.error('Error fetching active investigations:', err);
    }
  };

  const handlePatientSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/v1/patients/search?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Error searching patients:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setIsSubmittingBooking(true);
    try {
      const res = await fetch('/api/v1/opcs/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          surgeonId: bookingForm.surgeonId,
          otRoom: bookingForm.otRoom,
          surgeryDate: bookingForm.surgeryDate,
          surgeryTime: bookingForm.surgeryTime,
          surgeryName: bookingForm.surgeryName
        })
      });

      if (res.ok) {
        setSelectedPatient(null);
        setSearchQuery('');
        setSearchResults([]);
        setBookingForm({
          surgeonId: '',
          otRoom: 'OT-1',
          surgeryDate: '',
          surgeryTime: '',
          surgeryName: ''
        });
        fetchOTBookings();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to book OT slot');
      }
    } catch (err) {
      console.error('Error booking OT slot:', err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const togglePreOp = async (bookingId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/v1/opcs/bookings/${bookingId}/pre-op`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      if (res.ok) {
        fetchOTBookings();
      }
    } catch (err) {
      console.error('Error toggling pre-op check:', err);
    }
  };

  const handleSurgeryLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForLog) return;
    setIsSubmittingLog(true);
    try {
      const res = await fetch(`/api/v1/opcs/bookings/${selectedBookingForLog.id}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surgeryLogForm)
      });

      if (res.ok) {
        const record = await res.json();
        setPrintedSurgeryRecord(record);
        setSelectedBookingForLog(null);
        setSurgeryLogForm({
          assistantSurgeon: '',
          anesthesiaType: 'General',
          startTime: '',
          endTime: '',
          complications: '',
          postOpNotes: '',
          surgeryNotes: ''
        });
        fetchOTBookings();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record surgery log');
      }
    } catch (err) {
      console.error('Error submitting surgery log:', err);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleDiagOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setIsSubmittingDiag(true);
    try {
      const res = await fetch('/api/v1/investigations/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          doctorId: diagForm.doctorId,
          testName: diagForm.testName,
          testCategory: diagForm.testCategory
        })
      });

      if (res.ok) {
        setSelectedPatient(null);
        setSearchQuery('');
        setSearchResults([]);
        setDiagForm(prev => ({
          ...prev,
          doctorId: '',
          testName: 'Complete Blood Count'
        }));
        fetchActiveInvestigations();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to order investigation');
      }
    } catch (err) {
      console.error('Error ordering investigation:', err);
    } finally {
      setIsSubmittingDiag(false);
    }
  };

  const collectSample = async (invId: number) => {
    try {
      const res = await fetch(`/api/v1/investigations/${invId}/collect`, { method: 'POST' });
      if (res.ok) {
        fetchActiveInvestigations();
      }
    } catch (err) {
      console.error('Error collecting sample:', err);
    }
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestigation) return;
    setIsSubmittingResult(true);
    try {
      const res = await fetch(`/api/v1/investigations/${selectedInvestigation.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultForm)
      });

      if (res.ok) {
        setSelectedInvestigation(null);
        setResultForm({
          resultValue: '',
          referenceRange: '',
          remarks: '',
          labTechnician: ''
        });
        fetchActiveInvestigations();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to enter results');
      }
    } catch (err) {
      console.error('Error recording results:', err);
    } finally {
      setIsSubmittingResult(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestigation) return;
    setIsSubmittingVerify(true);
    try {
      const res = await fetch(`/api/v1/investigations/${selectedInvestigation.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyForm)
      });

      if (res.ok) {
        setSelectedInvestigation(null);
        setVerifyForm({ verifiedBy: '' });
        fetchActiveInvestigations();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to verify results');
      }
    } catch (err) {
      console.error('Error verifying results:', err);
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  const handleReportSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportSearchQuery.trim()) return;
    setIsHistorySearching(true);
    try {
      const res = await fetch(`/api/v1/investigations/history?uhid=${encodeURIComponent(reportSearchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setPatientHistoryList(data);
      }
    } catch (err) {
      console.error('Error searching patient diagnostics history:', err);
    } finally {
      setIsHistorySearching(false);
    }
  };

  const loadReportDetails = async (inv: OPInvestigation) => {
    setViewedReportInv(inv);
    setViewedReportResult(null);
    if (inv.status === 'ResultEntered' || inv.status === 'Verified') {
      try {
        const res = await fetch(`/api/v1/investigations/${inv.id}/result`);
        if (res.ok) {
          const data = await res.json();
          setViewedReportResult(data);
        }
      } catch (err) {
        console.error('Error loading result detail:', err);
      }
    }
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D7E8EA] pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide flex items-center space-x-2">
            <ClipboardList className="w-6 h-6 text-[#147C8A]" />
            <span>OPCS & Investigations Desk</span>
          </h1>
          <p className="text-sm text-[#64748B]">Manage surgery schedules, anesthesia records, diagnostics requests, and lab reports.</p>
        </div>

        <div className="flex bg-[#F8FBFB] p-1 rounded-xl border border-[#D7E8EA] self-start">
          <button
            onClick={() => { setSubTab('ot'); setPrintedSurgeryRecord(null); setViewedReportInv(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'ot' ? 'bg-[#147C8A] text-white' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Operation Theatre (OPCS)
          </button>
          <button
            onClick={() => { setSubTab('diagnostics'); setPrintedSurgeryRecord(null); setViewedReportInv(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'diagnostics' ? 'bg-[#147C8A] text-white' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Diagnostics Desk
          </button>
          <button
            onClick={() => { setSubTab('reports'); setPrintedSurgeryRecord(null); setViewedReportInv(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'reports' ? 'bg-[#147C8A] text-white' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Diagnostic Reports Board
          </button>
        </div>
      </div>

      {/* --- SUBTAB 1: OPERATION THEATRE (OPCS) --- */}
      {subTab === 'ot' && (
        <div className="space-y-6">
          {printedSurgeryRecord ? (
            <div className="max-w-2xl mx-auto bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-8 relative overflow-hidden shadow-2xl printable-ticket">
              <div className="text-center border-b border-[#D7E8EA] pb-6">
                <span className="text-[10px] font-bold tracking-widest text-[#147C8A] uppercase">
                  {localStorage.getItem('hms_hospital_name') || 'HMS CLINIC'}
                </span>
                <h2 className="text-xl font-bold text-[#1E293B] mt-1">SURGERY REPORT & LOGS</h2>
                <p className="text-xs text-[#64748B] mt-1">OT Room: {printedSurgeryRecord.otBooking.otRoom} | Date: {printedSurgeryRecord.otBooking.surgeryDate}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 my-6 text-sm">
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Patient Name</span>
                  <strong className="text-[#1E293B]">{printedSurgeryRecord.otBooking.patient.patientName}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">UHID</span>
                  <strong className="text-[#147C8A] font-mono">{printedSurgeryRecord.otBooking.uhid}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Primary Surgeon</span>
                  <strong className="text-[#1E293B]">{printedSurgeryRecord.otBooking.surgeon.name}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Assistant Surgeon</span>
                  <strong className="text-[#1E293B]">{printedSurgeryRecord.assistantSurgeon || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Anesthesia Type</span>
                  <strong className="text-[#1E293B]">{printedSurgeryRecord.anesthesiaType}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Duration (Time)</span>
                  <strong className="text-[#1E293B]">{printedSurgeryRecord.startTime} - {printedSurgeryRecord.endTime}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Surgical Findings & Notes</span>
                  <p className="text-[#1E293B] mt-1 bg-white p-2.5 rounded-lg border border-[#D7E8EA] text-xs">{printedSurgeryRecord.surgeryNotes || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Complications (if any)</span>
                  <p className="text-[#1E293B] mt-1 bg-white p-2.5 rounded-lg border border-[#D7E8EA] text-xs">{printedSurgeryRecord.complications || 'None'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Post-Operative Recovery Advice</span>
                  <p className="text-[#1E293B] mt-1 bg-white p-2.5 rounded-lg border border-[#D7E8EA] text-xs">{printedSurgeryRecord.postOpNotes || 'N/A'}</p>
                </div>
              </div>

              <div className="flex space-x-3 justify-end mt-8 border-t border-[#D7E8EA] pt-6 no-print">
                <button
                  onClick={() => setPrintedSurgeryRecord(null)}
                  className="px-4 py-2 bg-white border border-[#D7E8EA] hover:border-[#D7E8EA] text-[#1E293B] rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
                <button
                  onClick={printDocument}
                  className="px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Surgery Log</span>
                </button>
              </div>
            </div>
          ) : selectedBookingForLog ? (
            <form onSubmit={handleSurgeryLogSubmit} className="max-w-3xl mx-auto bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-[#147C8A]" />
                <span>Record Surgery Record: {selectedBookingForLog.surgeryName}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase">Assistant Surgeon / Clinical Staff</label>
                  <input
                    type="text"
                    placeholder="Enter assistant surgeon name"
                    value={surgeryLogForm.assistantSurgeon}
                    onChange={e => setSurgeryLogForm({ ...surgeryLogForm, assistantSurgeon: e.target.value })}
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase">Anesthesia Type *</label>
                  <select
                    value={surgeryLogForm.anesthesiaType}
                    onChange={e => setSurgeryLogForm({ ...surgeryLogForm, anesthesiaType: e.target.value })}
                    className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                  >
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="General">General</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Spinal">Spinal</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Local">Local</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Epidural">Epidural</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase">Surgery Start Time *</label>
                  <input
                    type="time"
                    required
                    value={surgeryLogForm.startTime}
                    onChange={e => setSurgeryLogForm({ ...surgeryLogForm, startTime: e.target.value })}
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase">Surgery End Time *</label>
                  <input
                    type="time"
                    required
                    value={surgeryLogForm.endTime}
                    onChange={e => setSurgeryLogForm({ ...surgeryLogForm, endTime: e.target.value })}
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase">Surgical Findings & Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record surgical notes, findings, and procedures done"
                  value={surgeryLogForm.surgeryNotes}
                  onChange={e => setSurgeryLogForm({ ...surgeryLogForm, surgeryNotes: e.target.value })}
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-3 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase">Complications (if any)</label>
                <textarea
                  rows={2}
                  placeholder="Record complications occurred during surgery"
                  value={surgeryLogForm.complications}
                  onChange={e => setSurgeryLogForm({ ...surgeryLogForm, complications: e.target.value })}
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-3 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase">Post-Operative Recovery Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Write post-op monitoring logs, ward advice, and medication logs"
                  value={surgeryLogForm.postOpNotes}
                  onChange={e => setSurgeryLogForm({ ...surgeryLogForm, postOpNotes: e.target.value })}
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-3 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForLog(null)}
                  className="px-5 py-2.5 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLog}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-[#1E293B] font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  {isSubmittingLog ? 'Recording logs...' : 'Save Surgery Log'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Book Surgery Slot */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
                  <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 mb-4 flex items-center space-x-2">
                    <Search className="w-5 h-5 text-[#147C8A]" />
                    <span>Search Patient for OT</span>
                  </h3>
                  
                  <form onSubmit={handlePatientSearch} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-[#64748B]" />
                      <input 
                        type="text"
                        placeholder="Search by UHID, Name or Mobile"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSearching}
                      className="px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] disabled:bg-[#D7E8EA] text-white disabled:text-[#94A3B8] font-bold rounded-xl text-xs"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {searchResults.map(patient => (
                        <div
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatient(patient);
                            if (doctors.length > 0) setBookingForm(prev => ({ ...prev, surgeonId: String(doctors[0].id) }));
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                            selectedPatient?.id === patient.id
                              ? 'bg-[#EAF7F8]/25 border-[#147C8A]/50 text-white'
                              : 'bg-[#F8FBFB] border-[#D7E8EA] text-[#64748B] hover:border-[#D7E8EA]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[#147C8A] font-mono">{patient.uhid}</span>
                            <h4 className="text-xs font-bold text-[#1E293B]">{patient.patientName}</h4>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#64748B]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPatient && (
                  <form onSubmit={handleBookingSubmit} className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-5">
                    <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 mb-2 flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-[#147C8A]" />
                      <span>Schedule Surgery slot</span>
                    </h3>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#64748B] block uppercase font-semibold">Patient File</span>
                      <strong className="text-sm text-[#1E293B]">{selectedPatient.patientName}</strong>
                      <span className="block text-[10px] text-[#147C8A] font-mono">{selectedPatient.uhid}</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#64748B] uppercase">Primary Surgeon *</label>
                      <select
                        required
                        value={bookingForm.surgeonId}
                        onChange={e => setBookingForm({ ...bookingForm, surgeonId: e.target.value })}
                        className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                      >
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Surgeon</option>
                        {doctors.map(doc => (
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#64748B] uppercase">Surgery Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Appendectomy, Hernioplasty"
                        value={bookingForm.surgeryName}
                        onChange={e => setBookingForm({ ...bookingForm, surgeryName: e.target.value })}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B] uppercase">OT Room *</label>
                        <select
                          value={bookingForm.otRoom}
                          onChange={e => setBookingForm({ ...bookingForm, otRoom: e.target.value })}
                          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                        >
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="OT-1">OT Room 1</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="OT-2">OT Room 2</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="ICU-OT">ICU Minor OT</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B] uppercase">Surgery Time *</label>
                        <input
                          type="time"
                          required
                          value={bookingForm.surgeryTime}
                          onChange={e => setBookingForm({ ...bookingForm, surgeryTime: e.target.value })}
                          className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#64748B] uppercase">Surgery Date *</label>
                      <input
                        type="date"
                        required
                        value={bookingForm.surgeryDate}
                        onChange={e => setBookingForm({ ...bookingForm, surgeryDate: e.target.value })}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-[#1E293B] font-bold py-3 rounded-xl text-xs uppercase tracking-wider"
                    >
                      {isSubmittingBooking ? 'Scheduling Slot...' : 'Confirm OT Schedule'}
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Scheduled Surgeries Board */}
              <div className="lg:col-span-7 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
                <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3">OT Schedule Census ({otBookings.length})</h3>

                {otBookings.length === 0 ? (
                  <div className="text-center py-12 text-[#64748B] space-y-2">
                    <Activity className="w-8 h-8 text-[#64748B] mx-auto" />
                    <p className="text-xs">No surgeries scheduled today.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {otBookings.map(booking => (
                      <div key={booking.id} className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-4 space-y-4 hover:border-[#D7E8EA] transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-[#147C8A] font-mono block">{booking.uhid}</span>
                            <h4 className="text-sm font-bold text-[#1E293B] mt-1">{booking.patient.patientName}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            booking.status === 'Completed' ? 'bg-green-50 border border-green-200 text-emerald-700' : 'bg-[#EAF7F8] border border-[#D7E8EA] text-[#147C8A]'
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#64748B] pt-3 border-t border-[#D7E8EA]/80">
                          <div>
                            <span className="text-[10px] text-[#64748B] block font-semibold">Surgery</span>
                            <strong className="text-[#1E293B]">{booking.surgeryName}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#64748B] block font-semibold">OT Room & Time</span>
                            <strong className="text-[#1E293B]">{booking.otRoom} @ {booking.surgeryTime}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#64748B] block font-semibold">Surgeon</span>
                            <strong className="text-[#1E293B]">{booking.surgeon.name}</strong>
                          </div>
                        </div>

                        {booking.status !== 'Completed' && (
                          <div className="flex justify-between items-center bg-[#F8FBFB] p-2.5 rounded-xl border border-[#D7E8EA] pt-3 flex-wrap gap-2 text-xs">
                            <label className="flex items-center space-x-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={booking.preOpCheckCompleted}
                                onChange={() => togglePreOp(booking.id, booking.preOpCheckCompleted)}
                                className="w-3.5 h-3.5 rounded bg-[#F8FBFB] border-[#D7E8EA] text-[#147C8A]"
                              />
                              <span className="text-[11px] font-bold text-[#64748B]">Pre-Op Checklist Completed</span>
                            </label>

                            <button
                              disabled={!booking.preOpCheckCompleted}
                              onClick={() => {
                                setSelectedBookingForLog(booking);
                                setSurgeryLogForm(prev => ({
                                  ...prev,
                                  startTime: booking.surgeryTime
                                }));
                              }}
                              className="px-3.5 py-1.5 bg-[#147C8A] hover:bg-[#0F6672] disabled:bg-[#F8FBFB] disabled:text-[#64748B] text-[#1E293B] font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all"
                            >
                              Record Surgery Log
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 2: DIAGNOSTICS DESK --- */}
      {subTab === 'diagnostics' && (
        <div className="space-y-6">
          {selectedInvestigation ? (
            <div className="max-w-xl mx-auto bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
              <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-[#147C8A]" />
                <span>{selectedInvestigation.status === 'SampleCollected' ? 'Enter Test Results' : 'Verify Test Results'}</span>
              </h3>

              {/* Order demographic header */}
              <div className="bg-[#F8FBFB] p-4 rounded-xl border border-[#D7E8EA] text-xs space-y-1">
                <div>Patient Name: <strong className="text-[#1E293B]">{selectedInvestigation.patient.patientName}</strong> (UHID: {selectedInvestigation.uhid})</div>
                <div>Test Requested: <strong className="text-[#147C8A]">{selectedInvestigation.testName}</strong> ({selectedInvestigation.testCategory})</div>
                <div>Ordering Doctor: <strong className="text-[#1E293B]">{selectedInvestigation.orderingDoctor.name}</strong></div>
              </div>

              {selectedInvestigation.status === 'SampleCollected' ? (
                <form onSubmit={handleResultSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#64748B] uppercase">Result Value *</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. 13.5 g/dL, Normal"
                        value={resultForm.resultValue}
                        onChange={e => setResultForm({ ...resultForm, resultValue: e.target.value })}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#64748B] uppercase">Normal Reference Range</label>
                      <input 
                        type="text"
                        placeholder="e.g. 12.0 - 16.0 g/dL"
                        value={resultForm.referenceRange}
                        onChange={e => setResultForm({ ...resultForm, referenceRange: e.target.value })}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#64748B] uppercase">Remarks / Technical Observations</label>
                    <textarea 
                      rows={2}
                      placeholder="Add pathologist/technician remarks"
                      value={resultForm.remarks}
                      onChange={e => setResultForm({ ...resultForm, remarks: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#64748B] uppercase">Lab Technician *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. John Doe, Lab Tech"
                      value={resultForm.labTechnician}
                      onChange={e => setResultForm({ ...resultForm, labTechnician: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setSelectedInvestigation(null)} className="px-4 py-2 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#64748B] rounded-lg text-xs font-bold">Cancel</button>
                    <button type="submit" disabled={isSubmittingResult} className="px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-lg text-xs">Save Results</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#64748B] uppercase">Verified Pathologist / Radiologist *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Sharma, MD"
                      value={verifyForm.verifiedBy}
                      onChange={e => setVerifyForm({ ...verifyForm, verifiedBy: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setSelectedInvestigation(null)} className="px-4 py-2 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#64748B] rounded-lg text-xs font-bold">Cancel</button>
                    <button type="submit" disabled={isSubmittingVerify} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#1E293B] font-bold rounded-lg text-xs">Approve & Verify Report</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Order Diagnostics */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
                  <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 mb-4 flex items-center space-x-2">
                    <Search className="w-5 h-5 text-[#147C8A]" />
                    <span>Find Patient for Tests</span>
                  </h3>
                  
                  <form onSubmit={handlePatientSearch} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-[#64748B]" />
                      <input 
                        type="text"
                        placeholder="Search by UHID, Name or Mobile"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSearching}
                      className="px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] disabled:bg-[#D7E8EA] text-white disabled:text-[#94A3B8] font-bold rounded-xl text-xs"
                    >
                      Search
                    </button>
                  </form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {searchResults.map(patient => (
                        <div
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatient(patient);
                            if (doctors.length > 0) setDiagForm(prev => ({ ...prev, doctorId: String(doctors[0].id) }));
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                            selectedPatient?.id === patient.id
                              ? 'bg-[#EAF7F8]/25 border-[#147C8A]/50 text-white'
                              : 'bg-[#F8FBFB] border-[#D7E8EA] text-[#64748B] hover:border-[#D7E8EA]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[#147C8A] font-mono">{patient.uhid}</span>
                            <h4 className="text-xs font-bold text-[#1E293B]">{patient.patientName}</h4>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#64748B]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPatient && (
                  <form onSubmit={handleDiagOrderSubmit} className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-5">
                    <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 mb-2 flex items-center space-x-2">
                      <Plus className="w-5 h-5 text-[#147C8A]" />
                      <span>Order Diagnostics</span>
                    </h3>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#64748B] block uppercase font-semibold">Patient File</span>
                      <strong className="text-sm text-[#1E293B]">{selectedPatient.patientName}</strong>
                      <span className="block text-[10px] text-[#147C8A] font-mono">{selectedPatient.uhid}</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#64748B] uppercase">Ordering Doctor *</label>
                      <select
                        required
                        value={diagForm.doctorId}
                        onChange={e => setDiagForm({ ...diagForm, doctorId: e.target.value })}
                        className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                      >
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Doctor</option>
                        {doctors.map(doc => (
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#64748B] uppercase">Investigation Test Name *</label>
                      <select
                        value={diagForm.testName}
                        onChange={e => {
                          const cat = e.target.value.includes('X-Ray') || e.target.value.includes('Scan') ? 'Imaging' : 'Lab';
                          setDiagForm({ ...diagForm, testName: e.target.value, testCategory: cat });
                        }}
                        className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                      >
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Complete Blood Count">Complete Blood Count (CBC)</option>
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Lipid Profile">Lipid Profile</option>
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Thyroid Profile">Thyroid Profile (T3, T4, TSH)</option>
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="ECG">Electrocardiogram (ECG)</option>
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Chest X-Ray">Chest X-Ray</option>
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Abdominal Ultrasound">Abdominal Ultrasound</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#64748B] block uppercase font-semibold">Test Category</span>
                      <strong className="text-xs bg-[#F8FBFB] px-3 py-1.5 rounded-lg border border-[#D7E8EA] inline-block text-white font-bold">{diagForm.testCategory}</strong>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingDiag}
                      className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-[#1E293B] font-bold py-3 rounded-xl text-xs uppercase tracking-wider"
                    >
                      {isSubmittingDiag ? 'Placing Order...' : 'Confirm Test Order'}
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Pending Lab Registry */}
              <div className="lg:col-span-7 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
                <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3">Diagnostic Registries ({activeInvestigations.length})</h3>

                {activeInvestigations.length === 0 ? (
                  <div className="text-center py-12 text-[#64748B] space-y-2">
                    <Activity className="w-8 h-8 text-[#64748B] mx-auto" />
                    <p className="text-xs">No pending diagnostic tests available.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {activeInvestigations.map(inv => (
                      <div key={inv.id} className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-4 space-y-4 hover:border-[#D7E8EA] transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-[#147C8A] font-mono block">{inv.uhid}</span>
                            <h4 className="text-sm font-bold text-[#1E293B] mt-1">{inv.patient.patientName}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            inv.status === 'Verified' ? 'bg-green-50 border border-green-200 text-emerald-700' : 
                            inv.status === 'ResultEntered' ? 'bg-[#EAF7F8] border border-[#D7E8EA] text-[#147C8A]' :
                            inv.status === 'SampleCollected' ? 'bg-amber-100/15 border border-amber-900/30 text-amber-700' :
                            'bg-white border border-[#D7E8EA] text-[#64748B]'
                          }`}>
                            {inv.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#64748B] pt-3 border-t border-[#D7E8EA]/80">
                          <div>
                            <span className="text-[10px] text-[#64748B] block font-semibold">Test Name</span>
                            <strong className="text-[#1E293B]">{inv.testName}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#64748B] block font-semibold">Category</span>
                            <strong className="text-[#1E293B]">{inv.testCategory}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#64748B] block font-semibold">Ordered By</span>
                            <strong className="text-[#1E293B]">{inv.orderingDoctor.name}</strong>
                          </div>
                        </div>

                        {/* Action buttons based on status */}
                        <div className="flex justify-end space-x-2 pt-2 border-t border-[#D7E8EA]/40">
                          {inv.status === 'Ordered' && (
                            <>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to cancel the test order "${inv.testName}" for ${inv.patient.patientName}?`)) {
                                    try {
                                      const res = await fetch(`/api/v1/investigations/${inv.id}`, { method: 'DELETE' });
                                      if (res.ok) {
                                        fetchActiveInvestigations();
                                      } else {
                                        const err = await res.json();
                                        alert(err.error || 'Failed to cancel diagnostic order');
                                      }
                                    } catch (e) {
                                      alert('Error cancelling diagnostic order');
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors"
                              >
                                Cancel Order
                              </button>
                              <button
                                onClick={() => collectSample(inv.id)}
                                className="px-3 py-1.5 bg-[#F59E0B] hover:bg-[#F59E0B] text-[#1E293B] font-bold rounded-lg text-[10px] uppercase tracking-wider"
                              >
                                Collect Sample
                              </button>
                            </>
                          )}
                          {inv.status === 'SampleCollected' && (
                            <button
                              onClick={() => {
                                setSelectedInvestigation(inv);
                                setResultForm({
                                  resultValue: '',
                                  referenceRange: inv.testName.includes('Blood') ? '12.0 - 16.0 g/dL' : inv.testName.includes('Lipid') ? '< 200 mg/dL' : 'Normal',
                                  remarks: '',
                                  labTechnician: 'Pathology Staff'
                                });
                              }}
                              className="px-3 py-1.5 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-lg text-[10px] uppercase tracking-wider"
                            >
                              Enter Results
                            </button>
                          )}
                          {inv.status === 'ResultEntered' && (
                            <button
                              onClick={() => {
                                setSelectedInvestigation(inv);
                                setVerifyForm({ verifiedBy: 'Dr. Rajesh Sharma, MD' });
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#1E293B] font-bold rounded-lg text-[10px] uppercase tracking-wider"
                            >
                              Verify Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 3: DIAGNOSTIC REPORTS BOARD --- */}
      {subTab === 'reports' && (
        <div className="space-y-6">
          {viewedReportInv ? (
            <div className="max-w-2xl mx-auto bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-8 relative overflow-hidden shadow-2xl printable-ticket">
              <div className="text-center border-b border-[#D7E8EA] pb-6">
                <span className="text-[10px] font-bold tracking-widest text-[#147C8A] uppercase">
                  {localStorage.getItem('hms_hospital_name') || 'HMS CLINIC'}
                </span>
                <h2 className="text-xl font-bold text-[#1E293B] mt-1">DIAGNOSTIC TEST REPORT</h2>
                <p className="text-xs text-[#64748B] mt-1">Ordered on: {new Date(viewedReportInv.orderDateTime).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 my-6 text-sm">
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Patient Name</span>
                  <strong className="text-[#1E293B]">{viewedReportInv.patient.patientName}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">UHID</span>
                  <strong className="text-[#147C8A] font-mono">{viewedReportInv.uhid}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Test Name</span>
                  <strong className="text-[#1E293B]">{viewedReportInv.testName} ({viewedReportInv.testCategory})</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] block uppercase font-semibold">Ordering Doctor</span>
                  <strong className="text-[#1E293B]">{viewedReportInv.orderingDoctor.name}</strong>
                </div>
                
                {viewedReportResult ? (
                  <>
                    <div className="col-span-2 border-t border-[#D7E8EA]/80 pt-4 mt-2">
                      <h4 className="text-xs font-bold text-[#147C8A] uppercase tracking-widest mb-3">Clinical Findings</h4>
                      <table className="w-full text-xs text-[#64748B] border border-[#D7E8EA]">
                        <thead>
                          <tr className="bg-white text-[#64748B] text-left">
                            <th className="p-2.5">Parameter</th>
                            <th className="p-2.5">Observed Value</th>
                            <th className="p-2.5">Reference Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-[#D7E8EA] bg-[#F8FBFB]">
                            <td className="p-2.5 text-[#1E293B] font-bold">{viewedReportInv.testName}</td>
                            <td className="p-2.5 text-emerald-700 font-bold text-sm">{viewedReportResult.resultValue}</td>
                            <td className="p-2.5">{viewedReportResult.referenceRange || '--'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="col-span-2">
                      <span className="text-xs text-[#64748B] block uppercase font-semibold">Pathologist Remarks</span>
                      <p className="text-[#1E293B] mt-1 bg-white p-2.5 rounded-lg border border-[#D7E8EA] text-xs">{viewedReportResult.remarks || 'None'}</p>
                    </div>

                    <div>
                      <span className="text-xs text-[#64748B] block uppercase font-semibold">Lab Technician</span>
                      <strong className="text-[#1E293B] text-xs">{viewedReportResult.labTechnician}</strong>
                    </div>

                    {viewedReportResult.verifiedBy && (
                      <div>
                        <span className="text-xs text-[#64748B] block uppercase font-semibold">Verified By</span>
                        <strong className="text-emerald-700 text-xs">{viewedReportResult.verifiedBy}</strong>
                        <span className="block text-[9px] text-[#64748B]">{viewedReportResult.verificationDateTime ? new Date(viewedReportResult.verificationDateTime).toLocaleString() : ''}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-2 text-center py-6 text-[#64748B] border-t border-[#D7E8EA] mt-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                    <span>Report results are pending compilation by the diagnostics laboratory staff.</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 justify-end mt-8 border-t border-[#D7E8EA] pt-6 no-print">
                <button
                  onClick={() => setViewedReportInv(null)}
                  className="px-4 py-2 bg-white border border-[#D7E8EA] hover:border-[#D7E8EA] text-[#1E293B] rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
                {viewedReportInv.status === 'Verified' && (
                  <button
                    onClick={printDocument}
                    className="px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Report</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Search Patient Files */}
              <div className="lg:col-span-5 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md h-[400px] flex flex-col">
                <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 mb-4 flex items-center space-x-2">
                  <Search className="w-5 h-5 text-[#147C8A]" />
                  <span>Lookup Patient Reports</span>
                </h3>

                <form onSubmit={handleReportSearch} className="flex space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-[#64748B]" />
                    <input 
                      type="text"
                      required
                      placeholder="Enter Patient UHID (e.g. 260615AH0000001)"
                      value={reportSearchQuery}
                      onChange={e => setReportSearchQuery(e.target.value)}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] placeholder-slate-550 focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isHistorySearching}
                    className="px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-xl text-xs"
                  >
                    Lookup
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                  {patientHistoryList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#64748B] text-center">
                      <ClipboardList className="w-8 h-8 mb-1.5 opacity-40" />
                      <p className="text-xs">No records retrieved</p>
                      <p className="text-[10px] text-[#64748B] mt-0.5">Lookup a valid UHID to retrieve reports index</p>
                    </div>
                  ) : (
                    patientHistoryList.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => loadReportDetails(inv)}
                        className="p-3 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl hover:border-[#D7E8EA] cursor-pointer transition-colors flex justify-between items-center group"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-[#147C8A] font-mono block">{new Date(inv.orderDateTime).toLocaleDateString()}</span>
                          <h4 className="text-xs font-bold text-[#1E293B] group-hover:text-[#147C8A] transition-colors">{inv.testName}</h4>
                          <span className="text-[8px] uppercase tracking-widest text-[#64748B] font-bold">{inv.testCategory}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: View Area Placeholder */}
              <div className="lg:col-span-7 bg-[#F8FBFB] border border-[#D7E8EA] border-dashed rounded-2xl p-12 text-center text-[#64748B] flex flex-col items-center justify-center space-y-3">
                <Printer className="w-12 h-12 text-[#64748B]" />
                <div>
                  <h4 className="font-bold text-[#1E293B] text-sm">No Report Selected</h4>
                  <p className="text-xs text-[#64748B] mt-1">Please enter a UHID on the left, load the diagnostics history index, and select a record to view details.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
