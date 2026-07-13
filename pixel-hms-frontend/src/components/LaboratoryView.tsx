import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import {
  Activity,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clipboard,
  CheckCircle
} from 'lucide-react';

interface Patient {
  id: number;
  uhid: string;
  patientName: string;
  mobile: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface OPInvestigation {
  id: number;
  patient: Patient;
  uhid: string;
  orderingDoctor: Doctor;
  testName: string;
  testCategory: string;
  orderDateTime: string;
  sampleCollected: boolean;
  status: 'Ordered' | 'SampleCollected' | 'ResultEntered' | 'Verified';
}

interface LabResult {
  id: number;
  resultValue: string;
  referenceRange: string;
  remarks: string;
  labTechnician: string;
  verifiedBy: string;
  verificationDateTime: string;
}

export default function LaboratoryView() {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'new-order'>('pending');
  const [investigations, setInvestigations] = useState<OPInvestigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Order test state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [testName, setTestName] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [orderError, setOrderError] = useState('');

  // Action modals/states
  const [activeResultInvestigation, setActiveResultInvestigation] = useState<OPInvestigation | null>(null);
  const [resultForm, setResultForm] = useState({
    resultValue: '',
    referenceRange: '',
    remarks: '',
    labTechnician: localStorage.getItem('username') || 'Lab Tech'
  });
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Selected result viewer
  const [viewingResult, setViewingResult] = useState<LabResult | null>(null);
  const [viewingInvestigation, setViewingInvestigation] = useState<OPInvestigation | null>(null);

  const fetchInvestigations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/investigations/active', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch active investigations');
      const data = await res.json();
      // Filter by Lab category (case insensitive matching)
      const labInv = data.filter((item: OPInvestigation) => 
        item.testCategory.toLowerCase().startsWith('lab') || 
        item.testCategory.toLowerCase() === 'laboratory'
      );
      setInvestigations(labInv);
    } catch (err: any) {
      setError(err.message || 'Error loading laboratory tests');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsAndPatients = async () => {
    try {
      const docRes = await fetch('/api/v1/doctors', { headers: getHeaders() });
      if (docRes.ok) {
        const docsData = await docRes.ok ? await docRes.json() : [];
        setDoctors(docsData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvestigations();
    fetchDoctorsAndPatients();
  }, []);

  const handlePatientSearch = async (val: string) => {
    setPatientSearch(val);
    if (val.trim().length < 2) {
      setPatients([]);
      return;
    }
    try {
      const res = await fetch(`/api/v1/patients/search?query=${encodeURIComponent(val)}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Order new test
  const handleOrderTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setOrderSuccess('');
    if (!selectedPatient || !selectedDoctorId || !testName.trim()) {
      setOrderError('Please select a patient, doctor, and enter test name.');
      return;
    }
    try {
      const res = await fetch('/api/v1/investigations/order', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: selectedPatient.id,
          doctorId: parseInt(selectedDoctorId),
          testName: testName.trim(),
          testCategory: 'Lab'
        })
      });
      if (!res.ok) throw new Error('Failed to order laboratory test');
      setOrderSuccess('Laboratory test ordered successfully!');
      setTestName('');
      setSelectedPatient(null);
      setPatientSearch('');
      setPatients([]);
      fetchInvestigations();
      setTimeout(() => {
        setOrderSuccess('');
        setActiveSubTab('pending');
      }, 1500);
    } catch (err: any) {
      setOrderError(err.message || 'Error ordering test');
    }
  };

  // Collect Sample
  const handleCollectSample = async (id: number) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`/api/v1/investigations/${id}/collect`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to update sample collection');
      setActionSuccess('Sample collection recorded!');
      fetchInvestigations();
      setTimeout(() => setActionSuccess(''), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Error collecting sample');
    }
  };

  // Submit Result
  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    if (!activeResultInvestigation) return;
    if (!resultForm.resultValue.trim()) {
      setActionError('Please enter a result value.');
      return;
    }
    try {
      const res = await fetch(`/api/v1/investigations/${activeResultInvestigation.id}/results`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(resultForm)
      });
      if (!res.ok) throw new Error('Failed to submit test results');
      setActionSuccess('Test results submitted successfully!');
      setResultForm({
        resultValue: '',
        referenceRange: '',
        remarks: '',
        labTechnician: localStorage.getItem('username') || 'Lab Tech'
      });
      setActiveResultInvestigation(null);
      fetchInvestigations();
      setTimeout(() => setActionSuccess(''), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Error submitting results');
    }
  };

  // Verify Result
  const handleVerifyResult = async (id: number) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`/api/v1/investigations/${id}/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ verifiedBy: localStorage.getItem('fullName') || 'Pathologist' })
      });
      if (!res.ok) throw new Error('Failed to verify result');
      setActionSuccess('Test result verified by Pathologist!');
      fetchInvestigations();
      setTimeout(() => setActionSuccess(''), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Error verifying result');
    }
  };

  // Delete/Cancel test
  const handleDeleteInvestigation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this investigation record?')) return;
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`/api/v1/investigations/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete investigation');
      setActionSuccess('Investigation deleted successfully.');
      fetchInvestigations();
      setTimeout(() => setActionSuccess(''), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Error deleting investigation');
    }
  };

  // View Detailed Result
  const handleViewResult = async (inv: OPInvestigation) => {
    setViewingInvestigation(inv);
    setViewingResult(null);
    try {
      const res = await fetch(`/api/v1/investigations/${inv.id}/result`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setViewingResult(data);
      } else {
        alert('Could not find result for this test.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching result details.');
    }
  };

  return (
    <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-[#D7E8EA] mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center space-x-2">
            <Activity className="text-rose-500 w-7 h-7 animate-pulse" />
            <span>Laboratory Information System (LIS)</span>
          </h1>
          <p className="text-xs text-[#64748B]">Track sample collection processing, results reporting, and pathologist verification.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'pending' ? 'bg-[#EF4444] text-white' : 'bg-[#F8FBFB] text-[#1E293B] hover:bg-white'
            }`}
          >
            Diagnostics Queue
          </button>
          <button
            onClick={() => {
              setSelectedPatient(null);
              setTestName('');
              setOrderSuccess('');
              setOrderError('');
              setActiveSubTab('new-order');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'new-order' ? 'bg-[#EF4444] text-white' : 'bg-rose-600/80 hover:bg-[#EF4444] text-white font-bold'
            }`}
          >
            + Order Lab Test
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[#1E293B] flex items-center space-x-1.5">
              <Clipboard className="w-4 h-4 text-rose-500" />
              <span>Active Lab Investigations</span>
            </h3>
            <button
              onClick={fetchInvestigations}
              disabled={loading}
              className="p-2 bg-[#F8FBFB] border border-[#D7E8EA] hover:bg-[#EAF7F8] rounded-xl text-[#64748B] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-[#64748B] text-xs">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 opacity-50 text-rose-500" />
              <span>Loading diagnostic records...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#D7E8EA] bg-[#EAF7F8]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FBFB] text-[#64748B] border-b border-[#D7E8EA] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Test Name</th>
                    <th className="py-3 px-4">Patient (UHID)</th>
                    <th className="py-3 px-4">Ordering Doctor</th>
                    <th className="py-3 px-4">Order Date/Time</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA]/40 text-[#64748B] font-medium">
                  {investigations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#64748B]">
                        No active lab investigation records found.
                      </td>
                    </tr>
                  ) : (
                    investigations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F8FBFB]/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#1E293B] text-sm">{inv.testName}</td>
                        <td className="py-3 px-4">
                          <span className="block text-[#1E293B] font-semibold">{inv.patient?.patientName}</span>
                          <span className="font-mono text-[10px] text-[#64748B]">UHID: {inv.uhid}</span>
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">
                          {inv.orderingDoctor?.name ? `Dr. ${inv.orderingDoctor.name}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-[#64748B] font-mono text-[10px]">
                          {inv.orderDateTime ? new Date(inv.orderDateTime).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {inv.status === 'Ordered' && (
                            <span className="bg-amber-100/50 text-amber-600 border border-amber-900/35 px-2 py-0.5 rounded text-[10px] font-bold">PENDING SAMPLE</span>
                          )}
                          {inv.status === 'SampleCollected' && (
                            <span className="bg-[#EAF7F8]/50 text-[#147C8A] border border-[#D7E8EA]/35 px-2 py-0.5 rounded text-[10px] font-bold">SAMPLE IN LAB</span>
                          )}
                          {inv.status === 'ResultEntered' && (
                            <span className="bg-[#EAF7F8] text-[#147C8A] border border-[#D7E8EA] px-2 py-0.5 rounded text-[10px] font-bold">AWAITING SIGN-OFF</span>
                          )}
                          {inv.status === 'Verified' && (
                            <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">VERIFIED & DONE</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            {inv.status === 'Ordered' && (
                              <button
                                onClick={() => handleCollectSample(inv.id)}
                                className="px-2.5 py-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] rounded font-bold text-[10px]"
                              >
                                Collect Sample
                              </button>
                            )}

                            {inv.status === 'SampleCollected' && (
                              <button
                                onClick={() => {
                                  setActiveResultInvestigation(inv);
                                  setResultForm({
                                    resultValue: '',
                                    referenceRange: '',
                                    remarks: '',
                                    labTechnician: localStorage.getItem('username') || 'Lab Tech'
                                  });
                                }}
                                className="px-2.5 py-1 bg-[#147C8A] hover:bg-[#0F6672] text-white rounded font-bold text-[10px]"
                              >
                                Enter Result
                              </button>
                            )}

                            {inv.status === 'ResultEntered' && (
                              <>
                                <button
                                  onClick={() => handleViewResult(inv)}
                                  className="px-2 py-1 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#1E293B] rounded font-bold text-[10px]"
                                >
                                  View Result
                                </button>
                                <button
                                  onClick={() => handleVerifyResult(inv.id)}
                                  className="px-2.5 py-1 bg-[#22C55E] hover:bg-emerald-700 text-[#1E293B] rounded font-bold text-[10px]"
                                >
                                  Verify (Sign-off)
                                </button>
                              </>
                            )}

                            {inv.status === 'Verified' && (
                              <button
                                onClick={() => handleViewResult(inv)}
                                className="px-2 py-1 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#64748B] rounded font-bold text-[10px]"
                              >
                                View Report
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteInvestigation(inv.id)}
                              className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded hover:text-red-700 transition-colors"
                              title="Delete Test"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'new-order' && (
        <form onSubmit={handleOrderTest} className="max-w-xl bg-[#EAF7F8] border border-[#D7E8EA] p-6 rounded-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-[#1E293B] flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-rose-500" />
            <span>Order New Laboratory Test</span>
          </h3>

          <div className="space-y-3">
            {/* Patient Select */}
            <div>
              <label className="block text-[#64748B] mb-1">Search Patient *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type name, phone, or UHID..."
                  value={patientSearch}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D7E8EA] rounded-xl text-[#1E293B] focus:outline-none"
                />
              </div>

              {patients.length > 0 && (
                <div className="mt-2 bg-white border border-[#D7E8EA] rounded-xl overflow-hidden max-h-40 overflow-y-auto divide-y divide-[#D7E8EA]">
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatients([]);
                        setPatientSearch(`${p.patientName} (${p.uhid})`);
                      }}
                      className="w-full p-2 text-left text-xs hover:bg-[#F8FBFB] text-[#1E293B] flex justify-between"
                    >
                      <span>{p.patientName}</span>
                      <span className="font-mono text-[#64748B]">{p.uhid}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-rose-700">
                  Selected: <strong>{selectedPatient.patientName}</strong> (UHID: {selectedPatient.uhid})
                </div>
              )}
            </div>

            {/* Doctor Select */}
            <div>
              <label className="block text-[#64748B] mb-1">Ordering Doctor *</label>
              <select
                required
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
              >
                <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">-- Choose Physician --</option>
                {doctors.map((doc) => (
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={doc.id} value={doc.id}>
                    Dr. {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Name */}
            <div>
              <label className="block text-[#64748B] mb-1">Diagnostic Test Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete Blood Count (CBC), Lipid Profile, Serum Creatinine"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D7E8EA] rounded-xl text-[#1E293B] focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {orderError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl">
              {orderError}
            </div>
          )}

          {orderSuccess && (
            <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{orderSuccess}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('pending')}
              className="px-4 py-2 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
            >
              Submit Order
            </button>
          </div>
        </form>
      )}

      {/* Enter Result Modal */}
      {activeResultInvestigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#EAF7F8] backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSubmitResult}
            className="w-full max-w-md bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-[#1E293B] mb-1">
              Enter Diagnostics Result
            </h3>
            <p className="text-[#64748B] text-[11px] leading-tight">
              Test: <strong className="text-[#1E293B]">{activeResultInvestigation.testName}</strong> for Patient:{' '}
              <strong className="text-[#1E293B]">{activeResultInvestigation.patient?.patientName}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[#64748B] mb-1">Observed Value *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14.2 g/dL, 120 mg/dL, Reactive"
                  value={resultForm.resultValue}
                  onChange={(e) => setResultForm({ ...resultForm, resultValue: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1">Reference Range (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 12.0 - 16.0 g/dL"
                  value={resultForm.referenceRange}
                  onChange={(e) => setResultForm({ ...resultForm, referenceRange: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1">Remarks / Clinical Notes</label>
                <textarea
                  placeholder="Enter any diagnostic anomalies or clinician observations..."
                  value={resultForm.remarks}
                  onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1">Lab Technician Signee</label>
                <input
                  type="text"
                  required
                  value={resultForm.labTechnician}
                  onChange={(e) => setResultForm({ ...resultForm, labTechnician: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveResultInvestigation(null)}
                className="px-4 py-2 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
              >
                Submit Result
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detailed Result Viewer Modal */}
      {viewingInvestigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#EAF7F8] backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-start pb-2 border-b border-[#D7E8EA]">
              <div>
                <h3 className="text-base font-bold text-[#1E293B] flex items-center space-x-1.5">
                  <FileText className="w-4.5 h-4.5 text-rose-500" />
                  <span>Lab Diagnostics Report</span>
                </h3>
                <span className="text-[10px] text-[#64748B] font-mono">Test ID: #INV-{viewingInvestigation.id}</span>
              </div>
              <button
                onClick={() => {
                  setViewingInvestigation(null);
                  setViewingResult(null);
                }}
                className="text-[#64748B] hover:text-[#1E293B] font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] bg-[#EAF7F8] p-3 rounded-xl border border-[#D7E8EA]">
              <div>
                <span className="text-[#64748B] block">Patient Name:</span>
                <strong className="text-[#1E293B]">{viewingInvestigation.patient?.patientName}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Patient UHID:</span>
                <strong className="text-[#1E293B] font-mono">{viewingInvestigation.uhid}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Ordering Doctor:</span>
                <strong className="text-[#1E293B]">Dr. {viewingInvestigation.orderingDoctor?.name}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Order Date:</span>
                <span className="text-[#64748B] font-mono">
                  {viewingInvestigation.orderDateTime ? new Date(viewingInvestigation.orderDateTime).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {viewingResult ? (
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-[#F8FBFB]/50 rounded-xl border border-[#D7E8EA] space-y-2">
                  <div className="flex justify-between border-b border-[#D7E8EA] pb-1.5">
                    <span className="text-[#64748B] font-bold">Investigation:</span>
                    <strong className="text-[#1E293B]">{viewingInvestigation.testName}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#64748B] font-semibold">Observed Value:</span>
                    <strong className="text-red-700 text-base font-bold bg-red-100 border border-red-200 px-3 py-1 rounded-lg">
                      {viewingResult.resultValue}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Reference Interval:</span>
                    <span className="text-[#1E293B] font-mono">{viewingResult.referenceRange || 'Not Specified'}</span>
                  </div>
                  {viewingResult.remarks && (
                    <div className="pt-2 border-t border-[#D7E8EA] text-[10px]">
                      <span className="text-[#64748B] block font-bold mb-0.5">Remarks:</span>
                      <p className="text-[#1E293B] italic">{viewingResult.remarks}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] text-[#64748B]">
                  <div>
                    <span className="block">Processed By:</span>
                    <strong className="text-[#1E293B]">{viewingResult.labTechnician || 'Lab Technician'}</strong>
                  </div>
                  {viewingResult.verifiedBy && (
                    <div className="text-right">
                      <span className="block">Signed off by:</span>
                      <strong className="text-emerald-700 flex items-center justify-end space-x-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-700 mr-0.5 inline" />
                        <span>{viewingResult.verifiedBy}</span>
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#64748B]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-30" />
                <span>Fetching test details from database...</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#D7E8EA]">
              <button
                onClick={() => {
                  setViewingInvestigation(null);
                  setViewingResult(null);
                }}
                className="px-4 py-2 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] rounded-xl font-bold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
