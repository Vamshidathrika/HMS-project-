import { useState, useEffect } from 'react';
import { getHeaders } from './utils/hmsUtils';
// import { supabase } from './services/supabaseClient';
import { 
  Activity, 
  Database, 
  Search,
  AlertCircle, 
  User,
  Phone,
  Layers,
  Stethoscope,
  ChevronRight,
  ChevronDown,
  Bed,
  ClipboardList,
  DollarSign,
  Building2,
  TrendingUp,
  MessageSquare,
  Workflow,
  Settings,
  LogOut,
  KeyRound
} from 'lucide-react';
import FrontDeskView from './components/FrontDeskView';
import DoctorDeskView from './components/DoctorDeskView';
import InpatientDeskView from './components/InpatientDeskView';
import OPCSView from './components/OPCSView';
import BillingDeskView from './components/BillingDeskView';
import SettingsDeskView from './components/SettingsDeskView';
import MastersDeskView from './components/MastersDeskView';
import ReportsConsoleView from './components/ReportsConsoleView';
import CRMSDeskView from './components/CRMSDeskView';
import WhatsAppConsoleView from './components/WhatsAppConsoleView';
import AutomationBuilderView from './components/AutomationBuilderView';
import PharmacyDeskView from './components/PharmacyDeskView';
import LaboratoryView from './components/LaboratoryView';
import RadiologyView from './components/RadiologyView';
import InventoryView from './components/InventoryView';
import HRStaffView from './components/HRStaffView';

interface Patient {
  id?: number;
  uhid: string;
  patientName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  mobile: string;
  relationName: string;
  addressLine1: string;
  abhaId?: string;
  abhaAddress?: string;
  registrationDate?: string;
}

