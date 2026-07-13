import React, { useState, useEffect } from 'react';
import { 
  Workflow, 
  Plus, 
  Play, 
  Pause, 
  ArrowDown, 
  Trash2, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  UserCheck, 
  Settings, 
  FileText,
  AlertCircle
} from 'lucide-react';


interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  steps: string[];
  status: 'Active' | 'Paused';
  runCount: number;
}

const INITIAL_WORKFLOWS: AutomationWorkflow[] = [
  {
    id: "wf-1",
    name: "Patient Welcome Journey",
    trigger: "Patient Registered",
    steps: ["Send Welcome WhatsApp", "Wait: 2 Days", "Create Staff Task"],
    status: "Active",
    runCount: 24
  },
  {
    id: "wf-2",
    name: "Appointment Confirmation Message",
    trigger: "Appointment Confirmed",
    steps: ["Send Welcome WhatsApp"],
    status: "Active",
    runCount: 142
  },
  {
    id: "wf-3",
    name: "Overdue Follow-up Task",
    trigger: "Follow-up Overdue",
    steps: ["Create Staff Task"],
    status: "Active",
    runCount: 8
  }
];

export default function AutomationBuilderView() {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [selectedWf, setSelectedWf] = useState<AutomationWorkflow | null>(null);
  
  // New workflow creation
  const [wfName, setWfName] = useState("");
  const [wfTrigger, setWfTrigger] = useState("Patient Registered");
  
  // Add step selector
  const [selectedActionType, setSelectedActionType] = useState("Send Welcome WhatsApp");
  const [delayValue, setDelayValue] = useState(2);
  const [delayUnit, setDelayUnit] = useState("Days");
  const [customMsgText, setCustomMsgText] = useState("");

  const [activeNotice, setActiveNotice] = useState("");

  const loadWorkflows = () => {
    const raw = localStorage.getItem('hms_workflows');
    let data: AutomationWorkflow[] = [];
    if (raw) {
      data = JSON.parse(raw);
    } else {
      data = INITIAL_WORKFLOWS;
      localStorage.setItem('hms_workflows', JSON.stringify(data));
    }
    setWorkflows(data);
    if (data.length > 0) {
      if (selectedWf) {
        const match = data.find(w => w.id === selectedWf.id);
        if (match) setSelectedWf(match);
      } else {
        setSelectedWf(data[0]);
      }
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const triggerNotice = (msg: string) => {
    setActiveNotice(msg);
    setTimeout(() => setActiveNotice(""), 3000);
  };

  const handleToggleStatus = (wf: AutomationWorkflow) => {
    const nextStatus: 'Active' | 'Paused' = wf.status === 'Active' ? 'Paused' : 'Active';
    const updated: AutomationWorkflow[] = workflows.map(w => {
      if (w.id === wf.id) {
        return { ...w, status: nextStatus };
      }
      return w;
    });
    setWorkflows(updated);
    localStorage.setItem('hms_workflows', JSON.stringify(updated));
    triggerNotice(`Workflow "${wf.name}" is now ${nextStatus}!`);
  };

  const getStepDisplayName = (stepText: string) => {
    if (stepText.startsWith("Send WhatsApp:")) {
      return "Send Custom WhatsApp";
    }
    if (stepText.startsWith("Send SMS:")) {
      return "Send Custom SMS";
    }
    if (stepText.startsWith("Send WhatsApp Invoice Attachment:")) {
      return "Send WhatsApp Invoice + Custom Caption";
    }
    if (stepText === "Send WhatsApp Invoice Attachment") {
      return "Send WhatsApp Invoice Document";
    }
    return stepText;
  };

  const getStepSubtitle = (stepText: string) => {
    if (stepText.startsWith("Send WhatsApp:")) {
      return stepText.replace("Send WhatsApp:", "").trim();
    }
    if (stepText.startsWith("Send SMS:")) {
      return stepText.replace("Send SMS:", "").trim();
    }
    if (stepText.startsWith("Send WhatsApp Invoice Attachment:")) {
      return stepText.replace("Send WhatsApp Invoice Attachment:", "").trim();
    }
    return "";
  };

  const handleAddStep = () => {
    if (!selectedWf) return;
    
    let stepDescription = selectedActionType;
    if (selectedActionType === "Wait Delay") {
      stepDescription = `Wait: ${delayValue} ${delayUnit}`;
    } else if (selectedActionType === "Send WhatsApp: custom") {
      stepDescription = `Send WhatsApp: ${customMsgText}`;
    } else if (selectedActionType === "Send SMS: custom") {
      stepDescription = `Send SMS: ${customMsgText}`;
    } else if (selectedActionType === "Send WhatsApp Invoice Attachment") {
      stepDescription = customMsgText ? `Send WhatsApp Invoice Attachment: ${customMsgText}` : "Send WhatsApp Invoice Attachment";
    }

    const updatedSteps = [...selectedWf.steps, stepDescription];
    const updated = workflows.map(w => {
      if (w.id === selectedWf.id) {
        return { ...w, steps: updatedSteps };
      }
      return w;
    });
    setWorkflows(updated);
    localStorage.setItem('hms_workflows', JSON.stringify(updated));
    setCustomMsgText(""); // Clear custom text
    triggerNotice("Workflow step added successfully!");
  };

  const handleRemoveStep = (index: number) => {
    if (!selectedWf) return;
    const updatedSteps = selectedWf.steps.filter((_, i) => i !== index);
    
    const updated = workflows.map(w => {
      if (w.id === selectedWf.id) {
        return { ...w, steps: updatedSteps };
      }
      return w;
    });
    setWorkflows(updated);
    localStorage.setItem('hms_workflows', JSON.stringify(updated));
    triggerNotice("Workflow step removed.");
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfName.trim()) return;

    const newWf: AutomationWorkflow = {
      id: `wf-${Date.now()}`,
      name: wfName,
      trigger: wfTrigger,
      steps: ['Send Welcome WhatsApp'],
      status: 'Active',
      runCount: 0
    };

    const updated = [...workflows, newWf];
    setWorkflows(updated);
    localStorage.setItem('hms_workflows', JSON.stringify(updated));
    setWfName("");
    setSelectedWf(newWf);
    triggerNotice(`New workflow "${newWf.name}" generated!`);
  };

  const handleDeleteWorkflow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = workflows.filter(w => w.id !== id);
    setWorkflows(updated);
    localStorage.setItem('hms_workflows', JSON.stringify(updated));
    if (selectedWf?.id === id) {
      setSelectedWf(updated.length > 0 ? updated[0] : null);
    }
    triggerNotice("Workflow deleted.");
  };

  const getStepIcon = (stepText: string) => {
    if (stepText.includes("Invoice") || stepText.includes("Bill")) return <FileText className="h-4 w-4 text-[#147C8A]" />;
    if (stepText.includes("WhatsApp") || stepText.includes("SMS")) return <MessageSquare className="h-4 w-4 text-emerald-700" />;
    if (stepText.includes("Wait")) return <Clock className="h-4 w-4 text-amber-700 animate-pulse" />;
    if (stepText.includes("Task")) return <UserCheck className="h-4 w-4 text-[#147C8A]" />;
    return <Settings className="h-4 w-4 text-[#64748B]" />;
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {activeNotice && (
        <div className="fixed bottom-5 right-5 bg-[#147C8A] text-white font-bold px-4 py-2.5 rounded-xl shadow-2xl z-[150] flex items-center space-x-2 animate-bounce">
          <CheckCircle className="h-4 w-4" /> 
          <span>{activeNotice}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex justify-between items-center bg-[#F8FBFB] p-6 rounded-2xl border border-[#D7E8EA] backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide flex items-center space-x-2.5">
            <Workflow className="w-6 h-6 text-[#147C8A]" />
            <span>Workflow Automation Builder</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Configure HubSpot-like trigger-action paths for patients registered, invoice generations, and follow-ups.
          </p>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Workflows directories */}
        <div className="space-y-6">
          {/* Create form */}
          <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-1.5 border-b border-[#D7E8EA] pb-2">
              <Workflow className="h-4 w-4 text-[#147C8A]" /> Generate Workflow
            </h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748B] block uppercase">Workflow Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pediatrics Intake Automation" 
                  value={wfName} 
                  onChange={(e) => setWfName(e.target.value)} 
                  className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748B] block uppercase">Event Trigger</label>
                <select 
                  value={wfTrigger} 
                  onChange={(e) => setWfTrigger(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                >
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Patient Registered">Patient Registered</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Appointment Confirmed">Appointment Confirmed</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Follow-up Overdue">Follow-up Overdue</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Bill Settle Complete">Bill Settle Complete</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Invoice Created">Invoice Created</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full py-2 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md transition-colors"
              >
                <Plus className="h-4 w-4" /> Create Workflow
              </button>
            </form>
          </div>

          {/* Directory list of workflows */}
          <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-[#1E293B] border-b border-[#D7E8EA] pb-2">Automation Directory</h3>
            <div className="divide-y divide-slate-850 overflow-hidden rounded-2xl border border-[#D7E8EA] bg-rose-50">
              {workflows.map(wf => {
                const isSelected = selectedWf?.id === wf.id;
                return (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWf(wf)}
                    className={`p-3.5 cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-[#F8FBFB] ${
                      isSelected ? 'bg-[#147C8A]/5 border-l-2 border-l-sky-500' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="text-xs font-bold text-[#1E293B] leading-tight truncate">{wf.name}</h4>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">Trigger: {wf.trigger} ({wf.runCount} runs)</span>
                    </div>
                    
                    {/* Actions panel */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(wf);
                        }}
                        className={`p-1.5 rounded-lg hover:bg-[#F8FBFB] transition-colors ${
                          wf.status === 'Active' ? 'text-emerald-500' : 'text-[#64748B]'
                        }`}
                        title={wf.status === 'Active' ? 'Pause Workflow' : 'Activate Workflow'}
                      >
                        {wf.status === 'Active' ? (
                          <Play className="h-3.5 w-3.5 fill-emerald-500/20" />
                        ) : (
                          <Pause className="h-3.5 w-3.5 fill-slate-500/20" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteWorkflow(wf.id, e)}
                        className="p-1.5 text-[#64748B] hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                        title="Delete Workflow"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {workflows.length === 0 && (
                <p className="text-center text-[#64748B] text-xs py-8">No workflows configured.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Flowchart Canvas Visual Builder */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWf ? (
            <div className="bg-[#F8FBFB] border border-[#D7E8EA] rounded-2xl p-6 shadow-sm backdrop-blur-md flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="pb-3 border-b border-[#D7E8EA] flex justify-between items-center bg-[#F8FBFB] p-4 rounded-t-2xl -mx-6 -mt-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-1.5">
                      Visual Canvas: <span className="text-[#147C8A]">{selectedWf.name}</span>
                    </h3>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Edit vertical steps below for trigger event.</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedWf.status === 'Active' 
                      ? 'bg-[#22C55E]/10 text-emerald-700' 
                      : 'bg-[#F8FBFB] text-[#64748B]'
                  }`}>
                    {selectedWf.status.toUpperCase()}
                  </span>
                </div>
                
                {/* FLOWCHART AREA */}
                <div className="p-6 flex flex-col items-center space-y-4">
                  {/* 1. Trigger node */}
                  <div className="p-4 bg-[#22C55E]/10 border border-emerald-500/30 rounded-2xl text-center w-64 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-[#22C55E]" />
                    <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">EVENT TRIGGER</span>
                    <div className="text-xs font-bold text-[#1E293B] mt-1">{selectedWf.trigger}</div>
                  </div>

                  <ArrowDown className="h-5 w-5 text-[#64748B] animate-bounce" />

                  {/* 2. Actions flowchart nodes */}
                  {selectedWf.steps.map((step, index) => (
                    <React.Fragment key={index}>
                      <div className="group relative p-4 bg-[#EAF7F8]/20 border border-[#D7E8EA] rounded-2xl w-80 shadow-md flex items-center justify-between hover:border-[#147C8A]/30 transition-all duration-300">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 rounded-xl bg-white border border-[#D7E8EA] shrink-0">
                            {getStepIcon(step)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9.5px] font-bold text-[#64748B] uppercase tracking-wide block">Action Step {index + 1}</span>
                            <div className="text-xs font-bold text-[#1E293B] leading-tight mt-0.5 truncate">{getStepDisplayName(step)}</div>
                            {getStepSubtitle(step) && (
                              <div className="text-[10px] text-[#64748B] font-medium italic mt-0.5 truncate max-w-[200px]" title={getStepSubtitle(step)}>
                                "{getStepSubtitle(step)}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remove Action step button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(index)}
                          className="text-[#64748B] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shrink-0 ml-2"
                          title="Delete step"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {index < selectedWf.steps.length - 1 && (
                        <ArrowDown className="h-5 w-5 text-[#64748B]" />
                      )}
                    </React.Fragment>
                  ))}
                  
                  {selectedWf.steps.length === 0 && (
                    <div className="text-center p-6 border border-dashed border-[#D7E8EA] rounded-2xl w-80 text-[#64748B] text-xs font-semibold">
                      No steps appended yet. Select an action below.
                    </div>
                  )}
                </div>
              </div>

              {/* Add step control panel */}
              <div className="p-5 border-t border-[#D7E8EA] bg-rose-50 rounded-b-3xl -mx-6 -mb-6 flex flex-col gap-4 text-xs">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-[#64748B] block uppercase">Append Action Step</label>
                    <select
                      value={selectedActionType}
                      onChange={(e) => {
                        setSelectedActionType(e.target.value);
                        setCustomMsgText("");
                      }}
                      className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Send Welcome WhatsApp">Send Standard Welcome WhatsApp</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Send Pending Bill SMS">Send Standard SMS Bill Reminder</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Send WhatsApp Invoice Attachment">Send WhatsApp Invoice Document (.txt)</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Send WhatsApp: custom">Send Custom WhatsApp Message</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Send SMS: custom">Send Custom SMS Message</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Create Staff Task">Create Physician Follow-up Task</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Wait Delay">Wait Delay Period</option>
                    </select>
                  </div>

                  {/* Delay Option */}
                  {selectedActionType === "Wait Delay" && (
                    <div className="flex gap-2 w-[220px] animate-in slide-in-from-left-2">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase">Duration</label>
                        <input
                          type="number"
                          min={1}
                          value={delayValue}
                          onChange={(e) => setDelayValue(parseInt(e.target.value) || 1)}
                          className="w-full bg-white border border-[#D7E8EA] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                        />
                      </div>
                      <div className="w-[110px] space-y-1.5">
                        <label className="text-[10px] font-bold text-[#64748B] block uppercase">Unit</label>
                        <select
                          value={delayUnit}
                          onChange={(e) => setDelayUnit(e.target.value)}
                          className="w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                        >
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Seconds">Seconds</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Minutes">Minutes</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Hours">Hours</option>
                          <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Days">Days</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleAddStep} 
                    className="py-2.5 px-4 bg-[#147C8A] hover:bg-[#0F6672] text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 shadow-md transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Append Step
                  </button>
                </div>

                {/* Custom Message input option / Caption option */}
                {(selectedActionType === "Send WhatsApp: custom" ||
                  selectedActionType === "Send SMS: custom" ||
                  selectedActionType === "Send WhatsApp Invoice Attachment") && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold text-[#64748B] block uppercase">
                      {selectedActionType === "Send WhatsApp Invoice Attachment"
                        ? "Custom Caption Text (Optional)"
                        : "Custom Message Content"}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={
                        selectedActionType === "Send WhatsApp Invoice Attachment"
                          ? "e.g. Dear {Patient Name}, here is your bill. Please pay soon."
                          : "e.g. Hello {Patient Name}, we noticed your appointment with {Doctor} is scheduled for {Date}."
                      }
                      value={customMsgText}
                      onChange={(e) => setCustomMsgText(e.target.value)}
                      className="w-full bg-white border border-[#D7E8EA] rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] leading-normal"
                    />
                    <div className="text-[9px] text-[#64748B] flex gap-2 font-medium flex-wrap">
                      <span>Tokens:</span>
                      <code className="text-[#147C8A]">{`{Patient Name}`}</code>
                      <code className="text-[#147C8A]">{`{Doctor}`}</code>
                      <code className="text-[#147C8A]">{`{Date}`}</code>
                      <code className="text-[#147C8A]">{`{Time}`}</code>
                      <code className="text-[#147C8A]">{`{Amount}`}</code>
                      <code className="text-[#147C8A]">{`{Invoice No}`}</code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[400px] border-2 border-dashed border-[#D7E8EA] rounded-2xl flex flex-col items-center justify-center text-[#64748B] text-xs font-bold gap-2">
              <AlertCircle className="w-8 h-8 opacity-30 text-[#147C8A]" />
              <span>Select or generate a workflow to configure.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
