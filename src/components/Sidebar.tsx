import React from 'react';
import {
  LayoutDashboard,
  Package,
  Users2,
  BookOpen,
  PieChart,
  Scale,
  Percent,
  Building2,
  Factory,
  Warehouse as WarehouseIcon,
  ShieldCheck,
  CheckSquare,
  History,
  FileSpreadsheet,
  ChevronRight,
  Layers,
  Truck,
  Flame,
  Award,
  ShoppingCart,
  FolderArchive,
  Bot,
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'procurement'
  | 'documents'
  | 'items'
  | 'partners'
  | 'gl_accounts'
  | 'cost_centers'
  | 'uoms'
  | 'gst'
  | 'tenants'
  | 'plants'
  | 'warehouses'
  | 'financial_years'
  | 'users_roles'
  | 'workflows'
  | 'audit';

interface SidebarProps {
  activeView: NavView;
  setActiveView: (view: NavView) => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  pendingApprovalsCount,
}) => {
  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'procurement', label: 'Procurement Dashboard', icon: ShoppingCart },
        { id: 'documents', label: 'Document Vault (DMS)', icon: FolderArchive },
      ],
    },
    {
      title: 'MASTER DATA',
      items: [
        { id: 'items', label: 'Item Master (Steel & Spares)', icon: Package },
        { id: 'partners', label: 'Business Partners (Cust/Supp)', icon: Users2 },
        { id: 'gl_accounts', label: 'Chart of Accounts (GL)', icon: BookOpen },
        { id: 'cost_centers', label: 'Cost Centers & Shops', icon: PieChart },
        { id: 'uoms', label: 'Units of Measure (UOM)', icon: Scale },
        { id: 'gst', label: 'GST & HSN/SAC Master', icon: Percent },
      ],
    },
    {
      title: 'ORGANIZATION HIERARCHY',
      items: [
        { id: 'plants', label: 'Plants & Manufacturing Units', icon: Factory },
        { id: 'warehouses', label: 'Warehouses & Godowns', icon: WarehouseIcon },
        { id: 'tenants', label: 'Tenants & Companies', icon: Building2 },
        { id: 'financial_years', label: 'Financial Years & Locks', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'GOVERNANCE & AUDIT',
      items: [
        {
          id: 'workflows',
          label: 'Workflow Approvals',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
        },
        { id: 'users_roles', label: 'Users & Roles (RBAC)', icon: ShieldCheck },
        { id: 'audit', label: 'Enterprise Audit Trail', icon: History },
      ],
    },
  ];

  const upcomingModules = [
    { label: 'Perpetual Inventory', icon: WarehouseIcon },
    { label: 'Production Melt Shop', icon: Flame },
    { label: 'Quality Control (QC)', icon: Award },
    { label: 'Weighbridge & Gate', icon: Truck },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0 text-slate-300 font-sans select-none overflow-y-auto">
      {/* Sidebar Navigation Items */}
      <div className="flex-1 py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as NavView)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer group text-left ${
                      isActive
                        ? 'bg-blue-600/90 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-500 group-hover:text-blue-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-blue-200" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Phase 2+ Transaction Modules Roadmap Indicator */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center justify-between">
            <span>TRANSACTION SUITE</span>
            <span className="text-[9px] text-blue-400 lowercase font-medium bg-blue-950/60 px-1 py-0.2 rounded border border-blue-900/60">
              Phase 2+
            </span>
          </div>
          <div className="space-y-0.5">
            {upcomingModules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-slate-500 text-xs rounded opacity-75"
                  title="Coming in transactional milestone"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="truncate">{m.label}</span>
                  <span className="ml-auto text-[9px] text-slate-600 font-mono">
                    Ready
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tenant Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px]">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-semibold text-slate-300">Tenant: T-STEEL-01</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[10px] font-medium border border-emerald-800/60">
            Active
          </span>
        </div>
        <div className="text-[10px] text-slate-500 truncate mt-0.5">
          Apex Steel & Power Industries Ltd
        </div>
      </div>
    </aside>
  );
};
