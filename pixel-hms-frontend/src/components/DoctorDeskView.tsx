import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import { 
  Users, 
  Stethoscope, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  History,
  Calendar,
  X
} from 'lucide-react';

interface Patient {
  id: number;
  uhid: string;
  patientName: string;
  gender: string;
  bloodGroup: string;
  mobile: string;
  dateOfBirth: string;
}

interface Doctor {
  id: number;
  name: string;
  qualification: string;
  specialization: string;
}

interface OPRegistration {
  id: number;
  patient: Patient;
  uhid: string;
  tokenNumber: number;
  chiefComplaint: string;
  visitType: string;
  status: string;
  visitDate: string;
}

interface Medicine {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
}

interface Prescription {
  id: number;
  opRegistration: {
    visitDate: string;
    tokenNumber: number;
  };
  doctor: {
    name: string;
  };
  symptoms: string;
  diagnosis: string;
  notes: string;
  createdDate: string;
  medicines: Medicine[];
}

export default function DoctorDeskView() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | ''>('');
  
  // Patient queue states
  const [queue, setQueue] = useState<OPRegistration[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<OPRegistration | null>(null);

  // Consultation notes states
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  
  // Prescription builder list
  const [medicines, setMedicines] = useState<Medicine[]>([
    { medicineName: '', dosage: '1-0-1', frequency: 'Twice daily', duration: '5 days', instruction: 'After food' }
  ]);

  // Patient history modal states
  const [patientHistory, setPatientHistory] = useState<Prescription[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch queue when doctor changes
  useEffect(() => {
    if (selectedDoctorId) {
      fetchQueue(selectedDoctorId);
      setSelectedVisit(null);
      setSaveSuccess(false);
    } else {
      setQueue([]);
    }
  }, [selectedDoctorId]);

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

  const fetchQueue = async (docId: number) => {
    try {
      const res = await fetch(`/api/v1/op/doctor-wise?doctorId=${docId}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    }
  };

  // Fetch patient medical history
  const fetchHistory = async () => {
    if (!selectedVisit) return;
    setIsLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const res = await fetch(`/api/v1/op/history?uhid=${selectedVisit.uhid}`);
      if (res.ok) {
        const data = await res.json();
        setPatientHistory(data);
      }
    } catch (err) {
      console.error('Error fetching patient history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { medicineName: '', dosage: '1-0-1', frequency: 'Twice daily', duration: '5 days', instruction: 'After food' }
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit || !selectedDoctorId) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const payload = {
      opRegistrationId: selectedVisit.id,
      doctorId: Number(selectedDoctorId),
      symptoms,
      diagnosis,
      notes,
      medicines: medicines.filter(m => m.medicineName.trim() !== '')
    };

    try {
      const res = await fetch('/api/v1/op/consultation', {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveSuccess(true);
        // Clear consultation fields
        setSymptoms('');
        setDiagnosis('');
        setNotes('');
        setMedicines([
          { medicineName: '', dosage: '1-0-1', frequency: 'Twice daily', duration: '5 days', instruction: 'After food' }
        ]);
        setSelectedVisit(null);
        // Refresh queue
        fetchQueue(Number(selectedDoctorId));
      } else {
        const errData = await res.json();
        setSaveError(errData.error || 'Failed to complete consultation');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error occurred while saving consultation');
    } finally {
      setIsSaving(false);
    }
  };

  // Split queue into waiting and completed
  const waitingQueue = queue.filter(q => q.status === 'Waiting');
  const completedQueue = queue.filter(q => q.status === 'Completed');

  return (
    <div className="space-y-8 relative">
      
      {/* View Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide">Doctor Consultation Desk</h1>
        <p className="text-sm text-[#64748B]">View patient queue, check medical histories, and compile diagnosis prescriptions.</p>
      </div>

      {/* Select Doctor Bar */}
      <div className="bg-white border border-[#D7E8EA] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Stethoscope className="w-5 h-5 text-[#147C8A]" />
          <span className="text-sm font-bold text-[#64748B]">Active Consulting Session:</span>
        </div>
        <select 
          value={selectedDoctorId}
          onChange={e => setSelectedDoctorId(e.target.value ? Number(e.target.value) : '')}
          className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] min-w-[250px] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
        >
          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">-- Choose doctor --</option>
          {doctors.map(d => (
            <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
          ))}
        </select>
      </div>

      {!selectedDoctorId ? (
        <div className="py-24 text-center text-[#64748B] text-sm bg-white border border-[#D7E8EA] rounded-[32px] shadow-sm flex flex-col items-center justify-center">
          <Users className="w-10 h-10 text-[#94A3B8] mb-3" />
          <p className="max-w-md font-medium">Please select your doctor identity from the selection bar above to display your daily queues.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Waiting Queue (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#D7E8EA] rounded-[32px] p-5 shadow-sm flex flex-col h-[580px]">
              
              {/* Waiting subqueue */}
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="text-sm font-bold text-[#147C8A] uppercase tracking-wider mb-4 flex items-center space-x-2 shrink-0">
                  <Clock className="w-4 h-4 text-[#147C8A]" />
                  <span>Waiting Queue ({waitingQueue.length})</span>
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {waitingQueue.length === 0 ? (
                    <div className="py-8 text-center text-[#94A3B8] text-xs italic font-medium">
                      No patients in waiting queue
                    </div>
                  ) : (
                    waitingQueue.map(q => (
                      <div 
                        key={q.id}
                        onClick={() => { setSelectedVisit(q); setSaveSuccess(false); }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col space-y-2 group ${
                          selectedVisit?.id === q.id 
                            ? 'bg-[#EAF7F8]/50 border-[#147C8A] shadow-sm' 
                            : 'bg-[#F8FBFB] border-[#D7E8EA] hover:bg-[#EAF7F8] hover:border-[#D7E8EA]'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-bold text-sm leading-tight transition-colors ${
                            selectedVisit?.id === q.id ? 'text-[#147C8A]' : 'text-[#1E293B] group-hover:text-[#147C8A]'
                          }`}>
                            {q.patient.patientName}
                          </span>
                          <span className="text-xs font-black bg-[#EAF7F8] text-[#147C8A] rounded-md px-2 py-0.5 font-mono">
                            T-{q.tokenNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8] truncate">
                          Complaint: <span className="text-[#64748B] italic font-medium">"{q.chiefComplaint || 'None'}"</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Completed subqueue */}
              <div className="border-t border-[#D7E8EA] pt-4 mt-4 shrink-0 flex flex-col min-h-0 h-[220px]">
                <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Completed Today ({completedQueue.length})</span>
                </h3>
                <div className="overflow-y-auto space-y-2 pr-1 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {completedQueue.length === 0 ? (
                    <div className="py-4 text-center text-[#94A3B8] text-xs italic font-medium">
                      No completed consultations yet
                    </div>
                  ) : (
                    completedQueue.map(q => (
                      <div 
                        key={q.id}
                        className="p-3 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-left flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-[#1E293B] text-xs block font-bold">{q.patient.patientName}</strong>
                          <code className="text-[10px] text-[#64748B] font-mono">{q.uhid}</code>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                          Token {q.tokenNumber}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Consulting Sheet (Span 8) */}
          <div className="lg:col-span-8">
            {!selectedVisit ? (
              <div className="bg-white border border-[#D7E8EA] rounded-[32px] p-6 shadow-sm h-[580px] flex flex-col items-center justify-center text-center">
                {saveSuccess ? (
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 mx-auto">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1E293B]">Consultation Saved Successfully!</h3>
                    <p className="text-xs text-[#64748B] max-w-sm font-medium">
                      The patient's queue record has been marked as Completed and their prescription has been logged. Select another patient from the waiting list to proceed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-xs">
                    <Stethoscope className="w-12 h-12 text-[#94A3B8] mx-auto animate-pulse" />
                    <h3 className="font-bold text-[#64748B]">No Patient Selected</h3>
                    <p className="text-xs text-[#64748B] font-medium">
                      Select a patient from the waiting queue on the left side to open their clinical consultation sheet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Consultation Form Sheet */
              <form onSubmit={handleCompleteConsultation} className="bg-white border border-[#D7E8EA] rounded-[32px] p-6 shadow-sm space-y-6">
                
                {/* Active Patient Details Banner */}
                <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF7F8] flex items-center justify-center text-[#147C8A] font-bold font-mono text-sm">
                      {selectedVisit.tokenNumber}
                    </div>
                    <div>
                      <strong className="text-[#1E293B] text-base block font-bold">{selectedVisit.patient.patientName}</strong>
                      <span className="text-xs text-[#64748B] font-medium">
                        {selectedVisit.patient.gender} | Age/DOB: {selectedVisit.patient.dateOfBirth} | Blood: {selectedVisit.patient.bloodGroup}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={fetchHistory}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#EAF7F8] border border-[#D7E8EA] text-[#147C8A] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                    >
                      <History className="w-3.5 h-3.5 text-[#147C8A]" />
                      <span>Medical History</span>
                    </button>
                    <div className="text-right text-xs">
                      <span className="text-[#64748B] font-bold block">UHID:</span>
                      <code className="text-[#147C8A] font-mono font-bold">{selectedVisit.uhid}</code>
                    </div>
                  </div>
                </div>

                {/* Complaint block if registered */}
                {selectedVisit.chiefComplaint && (
                  <div className="p-3.5 bg-[#EAF7F8]/20 border border-blue-200 rounded-xl text-xs">
                    <span className="text-[#64748B] block uppercase font-bold tracking-wider text-[10px]">Front Desk Complaint Notes:</span>
                    <p className="text-[#1E293B] mt-1 italic font-medium">"{selectedVisit.chiefComplaint}"</p>
                  </div>
                )}

                {/* Symptoms & Diagnosis inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Symptoms & Observations</label>
                    <textarea 
                      value={symptoms}
                      onChange={e => setSymptoms(e.target.value)}
                      placeholder="Enter patient reported symptoms..."
                      rows={3}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Diagnosis / Findings *</label>
                    <textarea 
                      required
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      placeholder="Enter clinical diagnosis/findings..."
                      rows={3}
                      className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Prescription Medicine Builder Grid */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-[#D7E8EA] pb-2">
                    <h4 className="text-sm font-bold text-[#1E293B] flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#147C8A]" />
                      <span>Prescription Builder</span>
                    </h4>
                    <button 
                      type="button"
                      onClick={handleAddMedicine}
                      className="py-1 px-3 bg-[#EAF7F8] hover:bg-blue-100 border border-blue-200 text-[#147C8A] rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Medicine</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#D7E8EA] text-[#64748B] uppercase font-bold text-[10px] tracking-wider">
                          <th className="py-2.5 pr-2 w-[40%]">Medicine Name</th>
                          <th className="py-2.5 px-2 w-[15%]">Dosage</th>
                          <th className="py-2.5 px-2 w-[15%]">Frequency</th>
                          <th className="py-2.5 px-2 w-[15%]">Duration</th>
                          <th className="py-2.5 px-2 w-[15%]">Instructions</th>
                          <th className="py-2.5 pl-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((med, index) => (
                          <tr key={index} className="border-b border-[#D7E8EA] last:border-0">
                            <td className="py-2 pr-2">
                              <input 
                                type="text"
                                required={index === 0}
                                value={med.medicineName}
                                onChange={e => handleMedicineChange(index, 'medicineName', e.target.value)}
                                placeholder="e.g. Paracetamol 650mg"
                                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-2.5 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="text"
                                value={med.dosage}
                                onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                                placeholder="e.g. 1-0-1"
                                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-2.5 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="text"
                                value={med.frequency}
                                onChange={e => handleMedicineChange(index, 'frequency', e.target.value)}
                                placeholder="e.g. Twice daily"
                                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-2.5 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="text"
                                value={med.duration}
                                onChange={e => handleMedicineChange(index, 'duration', e.target.value)}
                                placeholder="e.g. 5 days"
                                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-2.5 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="text"
                                value={med.instruction}
                                onChange={e => handleMedicineChange(index, 'instruction', e.target.value)}
                                placeholder="e.g. After food"
                                className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-lg px-2.5 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                              />
                            </td>
                            <td className="py-2 pl-2">
                              {medicines.length > 1 && (
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveMedicine(index)}
                                  className="p-1.5 text-red-600 hover:text-rose-700 hover:bg-[#EAF7F8] rounded-md transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional doctor notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Consultation Notes / Instructions</label>
                  <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Enter additional advice, lifestyle notes, or follow-up schedules..."
                    rows={2}
                    className="w-full bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] transition-colors resize-none"
                  />
                </div>

                {saveError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start space-x-2 text-rose-700 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Action button */}
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Consultation...' : 'Complete Consultation & Save Prescription'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      )}

      {/* Medical History Modal Popup */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-[#EAF7F8] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D7E8EA] rounded-[32px] w-full max-w-2xl h-[550px] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#D7E8EA] flex justify-between items-center bg-[#F8FBFB]">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-[#147C8A]" />
                <h3 className="font-bold text-lg text-[#1E293B]">
                  Medical History: {selectedVisit?.patient.patientName}
                </h3>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 hover:bg-[#EAF7F8] border border-[#D7E8EA] rounded-xl text-[#94A3B8] hover:text-[#1E293B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
              {isLoadingHistory ? (
                <div className="h-full flex items-center justify-center text-[#64748B] text-xs font-semibold">
                  Loading medical history...
                </div>
              ) : patientHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] text-center">
                  <FileText className="w-10 h-10 opacity-30 mb-2" />
                  <p className="text-sm font-semibold">No historical consultations recorded for this patient.</p>
                </div>
              ) : (
                patientHistory.map(hist => (
                  <div key={hist.id} className="p-5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl space-y-4 text-left shadow-sm">
                    <div className="flex justify-between items-start border-b border-[#D7E8EA] pb-2.5">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-bold">CONSULTING DOCTOR</span>
                        <strong className="text-[#1E293B] text-sm font-bold">{hist.doctor.name}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-bold">VISIT DATE</span>
                        <span className="text-[#1E293B] text-xs font-bold flex items-center justify-end">
                          <Calendar className="w-3.5 h-3.5 text-[#64748B] mr-1" />
                          {hist.createdDate ? hist.createdDate.substring(0, 10) : hist.opRegistration.visitDate}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <strong className="text-[#64748B] block font-bold uppercase text-[10px]">Symptoms / Observations:</strong>
                        <p className="text-[#1E293B] mt-1 italic font-medium">"{hist.symptoms || 'Not recorded'}"</p>
                      </div>
                      <div>
                        <strong className="text-[#64748B] block font-bold uppercase text-[10px]">Diagnosis:</strong>
                        <p className="text-[#1E293B] mt-1 font-bold">{hist.diagnosis}</p>
                      </div>
                    </div>

                    {/* Prescribed Drugs details */}
                    <div className="space-y-2">
                      <strong className="text-[#64748B] block text-xs font-bold uppercase text-[10px]">Prescribed Medications:</strong>
                      <div className="bg-white border border-[#D7E8EA] rounded-xl overflow-hidden shadow-inner">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-[#F8FBFB] text-[#64748B] font-bold border-b border-[#D7E8EA]">
                            <tr>
                              <th className="py-2 px-3">Medicine Name</th>
                              <th className="py-2 px-2">Dosage</th>
                              <th className="py-2 px-2">Frequency</th>
                              <th className="py-2 px-2">Duration</th>
                              <th className="py-2 px-2">Instruction</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hist.medicines.map((m, idx) => (
                              <tr key={idx} className="border-b border-slate-100 last:border-0">
                                <td className="py-2 px-3 text-[#1E293B] font-bold">{m.medicineName}</td>
                                <td className="py-2 px-2 text-[#1E293B] font-medium">{m.dosage}</td>
                                <td className="py-2 px-2 text-[#1E293B] font-medium">{m.frequency}</td>
                                <td className="py-2 px-2 text-[#1E293B] font-medium">{m.duration}</td>
                                <td className="py-2 px-2 text-[#64748B]">{m.instruction}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {hist.notes && (
                      <div className="pt-2 text-xs border-t border-[#D7E8EA]">
                        <strong className="text-[#64748B] block font-bold uppercase text-[10px]">Additional Advice:</strong>
                        <p className="text-[#1E293B] mt-0.5 font-medium">{hist.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8FBFB] border-t border-[#D7E8EA] text-right">
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="py-1.5 px-5 bg-[#147C8A] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close History
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
