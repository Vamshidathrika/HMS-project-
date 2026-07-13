import React, { useState, useEffect } from 'react';
import { calculateAge, getHeaders } from '../utils/hmsUtils';
import OPCSView from './OPCSView';
import BillingDeskView from './BillingDeskView';
import { 
  Search, 
  CheckCircle2,
  Printer, 
  X, 
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  History,
  Layers,
  Eye,
  Pencil
} from 'lucide-react';

interface Patient {
  id: number;
  uhid: string;
  patientName: string;
  gender: string;
  bloodGroup: string;
  mobile: string;
  dateOfBirth: string;
  addressLine1: string;
  relationName: string;
}

interface Doctor {
  id: number;
  doctorCode: string;
  name: string;
  qualification: string;
  specialization: string;
  consultingFee: number;
  department: {
    id: number;
    deptName: string;
    deptCode: string;
  };
}

interface OPRegistration {
  id: number;
  patient: Patient;
  uhid: string;
  entryNumber: number;
  visitDate: string;
  visitTime: string;
  department: {
    id: number;
    deptName: string;
  };
  assignedDoctor: {
    id: number;
    name: string;
    consultingFee: number;
  };
  chiefComplaint: string;
  visitType: string;
  paymentStatus: string;
  tokenNumber: number;
  status: string;
  referringDoctor?: string;
  patientCategory?: string;
  consultingFee?: number;
  paymentMode?: string;
  ageValue?: number;
  ageUnit?: string;
  tempF?: string;
  pulseRate?: string;
  respiratoryRate?: string;
  spo2?: string;
  bloodPressure?: string;
  weight?: string;
  height?: string;
  remarks?: string;
}

interface PrescriptionSheetData {
  uhid: string;
  opId: number;
  patientName: string;
  dob: string;
  ageYears: string;
  gender: string;
  address: string;
  visitType: string;
  visitNumber: number;
  consultationFees: number;
  feesInWords: string;
  date: string;
  time: string;
  fatherOrHusbandName: string;
  referredBy: string;
  contactNumber: string;
  patientCategory: string;
  consultantName: string;
  qualification: string;
  designation: string;
  registrationNumber: string;
  tokenNumber: number;
}

