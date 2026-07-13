import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import { 
  HeartHandshake, 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Star, 
  Search, 
  ClipboardCheck,
  Users,
  Baby,
  Activity,
  FilePlus,
  FileText,
  Bed
} from 'lucide-react';

interface Patient {
  id: number;
  uhid: string;
  patientName: string;
  mobile: string;
}

interface FollowUp {
  id: number;
  uhid: string;
  patientName: string;
  doctorName: string;
  scheduledDate: string;
  status: string; // Scheduled, Completed, Cancelled
  notes: string;
}

interface Feedback {
  id: number;
  uhid: string;
  patientName: string;
  rating: number;
  comments: string;
  submissionDate: string;
}

interface Campaign {
  id: number;
  title: string;
  messageText: string;
  targetGroup: string; // All, OP, IP
  status: string; // Draft, Sent
  launchDate?: string | null;
}

export default function CRMSDeskView({
  initialSubTab = 'op-upcoming',
  onSubTabChange
}: {
  initialSubTab?:
    | 'op-upcoming'
    | 'op-edd'
    | 'op-edd-scan'
    | 'ip-upcoming'
    | 'op-followup-entry'
    | 'op-appointments-report'
    | 'feedback'
    | 'campaigns';
  onSubTabChange?: (tab: 'op-upcoming' | 'op-edd' | 'op-edd-scan' | 'ip-upcoming' | 'op-followup-entry' | 'op-appointments-report' | 'feedback' | 'campaigns') => void;
}) {
  const [subTab, setSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabSwitch = (newTab: typeof subTab) => {
    setSubTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };

  // CRMS Lists
  const [followupsList, setFollowupsList] = useState<FollowUp[]>([]);
  const [feedbacksList, setFeedbacksList] = useState<Feedback[]>([]);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);

  // Search/Master Lists
  const [searchQuery, setSearchQuery] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Forms
  const [followForm, setFollowForm] = useState({ doctorName: '', scheduledDate: '', notes: '' });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comments: '' });
  const [campaignForm, setCampaignForm] = useState({ title: '', messageText: '', targetGroup: 'All' });

  // Additional states for maternity/EDD calculation
  const [maternityEDDList, setMaternityEDDList] = useState<any[]>([
    { id: 1, patientName: 'Anjali Sharma', uhid: '260626AH0000001', mobile: '9876543210', lmpDate: '2025-11-15', doctor: 'Dr. Anjali Rao', remarks: 'Normal pregnancy' },
    { id: 2, patientName: 'Pooja Patel', uhid: '260626AH0000002', mobile: '9515511633', lmpDate: '2026-01-10', doctor: 'Dr. Anjali Rao', remarks: 'Twins' },
    { id: 3, patientName: 'Sunita Rao', uhid: '260626AH0000003', mobile: '7766554433', lmpDate: '2026-03-05', doctor: 'Dr. Preeti Sen', remarks: 'First trimester screening scheduled' }
  ]);

  const [scanEDDList, setScanEDDList] = useState<any[]>([
    { id: 1, patientName: 'Anjali Sharma', uhid: '260626AH0000001', scanDate: '2026-01-20', scanWeeks: 12, scanDays: 3, scanEdd: '2026-08-22', lmpEdd: '2026-08-24', doctor: 'Dr. Suresh Sonologist' },
    { id: 2, patientName: 'Pooja Patel', uhid: '260626AH0000002', scanDate: '2026-03-15', scanWeeks: 9, scanDays: 5, scanEdd: '2026-10-17', lmpEdd: '2026-10-17', doctor: 'Dr. Suresh Sonologist' }
  ]);

  const [eddCalculatorForm, setEddCalculatorForm] = useState({
    patientName: '',
    lmpDate: '',
    doctor: ''
  });

  const [eddScanForm, setEddScanForm] = useState({
    patientName: '',
    scanDate: '',
    scanWeeks: '',
    scanDays: '',
    doctor: ''
  });

  // Upcoming OP & IP lists
  const [upcomingOPList, setUpcomingOPList] = useState<any[]>([]);
  const [upcomingOPLoading, setUpcomingOPLoading] = useState(false);
  const [upcomingIPList, setUpcomingIPList] = useState<any[]>([]);
  const [upcomingIPLoading, setUpcomingIPLoading] = useState(false);

  // Notifications
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const triggerMessage = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  // FETCHERS
  const fetchFollowups = async () => {
    try {
      const res = await fetch('/api/v1/crms/followups', { headers: getHeaders('') });
      if (res.ok) setFollowupsList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/v1/crms/feedbacks', { headers: getHeaders('') });
      if (res.ok) setFeedbacksList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/v1/crms/campaigns', { headers: getHeaders('') });
      if (res.ok) setCampaignsList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchUpcomingOP = async () => {
    setUpcomingOPLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await fetch(`/api/v1/op/registrations?fromDate=${today}&toDate=${futureDate}`, { headers: getHeaders('') });
      if (res.ok) {
        const data = await res.json();
        setUpcomingOPList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpcomingOPLoading(false);
    }
  };

  const fetchUpcomingIP = async () => {
    setUpcomingIPLoading(true);
    try {
      const res = await fetch('/api/v1/ip/admissions', { headers: getHeaders('') });
      if (res.ok) {
        const data = await res.json();
        setUpcomingIPList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpcomingIPLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'op-upcoming') fetchUpcomingOP();
    else if (subTab === 'ip-upcoming') fetchUpcomingIP();
    else if (subTab === 'op-appointments-report' || subTab === 'op-followup-entry') fetchFollowups();
    else if (subTab === 'feedback') fetchFeedbacks();
    else if (subTab === 'campaigns') fetchCampaigns();
  }, [subTab]);

  // PATIENT LOOKUP
  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`/api/v1/patients/search?query=${encodeURIComponent(searchQuery)}`, { headers: getHeaders('') });
      if (res.ok) setPatientResults(await res.json());
    } catch (e) { console.error(e); }
  };

  // ACTIONS
  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please search and select a patient first.');
      return;
    }
    setLoading(true);
    const payload = {
      uhid: selectedPatient.uhid,
      patientName: selectedPatient.patientName,
      ...followForm
    };
    try {
      const res = await fetch('/api/v1/crms/followups', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        triggerMessage('success', 'Follow-up appointment scheduled successfully!');
        setFollowForm({ doctorName: '', scheduledDate: '', notes: '' });
        setSelectedPatient(null);
        setSearchQuery('');
        setPatientResults([]);
        fetchFollowups();
      } else {
        triggerMessage('error', 'Failed to schedule follow-up.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFollowupStatus = async (id: number, status: string) => {
    const item = followupsList.find(f => f.id === id);
    if (!item) return;
    try {
      const res = await fetch(`/api/v1/crms/followups/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...item, status })
      });
      if (res.ok) {
        triggerMessage('success', 'Follow-up status updated.');
        fetchFollowups();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteFollowup = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this scheduled follow-up?')) return;
    try {
      const res = await fetch(`/api/v1/crms/followups/${id}`, {
        method: 'DELETE',
        headers: getHeaders('')
      });
      if (res.ok) {
        triggerMessage('success', 'Follow-up cancelled.');
        fetchFollowups();
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please search and select a patient first.');
      return;
    }
    setLoading(true);
    const payload = {
      uhid: selectedPatient.uhid,
      patientName: selectedPatient.patientName,
      ...feedbackForm
    };
    try {
      const res = await fetch('/api/v1/crms/feedbacks', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        triggerMessage('success', 'Patient feedback submitted successfully!');
        setFeedbackForm({ rating: 5, comments: '' });
        setSelectedPatient(null);
        setSearchQuery('');
        setPatientResults([]);
        fetchFeedbacks();
      } else {
        triggerMessage('error', 'Failed to submit feedback.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/crms/campaigns', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(campaignForm)
      });
      if (res.ok) {
        triggerMessage('success', 'Campaign campaign draft created!');
        setCampaignForm({ title: '', messageText: '', targetGroup: 'All' });
        fetchCampaigns();
      } else {
        triggerMessage('error', 'Failed to create campaign.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/crms/campaigns/${id}/send`, {
        method: 'POST',
        headers: getHeaders('')
      });
      if (res.ok) {
        triggerMessage('success', 'Campaign broadcasted! Mock WhatsApp logs generated for matching patients.');
        fetchCampaigns();
      } else {
        triggerMessage('error', 'Failed to broadcast campaign.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  // Feedback scores helper
  const averageRating = feedbacksList.length > 0 
    ? feedbacksList.reduce((sum, f) => sum + f.rating, 0) / feedbacksList.length 
    : 0;

  // LMP EDD Calculations helper
  const calculateEDDAndWeeks = (lmpString: string) => {
    const lmp = new Date(lmpString);
    if (isNaN(lmp.getTime())) return { edd: 'N/A', weeks: 'N/A' };
    
    // EDD = LMP + 280 days
    const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
    const eddStr = edd.toISOString().split('T')[0];
    
    // Gestational Age
    const diffTime = Math.abs(Date.now() - lmp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    return {
      edd: eddStr,
      weeks: `${weeks} Wks ${days} Days`
    };
  };

  const handleAddMaternityLmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eddCalculatorForm.patientName || !eddCalculatorForm.lmpDate) return;
    const newRecord = {
      id: maternityEDDList.length + 1,
      patientName: eddCalculatorForm.patientName,
      uhid: `260626AH${String(maternityEDDList.length + 1).padStart(7, '0')}`,
      mobile: '9' + Math.floor(100000000 + Math.random() * 900000000),
      lmpDate: eddCalculatorForm.lmpDate,
      doctor: eddCalculatorForm.doctor || 'Dr. Anjali Rao',
      remarks: 'LMP-based registry entry'
    };
    setMaternityEDDList([...maternityEDDList, newRecord]);
    setEddCalculatorForm({ patientName: '', lmpDate: '', doctor: '' });
    triggerMessage('success', 'Maternity EDD LMP record added successfully!');
  };

  const handleAddMaternityScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eddScanForm.patientName || !eddScanForm.scanDate || !eddScanForm.scanWeeks) return;
    const weeks = Number(eddScanForm.scanWeeks);
    const days = Number(eddScanForm.scanDays || 0);
    
    // Scan EDD = Scan Date + (280 - (weeks * 7 + days)) days
    const scanDateObj = new Date(eddScanForm.scanDate);
    const totalGestationalDays = weeks * 7 + days;
    const remainingDays = 280 - totalGestationalDays;
    const scanEddDate = new Date(scanDateObj.getTime() + remainingDays * 24 * 60 * 60 * 1000);
    const scanEddStr = scanEddDate.toISOString().split('T')[0];
    
    const newRecord = {
      id: scanEDDList.length + 1,
      patientName: eddScanForm.patientName,
      uhid: `260626AH${String(scanEDDList.length + 1).padStart(7, '0')}`,
      scanDate: eddScanForm.scanDate,
      scanWeeks: weeks,
      scanDays: days,
      scanEdd: scanEddStr,
      lmpEdd: scanEddStr,
      doctor: eddScanForm.doctor || 'Dr. Suresh Sonologist'
    };
    setScanEDDList([...scanEDDList, newRecord]);
    setEddScanForm({ patientName: '', scanDate: '', scanWeeks: '', scanDays: '', doctor: '' });
    triggerMessage('success', 'Maternity scan EDD record logged successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide flex items-center space-x-2">
          <HeartHandshake className="w-6 h-6 text-[#147C8A]" />
          <span>Patient Relation & CRM (Upcoming Patients)</span>
        </h1>
        <p className="text-sm text-[#64748B]">Schedule outpatient follow-ups, gather clinical satisfaction feedbacks, track maternity EDDs, and scan upcoming patients.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-xs max-w-full border-b border-[#D7E8EA] pb-4">
        {[
          { key: 'op-upcoming', label: 'OP-Upcoming Patients', icon: Users },
          { key: 'op-edd', label: 'OP-Upcoming EDD', icon: Baby },
          { key: 'op-edd-scan', label: 'OP-Upcoming EDD by Scanning', icon: Activity },
          { key: 'ip-upcoming', label: 'IP-Upcoming Patients', icon: Bed },
          { key: 'op-followup-entry', label: 'OP-Followup Appointment Entry', icon: FilePlus },
          { key: 'op-appointments-report', label: 'OP-Appointments Entry- Report', icon: FileText },
          { key: 'feedback', label: 'Feedbacks & Ratings', icon: MessageSquare },
          { key: 'campaigns', label: 'Awareness Broadcasts', icon: Send },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              handleTabSwitch(tab.key as any);
              setMsg({ type: '', text: '' });
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
              subTab === tab.key 
                ? 'bg-[#147C8A] text-white shadow-md shadow-sky-500/10' 
                : 'bg-white border border-[#D7E8EA] text-[#64748B] hover:text-[#1E293B] hover:border-[#D7E8EA]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Message Notifications */}
      {msg.text && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-sm animate-fade-in ${
          msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <ClipboardCheck className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* --- SUBTAB 1: OP-UPCOMING PATIENTS --- */}
      {subTab === 'op-upcoming' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2 flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#147C8A]" />
            <span>OP-Upcoming Outpatient Registry (Next 30 Days)</span>
          </h3>
          
          {upcomingOPLoading ? (
            <div className="text-center py-12 text-[#64748B]">Loading upcoming outpatients...</div>
          ) : upcomingOPList.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">No upcoming outpatient registrations logged for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EAF7F8] text-[#147C8A] uppercase font-semibold border-b border-[#D7E8EA]">
                    <th className="py-3 px-4">Token No</th>
                    <th className="py-3 px-4">UHID</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Visit Date / Time</th>
                    <th className="py-3 px-4">Visit Type</th>
                    <th className="py-3 px-4">Assigned Doctor</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                  {upcomingOPList.map(reg => (
                    <tr key={reg.id} className="hover:bg-[#EAF7F8]">
                      <td className="py-3 px-4 font-mono font-bold text-[#147C8A]">{reg.tokenNumber}</td>
                      <td className="py-3 px-4 font-mono">{reg.uhid}</td>
                      <td className="py-3 px-4 font-bold text-[#1E293B]">{reg.patient?.patientName || 'N/A'}</td>
                      <td className="py-3 px-4">{reg.visitDate} @ {reg.visitTime}</td>
                      <td className="py-3 px-4">{reg.visitType}</td>
                      <td className="py-3 px-4">{reg.assignedDoctor?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          reg.paymentStatus === 'Paid' ? 'bg-green-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {reg.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">{reg.status || 'Active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 2: OP-UPCOMING EDD (LMP BASED) --- */}
      {subTab === 'op-edd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel: Add Maternity EDD */}
          <div className="lg:col-span-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2 mb-4 flex items-center space-x-2">
              <Baby className="w-4 h-4 text-[#147C8A]" />
              <span>Calculate & Log EDD (LMP)</span>
            </h3>
            
            <form onSubmit={handleAddMaternityLmp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Patient Name *</label>
                <input 
                  type="text" 
                  required 
                  value={eddCalculatorForm.patientName} 
                  onChange={e => setEddCalculatorForm({ ...eddCalculatorForm, patientName: e.target.value })} 
                  placeholder="Enter pregnant patient name" 
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Last Menstrual Period (LMP) *</label>
                <input 
                  type="date" 
                  required 
                  value={eddCalculatorForm.lmpDate} 
                  onChange={e => setEddCalculatorForm({ ...eddCalculatorForm, lmpDate: e.target.value })} 
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Consulting Gynecologist</label>
                <input 
                  type="text" 
                  value={eddCalculatorForm.doctor} 
                  onChange={e => setEddCalculatorForm({ ...eddCalculatorForm, doctor: e.target.value })} 
                  placeholder="e.g. Dr. Anjali Rao" 
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#147C8A] text-white hover:bg-[#0F6672] hover:text-[#1E293B] font-bold rounded-xl text-xs transition-colors">
                Log Obstetrics EDD
              </button>
            </form>
          </div>

          {/* Right panel: Maternity Registry */}
          <div className="lg:col-span-8 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2 mb-4">
              Maternity Obstetric EDD Registry
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EAF7F8] text-[#147C8A] uppercase font-semibold border-b border-[#D7E8EA]">
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">UHID</th>
                    <th className="py-3 px-4">LMP Date</th>
                    <th className="py-3 px-4">Gestational Age</th>
                    <th className="py-3 px-4">Calculated EDD</th>
                    <th className="py-3 px-4">Consultant</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B] font-medium">
                  {maternityEDDList.map(mat => {
                    const calculations = calculateEDDAndWeeks(mat.lmpDate);
                    return (
                      <tr key={mat.id} className="hover:bg-[#EAF7F8]">
                        <td className="py-3 px-4 font-bold text-[#1E293B]">{mat.patientName}</td>
                        <td className="py-3 px-4 font-mono">{mat.uhid}</td>
                        <td className="py-3 px-4">{mat.lmpDate}</td>
                        <td className="py-3 px-4 text-[#147C8A] font-bold">{calculations.weeks}</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">{calculations.edd}</td>
                        <td className="py-3 px-4">{mat.doctor}</td>
                        <td className="py-3 px-4 text-[#64748B]">{mat.remarks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: OP-UPCOMING EDD BY SCANNING --- */}
      {subTab === 'op-edd-scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel: Log Scan EDD */}
          <div className="lg:col-span-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2 mb-4 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#147C8A]" />
              <span>Log Scan Gestational Measurement</span>
            </h3>
            
            <form onSubmit={handleAddMaternityScan} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Patient Name *</label>
                <input 
                  type="text" 
                  required 
                  value={eddScanForm.patientName} 
                  onChange={e => setEddScanForm({ ...eddScanForm, patientName: e.target.value })} 
                  placeholder="Enter maternity patient name" 
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Ultrasound Scan Date *</label>
                <input 
                  type="date" 
                  required 
                  value={eddScanForm.scanDate} 
                  onChange={e => setEddScanForm({ ...eddScanForm, scanDate: e.target.value })} 
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Weeks at Scan *</label>
                  <input 
                    type="number" 
                    required 
                    min={0}
                    max={42}
                    value={eddScanForm.scanWeeks} 
                    onChange={e => setEddScanForm({ ...eddScanForm, scanWeeks: e.target.value })} 
                    placeholder="e.g. 12" 
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Days at Scan</label>
                  <input 
                    type="number" 
                    min={0}
                    max={6}
                    value={eddScanForm.scanDays} 
                    onChange={e => setEddScanForm({ ...eddScanForm, scanDays: e.target.value })} 
                    placeholder="e.g. 4" 
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Consulting Sonologist</label>
                <input 
                  type="text" 
                  value={eddScanForm.doctor} 
                  onChange={e => setEddScanForm({ ...eddScanForm, doctor: e.target.value })} 
                  placeholder="e.g. Dr. Suresh Sonologist" 
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] placeholder-slate-505 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#147C8A] text-white hover:bg-[#0F6672] hover:text-[#1E293B] font-bold rounded-xl text-xs transition-colors">
                Log Ultrasound EDD
              </button>
            </form>
          </div>

          {/* Right panel: Scan Registry */}
          <div className="lg:col-span-8 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2 mb-4">
              Maternity Ultrasound Scan EDD Registry
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EAF7F8] text-[#147C8A] uppercase font-semibold border-b border-[#D7E8EA]">
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">UHID</th>
                    <th className="py-3 px-4">Scan Date</th>
                    <th className="py-3 px-4">Gestational Age at Scan</th>
                    <th className="py-3 px-4">Scan Calculated EDD</th>
                    <th className="py-3 px-4">LMP Calculated EDD</th>
                    <th className="py-3 px-4">Sonologist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B] font-medium">
                  {scanEDDList.map(scan => (
                    <tr key={scan.id} className="hover:bg-[#EAF7F8]">
                      <td className="py-3 px-4 font-bold text-[#1E293B]">{scan.patientName}</td>
                      <td className="py-3 px-4 font-mono">{scan.uhid}</td>
                      <td className="py-3 px-4">{scan.scanDate}</td>
                      <td className="py-3 px-4 text-[#147C8A] font-bold">{scan.scanWeeks} Wks {scan.scanDays} Days</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">{scan.scanEdd}</td>
                      <td className="py-3 px-4 text-[#64748B]">{scan.lmpEdd}</td>
                      <td className="py-3 px-4">{scan.doctor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: IP-UPCOMING PATIENTS --- */}
      {subTab === 'ip-upcoming' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2 flex items-center space-x-2">
            <Bed className="w-4 h-4 text-[#147C8A]" />
            <span>IP-Upcoming Scheduled Inpatient Admissions</span>
          </h3>
          
          {upcomingIPLoading ? (
            <div className="text-center py-12 text-[#64748B]">Loading upcoming inpatient admissions...</div>
          ) : upcomingIPList.filter(adm => adm.status === 'Scheduled' || adm.status === 'Admitted').length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">No scheduled admissions logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EAF7F8] text-[#147C8A] uppercase font-semibold border-b border-[#D7E8EA]">
                    <th className="py-3 px-4">IP Number</th>
                    <th className="py-3 px-4">UHID</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Admission Date</th>
                    <th className="py-3 px-4">Scheduled Ward / Bed</th>
                    <th className="py-3 px-4">Admitting Doctor</th>
                    <th className="py-3 px-4">Admission Type</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                  {upcomingIPList
                    .filter(adm => adm.status === 'Scheduled' || adm.status === 'Admitted')
                    .map(adm => (
                      <tr key={adm.id} className="hover:bg-[#EAF7F8]">
                        <td className="py-3 px-4 font-mono font-bold text-[#147C8A]">{adm.ipNumber}</td>
                        <td className="py-3 px-4 font-mono">{adm.uhid}</td>
                        <td className="py-3 px-4 font-bold text-[#1E293B]">{adm.patient?.patientName || 'N/A'}</td>
                        <td className="py-3 px-4">{adm.admissionDate} @ {adm.admissionTime || 'N/A'}</td>
                        <td className="py-3 px-4">{adm.ward?.name || 'N/A'} - {adm.bedNumber}</td>
                        <td className="py-3 px-4">{adm.admittingDoctor?.name || 'N/A'}</td>
                        <td className="py-3 px-4">{adm.admissionType}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            adm.status === 'Admitted' ? 'bg-[#EAF7F8] text-[#147C8A]' : 'bg-amber-100 text-amber-700'
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

      {/* --- SUBTAB 5: OP-FOLLOWUP APPOINTMENT ENTRY (FORM) --- */}
      {subTab === 'op-followup-entry' && (
        <div className="max-w-2xl mx-auto bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-8 shadow-sm backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-6 pb-2 border-b border-[#D7E8EA] flex items-center space-x-2">
            <FilePlus className="w-5 h-5 text-[#147C8A]" />
            <span>OP-Followup Appointment Entry Form</span>
          </h3>
          
          {/* Search Patient */}
          <div className="space-y-1 mb-4">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">Search Patient Registry *</label>
            <form onSubmit={handleSearchPatient} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search patient by UHID, Name, or Mobile..."
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>
              <button type="submit" className="bg-[#147C8A] text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#0F6672] transition-colors">
                Search
              </button>
            </form>
          </div>

          {/* Results selection */}
          {patientResults.length > 0 && !selectedPatient && (
            <div className="mb-4 border border-[#D7E8EA] bg-[#F8FBFB] rounded-xl max-h-36 overflow-y-auto divide-y divide-[#D7E8EA]">
              {patientResults.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className="p-2.5 hover:bg-white cursor-pointer flex justify-between items-center transition-colors text-xs"
                >
                  <div>
                    <span className="font-bold text-[#1E293B] block">{p.patientName}</span>
                    <span className="text-[10px] font-mono text-[#147C8A]">{p.uhid}</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#147C8A]" />
                </div>
              ))}
            </div>
          )}

          {/* Selected Patient Banner */}
          {selectedPatient && (
            <div className="mb-4 p-3 bg-[#EAF7F8]/20 border border-[#D7E8EA]/50 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="text-[#64748B]">Selected Patient File:</span>
                <strong className="block text-[#1E293B]">{selectedPatient.patientName} ({selectedPatient.uhid})</strong>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-[10px] hover:underline text-red-600">Clear selection</button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCreateFollowup} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#64748B] uppercase">Consulting Doctor *</label>
              <input 
                type="text" 
                required 
                value={followForm.doctorName} 
                onChange={e => setFollowForm({ ...followForm, doctorName: e.target.value })} 
                placeholder="Dr. Rajesh Sharma" 
                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#64748B] uppercase">Scheduled Appointment Date *</label>
              <input 
                type="date" 
                required 
                value={followForm.scheduledDate} 
                onChange={e => setFollowForm({ ...followForm, scheduledDate: e.target.value })} 
                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#64748B] uppercase">Instructions / Chief Complaints / Notes</label>
              <textarea 
                rows={3} 
                value={followForm.notes} 
                onChange={e => setFollowForm({ ...followForm, notes: e.target.value })} 
                placeholder="Write specific checkup details..." 
                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#147C8A] text-white hover:bg-[#0F6672] hover:text-[#1E293B] font-bold rounded-xl text-xs uppercase tracking-wider transition-colors">
              <span>{loading ? 'Creating Entry...' : 'Submit Follow-up Appointment'}</span>
            </button>
          </form>
        </div>
      )}

      {/* --- SUBTAB 6: OP-APPOINTMENTS ENTRY- REPORT (LIST) --- */}
      {subTab === 'op-appointments-report' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#D7E8EA] pb-2 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#147C8A]" />
            <span>OP-Appointments / Follow-up Entry Registry Report</span>
          </h3>
          
          {followupsList.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">No outpatient appointments/follow-ups registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EAF7F8] text-[#147C8A] uppercase font-semibold border-b border-[#D7E8EA]">
                    <th className="py-3 px-4">Appointment ID</th>
                    <th className="py-3 px-4">UHID</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Doctor Name</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA] text-[#1E293B]">
                  {followupsList.map(f => (
                    <tr key={f.id} className="hover:bg-[#EAF7F8]">
                      <td className="py-3 px-4 font-mono font-bold text-[#147C8A]">APT-0{f.id}</td>
                      <td className="py-3 px-4 font-mono">{f.uhid}</td>
                      <td className="py-3 px-4 font-bold text-[#1E293B]">{f.patientName}</td>
                      <td className="py-3 px-4">{f.doctorName}</td>
                      <td className="py-3 px-4 text-[#147C8A] font-bold">{f.scheduledDate}</td>
                      <td className="py-3 px-4">
                        <select
                          value={f.status}
                          onChange={e => handleUpdateFollowupStatus(f.id, e.target.value)}
                          className="border rounded px-1.5 py-0.5 focus:outline-none bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                        >
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Scheduled">Scheduled</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Completed">Completed</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-[#64748B] max-w-[200px] truncate" title={f.notes}>{f.notes || 'N/A'}</td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => handleDeleteFollowup(f.id)} 
                          className="p-1.5 bg-[#F8FBFB] hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Cancel Appointment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 7: FEEDBACKS --- */}
      {subTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel: Submit Feedback */}
          <div className="lg:col-span-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-6 pb-2 border-b border-[#D7E8EA]">
              Submit Survey Feedback
            </h3>

            {/* Search Patient */}
            <form onSubmit={handleSearchPatient} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Patient name or UHID..."
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>
              <button type="submit" className="bg-[#147C8A] text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#0F6672] transition-colors">
                Search
              </button>
            </form>

            {patientResults.length > 0 && !selectedPatient && (
              <div className="mb-4 border border-[#D7E8EA] bg-[#F8FBFB] rounded-xl max-h-36 overflow-y-auto divide-y divide-[#D7E8EA]">
                {patientResults.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="p-2.5 hover:bg-white cursor-pointer flex justify-between items-center transition-colors text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#1E293B] block">{p.patientName}</span>
                      <span className="text-[10px] font-mono text-[#147C8A]">{p.uhid}</span>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-[#147C8A]" />
                  </div>
                ))}
              </div>
            )}

            {selectedPatient && (
              <div className="mb-4 p-3 bg-[#EAF7F8]/20 border border-[#D7E8EA]/50 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#64748B]">Feedback Patient:</span>
                  <strong className="block text-[#1E293B]">{selectedPatient.patientName} ({selectedPatient.uhid})</strong>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-[10px] hover:underline text-red-600 font-bold">Clear</button>
              </div>
            )}

            {/* Feedback Form */}
            <form onSubmit={handleCreateFeedback} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Hospital Rating Score *</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: val })}
                      className="p-1 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 transition-colors ${
                        val <= feedbackForm.rating ? 'fill-amber-400 text-amber-700' : 'text-[#64748B] hover:text-[#64748B]'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Review Comments *</label>
                <textarea rows={4} required value={feedbackForm.comments} onChange={e => setFeedbackForm({ ...feedbackForm, comments: e.target.value })} placeholder="Share details about the patient care experience..." className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-xs text-[#1E293B] placeholder-slate-605 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#147C8A] text-white hover:bg-[#0F6672] hover:text-[#1E293B] font-bold rounded-xl text-xs transition-colors">
                <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </form>
          </div>

          {/* Right panel: Rating Summary & List */}
          <div className="lg:col-span-8 space-y-6 flex flex-col h-[520px]">
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Average Satisfaction Score</span>
                <h3 className="text-3xl font-bold text-[#147C8A] mt-1 font-mono flex items-center space-x-2">
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="text-[#64748B] text-xl font-normal">/ 5.0</span>
                </h3>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(val => (
                  <Star key={val} className={`w-5 h-5 ${
                    val <= Math.round(averageRating) ? 'fill-amber-400 text-amber-700' : 'text-[#1E293B]'
                  }`} />
                ))}
              </div>
            </div>

            <div className="flex-1 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              <h4 className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Patient Reviews Feed</h4>
              {feedbacksList.length === 0 ? (
                <p className="py-8 text-center text-[#64748B] text-xs">No feedback reviews recorded yet.</p>
              ) : (
                feedbacksList.map(f => (
                  <div key={f.id} className="p-4 bg-[#F8FBFB]/20 border border-[#D7E8EA] rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-[#1E293B] text-xs block">{f.patientName}</span>
                        <span className="text-[9px] font-mono text-[#64748B]">{f.uhid}</span>
                      </div>
                      <div className="flex space-x-0.5 text-amber-700 font-bold">
                        {Array.from({ length: f.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">{f.comments}</p>
                    <span className="text-[9px] text-[#64748B] block text-right mt-1">{f.submissionDate.split('T')[0]}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 8: AWARENESS BROADCASTS --- */}
      {subTab === 'campaigns' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel: Create Campaign */}
          <div className="lg:col-span-5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-6 pb-2 border-b border-[#D7E8EA]">
              Compose Outreach Broadcast
            </h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Campaign Title *</label>
                <input type="text" required value={campaignForm.title} onChange={e => setCampaignForm({ ...campaignForm, title: e.target.value })} placeholder="e.g. Free Cardiology Check-up Drive" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] placeholder-slate-650 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Target Audience Group *</label>
                <select value={campaignForm.targetGroup} onChange={e => setCampaignForm({ ...campaignForm, targetGroup: e.target.value })} className="w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors">
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="All">All Registered Patient Demographic Directory</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="OP">OP Outpatients Only</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="IP">IP Inpatients Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Broadcast Message *</label>
                <textarea rows={5} required value={campaignForm.messageText} onChange={e => setCampaignForm({ ...campaignForm, messageText: e.target.value })} placeholder="Write campaign SMS/WhatsApp broadcast body..." className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] placeholder-slate-650 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#147C8A] text-white hover:bg-[#0F6672] hover:text-[#1E293B] font-bold rounded-xl text-xs transition-colors">
                Create Campaign Draft
              </button>
            </form>
          </div>

          {/* Right panel: Campaigns list */}
          <div className="lg:col-span-7 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col h-[520px]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-6 pb-2 border-b border-[#D7E8EA]">
              Awareness Campaign Registry
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200 font-medium">
              {campaignsList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#64748B] text-center">
                  <Send className="w-8 h-8 mb-2 opacity-45" />
                  <p className="text-xs">No health campaigns recorded.</p>
                </div>
              ) : (
                campaignsList.map(c => (
                  <div key={c.id} className="p-4 bg-white border border-[#D7E8EA] rounded-xl flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#1E293B] text-xs">{c.title}</h4>
                        <span className="text-[9px] text-[#64748B] uppercase font-semibold">Target: {c.targetGroup}</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        c.status === 'Sent' ? 'bg-green-50 text-emerald-700' : 'bg-[#EAF7F8] text-[#64748B]'
                      }`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-[#64748B] whitespace-pre-wrap">{c.messageText}</p>
                    {c.status === 'Draft' ? (
                      <button
                        onClick={() => handleSendCampaign(c.id)}
                        disabled={loading}
                        className="w-full py-1.5 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-lg text-[10px] transition-colors"
                      >
                        Launch Broadcast
                      </button>
                    ) : (
                      <div className="text-[9px] text-[#64748B] text-right font-mono">Launched: {c.launchDate ? c.launchDate.split('T')[0] : 'n/a'}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
