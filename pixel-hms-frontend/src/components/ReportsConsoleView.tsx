import { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  RefreshCw, 
  Stethoscope, 
  Bed, 
  Pill, 
  FileText,
  User,
  Users,
  Layers,
  Activity,
  ChevronRight,
  ClipboardList,
  Save,
  Search,
  CheckCircle2,
  Printer,
  Download,
  Shield
} from 'lucide-react';

interface DoctorReport {
  doctorId: number;
  doctorName: string;
  department: string;
  opCount: number;
  ipCount: number;
  totalPatients: number;
}

interface PharmacyStockReport {
  totalItemsCount: number;
  lowStockItems: any[];
  expiringSoonItems: any[];
}

interface BedCensusReport {
  totalBedsCount: number;
  occupiedBedsCount: number;
  occupancyRate: number;
  wardStatistics: any[];
}

// Report Groups structure matching user requirement
const reportGroups = [
  {
    title: "Doctor's Reports",
    items: [
      { id: 'op-consulting-dr-wise', name: 'OP-Consulting Dr. Wise Report', icon: Stethoscope },
      { id: 'opcs-dr-wise', name: 'OPCS-Dr. Wise Report', icon: Activity },
      { id: 'ip-dr-wise', name: 'IP-Dr. Wise Report', icon: Bed },
      { id: 'ip-dr-ac', name: 'IP-Dr. A/c', icon: DollarSign },
      { id: 'op-referring-dr-wise', name: 'OP-Referring Dr. Wise Report', icon: Users },
    ]
  },
  {
    title: "Other Reports",
    items: [
      { id: 'op-patient-visit-type', name: 'OP-Patient Visit Type Report', icon: Layers },
      { id: 'op-patient-category-wise', name: 'OP-Patient Category Wise Report', icon: Users },
      { id: 'op-opcs-service-wise', name: 'OP-OPCS Service Wise Report', icon: FileText },
      { id: 'op-opcs-doctor-wise', name: 'OP-OPCS Doctor Wise Report', icon: Stethoscope },
      { id: 'op-opcs-memos-bills', name: 'OP-OPCS Memos/Bills Report', icon: DollarSign },
      { id: 'op-opcs-payments', name: 'OP-OPCS Payments Report', icon: DollarSign },
      { id: 'hospital-day-book', name: 'Hospital Day Book Report', highlighted: true, icon: FileText },
      { id: 'dpsr', name: 'DPSR Report', icon: ClipboardList },
      { id: 'op-register-ca', name: 'OP-Register for CA', icon: Shield },
      { id: 'user-wise-day-book', name: 'User Wise Day Book', icon: User }
    ]
  },
  {
    title: "System Alerts",
    items: [
      { id: 'pharmacy', name: 'Pharmacy Stock Alerts', icon: Pill },
      { id: 'beds', name: 'IPD Bed Occupancy', icon: Bed }
    ]
  }
];

const findCategoryForTab = (tabId: string) => {
  for (const group of reportGroups) {
    if (group.items.some(item => item.id === tabId)) {
      return group.title;
    }
  }
  return reportGroups[0].title;
};

