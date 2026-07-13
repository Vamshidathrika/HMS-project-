import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import { 
  Users, 
  ShieldAlert, 
  MessageSquare, 
  Plus, 
  Trash2, 
  QrCode, 
  Wifi, 
  WifiOff, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Check, 
  Send,
  Settings
} from 'lucide-react';

interface User {
  id?: number;
  username: string;
  role: string;
  fullName: string;
  isActive: boolean;
}

interface AuditLog {
  id: number;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE';
}

interface WhatsAppTemplate {
  id?: number;
  name: string;
  templateText: string;
  isActive: boolean;
}

interface WhatsAppLog {
  id: number;
  timestamp: string;
  uhid: string;
  patientName: string;
  mobile: string;
  messageText: string;
  templateName: string;
  status: 'Sent' | 'Delivered' | 'Read' | 'Failed';
  errorMessage?: string;
}

export default function SettingsDeskView() {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit' | 'whatsapp' | 'config'>('users');

  // HSS System Configuration state
  const [hospitalName, setHospitalName] = useState(() => localStorage.getItem('hms_hospital_name') || 'ASHIRWAD');
  const [hospitalTagline, setHospitalTagline] = useState(() => localStorage.getItem('hms_tagline') || 'Hospital Companion');
  const [hospitalAddress, setHospitalAddress] = useState(() => localStorage.getItem('hms_hospital_address') || 'Saraswati Nagar, Road No. 2, Opp. Dist. Co-operative Bank, Nizamabad');
  const [hospitalPhone, setHospitalPhone] = useState(() => localStorage.getItem('hms_hospital_phone') || '08462-252322, 220322, 9515511633');
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('hms_theme_color') || 'sky');
  const [ponytailEnabled, setPonytailEnabled] = useState(() => localStorage.getItem('hms_ponytail_enabled') === 'true');
  const [headroomEnabled, setHeadroomEnabled] = useState(() => localStorage.getItem('hms_headroom_enabled') === 'true');
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('hms_hospital_name', hospitalName);
    localStorage.setItem('hms_tagline', hospitalTagline);
    localStorage.setItem('hms_hospital_address', hospitalAddress);
    localStorage.setItem('hms_hospital_phone', hospitalPhone);
    localStorage.setItem('hms_theme_color', themeColor);
    localStorage.setItem('hms_ponytail_enabled', String(ponytailEnabled));
    localStorage.setItem('hms_headroom_enabled', String(headroomEnabled));
    
    // Dispatch event to update App.tsx immediately
    window.dispatchEvent(new Event('hms_config_changed'));
    
    setConfigSuccessMsg('System configuration saved and applied successfully!');
    setTimeout(() => setConfigSuccessMsg(''), 4000);
  };

  // Users Management state
  const [usersList, setUsersList] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'FrontDesk',
    fullName: '',
  });
  const [userSuccessMsg, setUserSuccessMsg] = useState('');
  const [userErrorMsg, setUserErrorMsg] = useState('');

  // Audit Logs state
  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState('');
  const [isRefreshingAudit, setIsRefreshingAudit] = useState(false);

  // WhatsApp Companion state
  const [waConnected, setWaConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [waTemplates, setWaTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateText, setTemplateText] = useState('');
  const [waLogs, setWaLogs] = useState<WhatsAppLog[]>([]);
  const [waSuccessMsg, setWaSuccessMsg] = useState('');



  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/auth/users', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSuccessMsg('');
    setUserErrorMsg('');
    try {
      const res = await fetch('/api/v1/auth/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setUserSuccessMsg(`User ${newUser.username} created successfully!`);
        setNewUser({
          username: '',
          password: '',
          role: 'FrontDesk',
          fullName: '',
        });
        fetchUsers();
      } else {
        const err = await res.json();
        setUserErrorMsg(err.error || 'Failed to create user');
      }
    } catch (err) {
      setUserErrorMsg('Network error creating user');
    }
  };

  // Delete User
  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/v1/auth/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setIsRefreshingAudit(true);
    try {
      const res = await fetch('/api/v1/audit-logs', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAuditLogsList(data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsRefreshingAudit(false);
    }
  };

  // Fetch WhatsApp Status, Templates, and Logs
  const fetchWhatsAppStatus = async () => {
    try {
      const res = await fetch('/api/v1/whatsapp/status', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setWaConnected(data.connected);
      }
    } catch (err) {
      console.error('Error fetching whatsapp status:', err);
    }
  };

  const fetchWhatsAppTemplates = async () => {
    try {
      const res = await fetch('/api/v1/whatsapp/templates', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setWaTemplates(data);
        if (data.length > 0 && !selectedTemplate) {
          setSelectedTemplate(data[0]);
          setTemplateText(data[0].templateText);
        }
      }
    } catch (err) {
      console.error('Error fetching whatsapp templates:', err);
    }
  };

  const fetchWhatsAppLogs = async () => {
    try {
      const res = await fetch('/api/v1/whatsapp/logs', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setWaLogs(data);
      }
    } catch (err) {
      console.error('Error fetching whatsapp logs:', err);
    }
  };

  // Connect WhatsApp Client (Simulated QR Scan)
  const handleSimulateQRScan = async () => {
    setScanning(true);
    setScanMessage('Syncing with Virtual Client...');
    
    // Simulate WebSocket handshake and scan delay
    setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/whatsapp/connect', {
          method: 'POST',
          headers: getHeaders()
        });
        if (res.ok) {
          setWaConnected(true);
          setScanMessage('Connected!');
          setTimeout(() => {
            setScanning(false);
            setScanMessage('');
            fetchWhatsAppLogs();
          }, 1000);
        }
      } catch (err) {
        setScanning(false);
        alert('Failed to connect virtual scanner.');
      }
    }, 2000);
  };

  // Disconnect WhatsApp Client
  const handleDisconnectWhatsApp = async () => {
    try {
      const res = await fetch('/api/v1/whatsapp/disconnect', {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        setWaConnected(false);
        fetchWhatsAppLogs();
      }
    } catch (err) {
      console.error('Failed to disconnect WhatsApp:', err);
    }
  };

  // Save WhatsApp Template
  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    setWaSuccessMsg('');
    try {
      const res = await fetch('/api/v1/whatsapp/templates', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: selectedTemplate.name,
          templateText: templateText,
          isActive: selectedTemplate.isActive
        })
      });
      if (res.ok) {
        setWaSuccessMsg(`Template "${selectedTemplate.name}" saved!`);
        fetchWhatsAppTemplates();
      }
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  // Initial loads
  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
    fetchWhatsAppStatus();
    fetchWhatsAppTemplates();
    fetchWhatsAppLogs();
  }, []);

  // Filter audit logs
  const filteredAuditLogs = auditLogsList.filter(log => {
    const q = auditFilter.toLowerCase();
    return (
      log.username.toLowerCase().includes(q) ||
      log.role.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide flex items-center space-x-2">
          <span>Settings & Audit Trail Logs</span>
        </h1>
        <p className="text-sm text-[#64748B]">Manage user accounts (RBAC), view database audit trail journals, and configure automated WhatsApp messaging.</p>
      </div>

      {/* Subtab Navigation */}
      <div className="flex border-b border-[#D7E8EA] space-x-6 pb-2">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'users' ? 'border-[#147C8A] text-[#147C8A]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & RBAC</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab('audit');
            fetchAuditLogs();
          }}
          className={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'audit' ? 'border-[#147C8A] text-[#147C8A]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Audit Trail Journal</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab('whatsapp');
            fetchWhatsAppStatus();
            fetchWhatsAppTemplates();
            fetchWhatsAppLogs();
          }}
          className={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'whatsapp' ? 'border-[#147C8A] text-[#147C8A]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Companion</span>
        </button>
        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'config' ? 'border-[#147C8A] text-[#147C8A]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Config & Plugins</span>
        </button>
      </div>

      {/* Content Renderers */}
      
      {/* 1. USERS MANAGEMENT TAB */}
      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Add User form */}
          <div className="lg:col-span-5 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
            <h3 className="text-lg font-bold text-[#1E293B] mb-6 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-[#147C8A]" />
              <span>Create New User Profile</span>
            </h3>

            {userSuccessMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 mb-6 text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>{userSuccessMsg}</span>
              </div>
            )}

            {userErrorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 text-sm flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
                <span>{userErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748B] uppercase">Username *</label>
                <input 
                  type="text" 
                  required
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="e.g. nurse_jane"
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748B] uppercase">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={newUser.fullName}
                  onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748B] uppercase">Password *</label>
                <input 
                  type="password" 
                  required
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Create user password"
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748B] uppercase">Role Definition *</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                >
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="SuperAdmin">SuperAdmin</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="HospitalAdmin">HospitalAdmin</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="FrontDesk">FrontDesk</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Doctor">Doctor</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Nurse">Nurse</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Pharmacist">Pharmacist</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Accountant">Accountant</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Receptionist">Receptionist</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="LabTech">LabTech</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Radiologist">Radiologist</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl font-bold shadow-sm shadow-sky-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Register User Profile</span>
              </button>
            </form>
          </div>

          {/* Right: List Users */}
          <div className="lg:col-span-7 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col h-[480px]">
            <h3 className="text-lg font-bold text-[#1E293B] mb-6">Active User Registers</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {usersList.map(u => (
                <div 
                  key={u.username}
                  className="p-4 bg-[#EAF7F8]/20 border border-[#D7E8EA]/70 rounded-2xl flex justify-between items-center group"
                >
                  <div>
                    <h4 className="font-bold text-[#1E293B]">{u.fullName}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-xs text-[#147C8A] font-mono font-semibold">@{u.username}</code>
                      <span className="text-[10px] bg-[#F8FBFB] px-2 py-0.5 rounded text-[#147C8A] font-bold border border-[#D7E8EA]/35">
                        {u.role}
                      </span>
                    </div>
                  </div>

                  {u.username !== 'admin' && (
                    <button
                      onClick={() => u.id && handleDeleteUser(u.id)}
                      className="p-2 bg-white hover:bg-red-50 text-[#64748B] hover:text-rose-700 border border-[#D7E8EA] hover:border-red-200 rounded-xl transition-all"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. AUDIT TRAIL LOGS TAB */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-4 border-b border-[#D7E8EA]">
            {/* Search filter */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-[#64748B]" />
              <input 
                type="text"
                value={auditFilter}
                onChange={e => setAuditFilter(e.target.value)}
                placeholder="Filter logs by username, action, description..."
                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl pl-10 pr-4 py-2 text-sm text-[#1E293B] focus:outline-none"
              />
            </div>

            {/* Refresh btn */}
            <button
              onClick={fetchAuditLogs}
              disabled={isRefreshingAudit}
              className="px-4 py-2 bg-[#F8FBFB] border border-[#D7E8EA] hover:bg-[#F8FBFB] text-[#147C8A] rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingAudit ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Audit Logs table */}
          <div className="overflow-x-auto rounded-2xl border border-[#D7E8EA]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FBFB] text-[#64748B] text-xs font-bold uppercase border-b border-[#D7E8EA]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E8EA]/60 text-sm text-[#1E293B]">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#64748B]">
                      <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-45" />
                      No audit log records matching filter query.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#F8FBFB] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-[#64748B] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">
                        {log.username}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs bg-white px-2 py-0.5 rounded text-[#147C8A] font-bold border border-indigo-950">
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#147C8A]">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 text-xs max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                          log.status === 'SUCCESS' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-50 text-rose-700 border border-red-200'
                        }`}>
                          {log.status === 'SUCCESS' ? 'Success' : 'Failure'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#64748B]">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. WHATSAPP AUTOMATION TAB */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-8">
          
          {/* Top segment: Connection status & Scanner simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Connection Status panel */}
            <div className="lg:col-span-5 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col justify-between h-[360px]">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-2">WhatsApp client status</h3>
                <p className="text-xs text-[#64748B]">Sync with local WebSocket router to push alerts without paid API tokens.</p>
              </div>

              {/* Status Graphic */}
              <div className="my-6 flex items-center justify-center p-6 bg-[#EAF7F8]/20 rounded-2xl border border-[#D7E8EA] relative overflow-hidden">
                <div className={`absolute -inset-1 rounded-2xl opacity-10 blur-xl transition-all duration-1000 ${
                  waConnected ? 'bg-[#22C55E] animate-pulse' : 'bg-rose-500'
                }`} />
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                    waConnected ? 'bg-green-100 text-green-700 shadow-emerald-500/10' : 'bg-red-100 text-red-700 shadow-rose-500/10'
                  }`}>
                    {waConnected ? <Wifi className="w-8 h-8" /> : <WifiOff className="w-8 h-8" />}
                  </div>
                  <h4 className={`text-base font-bold uppercase tracking-wider mt-4 ${
                    waConnected ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {waConnected ? 'Connected & Listening' : 'Disconnected'}
                  </h4>
                  <p className="text-[10px] text-[#64748B] mt-1">Virtual Scanner Hook (WS://localhost:8080)</p>
                </div>
              </div>

              {/* Connect/Disconnect action buttons */}
              {waConnected ? (
                <button
                  onClick={handleDisconnectWhatsApp}
                  className="w-full py-2.5 bg-[#F8FBFB] hover:bg-[#F8FBFB] border border-[#D7E8EA] hover:border-[#D7E8EA] text-rose-700 rounded-xl text-sm font-bold transition-all"
                >
                  Disconnect Client Session
                </button>
              ) : (
                <button
                  onClick={handleSimulateQRScan}
                  disabled={scanning}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-[#1E293B] rounded-xl text-sm font-bold shadow-sm shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {scanning ? 'Initializing...' : 'Connect WhatsApp Session'}
                </button>
              )}
            </div>

            {/* QR Scanner simulator screen */}
            <div className="lg:col-span-7 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden h-[360px]">
              {scanning ? (
                <div className="flex flex-col items-center space-y-4 animate-pulse">
                  <div className="w-40 h-40 border-2 border-dashed border-emerald-500/40 rounded-2xl p-2 relative flex items-center justify-center bg-[#EAF7F8]">
                    <QrCode className="w-28 h-28 text-emerald-700 opacity-60" />
                    {/* Laser line effect */}
                    <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-bounce top-1/2" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-emerald-700 animate-pulse">{scanMessage}</span>
                    <p className="text-[10px] text-[#64748B] mt-1">Establish secure WebSocket transport...</p>
                  </div>
                </div>
              ) : waConnected ? (
                <div className="text-center space-y-3 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center shadow-sm shadow-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[#1E293B]">WebSocket Authentication Successful!</h4>
                    <p className="text-xs text-[#64748B] max-w-sm mt-1 mx-auto">Your device is linked. System will automatically push notifications to patient mobiles on registrations & billing events.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="w-40 h-40 border-2 border-[#D7E8EA] rounded-2xl p-3 bg-[#F8FBFB] relative group">
                    {/* Mock QR image */}
                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-[#64748B] relative overflow-hidden">
                      <QrCode className="w-32 h-32 text-[#64748B] opacity-80" />
                      <div className="absolute inset-0 bg-[#EAF7F8] backdrop-blur-[2px] flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                        <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider bg-white/90 border border-[#D7E8EA] rounded-lg py-1.5 px-3">
                          Device Standby
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1E293B]">Simulate WhatsApp QR Pairing</h4>
                    <p className="text-xs text-[#64748B] mt-1 max-w-xs">Scan this virtual signature with your hospital messaging application to connect.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom segment: Templates Manager & Transmission Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Template editor */}
            <div className="lg:col-span-5 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col h-[400px]">
              <h3 className="text-base font-bold text-[#1E293B] mb-4">Notification Templates</h3>
              
              <div className="flex space-x-2 mb-4">
                {waTemplates.map(t => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setSelectedTemplate(t);
                      setTemplateText(t.templateText);
                      setWaSuccessMsg('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedTemplate?.name === t.name 
                        ? 'bg-[#EAF7F8] text-[#147C8A] border-[#147C8A]/30' 
                        : 'bg-[#EAF7F8]/20 text-[#64748B] border-[#D7E8EA] hover:border-[#D7E8EA]'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs text-[#64748B] font-semibold uppercase">Template Content</label>
                    <textarea
                      value={templateText}
                      onChange={e => setTemplateText(e.target.value)}
                      className="w-full h-32 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl p-3 text-xs text-[#1E293B] placeholder-slate-650 focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] resize-none font-mono"
                    />
                    <span className="text-[10px] text-[#64748B] block">Available tags: {"{{name}}, {{uhid}}, {{doctor}}, {{token}}, {{invoice}}, {{amount}}, {{ward}}, {{bed}}"}</span>
                  </div>

                  {waSuccessMsg && (
                    <span className="text-xs text-emerald-700 font-bold block">{waSuccessMsg}</span>
                  )}

                  <button
                    onClick={handleSaveTemplate}
                    className="w-full py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Template Changes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Transmission Logs list */}
            <div className="lg:col-span-7 bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#D7E8EA]">
                <h3 className="text-base font-bold text-[#1E293B]">Transmission Message Logs</h3>
                <button
                  onClick={fetchWhatsAppLogs}
                  className="p-1.5 bg-[#F8FBFB] hover:bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg text-[#147C8A] transition-all"
                  title="Reload Logs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {waLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#64748B] text-center px-4">
                    <Send className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-xs">No notifications sent yet</p>
                    <p className="text-[10px] text-[#64748B] mt-1">Register a patient or generate bills to trigger triggers</p>
                  </div>
                ) : (
                  waLogs.map(log => (
                    <div 
                      key={log.id} 
                      className="p-3 bg-[#F8FBFB]/50 border border-[#D7E8EA] rounded-xl flex flex-col space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-[#1E293B]">{log.patientName}</strong>
                          <span className="text-[10px] text-[#64748B] block font-mono">UHID: {log.uhid} | Mob: {log.mobile}</span>
                        </div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                          log.status === 'Sent' ? 'bg-green-50 text-emerald-700 border-green-200' : 'bg-red-50 text-rose-700 border-red-200'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      
                      <p className="text-[#64748B] p-2 bg-[#F8FBFB] rounded border border-[#D7E8EA] font-mono text-[11px]">
                        {log.messageText}
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-[#64748B]">
                        <span>Template: {log.templateName}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. SYSTEM CONFIGURATION & PLUGINS TAB */}
      {activeSubTab === 'config' && (
        <div className="max-w-2xl bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md">
          <h3 className="text-lg font-bold text-[#1E293B] mb-6 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#147C8A]" />
            <span>Hospital Support System (HSS) Configuration</span>
          </h3>

          {configSuccessMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 mb-6 text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{configSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Hospital Name</label>
                <input 
                  type="text" 
                  required
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                  placeholder="e.g. ANTIGRAVITY HOSPITAL"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Tagline / Label</label>
                <input 
                  type="text" 
                  required
                  value={hospitalTagline}
                  onChange={e => setHospitalTagline(e.target.value)}
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                  placeholder="e.g. Hospital Companion"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Hospital Address</label>
                <input 
                  type="text" 
                  required
                  value={hospitalAddress}
                  onChange={e => setHospitalAddress(e.target.value)}
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                  placeholder="e.g. Saraswati Nagar, Nizamabad"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Hospital Phone</label>
                <input 
                  type="text" 
                  required
                  value={hospitalPhone}
                  onChange={e => setHospitalPhone(e.target.value)}
                  className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors"
                  placeholder="e.g. 08462-252322"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#147C8A] uppercase tracking-wider text-[10px]">Primary Theme Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'sky', name: 'Sky Blue', bg: 'bg-[#147C8A]' },
                  { id: 'emerald', name: 'Emerald', bg: 'bg-[#22C55E]' },
                  { id: 'indigo', name: 'Indigo', bg: 'bg-[#147C8A]' },
                  { id: 'amber', name: 'Amber', bg: 'bg-[#F59E0B]' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeColor(t.id)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center space-y-2 ${
                      themeColor === t.id 
                        ? 'border-[#147C8A] bg-[#EAF7F8] shadow-md shadow-sky-500/10' 
                        : 'border-[#D7E8EA] hover:border-[#D7E8EA] bg-[#F8FBFB]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${t.bg} shadow-inner`} />
                    <span className="text-xs font-bold text-[#1E293B]">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#D7E8EA]/65 pt-6 space-y-4">
              <h4 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-2">Application Plugins</h4>
              
              {/* Headroom Plugin Toggle */}
              <div className="p-4 bg-[#EAF7F8] border border-[#D7E8EA] rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-sm font-bold text-[#1E293B] block">Headroom Plugin</span>
                  <p className="text-xs text-[#64748B]">Enables sticky auto-hide header behavior on scroll and context-aware Turnaround Time (TAT) notifications.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHeadroomEnabled(!headroomEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-205 focus:outline-none ${
                    headroomEnabled ? 'bg-[#147C8A]' : 'bg-[#F8FBFB]'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-205 ${
                    headroomEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Ponytail Plugin Toggle */}
              <div className="p-4 bg-[#EAF7F8] border border-[#D7E8EA] rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-sm font-bold text-[#1E293B] block">Ponytail Plugin</span>
                  <p className="text-xs text-[#64748B]">Enables Doctor Consulting Waiting Time dashboard card, Clinic Consulting Queue panels, and Bed Occupancy stats.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPonytailEnabled(!ponytailEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-205 focus:outline-none ${
                    ponytailEnabled ? 'bg-[#147C8A]' : 'bg-[#F8FBFB]'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-205 ${
                    ponytailEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-700 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-sm shadow-sky-500/20 hover:shadow-sky-500/35 transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Save & Apply Configuration</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
