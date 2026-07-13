import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import {
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: string;
  fullName: string;
  isActive: boolean;
}

export default function HRStaffView() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add User State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'FrontDesk',
    fullName: '',
  });
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/users', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to retrieve system user lists');
      const data = await res.json();
      setUsersList(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching staff database');
    } fontName: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserSuccess('');
    
    if (!newUser.username.trim() || !newUser.password.trim() || !newUser.fullName.trim()) {
      setAddUserError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newUser)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to register new system user');
      }

      setAddUserSuccess(`User ${newUser.username} registered successfully!`);
      setNewUser({
        username: '',
        password: '',
        role: 'FrontDesk',
        fullName: '',
      });
      fetchUsers();
      setTimeout(() => {
        setIsAddUserOpen(false);
        setAddUserSuccess('');
      }, 1500);
    } catch (err: any) {
      setAddUserError(err.message || 'Error creating user credentials');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to revoke system credentials for this staff member?')) return;
    setError('');
    try {
      const res = await fetch(`/api/v1/auth/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to revoke credentials');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error deleting user');
    }
  };

  const filteredUsers = usersList.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-[#D7E8EA] mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center space-x-2">
            <Users className="text-[#147C8A] w-7 h-7" />
            <span>HR & Staff Console</span>
          </h1>
          <p className="text-xs text-[#64748B]">Administer hospital clinical staff roles, credentials, and system login access.</p>
        </div>
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-4 py-2 bg-[#147C8A] hover:bg-[#147C8A] text-white text-xs font-bold rounded-xl flex items-center space-x-1 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#64748B]" />
          </div>
          <input
            type="text"
            placeholder="Search staff by name, role or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-xs text-white focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
          />
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="p-2 bg-[#F8FBFB] border border-[#D7E8EA] hover:bg-[#EAF7F8] rounded-xl text-[#64748B] disabled:opacity-50 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-center py-12 text-[#64748B] text-xs">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 opacity-50 text-[#147C8A]" />
          <span>Querying staff registry...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#D7E8EA] bg-[#EAF7F8]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FBFB] text-[#64748B] border-b border-[#D7E8EA] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center font-bold">Credential Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7E8EA]/40 text-[#1E293B] font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#64748B]">
                    No active staff registry matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F8FBFB]/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1E293B] text-sm flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#EAF7F8] border border-[#D7E8EA] text-[#147C8A] font-bold flex items-center justify-center text-xs">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.fullName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">@{user.username}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center space-x-1 text-[#1E293B] text-xs">
                        <Briefcase className="w-3.5 h-3.5 text-[#147C8A]" />
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-green-50 border border-green-200 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center justify-center w-fit mx-auto">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.username === 'superadmin' || user.username === localStorage.getItem('username')}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:text-red-700 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-red-50"
                        title="Delete User Credentials"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#EAF7F8] backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddUser}
            className="w-full max-w-md bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-[#1E293B] mb-2">Register Hospital Staff Member</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[#64748B] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1">Login Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rameshk"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full p-2.5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1">Access Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#D7E8EA] rounded-xl text-[#1E293B] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1">Assigned Department Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                >
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="FrontDesk">Front Desk (Receptionist)</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Doctor">Doctor (Consulting Physician)</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Nurse">IPD Nurse</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="LabTech">Lab Technician</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Radiologist">Radiologist</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Pharmacist">Pharmacist</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Accountant">Accountant / Cashier</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="HospitalAdmin">Hospital Administrator</option>
                </select>
              </div>
            </div>

            {addUserError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl">
                {addUserError}
              </div>
            )}

            {addUserSuccess && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{addUserSuccess}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-4 py-2 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#147C8A] hover:bg-[#147C8A] text-white rounded-xl font-bold"
              >
                Register Staff
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