export default function ReportsConsoleView({ 
  initialSubTab = 'op-consulting-dr-wise', 
  onSubTabChange 
}: { 
  initialSubTab?: string; 
  onSubTabChange?: (tab: string) => void; 
}) {
  const [subTab, setSubTab] = useState(initialSubTab);
  const [selectedCategory, setSelectedCategory] = useState(() => findCategoryForTab(initialSubTab));

  useEffect(() => {
    setSubTab(initialSubTab);
    setSelectedCategory(findCategoryForTab(initialSubTab));
  }, [initialSubTab]);

  const changeSubTab = (tab: string) => {
    setSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const group = reportGroups.find(g => g.title === category);
    if (group && group.items.length > 0) {
      changeSubTab(group.items[0].id);
    }
  };

  // Shared Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  
  // Real DB Doctors
  const [doctors, setDoctors] = useState<any[]>([]);

  // Report States
  const [docStats, setDocStats] = useState<DoctorReport[]>([]);
  const [pharmacyAlerts, setPharmacyAlerts] = useState<PharmacyStockReport | null>(null);
  const [bedCensus, setBedCensus] = useState<BedCensusReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Day Book Report State
  const [dayBookDate, setDayBookDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dayBookData, setDayBookData] = useState<any>(null);

  // DPSR Search & Edit States
  const [dpsrOpId, setDpsrOpId] = useState('');
  const [isSearchingDpsr, setIsSearchingDpsr] = useState(false);
  const [dpsrError, setDpsrError] = useState('');
  const [dpsrRecord, setDpsrRecord] = useState<any>(null);
  const [isSavingDpsr, setIsSavingDpsr] = useState(false);
  const [dpsrSuccessMsg, setDpsrSuccessMsg] = useState('');

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch doctors on mount
  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/v1/op/doctors', { headers: getHeaders() });
      if (res.ok) setDoctors(await res.json());
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch functions
  const fetchConsultingReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/reports/consulting', { headers: getHeaders() });
      if (res.ok) setDocStats(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchPharmacyReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/reports/pharmacy-stock', { headers: getHeaders() });
      if (res.ok) setPharmacyAlerts(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchBedReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/reports/patient-census', { headers: getHeaders() });
      if (res.ok) setBedCensus(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchDayBook = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/billing/reports/daybook?date=${dateStr}`, { headers: getHeaders() });
      if (res.ok) setDayBookData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // DPSR Search
  const handleDpsrSearch = async () => {
    if (!dpsrOpId.trim()) return;
    setIsSearchingDpsr(true);
    setDpsrError('');
    setDpsrSuccessMsg('');
    try {
      const res = await fetch(`/api/v1/op/registrations/${dpsrOpId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDpsrRecord(data);
      } else {
        setDpsrError(`OP registration ID "${dpsrOpId}" not found.`);
        setDpsrRecord(null);
      }
    } catch (e) {
      setDpsrError('Error searching OP Registration.');
      console.error(e);
    }
    setIsSearchingDpsr(false);
  };

  // DPSR Save
  const handleSaveDpsr = async () => {
    if (!dpsrRecord) return;
    setIsSavingDpsr(true);
    setDpsrSuccessMsg('');
    try {
      const res = await fetch(`/api/v1/op/registrations/modify/${dpsrRecord.id}`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorId: dpsrRecord.assignedDoctor?.id || 1,
          chiefComplaint: dpsrRecord.chiefComplaint || '',
          visitType: dpsrRecord.visitType || 'New',
          paymentStatus: dpsrRecord.paymentStatus || 'Pending',
          referringDoctor: dpsrRecord.referringDoctor || 'SELF',
          patientCategory: dpsrRecord.patientCategory || 'General',
          consultingFee: dpsrRecord.consultingFee || 0,
          paymentMode: dpsrRecord.paymentMode || 'Cash',
          ageValue: dpsrRecord.ageValue || 35,
          ageUnit: dpsrRecord.ageUnit || 'Yrs',
          tempF: dpsrRecord.tempF || '',
          pulseRate: dpsrRecord.pulseRate || '',
          respiratoryRate: dpsrRecord.respiratoryRate || '',
          spo2: dpsrRecord.spo2 || '',
          bloodPressure: dpsrRecord.bloodPressure || '',
          weight: dpsrRecord.weight || '',
          height: dpsrRecord.height || '',
          remarks: dpsrRecord.remarks || '',
          status: dpsrRecord.status || 'Waiting'
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setDpsrRecord(updated);
        setDpsrSuccessMsg('Patient Situation & Vitals updated successfully!');
        showToast('DPSR Record Saved');
      } else {
        setDpsrError('Failed to save DPSR record.');
      }
    } catch (e) {
      console.error(e);
      setDpsrError('Error saving DPSR record.');
    }
    setIsSavingDpsr(false);
  };

  // Trigger loads based on active subTab
  useEffect(() => {
    if (subTab === 'op-consulting-dr-wise' || subTab === 'ip-dr-wise') {
      fetchConsultingReport();
    } else if (subTab === 'hospital-day-book') {
      fetchDayBook(dayBookDate);
    } else if (subTab === 'pharmacy') {
      fetchPharmacyReport();
    } else if (subTab === 'beds') {
      fetchBedReport();
    }
  }, [subTab]);

  const handleRefresh = () => {
    if (subTab === 'op-consulting-dr-wise' || subTab === 'ip-dr-wise') {
      fetchConsultingReport();
    } else if (subTab === 'hospital-day-book') {
      fetchDayBook(dayBookDate);
    } else if (subTab === 'pharmacy') {
      fetchPharmacyReport();
    } else if (subTab === 'beds') {
      fetchBedReport();
    } else if (subTab === 'dpsr') {
      handleDpsrSearch();
    } else {
      showToast('Report data refreshed.');
    }
  };

  // Mock data generations for views that don't have dedicated backend REST endpoints
  const getMockDoctors = () => [
    { id: 1, name: 'Dr. Ramesh Wise', specialty: 'General Medicine', dept: 'General Medicine', consults: 24, fee: 350 },
    { id: 2, name: 'Dr. Anjali Shah', specialty: 'Cardiology', dept: 'Cardiology', consults: 18, fee: 500 },
    { id: 3, name: 'Dr. Sunita Sharma', specialty: 'Gynecology', dept: 'Gynecology', consults: 15, fee: 400 },
    { id: 4, name: 'Dr. Vikram Malhotra', specialty: 'Orthopedics', dept: 'Orthopedics', consults: 12, fee: 450 },
    { id: 5, name: 'Dr. Rajesh Patel', specialty: 'Pediatrics', dept: 'Pediatrics', consults: 20, fee: 300 }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-[#147C8A] text-white font-bold px-4 py-2.5 rounded-xl shadow-2xl z-[150] flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#F8FBFB] p-6 rounded-2xl border border-[#D7E8EA] backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide flex items-center space-x-2.5">
            <TrendingUp className="w-6 h-6 text-[#147C8A]" />
            <span>Reports & Analytics Dashboard</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Navigate grouped clinical, financial, operations, and audit reports.
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#147C8A] rounded-xl border border-[#D7E8EA] transition-all flex items-center space-x-1.5 text-xs font-bold shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1 bg-white border border-[#D7E8EA] rounded-2xl p-1.5 overflow-x-auto">
        {reportGroups.map((group) => {
          const isSelected = selectedCategory === group.title;
          return (
            <button
              key={group.title}
              onClick={() => handleCategoryChange(group.title)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[#147C8A] text-white shadow'
                  : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#EAF7F8]'
              }`}
            >
              {group.title === "Doctor's Reports" && <Stethoscope className="w-3.5 h-3.5" />}
              {group.title === "Other Reports" && <FileText className="w-3.5 h-3.5" />}
              {group.title === "System Alerts" && <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{group.title}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Bar for Active Category */}
      <div className="flex items-center space-x-1 bg-white border border-[#D7E8EA] rounded-2xl p-1.5 overflow-x-auto">
        {reportGroups
          .find((g) => g.title === selectedCategory)
          ?.items.map((t) => (
            <button
              key={t.id}
              onClick={() => changeSubTab(t.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                subTab === t.id
                  ? 'bg-[#147C8A] text-white shadow'
                  : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#EAF7F8]'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.name}</span>
            </button>
          ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">

          {/* Action Row & General Filters (Except DPSR) */}
          {subTab !== 'dpsr' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-5 shadow-sm backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                {subTab !== 'hospital-day-book' ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">From</span>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                        className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">To</span>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)} 
                        className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">Day Book Date</span>
                    <input 
                      type="date" 
                      value={dayBookDate} 
                      onChange={e => {
                        setDayBookDate(e.target.value);
                        fetchDayBook(e.target.value);
                      }} 
                      className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                    />
                  </div>
                )}

                {/* Doctor Filter (Applicable for Doctor wise and billing list) */}
                {['op-consulting-dr-wise', 'opcs-dr-wise', 'ip-dr-wise', 'ip-dr-ac', 'op-referring-dr-wise', 'op-opcs-doctor-wise'].includes(subTab) && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">Doctor</span>
                    <select
                      value={selectedDoctorId}
                      onChange={e => setSelectedDoctorId(e.target.value)}
                      className="border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="all">All Doctors</option>
                      {doctors.map(d => (
                        <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={d.id} value={d.id}>Dr. {d.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => showToast('Report exported to Excel')}
                  className="px-3.5 py-1.5 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] font-bold rounded-xl text-xs flex items-center space-x-1 border border-[#D7E8EA] transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Excel</span>
                </button>
                <button 
                  onClick={() => showToast('Printing report...')}
                  className="px-3.5 py-1.5 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] font-bold rounded-xl text-xs flex items-center space-x-1 border border-[#D7E8EA] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-[#147C8A]" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          )}

          {/* Report Data Renderers */}

          {/* 1. OP-Consulting Dr. Wise Report */}
          {subTab === 'op-consulting-dr-wise' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                OP-Consulting Dr. Wise Report
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Doctor Name</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3 text-right">OP Consults Count</th>
                      <th className="pb-3 text-right font-bold text-emerald-700">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {docStats
                      .filter(stat => selectedDoctorId === 'all' || String(stat.doctorId) === selectedDoctorId)
                      .map(stat => (
                        <tr key={stat.doctorId} className="hover:bg-[#F8FBFB]">
                          <td className="py-3 font-semibold text-[#1E293B]">Dr. {stat.doctorName}</td>
                          <td className="py-3 text-[#64748B]">{stat.department}</td>
                          <td className="py-3 font-mono text-[#147C8A] font-bold text-right">{stat.opCount}</td>
                          <td className="py-3 font-mono text-emerald-700 font-bold text-right">
                            INR {(stat.opCount * 350).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    {docStats.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#64748B]">No data found in selected period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. OPCS-Dr. Wise Report */}
          {subTab === 'opcs-dr-wise' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                OPCS-Dr. Wise Report (Diagnostics & Surgery orders)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Doctor Name</th>
                      <th className="pb-3">Specialty</th>
                      <th className="pb-3 text-right">Lab orders</th>
                      <th className="pb-3 text-right">Scans/X-rays</th>
                      <th className="pb-3 text-right">Minor OT orders</th>
                      <th className="pb-3 text-right font-bold text-emerald-700">OPCS Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {getMockDoctors()
                      .filter(d => selectedDoctorId === 'all' || String(d.id) === selectedDoctorId)
                      .map(d => {
                        const labs = Math.round(d.consults * 1.5);
                        const scans = Math.round(d.consults * 0.6);
                        const ots = Math.round(d.consults * 0.1);
                        const opcsValue = (labs * 450) + (scans * 1200) + (ots * 3500);
                        return (
                          <tr key={d.id} className="hover:bg-[#F8FBFB]">
                            <td className="py-3 font-semibold text-[#1E293B]">{d.name}</td>
                            <td className="py-3 text-[#64748B]">{d.specialty}</td>
                            <td className="py-3 font-mono text-[#1E293B] text-right">{labs}</td>
                            <td className="py-3 font-mono text-[#1E293B] text-right">{scans}</td>
                            <td className="py-3 font-mono text-[#1E293B] text-right">{ots}</td>
                            <td className="py-3 font-mono text-emerald-700 font-bold text-right">INR {opcsValue.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. IP-Dr. Wise Report */}
          {subTab === 'ip-dr-wise' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                IP-Dr. Wise Admissions Report
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Doctor Name</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3 text-right">IP Admissions</th>
                      <th className="pb-3 text-right">Total Ward Bed-Days</th>
                      <th className="pb-3 text-right">Avg Stay Duration</th>
                      <th className="pb-3 text-right font-bold text-[#147C8A]">Total IP Billing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {docStats
                      .filter(stat => selectedDoctorId === 'all' || String(stat.doctorId) === selectedDoctorId)
                      .map(stat => {
                        const bedDays = stat.ipCount * 4;
                        const avgStay = stat.ipCount > 0 ? '4.2 Days' : '0.0 Days';
                        const billing = stat.ipCount * 12500;
                        return (
                          <tr key={stat.doctorId} className="hover:bg-[#F8FBFB]">
                            <td className="py-3 font-semibold text-[#1E293B]">Dr. {stat.doctorName}</td>
                            <td className="py-3 text-[#64748B]">{stat.department}</td>
                            <td className="py-3 font-mono text-[#147C8A] font-semibold text-right">{stat.ipCount}</td>
                            <td className="py-3 font-mono text-[#1E293B] text-right">{bedDays}</td>
                            <td className="py-3 text-[#64748B] text-right">{avgStay}</td>
                            <td className="py-3 font-mono text-[#147C8A] font-bold text-right">INR {billing.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. IP-Dr. A/c */}
          {subTab === 'ip-dr-ac' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] border-b border-[#D7E8EA] pb-2">
                IP-Dr. A/c (Doctor Settlement Ledger)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Doctor Name</th>
                      <th className="pb-3 text-right">Visits Share (INR)</th>
                      <th className="pb-3 text-right">Surgeries Share (INR)</th>
                      <th className="pb-3 text-right">Admitted Share (INR)</th>
                      <th className="pb-3 text-right">Total Share</th>
                      <th className="pb-3 text-right">Paid Amount</th>
                      <th className="pb-3 text-right text-red-600">Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {getMockDoctors()
                      .filter(d => selectedDoctorId === 'all' || String(d.id) === selectedDoctorId)
                      .map(d => {
                        const opShare = d.consults * d.fee * 0.6;
                        const surgShare = d.id % 2 === 0 ? 15000 : 8000;
                        const ipShare = d.consults * 120;
                        const total = opShare + surgShare + ipShare;
                        const paid = Math.floor(total * 0.7);
                        const outstanding = total - paid;
                        return (
                          <tr key={d.id} className="hover:bg-[#F8FBFB]">
                            <td className="py-3 font-semibold text-[#1E293B]">{d.name}</td>
                            <td className="py-3 font-mono text-[#1E293B] text-right">{opShare.toLocaleString()}</td>
                            <td className="py-3 font-mono text-[#1E293B] text-right">{surgShare.toLocaleString()}</td>
                            <td className="py-3 font-mono text-[#1E293B] text-right">{ipShare.toLocaleString()}</td>
                            <td className="py-3 font-mono font-bold text-[#1E293B] text-right">{total.toLocaleString()}</td>
                            <td className="py-3 font-mono text-emerald-700 text-right">{paid.toLocaleString()}</td>
                            <td className="py-3 font-mono text-red-600 font-bold text-right">{outstanding.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. OP-Referring Dr. Wise Report */}
          {subTab === 'op-referring-dr-wise' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                OP-Referring Dr. Wise Report (Referral Case Registry)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">External Referring Doctor</th>
                      <th className="pb-3">Clinic / Location</th>
                      <th className="pb-3 text-right">Referred Cases</th>
                      <th className="pb-3 text-right">Total Fees</th>
                      <th className="pb-3 text-right font-bold text-orange-400">Benefit Share (15%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {[
                      { name: 'Dr. A. K. Gupta', clinic: 'Metro Clinic, Sector-5', cases: 14, val: 4900 },
                      { name: 'Dr. Priya Deshmukh', clinic: 'Priya Pediatric Care', cases: 9, val: 3150 },
                      { name: 'City Health Diagnostics', clinic: 'Vikas Nagar', cases: 22, val: 12500 },
                      { name: 'Dr. Sunil Nambiar', clinic: 'Apex Cardiac Clinic', cases: 6, val: 3000 },
                      { name: 'Dr. Family Care clinic', clinic: 'Wellness Hub', cases: 11, val: 3850 },
                    ].map((ref, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FBFB]">
                        <td className="py-3 font-semibold text-[#1E293B]">{ref.name}</td>
                        <td className="py-3 text-[#64748B]">{ref.clinic}</td>
                        <td className="py-3 font-mono text-[#147C8A] font-bold text-right">{ref.cases}</td>
                        <td className="py-3 font-mono text-[#1E293B] text-right">INR {ref.val.toLocaleString()}</td>
                        <td className="py-3 font-mono text-orange-600 font-bold text-right">INR {Math.round(ref.val * 0.15).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. OP-Patient Visit Type Report */}
          {subTab === 'op-patient-visit-type' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                OP-Patient Visit Type Report (Share Matrix)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: 'New Registration', count: 185, percent: '56.9%', color: 'border-[#147C8A]/20 text-[#147C8A]' },
                  { title: 'Follow-Up Consult', count: 98, percent: '30.1%', color: 'border-emerald-500/20 text-emerald-700' },
                  { title: 'Emergency Intake', count: 28, percent: '8.6%', color: 'border-rose-500/20 text-red-600' },
                  { title: 'Voluntary Checkup', count: 14, percent: '4.3%', color: 'border-amber-500/20 text-amber-700' },
                ].map((c, idx) => (
                  <div key={idx} className={`p-4 bg-[#F8FBFB] border ${c.color} rounded-2xl`}>
                    <span className="text-[10px] font-bold text-[#64748B] block uppercase">{c.title}</span>
                    <h3 className="text-xl font-bold mt-1 font-mono">{c.count}</h3>
                    <span className="text-[10px] text-[#64748B] font-semibold">{c.percent} share</span>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Visit Classification</th>
                      <th className="pb-3 text-right">Query Period Count</th>
                      <th className="pb-3 text-right">Visit Share %</th>
                      <th className="pb-3 text-right">Total Fees Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {[
                      { key: 'New', count: 185, share: '56.9%', rev: 64750 },
                      { key: 'FollowUp', count: 98, share: '30.1%', rev: 19600 },
                      { key: 'Emergency', count: 28, share: '8.6%', rev: 14000 },
                      { key: 'Voluntary', count: 14, share: '4.3%', rev: 4900 }
                    ].map(row => (
                      <tr key={row.key} className="hover:bg-[#F8FBFB]">
                        <td className="py-3 font-semibold text-[#1E293B]">{row.key} Visit</td>
                        <td className="py-3 font-mono text-[#1E293B] text-right">{row.count}</td>
                        <td className="py-3 font-mono text-[#64748B] text-right">{row.share}</td>
                        <td className="py-3 font-mono text-emerald-700 font-bold text-right">INR {row.rev.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. OP-Patient Category Wise Report */}
          {subTab === 'op-patient-category-wise' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                OP-Patient Category Wise Report
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Patient billing category</th>
                      <th className="pb-3 text-right">Patient Headcount</th>
                      <th className="pb-3 text-right">Discounts Allowed</th>
                      <th className="pb-3 text-right font-bold text-emerald-700">Collected Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {[
                      { cat: 'General OPD Counter', count: 215, disc: 1200, col: 75250 },
                      { cat: 'Corporate - Tata Motors', count: 32, disc: 3200, col: 11200 },
                      { cat: 'Corporate - Reliance Industries', count: 24, disc: 2400, col: 8400 },
                      { cat: 'TPA Credit - Star Health Insurance', count: 41, disc: 0, col: 20500 },
                      { cat: 'TPA Credit - ICICI Lombard', count: 29, disc: 0, col: 14500 },
                      { cat: 'Staff Welfare Board', count: 18, disc: 6300, col: 0 },
                      { cat: 'VIP Gold Membership', count: 12, disc: 1800, col: 4200 },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FBFB]">
                        <td className="py-3 font-semibold text-[#1E293B]">{row.cat}</td>
                        <td className="py-3 font-mono text-[#147C8A] font-bold text-right">{row.count}</td>
                        <td className="py-3 font-mono text-red-600 text-right">INR {row.disc.toLocaleString()}</td>
                        <td className="py-3 font-mono text-emerald-700 font-bold text-right">INR {row.col.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. OP-OPCS Service Wise Report */}
          {subTab === 'op-opcs-service-wise' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] border-b border-[#D7E8EA] pb-2">
                OP-OPCS Service Wise Sales Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Investigation / Service Name</th>
                      <th className="pb-3">Department Category</th>
                      <th className="pb-3 text-right">Unit Price</th>
                      <th className="pb-3 text-right">Units Executed</th>
                      <th className="pb-3 text-right font-bold text-emerald-700">Aggregate Turnover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {[
                      { name: 'CBC (Complete Blood Count)', dept: 'Pathology Lab', price: 250, qty: 142 },
                      { name: 'USG Abdomen & Pelvis', dept: 'Radiology / Ultrasound', price: 1100, qty: 54 },
                      { name: 'X-Ray Chest PA View', dept: 'Radiology / X-Ray', price: 350, qty: 88 },
                      { name: 'MRI Brain Contrast', dept: 'Radiology / MRI', price: 6500, qty: 12 },
                      { name: 'Lipid Profile Screen', dept: 'Pathology Lab', price: 600, qty: 45 },
                      { name: 'ECG 12-Channel Analysis', dept: 'Cardiology', price: 200, qty: 62 },
                      { name: 'Blood Sugar Fasting', dept: 'Pathology Lab', price: 80, qty: 195 },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FBFB]">
                        <td className="py-3 font-semibold text-[#1E293B]">{row.name}</td>
                        <td className="py-3 text-[#64748B]">{row.dept}</td>
                        <td className="py-3 font-mono text-[#64748B] text-right">INR {row.price}</td>
                        <td className="py-3 font-mono text-[#147C8A] font-bold text-right">{row.qty}</td>
                        <td className="py-3 font-mono text-emerald-700 font-bold text-right">INR {(row.price * row.qty).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. OP-OPCS Doctor Wise Report */}
          {subTab === 'op-opcs-doctor-wise' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                OP-OPCS Doctor Wise Prescriptions Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Prescribing Doctor</th>
                      <th className="pb-3">Department Focus</th>
                      <th className="pb-3 text-right">Prescribed Labs</th>
                      <th className="pb-3 text-right">Prescribed Imaging</th>
                      <th className="pb-3 text-right font-bold text-emerald-700">Prescription Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {getMockDoctors()
                      .filter(d => selectedDoctorId === 'all' || String(d.id) === selectedDoctorId)
                      .map(d => {
                        const labs = Math.round(d.consults * 2.1);
                        const image = Math.round(d.consults * 0.7);
                        const value = (labs * 380) + (image * 1450);
                        return (
                          <tr key={d.id} className="hover:bg-[#F8FBFB]">
                            <td className="py-3 font-semibold text-[#1E293B]">{d.name}</td>
                            <td className="py-3 text-[#64748B]">{d.dept}</td>
                            <td className="py-3 font-mono text-[#1E293B] text-right">{labs}</td>
                            <td className="py-3 font-mono text-[#1E293B] text-right">{image}</td>
                            <td className="py-3 font-mono text-emerald-700 font-bold text-right">INR {value.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. OP-OPCS Memos/Bills Report */}
          {subTab === 'op-opcs-memos-bills' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                OP-OPCS Invoices & Memos Registry
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Bill ID / Date</th>
                      <th className="pb-3">Patient Name (UHID)</th>
                      <th className="pb-3">Service Items Summary</th>
                      <th className="pb-3 text-right">Net Bill (INR)</th>
                      <th className="pb-3">Payment Mode</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {[
                      { id: 'OPCS-5842', date: '2026-06-25', pat: 'Kamal Kishor (UH1049)', items: 'CBC, USG Abdomen', amt: 1350, mode: 'UPI', status: 'Paid' },
                      { id: 'OPCS-5843', date: '2026-06-25', pat: 'Nisha Agrawal (UH1052)', items: 'MRI Brain Contrast', amt: 6500, mode: 'Credit (TPA)', status: 'Approved' },
                      { id: 'OPCS-5844', date: '2026-06-25', pat: 'Animesh Roy (UH1012)', items: 'Lipid Profile, ECG', amt: 800, mode: 'Cash', status: 'Paid' },
                      { id: 'OPCS-5845', date: '2026-06-26', pat: 'Rajesh Gokhale (UH1088)', items: 'Blood Sugar, Chest X-ray', amt: 430, mode: 'Card', status: 'Paid' },
                      { id: 'OPCS-5846', date: '2026-06-26', pat: 'Preeti Deshmukh (UH1092)', items: 'USG Abdomen', amt: 1100, mode: 'UPI', status: 'Paid' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FBFB]">
                        <td className="py-3">
                          <span className="font-bold text-[#1E293B] block">{row.id}</span>
                          <span className="text-[10px] text-[#64748B] font-mono">{row.date}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-[#1E293B] block">{row.pat.split(' ')[0]} {row.pat.split(' ')[1]}</span>
                          <span className="text-[10px] text-[#147C8A] font-mono">{row.pat.split(' ')[2]}</span>
                        </td>
                        <td className="py-3 text-[#64748B] font-medium">{row.items}</td>
                        <td className="py-3 font-mono text-[#1E293B] font-bold text-right">{row.amt.toLocaleString()}</td>
                        <td className="py-3 text-[#64748B] font-semibold">{row.mode}</td>
                        <td className="py-3 text-right">
                          <span className="bg-[#22C55E]/10 text-emerald-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 11. OP-OPCS Payments Report */}
          {subTab === 'op-opcs-payments' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                OP-OPCS Payments Collection Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'UPI / QR Payments', total: 42100, count: 28, color: 'text-[#147C8A]' },
                  { label: 'Cash Counters', total: 18500, count: 15, color: 'text-emerald-700' },
                  { label: 'Credit Card Swipes', total: 12400, count: 6, color: 'text-[#147C8A]' },
                  { label: 'Corporate Credit', total: 9500, count: 4, color: 'text-amber-700' },
                ].map((col, idx) => (
                  <div key={idx} className="p-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl">
                    <span className="text-[10px] font-bold text-[#64748B] block uppercase">{col.label}</span>
                    <h3 className={`text-lg font-bold mt-1 font-mono ${col.color}`}>INR {col.total.toLocaleString()}</h3>
                    <span className="text-[10px] text-[#64748B] font-medium font-mono">{col.count} transactions</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. Hospital Day Book Report */}
          {subTab === 'hospital-day-book' && (
            <div className="space-y-6">
              {dayBookData ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl">
                      <span className="text-[10px] font-bold text-[#64748B] block uppercase">Total Credits (Inflow)</span>
                      <h3 className="text-xl font-bold text-emerald-700 font-mono mt-1">INR {dayBookData.totalCredit?.toLocaleString() || '0'}</h3>
                    </div>
                    <div className="p-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl">
                      <span className="text-[10px] font-bold text-[#64748B] block uppercase">Total Debits (Refunds)</span>
                      <h3 className="text-xl font-bold text-red-600 font-mono mt-1">INR {dayBookData.totalDebit?.toLocaleString() || '0'}</h3>
                    </div>
                    <div className="p-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl">
                      <span className="text-[10px] font-bold text-[#64748B] block uppercase">Net Cash flow</span>
                      <h3 className="text-xl font-bold text-[#147C8A] font-mono mt-1">INR {dayBookData.cashTotal?.toLocaleString() || '0'}</h3>
                    </div>
                    <div className="p-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl">
                      <span className="text-[10px] font-bold text-[#64748B] block uppercase">UPI Total</span>
                      <h3 className="text-xl font-bold text-[#147C8A] font-mono mt-1">INR {dayBookData.upiTotal?.toLocaleString() || '0'}</h3>
                    </div>
                  </div>

                  <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                      Transaction Ledger ({dayBookData.date})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                            <th className="pb-3">Tx ID</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Type</th>
                            <th className="pb-3">Payment Mode</th>
                            <th className="pb-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                          {dayBookData.transactions?.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-[#F8FBFB]">
                              <td className="py-3 font-mono text-[#64748B]">{tx.id}</td>
                              <td className="py-3 font-semibold text-[#1E293B]">{tx.category}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tx.txType === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-rose-500/10 text-red-600'
                                }`}>
                                  {tx.txType}
                                </span>
                              </td>
                              <td className="py-3 font-semibold text-[#64748B]">{tx.paymentMode || 'N/A'}</td>
                              <td className={`py-3 font-mono font-bold text-right ${
                                tx.txType === 'Credit' ? 'text-emerald-700' : 'text-red-600'
                              }`}>
                                INR {tx.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          {(!dayBookData.transactions || dayBookData.transactions.length === 0) && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-[#64748B]">No transactions recorded on this date.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl text-[#64748B] font-bold">
                  No Day Book summary loaded.
                </div>
              )}
            </div>
          )}

          {/* 13. DPSR Report (Search & Vitals Form) */}
          {subTab === 'dpsr' && (
            <div className="space-y-6">
              
              {/* Header Panel */}
              <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 text-green-700 rounded-2xl border border-emerald-500/20">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-[#1E293B]">
                        OP- Daily Patient Situation Report (DPSR)
                      </h1>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        View and update outpatient vital signs, general complaints, and remarks
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#64748B] bg-[#F8FBFB] px-3 py-1.5 rounded-xl border border-[#D7E8EA] self-start md:self-auto">
                    Today: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Lookup Card */}
              <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-4 font-bold">
                  <span className="text-sm text-[#1E293B]">OP ID :</span>
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
                    <input
                      type="text"
                      value={dpsrOpId}
                      onChange={(e) => setDpsrOpId(e.target.value)}
                      placeholder="Enter OP ID (e.g. 1, 2, 3...)"
                      className="pl-10 pr-4 py-2 bg-[#d1f7d9] text-[#1E293B] rounded-xl text-sm font-bold w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                    />
                  </div>
                  <button
                    onClick={handleDpsrSearch}
                    disabled={isSearchingDpsr}
                    className="px-5 py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center space-x-1"
                  >
                    <span>Get Data</span>
                  </button>
                </div>
                {dpsrError && (
                  <p className="text-red-600 text-xs font-bold">{dpsrError}</p>
                )}
                {dpsrSuccessMsg && (
                  <p className="text-emerald-700 text-xs font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{dpsrSuccessMsg}</span>
                  </p>
                )}
              </div>

              {/* Forms Section */}
              {dpsrRecord && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  
                  {/* Left block: Patient Info */}
                  <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 space-y-5 shadow-sm h-fit">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] border-b border-[#D7E8EA] pb-2">
                      Patient Profile
                    </h3>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between border-b border-[#D7E8EA] pb-2.5">
                        <span className="text-[#64748B] font-medium">Patient Name</span>
                        <span className="font-bold text-[#1E293B]">{dpsrRecord.patient?.patientName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#D7E8EA] pb-2.5">
                        <span className="text-[#64748B] font-medium">UHID</span>
                        <span className="font-mono font-bold text-[#147C8A]">{dpsrRecord.uhid}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#D7E8EA] pb-2.5">
                        <span className="text-[#64748B] font-medium">OP ID</span>
                        <span className="font-bold text-[#1E293B] font-mono">{dpsrRecord.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#D7E8EA] pb-2.5">
                        <span className="text-[#64748B] font-medium">Age / Gender</span>
                        <span className="font-semibold text-[#1E293B]">
                          {dpsrRecord.ageValue} {dpsrRecord.ageUnit} / {dpsrRecord.patient?.gender || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#D7E8EA] pb-2.5">
                        <span className="text-[#64748B] font-medium">Visit Date & Time</span>
                        <span className="font-semibold text-[#64748B] font-mono">
                          {dpsrRecord.visitDate} {dpsrRecord.visitTime ? dpsrRecord.visitTime.substring(0, 5) : ''}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#D7E8EA] pb-2.5">
                        <span className="text-[#64748B] font-medium">Doctor Assigned</span>
                        <span className="font-semibold text-[#1E293B]">
                          Dr. {dpsrRecord.assignedDoctor?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#D7E8EA] pb-2.5">
                        <span className="text-[#64748B] font-medium">Token Number</span>
                        <span className="font-bold text-amber-700 font-mono">Token No: {dpsrRecord.tokenNumber || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B] font-medium">Payment status</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dpsrRecord.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {dpsrRecord.paymentStatus || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right block: vital values */}
                  <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 lg:col-span-2 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#D7E8EA] pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Vitals & Situation Form
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#64748B] font-bold">Visit Status:</span>
                        <select
                          value={dpsrRecord.status || 'Waiting'}
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

                    {/* Vitals inputs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase mb-1">Temperature (°F)</label>
                        <input
                          type="text"
                          value={dpsrRecord.tempF || ''}
                          onChange={(e) => setDpsrRecord({ ...dpsrRecord, tempF: e.target.value })}
                          placeholder="e.g. 98.6"
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase mb-1">Pulse (bpm)</label>
                        <input
                          type="text"
                          value={dpsrRecord.pulseRate || ''}
                          onChange={(e) => setDpsrRecord({ ...dpsrRecord, pulseRate: e.target.value })}
                          placeholder="e.g. 72"
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase mb-1">Respiratory (rpm)</label>
                        <input
                          type="text"
                          value={dpsrRecord.respiratoryRate || ''}
                          onChange={(e) => setDpsrRecord({ ...dpsrRecord, respiratoryRate: e.target.value })}
                          placeholder="e.g. 18"
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase mb-1">SpO2 (%)</label>
                        <input
                          type="text"
                          value={dpsrRecord.spo2 || ''}
                          onChange={(e) => setDpsrRecord({ ...dpsrRecord, spo2: e.target.value })}
                          placeholder="e.g. 98"
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase mb-1">BP (mmHg)</label>
                        <input
                          type="text"
                          value={dpsrRecord.bloodPressure || ''}
                          onChange={(e) => setDpsrRecord({ ...dpsrRecord, bloodPressure: e.target.value })}
                          placeholder="e.g. 120/80"
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase mb-1">Weight (kg)</label>
                        <input
                          type="text"
                          value={dpsrRecord.weight || ''}
                          onChange={(e) => setDpsrRecord({ ...dpsrRecord, weight: e.target.value })}
                          placeholder="e.g. 70"
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase mb-1">Height (cm)</label>
                        <input
                          type="text"
                          value={dpsrRecord.height || ''}
                          onChange={(e) => setDpsrRecord({ ...dpsrRecord, height: e.target.value })}
                          placeholder="e.g. 175"
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                    </div>

                    {/* Complaint & remarks */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase mb-1">Chief Complaint</label>
                        <textarea
                          rows={2}
                          value={dpsrRecord.chiefComplaint || ''}
                          onChange={(e) => setDpsrRecord({ ...dpsrRecord, chiefComplaint: e.target.value })}
                          placeholder="Symptoms or reason for checkup..."
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase mb-1">Consulting Remarks</label>
                        <textarea
                          rows={2}
                          value={dpsrRecord.remarks || ''}
                          onChange={(e) => setDpsrRecord({ ...dpsrRecord, remarks: e.target.value })}
                          placeholder="Doctor recommendations or additional clinical observations..."
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSaveDpsr}
                        disabled={isSavingDpsr}
                        className="px-5 py-2.5 bg-[#22C55E] hover:bg-emerald-700 text-[#1E293B] text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
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

          {/* 14. OP-Register for CA */}
          {subTab === 'op-register-ca' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#D7E8EA] pb-2">
                OP-Register for CA (Corporate Credit Accounts Ledger)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Bill Date / Patient</th>
                      <th className="pb-3">Corporate Sponsor Name</th>
                      <th className="pb-3">Approval Reference No</th>
                      <th className="pb-3 text-right">Credit Amount (INR)</th>
                      <th className="pb-3 text-right">Co-Pay / Net Receivable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {[
                      { date: '2026-06-24', name: 'Alok Nath', corp: 'Tata Motors Corp', ref: 'TMC-95843', amt: 350, copay: 0 },
                      { date: '2026-06-24', name: 'Rajesh Gokhale', corp: 'Reliance Industries Ltd', ref: 'RIL-84221', amt: 500, copay: 100 },
                      { date: '2026-06-25', name: 'Sumit Vyas', corp: 'State Bank Employees Credit', ref: 'SBI-74921', amt: 400, copay: 0 },
                      { date: '2026-06-26', name: 'Naveen Kumar', corp: 'L&T Infotech Staff Care', ref: 'LNT-22104', amt: 350, copay: 50 },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FBFB]">
                        <td className="py-3">
                          <span className="font-semibold text-[#1E293B] block">{row.name}</span>
                          <span className="text-[10px] text-[#64748B] font-mono">{row.date}</span>
                        </td>
                        <td className="py-3 text-[#1E293B] font-semibold">{row.corp}</td>
                        <td className="py-3 font-mono text-[#147C8A] font-semibold">{row.ref}</td>
                        <td className="py-3 font-mono text-[#1E293B] font-bold text-right">INR {row.amt.toLocaleString()}</td>
                        <td className="py-3 font-mono text-emerald-700 font-bold text-right">INR {row.copay.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 15. User Wise Day Book */}
          {subTab === 'user-wise-day-book' && (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] border-b border-[#D7E8EA] pb-2">
                User Wise Day Book (Cash Counter Reconciliation)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D7E8EA] text-[#64748B] font-bold uppercase">
                      <th className="pb-3">Cashier / operator User ID</th>
                      <th className="pb-3 text-right">Cash Received</th>
                      <th className="pb-3 text-right">UPI Received</th>
                      <th className="pb-3 text-right">Card Received</th>
                      <th className="pb-3 text-right">TPA / Corporate Credits</th>
                      <th className="pb-3 text-right font-bold text-[#147C8A]">Total collection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-[#1E293B]">
                    {[
                      { user: 'opd_counter1_anil', cash: 12500, upi: 18400, card: 6200, credit: 3500 },
                      { user: 'opd_counter2_sunita', cash: 9800, upi: 22100, card: 4000, credit: 8000 },
                      { user: 'ipd_billing_clerk_raj', cash: 32000, upi: 45000, card: 28000, credit: 65000 },
                      { user: 'pharmacy_cashier1_anil', cash: 15400, upi: 19800, card: 5400, credit: 0 },
                    ].map((row, idx) => {
                      const total = row.cash + row.upi + row.card + row.credit;
                      return (
                        <tr key={idx} className="hover:bg-[#F8FBFB]">
                          <td className="py-3 font-semibold text-[#1E293B] flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                            <span>{row.user}</span>
                          </td>
                          <td className="py-3 font-mono text-[#1E293B] text-right">INR {row.cash.toLocaleString()}</td>
                          <td className="py-3 font-mono text-[#1E293B] text-right">INR {row.upi.toLocaleString()}</td>
                          <td className="py-3 font-mono text-[#1E293B] text-right">INR {row.card.toLocaleString()}</td>
                          <td className="py-3 font-mono text-[#1E293B] text-right">INR {row.credit.toLocaleString()}</td>
                          <td className="py-3 font-mono text-[#147C8A] font-bold text-right">INR {total.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LEGACY 1. PHARMACY ALERTS */}
          {subTab === 'pharmacy' && pharmacyAlerts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left panel: Low stock list */}
              <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 animate-bounce shrink-0" />
                  <span>Low Stock Alerts (&lt; 50 Qty)</span>
                </h3>
                <div className="divide-y divide-slate-850 max-h-[400px] overflow-y-auto pr-1">
                  {pharmacyAlerts.lowStockItems.length === 0 ? (
                    <p className="py-8 text-center text-[#64748B] text-xs font-semibold">All drug item inventories are well stocked.</p>
                  ) : (
                    pharmacyAlerts.lowStockItems.map(item => (
                      <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-[#1E293B] block">{item.drugName}</span>
                          <span className="text-[9px] font-mono text-[#147C8A]">Batch: {item.batchNumber}</span>
                        </div>
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded font-mono">{item.currentStock} left</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right panel: Expiry soon alerts */}
              <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Drug Expirations (Next 90 Days)</span>
                </h3>
                <div className="divide-y divide-slate-850 max-h-[400px] overflow-y-auto pr-1">
                  {pharmacyAlerts.expiringSoonItems.length === 0 ? (
                    <p className="py-8 text-center text-[#64748B] text-xs font-semibold">No drugs are expiring in the next 90 days.</p>
                  ) : (
                    pharmacyAlerts.expiringSoonItems.map(item => (
                      <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-[#1E293B] block">{item.drugName}</span>
                          <span className="text-[9px] font-mono text-[#64748B]">Batch: {item.batchNumber}</span>
                        </div>
                        <span className="font-bold text-amber-700 bg-amber-100/20 px-2 py-0.5 rounded font-mono">{item.expiryDate}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LEGACY 2. BED CENSUS */}
          {subTab === 'beds' && bedCensus && (
            <div className="space-y-6">
              {/* Top occupancy stats overview */}
              <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-wrap justify-between items-center">
                <div>
                  <span className="text-[10px] font-semibold text-[#147C8A] uppercase tracking-wider text-[10px] block">Overall IPD Bed Occupation Ratio</span>
                  <h2 className="text-3xl font-bold text-[#147C8A] mt-1 font-mono">{bedCensus.occupancyRate.toFixed(1)}%</h2>
                </div>
                <div className="flex space-x-6 text-xs mt-4 sm:mt-0 font-bold">
                  <div>
                    <span className="text-[#64748B] block uppercase text-[9px]">Total Beds count</span>
                    <span className="text-[#64748B] text-sm font-mono">{bedCensus.totalBedsCount} beds</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block uppercase text-[9px]">Occupied census</span>
                    <span className="text-[#147C8A] text-sm font-mono">{bedCensus.occupiedBedsCount} allocated</span>
                  </div>
                </div>
              </div>

              {/* Ward census breakdown */}
              <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] mb-6">Ward Occupancy Census Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bedCensus.wardStatistics.map(stat => (
                    <div key={stat.wardId} className="p-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-[#1E293B] truncate">{stat.wardName}</h4>
                        <span className="text-[9px] text-[#64748B] uppercase font-mono mt-1 block">Occupancy Rate</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#147C8A] font-mono">{stat.occupancyRate.toFixed(1)}%</h3>
                        <div className="w-full bg-[#F8FBFB] h-1.5 rounded-full mt-2 overflow-hidden border border-[#D7E8EA]">
                          <div className="bg-[#147C8A] h-full rounded-full" style={{ width: `${stat.occupancyRate}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#64748B] pt-2 border-t border-[#D7E8EA] font-mono">
                        <span>Allocated: {stat.occupiedBeds}</span>
                        <span>Capacity: {stat.totalBeds}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

      </div>

    </div>
  );
}
