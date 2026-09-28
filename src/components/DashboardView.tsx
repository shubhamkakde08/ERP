import React from 'react';
import {
  Package,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Truck,
  Factory,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PlusCircle,
  FileCheck,
} from 'lucide-react';
import { NavView } from './Sidebar.tsx';
import { AuditLog, WorkflowInstance } from '../types/erp.ts';

interface DashboardViewProps {
  metrics: any;
  recentAudits: AuditLog[];
  workflows: WorkflowInstance[];
  onNavigate: (view: NavView) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentAudits,
  workflows,
  onNavigate,
  onRefresh,
  isLoading,
}) => {
  const pendingWorkflows = workflows.filter((w) => w.status === 'PENDING');

  return (
    <div className="p-5 space-y-5 font-sans">
      {/* Top Banner / Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <span>ApexERP Platform</span>
            <span>/</span>
            <span>Operations & Corporate Governance</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Executive Dashboard</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Enterprise Command Center • Steel & Manufacturing
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigate('procurement')}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Procurement & Logistics</span>
          </button>
          <button
            onClick={() => onNavigate('items')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Item</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Inventory Valuation */}
        <div className="bg-white border border-slate-200 rounded p-3.5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Total Inventory Valuation
            </span>
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {metrics?.inventoryValuation || '₹ 14.85 Cr'}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span>{metrics?.totalItems || 5} active item masters</span>
            <span className="text-emerald-600 flex items-center font-medium">
              <ArrowUpRight className="w-3 h-3" /> +3.2% vs target
            </span>
          </div>
        </div>

        {/* Card 2: Trade Receivables */}
        <div className="bg-white border border-slate-200 rounded p-3.5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Trade Receivables (AR)
            </span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {metrics?.receivablesOutstanding || '₹ 4.12 Cr'}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span>{metrics?.customersCount || 2} enterprise clients</span>
            <span className="text-slate-500">Avg credit: 37 days</span>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-white border border-amber-200 bg-amber-50/20 rounded p-3.5 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-amber-700 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Pending Approvals (Maker/Checker)
            </span>
            <span className="p-1 rounded bg-amber-100 text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-xl font-bold text-amber-900">
              {pendingWorkflows.length} Document(s)
            </div>
            <button
              onClick={() => onNavigate('workflows')}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Action Desk →
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-100 text-[11px] text-amber-800">
            <span>Tiered PO & Financial Vouchers</span>
            <span className="font-medium text-amber-700">Action required</span>
          </div>
        </div>

        {/* Card 4: Daily Despatch & Yard Logistics */}
        <div className="bg-white border border-slate-200 rounded p-3.5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Despatch & Yard Logistics
            </span>
            <span className="p-1 rounded bg-purple-50 text-purple-600">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {metrics?.dailyDespatchMT || '1,420 MT'}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span>{metrics?.activeVehiclesInYard || 18} vehicles in plant yard</span>
            <span className="text-purple-600 font-medium">
              {metrics?.awaitingWeighment || 4} awaiting gross wt
            </span>
          </div>
        </div>
      </div>

      {/* Main Section: Operations Matrix & Approvals Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Steel Production & Organizational Structure */}
        <div className="lg:col-span-2 space-y-5">
          {/* Manufacturing Units & Rolling Mills */}
          <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Integrated Plants & Rolling Facilities Status
                </h2>
              </div>
              <button
                onClick={() => onNavigate('plants')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Manage Plants →
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded p-3 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    Raipur Integrated Steel Plant
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    RUNNING
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Code: PLT-RAIPUR • Type: Direct Manufacturing
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] border-t border-slate-200 pt-2 text-slate-600">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">850 MT</div>
                    <div>Furnace Melt</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">790 MT</div>
                    <div>Hot Billet Cast</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-700 text-xs">92.9%</div>
                    <div>Yield Eff.</div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    Bhilai Rolling Mills Unit
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ACTIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Code: PLT-BHILAI • Type: Continuous Rebar Rolling
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] border-t border-slate-200 pt-2 text-slate-600">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">630 MT</div>
                    <div>12mm/16mm TMT</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">48 Bndl</div>
                    <div>Dispatched</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-700 text-xs">100%</div>
                    <div>IS 1786 QC</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Master Data Shortcuts */}
          <div className="bg-white border border-slate-200 rounded shadow-xs p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Master Data Repositories (PostgreSQL)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => onNavigate('items')}
                className="p-3 border border-slate-200 hover:border-blue-400 rounded text-left transition hover:bg-blue-50/20 group cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                  Item Master
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Steel grades, Scrap, Rebars</div>
              </button>

              <button
                onClick={() => onNavigate('partners')}
                className="p-3 border border-slate-200 hover:border-blue-400 rounded text-left transition hover:bg-blue-50/20 group cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                  Business Partners
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Customers, Suppliers, GSTIN</div>
              </button>

              <button
                onClick={() => onNavigate('gl_accounts')}
                className="p-3 border border-slate-200 hover:border-blue-400 rounded text-left transition hover:bg-blue-50/20 group cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                  Chart of Accounts
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Double-entry GL Ledgers</div>
              </button>

              <button
                onClick={() => onNavigate('gst')}
                className="p-3 border border-slate-200 hover:border-blue-400 rounded text-left transition hover:bg-blue-50/20 group cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                  GST & Tax Master
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">HSN codes & RCM Rules</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow Approvals & Live Audit Trail */}
        <div className="space-y-5">
          {/* Pending Approval Queue */}
          <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Maker / Checker Queue
                </h2>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                {pendingWorkflows.length} Pending
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingWorkflows.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No documents pending approval at this time.
                </div>
              ) : (
                pendingWorkflows.slice(0, 3).map((w) => (
                  <div key={w.id} className="p-3 hover:bg-slate-50/60 transition text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {w.documentType} #{w.documentId}
                      </span>
                      <span className="font-mono font-semibold text-slate-700">
                        ₹ {Number(w.documentAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Initiated by: {w.requestedBy}</span>
                      <span className="text-blue-600 font-medium">Level {w.currentLevel}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-slate-50/60 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigate('workflows')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Open Full Approval Desk →
              </button>
            </div>
          </div>

          {/* Real-time Enterprise Audit Trail Feed */}
          <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  PostgreSQL Audit Stream
                </h2>
              </div>
              <button
                onClick={() => onNavigate('audit')}
                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                All Logs →
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {recentAudits.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No audit logs recorded yet.
                </div>
              ) : (
                recentAudits.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 text-xs hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {log.action} • {log.entityType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                      {log.reason || `Target: ${log.entityId}`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                      <span>{log.userEmail}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
