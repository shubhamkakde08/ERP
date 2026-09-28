import React, { useState } from 'react';
import { Role, User } from '../types/erp.ts';
import { ShieldCheck, UserCheck, Key, Lock, Check } from 'lucide-react';

interface UsersRolesViewProps {
  roles: Role[];
  users: User[];
  onRefresh: () => void;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({ roles, users }) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'matrix'>('roles');

  const standardPermissions = [
    { module: 'Administration', code: 'ADMIN_MANAGE', label: 'Tenant & Master Config' },
    { module: 'User Security', code: 'USERS_MANAGE', label: 'User Roles & Approver Matrix' },
    { module: 'Finance & Accounts', code: 'FINANCE_ALL', label: 'GL Vouchers, Journals & Reversals' },
    { module: 'Finance & Accounts', code: 'FINANCE_APPROVE', label: 'Approve High-Value Payments' },
    { module: 'Procurement', code: 'PROCUREMENT_ALL', label: 'Purchase Orders & Contracts' },
    { module: 'Procurement', code: 'PO_APPROVE', label: 'Approve Purchase Orders' },
    { module: 'Inventory & Stores', code: 'INVENTORY_ALL', label: 'Material Receipts & Transfers' },
    { module: 'Production', code: 'PRODUCTION_ALL', label: 'Melt Shop & Rolling Orders' },
    { module: 'Compliance & Audit', code: 'AUDIT_VIEW', label: 'View Immutable Audit Trails' },
  ];

  return (
    <div className="p-5 space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Governance & Identity / Role-Based Access Control
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Users, Roles & RBAC Permission Matrix
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Roles ({roles.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Registered Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 border-b-2 transition cursor-pointer ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          RBAC Security Matrix
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-700 text-sm">{r.code}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                  SYSTEM
                </span>
              </div>
              <div className="font-semibold text-xs text-slate-900">{r.name}</div>
              <div className="text-[11px] text-slate-500">{r.description}</div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Assigned Privileges
                </div>
                <div className="flex flex-wrap gap-1">
                  {r.permissions?.map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-right">Approval Limit</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No individual user records yet. Sign in or assign roles.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/20">
                    <td className="py-2 px-3 font-semibold text-slate-900">{u.fullName}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{u.email}</td>
                    <td className="py-2 px-3 text-slate-600">{u.department}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">
                      ₹ {Number(u.approvalLimit).toLocaleString('en-IN')}
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
      )}

      {/* RBAC Matrix Tab */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Permission Description</th>
                <th className="py-2.5 px-3 text-center">ADMIN</th>
                <th className="py-2.5 px-3 text-center">FINANCE_HEAD</th>
                <th className="py-2.5 px-3 text-center">PROCUREMENT_MGR</th>
                <th className="py-2.5 px-3 text-center">PLANT_MGR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {standardPermissions.map((perm) => (
                <tr key={perm.code} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-600">{perm.module}</td>
                  <td className="py-2 px-3 text-slate-900">
                    <div>{perm.label}</div>
                    <div className="font-mono text-[10px] text-slate-400">{perm.code}</div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>
                  <td className="py-2 px-3 text-center">
                    {perm.code.includes('FINANCE') || perm.code.includes('AUDIT') ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {perm.code.includes('PROCUREMENT') || perm.code.includes('PO') ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {perm.code.includes('PRODUCTION') || perm.code.includes('INVENTORY') ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
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
