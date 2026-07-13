import React, { useState, useEffect } from 'react';
import { getHeaders } from '../utils/hmsUtils';
import {
  ClipboardList,
  RefreshCw,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Package,
  ShoppingCart,
  Trash2,
  User
} from 'lucide-react';

interface DrugInventory {
  id: number;
  drugCode: string;
  drugName: string;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
  unitPrice: number;
  purchasePrice: number;
}

interface PharmacySaleItem {
  pharmacyInventory: { id: number; drugName?: string };
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Patient {
  id: number;
  uhid: string;
  patientName: string;
  mobile: string;
}

export default function PharmacyDeskView() {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'sales' | 'new-sale'>('inventory');

  // Inventory list state
  const [inventory, setInventory] = useState<DrugInventory[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState('');

  // Add stock state
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [stockForm, setStockForm] = useState({
    drugCode: '',
    drugName: '',
    batchNumber: '',
    expiryDate: '',
    quantity: 0,
    unitPrice: 0,
    purchasePrice: 0
  });
  const [addStockSuccess, setAddStockSuccess] = useState('');
  const [addStockError, setAddStockError] = useState('');

  // Sales list state
  const [sales, setSales] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState('');

  // New Sale state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  
  const [cart, setCart] = useState<{ drug: DrugInventory; quantity: number }[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [saleSuccess, setSaleSuccess] = useState('');
  const [saleError, setSaleError] = useState('');
  const [isSavingSale, setIsSavingSale] = useState(false);

  // Fetch functions
  const fetchInventory = async () => {
    setInventoryLoading(true);
    setInventoryError('');
    try {
      const res = await fetch('/api/v1/pharmacy/inventory', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setInventory(data);
    } catch (err: any) {
      setInventoryError(err.message || 'Error loading inventory');
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchSales = async () => {
    setSalesLoading(true);
    setSalesError('');
    try {
      const res = await fetch('/api/v1/pharmacy/sales', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch sales');
      const data = await res.json();
      setSales(data);
    } catch (err: any) {
      setSalesError(err.message || 'Error loading sales history');
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'inventory') fetchInventory();
    if (activeSubTab === 'sales') fetchSales();
  }, [activeSubTab]);

  // Handle patient search
  const handlePatientSearch = async (val: string) => {
    setPatientSearchQuery(val);
    if (val.trim().length < 2) {
      setPatientSearchResults([]);
      return;
    }
    setIsSearchingPatients(true);
    try {
      const res = await fetch(`/api/v1/patients/search?query=${encodeURIComponent(val)}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPatientSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingPatients(false);
    }
  };

  // Add stock submit
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStockError('');
    setAddStockSuccess('');
    if (!stockForm.drugCode || !stockForm.drugName || stockForm.quantity <= 0) {
      setAddStockError('Please fill in drug code, name, and positive quantity.');
      return;
    }
    try {
      const res = await fetch('/api/v1/pharmacy/inventory', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(stockForm)
      });
      if (!res.ok) throw new Error('Failed to add inventory stock');
      
      setAddStockSuccess('Stock updated successfully!');
      setStockForm({
        drugCode: '',
        drugName: '',
        batchNumber: '',
        expiryDate: '',
        quantity: 0,
        unitPrice: 0,
        purchasePrice: 0
      });
      fetchInventory();
      setTimeout(() => {
        setIsAddStockOpen(false);
        setAddStockSuccess('');
      }, 1500);
    } catch (err: any) {
      setAddStockError(err.message || 'Error saving stock');
    }
  };

  // Cart operations
  const addToCart = (drug: DrugInventory) => {
    if (drug.currentStock <= 0) {
      alert('Drug is out of stock!');
      return;
    }
    const existingIndex = cart.findIndex((item) => item.drug.id === drug.id);
    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + 1;
      if (newQty > drug.currentStock) {
        alert(`Cannot add more than current stock (${drug.currentStock})`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity = newQty;
      setCart(updated);
    } else {
      setCart([...cart, { drug, quantity: 1 }]);
    }
  };

  const updateCartQty = (drugId: number, qty: number) => {
    const item = cart.find((i) => i.drug.id === drugId);
    if (!item) return;
    if (qty > item.drug.currentStock) {
      alert(`Only ${item.drug.currentStock} units available in stock.`);
      return;
    }
    if (qty <= 0) {
      setCart(cart.filter((i) => i.drug.id !== drugId));
    } else {
      setCart(cart.map((i) => (i.drug.id === drugId ? { ...i, quantity: qty } : i)));
    }
  };

  const removeFromCart = (drugId: number) => {
    setCart(cart.filter((i) => i.drug.id !== drugId));
  };

  // Calculate cart sums
  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.drug.unitPrice, 0);
  const netPayable = Math.max(0, totalAmount - discountAmount);

  // Submit sale
  const handleSaveSale = async () => {
    if (cart.length === 0) {
      setSaleError('Cart is empty.');
      return;
    }
    setIsSavingSale(true);
    setSaleError('');
    setSaleSuccess('');
    try {
      const itemsPayload: PharmacySaleItem[] = cart.map((c) => ({
        pharmacyInventory: { id: c.drug.id },
        quantity: c.quantity,
        unitPrice: c.drug.unitPrice,
        total: c.quantity * c.drug.unitPrice
      }));

      const payload = {
        patientId: selectedPatient?.id || null,
        uhid: selectedPatient?.uhid || 'WALK-IN',
        totalAmount,
        discountAmount,
        netPayable,
        paymentMode,
        items: itemsPayload
      };

      const res = await fetch('/api/v1/pharmacy/sales', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to process sale');
      }

      setSaleSuccess('Pharmacy sale recorded successfully!');
      setCart([]);
      setSelectedPatient(null);
      setPatientSearchQuery('');
      setDiscountAmount(0);
      setTimeout(() => {
        setSaleSuccess('');
        setActiveSubTab('sales');
      }, 1500);
    } catch (err: any) {
      setSaleError(err.message || 'Error recording sale');
    } finally {
      setIsSavingSale(false);
    }
  };

  return (
    <div className="bg-white border border-[#D7E8EA] rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-[#D7E8EA] mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center space-x-2">
            <ShoppingCart className="text-[#147C8A] w-7 h-7" />
            <span>Pharmacy Desk & Inventory</span>
          </h1>
          <p className="text-xs text-[#64748B]">Manage drug inventories, stock intake, and record billing sales.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'inventory' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#1E293B] hover:bg-white'
            }`}
          >
            Inventory Stock
          </button>
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'sales' ? 'bg-[#147C8A] text-white' : 'bg-[#F8FBFB] text-[#1E293B] hover:bg-white'
            }`}
          >
            Sales History
          </button>
          <button
            onClick={() => {
              setCart([]);
              setSelectedPatient(null);
              setSaleError('');
              setSaleSuccess('');
              setActiveSubTab('new-sale');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'new-sale' ? 'bg-[#147C8A] text-white' : 'bg-[#147C8A] hover:bg-[#147C8A] text-white font-bold'
            }`}
          >
            + New Sale / Dispense
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-[#1E293B] flex items-center space-x-1.5">
              <Package className="w-4 h-4 text-[#147C8A]" />
              <span>Current Stock Status</span>
            </h3>
            <div className="flex space-x-2 w-full sm:w-auto">
              <button
                onClick={fetchInventory}
                disabled={inventoryLoading}
                className="p-2 bg-[#F8FBFB] border border-[#D7E8EA] hover:bg-[#EAF7F8] rounded-xl text-[#64748B] disabled:opacity-50 transition-colors"
                title="Refresh Inventory"
              >
                <RefreshCw className={`w-4 h-4 ${inventoryLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsAddStockOpen(true)}
                className="px-3.5 py-1.5 bg-[#147C8A] hover:bg-[#147C8A] text-white text-xs font-bold rounded-xl flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Adjust Stock</span>
              </button>
            </div>
          </div>

          {inventoryError && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-700" />
              <span>{inventoryError}</span>
            </div>
          )}

          {inventory.filter(item => item.currentStock <= 15).length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Inventory Alerts:</span> {inventory.filter(item => item.currentStock <= 15).length} items are running low on stock (less than 15 units remaining). Please reorder soon:
                <div className="mt-1 font-mono font-bold text-[10px] flex flex-wrap gap-1.5">
                  {inventory.filter(item => item.currentStock <= 15).map(item => (
                    <span key={item.id} className="bg-amber-100/80 border border-amber-200/50 px-2 py-0.5 rounded text-[9px]">
                      {item.drugName} ({item.currentStock} left)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {inventoryLoading ? (
            <div className="text-center py-12 text-[#64748B] text-xs">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 opacity-50" />
              <span>Loading current inventory...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#D7E8EA] bg-[#EAF7F8]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FBFB] text-[#64748B] border-b border-[#D7E8EA] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Drug Name</th>
                    <th className="py-3 px-4">Batch No.</th>
                    <th className="py-3 px-4">Expiry</th>
                    <th className="py-3 px-4 text-right">Current Stock</th>
                    <th className="py-3 px-4 text-right">Sale Price</th>
                    <th className="py-3 px-4 text-right">Purchase Price</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA]/40 text-[#1E293B] font-medium">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[#64748B]">
                        No inventory records found. Add stock to begin.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FBFB]/20 transition-colors">
                        <td className="py-3 px-4 font-mono text-[10px] text-[#64748B]">{item.drugCode}</td>
                        <td className="py-3 px-4 font-semibold text-[#1E293B]">{item.drugName}</td>
                        <td className="py-3 px-4 font-mono text-[10px] text-indigo-300">{item.batchNumber || 'N/A'}</td>
                        <td className="py-3 px-4 text-[#64748B]">{item.expiryDate || 'N/A'}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#1E293B]">
                          {item.currentStock} {item.currentStock <= 15 ? '⚠️' : ''}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700 font-bold">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-[#64748B]">₹{item.purchasePrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          {item.currentStock <= 0 ? (
                            <span className="bg-red-50 text-rose-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">OUT OF STOCK</span>
                          ) : item.currentStock <= 20 ? (
                            <span className="bg-amber-100/50 text-amber-700 border border-amber-900/50 px-2 py-0.5 rounded text-[10px] font-bold">LOW STOCK</span>
                          ) : (
                            <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">ADEQUATE</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedPatient(null);
                              addToCart(item);
                              setActiveSubTab('new-sale');
                            }}
                            disabled={item.currentStock <= 0}
                            className="px-2 py-1 bg-[#147C8A]/40 hover:bg-[#147C8A] border border-indigo-800 text-indigo-200 hover:text-[#1E293B] rounded text-[10px] font-bold disabled:opacity-30 disabled:hover:bg-[#147C8A]/40 transition-all"
                          >
                            Dispense
                          </button>
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

      {activeSubTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[#1E293B] flex items-center space-x-1.5">
              <ClipboardList className="w-4 h-4 text-[#147C8A]" />
              <span>Pharmacy Transaction Registry</span>
            </h3>
            <button
              onClick={fetchSales}
              disabled={salesLoading}
              className="p-2 bg-[#F8FBFB] border border-[#D7E8EA] hover:bg-[#EAF7F8] rounded-xl text-[#64748B] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${salesLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {salesError && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
              {salesError}
            </div>
          )}

          {salesLoading ? (
            <div className="text-center py-12 text-[#64748B] text-xs">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 opacity-50" />
              <span>Loading transaction registry...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#D7E8EA] bg-[#EAF7F8]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FBFB] text-[#64748B] border-b border-[#D7E8EA] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Sale ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Patient UHID</th>
                    <th className="py-3 px-4 text-right">Gross Total</th>
                    <th className="py-3 px-4 text-right">Discount</th>
                    <th className="py-3 px-4 text-right">Net Paid</th>
                    <th className="py-3 px-4 text-center">Pay Mode</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E8EA]/40 text-[#1E293B] font-medium">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#64748B]">
                        No sales recorded yet.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-[#F8FBFB]/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#147C8A]">#PHAR-{sale.id}</td>
                        <td className="py-3 px-4 text-[#64748B]">{sale.saleDate}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#1E293B]">{sale.uhid || 'WALK-IN'}</td>
                        <td className="py-3 px-4 text-right">₹{sale.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-rose-700">-₹{sale.discountAmount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">₹{sale.netPayable.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-[#64748B] font-mono text-[10px]">{sale.paymentMode}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-green-50 border border-green-200 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold">
                            {sale.paymentStatus || 'Paid'}
                          </span>
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

      {activeSubTab === 'new-sale' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Center: Sale setup & drug selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Search */}
            <div className="bg-[#EAF7F8] p-5 rounded-2xl border border-[#D7E8EA]">
              <h3 className="font-bold text-[#1E293B] mb-3 flex items-center space-x-1">
                <User className="w-4 h-4 text-[#147C8A]" />
                <span>Patient Assignment</span>
              </h3>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#64748B]" />
                </div>
                <input
                  type="text"
                  placeholder="Search patient by Name, Phone, or UHID (or leave empty for walk-in)..."
                  value={patientSearchQuery}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#D7E8EA] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>

              {isSearchingPatients && (
                <div className="text-[10px] text-[#64748B] mt-1">Searching patients...</div>
              )}

              {patientSearchResults.length > 0 && (
                <div className="mt-2 bg-white border border-[#D7E8EA] rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-[#D7E8EA]">
                  {patientSearchResults.map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(pat);
                        setPatientSearchResults([]);
                        setPatientSearchQuery(`${pat.patientName} (${pat.uhid})`);
                      }}
                      className="w-full p-2.5 text-left text-xs text-[#1E293B] hover:bg-[#F8FBFB] flex justify-between items-center"
                    >
                      <div>
                        <strong className="text-[#1E293B] block">{pat.patientName}</strong>
                        <span className="text-[10px] text-[#64748B] font-mono">UHID: {pat.uhid}</span>
                      </div>
                      <span className="text-[10px] text-[#147C8A] font-mono">{pat.mobile}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedPatient ? (
                <div className="mt-3 p-3 bg-[#EAF7F8]/20 border border-[#D7E8EA]/40 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[10px]">Selected Patient:</span>
                    <strong className="text-[#1E293B]">{selectedPatient.patientName}</strong>
                    <span className="text-[#64748B] ml-2 font-mono">({selectedPatient.uhid})</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      setPatientSearchQuery('');
                    }}
                    className="text-rose-700 hover:text-rose-700 text-[10px] font-bold"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="mt-3 text-[11px] text-[#64748B] italic">
                  No patient selected. Dispense will be recorded as a Walk-in Patient.
                </div>
              )}
            </div>

            {/* Drug Search Selection */}
            <div className="bg-[#EAF7F8] p-5 rounded-2xl border border-[#D7E8EA] space-y-4">
              <h3 className="font-bold text-[#1E293B] flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-[#147C8A]" />
                <span>Select Drugs to Dispense</span>
              </h3>
              
              {/* Quick load inventory list inside sale form */}
              <div className="max-h-72 overflow-y-auto border border-[#D7E8EA] rounded-xl divide-y divide-[#D7E8EA]">
                {inventory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#64748B]">
                    No inventory items loaded. Click 'Inventory Stock' tab first to load.
                  </div>
                ) : (
                  inventory.map((drug) => (
                    <div key={drug.id} className="p-3 hover:bg-[#F8FBFB] flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-[#1E293B]">{drug.drugName}</strong>
                        <span className="text-[#64748B] font-mono block text-[9px] mt-0.5">
                          Code: {drug.drugCode} | Batch: {drug.batchNumber} | Exp: {drug.expiryDate}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">₹{drug.unitPrice.toFixed(2)} / unit</span>
                      </div>
                      <div className="text-right flex items-center space-x-3">
                        <div>
                          <span className="text-[10px] text-[#64748B] block">Stock</span>
                          <strong className={`font-mono ${drug.currentStock <= 15 ? 'text-amber-600' : 'text-[#1E293B]'}`}>
                            {drug.currentStock}
                          </strong>
                        </div>
                        <button
                          onClick={() => addToCart(drug)}
                          disabled={drug.currentStock <= 0}
                          className="px-2.5 py-1 bg-[#147C8A]/80 hover:bg-[#147C8A] text-white rounded-lg text-[10px] font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Cart Summary & Checkout */}
          <div className="bg-[#EAF7F8]/20 p-5 rounded-2xl border border-[#D7E8EA] h-fit space-y-4">
            <h3 className="font-bold text-[#1E293B] flex items-center space-x-1.5 pb-2 border-b border-[#D7E8EA]">
              <ShoppingCart className="w-4 h-4 text-[#147C8A]" />
              <span>Dispensing Cart</span>
            </h3>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-[#64748B] text-xs">
                Cart is empty. Add drugs from the left pane to prepare transaction.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-[#D7E8EA] max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.drug.id} className="py-2.5 text-xs flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <strong className="text-[#1E293B] block leading-tight">{item.drug.drugName}</strong>
                        <span className="text-[10px] text-[#64748B] font-mono">₹{item.drug.unitPrice.toFixed(2)} ea</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max={item.drug.currentStock}
                          value={item.quantity}
                          onChange={(e) => updateCartQty(item.drug.id, parseInt(e.target.value) || 0)}
                          className="w-12 bg-white border border-[#D7E8EA] text-center text-xs py-1 rounded text-[#1E293B]"
                        />
                        <button
                          onClick={() => removeFromCart(item.drug.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#D7E8EA] space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Gross Total:</span>
                    <strong className="text-[#1E293B] font-mono">₹{totalAmount.toFixed(2)}</strong>
                  </div>

                  <div className="flex justify-between items-center text-[#64748B]">
                    <span>Discount Amount:</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                        className="w-16 bg-white border border-[#D7E8EA] text-right text-xs py-0.5 px-1 rounded text-[#1E293B]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[#64748B]">
                    <span>Payment Mode:</span>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="border text-xs py-0.5 rounded bg-[#EAF7F8] text-[#147C8A] font-semibold border-[#D7E8EA] transition-colors"
                    >
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Cash">Cash</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="UPI">UPI / QR</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Card">Card</option>
                      <option className="bg-[#EAF7F8] text-[#147C8A] font-semibold" value="Credit">Credit / Due</option>
                    </select>
                  </div>

                  <div className="flex justify-between border-t border-[#D7E8EA] pt-3 text-sm">
                    <span className="font-bold text-[#1E293B]">Net Payable:</span>
                    <strong className="text-emerald-700 font-mono text-base">₹{netPayable.toFixed(2)}</strong>
                  </div>
                </div>

                {saleError && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-[11px]">
                    {saleError}
                  </div>
                )}

                {saleSuccess && (
                  <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-[11px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{saleSuccess}</span>
                  </div>
                )}

                <button
                  onClick={handleSaveSale}
                  disabled={isSavingSale}
                  className="w-full py-2 bg-[#22C55E] hover:bg-emerald-700 disabled:opacity-50 text-[#1E293B] text-xs font-bold rounded-xl transition-all uppercase flex justify-center items-center space-x-1"
                >
                  {isSavingSale ? 'Processing...' : 'Complete Dispense'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Adjust Stock Modal */}
      {isAddStockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#EAF7F8] backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddStock}
            className="w-full max-w-md bg-white border border-[#D7E8EA] rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-[#1E293B] mb-2">Replenish Pharmacy Inventory</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#64748B] mb-1">Drug Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PCM-500"
                  value={stockForm.drugCode}
                  onChange={(e) => setStockForm({ ...stockForm, drugCode: e.target.value })}
                  className="w-full p-2 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Drug Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 500mg"
                  value={stockForm.drugName}
                  onChange={(e) => setStockForm({ ...stockForm, drugName: e.target.value })}
                  className="w-full p-2 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#64748B] mb-1">Batch Number</label>
                <input
                  type="text"
                  placeholder="e.g. B98234"
                  value={stockForm.batchNumber}
                  onChange={(e) => setStockForm({ ...stockForm, batchNumber: e.target.value })}
                  className="w-full p-2 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)]"
                />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={stockForm.expiryDate}
                  onChange={(e) => setStockForm({ ...stockForm, expiryDate: e.target.value })}
                  className="w-full p-2 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none focus:border-[#147C8A] focus:shadow-[0_0_0_3px_rgba(20,124,138,0.12)] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[#64748B] mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Sale Price *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={stockForm.unitPrice}
                  onChange={(e) => setStockForm({ ...stockForm, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#64748B] mb-1">Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={stockForm.purchasePrice}
                  onChange={(e) => setStockForm({ ...stockForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-[#F8FBFB] border border-[#D7E8EA] rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            {addStockError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl">
                {addStockError}
              </div>
            )}

            {addStockSuccess && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{addStockSuccess}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddStockOpen(false)}
                className="px-4 py-2 bg-[#F8FBFB] hover:bg-[#F8FBFB] text-[#1E293B] rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#147C8A] hover:bg-[#147C8A] text-white rounded-xl font-bold"
              >
                Update Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
