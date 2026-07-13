import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import {
  Package,
  RefreshCw,
  Truck,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

interface DrugInventory {
  id: number;
  drugCode: string;
  drugName: string;
  currentStock: number;
  unitPrice: number;
}

interface DispatchRequest {
  id: string;
  itemName: string;
  quantity: number;
  wardName: string;
  status: 'Requested' | 'Approved' | 'Dispatched';
  timestamp: string;
}

export default function InventoryView() {
  const [inventory, setInventory] = useState<DrugInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ward Dispatches state
  const [dispatches, setDispatches] = useState<DispatchRequest[]>([]);
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    itemId: '',
    quantity: 1,
    wardName: 'ICU'
  });

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/pharmacy/inventory', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch central stock');
      const data = await res.json();
      setInventory(data);
    } catch (err: any) {
      setError(err.message || 'Error loading stock database');
    } finally {
      setLoading(false);
    }
  };

  // Load dispatches from localStorage on mount
  useEffect(() => {
    fetchInventory();
    const stored = localStorage.getItem('hms_ward_dispatches');
    if (stored) {
      try {
        setDispatches(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed default items as seen in App.tsx stub
      const defaultDispatches: DispatchRequest[] = [
        {
          id: 'disp-1',
          itemName: 'ICU Bed Pack A (Syringes, Catheters, IV lines)',
          quantity: 5,
          wardName: 'ICU',
          status: 'Dispatched',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
        },
        {
          id: 'disp-2',
          itemName: 'Surgical Glove Pack (Size 7.0 Sterile)',
          quantity: 20,
          wardName: 'Operation Theatre',
          status: 'Approved',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        }
      ];
      setDispatches(defaultDispatches);
      localStorage.setItem('hms_ward_dispatches', JSON.stringify(defaultDispatches));
    }
  }, []);

  const saveDispatches = (updated: DispatchRequest[]) => {
    setDispatches(updated);
    localStorage.setItem('hms_ward_dispatches', JSON.stringify(updated));
  };

  // Create dispatch
  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = inventory.find((i) => String(i.id) === dispatchForm.itemId);
    if (!selectedItem && !dispatchForm.itemId) return;

    const name = selectedItem ? selectedItem.drugName : dispatchForm.itemId; // allow free text too

    const newDisp: DispatchRequest = {
      id: 'disp-' + Date.now(),
      itemName: name,
      quantity: dispatchForm.quantity,
      wardName: dispatchForm.wardName,
      status: 'Requested',
      timestamp: new Date().toISOString()
    };

    const updated = [newDisp, ...dispatches];
    saveDispatches(updated);
    setIsNewDispatchOpen(false);
    setDispatchForm({ itemId: '', quantity: 1, wardName: 'ICU' });
  };

  const updateDispatchStatus = (id: string, newStatus: 'Requested' | 'Approved' | 'Dispatched') => {
    const updated = dispatches.map((d) => (d.id === id ? { ...d, status: newStatus } : d));
    saveDispatches(updated);
  };

  return (
    <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-[#D7E8EA] mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center space-x-2">
            <Package className="text-emerald-700 w-7 h-7" />
            <span>Central Inventory & Supply Chain</span>
          </h1>
          <p className="text-xs text-[#64748B]">Track central medical stores stock levels, ward dispatches, and hospital assets.</p>
        </div>
        <button
          onClick={fetchInventory}
          disabled={loading}
          className="px-3.5 py-1.5 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left pane: Ward Dispatches */}
        <div className="bg-rose-50 p-5 rounded-2xl border border-[#D7E8EA] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#D7E8EA]">
            <h3 className="font-bold text-[#1E293B] flex items-center space-x-1.5 text-xs">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Ward Dispatches</span>
            </h3>
            <button
              onClick={() => setIsNewDispatchOpen(true)}
              className="px-2 py-1 bg-[#22C55E] hover:bg-emerald-700 text-[#1E293B] font-bold rounded-lg text-[10px]"
            >
              + Dispatch
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px]">
            {dispatches.length === 0 ? (
              <div className="text-center py-8 text-[#64748B] text-[11px] italic">
                No dispatch logs found.
              </div>
            ) : (
              dispatches.map((disp) => (
                <div key={disp.id} className="p-3 bg-[#F8FBFB] rounded-xl border border-[#D7E8EA] text-xs space-y-2">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <strong className="block text-[#1E293B] text-[11px] leading-tight">{disp.itemName}</strong>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">Ward: <strong className="text-[#1E293B]">{disp.wardName}</strong></span>
                      <span className="text-[9px] text-[#64748B] font-mono block">{new Date(disp.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] block font-bold text-[#1E293B]">Qty: {disp.quantity}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#D7E8EA]/65">
                    {disp.status === 'Requested' && (
                      <span className="bg-amber-100 text-amber-700 border border-amber-900/40 px-2 py-0.5 rounded text-[9px] font-bold">REQUESTED</span>
                    )}
                    {disp.status === 'Approved' && (
                      <span className="bg-blue-950 text-[#147C8A] border border-blue-900/40 px-2 py-0.5 rounded text-[9px] font-bold">APPROVED</span>
                    )}
                    {disp.status === 'Dispatched' && (
                      <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[9px] font-bold">DISPATCHED</span>
                    )}

                    <div className="flex space-x-1">
                      {disp.status === 'Requested' && (
                        <button
                          onClick={() => updateDispatchStatus(disp.id, 'Approved')}
                          className="px-1.5 py-0.5 bg-[#0F6672]/40 hover:bg-[#147C8A] text-indigo-300 hover:text-[#1E293B] rounded text-[8px] font-bold"
                        >
                          Approve
                        </button>
                      )}
                      {disp.status === 'Approved' && (
                        <button
                          onClick={() => updateDispatchStatus(disp.id, 'Dispatched')}
                          className="px-1.5 py-0.5 bg-emerald-600/40 hover:bg-emerald-700 text-green-700 hover:text-[#1E293B] rounded text-[8px] font-bold"
                        >
                          Ship
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right pane: Central Stock Status */}
        <div className="lg:col-span-2 bg-rose-50 p-5 rounded-2xl border border-[#D7E8EA] space-y-4">
          <h3 className="font-bold text-[#1E293B] flex items-center space-x-1.5 text-xs">
            <ClipboardList className="w-4 h-4 text-emerald-700" />
            <span>Central Stock levels & Asset Registry</span>
          </h3>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-[#64748B] text-xs">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 opacity-50 text-emerald-700" />
              <span>Querying inventory database...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#D7E8EA] bg-[#EAF7F8]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FBFB] text-[#64748B] border-b border-[#D7E8EA] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Item Code</th>
                    <th className="py-2.5 px-3">Stock Description</th>
                    <th className="py-2.5 px-3 text-right">Available Qty</th>
                    <th className="py-2.5 px-3 text-right">Estimated Value</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA]/40 text-[#64748B]">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#64748B] font-medium">
                        No central stock registry found. Add stock in Pharmacy view first.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FBFB]/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-[#64748B]">{item.drugCode}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#1E293B]">{item.drugName}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#1E293B] font-mono">{item.currentStock}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-700/90 font-mono">₹{(item.currentStock * item.unitPrice).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center">
                          {item.currentStock <= 0 ? (
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[9px] font-bold">REORDER NOW</span>
                          ) : item.currentStock <= 15 ? (
                            <span className="bg-amber-100/40 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold">LOW STOCK</span>
                          ) : (
                            <span className="bg-green-50 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-bold">IN STOCK</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Dispatch Modal */}
      {isNewDispatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#EAF7F8] backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateDispatch}
            className="w-full max-w-md bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-[#1E293B] mb-2">Create Ward Dispatch Request</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[#64748B] mb-1">Select Stock Item *</label>
                <select
                  required
                  value={dispatchForm.itemId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, itemId: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-xs bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                >
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="">-- Choose Stock Item --</option>
                  {inventory.map((i) => (
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" key={i.id} value={i.id}>
                      {i.drugName} (Code: {i.drugCode} | Stock: {i.currentStock})
                    </option>
                  ))}
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Custom General Consumables">Custom Pack: Syringes/Catheters/IV</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Sterile Surgical Gloves Box">Sterile Surgical Gloves Box (Size 7.5)</option>
                  <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="ECG Paper Rolls">ECG Paper Rolls (Pack of 5)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1">Dispatch Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dispatchForm.quantity}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1">Target Ward / Unit *</label>
                  <select
                    value={dispatchForm.wardName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, wardName: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-xs bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                  >
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="ICU">ICU</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="IPD Male Ward">IPD Male Ward</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="IPD Female Ward">IPD Female Ward</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Operation Theatre">Operation Theatre (OT)</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Emergency Care">Emergency Care</option>
                    <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="NICU">NICU</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewDispatchOpen(false)}
                className="px-4 py-2 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#22C55E] hover:bg-emerald-700 text-[#1E293B] rounded-xl font-bold"
              >
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
