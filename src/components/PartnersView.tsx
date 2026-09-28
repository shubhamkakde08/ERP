import React, { useState } from 'react';
import { BusinessPartner } from '../types/erp.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Users2,
  Plus,
  Search,
  Download,
  Filter,
  Building,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';

interface PartnersViewProps {
  partners: BusinessPartner[];
  onRefresh: () => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ partners, onRefresh }) => {
  const { authFetch } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<BusinessPartner | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [partnerType, setPartnerType] = useState('CUSTOMER');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [creditLimit, setCreditLimit] = useState('5000000.00');
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Chhattisgarh');
  const [stateCode, setStateCode] = useState('22');
  const [pincode, setPincode] = useState('492001');

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.gstin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || p.partnerType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !gstin) return;

    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/v1/business-partners', {
        method: 'POST',
        body: JSON.stringify({
          code,
          name,
          partnerType,
          gstin,
          pan: pan || gstin.substring(2, 12),
          email,
          phone,
          creditLimit,
          paymentTermsDays,
          address,
          city,
          state,
          stateCode,
          pincode,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setCode('');
        setName('');
        setGstin('');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create partner');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Code', 'Name', 'Type', 'GSTIN', 'PAN', 'Credit Limit', 'Terms Days'];
    const rows = filteredPartners.map((p) => [
      `"${p.code}"`,
      `"${p.name}"`,
      p.partnerType,
      p.gstin,
      p.pan,
      p.creditLimit,
      p.paymentTermsDays,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Business_Partners_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-5 space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Commercial Master Data
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            Business Partner Master (Customers & Suppliers)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Business Partner</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search partner by name, code or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">Partner Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none bg-white font-medium"
          >
            <option value="ALL">All Partners ({partners.length})</option>
            <option value="CUSTOMER">Customers (Sundry Debtors)</option>
            <option value="SUPPLIER">Suppliers (Sundry Creditors)</option>
          </select>
        </div>
      </div>

      {/* Enterprise Grid */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Partner Code</th>
              <th className="py-2.5 px-3">Company / Legal Entity</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">GSTIN & PAN</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3 text-right">Credit Limit</th>
              <th className="py-2.5 px-3 text-center">Payment Terms</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPartners.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No business partners found.
                </td>
              </tr>
            ) : (
              filteredPartners.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  onClick={() => setSelectedPartner(p)}
                >
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">
                    {p.code}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900 max-w-sm truncate">
                    {p.name}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        p.partnerType === 'CUSTOMER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {p.partnerType}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                    <div>{p.gstin}</div>
                    <div className="text-[10px] text-slate-400">PAN: {p.pan}</div>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-600">
                    {p.city}, {p.state} ({p.stateCode})
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    ₹ {Number(p.creditLimit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-center font-medium">
                    {p.paymentTermsDays} Days
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Partner Profile
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {selectedPartner.code} - {selectedPartner.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-500">Partner Type:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedPartner.partnerType}</span>
              </div>
              <div>
                <span className="text-slate-500">GSTIN:</span>{' '}
                <span className="font-semibold text-slate-800 font-mono">{selectedPartner.gstin}</span>
              </div>
              <div>
                <span className="text-slate-500">Credit Limit:</span>{' '}
                <span className="font-semibold text-slate-800">₹ {selectedPartner.creditLimit}</span>
              </div>
              <div>
                <span className="text-slate-500">Payment Terms:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedPartner.paymentTermsDays} Days</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Address:</span>{' '}
                <span className="text-slate-800">{selectedPartner.address}, {selectedPartner.city}, {selectedPartner.state} - {selectedPartner.pincode}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-lg max-w-2xl w-full p-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Partner Registration
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Create Business Partner Profile
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Partner Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CUST-003 or SUPP-004"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Partner Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                  >
                    <option value="CUSTOMER">Customer (Debtor)</option>
                    <option value="SUPPLIER">Supplier (Creditor)</option>
                    <option value="BOTH">Both Customer & Supplier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Legal Registered Entity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Highways Authority Contractor Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GSTIN (15 Digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    value={gstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setGstin(val);
                      if (val.length >= 12) {
                        setPan(val.substring(2, 12));
                        setStateCode(val.substring(0, 2));
                      }
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Permanent Account Number (PAN)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. AAAAA0000A"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Authorized Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Terms (Days)
                  </label>
                  <input
                    type="number"
                    value={paymentTermsDays}
                    onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registered Address
                </label>
                <input
                  type="text"
                  placeholder="Plot / Street / Industrial Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Save Partner Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
