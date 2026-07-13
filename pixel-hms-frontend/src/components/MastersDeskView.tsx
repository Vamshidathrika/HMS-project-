import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import { 
  Building2, 
  Inbox, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Stethoscope, 
  Layers, 
  Bed, 
  ClipboardList, 
  Pill 
} from 'lucide-react';

interface Department {
  id: number;
  deptCode: string;
  deptName: string;
  deptType: string;
  isActive: boolean;
}

interface Doctor {
  id: number;
  doctorCode: string;
  name: string;
  qualification: string;
  specialization: string;
  consultingFee: number;
  department?: Department | null;
  mobile: string;
  email: string;
}

interface Ward {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

interface BedEntity {
  id: number;
  bedNumber: string;
  roomType: string;
  status: string;
  ward?: Ward | null;
}

interface TestMaster {
  id: number;
  testCode: string;
  testName: string;
  testCategory: string;
  price: number;
  isActive: boolean;
}

interface Medicine {
  id: number;
  drugCode: string;
  drugName: string;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
  unitPrice: number;
  purchasePrice: number;
}
export default function MastersDeskView() {
  const [activeSubTab, setActiveSubTab] = useState<'depts' | 'doctors' | 'wards' | 'beds' | 'tests' | 'medicines'>('depts');

  // Master Lists
  const [depts, setDepts] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<BedEntity[]>([]);
  const [tests, setTests] = useState<TestMaster[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Department Form
  const [deptForm, setDeptForm] = useState({ deptCode: '', deptName: '', deptType: 'Clinical', isActive: true });
  // Doctor Form
  const [docForm, setDocForm] = useState({ doctorCode: '', name: '', qualification: '', specialization: '', consultingFee: 500, departmentId: '', mobile: '', email: '' });
  // Ward Form
  const [wardForm, setWardForm] = useState({ code: '', name: '', isActive: true });
  // Bed Form
  const [bedForm, setBedForm] = useState({ bedNumber: '', roomType: 'General', status: 'Available', wardId: '' });
  // Test Form
  const [testForm, setTestForm] = useState({ testCode: '', testName: '', testCategory: 'Lab', price: 200, isActive: true });
  // Medicine Form
  const [medForm, setMedForm] = useState({ drugCode: '', drugName: '', batchNumber: '', expiryDate: '', currentStock: 100, unitPrice: 10, purchasePrice: 6 });

  // UI notifications
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const triggerMessage = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  // FETCHERS
  const fetchDepts = async () => {
    try {
      const res = await fetch('/api/v1/masters/departments', { headers: getHeaders() });
      if (res.ok) setDepts(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/v1/masters/doctors', { headers: getHeaders() });
      if (res.ok) setDoctors(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchWards = async () => {
    try {
      const res = await fetch('/api/v1/masters/wards', { headers: getHeaders() });
      if (res.ok) setWards(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchBeds = async () => {
    try {
      const res = await fetch('/api/v1/masters/beds', { headers: getHeaders() });
      if (res.ok) setBeds(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/v1/masters/tests', { headers: getHeaders() });
      if (res.ok) setTests(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/v1/masters/medicines', { headers: getHeaders() });
      if (res.ok) setMedicines(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchDepts();
    fetchDoctors();
    fetchWards();
    fetchBeds();
    fetchTests();
    fetchMedicines();
  }, [activeSubTab]);

  // DELETES
  const handleDelete = async (endpoint: string, id: number) => {
    if (!confirm('Are you sure you want to delete this master entry?')) return;
    try {
      const res = await fetch(`/api/v1/masters/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        triggerMessage('success', 'Entry deleted successfully.');
        refreshCurrentTab();
      } else {
        triggerMessage('error', 'Failed to delete entry.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    }
  };

  const refreshCurrentTab = () => {
    if (activeSubTab === 'depts') fetchDepts();
    else if (activeSubTab === 'doctors') fetchDoctors();
    else if (activeSubTab === 'wards') fetchWards();
    else if (activeSubTab === 'beds') fetchBeds();
    else if (activeSubTab === 'tests') fetchTests();
    else if (activeSubTab === 'medicines') fetchMedicines();
  };

  // SUBMITS (CREATE / UPDATE)
  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId ? `/api/v1/masters/departments/${editingId}` : '/api/v1/masters/departments';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(deptForm)
      });
      if (res.ok) {
        triggerMessage('success', `Department ${editingId ? 'updated' : 'created'} successfully!`);
        setDeptForm({ deptCode: '', deptName: '', deptType: 'Clinical', isActive: true });
        setEditingId(null);
        fetchDepts();
      } else {
        triggerMessage('error', 'Failed to submit department.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId ? `/api/v1/masters/doctors/${editingId}` : '/api/v1/masters/doctors';
    const method = editingId ? 'PUT' : 'POST';
    const payload = {
      ...docForm,
      department: docForm.departmentId ? { id: Number(docForm.departmentId) } : null
    };
    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        triggerMessage('success', `Doctor ${editingId ? 'updated' : 'created'} successfully!`);
        setDocForm({ doctorCode: '', name: '', qualification: '', specialization: '', consultingFee: 500, departmentId: '', mobile: '', email: '' });
        setEditingId(null);
        fetchDoctors();
      } else {
        triggerMessage('error', 'Failed to submit doctor.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleWardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId ? `/api/v1/masters/wards/${editingId}` : '/api/v1/masters/wards';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(wardForm)
      });
      if (res.ok) {
        triggerMessage('success', `Ward ${editingId ? 'updated' : 'created'} successfully!`);
        setWardForm({ code: '', name: '', isActive: true });
        setEditingId(null);
        fetchWards();
      } else {
        triggerMessage('error', 'Failed to submit ward.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleBedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId ? `/api/v1/masters/beds/${editingId}` : '/api/v1/masters/beds';
    const method = editingId ? 'PUT' : 'POST';
    const payload = {
      ...bedForm,
      ward: bedForm.wardId ? { id: Number(bedForm.wardId) } : null
    };
    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        triggerMessage('success', `Bed ${editingId ? 'updated' : 'created'} successfully!`);
        setBedForm({ bedNumber: '', roomType: 'General', status: 'Available', wardId: '' });
        setEditingId(null);
        fetchBeds();
      } else {
        triggerMessage('error', 'Failed to submit bed.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId ? `/api/v1/masters/tests/${editingId}` : '/api/v1/masters/tests';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(testForm)
      });
      if (res.ok) {
        triggerMessage('success', `Investigation ${editingId ? 'updated' : 'created'} successfully!`);
        setTestForm({ testCode: '', testName: '', testCategory: 'Lab', price: 200, isActive: true });
        setEditingId(null);
        fetchTests();
      } else {
        triggerMessage('error', 'Failed to submit test.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId ? `/api/v1/masters/medicines/${editingId}` : '/api/v1/masters/medicines';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(medForm)
      });
      if (res.ok) {
        triggerMessage('success', `Medicine ${editingId ? 'updated' : 'created'} successfully!`);
        setMedForm({ drugCode: '', drugName: '', batchNumber: '', expiryDate: '', currentStock: 100, unitPrice: 10, purchasePrice: 6 });
        setEditingId(null);
        fetchMedicines();
      } else {
        triggerMessage('error', 'Failed to submit drug item.');
      }
    } catch (e) {
      triggerMessage('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  // EDIT ACTIVATORS
  const startDeptEdit = (d: Department) => {
    setEditingId(d.id);
    setDeptForm({ deptCode: d.deptCode, deptName: d.deptName, deptType: d.deptType, isActive: d.isActive });
  };

  const startDocEdit = (doc: Doctor) => {
    setEditingId(doc.id);
    setDocForm({
      doctorCode: doc.doctorCode,
      name: doc.name,
      qualification: doc.qualification,
      specialization: doc.specialization,
      consultingFee: doc.consultingFee,
      departmentId: doc.department ? doc.department.id.toString() : '',
      mobile: doc.mobile,
      email: doc.email
    });
  };

  const startWardEdit = (w: Ward) => {
    setEditingId(w.id);
    setWardForm({ code: w.code, name: w.name, isActive: w.isActive });
  };

  const startBedEdit = (b: BedEntity) => {
    setEditingId(b.id);
    setBedForm({
      bedNumber: b.bedNumber,
      roomType: b.roomType,
      status: b.status,
      wardId: b.ward ? b.ward.id.toString() : ''
    });
  };

  const startTestEdit = (t: TestMaster) => {
    setEditingId(t.id);
    setTestForm({ testCode: t.testCode, testName: t.testName, testCategory: t.testCategory, price: t.price, isActive: t.isActive });
  };

  const startMedEdit = (m: Medicine) => {
    setEditingId(m.id);
    setMedForm({
      drugCode: m.drugCode,
      drugName: m.drugName,
      batchNumber: m.batchNumber,
      expiryDate: m.expiryDate || '',
      currentStock: m.currentStock,
      unitPrice: m.unitPrice,
      purchasePrice: m.purchasePrice
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide flex items-center space-x-2">
          <Layers className="w-6 h-6 text-[#147C8A]" />
          <span>Masters Data Desk</span>
        </h1>
        <p className="text-sm text-[#64748B]">Manage hospital clinical departments, doctor lists, ward beds, investigations catalog, and pharmacy catalog.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#F8FBFB] p-1 rounded-xl border border-[#D7E8EA] overflow-x-auto">
        {[
          { id: 'depts', name: 'Departments', icon: Building2 },
          { id: 'doctors', name: 'Doctors', icon: Stethoscope },
          { id: 'wards', name: 'Wards', icon: Inbox },
          { id: 'beds', name: 'Beds', icon: Bed },
          { id: 'tests', name: 'Investigations', icon: ClipboardList },
          { id: 'medicines', name: 'Medicines', icon: Pill },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveSubTab(t.id as any);
              setEditingId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeSubTab === t.id ? 'bg-[#147C8A] text-white shadow-md' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      {msg.text && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-sm animate-fade-in ${
          msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Grid: Form and Directory List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Action Form */}
        <div className="lg:col-span-4 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-6 pb-2 border-b border-[#D7E8EA]">
            {editingId ? 'Edit Entry Record' : 'Create New Entry'}
          </h3>

          {/* DEPARTMENT FORM */}
          {activeSubTab === 'depts' && (
            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Dept Code *</label>
                <input type="text" required value={deptForm.deptCode} onChange={e => setDeptForm({ ...deptForm, deptCode: e.target.value })} placeholder="e.g. CARD" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Dept Name *</label>
                <input type="text" required value={deptForm.deptName} onChange={e => setDeptForm({ ...deptForm, deptName: e.target.value })} placeholder="e.g. Cardiology" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Dept Type *</label>
                <select value={deptForm.deptType} onChange={e => setDeptForm({ ...deptForm, deptType: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors">
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Clinical">Clinical</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Non-Clinical">Non-Clinical</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Administrative">Administrative</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="isActive" checked={deptForm.isActive} onChange={e => setDeptForm({ ...deptForm, isActive: e.target.checked })} className="rounded bg-[#F8FBFB] border-[#D7E8EA] text-[#147C8A] focus:ring-0 focus:ring-offset-0" />
                <label htmlFor="isActive" className="text-xs font-semibold text-[#64748B]">Active status</label>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#147C8A] text-white hover:text-[#1E293B] hover:bg-[#0F6672] font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2">
                <span>{editingId ? 'Save Changes' : 'Create Department'}</span>
              </button>
            </form>
          )}

          {/* DOCTOR FORM */}
          {activeSubTab === 'doctors' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Doc Code *</label>
                <input type="text" required value={docForm.doctorCode} onChange={e => setDocForm({ ...docForm, doctorCode: e.target.value })} placeholder="e.g. DOC005" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Doctor Name *</label>
                <input type="text" required value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} placeholder="e.g. Dr. John Doe" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Qualification *</label>
                  <input type="text" required value={docForm.qualification} onChange={e => setDocForm({ ...docForm, qualification: e.target.value })} placeholder="MD" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Specialization *</label>
                  <input type="text" required value={docForm.specialization} onChange={e => setDocForm({ ...docForm, specialization: e.target.value })} placeholder="Cardio" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Consulting Fee *</label>
                  <input type="number" required value={docForm.consultingFee} onChange={e => setDocForm({ ...docForm, consultingFee: Number(e.target.value) })} className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Department *</label>
                  <select required value={docForm.departmentId} onChange={e => setDocForm({ ...docForm, departmentId: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors">
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Dept</option>
                    {depts.map(d => <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={d.id} value={d.id}>{d.deptName}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Mobile *</label>
                <input type="tel" required value={docForm.mobile} onChange={e => setDocForm({ ...docForm, mobile: e.target.value })} placeholder="Mobile" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Email</label>
                <input type="email" value={docForm.email} onChange={e => setDocForm({ ...docForm, email: e.target.value })} placeholder="email@hospital.com" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#147C8A] text-white hover:text-[#1E293B] hover:bg-[#0F6672] font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2">
                <span>{editingId ? 'Save Changes' : 'Create Doctor'}</span>
              </button>
            </form>
          )}

          {/* WARD FORM */}
          {activeSubTab === 'wards' && (
            <form onSubmit={handleWardSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Ward Code *</label>
                <input type="text" required value={wardForm.code} onChange={e => setWardForm({ ...wardForm, code: e.target.value })} placeholder="e.g. ICU" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Ward Name *</label>
                <input type="text" required value={wardForm.name} onChange={e => setWardForm({ ...wardForm, name: e.target.value })} placeholder="e.g. Intensive Care Unit" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="wardActive" checked={wardForm.isActive} onChange={e => setWardForm({ ...wardForm, isActive: e.target.checked })} className="rounded bg-[#F8FBFB] border-[#D7E8EA] text-[#147C8A] focus:ring-0 focus:ring-offset-0" />
                <label htmlFor="wardActive" className="text-xs font-semibold text-[#64748B]">Active status</label>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#147C8A] text-white hover:text-[#1E293B] hover:bg-[#0F6672] font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2">
                <span>{editingId ? 'Save Changes' : 'Create Ward'}</span>
              </button>
            </form>
          )}

          {/* BED FORM */}
          {activeSubTab === 'beds' && (
            <form onSubmit={handleBedSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Bed Number *</label>
                <input type="text" required value={bedForm.bedNumber} onChange={e => setBedForm({ ...bedForm, bedNumber: e.target.value })} placeholder="e.g. Bed-101" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Room Type *</label>
                <select value={bedForm.roomType} onChange={e => setBedForm({ ...bedForm, roomType: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors">
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="General">General</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="SemiPrivate">Semi-Private</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Private">Private</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="ICU">ICU</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Status *</label>
                <select value={bedForm.status} onChange={e => setBedForm({ ...bedForm, status: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors">
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Available">Available</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Occupied">Occupied</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Ward Location *</label>
                <select required value={bedForm.wardId} onChange={e => setBedForm({ ...bedForm, wardId: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors">
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">Select Ward</option>
                  {wards.map(w => <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#147C8A] text-white hover:text-[#1E293B] hover:bg-[#0F6672] font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2">
                <span>{editingId ? 'Save Changes' : 'Create Bed'}</span>
              </button>
            </form>
          )}

          {/* TEST FORM */}
          {activeSubTab === 'tests' && (
            <form onSubmit={handleTestSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Test Code *</label>
                <input type="text" required value={testForm.testCode} onChange={e => setTestForm({ ...testForm, testCode: e.target.value })} placeholder="e.g. CBC" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Test Name *</label>
                <input type="text" required value={testForm.testName} onChange={e => setTestForm({ ...testForm, testName: e.target.value })} placeholder="e.g. Complete Blood Count" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Category *</label>
                <select value={testForm.testCategory} onChange={e => setTestForm({ ...testForm, testCategory: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors">
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Lab">Lab / Blood / Pathology</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Imaging">Imaging / X-Ray / CT Scan</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Pathology">Pathology Tissue Biopsy</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Price (INR) *</label>
                <input type="number" required value={testForm.price} onChange={e => setTestForm({ ...testForm, price: Number(e.target.value) })} className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="testActive" checked={testForm.isActive} onChange={e => setTestForm({ ...testForm, isActive: e.target.checked })} className="rounded bg-[#F8FBFB] border-[#D7E8EA] text-[#147C8A] focus:ring-0 focus:ring-offset-0" />
                <label htmlFor="testActive" className="text-xs font-semibold text-[#64748B]">Active status</label>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#147C8A] text-white hover:text-[#1E293B] hover:bg-[#0F6672] font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2">
                <span>{editingId ? 'Save Changes' : 'Create Investigation'}</span>
              </button>
            </form>
          )}

          {/* MEDICINE FORM */}
          {activeSubTab === 'medicines' && (
            <form onSubmit={handleMedSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Drug Code *</label>
                <input type="text" required value={medForm.drugCode} onChange={e => setMedForm({ ...medForm, drugCode: e.target.value })} placeholder="e.g. DRG001" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Drug Name *</label>
                <input type="text" required value={medForm.drugName} onChange={e => setMedForm({ ...medForm, drugName: e.target.value })} placeholder="e.g. Paracetamol 650mg" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Batch *</label>
                  <input type="text" required value={medForm.batchNumber} onChange={e => setMedForm({ ...medForm, batchNumber: e.target.value })} placeholder="BAT-XYZ" className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Expiry Date *</label>
                  <input type="date" required value={medForm.expiryDate} onChange={e => setMedForm({ ...medForm, expiryDate: e.target.value })} className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Initial Stock *</label>
                <input type="number" required value={medForm.currentStock} onChange={e => setMedForm({ ...medForm, currentStock: Number(e.target.value) })} className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Sale Price *</label>
                  <input type="number" required value={medForm.unitPrice} onChange={e => setMedForm({ ...medForm, unitPrice: Number(e.target.value) })} className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase">Purchase Cost *</label>
                  <input type="number" required value={medForm.purchasePrice} onChange={e => setMedForm({ ...medForm, purchasePrice: Number(e.target.value) })} className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#147C8A] text-white hover:text-[#1E293B] hover:bg-[#0F6672] font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2">
                <span>{editingId ? 'Save Changes' : 'Create Drug Item'}</span>
              </button>
            </form>
          )}

          {/* Cancel Edit Button */}
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setDeptForm({ deptCode: '', deptName: '', deptType: 'Clinical', isActive: true });
                setDocForm({ doctorCode: '', name: '', qualification: '', specialization: '', consultingFee: 500, departmentId: '', mobile: '', email: '' });
                setWardForm({ code: '', name: '', isActive: true });
                setBedForm({ bedNumber: '', roomType: 'General', status: 'Available', wardId: '' });
                setTestForm({ testCode: '', testName: '', testCategory: 'Lab', price: 200, isActive: true });
                setMedForm({ drugCode: '', drugName: '', batchNumber: '', expiryDate: '', currentStock: 100, unitPrice: 10, purchasePrice: 6 });
              }}
              className="mt-3 w-full py-2 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#1E293B] font-bold rounded-xl text-xs transition-colors"
            >
              Cancel Edit Mode
            </button>
          )}
        </div>

        {/* Right: Directory list of entries */}
        <div className="lg:col-span-8 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#D7E8EA]">
            <h3 className="font-bold text-[#1E293B] flex items-center space-x-2">
              <Search className="w-4 h-4 text-[#147C8A]" />
              <span>Registered Directory</span>
            </h3>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search listings..."
              className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-3 py-1 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] w-48"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {/* DEPARTMENTS LIST */}
            {activeSubTab === 'depts' && depts
              .filter(d => d.deptName.toLowerCase().includes(searchQuery.toLowerCase()) || d.deptCode.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(d => (
                <div key={d.id} className="p-4 bg-[#F8FBFB]/20 border border-[#D7E8EA] rounded-2xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">{d.deptName}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FBFB] text-[#147C8A] font-bold uppercase mr-2">{d.deptCode}</span>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold">{d.deptType}</span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startDeptEdit(d)} className="p-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8]/40 text-[#147C8A] rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete('departments', d.id)} className="p-1.5 bg-[#F8FBFB] hover:bg-red-50 text-rose-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}

            {/* DOCTORS LIST */}
            {activeSubTab === 'doctors' && doctors
              .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(doc => (
                <div key={doc.id} className="p-4 bg-[#F8FBFB]/20 border border-[#D7E8EA] rounded-2xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">{doc.name}</h4>
                    <p className="text-xs text-[#64748B]">{doc.qualification} | {doc.specialization}</p>
                    <div className="mt-2 flex items-center space-x-3 text-[10px]">
                      <span className="font-mono text-[#147C8A] font-bold">{doc.doctorCode}</span>
                      <span className="text-[#64748B]">Dept: {doc.department ? doc.department.deptName : 'General'}</span>
                      <span className="text-emerald-700 font-bold">Fee: INR {doc.consultingFee}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startDocEdit(doc)} className="p-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8]/40 text-[#147C8A] rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete('doctors', doc.id)} className="p-1.5 bg-[#F8FBFB] hover:bg-red-50 text-rose-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}

            {/* WARDS LIST */}
            {activeSubTab === 'wards' && wards
              .filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.code.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(w => (
                <div key={w.id} className="p-4 bg-[#F8FBFB]/20 border border-[#D7E8EA] rounded-2xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">{w.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FBFB] text-[#147C8A] font-bold uppercase">{w.code}</span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startWardEdit(w)} className="p-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8]/40 text-[#147C8A] rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete('wards', w.id)} className="p-1.5 bg-[#F8FBFB] hover:bg-red-50 text-rose-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}

            {/* BEDS LIST */}
            {activeSubTab === 'beds' && beds
              .filter(b => b.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) || b.roomType.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(b => (
                <div key={b.id} className="p-4 bg-[#F8FBFB]/20 border border-[#D7E8EA] rounded-2xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">{b.bedNumber}</h4>
                    <p className="text-xs text-[#64748B]">{b.roomType} room | Ward ID: {b.ward ? b.ward.name : 'Unassigned'}</p>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      b.status === 'Available' ? 'bg-green-50 text-emerald-700' :
                      b.status === 'Occupied' ? 'bg-[#EAF7F8] text-[#147C8A]' : 'bg-amber-100 text-amber-700'
                    }`}>{b.status}</span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startBedEdit(b)} className="p-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8]/40 text-[#147C8A] rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete('beds', b.id)} className="p-1.5 bg-[#F8FBFB] hover:bg-red-50 text-rose-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}

            {/* TESTS LIST */}
            {activeSubTab === 'tests' && tests
              .filter(t => t.testName.toLowerCase().includes(searchQuery.toLowerCase()) || t.testCode.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(t => (
                <div key={t.id} className="p-4 bg-[#F8FBFB]/20 border border-[#D7E8EA] rounded-2xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">{t.testName}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FBFB] text-[#147C8A] font-bold uppercase mr-2">{t.testCode}</span>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold mr-2">{t.testCategory}</span>
                    <span className="text-emerald-700 text-xs font-bold font-mono">INR {t.price}</span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startTestEdit(t)} className="p-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8]/40 text-[#147C8A] rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete('tests', t.id)} className="p-1.5 bg-[#F8FBFB] hover:bg-red-50 text-rose-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}

            {/* MEDICINES LIST */}
            {activeSubTab === 'medicines' && medicines
              .filter(m => m.drugName.toLowerCase().includes(searchQuery.toLowerCase()) || m.drugCode.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(m => (
                <div key={m.id} className="p-4 bg-[#F8FBFB]/20 border border-[#D7E8EA] rounded-2xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">{m.drugName}</h4>
                    <p className="text-xs text-[#64748B]">Batch: {m.batchNumber} | Expiry: {m.expiryDate}</p>
                    <div className="mt-2 flex items-center space-x-3 text-[10px]">
                      <span className="font-mono text-[#147C8A] font-bold">{m.drugCode}</span>
                      <span className={`font-bold ${m.currentStock < 50 ? 'text-rose-700 animate-pulse' : 'text-[#64748B]'}`}>Stock: {m.currentStock} qty</span>
                      <span className="text-emerald-700 font-bold">Price: INR {m.unitPrice}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startMedEdit(m)} className="p-1.5 bg-[#F8FBFB] hover:bg-[#EAF7F8]/40 text-[#147C8A] rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete('medicines', m.id)} className="p-1.5 bg-[#F8FBFB] hover:bg-red-50 text-rose-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}
