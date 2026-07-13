import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import { 
  Search, 
  User, 
  Bed, 
  Activity, 
  DollarSign, 
  ClipboardList, 
  LogOut, 
  Plus, 
  Printer,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Patient {
  id: number;
  uhid: string;
  patientName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  mobile: string;
  relationName: string;
  addressLine1: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  consultingFee: number;
  department: {
    id: number;
    deptName: string;
  };
}

interface Ward {
  id: number;
  code: string;
  name: string;
}

interface BedInfo {
  id: number;
  bedNumber: string;
  roomType: string;
  status: string; // Available, Occupied, UnderMaintenance
  ward: {
    id: number;
    name: string;
  };
}

interface IPRegistration {
  id: number;
  patient: Patient;
  uhid: string;
  ipNumber: string;
  admissionDate: string;
  admissionTime: string;
  admissionType: string;
  admittingDoctor: Doctor;
  ward: Ward;
  bedNumber: string;
  roomType: string;
  diagnosisProvisional: string;
  dischargeDate?: string;
  dischargeStatus?: string;
  dischargeNotes?: string;
  dischargeInstructions?: string;
  totalBill?: number;
  advancePaid: number;
  status: string; // Admitted, Discharged
  patientCategory?: string;
}

interface DailyNote {
  id: number;
  noteDateTime: string;
  pulse?: number;
  bp?: string;
  temperature?: number;
  spo2?: number;
  respiratoryRate?: number;
  progressNote: string;
  treatmentNotes: string;
  recordedBy: string;
}

export default function InpatientDeskView({
  initialSubTab = 'bedmonitor',
  onSubTabChange
}: {
  initialSubTab?: 
    | 'admissions'
    | 'discharged-status'
    | 'hospital-bills'
    | 'scanner-dependency'
    | 'ip-daybook'
    | 'ip-between-dates'
    | 'search-ip'
    | 'tpa-claims'
    | 'tpa-patients'
    | 'bedmonitor'
    | 'rounds'
    | 'discharges';
  onSubTabChange?: (tab: 
    | 'admissions'
    | 'discharged-status'
    | 'hospital-bills'
    | 'scanner-dependency'
    | 'ip-daybook'
    | 'ip-between-dates'
    | 'search-ip'
    | 'tpa-claims'
    | 'tpa-patients'
    | 'bedmonitor'
    | 'rounds'
    | 'discharges') => void;
}) {
  const [subTab, _setSubTab] = useState<
    | 'admissions'
    | 'discharged-status'
    | 'hospital-bills'
    | 'scanner-dependency'
    | 'ip-daybook'
    | 'ip-between-dates'
    | 'search-ip'
    | 'tpa-claims'
    | 'tpa-patients'
    | 'bedmonitor'
    | 'rounds'
    | 'discharges'
  >(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      _setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const setSubTab = (newTab: typeof subTab) => {
    _setSubTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };

  // Additional States for newly mapped tabs
  const [allAdmissions, setAllAdmissions] = useState<IPRegistration[]>([]);
  const [allAdmissionsLoading, setAllAdmissionsLoading] = useState(false);
  const [tpaClaims, setTpaClaims] = useState<any[]>([]);
  const [tpaClaimsLoading, setTpaClaimsLoading] = useState(false);
  const [_tpaCompanies, _setTpaCompanies] = useState<any[]>([]);
  
  // Date range filters
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Search state for Search IP tab
  const [ipSearchQuery, setIpSearchQuery] = useState('');

  const fetchAllAdmissions = async () => {
    setAllAdmissionsLoading(true);
    try {
      const res = await fetch('/api/v1/ip/admissions');
      if (res.ok) {
        const data = await res.json();
        setAllAdmissions(data);
      }
    } catch (err) {
      console.error('Error fetching all admissions:', err);
    } finally {
      setAllAdmissionsLoading(false);
    }
  };

  const fetchTpaClaims = async () => {
    setTpaClaimsLoading(true);
    try {
      const res = await fetch('/api/v1/tpa/claims');
      const companiesRes = await fetch('/api/v1/tpa/companies');
      if (res.ok) {
        const data = await res.json();
        setTpaClaims(data);
      }
      if (companiesRes.ok) {
        const compData = await companiesRes.json();
        _setTpaCompanies(compData);
      }
    } catch (err) {
      console.error('Error fetching TPA claims:', err);
    } finally {
      setTpaClaimsLoading(false);
    }
  };

  useEffect(() => {
    if (['discharged-status', 'hospital-bills', 'ip-daybook', 'ip-between-dates', 'search-ip', 'scanner-dependency', 'tpa-patients'].includes(subTab)) {
      fetchAllAdmissions();
    }
    if (subTab === 'tpa-claims') {
      fetchTpaClaims();
    }
  }, [subTab]);

  // Master Data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<BedInfo[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);

  // Active admissions
  const [activeAdmissions, setActiveAdmissions] = useState<IPRegistration[]>([]);
  
  // Search Patients
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Admission Form State
  const [admissionForm, setAdmissionForm] = useState({
    doctorId: '',
    wardId: '',
    bedNumber: '',
    roomType: 'General',
    admissionType: 'Elective',
    provisionalDiagnosis: '',
    advancePaid: ''
  });
  const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false);
  const [admissionSlip, setAdmissionSlip] = useState<IPRegistration | null>(null);

  // Rounds / Chart State
  const [selectedAdmission, setSelectedAdmission] = useState<IPRegistration | null>(null);
  const [notesHistory, setNotesHistory] = useState<DailyNote[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isVitalsChartPrintOpen, setIsVitalsChartPrintOpen] = useState(false);
  const [roundForm, setRoundForm] = useState({
    pulse: '',
    bp: '',
    temperature: '',
    spo2: '',
    respiratoryRate: '',
    progressNote: '',
    treatmentNotes: '',
    recordedBy: ''
  });
  const [isSubmittingRound, setIsSubmittingRound] = useState(false);

  // Discharge Form State
  const [selectedDischargeAdmission, setSelectedDischargeAdmission] = useState<IPRegistration | null>(null);
  const [dischargeForm, setDischargeForm] = useState({
    dischargeStatus: 'Discharged',
    totalBill: '',
    dischargeNotes: '',
    dischargeInstructions: ''
  });
  const [isSubmittingDischarge, setIsSubmittingDischarge] = useState(false);
  const [dischargeSlip, setDischargeSlip] = useState<IPRegistration | null>(null);

  // Load Initial Master Data
  useEffect(() => {
    fetchDoctors();
    fetchWards();
    fetchActiveAdmissions();
  }, []);

  // Fetch beds whenever active ward changes
  useEffect(() => {
    if (selectedWardId !== null) {
      fetchBeds(selectedWardId);
    } else if (wards.length > 0) {
      setSelectedWardId(wards[0].id);
    }
  }, [selectedWardId, wards]);

  // Fetch available beds when selected ward in form changes
  useEffect(() => {
    if (admissionForm.wardId) {
      fetchBedsForForm(Number(admissionForm.wardId));
    }
  }, [admissionForm.wardId]);

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

  const fetchWards = async () => {
    try {
      const res = await fetch('/api/v1/ip/wards');
      if (res.ok) {
        const data = await res.json();
        setWards(data);
        if (data.length > 0 && selectedWardId === null) {
          setSelectedWardId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching wards:', err);
    }
  };

  const fetchBeds = async (wardId: number) => {
    try {
      const res = await fetch(`/api/v1/ip/beds?wardId=${wardId}`);
      if (res.ok) {
        const data = await res.json();
        setBeds(data);
      }
    } catch (err) {
      console.error('Error fetching beds:', err);
    }
  };

  const [formBeds, setFormBeds] = useState<BedInfo[]>([]);
  const fetchBedsForForm = async (wardId: number) => {
    try {
      const res = await fetch(`/api/v1/ip/beds?wardId=${wardId}`);
      if (res.ok) {
        const data = await res.json();
        setFormBeds(data);
        // Pre-select first available bed if any
        const available = data.find((b: BedInfo) => b.status === 'Available');
        if (available) {
          setAdmissionForm(prev => ({ 
            ...prev, 
            bedNumber: available.bedNumber,
            roomType: available.roomType
          }));
        } else {
          setAdmissionForm(prev => ({ ...prev, bedNumber: '' }));
        }
      }
    } catch (err) {
      console.error('Error fetching beds for form:', err);
    }
  };

  const fetchActiveAdmissions = async () => {
    try {
      const res = await fetch('/api/v1/ip/admissions/active');
      if (res.ok) {
        const data = await res.json();
        setActiveAdmissions(data);
      }
    } catch (err) {
      console.error('Error fetching active admissions:', err);
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

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setIsSubmittingAdmission(true);
    try {
      const res = await fetch('/api/v1/ip/admissions', {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({
          patientId: selectedPatient.id,
          doctorId: admissionForm.doctorId,
          wardId: admissionForm.wardId,
          bedNumber: admissionForm.bedNumber,
          roomType: admissionForm.roomType,
          admissionType: admissionForm.admissionType,
          provisionalDiagnosis: admissionForm.provisionalDiagnosis,
          advancePaid: admissionForm.advancePaid
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAdmissionSlip(data);
        // Reset form
        setSelectedPatient(null);
        setSearchQuery('');
        setSearchResults([]);
        setAdmissionForm({
          doctorId: '',
          wardId: '',
          bedNumber: '',
          roomType: 'General',
          admissionType: 'Elective',
          provisionalDiagnosis: '',
          advancePaid: ''
        });
        // Refresh grids
        fetchActiveAdmissions();
        if (selectedWardId !== null) fetchBeds(selectedWardId);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to admit patient');
      }
    } catch (err) {
      console.error('Error admitting patient:', err);
    } finally {
      setIsSubmittingAdmission(false);
    }
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age + ' Yrs';
  };

  const fetchNotes = async (admissionId: number) => {
    setIsNotesLoading(true);
    try {
      const res = await fetch(`/api/v1/ip/admissions/${admissionId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotesHistory(data);
      }
    } catch (err) {
      console.error('Error fetching daily notes:', err);
    } finally {
      setIsNotesLoading(false);
    }
  };

  const handleRoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;
    setIsSubmittingRound(true);
    try {
      const res = await fetch(`/api/v1/ip/admissions/${selectedAdmission.id}/notes`, {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify(roundForm)
      });

      if (res.ok) {
        // Refresh notes list
        fetchNotes(selectedAdmission.id);
        // Clear note logs part of form
        setRoundForm({
          pulse: '',
          bp: '',
          temperature: '',
          spo2: '',
          respiratoryRate: '',
          progressNote: '',
          treatmentNotes: '',
          recordedBy: ''
        });
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record vitals');
      }
    } catch (err) {
      console.error('Error saving round details:', err);
    } finally {
      setIsSubmittingRound(false);
    }
  };

  const handleDischargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDischargeAdmission) return;
    setIsSubmittingDischarge(true);
    try {
      const res = await fetch(`/api/v1/ip/admissions/${selectedDischargeAdmission.id}/discharge`, {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify(dischargeForm)
      });

      if (res.ok) {
        const data = await res.json();
        setDischargeSlip(data);
        setSelectedDischargeAdmission(null);
        setDischargeForm({
          dischargeStatus: 'Discharged',
          totalBill: '',
          dischargeNotes: '',
          dischargeInstructions: ''
        });
        // Refresh database lists
        fetchActiveAdmissions();
        if (selectedWardId !== null) fetchBeds(selectedWardId);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to process discharge');
      }
    } catch (err) {
      console.error('Error discharging patient:', err);
    } finally {
      setIsSubmittingDischarge(false);
    }
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex flex-col border-b border-[#D7E8EA] pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide flex items-center space-x-2">
            <Bed className="w-6 h-6 text-[#147C8A]" />
            <span>IPD Inpatient Desk</span>
          </h1>
          <p className="text-sm text-[#64748B]">Track hospital admissions, active ward beds, clinical vitals logs, and discharges.</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs max-w-full">
          {[
            { key: 'bedmonitor', label: 'IP-Dashboard' },
            { key: 'admissions', label: 'Convert OP to IP/ New IP' },
            { key: 'rounds', label: 'Clinical Rounds (Vitals)' },
            { key: 'discharged-status', label: 'My IPs (Discharge Status Wise)' },
            { key: 'hospital-bills', label: 'My Hospitalization Bills' },
            { key: 'scanner-dependency', label: 'Scanner (To check pendecny work)' },
            { key: 'ip-daybook', label: 'IP-Day Book (Amt. Received)' },
            { key: 'ip-between-dates', label: 'IPs (Between Dates)' },
            { key: 'search-ip', label: 'Search IP - by Name/ Mobile No.' },
            { key: 'tpa-claims', label: 'IP-TPA Claim Status' },
            { key: 'tpa-patients', label: 'IP-TPA Patients' },
            { key: 'discharges', label: 'Discharges' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setSubTab(tab.key as any);
                setAdmissionSlip(null);
                setDischargeSlip(null);
                if (tab.key === 'rounds' && activeAdmissions.length > 0 && !selectedAdmission) {
                  setSelectedAdmission(activeAdmissions[0]);
                  fetchNotes(activeAdmissions[0].id);
                }
              }}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === tab.key 
                  ? 'bg-[#147C8A] text-white shadow-md shadow-sky-500/10' 
                  : 'bg-white border border-[#D7E8EA] text-[#64748B] hover:text-[#1E293B] hover:border-[#D7E8EA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- SUBTAB 1: WARD BED MONITOR --- */}
      {subTab === 'bedmonitor' && (
        <div className="space-y-6">
          {/* Ward Selector */}
          <div className="flex flex-wrap gap-2">
            {wards.map(w => (
              <button
                key={w.id}
                onClick={() => setSelectedWardId(w.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedWardId === w.id 
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white border-transparent shadow-sm shadow-sky-500/10' 
                    : 'bg-white border-[#D7E8EA] text-[#64748B] hover:text-[#1E293B] hover:border-[#D7E8EA]'
                }`}
              >
                {w.name} ({w.code})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bed Grid */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-[#F8FBFB] p-4 rounded-2xl border border-[#D7E8EA] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Bed Layout</span>
                <div className="flex items-center space-x-4 text-xs font-bold">
                  <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-[#22C55E]" /> <span className="text-emerald-700">Available</span></span>
                  <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-rose-500" /> <span className="text-rose-700">Occupied</span></span>
                  <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-[#94A3B8]" /> <span className="text-[#64748B]">Maintenance</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {beds.map(bed => {
                  const occupiedAdmission = activeAdmissions.find(adm => adm.bedNumber === bed.bedNumber && adm.ward.id === bed.ward.id);
                  return (
                    <div
                      key={bed.id}
                      onClick={() => {
                        if (occupiedAdmission) {
                          setSelectedAdmission(occupiedAdmission);
                          fetchNotes(occupiedAdmission.id);
                          setSubTab('rounds');
                        } else if (bed.status === 'Available') {
                          setAdmissionForm(prev => ({ 
                            ...prev, 
                            wardId: String(bed.ward.id),
                            bedNumber: bed.bedNumber,
                            roomType: bed.roomType
                          }));
                          setSubTab('admissions');
                        }
                      }}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden group hover:scale-[1.02] flex flex-col items-center justify-center text-center h-28 ${
                        bed.status === 'Available' 
                          ? 'bg-white border-[#D7E8EA] hover:border-[#22C55E] hover:bg-green-50' 
                          : bed.status === 'Occupied'
                          ? 'bg-red-50 border-red-200 hover:border-rose-500/60 hover:bg-red-50'
                          : 'bg-[#F8FBFB] border-[#D7E8EA] text-[#64748B]'
                      }`}
                    >
                      <Bed className={`w-8 h-8 mb-2 ${
                        bed.status === 'Available' ? 'text-emerald-700 group-hover:animate-bounce' :
                        bed.status === 'Occupied' ? 'text-rose-700' : 'text-[#64748B]'
                      }`} />
                      <span className="text-sm font-bold text-[#1E293B]">{bed.bedNumber}</span>
                      <span className="text-[10px] text-[#64748B] uppercase font-semibold mt-1">{bed.roomType}</span>
                      
                      {occupiedAdmission && (
                        <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Census Sidebar */}
            <div className="lg:col-span-4 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
              <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3">Admitted Census ({activeAdmissions.length})</h3>
              
              {activeAdmissions.length === 0 ? (
                <div className="text-center py-8 text-[#64748B] space-y-2">
                  <Activity className="w-8 h-8 text-[#64748B] mx-auto" />
                  <p className="text-xs">No patients currently admitted in the hospital.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {activeAdmissions.map(adm => (
                    <div 
                      key={adm.id} 
                      onClick={() => {
                        setSelectedAdmission(adm);
                        fetchNotes(adm.id);
                        setSubTab('rounds');
                      }}
                      className="p-3 bg-[#EAF7F8] hover:bg-[#F8FBFB] rounded-xl border border-[#D7E8EA] hover:border-[#D7E8EA] transition-all cursor-pointer flex justify-between items-center group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#147C8A] font-mono block">{adm.ipNumber}</span>
                        <h4 className="text-xs font-bold text-[#1E293B] group-hover:text-[#147C8A] transition-colors">{adm.patient.patientName}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-[#64748B]">
                          <span className="bg-[#F8FBFB] px-1.5 py-0.5 rounded font-bold text-[#1E293B]">{adm.ward.code}</span>
                          <span>Bed: <strong>{adm.bedNumber}</strong></span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: ADMISSIONS DESK --- */}
      {subTab === 'admissions' && (
        <div className="space-y-6">
          {/* Printable Admission Ticket Modal-like View */}
          {admissionSlip ? (
            <div className="max-w-2xl mx-auto bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-8 relative overflow-hidden shadow-2xl printable-ticket">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#147C8A]/5 rounded-bl-full" />
              <div className="text-center border-b border-[#D7E8EA] pb-6">
                <span className="text-[10px] font-bold tracking-widest text-[#147C8A] uppercase">
                  {localStorage.getItem('hms_hospital_name') || 'HMS CLINIC'}
                </span>
                <h2 className="text-xl font-bold text-[#1E293B] mt-1">INPATIENT ADMISSION SLIP</h2>
                <p className="text-xs text-[#64748B] mt-1">Generated on {admissionSlip.admissionDate} @ {admissionSlip.admissionTime}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 my-6 text-sm">
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">IP Number</span>
                  <strong className="text-base text-[#147C8A] font-mono">{admissionSlip.ipNumber}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">UHID</span>
                  <strong className="text-[#1E293B] font-mono">{admissionSlip.uhid}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Patient Name</span>
                  <strong className="text-[#1E293B]">{admissionSlip.patient.patientName}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Age / Gender</span>
                  <strong className="text-[#1E293B]">
                    {admissionSlip.patient.dateOfBirth ? (new Date().getFullYear() - new Date(admissionSlip.patient.dateOfBirth).getFullYear()) : 'N/A'} yrs / {admissionSlip.patient.gender === 'M' ? 'Male' : 'Female'}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Admitting Doctor</span>
                  <strong className="text-[#1E293B]">{admissionSlip.admittingDoctor.name}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Department</span>
                  <strong className="text-[#1E293B]">{admissionSlip.admittingDoctor.department.deptName}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Ward & Bed</span>
                  <strong className="text-[#1E293B]">{admissionSlip.ward.name} - Bed {admissionSlip.bedNumber} ({admissionSlip.roomType})</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Admission Type</span>
                  <strong className="text-[#1E293B]">{admissionSlip.admissionType}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Provisional Diagnosis</span>
                  <p className="text-[#1E293B] mt-1 bg-white p-2.5 rounded-lg border border-[#D7E8EA] text-xs">{admissionSlip.diagnosisProvisional || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Advance Paid</span>
                  <strong className="text-emerald-700">₹{admissionSlip.advancePaid.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Status</span>
                  <span className="inline-block bg-[#EAF7F8] border border-[#D7E8EA] px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#147C8A] mt-1 uppercase">
                    {admissionSlip.status}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 justify-end mt-8 border-t border-[#D7E8EA] pt-6 no-print">
                <button
                  onClick={() => setAdmissionSlip(null)}
                  className="px-4 py-2 bg-white border border-[#D7E8EA] hover:border-[#D7E8EA] text-[#1E293B] rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
                <button
                  onClick={printDocument}
                  className="px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Patient Search & Select */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
                  <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 mb-4 flex items-center space-x-2">
                    <Search className="w-5 h-5 text-[#147C8A]" />
                    <span>Find Patient for Admission</span>
                  </h3>
                  
                  <form onSubmit={handlePatientSearch} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-[#64748B]" />
                      <input 
                        type="text"
                        placeholder="Search by UHID, Name or Mobile"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSearching}
                      className="px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] disabled:bg-[#D7E8EA] text-white disabled:text-[#94A3B8] font-bold rounded-xl text-xs transition-all"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {searchResults.map(patient => (
                        <div
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatient(patient);
                            // Set admitting doctor and ward to first available as default
                            if (doctors.length > 0) setAdmissionForm(prev => ({ ...prev, doctorId: String(doctors[0].id) }));
                            if (wards.length > 0) setAdmissionForm(prev => ({ ...prev, wardId: String(wards[0].id) }));
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                            selectedPatient?.id === patient.id
                              ? 'bg-[#EAF7F8]/20 border-[#147C8A]/50 text-white'
                              : 'bg-[#F8FBFB] border-[#D7E8EA] text-[#64748B] hover:border-[#D7E8EA]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[#147C8A] font-mono">{patient.uhid}</span>
                            <h4 className="text-xs font-bold text-[#1E293B]">{patient.patientName}</h4>
                            <p className="text-[10px] text-[#64748B]">Mobile: {patient.mobile}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#64748B]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Patient Card */}
                {selectedPatient && (
                  <div className="bg-gradient-to-r from-sky-950/20 to-indigo-950/20 border border-[#D7E8EA]/40 rounded-2xl p-6 shadow-sm backdrop-blur-md">
                    <h4 className="text-xs font-bold text-[#147C8A] uppercase tracking-widest mb-4">Patient File Loaded</h4>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#147C8A]/10 flex items-center justify-center text-[#147C8A] shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <strong className="text-base text-[#1E293B] block">{selectedPatient.patientName}</strong>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#64748B]">
                          <span>UHID: <strong className="text-[#147C8A] font-mono">{selectedPatient.uhid}</strong></span>
                          <span>Mobile: <strong>{selectedPatient.mobile}</strong></span>
                          <span>Gender: <strong>{selectedPatient.gender === 'M' ? 'Male' : 'Female'}</strong></span>
                          <span>Blood: <strong>{selectedPatient.bloodGroup}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Admission Form */}
              <div className="lg:col-span-7">
                {selectedPatient ? (
                  <form onSubmit={handleAdmitSubmit} className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
                    <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 mb-2 flex items-center space-x-2">
                      <ClipboardList className="w-5 h-5 text-[#147C8A]" />
                      <span>Admission Details</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Doctor selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B] uppercase">Admitting Doctor *</label>
                        <select
                          required
                          value={admissionForm.doctorId}
                          onChange={e => setAdmissionForm({ ...admissionForm, doctorId: e.target.value })}
                          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA]"
                        >
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Doctor</option>
                          {doctors.map(doc => (
                            <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                          ))}
                        </select>
                      </div>

                      {/* Admission Type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B] uppercase">Admission Type *</label>
                        <select
                          required
                          value={admissionForm.admissionType}
                          onChange={e => setAdmissionForm({ ...admissionForm, admissionType: e.target.value })}
                          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA]"
                        >
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Elective">Elective</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Emergency">Emergency</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Referral">Referral</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Transfer">Transfer</option>
                        </select>
                      </div>

                      {/* Ward Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B] uppercase">Select Ward *</label>
                        <select
                          required
                          value={admissionForm.wardId}
                          onChange={e => setAdmissionForm({ ...admissionForm, wardId: e.target.value })}
                          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA]"
                        >
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Ward</option>
                          {wards.map(w => (
                            <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Bed Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B] uppercase">Bed Number *</label>
                        <select
                          required
                          value={admissionForm.bedNumber}
                          onChange={e => {
                            const bed = formBeds.find(b => b.bedNumber === e.target.value);
                            setAdmissionForm({ 
                              ...admissionForm, 
                              bedNumber: e.target.value, 
                              roomType: bed ? bed.roomType : 'General' 
                            });
                          }}
                          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA]"
                        >
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Bed</option>
                          {formBeds.map(bed => (
                            <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" 
                              key={bed.id} 
                              value={bed.bedNumber} 
                              disabled={bed.status !== 'Available'}
                            >
                              {bed.bedNumber} ({bed.roomType}) - {bed.status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Advance Paid */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B] uppercase">Advance Deposit Amount (₹)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
                          <input 
                            type="number"
                            placeholder="Enter advance deposit amount if paid"
                            value={admissionForm.advancePaid}
                            onChange={e => setAdmissionForm({ ...admissionForm, advancePaid: e.target.value })}
                            className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-10 pr-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Provisional Diagnosis */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#64748B] uppercase">Provisional Diagnosis</label>
                      <textarea
                        rows={3}
                        placeholder="Write clinical diagnosis summary recommending admission"
                        value={admissionForm.provisionalDiagnosis}
                        onChange={e => setAdmissionForm({ ...admissionForm, provisionalDiagnosis: e.target.value })}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-3 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingAdmission || !admissionForm.bedNumber}
                      className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:from-slate-800 disabled:to-slate-800 text-[#1E293B] hover:text-[#1E293B] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm shadow-sky-500/10"
                    >
                      {isSubmittingAdmission ? 'Booking Inpatient Admission...' : 'Confirm Patient Admission'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-[#F8FBFB] border border-[#D7E8EA] border-dashed rounded-2xl p-12 text-center text-[#64748B] space-y-4">
                    <User className="w-12 h-12 text-[#64748B] mx-auto" />
                    <div>
                      <h4 className="font-bold text-[#1E293B] text-sm">No Patient Selected</h4>
                      <p className="text-xs text-[#64748B] mt-1">Please search and select a patient from the patient register on the left to initiate admission.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 3: CLINICAL ROUNDS (VITALS) --- */}
      {subTab === 'rounds' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Admitted Patient Selector list */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px] block">Admitted Directory</span>
              
              {activeAdmissions.length === 0 ? (
                <div className="bg-white border border-[#D7E8EA] rounded-2xl p-8 text-center text-[#64748B]">
                  <p className="text-xs">No active inpatient admissions available.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {activeAdmissions.map(adm => (
                    <div
                      key={adm.id}
                      onClick={() => {
                        setSelectedAdmission(adm);
                        fetchNotes(adm.id);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                        selectedAdmission?.id === adm.id
                          ? 'bg-gradient-to-r from-sky-950/30 to-indigo-950/30 border-[#147C8A]/60 text-white'
                          : 'bg-[#F8FBFB] border-[#D7E8EA] text-[#64748B] hover:border-[#D7E8EA]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[#147C8A] font-mono">{adm.ipNumber}</span>
                        <span className="bg-[#F8FBFB] px-1.5 py-0.5 rounded text-[8px] font-bold text-[#64748B] font-mono uppercase">{adm.admissionType}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1E293B] mt-1.5">{adm.patient.patientName}</h4>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-[#64748B] mt-3 pt-2.5 border-t border-[#D7E8EA]">
                        <span>Ward: <strong className="text-[#64748B]">{adm.ward.code}</strong></span>
                        <span>Bed: <strong className="text-[#64748B]">{adm.bedNumber}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inpatient File / Vitals Logs & Round Form */}
            <div className="lg:col-span-8">
              {selectedAdmission ? (
                <div className="space-y-6">
                  {/* Patient Demographic Bar */}
                  <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#147C8A]/10 flex items-center justify-center text-[#147C8A] shadow-md">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-bold text-[#1E293B]">{selectedAdmission.patient.patientName}</h3>
                          <span className="text-xs bg-[#F8FBFB] px-2 py-0.5 rounded text-[#64748B] font-bold uppercase">{selectedAdmission.patient.gender}</span>
                        </div>
                        <span className="text-xs text-[#147C8A] font-mono">{selectedAdmission.ipNumber}</span>
                      </div>
                    </div>

                    <div className="text-right text-xs text-[#64748B] grid grid-cols-2 sm:flex sm:items-center sm:space-x-4 gap-2">
                      <div className="bg-[#F8FBFB] px-3 py-1.5 rounded-xl border border-[#D7E8EA]">
                        <span className="text-[10px] text-[#64748B] uppercase block font-semibold">Ward Bed</span>
                        <strong className="text-[#1E293B] text-xs">{selectedAdmission.ward.code} / {selectedAdmission.bedNumber}</strong>
                      </div>
                      <div className="bg-[#F8FBFB] px-3 py-1.5 rounded-xl border border-[#D7E8EA]">
                        <span className="text-[10px] text-[#64748B] uppercase block font-semibold">Doctor</span>
                        <strong className="text-[#1E293B] text-xs">{selectedAdmission.admittingDoctor.name}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Grid: 2 Columns for History and Logging Form */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left: Vitals Chart / Logs history */}
                    <div className="md:col-span-7 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
                      <div className="flex justify-between items-center border-b border-[#D7E8EA] pb-3 mb-2">
                        <h4 className="text-sm font-bold text-[#1E293B] flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-[#147C8A]" />
                          <span>Clinical Vitals & Progress Chart</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsVitalsChartPrintOpen(true)}
                          className="px-3 py-1 bg-[#147C8A] hover:bg-[#0F6672] text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Vital Chart</span>
                        </button>
                      </div>

                      {isNotesLoading ? (
                        <div className="text-center py-12 text-[#64748B]">Loading charts...</div>
                      ) : notesHistory.length === 0 ? (
                        <div className="text-center py-12 text-[#64748B] space-y-2">
                          <Activity className="w-8 h-8 text-[#64748B] mx-auto" />
                          <p className="text-xs">No daily note recordings available.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                          {notesHistory.map(note => (
                            <div key={note.id} className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-4 space-y-3 hover:border-[#D7E8EA] transition-colors">
                              <div className="flex justify-between items-center text-[10px] text-[#64748B] border-b border-[#D7E8EA] pb-2">
                                <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5 text-[#147C8A]" /> <span>{new Date(note.noteDateTime).toLocaleString()}</span></span>
                                <span>By: <strong className="text-[#1E293B]">{note.recordedBy}</strong></span>
                              </div>

                              {/* Vitals Summary Pills */}
                              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                                <div className="bg-white/80 p-1 rounded border border-[#D7E8EA]">
                                  <span className="text-[#64748B] block">Pulse</span>
                                  <strong className="text-[#1E293B] text-xs">{note.pulse || '--'} bpm</strong>
                                </div>
                                <div className="bg-white/80 p-1 rounded border border-[#D7E8EA]">
                                  <span className="text-[#64748B] block">BP</span>
                                  <strong className="text-[#1E293B] text-xs">{note.bp || '--'}</strong>
                                </div>
                                <div className="bg-white/80 p-1 rounded border border-[#D7E8EA]">
                                  <span className="text-[#64748B] block">Temp</span>
                                  <strong className="text-[#1E293B] text-xs">{note.temperature || '--'} °F</strong>
                                </div>
                                <div className="bg-white/80 p-1 rounded border border-[#D7E8EA]">
                                  <span className="text-[#64748B] block">SpO2</span>
                                  <strong className="text-[#1E293B] text-xs">{note.spo2 || '--'} %</strong>
                                </div>
                                <div className="bg-white/80 p-1 rounded border border-[#D7E8EA]">
                                  <span className="text-[#64748B] block">Resp</span>
                                  <strong className="text-[#1E293B] text-xs">{note.respiratoryRate || '--'} /m</strong>
                                </div>
                              </div>

                              {/* Clinical Logs text */}
                              {note.progressNote && (
                                <div className="text-xs bg-[#F8FBFB] p-2 rounded border border-[#D7E8EA]">
                                  <span className="text-[10px] font-bold text-[#147C8A] uppercase tracking-widest block mb-0.5">Progress Note</span>
                                  <p className="text-[#1E293B]">{note.progressNote}</p>
                                </div>
                              )}
                              {note.treatmentNotes && (
                                <div className="text-xs bg-[#F8FBFB] p-2 rounded border border-[#D7E8EA]">
                                  <span className="text-[10px] font-bold text-[#147C8A] uppercase tracking-widest block mb-0.5">Treatment Logs / Orders</span>
                                  <p className="text-[#64748B]">{note.treatmentNotes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Logging Form */}
                    <div className="md:col-span-5 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
                      <h4 className="text-sm font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 flex items-center space-x-2">
                        <Plus className="w-4 h-4 text-[#147C8A]" />
                        <span>Log Vitals & Daily Logs</span>
                      </h4>

                      <form onSubmit={handleRoundSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-[#64748B] uppercase">Pulse Rate</label>
                            <input 
                              type="number"
                              placeholder="bpm"
                              value={roundForm.pulse}
                              onChange={e => setRoundForm({ ...roundForm, pulse: e.target.value })}
                              className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-[#64748B] uppercase">Blood Pressure</label>
                            <input 
                              type="text"
                              placeholder="e.g. 120/80"
                              value={roundForm.bp}
                              onChange={e => setRoundForm({ ...roundForm, bp: e.target.value })}
                              className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-[#64748B] uppercase">Temperature (°F)</label>
                            <input 
                              type="number"
                              step="0.1"
                              placeholder="e.g. 98.6"
                              value={roundForm.temperature}
                              onChange={e => setRoundForm({ ...roundForm, temperature: e.target.value })}
                              className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-[#64748B] uppercase">SpO2 Oxygen (%)</label>
                            <input 
                              type="number"
                              placeholder="e.g. 98"
                              value={roundForm.spo2}
                              onChange={e => setRoundForm({ ...roundForm, spo2: e.target.value })}
                              className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <label className="text-[10px] font-semibold text-[#64748B] uppercase">Respiratory Rate</label>
                            <input 
                              type="number"
                              placeholder="breaths / minute"
                              value={roundForm.respiratoryRate}
                              onChange={e => setRoundForm({ ...roundForm, respiratoryRate: e.target.value })}
                              className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-[#64748B] uppercase">Progress Note</label>
                          <textarea 
                            rows={2}
                            placeholder="Doctor assessment / rounds observation"
                            value={roundForm.progressNote}
                            onChange={e => setRoundForm({ ...roundForm, progressNote: e.target.value })}
                            className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-[#64748B] uppercase">Treatment logs / Orders</label>
                          <textarea 
                            rows={2}
                            placeholder="Prescribed medicine adjustments, nursing instructions"
                            value={roundForm.treatmentNotes}
                            onChange={e => setRoundForm({ ...roundForm, treatmentNotes: e.target.value })}
                            className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-[#64748B] uppercase">Recorded By *</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Dr. Rajesh Sharma"
                            value={roundForm.recordedBy}
                            onChange={e => setRoundForm({ ...roundForm, recordedBy: e.target.value })}
                            className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingRound}
                          className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-[#1E293B] font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                        >
                          {isSubmittingRound ? 'Saving notes...' : 'Save Daily Note'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F8FBFB] border border-[#D7E8EA] border-dashed rounded-2xl p-12 text-center text-[#64748B] space-y-4">
                  <Activity className="w-12 h-12 text-[#64748B] mx-auto" />
                  <div>
                    <h4 className="font-bold text-[#1E293B] text-sm">No Inpatient Selected</h4>
                    <p className="text-xs text-[#64748B] mt-1">Please select an admitted patient from the list on the left to view charts or log notes.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: DISCHARGES --- */}
      {subTab === 'discharges' && (
        <div className="space-y-6">
          {dischargeSlip ? (
            <div className="max-w-2xl mx-auto bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-8 relative overflow-hidden shadow-2xl printable-ticket">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full" />
              <div className="text-center border-b border-[#D7E8EA] pb-6">
                <span className="text-[10px] font-bold tracking-widest text-rose-700 uppercase">
                  {localStorage.getItem('hms_hospital_name') || 'HMS CLINIC'}
                </span>
                <h2 className="text-xl font-bold text-[#1E293B] mt-1">DISCHARGE SUMMARY & BILL</h2>
                <p className="text-xs text-[#64748B] mt-1">Discharged on {dischargeSlip.dischargeDate}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 my-6 text-sm">
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">IP Number</span>
                  <strong className="text-[#1E293B] font-mono">{dischargeSlip.ipNumber}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">UHID</span>
                  <strong className="text-[#1E293B] font-mono">{dischargeSlip.uhid}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Patient Name</span>
                  <strong className="text-[#1E293B]">{dischargeSlip.patient.patientName}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Admitting Doctor</span>
                  <strong className="text-[#1E293B]">{dischargeSlip.admittingDoctor.name}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Admission Date</span>
                  <strong className="text-[#1E293B]">{dischargeSlip.admissionDate}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Discharge Date</span>
                  <strong className="text-[#1E293B]">{dischargeSlip.dischargeDate}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Discharge Status</span>
                  <strong className="text-[#1E293B]">{dischargeSlip.dischargeStatus}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Discharge Clinical Summary</span>
                  <p className="text-[#1E293B] mt-1 bg-white p-2.5 rounded-lg border border-[#D7E8EA] text-xs">{dischargeSlip.dischargeNotes || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#64748B] uppercase block font-semibold">Medication Advice & Instructions</span>
                  <p className="text-[#1E293B] mt-1 bg-white p-2.5 rounded-lg border border-[#D7E8EA] text-xs">{dischargeSlip.dischargeInstructions || 'N/A'}</p>
                </div>

                {/* Billing details */}
                <div className="col-span-2 border-t border-[#D7E8EA] pt-4 mt-2">
                  <h4 className="text-xs font-bold text-[#147C8A] uppercase tracking-widest mb-3">Billing Invoice Statement</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-2 rounded-xl border border-[#D7E8EA]">
                      <span className="text-[10px] text-[#64748B] block uppercase font-semibold">Total Bill</span>
                      <strong className="text-[#1E293B] text-sm">₹{(dischargeSlip.totalBill || 0).toFixed(2)}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-[#D7E8EA]">
                      <span className="text-[10px] text-[#64748B] block uppercase font-semibold">Advance Paid</span>
                      <strong className="text-emerald-700 text-sm">₹{(dischargeSlip.advancePaid || 0).toFixed(2)}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-[#D7E8EA]">
                      <span className="text-[10px] text-[#64748B] block uppercase font-semibold">Balance Due / Refund</span>
                      {((dischargeSlip.totalBill || 0) - (dischargeSlip.advancePaid || 0)) >= 0 ? (
                        <strong className="text-red-600 text-sm">₹{((dischargeSlip.totalBill || 0) - (dischargeSlip.advancePaid || 0)).toFixed(2)}</strong>
                      ) : (
                        <strong className="text-emerald-700 text-sm">₹{Math.abs((dischargeSlip.totalBill || 0) - (dischargeSlip.advancePaid || 0)).toFixed(2)} (Refund)</strong>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 justify-end mt-8 border-t border-[#D7E8EA] pt-6 no-print">
                <button
                  onClick={() => setDischargeSlip(null)}
                  className="px-4 py-2 bg-white border border-[#D7E8EA] hover:border-[#D7E8EA] text-[#1E293B] rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
                <button
                  onClick={printDocument}
                  className="px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Summary</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Admitted Patient Selector */}
              <div className="lg:col-span-4 space-y-4">
                <span className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px] block">Admitted Patients for Discharge</span>
                
                {activeAdmissions.length === 0 ? (
                  <div className="bg-white border border-[#D7E8EA] rounded-2xl p-8 text-center text-[#64748B]">
                    <p className="text-xs">No active inpatient admissions available for discharge.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {activeAdmissions.map(adm => (
                      <div
                        key={adm.id}
                        onClick={() => {
                          setSelectedDischargeAdmission(adm);
                          setDischargeForm(prev => ({
                            ...prev,
                            dischargeStatus: 'Discharged',
                            totalBill: ''
                          }));
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                          selectedDischargeAdmission?.id === adm.id
                            ? 'bg-gradient-to-r from-rose-950/20 to-indigo-950/20 border-rose-500/60 text-white'
                            : 'bg-[#F8FBFB] border-[#D7E8EA] text-[#64748B] hover:border-[#D7E8EA]'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-[#147C8A] font-mono">{adm.ipNumber}</span>
                          <span className="text-[8px] bg-[#F8FBFB] px-1.5 py-0.5 rounded text-[#64748B] font-bold uppercase">{adm.admissionType}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#1E293B] mt-1.5">{adm.patient.patientName}</h4>
                        <div className="text-[10px] text-[#64748B] mt-2">
                          Admitted: <strong>{adm.admissionDate}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Discharge summary Form */}
              <div className="lg:col-span-8">
                {selectedDischargeAdmission ? (
                  <form onSubmit={handleDischargeSubmit} className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
                    <h3 className="text-lg font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-3 mb-2 flex items-center space-x-2">
                      <LogOut className="w-5 h-5 text-rose-700" />
                      <span>Process Discharge: {selectedDischargeAdmission.patient.patientName}</span>
                    </h3>

                    {/* Quick Admission Summary */}
                    <div className="bg-[#F8FBFB] p-4 rounded-2xl border border-[#D7E8EA] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[#64748B] uppercase block font-semibold">IP Number</span>
                        <strong className="text-[#147C8A] font-mono">{selectedDischargeAdmission.ipNumber}</strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] uppercase block font-semibold">Ward & Bed</span>
                        <strong className="text-[#1E293B]">{selectedDischargeAdmission.ward.name} / {selectedDischargeAdmission.bedNumber}</strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] uppercase block font-semibold">Admission Date</span>
                        <strong className="text-[#1E293B]">{selectedDischargeAdmission.admissionDate}</strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] uppercase block font-semibold">Advance Paid</span>
                        <strong className="text-emerald-700">₹{selectedDischargeAdmission.advancePaid.toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Discharge Status */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B] uppercase">Discharge Status *</label>
                        <select
                          required
                          value={dischargeForm.dischargeStatus}
                          onChange={e => setDischargeForm({ ...dischargeForm, dischargeStatus: e.target.value })}
                          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                        >
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Discharged">Discharged</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="LAMA">LAMA (Left Against Medical Advice)</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Referred">Referred</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Deceased">Deceased</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Transfer">Transfer</option>
                        </select>
                      </div>

                      {/* Total Billing charges */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B] uppercase">Total Bill Amount (₹) *</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
                          <input 
                            type="number"
                            required
                            placeholder="Enter total gross billing charges"
                            value={dischargeForm.totalBill}
                            onChange={e => setDischargeForm({ ...dischargeForm, totalBill: e.target.value })}
                            className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-10 pr-4 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                          />
                        </div>

                        {/* Balance due / refund indicator */}
                        {dischargeForm.totalBill && (
                          <div className="mt-2 text-xs font-bold">
                            {Number(dischargeForm.totalBill) - selectedDischargeAdmission.advancePaid >= 0 ? (
                              <span className="text-rose-700">Balance Due to Pay: ₹{(Number(dischargeForm.totalBill) - selectedDischargeAdmission.advancePaid).toFixed(2)}</span>
                            ) : (
                              <span className="text-emerald-700">Balance Refundable: ₹{Math.abs(Number(dischargeForm.totalBill) - selectedDischargeAdmission.advancePaid).toFixed(2)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Discharge Notes / Clinical summary */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#64748B] uppercase">Discharge Notes (Clinical Summary)</label>
                      <textarea
                        rows={3}
                        placeholder="Write clinical progress summary, procedures done, and inpatient diagnosis details"
                        value={dischargeForm.dischargeNotes}
                        onChange={e => setDischargeForm({ ...dischargeForm, dischargeNotes: e.target.value })}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-3 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                      />
                    </div>

                    {/* Discharge instructions / medication advice */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#64748B] uppercase">Medication Advice & Instructions</label>
                      <textarea
                        rows={3}
                        placeholder="Write post-discharge medication dosage advice and follow-up consultation scheduling instructions"
                        value={dischargeForm.dischargeInstructions}
                        onChange={e => setDischargeForm({ ...dischargeForm, dischargeInstructions: e.target.value })}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-3 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingDischarge}
                      className="w-full bg-gradient-to-r from-rose-500 to-indigo-500 hover:from-rose-400 hover:to-indigo-400 text-[#1E293B] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm shadow-rose-500/10"
                    >
                      {isSubmittingDischarge ? 'Finalizing Discharge...' : 'Confirm Discharge & Process Billing'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-[#F8FBFB] border border-[#D7E8EA] border-dashed rounded-2xl p-12 text-center text-[#64748B] space-y-4">
                    <LogOut className="w-12 h-12 text-[#64748B] mx-auto" />
                    <div>
                      <h4 className="font-bold text-[#1E293B] text-sm">No Inpatient Selected</h4>
                      <p className="text-xs text-[#64748B] mt-1">Please select an admitted patient from the list on the left to write discharge summary or compile billing.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'discharged-status' && (
        <div className="space-y-6">
          {/* Discharge metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Discharged', 'LAMA', 'Referred', 'Deceased', 'Transfer'].map(status => {
              const count = allAdmissions.filter(adm => adm.status === 'Discharged' && adm.dischargeStatus === status).length;
              return (
                <div key={status} className="bg-[#F8FBFB] border border-[#D7E8EA] p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-[#64748B] block uppercase font-bold tracking-wider">{status}</span>
                  <strong className="text-[#1E293B] text-xl block mt-1">{count}</strong>
                </div>
              );
            })}
          </div>

          {/* List */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2">
              Discharged Patients List (Status Wise)
            </h3>
            {allAdmissionsLoading ? (
              <div className="text-center py-12 text-[#64748B]">Loading discharged logs...</div>
            ) : allAdmissions.filter(adm => adm.status === 'Discharged').length === 0 ? (
              <div className="text-center py-12 text-[#64748B]">No discharged inpatient records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EAF7F8] text-[#64748B] uppercase font-bold border-b border-[#D7E8EA]">
                      <th className="py-3 px-4">IP No</th>
                      <th className="py-3 px-4">UHID</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Admission Date</th>
                      <th className="py-3 px-4">Discharge Date</th>
                      <th className="py-3 px-4">Discharge Status</th>
                      <th className="py-3 px-4 text-right">Total Bill (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                    {allAdmissions
                      .filter(adm => adm.status === 'Discharged')
                      .map(adm => (
                        <tr key={adm.id} className="hover:bg-[#EAF7F8]">
                          <td className="py-3 px-4 font-mono text-[#147C8A]">{adm.ipNumber}</td>
                          <td className="py-3 px-4 font-mono">{adm.uhid}</td>
                          <td className="py-3 px-4 font-bold text-[#1E293B]">{adm.patient.patientName}</td>
                          <td className="py-3 px-4">{adm.admissionDate}</td>
                          <td className="py-3 px-4">{adm.dischargeDate || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              adm.dischargeStatus === 'Discharged' ? 'bg-green-100 text-green-700 border border-green-200' :
                              adm.dischargeStatus === 'Deceased' ? 'bg-red-100 text-red-700 border border-red-200' :
                              'bg-amber-100 text-amber-600 border border-amber-900/40'
                            }`}>
                              {adm.dischargeStatus || 'Discharged'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-700">₹{(adm.totalBill || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'hospital-bills' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2">
            My Hospitalization Bills & Financial Statement Log
          </h3>
          {allAdmissionsLoading ? (
            <div className="text-center py-12 text-[#64748B]">Loading billing logs...</div>
          ) : allAdmissions.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">No hospitalization records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EAF7F8] text-[#147C8A] uppercase font-semibold border-b border-[#D7E8EA]">
                    <th className="py-3 px-4">IP No</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Ward / Bed</th>
                    <th className="py-3 px-4">Admission Status</th>
                    <th className="py-3 px-4 text-right">Advance Paid (₹)</th>
                    <th className="py-3 px-4 text-right">Final Bill (₹)</th>
                    <th className="py-3 px-4 text-right">Due / Refund (₹)</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                  {allAdmissions.map(adm => {
                    const diff = (adm.totalBill || 0) - (adm.advancePaid || 0);
                    return (
                      <tr key={adm.id} className="hover:bg-[#EAF7F8]">
                        <td className="py-3 px-4 font-mono text-[#147C8A]">{adm.ipNumber}</td>
                        <td className="py-3 px-4 font-bold text-[#1E293B]">{adm.patient.patientName}</td>
                        <td className="py-3 px-4">{adm.ward.code} / {adm.bedNumber}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            adm.status === 'Admitted' ? 'bg-[#EAF7F8] text-[#147C8A] border border-[#D7E8EA]' : 'bg-[#F8FBFB] text-[#64748B]'
                          }`}>
                            {adm.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-700">₹{adm.advancePaid.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono text-[#1E293B]">₹{(adm.totalBill || 0).toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${diff >= 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {diff >= 0 ? `₹${diff.toFixed(2)}` : `₹${Math.abs(diff).toFixed(2)} (Refund)`}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setDischargeSlip(adm);
                              setSubTab('discharges');
                            }}
                            className="p-1.5 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#147C8A] border border-[#D7E8EA] rounded-lg text-[10px] font-bold"
                          >
                            View Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === 'scanner-dependency' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D7E8EA] p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Dependency & Pending Task Scanner</h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">Scans all active inpatients to identify missing vitals logs, uncollected deposits, or pending checkouts.</p>
            </div>
            <span className="bg-amber-100 border border-amber-900/45 text-amber-600 text-xs px-2.5 py-0.5 rounded font-bold">Active Scan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allAdmissionsLoading ? (
              <div className="col-span-3 text-center py-12 text-[#64748B]">Scanning clinical dependencies...</div>
            ) : allAdmissions.filter(adm => adm.status === 'Admitted').length === 0 ? (
              <div className="col-span-3 text-center py-12 text-[#64748B]">No admitted inpatients to scan.</div>
            ) : (
              allAdmissions
                .filter(adm => adm.status === 'Admitted')
                .map(adm => {
                  const alerts = [];
                  if (adm.advancePaid === 0) {
                    alerts.push({ type: 'danger', label: 'Advance Deposit Missing', desc: 'No advance deposit recorded for this admission.' });
                  }
                  if (alerts.length === 0) {
                    alerts.push({ type: 'success', label: 'All Tasks Cleared', desc: 'Demographics, advance deposits, and clinical rounds status are optimal.' });
                  }

                  return (
                    <div key={adm.id} className="bg-white border border-[#D7E8EA] rounded-2xl p-5 shadow-sm backdrop-blur-md flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-[#147C8A] font-mono font-bold">{adm.ipNumber}</span>
                          <span className="text-[9px] bg-[#EAF7F8] border border-[#D7E8EA] px-1.5 py-0.5 rounded text-[#0F6672] font-bold uppercase">{adm.ward.code} / {adm.bedNumber}</span>
                        </div>
                        <h4 className="font-bold text-[#1E293B] text-sm mt-2">{adm.patient.patientName}</h4>
                        <span className="text-[10px] text-[#64748B] block mt-0.5">Admitted: {adm.admissionDate}</span>
                      </div>

                      <div className="space-y-2">
                        {alerts.map((al, idx) => (
                          <div key={idx} className={`p-2.5 border rounded-xl text-[10px] ${
                            al.type === 'danger' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200/30'
                          }`}>
                            <strong className="block font-bold">{al.label}</strong>
                            <span className="text-[#94A3B8] block mt-0.5">{al.desc}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[#D7E8EA] flex justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedAdmission(adm);
                            setSubTab('rounds');
                          }}
                          className="flex-1 py-1.5 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] rounded-lg text-[10px] font-bold transition-all"
                        >
                          Write Round
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDischargeAdmission(adm);
                            setSubTab('discharges');
                          }}
                          className="flex-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-red-600 border border-rose-500/20 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Discharge
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {subTab === 'ip-daybook' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2">
              IP-Day Book (Amounts Received Summary)
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center py-2">
              <div className="bg-[#F8FBFB] p-4 rounded-2xl border border-[#D7E8EA]">
                <span className="text-[10px] text-[#64748B] block uppercase font-bold tracking-wider">Total Advance Receipts</span>
                <strong className="text-emerald-700 text-xl block mt-1">₹{allAdmissions.reduce((s, r) => s + r.advancePaid, 0).toFixed(2)}</strong>
              </div>
              <div className="bg-[#F8FBFB] p-4 rounded-2xl border border-[#D7E8EA]">
                <span className="text-[10px] text-[#64748B] block uppercase font-bold tracking-wider">Total Final Bills</span>
                <strong className="text-[#147C8A] text-xl block mt-1">₹{allAdmissions.reduce((s, r) => s + (r.totalBill || 0), 0).toFixed(2)}</strong>
              </div>
              <div className="bg-[#F8FBFB] p-4 rounded-2xl border border-[#D7E8EA]">
                <span className="text-[10px] text-[#64748B] block uppercase font-bold tracking-wider">Net Cash Flow</span>
                <strong className="text-emerald-700 text-xl block mt-1">₹{(
                  allAdmissions.reduce((s, r) => s + r.advancePaid, 0) +
                  allAdmissions.reduce((s, r) => s + (r.totalBill || 0), 0)
                ).toFixed(2)}</strong>
              </div>
            </div>

            {allAdmissionsLoading ? (
              <div className="text-center py-12 text-[#64748B]">Compiling financial ledgers...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EAF7F8] text-[#147C8A] uppercase font-semibold border-b border-[#D7E8EA]">
                      <th className="py-3 px-4">Transaction Date</th>
                      <th className="py-3 px-4">IP No</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Advance Paid (₹)</th>
                      <th className="py-3 px-4 text-right">Final Settled (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                    {allAdmissions.map(adm => (
                      <tr key={adm.id} className="hover:bg-[#EAF7F8]">
                        <td className="py-3 px-4 font-mono">{adm.admissionDate}</td>
                        <td className="py-3 px-4 font-mono text-[#147C8A]">{adm.ipNumber}</td>
                        <td className="py-3 px-4 font-bold text-[#1E293B]">{adm.patient.patientName}</td>
                        <td className="py-3 px-4 font-semibold uppercase">{adm.status === 'Discharged' ? 'Settlement' : 'Advance'}</td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-700">₹{adm.advancePaid.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#147C8A]">₹{(adm.totalBill || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'ip-between-dates' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-semibold text-[#64748B] uppercase">From Admission Date</label>
              <input 
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-semibold text-[#64748B] uppercase">To Admission Date</label>
              <input 
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2">
              Inpatient Admissions Registry (Between Selected Dates)
            </h3>
            {allAdmissionsLoading ? (
              <div className="text-center py-12 text-[#64748B]">Querying registry...</div>
            ) : allAdmissions.filter(adm => adm.admissionDate >= fromDate && adm.admissionDate <= toDate).length === 0 ? (
              <div className="text-center py-12 text-[#64748B]">No inpatient admissions recorded in this date range.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EAF7F8] text-[#64748B] uppercase font-bold border-b border-[#D7E8EA]">
                      <th className="py-3 px-4">IP No</th>
                      <th className="py-3 px-4">UHID</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Admitting Doctor</th>
                      <th className="py-3 px-4">Ward / Bed</th>
                      <th className="py-3 px-4">Admission Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                    {allAdmissions
                      .filter(adm => adm.admissionDate >= fromDate && adm.admissionDate <= toDate)
                      .map(adm => (
                        <tr key={adm.id} className="hover:bg-[#EAF7F8]">
                          <td className="py-3 px-4 font-mono text-[#147C8A]">{adm.ipNumber}</td>
                          <td className="py-3 px-4 font-mono">{adm.uhid}</td>
                          <td className="py-3 px-4 font-bold text-[#1E293B]">{adm.patient.patientName}</td>
                          <td className="py-3 px-4">{adm.admittingDoctor.name}</td>
                          <td className="py-3 px-4">{adm.ward.code} / {adm.bedNumber}</td>
                          <td className="py-3 px-4">{adm.admissionDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              adm.status === 'Admitted' ? 'bg-[#EAF7F8] text-[#147C8A] border border-[#D7E8EA]' : 'bg-[#F8FBFB] text-[#64748B]'
                            }`}>
                              {adm.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'search-ip' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h2 className="text-xs font-bold text-[#147C8A] uppercase tracking-widest border-b border-[#D7E8EA]/60 pb-2 mb-4">
              Inpatient Directory Search
            </h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
                <input 
                  type="text"
                  value={ipSearchQuery}
                  onChange={e => setIpSearchQuery(e.target.value)}
                  placeholder="Enter IP Number, Patient Name or Mobile..."
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder-slate-550 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2">
              Matching Inpatient Records
            </h3>
            {allAdmissionsLoading ? (
              <div className="text-center py-12 text-[#64748B]">Searching inpatients...</div>
            ) : allAdmissions.filter(adm => 
                adm.ipNumber.toLowerCase().includes(ipSearchQuery.toLowerCase()) ||
                adm.patient.patientName.toLowerCase().includes(ipSearchQuery.toLowerCase()) ||
                adm.patient.mobile.includes(ipSearchQuery)
              ).length === 0 ? (
              <div className="text-center py-12 text-[#64748B]">No matching inpatient records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EAF7F8] text-[#64748B] uppercase font-bold border-b border-[#D7E8EA]">
                      <th className="py-3 px-4">IP No</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Admitting Doctor</th>
                      <th className="py-3 px-4">Ward / Bed</th>
                      <th className="py-3 px-4">Admission Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                    {allAdmissions
                      .filter(adm => 
                        adm.ipNumber.toLowerCase().includes(ipSearchQuery.toLowerCase()) ||
                        adm.patient.patientName.toLowerCase().includes(ipSearchQuery.toLowerCase()) ||
                        adm.patient.mobile.includes(ipSearchQuery)
                      )
                      .map(adm => (
                        <tr key={adm.id} className="hover:bg-[#EAF7F8]">
                          <td className="py-3 px-4 font-mono text-[#147C8A]">{adm.ipNumber}</td>
                          <td className="py-3 px-4 font-bold text-[#1E293B]">{adm.patient.patientName}</td>
                          <td className="py-3 px-4">{adm.admittingDoctor.name}</td>
                          <td className="py-3 px-4">{adm.ward.code} / {adm.bedNumber}</td>
                          <td className="py-3 px-4">{adm.admissionDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              adm.status === 'Admitted' ? 'bg-[#EAF7F8] text-[#147C8A] border border-[#D7E8EA]' : 'bg-[#F8FBFB] text-[#64748B]'
                            }`}>
                              {adm.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'tpa-claims' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2">
            IP-TPA Claim Pre-Authorization & Settlement Status Log
          </h3>
          {tpaClaimsLoading ? (
            <div className="text-center py-12 text-[#64748B]">Querying TPA claims...</div>
          ) : tpaClaims.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">No TPA claims found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EAF7F8] text-[#147C8A] uppercase font-semibold border-b border-[#D7E8EA]">
                    <th className="py-3 px-4">Claim ID</th>
                    <th className="py-3 px-4">UHID</th>
                    <th className="py-3 px-4">IP No</th>
                    <th className="py-3 px-4">TPA Company</th>
                    <th className="py-3 px-4 text-right">Claimed Amt (₹)</th>
                    <th className="py-3 px-4 text-right">Approved Amt (₹)</th>
                    <th className="py-3 px-4">Pre-Auth Status</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                  {tpaClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-[#EAF7F8]">
                      <td className="py-3 px-4 font-mono font-bold text-[#147C8A]">CLM-0{claim.id}</td>
                      <td className="py-3 px-4 font-mono">{claim.uhid}</td>
                      <td className="py-3 px-4 font-mono">{claim.ipNumber}</td>
                      <td className="py-3 px-4 font-bold text-[#1E293B]">{claim.tpaCompany?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#1E293B]">₹{(claim.claimAmount || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">₹{(claim.approvedAmount || 0).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          claim.preAuthStatus === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                          claim.preAuthStatus === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-amber-100 text-amber-600 border border-amber-900/40'
                        }`}>
                          {claim.preAuthStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#64748B] max-w-[150px] truncate">{claim.remarks || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === 'tpa-patients' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2">
            Active Inpatient TPA Corporate Patient Registry
          </h3>
          {allAdmissionsLoading ? (
            <div className="text-center py-12 text-[#64748B]">Loading TPA patients...</div>
          ) : allAdmissions.filter(adm => adm.admissionType === 'TPA Claim' || adm.patientCategory === 'TPA Claim').length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">No active inpatient TPA claim patients registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EAF7F8] text-[#147C8A] uppercase font-semibold border-b border-[#D7E8EA]">
                    <th className="py-3 px-4">IP No</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Ward / Bed</th>
                    <th className="py-3 px-4">Admitting Doctor</th>
                    <th className="py-3 px-4">Claim Category</th>
                    <th className="py-3 px-4 text-right">Advance Paid (₹)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                  {allAdmissions
                    .filter(adm => adm.admissionType === 'TPA Claim' || adm.patientCategory === 'TPA Claim')
                    .map(adm => (
                      <tr key={adm.id} className="hover:bg-[#EAF7F8]">
                        <td className="py-3 px-4 font-mono text-[#147C8A]">{adm.ipNumber}</td>
                        <td className="py-3 px-4 font-bold text-[#1E293B]">{adm.patient.patientName}</td>
                        <td className="py-3 px-4">{adm.ward.code} / {adm.bedNumber}</td>
                        <td className="py-3 px-4">{adm.admittingDoctor.name}</td>
                        <td className="py-3 px-4 font-semibold uppercase">{adm.patientCategory || 'TPA Corporate'}</td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-700">₹{adm.advancePaid.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            adm.status === 'Admitted' ? 'bg-[#EAF7F8] text-[#147C8A] border border-[#D7E8EA]' : 'bg-[#F8FBFB] text-[#64748B]'
                          }`}>
                            {adm.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. PRINTABLE VITALS MONITORING CHART MODAL */}
      {isVitalsChartPrintOpen && selectedAdmission && (
        <>
          {/* Custom Print Style Block */}
          <style>{`
            @media print {
              body {
                background-color: white !important;
                color: black !important;
                font-family: Arial, sans-serif !important;
              }
              body * {
                visibility: hidden !important;
              }
              #vitals-print-area, #vitals-print-area * {
                visibility: visible !important;
              }
              #vitals-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* Modal Preview Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#EAF7F8] backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white border border-[#D7E8EA] rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto p-6 shadow-2xl flex flex-col space-y-4 animate-in zoom-in duration-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[#D7E8EA] no-print">
                <div className="flex items-center space-x-2">
                  <Printer className="w-5 h-5 text-[#147C8A]" />
                  <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">
                    IP- Print Vital Monitoring Chart- Page
                  </h3>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Print Button */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                  
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setIsVitalsChartPrintOpen(false)}
                    className="p-1.5 bg-red-50 border border-red-200 text-rose-700 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Preview Area */}
              <div className="bg-[#EAF7F8]/20 border border-[#D7E8EA] rounded-2xl p-4 overflow-x-auto flex justify-center">
                <div 
                  id="vitals-print-area" 
                  className="bg-white text-black p-[15mm] shadow-sm flex flex-col justify-between" 
                  style={{ 
                    width: '210mm', 
                    minHeight: '297mm', 
                    boxSizing: 'border-box', 
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '11pt',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Header Letterhead Grid */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid black', paddingBottom: '10px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '70%' }}>
                        {/* Circular Seal Logo */}
                        <svg width="60" height="60" viewBox="0 0 100 100" style={{ marginRight: '15px' }}>
                          <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="2" fill="none" />
                          <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="0.8" strokeDasharray="3,3" fill="none" />
                          <path d="M 50 18 L 50 82 M 18 50 L 82 50" stroke="black" strokeWidth="6" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="14" fill="white" stroke="black" strokeWidth="1.5" />
                          <path d="M 45 46 Q 50 38 55 46 Q 62 50 55 54 Q 50 62 45 54 Q 38 50 45 46 Z" fill="black" />
                          <text x="50" y="94" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">{(localStorage.getItem('hms_hospital_name') || 'HMS CLINIC').substring(0, 12).toUpperCase()}</text>
                        </svg>
                        <div>
                          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0', fontFamily: 'serif', letterSpacing: '0.5px', color: 'black' }}>
                            {(localStorage.getItem('hms_hospital_name') || 'HMS HOSPITAL').toUpperCase()}
                          </h1>
                          <p style={{ margin: '1px 0', fontSize: '10px', color: '#333' }}>Saraswati Nagar, Road No. 2</p>
                          <p style={{ margin: '1px 0', fontSize: '10px', color: '#333' }}>Opp. Dist. Co-operative Bank, Nizamabad</p>
                          <p style={{ margin: '1px 0', fontSize: '10px', color: '#000', fontWeight: 'bold' }}>Contact No: 08462-252322, 220322, 9515511633</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.5', width: '30%', color: 'black' }}>
                        <p style={{ fontWeight: 'bold', margin: '0', textDecoration: 'underline' }}>ANNEXURE-F6</p>
                        <p style={{ margin: '4px 0 0 0' }}>Page No: _________</p>
                      </div>
                    </div>

                    {/* Centered Document Title */}
                    <div style={{ textAlign: 'center', margin: '15px 0' }}>
                      <h2 style={{ fontSize: '15px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '1px', margin: '0', color: 'black' }}>
                        VITAL MONITORING CHART
                      </h2>
                    </div>

                    {/* Patient Details Box */}
                    <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '10pt', lineHeight: '1.8', color: 'black' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid black' }}>
                          <td style={{ padding: '6px', borderRight: '1px solid black', width: '50%' }}>
                            Consultant Dr. : <strong>{selectedAdmission.admittingDoctor?.name}</strong>
                          </td>
                          <td style={{ padding: '6px', width: '50%' }}>
                            IP ID : <strong>{selectedAdmission.ipNumber}</strong>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid black' }}>
                          <td style={{ padding: '6px', borderRight: '1px solid black' }}>
                            UHID : <strong>{selectedAdmission.patient?.uhid}</strong>
                          </td>
                          <td style={{ padding: '6px' }}>
                            IP Date/Time : <strong>{selectedAdmission.admissionDate} {selectedAdmission.admissionTime}</strong>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid black' }}>
                          <td style={{ padding: '6px', borderRight: '1px solid black' }}>
                            Patient Name : <strong>{selectedAdmission.patient?.patientName}</strong>
                          </td>
                          <td style={{ padding: '6px' }}>
                            Age : <strong>{calculateAge(selectedAdmission.patient?.dateOfBirth)}</strong>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid black' }}>
                          <td style={{ padding: '6px', borderRight: '1px solid black' }}>
                            Father/ Husband Name : <strong>{selectedAdmission.patient?.relationName || 'N/A'}</strong>
                          </td>
                          <td style={{ padding: '6px' }}>
                            Sex : <strong>{selectedAdmission.patient?.gender}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px', borderRight: '1px solid black' }}>
                            Address : <strong>{selectedAdmission.patient?.addressLine1 || 'N/A'}</strong>
                          </td>
                          <td style={{ padding: '6px' }}>
                            Contact No : <strong>{selectedAdmission.patient?.mobile}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* SVG Telemetry Trends Graph */}
                    {(() => {
                      const validNotes = notesHistory.filter(n => n.pulse || n.spo2 || n.temperature).slice(-8);
                      if (validNotes.length < 2) return null;

                      const width = 680;
                      const height = 140;
                      const paddingLeft = 40;
                      const paddingRight = 40;
                      const paddingTop = 15;
                      const paddingBottom = 25;

                      const chartWidth = width - paddingLeft - paddingRight;
                      const chartHeight = height - paddingTop - paddingBottom;

                      const getPulseY = (val: number) => {
                        const clamped = Math.max(50, Math.min(150, val));
                        return paddingTop + chartHeight - ((clamped - 50) / 100) * chartHeight;
                      };

                      const getTempY = (val: number) => {
                        const clamped = Math.max(95, Math.min(105, val));
                        return paddingTop + chartHeight - ((clamped - 95) / 10) * chartHeight;
                      };

                      const getSpo2Y = (val: number) => {
                        const clamped = Math.max(80, Math.min(100, val));
                        return paddingTop + chartHeight - ((clamped - 80) / 20) * chartHeight;
                      };

                      let pulsePoints = "";
                      let tempPoints = "";
                      let spo2Points = "";

                      validNotes.forEach((note, idx) => {
                        const x = paddingLeft + (idx / (validNotes.length - 1)) * chartWidth;
                        if (note.pulse) pulsePoints += `${idx === 0 || !pulsePoints ? 'M' : 'L'} ${x} ${getPulseY(note.pulse)} `;
                        if (note.temperature) tempPoints += `${idx === 0 || !tempPoints ? 'M' : 'L'} ${x} ${getTempY(note.temperature)} `;
                        if (note.spo2) spo2Points += `${idx === 0 || !spo2Points ? 'M' : 'L'} ${x} ${getSpo2Y(note.spo2)} `;
                      });

                      return (
                        <div className="no-print" style={{ border: '1px solid black', padding: '10px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#fcfdfd', width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>Vitals Telemetry Trends (Last {validNotes.length} readings)</span>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '9px', fontWeight: 'bold' }}>
                              <span style={{ color: '#dc2626' }}>● Pulse Rate (PR)</span>
                              <span style={{ color: '#0284c7' }}>● Temperature (°F)</span>
                              <span style={{ color: '#16a34a' }}>● SpO2 (%)</span>
                            </div>
                          </div>
                          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                              const y = paddingTop + ratio * chartHeight;
                              return (
                                <line key={i} x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                              );
                            })}
                            
                            {validNotes.map((note, idx) => {
                              const x = paddingLeft + (idx / (validNotes.length - 1)) * chartWidth;
                              const dateObj = new Date(note.noteDateTime);
                              const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                              return (
                                <text key={idx} x={x} y={height - 8} fontSize="8" fontWeight="bold" textAnchor="middle" fill="#64748B">
                                  {timeStr}
                                </text>
                              );
                            })}

                            {pulsePoints && <path d={pulsePoints} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                            {tempPoints && <path d={tempPoints} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                            {spo2Points && <path d={spo2Points} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                            {validNotes.map((note, idx) => {
                              const x = paddingLeft + (idx / (validNotes.length - 1)) * chartWidth;
                              return (
                                <g key={idx}>
                                  {note.pulse && <circle cx={x} cy={getPulseY(note.pulse)} r="3.5" fill="#dc2626" />}
                                  {note.temperature && <circle cx={x} cy={getTempY(note.temperature)} r="3.5" fill="#0284c7" />}
                                  {note.spo2 && <circle cx={x} cy={getSpo2Y(note.spo2)} r="3.5" fill="#16a34a" />}
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      );
                    })()}

                    {/* Vitals Logs Table */}
                    <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse', fontSize: '10pt', color: 'black' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid black', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', height: '35px' }}>
                          <th style={{ borderRight: '1px solid black', padding: '6px', width: '12%' }}>Date</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', width: '10%' }}>Time</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', width: '8%' }}>PR</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', width: '10%' }}>BP</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', width: '8%' }}>RR</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', width: '8%' }}>SPO2</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', width: '10%' }}>Temp.</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', width: '10%' }}>Intake</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', width: '10%' }}>Ouput</th>
                          <th style={{ padding: '6px', width: '14%' }}>Signature</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notesHistory.map((note) => {
                          const dateObj = new Date(note.noteDateTime);
                          const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : '';
                          const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                          return (
                            <tr key={note.id} style={{ borderBottom: '1px solid black', height: '35px', textAlign: 'center' }}>
                              <td style={{ borderRight: '1px solid black', padding: '6px' }}>{dateStr}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px' }}>{timeStr}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px', fontWeight: 'semibold' }}>{note.pulse || ''}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px', fontWeight: 'semibold' }}>{note.bp || ''}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px', fontWeight: 'semibold' }}>{note.respiratoryRate || ''}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px', fontWeight: 'semibold' }}>{note.spo2 || ''}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px', fontWeight: 'semibold' }}>{note.temperature || ''}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px' }}></td>
                              <td style={{ borderRight: '1px solid black', padding: '6px' }}></td>
                              <td style={{ padding: '6px', fontSize: '9pt' }}>{note.recordedBy || ''}</td>
                            </tr>
                          );
                        })}
                        {/* Empty rows to fill the paper sheet layout */}
                        {Array.from({ length: Math.max(14 - notesHistory.length, 10) }).map((_, idx) => (
                          <tr key={`empty-${idx}`} style={{ borderBottom: '1px solid black', height: '35px' }}>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Configurable Hospital Footer */}
                  <div style={{ borderTop: '1px solid black', paddingTop: '8px', marginTop: '20px', fontSize: '9pt', textAlign: 'center', color: '#333' }}>
                    <strong>{localStorage.getItem('hms_hospital_name') || 'HMS HOSPITAL'}</strong><br/>
                    {localStorage.getItem('hms_hospital_address') || 'Saraswati Nagar, Road No. 2, Opp. Dist. Co-operative Bank, Nizamabad'} &nbsp;|&nbsp; Contact No: {localStorage.getItem('hms_hospital_phone') || '08462-252322, 220322, 9515511633'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
