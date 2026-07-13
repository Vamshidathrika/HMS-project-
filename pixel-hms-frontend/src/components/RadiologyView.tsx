import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import {
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Tv,
  Film
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

export default function RadiologyView() {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'new-order'>('pending');
  const [investigations, setInvestigations] = useState<OPInvestigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Order scan state
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
    resultValue: 'Normal Scan findings',
    referenceRange: 'N/A',
    remarks: '',
    labTechnician: localStorage.getItem('username') || 'Radiology Staff'
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
      // Filter by Radiology/Imaging category (case insensitive matching)
      const radInv = data.filter((item: OPInvestigation) => 
        item.testCategory.toLowerCase().startsWith('image') || 
        item.testCategory.toLowerCase().startsWith('radio') || 
        item.testCategory.toLowerCase().startsWith('x-ray')
      );
      setInvestigations(radInv);
    } catch (err: any) {
      setError(err.message || 'Error loading radiology scans');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsAndPatients = async () => {
    try {
      const docRes = await fetch('/api/v1/doctors', { headers: getHeaders() });
      if (docRes.ok) {
        const docsData = await docRes.json();
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

  // Order new scan
  const handleOrderScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setOrderSuccess('');
    if (!selectedPatient || !selectedDoctorId || !testName.trim()) {
      setOrderError('Please select a patient, doctor, and enter scan name.');
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
          testCategory: 'Imaging'
        })
      });
      if (!res.ok) throw new Error('Failed to order imaging scan');
      setOrderSuccess('Imaging scan ordered successfully!');
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
      setOrderError(err.message || 'Error ordering scan');
    }
  };

  // Perform Scan (Collect Sample equivalent)
  const handlePerformScan = async (id: number) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`/api/v1/investigations/${id}/collect`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to update scan completion');
      setActionSuccess('Imaging scan marked as completed. Ready for reporting.');
      fetchInvestigations();
      setTimeout(() => setActionSuccess(''), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Error performing scan');
    }
  };

  // Write Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    if (!activeResultInvestigation) return;
    if (!resultForm.remarks.trim()) {
      setActionError('Please write the scan report/findings.');
      return;
    }
    try {
      const res = await fetch(`/api/v1/investigations/${activeResultInvestigation.id}/results`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(resultForm)
      });
      if (!res.ok) throw new Error('Failed to submit report details');
      setActionSuccess('Imaging findings submitted successfully!');
      setResultForm({
        resultValue: 'Normal Scan findings',
        referenceRange: 'N/A',
        remarks: '',
        labTechnician: localStorage.getItem('username') || 'Radiology Staff'
      });
      setActiveResultInvestigation(null);
      fetchInvestigations();
      setTimeout(() => setActionSuccess(''), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Error submitting report');
    }
  };

  // Verify/Approve Report
  const handleVerifyReport = async (id: number) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`/api/v1/investigations/${id}/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ verifiedBy: localStorage.getItem('fullName') || 'Radiologist' })
      });
      if (!res.ok) throw new Error('Failed to sign off report');
      setActionSuccess('Radiologist report verified and signed off!');
      fetchInvestigations();
      setTimeout(() => setActionSuccess(''), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Error signing off report');
    }
  };

  // Delete scan
  const handleDeleteScan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scan order?')) return;
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`/api/v1/investigations/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete scan order');
      setActionSuccess('Scan order deleted successfully.');
      fetchInvestigations();
      setTimeout(() => setActionSuccess(''), 2000);
    } catch (err: any) {
      setActionError(err.message || 'Error deleting scan order');
    }
  };

  // View Scan Report
  const handleViewReport = async (inv: OPInvestigation) => {
    setViewingInvestigation(inv);
    setViewingResult(null);
    try {
      const res = await fetch(`/api/v1/investigations/${inv.id}/result`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setViewingResult(data);
      } else {
        alert('Could not find findings for this scan.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching report details.');
    }
  };

  return (
    <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-[#D7E8EA] mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center space-x-2">
            <Film className="text-[#147C8A] w-7 h-7" />
            <span>Radiology & Imaging Desk</span>
          </h1>
          <p className="text-xs text-[#64748B]">Manage digital PACS scans, write radiologist reports, and approve scans.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'pending' ? 'bg-[#147C8A] text-white font-bold' : 'bg-[#F8FBFB] text-[#1E293B] hover:bg-white'
            }`}
          >
            Imaging Queue
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
              activeSubTab === 'new-order' ? 'bg-[#147C8A] text-white font-bold' : 'bg-sky-700 text-[#1E293B] hover:bg-[#147C8A] font-bold'
            }`}
          >
            + Order Scan
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
              <Tv className="w-4 h-4 text-[#147C8A]" />
              <span>Active Modality Schedule</span>
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
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 opacity-50 text-[#147C8A]" />
              <span>Loading scan queue...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#D7E8EA] bg-[#EAF7F8]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FBFB] text-[#64748B] border-b border-[#D7E8EA] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Imaging Study</th>
                    <th className="py-3 px-4">Patient (UHID)</th>
                    <th className="py-3 px-4">Ordering Doctor</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA]/40 text-[#64748B] font-medium">
                  {investigations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#64748B]">
                        No active radiology imaging bookings found.
                      </td>
                    </tr>
                  ) : (
                    investigations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F8FBFB]/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#1E293B] text-sm">
                          <span className="flex items-center space-x-1">
                            <Film className="w-3.5 h-3.5 text-[#147C8A]/80" />
                            <span>{inv.testName}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="block text-[#1E293B] font-semibold">{inv.patient?.patientName}</span>
                          <span className="font-mono text-[10px] text-[#64748B]">UHID: {inv.uhid}</span>
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">
                          {inv.orderingDoctor?.name ? `Dr. ${inv.orderingDoctor.name}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-[#94A3B8] font-mono text-[10px]">
                          {inv.orderDateTime ? new Date(inv.orderDateTime).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {inv.status === 'Ordered' && (
                            <span className="bg-amber-100/50 text-amber-600 border border-amber-900/35 px-2 py-0.5 rounded text-[10px] font-bold">AWAITING SCAN</span>
                          )}
                          {inv.status === 'SampleCollected' && (
                            <span className="bg-[#EAF7F8]/50 text-[#147C8A] border border-[#D7E8EA]/35 px-2 py-0.5 rounded text-[10px] font-bold">SCAN DONE / PENDING REPORT</span>
                          )}
                          {inv.status === 'ResultEntered' && (
                            <span className="bg-[#EAF7F8] text-[#147C8A] border border-[#D7E8EA] px-2 py-0.5 rounded text-[10px] font-bold">PENDING SIGN-OFF</span>
                          )}
                          {inv.status === 'Verified' && (
                            <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">REPORT SIGNED OFF</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            {inv.status === 'Ordered' && (
                              <button
                                onClick={() => handlePerformScan(inv.id)}
                                className="px-2.5 py-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] rounded font-bold text-[10px]"
                              >
                                Perform Scan
                              </button>
                            )}

                            {inv.status === 'SampleCollected' && (
                              <button
                                onClick={() => {
                                  setActiveResultInvestigation(inv);
                                  setResultForm({
                                    resultValue: 'Normal Scan findings',
                                    referenceRange: 'N/A',
                                    remarks: '',
                                    labTechnician: localStorage.getItem('username') || 'Radiology Staff'
                                  });
                                }}
                                className="px-2.5 py-1 bg-[#147C8A] hover:bg-[#0F6672] text-white rounded font-bold text-[10px]"
                              >
                                Write Report
                              </button>
                            )}

                            {inv.status === 'ResultEntered' && (
                              <>
                                <button
                                  onClick={() => handleViewReport(inv)}
                                  className="px-2 py-1 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#1E293B] rounded font-bold text-[10px]"
                                >
                                  View Findings
                                </button>
                                <button
                                  onClick={() => handleVerifyReport(inv.id)}
                                  className="px-2.5 py-1 bg-[#22C55E] hover:bg-emerald-700 text-[#1E293B] rounded font-bold text-[10px]"
                                >
                                  Verify Report
                                </button>
                              </>
                            )}

                            {inv.status === 'Verified' && (
                              <button
                                onClick={() => handleViewReport(inv)}
                                className="px-2 py-1 bg-[#F8FBFB] hover:bg-[#EAF7F8] text-[#64748B] rounded font-bold text-[10px]"
                              >
                                View Report
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteScan(inv.id)}
                              className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded hover:text-red-700 transition-colors"
                              title="Delete Order"
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
        <form onSubmit={handleOrderScan} className="max-w-xl bg-white border border-[#D7E8EA] p-6 rounded-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-[#1E293B] flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-[#147C8A]" />
            <span>Order New Imaging Modality Study</span>
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
                <div className="mt-2 p-2 bg-[#EAF7F8]/20 border border-[#D7E8EA]/40 rounded-lg text-[#147C8A]">
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
              <label className="block text-[#64748B] mb-1">Imaging Study / Scan Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chest X-Ray PA View, MRI Brain Contrast, CT Abdomen"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D7E8EA] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
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
              className="px-4 py-2 bg-[#147C8A] text-white hover:bg-[#0F6672] rounded-xl font-bold"
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
            onSubmit={handleSubmitReport}
            className="w-full max-w-md bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-[#1E293B] mb-1">
              Write Radiologist Findings
            </h3>
            <p className="text-[#64748B] text-[11px] leading-tight">
              Study: <strong className="text-[#1E293B]">{activeResultInvestigation.testName}</strong> for Patient:{' '}
              <strong className="text-[#1E293B]">{activeResultInvestigation.patient?.patientName}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[#64748B] mb-1">Diagnostic Impression *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Normal Study, Right Lobar Pneumonia, Fracture Mid-shaft"
                  value={resultForm.resultValue}
                  onChange={(e) => setResultForm({ ...resultForm, resultValue: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1">Report Narrative (Scan Findings) *</label>
                <textarea
                  required
                  placeholder="Provide detailed radiologist scan observations..."
                  value={resultForm.remarks}
                  onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                  rows={4}
                  className="w-full p-2.5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[#64748B] mb-1">Reporting Staff / Radiographer</label>
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
                className="px-4 py-2 bg-[#147C8A] text-white hover:bg-[#0F6672] rounded-xl font-bold"
              >
                Save Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detailed Report Viewer Modal */}
      {viewingInvestigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#EAF7F8] backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-start pb-2 border-b border-[#D7E8EA]">
              <div>
                <h3 className="text-base font-bold text-[#1E293B] flex items-center space-x-1.5">
                  <FileText className="w-4.5 h-4.5 text-[#147C8A]" />
                  <span>PACS Imaging Study Report</span>
                </h3>
                <span className="text-[10px] text-[#64748B] font-mono">Study ID: #RAD-{viewingInvestigation.id}</span>
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
                <span className="text-[#64748B] block">Requesting Doctor:</span>
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
                <div className="p-4 bg-[#F8FBFB]/50 rounded-xl border border-[#D7E8EA] space-y-2.5">
                  <div className="flex justify-between border-b border-[#D7E8EA] pb-1.5">
                    <span className="text-[#64748B] font-bold">Requested Procedure:</span>
                    <strong className="text-[#1E293B]">{viewingInvestigation.testName}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] font-bold">Impression:</span>
                    <strong className="text-white text-sm bg-[#EAF7F8]/30 border border-[#D7E8EA]/30 px-2 py-0.5 rounded-lg inline-block mt-0.5">
                      {viewingResult.resultValue}
                    </strong>
                  </div>
                  {viewingResult.remarks && (
                    <div className="pt-2 border-t border-[#D7E8EA]">
                      <span className="text-[#64748B] block text-[10px] font-bold mb-1">Radiology Observations:</span>
                      <p className="text-[#1E293B] italic leading-relaxed whitespace-pre-line font-serif bg-[#EAF7F8]/20 p-2.5 rounded-lg border border-[#D7E8EA]">
                        {viewingResult.remarks}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] text-[#64748B]">
                  <div>
                    <span className="block">Scanned by:</span>
                    <strong className="text-[#1E293B]">{viewingResult.labTechnician || 'Radiographer'}</strong>
                  </div>
                  {viewingResult.verifiedBy && (
                    <div className="text-right">
                      <span className="block">Approved by Radiologist:</span>
                      <strong className="text-[#147C8A] font-bold">{viewingResult.verifiedBy}</strong>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#64748B]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-30 text-[#147C8A]" />
                <span>Fetching report details...</span>
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
