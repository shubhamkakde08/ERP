import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { TopBar } from './components/TopBar.tsx';
import { Sidebar, NavView } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ItemMasterView } from './components/ItemMasterView.tsx';
import { PartnersView } from './components/PartnersView.tsx';
import { GLAccountsView } from './components/GLAccountsView.tsx';
import { OrgHierarchyView } from './components/OrgHierarchyView.tsx';
import { WorkflowView } from './components/WorkflowView.tsx';
import { AuditTrailView } from './components/AuditTrailView.tsx';
import { MasterRegistryView } from './components/MasterRegistryView.tsx';
import { UsersRolesView } from './components/UsersRolesView.tsx';
import { ProcurementDashboardView } from './components/ProcurementDashboardView.tsx';
import { DocumentVaultView } from './components/DocumentVaultView.tsx';
import { GeminiChatbotDrawer } from './components/GeminiChatbotDrawer.tsx';
import { GlobalSearchModal } from './components/GlobalSearchModal.tsx';
import { Sparkles } from 'lucide-react';
import {
  Tenant,
  Company,
  Plant,
  Warehouse,
  Item,
  BusinessPartner,
  GLAccount,
  CostCenter,
  UOM,
  GSTMaster,
  WorkflowDefinition,
  WorkflowInstance,
  AuditLog,
  Role,
  User,
} from './types/erp.ts';

function ERPPlatform() {
  const { authFetch } = useAuth();
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Core Data States
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [gsts, setGSTs] = useState<GSTMaster[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [workflowInstances, setWorkflowInstances] = useState<WorkflowInstance[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);

  // Subtab state for MasterRegistryView
  const [masterSubTab, setMasterSubTab] = useState<'uoms' | 'gst' | 'cost_centers'>('uoms');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        tenantRes,
        compRes,
        plantRes,
        whRes,
        itemRes,
        partRes,
        glRes,
        ccRes,
        uomRes,
        gstRes,
        roleRes,
        userRes,
        wfDefRes,
        wfInstRes,
        auditRes,
        dashRes,
      ] = await Promise.all([
        authFetch('/api/v1/tenant/current'),
        authFetch('/api/v1/companies'),
        authFetch('/api/v1/plants'),
        authFetch('/api/v1/warehouses'),
        authFetch('/api/v1/items'),
        authFetch('/api/v1/business-partners'),
        authFetch('/api/v1/gl-accounts'),
        authFetch('/api/v1/cost-centers'),
        authFetch('/api/v1/uoms'),
        authFetch('/api/v1/gst-masters'),
        authFetch('/api/v1/roles'),
        authFetch('/api/v1/users'),
        authFetch('/api/v1/workflows/definitions'),
        authFetch('/api/v1/workflows/instances'),
        authFetch('/api/v1/audit/logs'),
        authFetch('/api/v1/dashboard'),
      ]);

      if (tenantRes.ok) setTenant(await tenantRes.json());
      if (compRes.ok) setCompanies(await compRes.json());
      if (plantRes.ok) setPlants(await plantRes.json());
      if (whRes.ok) setWarehouses(await whRes.json());
      if (itemRes.ok) setItems(await itemRes.json());
      if (partRes.ok) setPartners(await partRes.json());
      if (glRes.ok) setGLAccounts(await glRes.json());
      if (ccRes.ok) setCostCenters(await ccRes.json());
      if (uomRes.ok) setUOMs(await uomRes.json());
      if (gstRes.ok) setGSTs(await gstRes.json());
      if (roleRes.ok) setRoles(await roleRes.json());
      if (userRes.ok) setUsers(await userRes.json());
      if (wfDefRes.ok) setWorkflows(await wfDefRes.json());
      if (wfInstRes.ok) setWorkflowInstances(await wfInstRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (dashRes.ok) {
        const d = await dashRes.json();
        setDashboardMetrics(d.metrics);
      }
    } catch (err) {
      console.error('Failed to load ERP master data from PostgreSQL:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const pendingApprovalsCount = workflowInstances.filter(
    (w) => w.status === 'PENDING'
  ).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Top ERP Bar */}
      <TopBar
        onOpenSearch={() => setIsSearchOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
        onNavigateToWorkflows={() => setActiveView('workflows')}
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />

      {/* Main Workspace: Left Sidebar + Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {activeView === 'dashboard' && (
            <DashboardView
              metrics={dashboardMetrics}
              recentAudits={auditLogs}
              workflows={workflowInstances}
              onNavigate={setActiveView}
              onRefresh={loadData}
              isLoading={isLoading}
            />
          )}

          {activeView === 'procurement' && (
            <ProcurementDashboardView
              tenantId={tenant?.id}
              items={items}
              partners={partners}
              plants={plants}
              onNavigateToWorkflows={() => setActiveView('workflows')}
              onNavigateToDocuments={() => setActiveView('documents')}
            />
          )}

          {activeView === 'documents' && (
            <DocumentVaultView
              onNavigateToPO={() => setActiveView('procurement')}
              onRefreshParent={loadData}
            />
          )}

          {activeView === 'items' && (
            <ItemMasterView
              items={items}
              uoms={uoms}
              gsts={gsts}
              onRefresh={loadData}
            />
          )}

          {activeView === 'partners' && (
            <PartnersView partners={partners} onRefresh={loadData} />
          )}

          {activeView === 'gl_accounts' && (
            <GLAccountsView glAccounts={glAccounts} onRefresh={loadData} />
          )}

          {(activeView === 'uoms' || activeView === 'gst' || activeView === 'cost_centers') && (
            <MasterRegistryView
              uoms={uoms}
              gsts={gsts}
              costCenters={costCenters}
              activeSubTab={
                activeView === 'uoms'
                  ? 'uoms'
                  : activeView === 'gst'
                  ? 'gst'
                  : 'cost_centers'
              }
              setActiveSubTab={(tab) => {
                setMasterSubTab(tab);
                setActiveView(tab as NavView);
              }}
            />
          )}

          {(activeView === 'tenants' ||
            activeView === 'plants' ||
            activeView === 'warehouses' ||
            activeView === 'financial_years') && (
            <OrgHierarchyView
              tenant={tenant}
              companies={companies}
              plants={plants}
              warehouses={warehouses}
              onRefresh={loadData}
            />
          )}

          {activeView === 'workflows' && (
            <WorkflowView
              definitions={workflows}
              instances={workflowInstances}
              onRefresh={loadData}
            />
          )}

          {activeView === 'audit' && (
            <AuditTrailView logs={auditLogs} onRefresh={loadData} />
          )}

          {activeView === 'users_roles' && (
            <UsersRolesView roles={roles} users={users} onRefresh={loadData} />
          )}
        </main>
      </div>

      {/* Global Search Omnibox Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setActiveView}
      />

      {/* Gemini AI Multi-Turn Chatbot Drawer */}
      <GeminiChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />

      {/* Floating ApexAI Copilot Trigger Button */}
      {!isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white p-3 sm:px-4 sm:py-2.5 rounded-full shadow-xl border border-blue-400/40 flex items-center gap-2 group transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
          title="Open ApexAI Assistant & Document Intelligence"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="text-xs font-bold leading-none">ApexAI Copilot</span>
            <span className="text-[10px] text-blue-200 font-normal">Gemini Intelligence</span>
          </div>
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ERPPlatform />
    </AuthProvider>
  );
}
