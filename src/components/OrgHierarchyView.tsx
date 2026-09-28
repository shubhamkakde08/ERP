import React, { useState } from 'react';
import { Tenant, Company, Plant, Warehouse } from '../types/erp.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Factory,
  Building2,
  Warehouse as WarehouseIcon,
  Plus,
  ShieldCheck,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  X,
} from 'lucide-react';

interface OrgHierarchyViewProps {
  tenant: Tenant | null;
  companies: Company[];
  plants: Plant[];
  warehouses: Warehouse[];
  onRefresh: () => void;
}

export const OrgHierarchyView: React.FC<OrgHierarchyViewProps> = ({
  tenant,
  companies,
  plants,
  warehouses,
  onRefresh,
}) => {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<'plants' | 'warehouses' | 'companies' | 'fy'>('plants');
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Plant
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [plantType, setPlantType] = useState('MANUFACTURING');
  const [address, setAddress] = useState('');
  const [stateCode, setStateCode] = useState('22');
  const [gstin, setGstin] = useState('');

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/v1/plants', {
        method: 'POST',
        body: JSON.stringify({
          divisionId: '00000000-0000-0000-0000-000000000000', // resolved by backend
          code,
          name,
          plantType,
          address,
          stateCode,
          gstin,
        }),
      });

      if (res.ok) {
        setIsPlantModalOpen(false);
        setCode('');
        setName('');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create plant');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating plant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Enterprise Architecture / Tenant Hierarchy
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Organizational Structure & Multi-Tenant Isolation
          </h1>
        </div>

        {activeTab === 'plants' && (
          <button
            onClick={() => setIsPlantModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Integrated Plant</span>
          </button>
        )}
      </div>

      {/* Tenant Isolation Status Banner */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-xs">
        <div>
          <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
            Multi-Tenant Isolation Active
          </div>
          <div className="font-bold text-sm text-white mt-0.5">
            {tenant?.name || 'Apex Steel & Power Industries Ltd'} ({tenant?.code || 'T-STEEL-01'})
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">
            Tenant ID: <span className="font-mono">{tenant?.id || 'PostgreSQL UUID'}</span> • Cloud SQL Region: asia-southeast1
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-semibold text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Zero Data Leakage Enforced
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('plants')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeTab === 'plants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Plants & Mills ({plants.length})
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeTab === 'warehouses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Warehouses & Yards ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeTab === 'companies'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Legal Entities ({companies.length})
        </button>
        <button
          onClick={() => setActiveTab('fy')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeTab === 'fy'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Financial Years
        </button>
      </div>

      {/* Tab 1: Plants */}
      {activeTab === 'plants' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Plant Code</th>
                <th className="py-2.5 px-3">Facility Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">State Code</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3">Address</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plants.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">
                    {p.code}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {p.name}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                      {p.plantType}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono">{p.stateCode}</td>
                  <td className="py-2 px-3 font-mono">{p.gstin || '-'}</td>
                  <td className="py-2 px-3 text-[11px] text-slate-600">{p.address}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      OPERATIONAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Warehouses */}
      {activeTab === 'warehouses' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Warehouse Code</th>
                <th className="py-2.5 px-3">Godown / Yard Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Location Inside Plant</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {warehouses.map((w) => (
                <tr key={w.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">
                    {w.code}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {w.name}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200">
                      {w.warehouseType}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-600">{w.location}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Companies */}
      {activeTab === 'companies' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Company Code</th>
                <th className="py-2.5 px-3">Legal Name</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3">PAN</th>
                <th className="py-2.5 px-3">Currency</th>
                <th className="py-2.5 px-3">Registered Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">
                    {c.code}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {c.legalName || c.name}
                  </td>
                  <td className="py-2 px-3 font-mono">{c.gstin}</td>
                  <td className="py-2 px-3 font-mono">{c.pan}</td>
                  <td className="py-2 px-3 font-mono">{c.currency}</td>
                  <td className="py-2 px-3 text-[11px] text-slate-600">{c.registeredAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Financial Years */}
      {activeTab === 'fy' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                Financial Periods & Books Freeze Control
              </h2>
              <p className="text-xs text-slate-500">
                Prevent retroactive backdated entries and unauthorized adjustments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-emerald-200 bg-emerald-50/20 p-4 rounded">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  FY 2026-27 (Current Financial Year)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  OPEN FOR POSTING
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <div>Period: 01-Apr-2026 to 31-Mar-2027</div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Transaction entries authorized for current date range
                </div>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50 p-4 rounded opacity-75">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  FY 2025-26 (Preceding Financial Year)
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> AUDITED & LOCKED
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <div>Period: 01-Apr-2025 to 31-Mar-2026</div>
                <div>Statutory Audit Complete • No further postings permitted</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Plant Modal */}
      {isPlantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Plant Master
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Register Manufacturing Plant
                </h3>
              </div>
              <button
                onClick={() => setIsPlantModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlant} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Plant Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PLT-NAGPUR"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Plant Type
                  </label>
                  <select
                    value={plantType}
                    onChange={(e) => setPlantType(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                  >
                    <option value="MANUFACTURING">Direct Manufacturing</option>
                    <option value="ROLLING_MILL">Rolling Mills</option>
                    <option value="PROCESSING">Processing Unit</option>
                    <option value="TRADING">Trading Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Plant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagpur Wire Rod & Structural Mill"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State Code (GST)
                  </label>
                  <input
                    type="text"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Address & Coordinates
                </label>
                <input
                  type="text"
                  required
                  placeholder="Plot No, Industrial Estate, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPlantModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Save Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
