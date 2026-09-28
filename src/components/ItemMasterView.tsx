import React, { useState } from 'react';
import { Item, UOM, GSTMaster } from '../types/erp.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Package,
  Plus,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  X,
} from 'lucide-react';

interface ItemMasterViewProps {
  items: Item[];
  uoms: UOM[];
  gsts: GSTMaster[];
  onRefresh: () => void;
}

export const ItemMasterView: React.FC<ItemMasterViewProps> = ({
  items,
  uoms,
  gsts,
  onRefresh,
}) => {
  const { authFetch } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // New Item Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [itemGroup, setItemGroup] = useState('FINISHED_GOODS');
  const [itemCategory, setItemCategory] = useState('STEEL_REBAR');
  const [uomId, setUomId] = useState(uoms[0]?.id || '');
  const [hsnSacId, setHsnSacId] = useState(gsts[0]?.id || '');
  const [valuationMethod, setValuationMethod] = useState('WEIGHTED_AVERAGE');
  const [standardCost, setStandardCost] = useState('46000.00');
  const [sellingPrice, setSellingPrice] = useState('52000.00');
  const [minStockLevel, setMinStockLevel] = useState('20.000');
  const [maxStockLevel, setMaxStockLevel] = useState('1500.000');
  const [reorderPoint, setReorderPoint] = useState('50.000');
  const [isQualityCheckRequired, setIsQualityCheckRequired] = useState(true);
  const [isBatchManaged, setIsBatchManaged] = useState(true);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup =
      selectedGroup === 'ALL' || item.itemGroup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/v1/items', {
        method: 'POST',
        body: JSON.stringify({
          code,
          name,
          itemGroup,
          itemCategory,
          uomId: uomId || uoms[0]?.id,
          hsnSacId: hsnSacId || null,
          valuationMethod,
          standardCost,
          sellingPrice,
          minStockLevel,
          maxStockLevel,
          reorderPoint,
          isQualityCheckRequired,
          isBatchManaged,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        // Reset form
        setCode('');
        setName('');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create item');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Code', 'Name', 'Group', 'Standard Cost', 'Selling Price', 'Valuation Method'];
    const rows = filteredItems.map((i) => [
      `"${i.code}"`,
      `"${i.name}"`,
      i.itemGroup,
      i.standardCost,
      i.sellingPrice,
      i.valuationMethod,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Item_Master_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Master Data / Material Management
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Item Master Registry
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
            <span>New Item Master</span>
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
              placeholder="Search by item code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">Group:</span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none bg-white font-medium"
          >
            <option value="ALL">All Groups ({items.length})</option>
            <option value="FINISHED_GOODS">Finished Goods (TMT)</option>
            <option value="RAW_MATERIAL">Raw Materials (DRI, Scrap)</option>
            <option value="SEMI_FINISHED">Semi-Finished (Billets)</option>
            <option value="SPARES">Plant Spares</option>
          </select>
        </div>
      </div>

      {/* Enterprise High-Density Grid */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Item Code</th>
              <th className="py-2.5 px-3">Description & Specification</th>
              <th className="py-2.5 px-3">Item Group</th>
              <th className="py-2.5 px-3">Valuation</th>
              <th className="py-2.5 px-3 text-right">Standard Cost</th>
              <th className="py-2.5 px-3 text-right">Selling Price</th>
              <th className="py-2.5 px-3 text-center">Batch</th>
              <th className="py-2.5 px-3 text-center">QC Check</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No items match the filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">
                    {item.code}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate">
                    {item.name}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        item.itemGroup === 'FINISHED_GOODS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.itemGroup === 'RAW_MATERIAL'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.itemGroup}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-500">
                    {item.valuationMethod}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                    ₹ {Number(item.standardCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    ₹ {Number(item.sellingPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {item.isBatchManaged ? (
                      <span className="text-[10px] text-emerald-600 font-bold">YES</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">NO</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {item.isQualityCheckRequired ? (
                      <span className="text-[10px] text-blue-600 font-bold">MANDATORY</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">OPTIONAL</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Item Detail Inspector Drawer/Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Item Specifications
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {selectedItem.code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm font-semibold text-slate-800">
              {selectedItem.name}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-500">Group:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedItem.itemGroup}</span>
              </div>
              <div>
                <span className="text-slate-500">Valuation:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedItem.valuationMethod}</span>
              </div>
              <div>
                <span className="text-slate-500">Standard Cost:</span>{' '}
                <span className="font-semibold text-slate-800">₹ {selectedItem.standardCost}</span>
              </div>
              <div>
                <span className="text-slate-500">Selling Price:</span>{' '}
                <span className="font-semibold text-slate-800">₹ {selectedItem.sellingPrice}</span>
              </div>
              <div>
                <span className="text-slate-500">Reorder Level:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedItem.reorderPoint} MT</span>
              </div>
              <div>
                <span className="text-slate-500">Max Capacity:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedItem.maxStockLevel} MT</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Item Master Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-lg max-w-2xl w-full p-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Master Data Provisioning
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Register New Item Master Record
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Item Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TMT-550D-20MM"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Item Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={itemGroup}
                    onChange={(e) => setItemGroup(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="FINISHED_GOODS">Finished Goods (TMT Rebars)</option>
                    <option value="RAW_MATERIAL">Raw Material (DRI / Scrap)</option>
                    <option value="SEMI_FINISHED">Semi-Finished (Billets / Blooms)</option>
                    <option value="SPARES">Mechanical & Electrical Spares</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item Description & Technical Specification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Fe 550D Thermo-Mechanically Treated Rebar 20mm (IS 1786:2008)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unit of Measure (UOM)
                  </label>
                  <select
                    value={uomId}
                    onChange={(e) => setUomId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    {uoms.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code} - {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    HSN/SAC Code
                  </label>
                  <select
                    value={hsnSacId}
                    onChange={(e) => setHsnSacId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    {gsts.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.hsnSacCode} ({g.igstRate}% GST)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valuation Method
                  </label>
                  <select
                    value={valuationMethod}
                    onChange={(e) => setValuationMethod(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="WEIGHTED_AVERAGE">Weighted Average (Perpetual)</option>
                    <option value="FIFO">First-In First-Out (FIFO)</option>
                    <option value="STANDARD">Standard Cost</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Standard Cost (₹ / Unit)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={standardCost}
                    onChange={(e) => setStandardCost(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Selling Price (₹ / Unit)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reorder Point
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Stock Level
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={maxStockLevel}
                    onChange={(e) => setMaxStockLevel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isQualityCheckRequired}
                    onChange={(e) => setIsQualityCheckRequired(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-medium text-slate-700">
                    Mandatory Quality Inspection (QC)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBatchManaged}
                    onChange={(e) => setIsBatchManaged(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-medium text-slate-700">
                    Batch / Heat Number Traceability
                  </span>
                </label>
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
                  {isSubmitting ? 'Saving to Database...' : 'Commit Item Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
