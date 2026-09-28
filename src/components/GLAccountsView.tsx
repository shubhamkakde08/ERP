import React, { useState } from 'react';
import { GLAccount } from '../types/erp.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Filter,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';

interface GLAccountsViewProps {
  glAccounts: GLAccount[];
  onRefresh: () => void;
}

export const GLAccountsView: React.FC<GLAccountsViewProps> = ({ glAccounts, onRefresh }) => {
  const { authFetch } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [scheduleType, setScheduleType] = useState('BALANCE_SHEET');
  const [accountClass, setAccountClass] = useState('ASSET');
  const [subAccountType, setSubAccountType] = useState('INVENTORY');
  const [normalBalance, setNormalBalance] = useState('DEBIT');
  const [isControlAccount, setIsControlAccount] = useState(false);

  const filteredAccounts = glAccounts.filter((acc) => {
    const matchesSearch =
      acc.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || acc.accountClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountCode || !accountName) return;

    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/v1/gl-accounts', {
        method: 'POST',
        body: JSON.stringify({
          accountCode,
          accountName,
          scheduleType,
          accountClass,
          subAccountType,
          normalBalance,
          isControlAccount,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setAccountCode('');
        setAccountName('');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create GL account');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating GL account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Account Code', 'Account Name', 'Schedule Type', 'Class', 'Sub Type', 'Normal Balance', 'Control Account'];
    const rows = filteredAccounts.map((a) => [
      `"${a.accountCode}"`,
      `"${a.accountName}"`,
      a.scheduleType,
      a.accountClass,
      a.subAccountType,
      a.normalBalance,
      a.isControlAccount ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GL_Accounts_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Finance & Accounting / General Ledger
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Chart of Accounts & General Ledger Structure
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
            <span>New GL Account</span>
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
              placeholder="Search by code or account name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">Account Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none bg-white font-medium"
          >
            <option value="ALL">All Classes ({glAccounts.length})</option>
            <option value="ASSET">Assets</option>
            <option value="LIABILITY">Liabilities</option>
            <option value="EQUITY">Equity</option>
            <option value="REVENUE">Revenue</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">GL Code</th>
              <th className="py-2.5 px-3">Account Title</th>
              <th className="py-2.5 px-3">Schedule</th>
              <th className="py-2.5 px-3">Class</th>
              <th className="py-2.5 px-3">Sub Type</th>
              <th className="py-2.5 px-3 text-center">Normal Balance</th>
              <th className="py-2.5 px-3 text-center">Control Account</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No GL accounts match the filter criteria.
                </td>
              </tr>
            ) : (
              filteredAccounts.map((a) => (
                <tr key={a.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">
                    {a.accountCode}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900">
                    {a.accountName}
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-600">
                    {a.scheduleType}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        a.accountClass === 'ASSET'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : a.accountClass === 'LIABILITY'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : a.accountClass === 'REVENUE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {a.accountClass}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-600">
                    {a.subAccountType}
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-semibold">
                    <span
                      className={
                        a.normalBalance === 'DEBIT'
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }
                    >
                      {a.normalBalance}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {a.isControlAccount ? (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        CONTROL
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">STANDARD</span>
                    )}
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

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-lg max-w-xl w-full p-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Chart of Accounts Creation
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  New General Ledger Account
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Code (e.g. 100030) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="100030"
                    value={accountCode}
                    onChange={(e) => setAccountCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Class
                  </label>
                  <select
                    value={accountClass}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAccountClass(val);
                      if (val === 'ASSET' || val === 'EXPENSE') {
                        setNormalBalance('DEBIT');
                      } else {
                        setNormalBalance('CREDIT');
                      }
                      if (val === 'REVENUE' || val === 'EXPENSE') {
                        setScheduleType('PROFIT_LOSS');
                      } else {
                        setScheduleType('BALANCE_SHEET');
                      }
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                  >
                    <option value="ASSET">ASSET</option>
                    <option value="LIABILITY">LIABILITY</option>
                    <option value="EQUITY">EQUITY</option>
                    <option value="REVENUE">REVENUE</option>
                    <option value="EXPENSE">EXPENSE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inward Scrap Freight Clearing A/c"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Schedule Type
                  </label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                  >
                    <option value="BALANCE_SHEET">Balance Sheet Schedule</option>
                    <option value="PROFIT_LOSS">Profit & Loss Schedule</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Normal Balance
                  </label>
                  <select
                    value={normalBalance}
                    onChange={(e) => setNormalBalance(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                  >
                    <option value="DEBIT">DEBIT</option>
                    <option value="CREDIT">CREDIT</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isControlAccount}
                    onChange={(e) => setIsControlAccount(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">
                    Is Control Account (Requires Sub-ledger Reconciliation)
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
                  {isSubmitting ? 'Saving...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
