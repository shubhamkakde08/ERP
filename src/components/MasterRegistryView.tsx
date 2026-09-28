import React, { useState } from 'react';
import { UOM, GSTMaster, CostCenter } from '../types/erp.ts';
import { Scale, Percent, PieChart, CheckCircle2 } from 'lucide-react';

interface MasterRegistryViewProps {
  uoms: UOM[];
  gsts: GSTMaster[];
  costCenters: CostCenter[];
  activeSubTab: 'uoms' | 'gst' | 'cost_centers';
  setActiveSubTab: (tab: 'uoms' | 'gst' | 'cost_centers') => void;
}

export const MasterRegistryView: React.FC<MasterRegistryViewProps> = ({
  uoms,
  gsts,
  costCenters,
  activeSubTab,
  setActiveSubTab,
}) => {
  return (
    <div className="p-5 space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Master Data Foundation / Units & Statutory Rules
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            Units of Measure, GST Rates & Cost Centers
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('uoms')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeSubTab === 'uoms'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Units of Measure (UOM) ({uoms.length})
        </button>
        <button
          onClick={() => setActiveSubTab('gst')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeSubTab === 'gst'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          GST & HSN/SAC Master ({gsts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('cost_centers')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeSubTab === 'cost_centers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cost Centers ({costCenters.length})
        </button>
      </div>

      {/* Subtab: UOM */}
      {activeSubTab === 'uoms' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">UOM Code</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3 text-center">Decimal Places</th>
                <th className="py-2.5 px-3 text-center">Standard ISO</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uoms.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/20">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{u.code}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{u.name}</td>
                  <td className="py-2 px-3 text-center font-mono">{u.decimalPlaces}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      STANDARD
                    </span>
                  </td>
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

      {/* Subtab: GST */}
      {activeSubTab === 'gst' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">HSN / SAC Code</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">IGST %</th>
                <th className="py-2.5 px-3 text-right">CGST %</th>
                <th className="py-2.5 px-3 text-right">SGST %</th>
                <th className="py-2.5 px-3 text-center">RCM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gsts.map((g) => (
                <tr key={g.id} className="hover:bg-blue-50/20">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{g.hsnSacCode}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{g.description}</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {g.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">{g.igstRate}%</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">{g.cgstRate}%</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">{g.sgstRate}%</td>
                  <td className="py-2 px-3 text-center">
                    {g.rcmApplicable ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        REVERSE CHARGE
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">NO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subtab: Cost Centers */}
      {activeSubTab === 'cost_centers' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Cost Center Code</th>
                <th className="py-2.5 px-3">Center Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Production Line</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {costCenters.map((cc) => (
                <tr key={cc.id} className="hover:bg-blue-50/20">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{cc.code}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{cc.name}</td>
                  <td className="py-2 px-3 text-slate-600">{cc.department}</td>
                  <td className="py-2 px-3 text-center">
                    {cc.isProduction ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        SHOP FLOOR
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">OVERHEAD</span>
                    )}
                  </td>
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
    </div>
  );
};
