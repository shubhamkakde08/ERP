import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Building2,
  Factory,
  Calendar,
  Search,
  CheckCircle2,
  ShieldAlert,
  LogOut,
  UserCheck,
  ChevronDown,
  Database,
  Sparkles,
} from 'lucide-react';

interface TopBarProps {
  onOpenSearch: () => void;
  pendingApprovalsCount: number;
  onNavigateToWorkflows: () => void;
  onOpenChatbot?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  pendingApprovalsCount,
  onNavigateToWorkflows,
  onOpenChatbot,
}) => {
  const {
    currentUser,
    firebaseUser,
    currentCompanyCode,
    currentPlantCode,
    currentFY,
    setCurrentCompanyCode,
    setCurrentPlantCode,
    setCurrentFY,
    switchRole,
    signInWithGoogle,
    signOut,
  } = useAuth();

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 text-slate-100 px-4 flex items-center justify-between z-30 sticky top-0 font-sans shadow-sm select-none">
      {/* Brand & System Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-black tracking-wider text-white shadow-sm text-sm border border-blue-400">
            APX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white uppercase">
                ApexERP
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/80">
                SaaS Enterprise
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Steel & Manufacturing Edition</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-0.5">
                <Database className="w-2.5 h-2.5" /> Cloud SQL (asia-southeast1)
              </span>
            </div>
          </div>
        </div>

        {/* Global ERP Omnibox Search trigger */}
        <button
          onClick={onOpenSearch}
          className="ml-4 flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded text-xs transition-colors w-64 md:w-80 group cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
          <span className="flex-1 text-left truncate">
            Search items, partners, PO, GL, plant...
          </span>
          <kbd className="hidden sm:inline-block bg-slate-900 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Organizational Context Filters & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Company Selector */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 px-2.5 py-1 rounded text-slate-200">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400 text-[11px]">Co:</span>
          <select
            value={currentCompanyCode}
            onChange={(e) => setCurrentCompanyCode(e.target.value)}
            className="bg-transparent font-medium focus:outline-none cursor-pointer text-slate-100"
          >
            <option value="COMP-1000" className="bg-slate-900 text-slate-100">
              COMP-1000 (Apex Steel Ltd)
            </option>
          </select>
        </div>

        {/* Plant Selector */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 px-2.5 py-1 rounded text-slate-200">
          <Factory className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 text-[11px]">Plant:</span>
          <select
            value={currentPlantCode}
            onChange={(e) => setCurrentPlantCode(e.target.value)}
            className="bg-transparent font-medium focus:outline-none cursor-pointer text-slate-100"
          >
            <option value="PLT-RAIPUR" className="bg-slate-900 text-slate-100">
              PLT-RAIPUR (Raipur Plant)
            </option>
            <option value="PLT-BHILAI" className="bg-slate-900 text-slate-100">
              PLT-BHILAI (Bhilai Rolling Mills)
            </option>
          </select>
        </div>

        {/* Financial Year */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 px-2.5 py-1 rounded text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400 text-[11px]">FY:</span>
          <select
            value={currentFY}
            onChange={(e) => setCurrentFY(e.target.value)}
            className="bg-transparent font-medium focus:outline-none cursor-pointer text-slate-100"
          >
            <option value="FY 2026-27" className="bg-slate-900 text-slate-100">
              FY 2026-27 (Active)
            </option>
            <option value="FY 2025-26" className="bg-slate-900 text-slate-100">
              FY 2025-26 (Audited)
            </option>
          </select>
        </div>

        {/* Pending Approvals Badge */}
        <button
          onClick={onNavigateToWorkflows}
          className="relative flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 px-2.5 py-1 rounded text-slate-200 transition-colors cursor-pointer"
          title="Pending Workflow Approvals"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-[11px]">Approvals</span>
          {pendingApprovalsCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        {/* Gemini AI Copilot Button */}
        {onOpenChatbot && (
          <button
            onClick={onOpenChatbot}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/40 text-white px-2.5 py-1 rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Open ApexAI Assistant & Document Intelligence"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px]">ApexAI Copilot</span>
          </button>
        )}

        {/* Role Switcher (Maker/Checker Testing) */}
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-200">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={currentUser.role}
            onChange={(e) => switchRole(e.target.value as any)}
            className="bg-transparent font-semibold text-[11px] focus:outline-none cursor-pointer text-indigo-300"
            title="Switch ERP Actor Role"
          >
            <option value="ADMIN" className="bg-slate-900 text-slate-100">
              Role: System Administrator
            </option>
            <option value="FINANCE_HEAD" className="bg-slate-900 text-slate-100">
              Role: Head of Finance (CFO)
            </option>
            <option value="PROCUREMENT_MGR" className="bg-slate-900 text-slate-100">
              Role: Procurement Manager
            </option>
            <option value="PLANT_MGR" className="bg-slate-900 text-slate-100">
              Role: Plant Head
            </option>
          </select>
        </div>

        {/* Authentication Button or User Pill */}
        {firebaseUser ? (
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 pl-2 pr-1 py-0.5 rounded">
            <div className="flex flex-col text-right">
              <span className="font-semibold text-[11px] text-slate-200 truncate max-w-[120px]">
                {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
              </span>
              <span className="text-[9px] text-emerald-400">Authenticated</span>
            </div>
            <button
              onClick={signOut}
              className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium px-2.5 py-1 rounded text-xs transition shadow-sm cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