const themeColorMap = {
  sky: {
    primary: 'from-sky-500 to-indigo-500',
    primaryText: 'text-[#147C8A]',
    primaryBg: 'bg-[#147C8A]',
    primaryBorder: 'border-[#147C8A]',
    primaryShadow: 'shadow-sky-500/25',
    buttonActive: 'bg-[#147C8A] text-white',
    buttonHover: 'hover:from-sky-400 hover:to-indigo-400',
    cardBorder: 'border-[#147C8A]/20',
    alertBg: 'bg-[#EAF7F8]/40 text-[#147C8A] border-[#D7E8EA]'
  },
  emerald: {
    primary: 'from-emerald-500 to-teal-500',
    primaryText: 'text-emerald-700',
    primaryBg: 'bg-[#22C55E]',
    primaryBorder: 'border-emerald-500',
    primaryShadow: 'shadow-emerald-500/25',
    buttonActive: 'bg-[#22C55E] text-[#1E293B]',
    buttonHover: 'hover:from-emerald-400 hover:to-teal-400',
    cardBorder: 'border-emerald-500/20',
    alertBg: 'bg-green-50 text-green-700 border-green-200'
  },
  indigo: {
    primary: 'from-indigo-500 to-purple-500',
    primaryText: 'text-[#147C8A]',
    primaryBg: 'bg-[#147C8A]',
    primaryBorder: 'border-[#147C8A]',
    primaryShadow: 'shadow-indigo-500/25',
    buttonActive: 'bg-[#147C8A] text-white',
    buttonHover: 'hover:from-indigo-400 hover:to-purple-400',
    cardBorder: 'border-[#147C8A]/20',
    alertBg: 'bg-[#EAF7F8]/40 text-indigo-300 border-indigo-800'
  },
  amber: {
    primary: 'from-amber-500 to-orange-500',
    primaryText: 'text-amber-400',
    primaryBg: 'bg-[#F59E0B]',
    primaryBorder: 'border-amber-500',
    primaryShadow: 'shadow-amber-500/25',
    buttonActive: 'bg-[#F59E0B] text-[#1E293B]',
    buttonHover: 'hover:from-amber-400 hover:to-orange-400',
    cardBorder: 'border-amber-500/20',
    alertBg: 'bg-amber-100/40 text-amber-600 border-amber-800'
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'directory' | 'frontdesk' | 'doctor' | 'inpatient' | 'opcs' | 'billing' | 'settings' | 'masters' | 'reports' | 'crms' | 'whatsapp' | 'automations' | 'pharmacy' | 'laboratory' | 'radiology' | 'inventory' | 'hrstaff'>('directory');
  const [frontdeskSubTab, setFrontdeskSubTab] = useState<'new-patient' | 'follow-up' | 'search' | 'reprint' | 'prepare-particular' | 'payment-entry' | 'memo-modify' | 'op-daybook' | 'dpsr-entry'>('new-patient');
  const [opcsSubTab, setOpcsSubTab] = useState<'ot' | 'diagnostics' | 'reports'>('ot');
  const [billingSubTab, _setBillingSubTab] = useState<'billing' | 'daybook' | 'collection' | 'dpsr' | 'tpa' | 'history'>('billing');
  const [selectedOPDPatient, setSelectedOPDPatient] = useState<Patient | null>(null);
  const [inpatientSubTab, setInpatientSubTab] = useState<
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
  >('bedmonitor');

  const [crmsSubTab, setCrmsSubTab] = useState<
    | 'op-upcoming'
    | 'op-edd'
    | 'op-edd-scan'
    | 'ip-upcoming'
    | 'op-followup-entry'
    | 'op-appointments-report'
    | 'feedback'
    | 'campaigns'
  >('op-upcoming');
  const [isCrmsDropdownOpen, setIsCrmsDropdownOpen] = useState(false);
  const [isFrontdeskDropdownOpen, setIsFrontdeskDropdownOpen] = useState(false);
  const [isInpatientDropdownOpen, setIsInpatientDropdownOpen] = useState(false);
  const [reportsSubTab, setReportsSubTab] = useState<string>('op-consulting-dr-wise');
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);

  // HSS Config & Theme mapping states
  const [hssConfig, setHssConfig] = useState({
    hospitalName: localStorage.getItem('hms_hospital_name') || 'ASHIRWAD',
    hospitalTagline: localStorage.getItem('hms_tagline') || 'Hospital Companion',
    themeColor: localStorage.getItem('hms_theme_color') || 'sky',
    ponytailEnabled: localStorage.getItem('hms_ponytail_enabled') === 'true',
    headroomEnabled: localStorage.getItem('hms_headroom_enabled') === 'true'
  });

  const theme = themeColorMap[hssConfig.themeColor as keyof typeof themeColorMap] || themeColorMap.sky;

  const [liveTime, setLiveTime] = useState(new Date());
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleConfigChange = () => {
      setHssConfig({
        hospitalName: localStorage.getItem('hms_hospital_name') || 'ASHIRWAD',
        hospitalTagline: localStorage.getItem('hms_tagline') || 'Hospital Companion',
        themeColor: localStorage.getItem('hms_theme_color') || 'sky',
        ponytailEnabled: localStorage.getItem('hms_ponytail_enabled') === 'true',
        headroomEnabled: localStorage.getItem('hms_headroom_enabled') === 'true'
      });
    };

    window.addEventListener('hms_config_changed', handleConfigChange);
    
    const timer = setInterval(() => setLiveTime(new Date()), 1000);

    return () => {
      window.removeEventListener('hms_config_changed', handleConfigChange);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!hssConfig.headroomEnabled) {
      setShowHeader(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hssConfig.headroomEnabled]);


  // Authentication states — Spring Boot JWT session restored from localStorage
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; fullName: string } | null>(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const fullName = localStorage.getItem('fullName');
    if (token && username && role && fullName) {
      return { username, role, fullName };
    }
    return null;
  });
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const sessionChecked = true; // always ready — session is from localStorage

  // DB Connectivity states
  const [dbStatus, setDbStatus] = useState<'checking' | 'up' | 'down'>('checking');
  const [patientCount, setPatientCount] = useState<number>(0);
  const [upcomingCount, setUpcomingCount] = useState<number>(0);
  const [occupiedBeds, setOccupiedBeds] = useState<number>(0);
  const [totalBeds, setTotalBeds] = useState<number>(0);
  const [averageWait, setAverageWait] = useState<number>(0);
  const [dbError, setDbError] = useState<string | null>(null);

  // Search states (Patient Directory)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Registration Form states (Patient Directory)
  const [formData, setFormData] = useState({
    patientName: '',
    dateOfBirth: '',
    gender: 'M',
    bloodGroup: 'O+',
    mobile: '',
    relationName: '',
    addressLine1: '',
    abhaId: '',
    abhaAddress: ''
  });

  // Widget preference & Live Logs states
  const [recentAuditLogs, setRecentAuditLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('visible_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      patientStats: true,
      shortcutDeck: true,
      emergencyContacts: true,
      securityLogs: true,
      departmentStats: true,
      billingSummary: true
    };
  });

  const toggleWidget = (widgetName: string) => {
    setVisibleWidgets(prev => {
      const updated = { ...prev, [widgetName]: !prev[widgetName] };
      localStorage.setItem('visible_widgets', JSON.stringify(updated));
      return updated;
    });
  };

  const fetchAuditLogs = async () => {
    setIsLogsLoading(true);
    try {
      const res = await fetch('/api/v1/audit-logs', {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        // Map backend AuditLog fields (action -> actionType, details -> description)
        const mappedLogs = (data || []).slice(0, 5).map((log: any) => ({
          id: log.id,
          actionType: log.action,
          timestamp: log.timestamp,
          description: log.details
        }));
        setRecentAuditLogs(mappedLogs);
      } else {
        setRecentAuditLogs([]);
      }
    } catch (err) {
      console.warn('Could not fetch audit logs from backend:', err);
      setRecentAuditLogs([]);
    } finally {
      setIsLogsLoading(false);
    }
  };

  // ABHA ID Lookup verification states
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);
  const [abhaNumber, setAbhaNumber] = useState('');
  const [abhaOtp, setAbhaOtp] = useState('');
  const [abhaTxnId, setAbhaTxnId] = useState('');
  const [abhaStep, setAbhaStep] = useState<'id' | 'otp'>('id');
  const [abhaError, setAbhaError] = useState<string | null>(null);
  const [abhaLoading, setAbhaLoading] = useState(false);

  const handleSendAbhaOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAbhaLoading(true);
    setAbhaError(null);
    try {
      const res = await fetch('/api/v1/abha/send-otp', {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({ abhaNumber, mobile: formData.mobile })
      });
      if (res.ok) {
        const data = await res.json();
        setAbhaTxnId(data.txnId);
        setAbhaStep('otp');
      } else {
        const data = await res.json();
        setAbhaError(data.error || 'Failed to send OTP. Try again.');
      }
    } catch (err: any) {
      setAbhaError(err.message || 'Connection error.');
    } finally {
      setAbhaLoading(false);
    }
  };

  const handleVerifyAbhaOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAbhaLoading(true);
    setAbhaError(null);
    try {
      const res = await fetch('/api/v1/abha/verify-otp', {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify({ txnId: abhaTxnId, otp: abhaOtp })
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          ...formData,
          patientName: data.patientName || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || 'M',
          mobile: data.mobile || '',
          relationName: data.relationName || '',
          addressLine1: data.addressLine1 || '',
          abhaId: data.abhaId || '',
          abhaAddress: data.abhaAddress || ''
        });
        setIsAbhaModalOpen(false);
      } else {
        const data = await res.json();
        setAbhaError(data.error || 'OTP verification failed. Use default: 123456.');
      }
    } catch (err: any) {
      setAbhaError(err.message || 'Connection error.');
    } finally {
      setAbhaLoading(false);
    }
  };



  // Fetch DB Status on load — uses local backend API
  const checkDbStatus = async () => {
    setDbStatus('checking');
    try {
      // 1. Patient count
      const testDbRes = await fetch('/api/v1/patients/test-db', {
        headers: getHeaders()
      });
      if (!testDbRes.ok) throw new Error('Backend test-db response not OK');
      const testDbData = await testDbRes.json();
      setDbStatus('up');
      setPatientCount(testDbData.patientCount || 0);
      setDbError(null);

      // 2. Beds occupancy status
      try {
        const bedsRes = await fetch('/api/v1/ip/beds', {
          headers: getHeaders()
        });
        if (bedsRes.ok) {
          const bedsData = await bedsRes.json();
          setTotalBeds(bedsData.length);
          const occupied = bedsData.filter((b: any) => b.status === 'Occupied' || b.status === 'occupied').length;
          setOccupiedBeds(occupied);
        }
      } catch (e) {
        console.warn('Error fetching beds status:', e);
      }

      // 3. Upcoming consultations today
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const opRes = await fetch('/api/v1/op/registrations', {
          headers: getHeaders()
        });
        if (opRes.ok) {
          const opData = await opRes.json();
          const todayOps = opData.filter((op: any) => op.visitDate === todayStr);
          setUpcomingCount(todayOps.length);

          // 4. Waiting time calculation
          const waitingOps = todayOps.filter((op: any) => op.status === 'Waiting');
          setAverageWait(waitingOps.length ? waitingOps.length * 10 : 0);
        }
      } catch (e) {
        console.warn('Error fetching OP registrations status:', e);
      }
    } catch (err: any) {
      setDbStatus('down');
      setDbError(err.message || 'Could not connect to local database');
    }
  };

  useEffect(() => {
    if (sessionChecked) {
      checkDbStatus();
      if (activeTab === 'directory' && currentUser) {
        fetchAuditLogs();
      }
    }
  }, [currentUser, activeTab, sessionChecked]);

  // Search Patients — queries local backend API
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/v1/patients/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Search request failed');
      const data = await res.json();
      setSearchResults(
        (data || []).map((p: any) => ({
          id: p.id,
          uhid: p.uhid,
          patientName: p.patientName,
          dateOfBirth: p.dateOfBirth,
          gender: p.gender,
          bloodGroup: p.bloodGroup || '',
          mobile: p.mobile,
          relationName: p.relationName || '',
          addressLine1: p.addressLine1 || ''
        }))
      );
    } catch (err) {
      console.error('Error searching patients:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle User Login — Spring Boot JWT auth against real Supabase-backed DB
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginCredentials)
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        localStorage.setItem('fullName', data.fullName);
        setCurrentUser({ username: data.username, role: data.role, fullName: data.fullName });
        setLoginCredentials({ username: '', password: '' });

        // Auto-navigate to first accessible tab based on role
        const role = data.role;
        const allowed = ['directory', 'frontdesk', 'doctor', 'inpatient', 'opcs', 'billing', 'settings', 'masters', 'reports', 'crms']
          .filter(tab => hasTabAccess(tab, role));
        if (allowed.length > 0) setActiveTab(allowed[0] as any);
      } else {
        const err = await res.json().catch(() => ({ error: 'Login failed' }));
        setLoginError(err.error || 'Invalid username or password');
      }
    } catch (err: any) {
      setLoginError('Could not connect to server. Is the backend running?');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    setCurrentUser(null);
    setActiveTab('directory');
  };

  const handleQuickLogin = async (username: string, pass: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        localStorage.setItem('fullName', data.fullName);
        setCurrentUser({ username: data.username, role: data.role, fullName: data.fullName });
        setLoginCredentials({ username: '', password: '' });

        const role = data.role;
        const allowed = ['directory', 'frontdesk', 'doctor', 'inpatient', 'opcs', 'billing', 'settings', 'masters', 'reports', 'crms']
          .filter(tab => hasTabAccess(tab, role));
        if (allowed.length > 0) setActiveTab(allowed[0] as any);
      } else {
        const err = await res.json().catch(() => ({ error: 'Login failed' }));
        setLoginError(err.error || 'Invalid username or password');
      }
    } catch (err: any) {
      setLoginError('Could not connect to server. Is the backend running?');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Helper check tab access based on roles
  function hasTabAccess(tabName: string, roleOverride?: string) {
    const role = roleOverride || currentUser?.role;
    if (!role) return false;
    if (role === 'SuperAdmin' || role === 'HospitalAdmin') return true;
    
    switch (tabName) {
      case 'directory':
        return ['FrontDesk', 'Receptionist', 'Accountant'].includes(role);
      case 'frontdesk':
        return ['FrontDesk', 'Receptionist'].includes(role);
      case 'doctor':
        return ['Doctor'].includes(role);
      case 'inpatient':
        return ['Doctor', 'Nurse', 'FrontDesk', 'Receptionist'].includes(role);
      case 'opcs':
        return ['Doctor', 'LabTech', 'Radiologist', 'FrontDesk', 'Receptionist'].includes(role);
      case 'billing':
        return ['FrontDesk', 'Receptionist', 'Pharmacist', 'Accountant'].includes(role);
      case 'masters':
        return false;
      case 'reports':
        return ['Accountant'].includes(role);
      case 'crms':
        return ['FrontDesk', 'Receptionist', 'Doctor'].includes(role);
      case 'whatsapp':
        return ['FrontDesk', 'Receptionist', 'Doctor'].includes(role);
      case 'automations':
        return ['FrontDesk', 'Receptionist', 'Doctor'].includes(role);
      case 'settings':
        return ['FrontDesk', 'Receptionist'].includes(role);
      case 'hrstaff':
        return false;
      default:
        return false;
    }
  }
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FBFB] text-[#1E293B] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Background Decorative Gradients */}
        <div className="absolute top-[-15%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#147C8A] opacity-[0.06] blur-[100px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#E8B347] opacity-[0.06] blur-[100px]" />

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-[#D7E8EA] backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-sm relative z-10 animate-fade-in">
          
          {/* Left panel: Info & Quick Select Roles */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6 pr-0 md:pr-4">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#147C8A] to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="font-bold text-xl tracking-wide text-[#1E293B] block">
                    {hssConfig.hospitalName}
                  </span>
                  <span className="text-[10px] block text-[#147C8A] tracking-widest font-semibold uppercase">{hssConfig.hospitalTagline}</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#1E293B] mt-2">Clinic Companion Portal</h2>
              <p className="text-xs text-[#64748B] mt-1">One-click instant login for quick development access or use manual authentication.</p>
            </div>

            {/* Role select grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Admin', user: 'admin', pass: 'admin123', desc: 'Super User' },
                { name: 'Doctor', user: 'dr_rajesh', pass: 'doctor123', desc: 'Dr. Rajesh' },
                { name: 'Front Desk', user: 'front_desk', pass: 'front123', desc: 'OPD Desk' },
                { name: 'Nurse', user: 'nurse_jane', pass: 'nurse123', desc: 'Ward Nurse' },
                { name: 'Pharmacist', user: 'pharmacist', pass: 'pharmacy123', desc: 'Pharmacy' },
                { name: 'Accountant', user: 'accountant_bill', pass: 'bill123', desc: 'Accounts' },
              ].map((profile) => (
                <button
                  key={profile.name}
                  type="button"
                  onClick={() => handleQuickLogin(profile.user, profile.pass)}
                  disabled={isLoggingIn}
                  className="p-3 bg-white hover:bg-[#EAF7F8] border border-[#D7E8EA] text-left rounded-xl transition-all duration-200 group flex flex-col justify-between h-[84px] hover:border-[#147C8A] active:scale-95"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xs font-semibold text-[#1E293B] group-hover:text-[#147C8A] transition-colors">
                      {profile.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EAF7F8] text-[#147C8A] font-bold">
                      {profile.user}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate w-full mt-1">
                    {profile.desc}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-[11px] text-[#64748B] border-t border-[#D7E8EA] pt-4">
              <span>🔐 Connected to Local Database. Powered by Spring Boot JWT security.</span>
            </div>
          </div>

          {/* Right panel: Login credentials form */}
          <form onSubmit={handleLogin} className="md:col-span-5 flex flex-col justify-center space-y-5 border-t md:border-t-0 md:border-l border-[#D7E8EA] pt-6 md:pt-0 md:pl-8">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1E293B] flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-[#147C8A]" />
                <span>Account Login</span>
              </h3>
              <p className="text-xs text-[#64748B]">Sign in to your HMS account session.</p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs animate-shake font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  required
                  value={loginCredentials.username}
                  onChange={e => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
                  placeholder="Enter username"
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={loginCredentials.password}
                  onChange={e => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#147C8A] hover:bg-[#0F6672] text-white rounded-xl font-semibold shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98]"
            >
              <span>{isLoggingIn ? 'Verifying...' : 'Sign In'}</span>
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8FBFB] text-[#1E293B] flex font-sans overflow-hidden">
      
      {/* Left Sidebar — Brand Teal */}
      <aside className="w-[240px] h-screen bg-[#147C8A] text-white flex flex-col justify-between shrink-0 pl-4 py-5 select-none hidden md:flex overflow-y-auto" style={{scrollbarWidth:'none'}}>
        <div className="space-y-8">
          
          {/* Logo Area */}
          <div className="flex items-center space-x-3 pl-3 pr-4">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-sm shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-base tracking-wide block truncate">
                {hssConfig.hospitalName}
              </span>
              <span className="text-[9px] block text-white/70 tracking-widest uppercase font-medium">
                {hssConfig.hospitalTagline}
              </span>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="space-y-6">
            
            {/* Category 1: Clinical */}
            <div>
              <span className="text-[9px] text-white/50 uppercase tracking-widest font-semibold block pl-3 pr-4 mb-1.5">Clinical</span>
              <div className="space-y-0.5">
                {[
                  { key: 'doctor', label: 'Clinic Desk', icon: Stethoscope },
                  { key: 'inpatient', label: 'IP Desk (Wards)', icon: Bed },
                  { key: 'opcs', label: 'Investigation Desk', icon: ClipboardList },
                  { key: 'pharmacy', label: 'Pharmacy', icon: Layers },
                  { key: 'laboratory', label: 'Laboratory', icon: Activity },
                  { key: 'radiology', label: 'Radiology', icon: Activity },
                ].filter(item => hasTabAccess(item.key)).map(item => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-l-2xl transition-all duration-200 ${
                      activeTab === item.key 
                        ? 'active-tab-curve' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Category 2: Operations */}
            <div>
              <span className="text-[9px] text-white/50 uppercase tracking-widest font-semibold block pl-3 pr-4 mb-1.5">Operations</span>
              <div className="space-y-0.5">
                {[
                  { key: 'directory', label: 'Patient Directory', icon: User },
                  { key: 'frontdesk', label: 'OP Desk (Reception)', icon: Layers },
                  { key: 'crms', label: 'Upcoming Patients', icon: ClipboardList },
                  { key: 'whatsapp', label: 'WhatsApp Console', icon: MessageSquare },
                  { key: 'automations', label: 'Automation Flow', icon: Workflow },
                ].filter(item => hasTabAccess(item.key)).map(item => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-l-2xl transition-all duration-200 ${
                      activeTab === item.key 
                        ? 'active-tab-curve' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
 
            {/* Category 3: Admin & Finance */}
            <div>
              <span className="text-[9px] text-white/50 uppercase tracking-widest font-semibold block pl-3 pr-4 mb-1.5">Admin & Finance</span>
              <div className="space-y-0.5">
                {[
                  { key: 'billing', label: 'Billing Desk', icon: DollarSign },
                  { key: 'reports', label: 'Reports Console', icon: TrendingUp },
                  { key: 'masters', label: 'Masters Config', icon: Building2 },
                  { key: 'settings', label: 'System Settings', icon: Settings },
                ].filter(item => hasTabAccess(item.key)).map(item => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-l-2xl transition-all duration-200 ${
                      activeTab === item.key 
                        ? 'active-tab-curve' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
 
          </div>
        </div>
        
        {/* User Card */}
        <div className="pr-4">
          <div className="bg-white/10 border border-white/15 p-3 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#E8B347] flex items-center justify-center text-[#0F6672] font-bold text-xs shrink-0">
                {currentUser.fullName?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold truncate">{currentUser.fullName}</span>
                <span className="text-[10px] text-white/50 truncate uppercase tracking-wide">{currentUser.role}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 bg-white/10 hover:bg-red-500/80 rounded-lg transition-all duration-200 shrink-0"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FBFB]">
        
        {/* Top Header Panel */}
        <header className="bg-white border-b border-[#D7E8EA] py-3 px-6 md:px-8 flex items-center justify-end gap-4 select-none shrink-0">
          

          {/* Right profile info & status */}
          <div className="flex items-center space-x-4 justify-end">
            <div className="text-right text-[10px] text-[#64748B] font-mono leading-tight">
              <div>DB Status: <span className={`font-bold ${dbStatus === 'up' ? 'text-emerald-700' : 'text-red-500'}`}>{dbStatus.toUpperCase()}</span></div>
              <div className="mt-0.5">{liveTime.toLocaleDateString()} {liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            
            {/* Quick role switcher */}
            {currentUser && (currentUser.role === 'SuperAdmin' || currentUser.role === 'HospitalAdmin') && (
              <select
                value={currentUser.role}
                onChange={e => setCurrentUser({ ...currentUser, role: e.target.value })}
                className="text-xs border rounded-full px-3 py-1.5 focus:outline-none transition-colors bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA]"
                title="Dev Role Switcher"
              >
                <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="SuperAdmin">SuperAdmin</option>
                <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="HospitalAdmin">HospitalAdmin</option>
                <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="FrontDesk">FrontDesk</option>
                <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Doctor">Doctor</option>
                <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Nurse">Nurse</option>
                <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Pharmacist">Pharmacist</option>
                <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Accountant">Accountant</option>
              </select>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 md:p-7">
          
          {/* Tab-driven layouts */}
          {activeTab === 'directory' && (
            <div className="space-y-8 animate-fade-in">
              {/* View Title */}
              <div>
                <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide">Patient Directory</h1>
                <p className="text-sm text-[#64748B]">Manage patient files, registers, and search demographic credentials.</p>
              </div>

              {/* Dashboard Grid Header stats */}
              {(visibleWidgets.patientStats || visibleWidgets.shortcutDeck) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Metric 1: Upcoming Today */}
                  <div className="bg-[#147C8A] text-white rounded-2xl p-5 relative overflow-hidden" style={{boxShadow:'0 4px 12px rgba(20,124,138,0.25)'}}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Upcoming Today</p>
                        <h3 className="text-3xl font-bold mt-2">{upcomingCount}</h3>
                      </div>
                      <div className="p-2.5 bg-white/20 rounded-xl text-white">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-xs text-white/60 mt-3">Scheduled for Consultation</p>
                  </div>

                  {/* Metric 2: Total Patients */}
                  {visibleWidgets.patientStats && (
                    <div className="bg-white border border-[#D7E8EA] rounded-2xl p-5 relative overflow-hidden" style={{boxShadow:'0 1px 4px rgba(20,124,138,0.08)'}}>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#22C55E] rounded-t-2xl" />
                      <div className="flex justify-between items-start mt-1">
                        <div>
                          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Total Patients</p>
                          <h3 className="text-3xl font-bold text-[#1E293B] mt-1.5">{patientCount}</h3>
                        </div>
                        <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                          <User className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-xs text-[#64748B] mt-3">Registered in database</p>
                    </div>
                  )}

                  {/* Metric 3: Waiting Time Index */}
                  <div className="bg-white border border-[#D7E8EA] rounded-2xl p-5 relative overflow-hidden" style={{boxShadow:'0 1px 4px rgba(20,124,138,0.08)'}}>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8B347] rounded-t-2xl" />
                    <div className="flex justify-between items-start mt-1">
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Average Wait</p>
                        <h3 className="text-3xl font-bold text-[#1E293B] mt-1.5">{averageWait}m</h3>
                      </div>
                      <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-xs text-[#64748B] mt-3">Consultation Wait Index</p>
                  </div>

                  {/* Metric 4: Bed Occupancy */}
                  <div className="bg-white border border-[#D7E8EA] rounded-2xl p-5 relative overflow-hidden" style={{boxShadow:'0 1px 4px rgba(20,124,138,0.08)'}}>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#0EA5E9] rounded-t-2xl" />
                    <div className="flex justify-between items-start mt-1">
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Beds Occupied</p>
                        <h3 className="text-3xl font-bold text-[#1E293B] mt-1.5">{occupiedBeds}/{totalBeds || 35}</h3>
                      </div>
                      <div className="p-2.5 bg-[#EAF7F8] rounded-xl text-[#147C8A]">
                        <Bed className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-xs text-[#64748B] mt-3">Ward Bed Occupancy Index</p>
                  </div>

                </div>
              )}

              {/* Action Panel Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Widgets */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Live Clinic Queue Status */}
                  {hssConfig.ponytailEnabled && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-3">
                          <Activity className="w-5 h-5 text-[#147C8A] animate-pulse" />
                          <div>
                            <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">Live Clinic Queue & Patient Flow</h2>
                            <span className="text-[9px] text-[#94A3B8] font-mono">PONYTAIL OPTIMIZATION SERVICE ACTIVE</span>
                          </div>
                        </div>
                        <span className="bg-[#EAF7F8] text-[#147C8A] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">Flow Index: 9.4</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Doctor Queues */}
                        <div className="bg-[#F8FBFB] border border-slate-100 p-4 rounded-2xl space-y-3">
                          <h3 className="font-bold text-[#94A3B8] text-[10px] uppercase tracking-wider flex items-center">
                            <Stethoscope className="w-3.5 h-3.5 text-[#147C8A] mr-1.5" />
                            <span>Doctor Consulting Queues</span>
                          </h3>
                          <div className="space-y-2">
                            {[
                              { name: 'Dr. Rajesh (Cardio)', waiting: 5, time: '35m', status: 'Optimal' },
                              { name: 'Dr. Verma (Paediatrics)', waiting: 12, time: '52m', status: 'Delayed' },
                              { name: 'Dr. Sen (General Medicine)', waiting: 2, time: '10m', status: 'Optimal' }
                            ].map((doc, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[#64748B] p-2 bg-white rounded-xl border border-slate-100">
                                <div>
                                  <span className="font-semibold block text-[#1E293B]">{doc.name}</span>
                                  <span className="text-[10px] text-[#94A3B8]">Wait count: {doc.waiting} patients</span>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                    doc.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {doc.time}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ward Occupancy */}
                        <div className="bg-[#F8FBFB] border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <h3 className="font-bold text-[#94A3B8] text-[10px] uppercase tracking-wider flex items-center">
                              <Bed className="w-3.5 h-3.5 text-[#147C8A] mr-1.5" />
                              <span>Ward Bed Occupancy</span>
                            </h3>
                            <div className="space-y-3">
                              {[
                                { label: 'General Ward', occupied: 18, total: 20, color: 'bg-[#147C8A]' },
                                { label: 'ICU Beds', occupied: 4, total: 5, color: 'bg-[#F59E0B]' },
                                { label: 'Semi-Private Rooms', occupied: 8, total: 15, color: 'bg-[#22C55E]' }
                              ].map((w, idx) => {
                                const pct = Math.round((w.occupied / w.total) * 100);
                                return (
                                  <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-[#64748B] font-semibold">{w.label}</span>
                                      <span className="text-[#94A3B8]">{w.occupied}/{w.total} ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                      <div className={`${w.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Widget settings */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
                      <Settings className="w-5 h-5 text-[#147C8A]" />
                      <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">Custom Widgets Settings</h2>
                    </div>
                    <p className="text-xs text-[#94A3B8] mb-4">Toggle visual components to personalize your workspace view.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
                      {[
                        { key: 'patientStats', label: 'Total Patients', color: 'bg-blue-500' },
                        { key: 'shortcutDeck', label: 'Shortcuts Deck', color: 'bg-[#147C8A]' },
                        { key: 'emergencyContacts', label: 'Emergency Helpline', color: 'bg-[#22C55E]' },
                        { key: 'securityLogs', label: 'System Audit Logs', color: 'bg-[#147C8A]' },
                        { key: 'departmentStats', label: 'Clinic queue load', color: 'bg-rose-500' },
                        { key: 'billingSummary', label: 'Cashbook Summary', color: 'bg-[#F59E0B]' }
                      ].map((widget) => (
                        <button
                          key={widget.key}
                          onClick={() => toggleWidget(widget.key)}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            visibleWidgets[widget.key] ? 'bg-[#EAF7F8]/50 border-[#147C8A]/25 text-[#147C8A]' : 'bg-[#F8FBFB] border-[#D7E8EA] text-[#64748B] hover:text-[#1E293B]'
                          }`}
                        >
                          <span>{widget.label}</span>
                          <div className={`w-2.5 h-2.5 rounded-full ${visibleWidgets[widget.key] ? widget.color : 'bg-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Security Audit Logs */}
                  {visibleWidgets.securityLogs && (
                    <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#D7E8EA]">
                        <div className="flex items-center space-x-3">
                          <Activity className="w-5 h-5 text-[#147C8A]" />
                          <h2 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">Live System Audit Logs</h2>
                        </div>
                        <button 
                          type="button"
                          onClick={fetchAuditLogs}
                          disabled={isLogsLoading}
                          className="text-[10px] text-[#147C8A] hover:underline font-bold uppercase tracking-wider"
                        >
                          {isLogsLoading ? 'Refreshing...' : 'Refresh Logs'}
                        </button>
                      </div>
                      
                      {recentAuditLogs.length === 0 ? (
                        <div className="text-center py-6 text-xs text-[#94A3B8] font-semibold">No activity logs recorded.</div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                          {recentAuditLogs.map((log: any) => (
                            <div key={log.id} className="p-3 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-xs space-y-1">
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="font-mono text-[#147C8A] font-bold bg-[#EAF7F8] px-2 py-0.5 rounded uppercase">{log.actionType}</span>
                                <span className="text-[#64748B] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-[#64748B] text-[11px] font-medium">{log.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Right: Patient Lookup / Search Desk */}
                <div className="lg:col-span-5 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm flex flex-col h-[520px]">
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#D7E8EA]">
                    <Search className="w-5 h-5 text-[#147C8A]" />
                    <h2 className="text-lg font-bold text-[#1E293B]">Directory Lookup</h2>
                  </div>

                  {/* Search Input Box */}
                  <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3.5 w-4 h-4 text-[#94A3B8]" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by name, mobile or UHID..."
                        className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-full pl-10 pr-24 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-1.5 py-1 px-4 bg-[#147C8A] hover:bg-blue-700 text-white font-bold rounded-full text-xs transition-colors"
                      >
                        Search
                      </button>
                    </div>
                  </form>

                  {/* Search Results list (Matching the list layout in reference mockup) */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {searchResults.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] text-center px-4">
                        <Database className="w-8 h-8 mb-2 opacity-30 text-[#147C8A]" />
                        <p className="text-sm font-semibold text-[#64748B]">No patients found</p>
                        <p className="text-xs text-[#64748B] mt-1">Enter a query above to lookup records</p>
                      </div>
                    ) : (
                      searchResults.map(patient => (
                        <div 
                          key={patient.uhid} 
                          className="p-3.5 bg-white hover:bg-[#EAF7F8] border border-[#D7E8EA] rounded-2xl transition-all flex items-center justify-between group shadow-sm"
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <div className="w-10 h-10 rounded-full bg-[#EAF7F8] text-[#147C8A] font-bold text-xs flex items-center justify-center shrink-0">
                              {patient.patientName.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <h4 className="font-bold text-[#1E293B] text-sm truncate group-hover:text-[#147C8A] transition-colors">
                                {patient.patientName}
                              </h4>
                              <p className="text-xs text-[#64748B] font-semibold font-mono tracking-tight mt-0.5 truncate">
                                {patient.mobile} • {patient.uhid}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOPDPatient(patient);
                              setActiveTab('frontdesk');
                            }}
                            className="py-1 px-3 bg-[#EAF7F8] hover:bg-blue-100 text-[#147C8A] font-bold rounded-lg text-xs transition-colors shrink-0"
                          >
                            Book OPD
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'frontdesk' && (
            <FrontDeskView 
              initialSubTab={frontdeskSubTab}
              onSubTabChange={(tab) => setFrontdeskSubTab(tab)}
              initialPatient={selectedOPDPatient as any}
              onClearPatient={() => setSelectedOPDPatient(null)}
              currentUser={currentUser}
            />
          )}
          
          {activeTab === 'doctor' && <DoctorDeskView />}

          {activeTab === 'inpatient' && (
            <InpatientDeskView 
              initialSubTab={inpatientSubTab}
              onSubTabChange={(tab) => setInpatientSubTab(tab)}
            />
          )}

          {activeTab === 'opcs' && <OPCSView initialSubTab={opcsSubTab} />}

          {activeTab === 'billing' && <BillingDeskView role={currentUser?.role} initialSubTab={billingSubTab} />}

          {activeTab === 'masters' && <MastersDeskView />}

          {activeTab === 'reports' && (
            <ReportsConsoleView 
              initialSubTab={reportsSubTab} 
              onSubTabChange={setReportsSubTab} 
            />
          )}

          {activeTab === 'crms' && (
            <CRMSDeskView 
              initialSubTab={crmsSubTab}
              onSubTabChange={(tab) => setCrmsSubTab(tab)}
            />
          )}

          {activeTab === 'whatsapp' && <WhatsAppConsoleView />}

          {activeTab === 'automations' && <AutomationBuilderView />}

          {activeTab === 'settings' && <SettingsDeskView />}

          {activeTab === 'hrstaff' && <HRStaffView />}

          {activeTab === 'pharmacy' && <PharmacyDeskView />}

          {activeTab === 'laboratory' && <LaboratoryView />}

          {activeTab === 'radiology' && <RadiologyView />}

          {activeTab === 'inventory' && <InventoryView />}

        </div>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs text-[#94A3B8] mt-auto shrink-0 select-none">
          <p>© 2026 {hssConfig.hospitalName} {hssConfig.hospitalTagline}. Built with React (Vite) & Spring Boot 3.x.</p>
        </footer>
      </div>

      {/* ABHA OTP Modal */}
      {isAbhaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#EAF7F8] backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#1E293B] mb-2 flex items-center space-x-2">
              <Database className="w-5 h-5 text-[#147C8A]" />
              <span>ABHA Health ID Lookup</span>
            </h3>
            <p className="text-xs text-[#94A3B8] mb-6">
              Link patient record with Ayushman Bharat Health Account (ABHA).
            </p>

            {abhaError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl mb-4 text-red-600 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{abhaError}</span>
              </div>
            )}

            {abhaStep === 'id' ? (
              <form onSubmit={handleSendAbhaOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    ABHA ID / Number
                  </label>
                  <input
                    type="text"
                    required
                    value={abhaNumber}
                    onChange={(e) => setAbhaNumber(e.target.value)}
                    placeholder="e.g. 12-3456-7890-1234"
                    className="w-full bg-[#F8FBFB] border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors font-mono"
                  />
                  <p className="text-[10px] text-[#94A3B8] font-medium">
                    Enter any 14-digit ABHA ID number to fetch simulated profile.
                  </p>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAbhaModalOpen(false)}
                    className="flex-1 py-2.5 bg-[#EAF7F8] hover:bg-slate-200 text-[#64748B] rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={abhaLoading}
                    className="flex-1 py-2.5 bg-[#147C8A] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
                  >
                    {abhaLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyAbhaOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    One Time Password (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={abhaOtp}
                    onChange={(e) => setAbhaOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP (123456)"
                    className="w-full bg-[#F8FBFB] border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors text-center tracking-widest font-bold"
                  />
                  <p className="text-[10px] text-[#94A3B8] font-medium">
                    Use default simulation code <strong className="text-[#147C8A]">123456</strong> to verify approval.
                  </p>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAbhaStep('id')}
                    className="flex-1 py-2.5 bg-[#EAF7F8] hover:bg-slate-200 text-[#64748B] rounded-xl text-xs font-bold transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={abhaLoading}
                    className="flex-1 py-2.5 bg-[#22C55E] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {abhaLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