export default function FrontDeskView({ 
  initialSubTab = 'new-patient',
  onSubTabChange,
  initialPatient = null,
  onClearPatient,
  currentUser
}: { 
  initialSubTab?: 'new-patient' | 'follow-up' | 'search' | 'reprint' | 'prepare-particular' | 'payment-entry' | 'memo-modify' | 'op-daybook' | 'dpsr-entry';
  onSubTabChange?: (tab: 'new-patient' | 'follow-up' | 'search' | 'reprint' | 'prepare-particular' | 'payment-entry' | 'memo-modify' | 'op-daybook' | 'dpsr-entry') => void;
  initialPatient?: Patient | null;
  onClearPatient?: () => void;
  currentUser?: { username: string; role: string; fullName: string } | null;
}) {
  const [subTab, setSubTab] = useState<'new-patient' | 'follow-up' | 'search' | 'reprint' | 'prepare-particular' | 'payment-entry' | 'memo-modify' | 'op-daybook' | 'dpsr-entry'>(initialSubTab as any);
  
  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab as any);
    }
  }, [initialSubTab]);

  const handleTabSwitch = (newTab: 'new-patient' | 'follow-up' | 'search' | 'reprint' | 'prepare-particular' | 'payment-entry' | 'memo-modify' | 'op-daybook' | 'dpsr-entry') => {
    setSubTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };

  // Common Master States
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  useEffect(() => {
    fetchDoctors();
    fetchNextUhid();
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



  // Printable states
  const [activeReceiptPrint, setActiveReceiptPrint] = useState<OPRegistration | null>(null);
  const [activePrescriptionPrint, setActivePrescriptionPrint] = useState<PrescriptionSheetData | null>(null);
  const [prescriptionWatermark, setPrescriptionWatermark] = useState(true);

  // Fetch and trigger prescription printing
  const handlePrintPrescription = async (opId: number) => {
    try {
      const res = await fetch(`/api/op/patient/${opId}/prescription-sheet`);
      if (!res.ok) {
        throw new Error('Failed to fetch prescription details');
      }
      const data = await res.json();
      setActivePrescriptionPrint(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching prescription details. Please try again.');
    }
  };

  // Trigger browser print
  const triggerPrint = () => {
    setTimeout(() => {
      window.print();
      setActiveReceiptPrint(null);
    }, 150);
  };

  // -------------------------------------------------------------
  // TAB 1: NEW PATIENT - OP STATE & LOGIC
  // -------------------------------------------------------------
  const generateUhidString = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${dd}${mm}${yy}${hh}${min}${ss}`;
  };

  const [currentUhid, setCurrentUhid] = useState(generateUhidString());

  const fetchNextUhid = async () => {
    try {
      const res = await fetch('/api/v1/patients/next-uhid');
      if (res.ok) {
        const data = await res.json();
        setCurrentUhid(data.uhid);
      } else {
        setCurrentUhid(generateUhidString());
      }
    } catch (err) {
      console.error('Error fetching next UHID:', err);
      setCurrentUhid(generateUhidString());
    }
  };

  // Modify Modal states
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isSubmittingModify, setIsSubmittingModify] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    patientId: 0,
    patientName: '',
    relationName: '',
    gender: 'M',
    bloodGroup: 'O+',
    mobile: '',
    dateOfBirth: '',
    addressLine1: '',

    registrationId: 0,
    doctorId: 0,
    chiefComplaint: '',
    visitType: 'New',
    paymentStatus: 'Pending',
    referringDoctor: 'SELF',
    patientCategory: 'General',
    consultingFee: 0,
    paymentMode: 'Cash',
    ageValue: '',
    ageUnit: 'Yrs',
    
    tempF: '',
    pulseRate: '',
    respiratoryRate: '',
    spo2: '',
    bloodPressure: '',
    weight: '',
    height: '',
    remarks: '',
  });

  const handleOpenModifyModal = (reg: OPRegistration) => {
    setModifyForm({
      patientId: reg.patient.id,
      patientName: reg.patient.patientName || '',
      relationName: reg.patient.relationName || '',
      gender: reg.patient.gender || 'M',
      bloodGroup: reg.patient.bloodGroup || 'O+',
      mobile: reg.patient.mobile || '',
      dateOfBirth: reg.patient.dateOfBirth || '',
      addressLine1: reg.patient.addressLine1 || '',

      registrationId: reg.id,
      doctorId: reg.assignedDoctor?.id || 0,
      chiefComplaint: reg.chiefComplaint || '',
      visitType: reg.visitType || 'New',
      paymentStatus: reg.paymentStatus || 'Pending',
      referringDoctor: reg.referringDoctor || 'SELF',
      patientCategory: reg.patientCategory || 'General',
      consultingFee: reg.consultingFee || reg.assignedDoctor?.consultingFee || 0,
      paymentMode: reg.paymentMode || 'Cash',
      ageValue: reg.ageValue !== undefined ? String(reg.ageValue) : '',
      ageUnit: reg.ageUnit || 'Yrs',
      
      tempF: reg.tempF || '',
      pulseRate: reg.pulseRate || '',
      respiratoryRate: reg.respiratoryRate || '',
      spo2: reg.spo2 || '',
      bloodPressure: reg.bloodPressure || '',
      weight: reg.weight || '',
      height: reg.height || '',
      remarks: reg.remarks || '',
    });
    setIsModifyModalOpen(true);
  };

  const handleSaveModify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingModify(true);
    try {
      // 1. Update Patient details
      const patientRes = await fetch(`/api/v1/patients/modify/${modifyForm.patientId}`, {
        method: 'PUT',
        headers: getHeaders('application/json'),
        body: JSON.stringify({
          patientName: modifyForm.patientName,
          relationName: modifyForm.relationName,
          gender: modifyForm.gender,
          bloodGroup: modifyForm.bloodGroup,
          dateOfBirth: modifyForm.dateOfBirth || null,
          mobile: modifyForm.mobile,
          addressLine1: modifyForm.addressLine1,
        })
      });

      if (!patientRes.ok) {
        const err = await patientRes.json();
        throw new Error(err.error || 'Failed to update patient details');
      }

      // 2. Update OP Registration details
      const visitRes = await fetch(`/api/v1/op/registrations/modify/${modifyForm.registrationId}`, {
        method: 'PUT',
        headers: getHeaders('application/json'),
        body: JSON.stringify({
          doctorId: Number(modifyForm.doctorId),
          chiefComplaint: modifyForm.chiefComplaint,
          visitType: modifyForm.visitType,
          paymentStatus: modifyForm.paymentStatus,
          referringDoctor: modifyForm.referringDoctor,
          patientCategory: modifyForm.patientCategory,
          consultingFee: Number(modifyForm.consultingFee) || 0,
          paymentMode: modifyForm.paymentMode,
          ageValue: Number(modifyForm.ageValue) || 35,
          ageUnit: modifyForm.ageUnit,
          tempF: modifyForm.tempF,
          pulseRate: modifyForm.pulseRate,
          respiratoryRate: modifyForm.respiratoryRate,
          spo2: modifyForm.spo2,
          bloodPressure: modifyForm.bloodPressure,
          weight: modifyForm.weight,
          height: modifyForm.height,
          remarks: modifyForm.remarks
        })
      });

      if (!visitRes.ok) {
        const err = await visitRes.json();
        throw new Error(err.error || 'Failed to update OP registration details');
      }

      setIsModifyModalOpen(false);
      loadReprintLogs();
      alert('OP registration details modified successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred while modifying details');
    } finally {
      setIsSubmittingModify(false);
    }
  };

  const [newPatientForm, setNewPatientForm] = useState({
    patientName: '',
    relationName: '',
    gender: 'M',
    bloodGroup: 'O+',
    dateOfBirth: '',
    mobile: '',
    addressLine1: '',
    doctorId: '',
    referringDoctor: 'SELF',
    patientCategory: 'General',
    chiefComplaint: '',
    paymentStatus: 'Paid',
    paymentMode: 'Cash',
    consultationDate: new Date().toISOString().split('T')[0],
    ageValue: '',
    ageUnit: 'Yrs',
    consultingFee: '',
    aadharNumber: '',
    // Vitals
    tempF: '',
    pulseRate: '',
    respiratoryRate: '',
    spo2: '',
    bloodPressure: '',
    weight: '',
    height: '',
    remarks: ''
  });

  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [newSuccessReg, setNewSuccessReg] = useState<OPRegistration | null>(null);
  const [newPatientError, setNewPatientError] = useState<string | null>(null);

  // Bidirectional DOB / Age calculation
  const updateDobFromAge = (ageVal: string, unit: string) => {
    if (!ageVal) {
      setNewPatientForm(prev => ({ ...prev, ageValue: '', ageUnit: unit, dateOfBirth: '' }));
      return;
    }
    const ageNum = parseInt(ageVal);
    if (isNaN(ageNum)) return;
    const now = new Date();
    if (unit === 'Yrs') {
      now.setFullYear(now.getFullYear() - ageNum);
    } else if (unit === 'Mths') {
      now.setMonth(now.getMonth() - ageNum);
    } else if (unit === 'Days') {
      now.setDate(now.getDate() - ageNum);
    }
    const dobStr = now.toISOString().split('T')[0];
    setNewPatientForm(prev => ({ 
      ...prev, 
      dateOfBirth: dobStr, 
      ageValue: ageVal, 
      ageUnit: unit 
    }));
  };

  const updateAgeFromDob = (dobString: string) => {
    if (!dobString) {
      setNewPatientForm(prev => ({ ...prev, dateOfBirth: '', ageValue: '' }));
      return;
    }
    const birthDate = new Date(dobString);
    const today = new Date();
    let diffTime = today.getTime() - birthDate.getTime();
    if (diffTime < 0) diffTime = 0;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let ageVal = 0;
    let ageUnitVal = 'Yrs';
    
    if (diffDays >= 365) {
      ageVal = Math.floor(diffDays / 365);
      ageUnitVal = 'Yrs';
    } else if (diffDays >= 30) {
      ageVal = Math.floor(diffDays / 30);
      ageUnitVal = 'Mths';
    } else {
      ageVal = diffDays;
      ageUnitVal = 'Days';
    }
    
    setNewPatientForm(prev => ({ 
      ...prev, 
      dateOfBirth: dobString, 
      ageValue: String(ageVal), 
      ageUnit: ageUnitVal 
    }));
  };

  const handleDoctorChange = (docId: string) => {
    const doc = doctors.find(d => d.id === Number(docId));
    setNewPatientForm(prev => ({
      ...prev,
      doctorId: docId,
      consultingFee: doc ? String(doc.consultingFee) : ''
    }));
  };

  const handleCreateNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.doctorId) {
      alert('Please select a consulting doctor');
      return;
    }
    setIsSubmittingNew(true);
    setNewPatientError(null);
    setNewSuccessReg(null);

    try {
      // 1. Create Patient demographic master record
      const patientRes = await fetch('/api/v1/patients/register', {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({
          uhid: currentUhid,
          patientName: newPatientForm.patientName,
          relationName: newPatientForm.relationName,
          gender: newPatientForm.gender,
          bloodGroup: newPatientForm.bloodGroup,
          dateOfBirth: newPatientForm.dateOfBirth || null,
          mobile: newPatientForm.mobile,
          addressLine1: newPatientForm.addressLine1,
          aadharNumber: newPatientForm.aadharNumber
        })
      });

      if (!patientRes.ok) {
        const err = await patientRes.json();
        throw new Error(err.error || 'Failed to create patient record');
      }

      const createdPatient = await patientRes.json();

      // 2. Book OPD Consultation visit
      const visitRes = await fetch('/api/v1/op/registrations', {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({
          patientId: createdPatient.id,
          doctorId: Number(newPatientForm.doctorId),
          chiefComplaint: newPatientForm.chiefComplaint,
          visitType: 'New',
          paymentStatus: newPatientForm.paymentStatus,
          referringDoctor: newPatientForm.referringDoctor,
          patientCategory: newPatientForm.patientCategory,
          consultingFee: Number(newPatientForm.consultingFee) || 0.0,
          paymentMode: newPatientForm.paymentMode,
          ageValue: Number(newPatientForm.ageValue) || 35,
          ageUnit: newPatientForm.ageUnit,
          // Vitals
          tempF: newPatientForm.tempF,
          pulseRate: newPatientForm.pulseRate,
          respiratoryRate: newPatientForm.respiratoryRate,
          spo2: newPatientForm.spo2,
          bloodPressure: newPatientForm.bloodPressure,
          weight: newPatientForm.weight,
          height: newPatientForm.height,
          remarks: newPatientForm.remarks
        })
      });

      if (!visitRes.ok) {
        const err = await visitRes.json();
        throw new Error(err.error || 'Failed to book outpatient visit');
      }

      const registration = await visitRes.json();
      setNewSuccessReg(registration);
      
      // Reset form and generate new UHID
      fetchNextUhid();
      setNewPatientForm({
        patientName: '',
        relationName: '',
        gender: 'M',
        bloodGroup: 'O+',
        dateOfBirth: '',
        mobile: '',
        addressLine1: '',
        doctorId: '',
        referringDoctor: 'SELF',
        patientCategory: 'General',
        chiefComplaint: '',
        paymentStatus: 'Paid',
        paymentMode: 'Cash',
        consultationDate: new Date().toISOString().split('T')[0],
        ageValue: '',
        ageUnit: 'Yrs',
        consultingFee: '',
        aadharNumber: '',
        tempF: '',
        pulseRate: '',
        respiratoryRate: '',
        spo2: '',
        bloodPressure: '',
        weight: '',
        height: '',
        remarks: ''
      });
    } catch (err: any) {
      setNewPatientError(err.message || 'Error creating patient visit');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const selectedNewDoctor = doctors.find(d => d.id === Number(newPatientForm.doctorId));

  // -------------------------------------------------------------
  // TAB 2: FOLLOW UP / REVIEW - OP STATE & LOGIC
  // -------------------------------------------------------------
  const [followUpUhid, setFollowUpUhid] = useState('');
  const [isFetchingFollowUp, setIsFetchingFollowUp] = useState(false);
  const [followUpPatient, setFollowUpPatient] = useState<Patient | null>(null);
  const [followUpHistory, setFollowUpHistory] = useState<OPRegistration[]>([]);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  const [followUpForm, setFollowUpForm] = useState({
    doctorId: '',
    chiefComplaint: '',
    paymentStatus: 'Paid',
    paymentMode: 'Cash'
  });
  const [isBookingFollowUp, setIsBookingFollowUp] = useState(false);
  const [followUpSuccessReg, setFollowUpSuccessReg] = useState<OPRegistration | null>(null);

  // Pre-load patient if passed from parent
  useEffect(() => {
    if (initialPatient && subTab === 'follow-up') {
      setFollowUpUhid(initialPatient.uhid);
      loadFollowUpData(initialPatient.uhid);
    }
  }, [initialPatient, subTab]);

  const loadFollowUpData = async (uhidVal: string) => {
    if (!uhidVal) return;
    setIsFetchingFollowUp(true);
    setFollowUpError(null);
    setFollowUpPatient(null);
    setFollowUpHistory([]);
    setFollowUpSuccessReg(null);

    try {
      // Find patient by UHID
      const patRes = await fetch(`/api/v1/patients/search?query=${encodeURIComponent(uhidVal)}`);
      if (patRes.ok) {
        const patientsList = await patRes.json();
        const found = (patientsList as Patient[]).find(p => p.uhid.toLowerCase() === uhidVal.trim().toLowerCase());
        if (found) {
          setFollowUpPatient(found);
          // Load visit history
          const histRes = await fetch(`/api/v1/op/registrations/patient?uhid=${encodeURIComponent(found.uhid)}`);
          if (histRes.ok) {
            const histData = await histRes.json();
            setFollowUpHistory(histData);
          }
        } else {
          setFollowUpError('No patient matching UHID found in database.');
        }
      } else {
        throw new Error('Database search failed');
      }
    } catch (err: any) {
      setFollowUpError(err.message || 'Error fetching patient details');
    } finally {
      setIsFetchingFollowUp(false);
    }
  };

  const handleBookFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpPatient || !followUpForm.doctorId) {
      alert('Please search a patient and select a consulting doctor');
      return;
    }
    setIsBookingFollowUp(true);
    setFollowUpError(null);

    try {
      const visitRes = await fetch('/api/v1/op/registrations', {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({
          patientId: followUpPatient.id,
          doctorId: Number(followUpForm.doctorId),
          chiefComplaint: `Follow-up | ${followUpForm.chiefComplaint}`,
          visitType: 'FollowUp',
          paymentStatus: followUpForm.paymentStatus
        })
      });

      if (!visitRes.ok) {
        const err = await visitRes.json();
        throw new Error(err.error || 'Failed to book follow-up');
      }

      const registration = await visitRes.json();
      setFollowUpSuccessReg(registration);
      // Reload history
      loadFollowUpData(followUpPatient.uhid);
      // Reset form fields
      setFollowUpForm({
        doctorId: '',
        chiefComplaint: '',
        paymentStatus: 'Paid',
        paymentMode: 'Cash'
      });
    } catch (err: any) {
      setFollowUpError(err.message || 'Error booking follow-up visit');
    } finally {
      setIsBookingFollowUp(false);
    }
  };

  const selectedFollowUpDoctor = doctors.find(d => d.id === Number(followUpForm.doctorId));

  // -------------------------------------------------------------
  // TAB 3: SEARCH OP STATE & LOGIC
  // -------------------------------------------------------------
  const [searchNameQuery, setSearchNameQuery] = useState('');
  const [searchMobileQuery, setSearchMobileQuery] = useState('');
  const [searchUhidQuery, setSearchUhidQuery] = useState('');
  const [searchResultList, setSearchResultList] = useState<Patient[]>([]);
  const [isSearchingList, setIsSearchingList] = useState(false);
  const [viewedPatientDetails, setViewedPatientDetails] = useState<Patient | null>(null);
  const [inspectedVisitHistory, setInspectedVisitHistory] = useState<OPRegistration[]>([]);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);

  const executeSearch = async (queryVal: string) => {
    if (!queryVal.trim()) return;
    setIsSearchingList(true);
    setSearchResultList([]);
    try {
      const res = await fetch(`/api/v1/patients/search?query=${encodeURIComponent(queryVal)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResultList(data);
      }
    } catch (err) {
      console.error('Error searching patients:', err);
    } finally {
      setIsSearchingList(false);
    }
  };

  const inspectHistory = async (patient: Patient) => {
    setViewedPatientDetails(patient);
    setIsInspectionOpen(true);
    setInspectedVisitHistory([]);
    try {
      const res = await fetch(`/api/v1/op/registrations/patient?uhid=${encodeURIComponent(patient.uhid)}`);
      if (res.ok) {
        const data = await res.json();
        setInspectedVisitHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // -------------------------------------------------------------
  // TAB 4: REPRINT INVOICE TABLE STATE & LOGIC
  // -------------------------------------------------------------
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [reprintList, setReprintList] = useState<OPRegistration[]>([]);
  const [isFetchingReprint, setIsFetchingReprint] = useState(false);

  const loadReprintLogs = async () => {
    setIsFetchingReprint(true);
    setReprintList([]);
    try {
      const res = await fetch(`/api/v1/op/registrations?fromDate=${fromDate}&toDate=${toDate}`);
      if (res.ok) {
        const data = await res.json();
        setReprintList(data);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setIsFetchingReprint(false);
    }
  };

  useEffect(() => {
    if (subTab === 'reprint') {
      loadReprintLogs();
    }
  }, [subTab]);

  const totalPatientsCount = reprintList.length;
  const totalFeesCollected = reprintList.reduce((sum, reg) => sum + (reg.assignedDoctor?.consultingFee || 0), 0);

  return (
    <div className="space-y-8">
      {/* 1. Styled Tab Navigation Header */}
      <div className="bg-white border border-[#D7E8EA] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md no-print">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-[#147C8A]" />
          <div>
            <h1 className="text-lg font-bold text-[#1E293B] tracking-wide uppercase">
              OUTPATIENT (OP) DESK
            </h1>
            <div className="text-[10px] text-[#64748B] mt-0.5 space-x-3">
              <span>User: <strong className="text-[#1E293B]">{currentUser?.fullName || 'FrontDesk Clerk'}</strong></span>
              <span>Date: <strong className="text-[#1E293B]">{new Date().toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button 
            type="button"
            onClick={() => handleTabSwitch('new-patient')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subTab === 'new-patient' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#64748B] hover:text-[#64748B]'}`}
          >
            New Patient OP
          </button>
          <button 
            type="button"
            onClick={() => handleTabSwitch('follow-up')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subTab === 'follow-up' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#64748B] hover:text-[#64748B]'}`}
          >
            Follow Up OP
          </button>
          <button 
            type="button"
            onClick={() => handleTabSwitch('search')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subTab === 'search' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#64748B] hover:text-[#64748B]'}`}
          >
            Search OP
          </button>
          <button 
            type="button"
            onClick={() => handleTabSwitch('reprint')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subTab === 'reprint' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#64748B] hover:text-[#64748B]'}`}
          >
            Reprint / List OP
          </button>
          <button 
            type="button"
            onClick={() => handleTabSwitch('prepare-particular')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subTab === 'prepare-particular' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#64748B] hover:text-[#64748B]'}`}
          >
            Prepare Particular/Memo- OPCS
          </button>
          <button 
            type="button"
            onClick={() => handleTabSwitch('payment-entry')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subTab === 'payment-entry' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#64748B] hover:text-[#64748B]'}`}
          >
            Payment Entry- OPCS
          </button>
          <button 
            type="button"
            onClick={() => handleTabSwitch('memo-modify')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subTab === 'memo-modify' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#64748B] hover:text-[#64748B]'}`}
          >
            Memo Modify/Delete- OPCS
          </button>
          <button 
            type="button"
            onClick={() => handleTabSwitch('op-daybook')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subTab === 'op-daybook' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#64748B] hover:text-[#64748B]'}`}
          >
            OP-Day Book
          </button>
          <button 
            type="button"
            onClick={() => handleTabSwitch('dpsr-entry')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subTab === 'dpsr-entry' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#64748B] hover:text-[#64748B]'}`}
          >
            DPSR- Entry
          </button>
        </div>

        {/* Header Controls */}
        <div className="flex items-center space-x-2">
          <button 
            type="button"
            onClick={() => {
              if (subTab === 'new-patient') {
                setNewPatientForm({
                  patientName: '',
                  relationName: '',
                  gender: 'M',
                  bloodGroup: 'O+',
                  dateOfBirth: '',
                  mobile: '',
                  addressLine1: '',
                  doctorId: '',
                  referringDoctor: 'SELF',
                  patientCategory: 'General',
                  chiefComplaint: '',
                  paymentStatus: 'Paid',
                  paymentMode: 'Cash',
                  consultationDate: new Date().toISOString().split('T')[0],
                  ageValue: '',
                  ageUnit: 'Yrs',
                  consultingFee: '',
                  aadharNumber: '',
                  tempF: '',
                  pulseRate: '',
                  respiratoryRate: '',
                  spo2: '',
                  bloodPressure: '',
                  weight: '',
                  height: '',
                  remarks: ''
                });
                fetchNextUhid();
                setNewSuccessReg(null);
              } else if (subTab === 'follow-up') {
                setFollowUpUhid('');
                setFollowUpPatient(null);
                setFollowUpHistory([]);
                setFollowUpSuccessReg(null);
              } else if (subTab === 'search') {
                setSearchNameQuery(''); setSearchMobileQuery(''); setSearchUhidQuery(''); setSearchResultList([]);
              } else {
                loadReprintLogs();
              }
            }}
            title="Refresh Page"
            className="p-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#64748B] rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={onClearPatient}
            title="Go Back"
            className="p-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#64748B] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. SUBTAB VIEWS */}

      {/* VIEW A: NEW PATIENT - OP */}
      {subTab === 'new-patient' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
          {/* Form Area */}
          <form onSubmit={handleCreateNewPatient} className="lg:col-span-8 space-y-6">
            
            {/* Success overlay banner */}
            {newSuccessReg && (
              <div className="bg-green-50 border border-emerald-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-emerald-500 shadow-sm shadow-emerald-950/10">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-[#1E293B]">OPD Registration Successful!</h3>
                    <p className="text-xs text-[#64748B] mt-1">UHID: <strong className="text-[#147C8A] font-mono text-sm">{newSuccessReg.uhid}</strong> | Token No: <strong className="text-[#1E293B] text-sm">#{newSuccessReg.tokenNumber}</strong></p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    type="button" 
                    onClick={() => { setActiveReceiptPrint(newSuccessReg); triggerPrint(); }}
                    className="flex-1 md:flex-none px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handlePrintPrescription(newSuccessReg.id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#147C8A] font-bold border border-[#D7E8EA] rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Prescription Sheet</span>
                  </button>
                </div>
              </div>
            )}

            {newPatientError && (
              <div className="bg-red-50 border border-rose-500/25 p-4 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{newPatientError}</span>
              </div>
            )}

            {/* Section 1: NEW OUT PATIENT (OP) */}
            <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#D7E8EA]">
                <CheckCircle2 className="w-5 h-5 text-[#147C8A]" />
                <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">NEW OUT PATIENT (OP)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                {/* Row 1 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">UHID (System Generated No)</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={currentUhid}
                    className="col-span-2 bg-yellow-100 text-[#1E293B] font-bold font-mono rounded-xl px-3 py-1.5 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">OP ID (Auto Scroll No)</label>
                  <input 
                    type="text" 
                    readOnly 
                    value="Generated Automatically"
                    className="col-span-2 bg-[#EAF7F8] border border-[#D7E8EA] text-[#64748B] rounded-xl px-3 py-1.5 focus:outline-none"
                  />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Patient Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter patient name"
                    value={newPatientForm.patientName}
                    onChange={e => setNewPatientForm({ ...newPatientForm, patientName: e.target.value })}
                    className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Date (Consultation)</label>
                  <input 
                    type="date"
                    value={newPatientForm.consultationDate}
                    onChange={e => setNewPatientForm({ ...newPatientForm, consultationDate: e.target.value })}
                    className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                  />
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Father Name/ Husband Name</label>
                  <input 
                    type="text"
                    placeholder="Enter relative name"
                    value={newPatientForm.relationName}
                    onChange={e => setNewPatientForm({ ...newPatientForm, relationName: e.target.value })}
                    className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Date of Birth (DOB)</label>
                  <input 
                    type="date"
                    value={newPatientForm.dateOfBirth}
                    onChange={e => updateAgeFromDob(e.target.value)}
                    className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                  />
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Gender (Sex) *</label>
                  <select 
                    value={newPatientForm.gender}
                    onChange={e => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="col-span-2 border rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                  >
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="M">Male</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="F">Female</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="O">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Age (Yrs)</label>
                  <div className="col-span-2 flex gap-2">
                    <input 
                      type="number"
                      placeholder="Age"
                      value={newPatientForm.ageValue}
                      onChange={e => updateDobFromAge(e.target.value, newPatientForm.ageUnit)}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                    />
                    <select
                      value={newPatientForm.ageUnit}
                      onChange={e => updateDobFromAge(newPatientForm.ageValue, e.target.value)}
                      className="w-24 border rounded-xl px-2 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Yrs">Yrs</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Mths">Mths</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Days">Days</option>
                    </select>
                  </div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Referring Dr.</label>
                  <select
                    value={newPatientForm.referringDoctor}
                    onChange={e => setNewPatientForm({ ...newPatientForm, referringDoctor: e.target.value })}
                    className="col-span-2 border rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                  >
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="SELF">SELF</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Dr. Ramesh (Gen Physician)">Dr. Ramesh (Gen Physician)</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Dr. Srinivas (Cardio)">Dr. Srinivas (Cardio)</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Direct Walkin">Direct Walkin</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Consulting Dr. *</label>
                  <select
                    required
                    value={newPatientForm.doctorId}
                    onChange={e => handleDoctorChange(e.target.value)}
                    className="col-span-2 border rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                  >
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>

                {/* Row 6 */}
                <div className="grid grid-cols-3 items-start gap-2">
                  <label className="text-[#64748B] font-medium pt-1">Address</label>
                  <textarea
                    placeholder="Enter address details"
                    rows={2}
                    value={newPatientForm.addressLine1}
                    onChange={e => setNewPatientForm({ ...newPatientForm, addressLine1: e.target.value })}
                    className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8] resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Contact No (Cell) *</label>
                  <input 
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newPatientForm.mobile}
                    onChange={e => setNewPatientForm({ ...newPatientForm, mobile: e.target.value })}
                    className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                  />
                </div>

                {/* Row 7 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Visit Type</label>
                  <select
                    value={newPatientForm.chiefComplaint.includes("Follow-up") ? "Follow Up" : "New OP"}
                    onChange={e => {
                      const val = e.target.value;
                      setNewPatientForm(prev => ({ 
                        ...prev, 
                        chiefComplaint: val === "Follow Up" ? "Follow Up" : "" 
                      }));
                    }}
                    className="col-span-2 border rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                  >
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="New OP">New OP</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Follow Up">Follow Up</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Review">Review</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Patient Category</label>
                  <select
                    value={newPatientForm.patientCategory}
                    onChange={e => setNewPatientForm({ ...newPatientForm, patientCategory: e.target.value })}
                    className="col-span-2 border rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                  >
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="General">General</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Emergency">Emergency</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Staff">Hospital Staff</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Exempted">Exempted / Free</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="TPA Claim">Insurance / TPA</option>
                  </select>
                </div>

                {/* Row 8 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Consultation Fees</label>
                  <input 
                    type="number"
                    placeholder="0.00"
                    value={newPatientForm.consultingFee}
                    onChange={e => setNewPatientForm({ ...newPatientForm, consultingFee: e.target.value })}
                    className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8] font-semibold text-emerald-700"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">Payment Mode</label>
                  <select
                    value={newPatientForm.paymentMode}
                    onChange={e => setNewPatientForm({ ...newPatientForm, paymentMode: e.target.value })}
                    className="col-span-2 border rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                  >
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Cash">Cash</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Card">Card</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="UPI">UPI</option>
                  </select>
                </div>

                {/* Row 9 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[#64748B] font-medium">AAadhar No. (Optional)</label>
                  <input 
                    type="text"
                    placeholder="12-digit Aadhaar No"
                    maxLength={12}
                    value={newPatientForm.aadharNumber}
                    onChange={e => setNewPatientForm({ ...newPatientForm, aadharNumber: e.target.value })}
                    className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: VITAL PARAMETERS/ GENERAL EXAMINATIONS */}
            <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#D7E8EA]">
                <Layers className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">VITAL PARAMETERS/ GENERAL EXAMINATIONS</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-[#64748B] font-medium">Temp (F)</label>
                    <input 
                      type="text"
                      placeholder="e.g. 98.6"
                      value={newPatientForm.tempF}
                      onChange={e => setNewPatientForm({ ...newPatientForm, tempF: e.target.value })}
                      className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-[#64748B] font-medium">SPo2</label>
                    <input 
                      type="text"
                      placeholder="e.g. 98"
                      value={newPatientForm.spo2}
                      onChange={e => setNewPatientForm({ ...newPatientForm, spo2: e.target.value })}
                      className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-[#64748B] font-medium">Height (cms)</label>
                    <input 
                      type="text"
                      placeholder="e.g. 170"
                      value={newPatientForm.height}
                      onChange={e => setNewPatientForm({ ...newPatientForm, height: e.target.value })}
                      className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-[#64748B] font-medium">PR</label>
                    <input 
                      type="text"
                      placeholder="Pulse Rate"
                      value={newPatientForm.pulseRate}
                      onChange={e => setNewPatientForm({ ...newPatientForm, pulseRate: e.target.value })}
                      className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-[#64748B] font-medium">BP</label>
                    <input 
                      type="text"
                      placeholder="e.g. 130/80"
                      value={newPatientForm.bloodPressure}
                      onChange={e => setNewPatientForm({ ...newPatientForm, bloodPressure: e.target.value })}
                      className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                    />
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-[#64748B] font-medium">RR</label>
                    <input 
                      type="text"
                      placeholder="Resp Rate"
                      value={newPatientForm.respiratoryRate}
                      onChange={e => setNewPatientForm({ ...newPatientForm, respiratoryRate: e.target.value })}
                      className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-[#64748B] font-medium">Weight (Kgs)</label>
                    <input 
                      type="text"
                      placeholder="e.g. 70"
                      value={newPatientForm.weight}
                      onChange={e => setNewPatientForm({ ...newPatientForm, weight: e.target.value })}
                      className="col-span-2 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8]"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs pt-2">
                <label className="md:col-span-2 text-[#64748B] font-medium pt-1">Remarks</label>
                <textarea
                  placeholder="General clinical remarks..."
                  rows={2}
                  value={newPatientForm.remarks}
                  onChange={e => setNewPatientForm({ ...newPatientForm, remarks: e.target.value })}
                  className="md:col-span-10 bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] placeholder-[#94A3B8] resize-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmittingNew}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-[#1E293B] font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              {isSubmittingNew ? 'Creating Details...' : 'Create New Patient Details'}
            </button>
          </form>

          {/* Quick Info Side Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 text-[#64748B] text-xs space-y-4">
              <h4 className="font-bold text-[#1E293B] text-sm">Consultation Ledger Summary</h4>
              <div className="flex justify-between items-center py-2 border-b border-[#D7E8EA]">
                <span>Registration Code:</span>
                <strong className="text-[#1E293B] font-mono">OPD-NEW-REG</strong>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D7E8EA]">
                <span>Unique Patient UHID:</span>
                <strong className="text-[#147C8A] font-mono">Auto-Generated</strong>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D7E8EA]">
                <span>Assigned Doctor:</span>
                <strong className="text-[#1E293B]">{selectedNewDoctor ? selectedNewDoctor.name : 'Not Selected'}</strong>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D7E8EA] text-sm">
                <span>Consultation Fee:</span>
                <strong className="text-emerald-700 text-lg">₹{selectedNewDoctor ? selectedNewDoctor.consultingFee.toFixed(2) : '0.00'}</strong>
              </div>
              <p className="text-[10px] text-[#64748B] leading-normal">
                * Registering a patient auto-generates their unique Health Index Number (UHID). OPD appointments trigger token numbers dynamically relative to the selected doctor's queue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: FOLLOW UP / REVIEW - OP */}
      {subTab === 'follow-up' && (
        <div className="space-y-6 no-print">
          
          {/* Look up strip */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h2 className="text-xs font-bold text-[#147C8A] uppercase tracking-widest border-b border-[#D7E8EA]/60 pb-2 mb-4">
              Search Patient by UHID for Follow-up Review
            </h2>
            <form onSubmit={e => { e.preventDefault(); loadFollowUpData(followUpUhid); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
                <input 
                  type="text" required placeholder="Enter Patient UHID (e.g. 260615AH0000001)"
                  value={followUpUhid}
                  onChange={e => setFollowUpUhid(e.target.value)}
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none placeholder-[#94A3B8]"
                />
              </div>
              <button 
                type="submit"
                disabled={isFetchingFollowUp}
                className="px-6 py-2 bg-[#147C8A] hover:bg-[#0F6672] disabled:bg-[#D7E8EA] text-white disabled:text-[#94A3B8] font-bold rounded-xl text-xs"
              >
                {isFetchingFollowUp ? 'Fetching...' : 'Get Data'}
              </button>
            </form>

            {followUpError && (
              <div className="bg-red-50 border border-rose-500/25 p-4 rounded-xl text-rose-700 text-xs mt-4 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-700" />
                <span>{followUpError}</span>
              </div>
            )}
          </div>

          {followUpSuccessReg && (
            <div className="bg-green-50 border border-emerald-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-emerald-500 shadow-sm no-print">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#1E293B]">OPD Follow-up visit Booked!</h3>
                  <p className="text-xs text-[#64748B] mt-1">UHID: <strong className="text-[#147C8A] font-mono text-sm">{followUpSuccessReg.uhid}</strong> | Token No: <strong className="text-[#1E293B] text-sm">#{followUpSuccessReg.tokenNumber}</strong></p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  type="button" 
                  onClick={() => { setActiveReceiptPrint(followUpSuccessReg); triggerPrint(); }}
                  className="flex-1 md:flex-none px-4 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handlePrintPrescription(followUpSuccessReg.id)}
                  className="flex-1 md:flex-none px-4 py-2 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#147C8A] font-bold border border-[#D7E8EA] rounded-xl text-xs flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Prescription Sheet</span>
                </button>
              </div>
            </div>
          )}

          {/* Grid Layout for loaded Patient Details and booking form */}
          {followUpPatient && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Summary and History */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Summary panel */}
                <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-3">
                  <h3 className="text-xs font-bold text-[#147C8A] uppercase tracking-widest border-b border-[#D7E8EA] pb-2 flex items-center justify-between">
                    <span>Patient Profile Summary</span>
                    <span className="text-[10px] bg-[#F8FBFB] px-2 py-0.5 rounded text-[#147C8A]">{followUpPatient.gender} | {calculateAge(followUpPatient.dateOfBirth)}</span>
                  </h3>
                  <div className="text-xs space-y-2.5 text-[#1E293B]">
                    <div>Name: <strong className="text-[#1E293B] text-sm font-semibold">{followUpPatient.patientName}</strong></div>
                    <div>UHID: <code className="text-[#147C8A] font-mono font-bold text-xs">{followUpPatient.uhid}</code></div>
                    <div>Guardian/Spouse: <span className="text-[#1E293B] font-medium">{followUpPatient.relationName || 'N/A'}</span></div>
                    <div>Contact No: <span className="text-[#1E293B] font-medium">{followUpPatient.mobile}</span></div>
                    <div>Address: <span className="text-[#1E293B] font-medium">{followUpPatient.addressLine1 || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Visit History list */}
                <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-3">
                  <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2">
                    Prior Consultations History ({followUpHistory.length})
                  </h3>
                  {followUpHistory.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#64748B]">No prior visit records retrieved.</div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {followUpHistory.map(h => (
                        <div key={h.id} className="p-3 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono text-[#147C8A]">{h.visitDate}</span>
                            <span className="bg-white text-[#64748B] px-2 py-0.5 rounded uppercase font-bold text-[8px]">{h.visitType}</span>
                          </div>
                          <div className="text-xs text-[#1E293B] font-bold">{h.assignedDoctor?.name} ({h.department?.deptName})</div>
                          {h.chiefComplaint && <div className="text-[10px] text-[#64748B] leading-normal truncate">{h.chiefComplaint}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Follow-up Booking Form */}
              <form onSubmit={handleBookFollowUp} className="lg:col-span-7 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
                <h3 className="text-xs font-bold text-[#147C8A] uppercase tracking-widest border-b border-[#D7E8EA]/60 pb-2">
                  Book Review / Follow-up Visit details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#64748B] uppercase">Consulting Doctor *</label>
                    <select 
                      required
                      value={followUpForm.doctorId}
                      onChange={e => setFollowUpForm({ ...followUpForm, doctorId: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Doctor</option>
                      {doctors.map(d => (
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#64748B] uppercase">Follow-up Fee (₹)</label>
                    <div className="bg-[#F8FBFB] border border-[#D7E8EA] px-3 py-1.5 rounded-xl text-emerald-700 text-sm font-bold">
                      ₹{selectedFollowUpDoctor ? (selectedFollowUpDoctor.consultingFee / 2).toFixed(2) : '0.00'} 
                      <span className="text-[10px] text-[#64748B] font-normal ml-2">(50% Review Discount Applied)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#64748B] uppercase">Follow-up Comments / Complaints</label>
                  <input 
                    type="text" placeholder="e.g. Regular review, report checking"
                    value={followUpForm.chiefComplaint}
                    onChange={e => setFollowUpForm({ ...followUpForm, chiefComplaint: e.target.value })}
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3.5 py-1.5 text-xs text-[#1E293B] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#64748B] uppercase">Payment Status</label>
                    <select 
                      value={followUpForm.paymentStatus}
                      onChange={e => setFollowUpForm({ ...followUpForm, paymentStatus: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-1.5 text-xs focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Paid">Paid</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Pending">Pending</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Exempted">Exempted</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#64748B] uppercase">Payment Mode</label>
                    <select 
                      value={followUpForm.paymentMode}
                      onChange={e => setFollowUpForm({ ...followUpForm, paymentMode: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-1.5 text-xs focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Cash">Cash</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Card">Card</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isBookingFollowUp}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#1E293B] font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  {isBookingFollowUp ? 'Booking Follow-up...' : 'Book Follow-up OPD Visit'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW C: SEARCH OP */}
      {subTab === 'search' && (
        <div className="space-y-6 no-print">
          
          {/* Three Search Criteria Cards */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
            <h2 className="text-xs font-bold text-[#147C8A] uppercase tracking-widest border-b border-[#D7E8EA]/60 pb-2 mb-2">
              Patient Search Criteria
            </h2>

            <div className="space-y-3.5 max-w-2xl">
              {/* Row 1: Search by Name */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
                <span className="text-xs font-bold text-[#64748B] uppercase sm:col-span-1">Search by Name:</span>
                <input 
                  type="text" placeholder="Enter patient name..."
                  value={searchNameQuery}
                  onChange={e => setSearchNameQuery(e.target.value)}
                  className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none sm:col-span-2"
                />
                <button 
                  type="button"
                  onClick={() => executeSearch(searchNameQuery)}
                  className="py-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#147C8A] font-bold border border-[#D7E8EA] rounded-xl text-xs"
                >
                  Get Data
                </button>
              </div>

              {/* Row 2: Search by Mobile No */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
                <span className="text-xs font-bold text-[#64748B] uppercase sm:col-span-1">Search by Mobile No:</span>
                <input 
                  type="tel" placeholder="Enter mobile number..."
                  value={searchMobileQuery}
                  onChange={e => setSearchMobileQuery(e.target.value)}
                  className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none sm:col-span-2"
                />
                <button 
                  type="button"
                  onClick={() => executeSearch(searchMobileQuery)}
                  className="py-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#147C8A] font-bold border border-[#D7E8EA] rounded-xl text-xs"
                >
                  Get Data
                </button>
              </div>

              {/* Row 3: Search by UHID */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
                <span className="text-xs font-bold text-[#64748B] uppercase sm:col-span-1">Search by UHID #:</span>
                <input 
                  type="text" placeholder="Enter patient UHID..."
                  value={searchUhidQuery}
                  onChange={e => setSearchUhidQuery(e.target.value)}
                  className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none sm:col-span-2"
                />
                <button 
                  type="button"
                  onClick={() => executeSearch(searchUhidQuery)}
                  className="py-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#147C8A] font-bold border border-[#D7E8EA] rounded-xl text-xs"
                >
                  Get Data
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid Table */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2 mb-4">
              Patient Registry Lookup Index ({searchResultList.length} rows)
            </h3>

            {isSearchingList ? (
              <div className="text-center py-12 text-[#64748B] text-xs">Scanning database register...</div>
            ) : searchResultList.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] text-xs">No records found. Input criteria and query to fetch rows.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E293B]">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B]">
                      <th className="py-2.5">UHID</th>
                      <th className="py-2.5">Patient Name</th>
                      <th className="py-2.5">Relation</th>
                      <th className="py-2.5">Sex/Age</th>
                      <th className="py-2.5">Contact No</th>
                      <th className="py-2.5">Address</th>
                      <th className="py-2.5 text-center">Row Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {searchResultList.map(pat => (
                      <tr key={pat.uhid} className="hover:bg-[#EAF7F8]/20">
                        <td className="py-3 font-mono font-bold text-[#147C8A]">{pat.uhid}</td>
                        <td className="py-3 font-bold text-[#1E293B]">{pat.patientName}</td>
                        <td className="py-3 text-[#64748B]">{pat.relationName || 'N/A'}</td>
                        <td className="py-3">{pat.gender} / {calculateAge(pat.dateOfBirth)}</td>
                        <td className="py-3 font-mono">{pat.mobile}</td>
                        <td className="py-3 text-[#64748B] max-w-xs truncate">{pat.addressLine1 || 'N/A'}</td>
                        <td className="py-3">
                          <div className="flex justify-center space-x-2.5 text-[10px] font-bold">
                            <button 
                              type="button"
                              onClick={() => inspectHistory(pat)}
                              className="text-[#147C8A] hover:underline flex items-center space-x-0.5"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Open Detail</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setFollowUpUhid(pat.uhid);
                                loadFollowUpData(pat.uhid);
                                handleTabSwitch('follow-up');
                              }}
                              className="text-emerald-700 hover:underline flex items-center space-x-0.5"
                            >
                              <History className="w-3 h-3" />
                              <span>Start Follow-up</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal / details overlay for Inspecting Visit History */}
          {isInspectionOpen && viewedPatientDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#EAF7F8] backdrop-blur-sm no-print">
              <div className="bg-white border border-[#D7E8EA] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-[#D7E8EA] pb-3">
                  <h3 className="font-bold text-[#1E293B] text-sm">Patient Clinical file: {viewedPatientDetails.patientName}</h3>
                  <button onClick={() => setIsInspectionOpen(false)} className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-[#F8FBFB] p-4 rounded-xl border border-[#D7E8EA]">
                  <div>Patient Name: <strong className="text-[#1E293B]">{viewedPatientDetails.patientName}</strong></div>
                  <div>UHID: <code className="text-[#147C8A] font-mono">{viewedPatientDetails.uhid}</code></div>
                  <div>Gender/Age: <span className="text-[#1E293B]">{viewedPatientDetails.gender} / {calculateAge(viewedPatientDetails.dateOfBirth)}</span></div>
                  <div>Mobile Number: <span className="text-[#1E293B] font-mono">{viewedPatientDetails.mobile}</span></div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Past Outpatient Consultations</h4>
                  {inspectedVisitHistory.length === 0 ? (
                    <div className="text-center py-6 text-[#64748B] text-xs">No historical OP visits recorded.</div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {inspectedVisitHistory.map(v => (
                        <div key={v.id} className="p-3 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[#147C8A] font-bold">{v.visitDate}</span>
                            <span className="bg-white text-[#64748B] px-2 py-0.5 rounded text-[8px] font-bold uppercase">{v.visitType}</span>
                          </div>
                          <div>Doctor: <strong className="text-[#1E293B]">{v.assignedDoctor?.name} ({v.department?.deptName})</strong></div>
                          <div>Token: <span className="text-[#1E293B]">#{v.tokenNumber}</span></div>
                          {v.chiefComplaint && <div className="text-[#64748B] leading-normal border-t border-[#D7E8EA]/60 pt-1 mt-1 text-[10px]">{v.chiefComplaint}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsInspectionOpen(false)}
                    className="px-4 py-2 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#64748B] rounded-xl text-xs font-bold"
                  >
                    Close Log
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW D: REPRINT FEE RECEIPT / PRESCRIPTION */}
      {subTab === 'reprint' && (
        <div className="space-y-6 no-print">
          
          {/* Filters card */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-semibold text-[#64748B] uppercase">From Date</label>
              <input 
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-semibold text-[#64748B] uppercase">To Date</label>
              <input 
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={loadReprintLogs}
                disabled={isFetchingReprint}
                className="px-6 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-xl text-xs"
              >
                {isFetchingReprint ? 'Loading...' : 'Get Data'}
              </button>
            </div>
          </div>

          {/* Results table */}
          <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2">
              Consultation visit registries log list
            </h3>

            {isFetchingReprint ? (
              <div className="text-center py-12 text-[#64748B] text-xs">Scanning logs...</div>
            ) : reprintList.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] text-xs">No outpatient consultation visits recorded in this range.</div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-[10.5px] text-[#1E293B] min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B]">
                      <th className="py-2 px-1">S.No.</th>
                      <th className="py-2 px-1 text-center">Actions</th>
                      <th className="py-2 px-1">UHID</th>
                      <th className="py-2 px-1">Token No</th>
                      <th className="py-2 px-1">OP ID</th>
                      <th className="py-2 px-1">Date</th>
                      <th className="py-2 px-1">Patient Name</th>
                      <th className="py-2 px-1">Father/Husband Name</th>
                      <th className="py-2 px-1">Sex/Age</th>
                      <th className="py-2 px-1">Visit Type</th>
                      <th className="py-2 px-1">Address</th>
                      <th className="py-2 px-1">Contact No.</th>
                      <th className="py-2 px-1 text-right">Fees (₹)</th>
                      <th className="py-2 px-1">Consulting Dr.</th>
                      <th className="py-2 px-1">Transaction Date/Time</th>
                      <th className="py-2 px-1">Transaction By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {reprintList.map((reg, index) => (
                      <tr key={reg.id} className="hover:bg-[#EAF7F8]/20">
                        <td className="py-2.5 px-1 font-bold text-[#64748B]">{index + 1}</td>
                        <td className="py-2.5 px-1 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button 
                              type="button"
                              onClick={() => { setActiveReceiptPrint(reg); triggerPrint(); }}
                              title="Print Fee Receipt Invoice"
                              className="p-1 bg-[#147C8A]/10 hover:bg-[#D0EFF2] text-[#147C8A] rounded-lg"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handlePrintPrescription(reg.id)}
                              title="Print Blank Prescription Sheet"
                              className="p-1 bg-[#147C8A]/10 hover:bg-[#147C8A]/20 text-[#147C8A] rounded-lg"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleOpenModifyModal(reg)}
                              title="Modify OP Details"
                              className="p-1 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-amber-700 border border-amber-500/20 rounded-lg"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-1 font-mono font-bold text-[#147C8A]">{reg.uhid}</td>
                        <td className="py-2.5 px-1 font-bold text-[#1E293B]">#{reg.tokenNumber}</td>
                        <td className="py-2.5 px-1 font-mono">OP-{reg.id}</td>
                        <td className="py-2.5 px-1">{reg.visitDate}</td>
                        <td className="py-2.5 px-1 font-bold text-[#1E293B]">{reg.patient?.patientName}</td>
                        <td className="py-2.5 px-1 text-[#64748B]">{reg.patient?.relationName || 'N/A'}</td>
                        <td className="py-2.5 px-1">{reg.patient?.gender} / {calculateAge(reg.patient?.dateOfBirth)}</td>
                        <td className="py-2.5 px-1 font-bold uppercase">{reg.visitType}</td>
                        <td className="py-2.5 px-1 text-[#64748B] max-w-[100px] truncate">{reg.patient?.addressLine1 || 'N/A'}</td>
                        <td className="py-2.5 px-1 font-mono">{reg.patient?.mobile}</td>
                        <td className="py-2.5 px-1 text-right font-bold text-emerald-700">₹{reg.assignedDoctor?.consultingFee.toFixed(2)}</td>
                        <td className="py-2.5 px-1 font-medium">{reg.assignedDoctor?.name}</td>
                        <td className="py-2.5 px-1 font-mono">{reg.visitDate} {reg.visitTime}</td>
                        <td className="py-2.5 px-1 text-[#64748B]">{currentUser?.fullName || 'Admin'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Summary Strip */}
            <div className="bg-[#EAF7F8] border border-[#D7E8EA] p-4 rounded-xl flex justify-between items-center text-xs">
              <span className="text-[#64748B]">Total Consultation Patients: <strong className="text-[#1E293B]">{totalPatientsCount}</strong></span>
              <span className="text-[#64748B]">Total Consultation Amount: <strong className="text-emerald-700 text-sm">₹{totalFeesCollected.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {subTab === 'prepare-particular' && (
        <div className="no-print">
          <OPCSView initialSubTab="diagnostics" />
        </div>
      )}

      {subTab === 'payment-entry' && (
        <div className="no-print">
          <OPCSView initialSubTab="ot" />
        </div>
      )}

      {subTab === 'memo-modify' && (
        <div className="no-print">
          <OPCSView initialSubTab="reports" />
        </div>
      )}

      {subTab === 'op-daybook' && (
        <div className="no-print">
          <BillingDeskView initialSubTab="daybook" role={currentUser?.role} />
        </div>
      )}

      {subTab === 'dpsr-entry' && (
        <div className="no-print">
          <BillingDeskView initialSubTab="dpsr" role={currentUser?.role} />
        </div>
      )}

      {/* 3. PRINTABLE SHEET 1: OUTPATIENT BILL INVOICE RECEIPT */}
      {activeReceiptPrint && (
        <>
          {/* Custom Print Style Block for Receipt */}
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
              #print-area, #print-area * {
                visibility: visible !important;
              }
              #print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                background: white !important;
                color: black !important;
                display: block !important;
              }
            }
          `}</style>
          <div id="print-area" className="hidden" style={{ width: '100%', boxSizing: 'border-box' }}>
          {/* Header Letterhead Grid */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid black', paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
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
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0', fontFamily: 'serif', letterSpacing: '0.5px', color: 'black' }}>{(localStorage.getItem('hms_hospital_name') || 'HMS CLINIC').toUpperCase()}</h1>
                <p style={{ margin: '1px 0', fontSize: '10.5px', fontFamily: 'sans-serif', color: '#333' }}>Saraswati Nagar, Road No. 2</p>
                <p style={{ margin: '1px 0', fontSize: '10.5px', fontFamily: 'sans-serif', color: '#333' }}>Opp. Dist. Co-operative Bank, Nizamabad</p>
                <p style={{ margin: '1px 0', fontSize: '10.5px', fontFamily: 'sans-serif', color: '#000', fontWeight: 'bold' }}>Contact No: 08462-252322, 220322, 9515511633</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10px', fontFamily: 'sans-serif', lineHeight: '1.4' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 2px 0', textDecoration: 'underline' }}>ANNEXURE-I</p>
              <p style={{ margin: '0' }}>Page No: 1 / 1</p>
            </div>
          </div>

          {/* Title & Green Separator */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <div style={{ height: '6px', backgroundColor: '#10B981', margin: '4px 0 10px 0', borderRadius: '3px' }}></div>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', textDecoration: 'underline', fontFamily: 'serif', letterSpacing: '1px', margin: '0' }}>
              OPD CONSULTATION FEE RECEIPT SLIP
            </h2>
          </div>

          {/* Patient Detail Box (Image Grid Pattern) */}
          <div style={{ border: '1.5px solid black', padding: '10px', fontSize: '11px', fontFamily: 'sans-serif', marginBottom: '15px', lineHeight: '1.8' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ width: '38%', fontWeight: 'bold' }}>UHID : <span style={{ fontWeight: 'normal', fontFamily: 'monospace' }}>{activeReceiptPrint.uhid}</span></td>
                  <td style={{ width: '31%', fontWeight: 'bold' }}>OP ID : <span style={{ fontWeight: 'normal' }}>OP-{activeReceiptPrint.id}</span></td>
                  <td style={{ width: '31%', fontWeight: 'bold' }}>Date/Time : <span style={{ fontWeight: 'normal' }}>{activeReceiptPrint.visitDate} {activeReceiptPrint.visitTime}</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ fontWeight: 'bold' }}>Patient Name : <span style={{ fontWeight: 'normal' }}>{activeReceiptPrint.patient?.patientName}</span></td>
                  <td></td>
                  <td style={{ fontWeight: 'bold' }}>Age : <span style={{ fontWeight: 'normal' }}>{calculateAge(activeReceiptPrint.patient?.dateOfBirth)}</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ fontWeight: 'bold' }}>Father/Husband Name : <span style={{ fontWeight: 'normal' }}>{activeReceiptPrint.patient?.relationName || 'N/A'}</span></td>
                  <td></td>
                  <td style={{ fontWeight: 'bold' }}>Sex : <span style={{ fontWeight: 'normal' }}>{activeReceiptPrint.patient?.gender === 'M' ? 'Male' : activeReceiptPrint.patient?.gender === 'F' ? 'Female' : 'Other'}</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Address : <span style={{ fontWeight: 'normal' }}>{activeReceiptPrint.patient?.addressLine1 || 'N/A'}</span></td>
                  <td></td>
                  <td style={{ fontWeight: 'bold' }}>Contact No : <span style={{ fontWeight: 'normal' }}>{activeReceiptPrint.patient?.mobile}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Items Grid Table with Vertical Column Lines */}
          <table style={{ width: '100%', border: '1.5px solid black', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'sans-serif', marginBottom: '15px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid black', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'left' }}>
                <th style={{ borderRight: '1px solid black', padding: '8px', width: '8%', textAlign: 'center' }}>S.No</th>
                <th style={{ borderRight: '1px solid black', padding: '8px', width: '15%' }}>Date</th>
                <th style={{ borderRight: '1px solid black', padding: '8px', width: '45%' }}>Particulars / Item Description</th>
                <th style={{ borderRight: '1px solid black', padding: '8px', width: '10%', textAlign: 'center' }}>Qty</th>
                <th style={{ borderRight: '1px solid black', padding: '8px', width: '10%', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ padding: '8px', width: '12%', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ borderRight: '1px solid black', padding: '8px', textAlign: 'center' }}>1</td>
                <td style={{ borderRight: '1px solid black', padding: '8px' }}>{activeReceiptPrint.visitDate}</td>
                <td style={{ borderRight: '1px solid black', padding: '8px', fontWeight: 'bold' }}>OPD Consulting Doctor Fee: {activeReceiptPrint.assignedDoctor?.name}</td>
                <td style={{ borderRight: '1px solid black', padding: '8px', textAlign: 'center' }}>1</td>
                <td style={{ borderRight: '1px solid black', padding: '8px', textAlign: 'right' }}>₹{activeReceiptPrint.assignedDoctor?.consultingFee.toFixed(2)}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>₹{activeReceiptPrint.assignedDoctor?.consultingFee.toFixed(2)}</td>
              </tr>
              {/* Fill empty spacer rows to match design */}
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={`spacer-${i}`} style={{ height: '30px', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ borderRight: '1px solid black', padding: '8px' }}></td>
                  <td style={{ borderRight: '1px solid black', padding: '8px' }}></td>
                  <td style={{ borderRight: '1px solid black', padding: '8px' }}></td>
                  <td style={{ borderRight: '1px solid black', padding: '8px' }}></td>
                  <td style={{ borderRight: '1px solid black', padding: '8px' }}></td>
                  <td style={{ padding: '8px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div style={{ float: 'right', width: '260px', fontSize: '11px', fontFamily: 'sans-serif', border: '1.5px solid black', padding: '10px', borderRadius: '4px', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
              <span>Total Fees Paid:</span>
              <span>₹{activeReceiptPrint.assignedDoctor?.consultingFee.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: '9px', marginTop: '8px', color: '#555', borderTop: '1px dotted #ccc', paddingTop: '4px', margin: '8px 0 0 0' }}>
              Payment: <strong>{activeReceiptPrint.paymentStatus}</strong> | Visit type: {activeReceiptPrint.visitType}
            </p>
          </div>

          {/* Signature Block */}
          <div style={{ clear: 'both', marginTop: '4.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'sans-serif' }}>
            <div>
              <p style={{ margin: '0' }}>___________________________</p>
              <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>Patient / Attendant Signature</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0' }}>___________________________</p>
              <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>Authorized Billing Clerk</p>
            </div>
          </div>
        </div>
        </>
      )}

      {/* 4. PRINTABLE SHEET 2: BLANK PRESCRIPTION SHEET MODAL & PRINT AREA */}
      {activePrescriptionPrint && (
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
              #prescription-print-area, #prescription-print-area * {
                visibility: visible !important;
              }
              #prescription-print-area {
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
                    OP- Print Blank Prescription Sheet- Page
                  </h3>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Watermark Toggle */}
                  <label className="flex items-center space-x-2 text-xs font-semibold text-[#64748B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prescriptionWatermark}
                      onChange={(e) => setPrescriptionWatermark(e.target.checked)}
                      className="rounded bg-[#F8FBFB] border-[#D7E8EA] text-[#147C8A] focus:ring-sky-500"
                    />
                    <span>Watermark "Rx"</span>
                  </label>
                  
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
                    onClick={() => setActivePrescriptionPrint(null)}
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
                  id="prescription-print-area" 
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
                    {/* Centered Document Header */}
                    <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', fontSize: '11pt', marginBottom: '4px' }}>
                      OUT PATIENT (OP) - PRESCRIPTION
                    </div>

                    {/* Section 1: Consultant Info & Token */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '9pt', lineHeight: '1.2' }}>
                      <div>
                        <strong>Consultant:</strong> {activePrescriptionPrint.consultantName}, {activePrescriptionPrint.qualification}<br/>
                        {activePrescriptionPrint.designation}<br/>
                        Reg.No: {activePrescriptionPrint.registrationNumber}
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '10pt' }}>
                        Token No: {activePrescriptionPrint.tokenNumber}
                      </div>
                    </div>

                    {/* Section 2: Patient Details Grid */}
                    <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse', marginBottom: '6px', fontSize: '8.5pt', lineHeight: '1.3' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '2px 5px', width: '50%' }}>
                            UHID / OP ID: <strong>{activePrescriptionPrint.uhid} / OP-{activePrescriptionPrint.opId}</strong>
                          </td>
                          <td style={{ border: '1px solid black', padding: '2px 5px', width: '50%' }}>
                            Date: {activePrescriptionPrint.date} {activePrescriptionPrint.time}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '2px 5px' }}>
                            Patient Name: <strong>{activePrescriptionPrint.patientName}</strong>
                          </td>
                          <td style={{ border: '1px solid black', padding: '2px 5px' }}>
                            Father/ Husband Name: {activePrescriptionPrint.fatherOrHusbandName}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '2px 5px' }}>
                            Age / Sex: {activePrescriptionPrint.ageYears} / {activePrescriptionPrint.gender}
                          </td>
                          <td style={{ border: '1px solid black', padding: '2px 5px' }}>
                            Contact No: {activePrescriptionPrint.contactNumber}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ border: '1px solid black', padding: '2px 5px' }}>
                            Address: {activePrescriptionPrint.address}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Section 3: Vital Parameters Subheading & Table */}
                    <div style={{ textDecoration: 'underline', fontWeight: 'bold', fontSize: '9pt', marginBottom: '3px' }}>
                      Vital Parameters/ General Examinations :
                    </div>
                    <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse', marginBottom: '6px', fontSize: '8.5pt' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '3px 5px', width: '14.28%' }}>Temp :</td>
                          <td style={{ border: '1px solid black', padding: '3px 5px', width: '14.28%' }}>PR :</td>
                          <td style={{ border: '1px solid black', padding: '3px 5px', width: '14.28%' }}>RR :</td>
                          <td style={{ border: '1px solid black', padding: '3px 5px', width: '14.28%' }}>SPo2 :</td>
                          <td style={{ border: '1px solid black', padding: '3px 5px', width: '14.28%' }}>BP :</td>
                          <td style={{ border: '1px solid black', padding: '3px 5px', width: '14.28%' }}>Wt. :</td>
                          <td style={{ border: '1px solid black', padding: '3px 5px', width: '14.28%' }}>Ht. :</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Section 4: Prescription Body Lined Area */}
                    <div 
                      style={{ 
                        position: 'relative', 
                        border: '1px solid black', 
                        minHeight: '730px', 
                        padding: '12px', 
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    >
                      {prescriptionWatermark && (
                        <div 
                          style={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)', 
                            fontSize: '90pt', 
                            fontWeight: 'bold', 
                            color: 'rgba(220, 220, 220, 0.35)', 
                            fontFamily: 'serif', 
                            pointerEvents: 'none', 
                            userSelect: 'none'
                          }}
                        >
                          Rx
                        </div>
                      )}
                      <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'serif' }}>Rx</span>
                    </div>
                  </div>

                  {/* Section 5: Configurable Hospital Footer */}
                  <div style={{ borderTop: '1px solid black', paddingTop: '8px', marginTop: '10px', fontSize: '9pt', textAlign: 'center', color: '#333' }}>
                    <strong>{localStorage.getItem('hms_hospital_name') || 'HMS HOSPITAL'}</strong><br/>
                    {localStorage.getItem('hms_hospital_address') || 'Saraswati Nagar, Road No. 2, Opp. Dist. Co-operative Bank, Nizamabad'} &nbsp;|&nbsp; Contact No: {localStorage.getItem('hms_hospital_phone') || '08462-252322, 220322, 9515511633'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODIFY OP DETAILS MODAL */}
      {/* ------------------------------------------------------------- */}
      {isModifyModalOpen && (
        <div className="fixed inset-0 bg-[#EAF7F8] backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-200">
          <div className="bg-white border border-[#D7E8EA] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col space-y-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D7E8EA]">
              <div className="flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">Modify Out Patient (OP) Details</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModifyModalOpen(false)}
                className="p-1.5 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#64748B] hover:text-[#1E293B] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModify} className="space-y-6 text-xs text-[#1E293B]">
              {/* Section A: Patient Demographics */}
              <div className="space-y-4">
                <h4 className="font-bold text-[#147C8A] uppercase tracking-widest text-[10px] border-l-2 border-[#147C8A] pl-2">Patient Demographics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Patient Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={modifyForm.patientName} 
                      onChange={e => setModifyForm({ ...modifyForm, patientName: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Father/Husband Name</label>
                    <input 
                      type="text" 
                      value={modifyForm.relationName} 
                      onChange={e => setModifyForm({ ...modifyForm, relationName: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Gender *</label>
                    <select 
                      value={modifyForm.gender} 
                      onChange={e => setModifyForm({ ...modifyForm, gender: e.target.value })}
                      className="w-full border rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA]"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="M">Male</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="F">Female</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="O">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Blood Group</label>
                    <select 
                      value={modifyForm.bloodGroup} 
                      onChange={e => setModifyForm({ ...modifyForm, bloodGroup: e.target.value })}
                      className="w-full border rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA]"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="A+">A+</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="A-">A-</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="B+">B+</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="B-">B-</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="AB+">AB+</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="AB-">AB-</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="O+">O+</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="O-">O-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Contact/Mobile No. *</label>
                    <input 
                      type="text" 
                      required 
                      value={modifyForm.mobile} 
                      onChange={e => setModifyForm({ ...modifyForm, mobile: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Date of Birth</label>
                    <input 
                      type="date" 
                      value={modifyForm.dateOfBirth} 
                      onChange={e => setModifyForm({ ...modifyForm, dateOfBirth: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[#64748B]">Address Line 1</label>
                    <input 
                      type="text" 
                      value={modifyForm.addressLine1} 
                      onChange={e => setModifyForm({ ...modifyForm, addressLine1: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section B: Visit & Consultation Details */}
              <div className="space-y-4">
                <h4 className="font-bold text-amber-700 uppercase tracking-widest text-[10px] border-l-2 border-amber-500 pl-2">Visit & Consultation Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Consulting Doctor *</label>
                    <select 
                      required 
                      value={modifyForm.doctorId} 
                      onChange={e => {
                        const docId = Number(e.target.value);
                        const selectedDoc = doctors.find(d => d.id === docId);
                        setModifyForm({ 
                          ...modifyForm, 
                          doctorId: docId,
                          consultingFee: selectedDoc ? selectedDoc.consultingFee : modifyForm.consultingFee 
                        });
                      }}
                      className="w-full border rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA]"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Doctor</option>
                      {doctors.map(doc => (
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Consulting Fee (₹)</label>
                    <input 
                      type="number" 
                      value={modifyForm.consultingFee} 
                      onChange={e => setModifyForm({ ...modifyForm, consultingFee: Number(e.target.value) })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Visit Type</label>
                    <select 
                      value={modifyForm.visitType} 
                      onChange={e => setModifyForm({ ...modifyForm, visitType: e.target.value })}
                      className="w-full border rounded-xl px-3 py-1.5 focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="New">New Visit</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="FollowUp">Follow Up / Review</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Payment Status</label>
                    <select 
                      value={modifyForm.paymentStatus} 
                      onChange={e => setModifyForm({ ...modifyForm, paymentStatus: e.target.value })}
                      className="w-full border rounded-xl px-3 py-1.5 focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Paid">Paid</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Payment Mode</label>
                    <select 
                      value={modifyForm.paymentMode} 
                      onChange={e => setModifyForm({ ...modifyForm, paymentMode: e.target.value })}
                      className="w-full border rounded-xl px-3 py-1.5 focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Cash">Cash</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="UPI">UPI / Card</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Free">Free / Complimentary</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Referring Doctor</label>
                    <input 
                      type="text" 
                      value={modifyForm.referringDoctor} 
                      onChange={e => setModifyForm({ ...modifyForm, referringDoctor: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Patient Category</label>
                    <select 
                      value={modifyForm.patientCategory} 
                      onChange={e => setModifyForm({ ...modifyForm, patientCategory: e.target.value })}
                      className="w-full border rounded-xl px-3 py-1.5 focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="General">General</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="VIP">VIP</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Staff">Staff</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="TPA">TPA Corporate</option>
                    </select>
                  </div>
                  <div className="space-y-1 flex gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-[#64748B]">Age Value</label>
                      <input 
                        type="number" 
                        placeholder="Age" 
                        value={modifyForm.ageValue} 
                        onChange={e => setModifyForm({ ...modifyForm, ageValue: e.target.value })}
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[#64748B]">Unit</label>
                      <select 
                        value={modifyForm.ageUnit} 
                        onChange={e => setModifyForm({ ...modifyForm, ageUnit: e.target.value })}
                        className="w-full border rounded-xl px-3 py-1.5 focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                      >
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Yrs">Yrs</option>
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Mths">Mths</option>
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Days">Days</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Chief Complaint</label>
                    <input 
                      type="text" 
                      placeholder="Symptoms or reason for visit" 
                      value={modifyForm.chiefComplaint} 
                      onChange={e => setModifyForm({ ...modifyForm, chiefComplaint: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section C: Vitals */}
              <div className="space-y-4">
                <h4 className="font-bold text-emerald-700 uppercase tracking-widest text-[10px] border-l-2 border-emerald-500 pl-2">Patient Vitals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Temperature (°F)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 98.4" 
                      value={modifyForm.tempF} 
                      onChange={e => setModifyForm({ ...modifyForm, tempF: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Pulse Rate (PR)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 72" 
                      value={modifyForm.pulseRate} 
                      onChange={e => setModifyForm({ ...modifyForm, pulseRate: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Respiratory Rate (RR)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 18" 
                      value={modifyForm.respiratoryRate} 
                      onChange={e => setModifyForm({ ...modifyForm, respiratoryRate: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Oxygen Saturation (SPo2 %)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 98" 
                      value={modifyForm.spo2} 
                      onChange={e => setModifyForm({ ...modifyForm, spo2: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Blood Pressure (BP)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 120/80" 
                      value={modifyForm.bloodPressure} 
                      onChange={e => setModifyForm({ ...modifyForm, bloodPressure: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Weight (kg)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 65" 
                      value={modifyForm.weight} 
                      onChange={e => setModifyForm({ ...modifyForm, weight: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Height (cm)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 170" 
                      value={modifyForm.height} 
                      onChange={e => setModifyForm({ ...modifyForm, height: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#64748B]">Remarks</label>
                    <input 
                      type="text" 
                      placeholder="General notes" 
                      value={modifyForm.remarks} 
                      onChange={e => setModifyForm({ ...modifyForm, remarks: e.target.value })}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] text-[#1E293B] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#D7E8EA]">
                <button 
                  type="button" 
                  onClick={() => setIsModifyModalOpen(false)}
                  disabled={isSubmittingModify}
                  className="px-5 py-2 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#1E293B] hover:text-[#1E293B] font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingModify}
                  className="px-6 py-2 bg-[#F59E0B] hover:bg-[#F59E0B] disabled:bg-amber-600/40 text-[#1E293B] font-bold rounded-xl transition-colors animate-pulse"
                >
                  {isSubmittingModify ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
