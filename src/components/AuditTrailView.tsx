import React, { useState } from 'react';
import { AuditLog } from '../types/erp.ts';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Eye,
  X,
  FileCode,
} from 'lucide-react';

interface AuditTrailViewProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction =
      selectedAction === 'ALL' || log.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Operator Email', 'Reason', 'IP'];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.timestamp).toISOString()}"`,
      l.action,
      l.entityType,
      `"${l.entityId}"`,
      `"${l.userEmail}"`,
      `"${l.reason || ''}"`,
      l.ipAddress || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Enterprise Security & Compliance / Immutable Audit Trail
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Audit Trail & State Change Ledger
          </h1>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit History</span>
        </button>
      </div>

      {/* Security Assurance Banner */}
      <div className="bg-slate-900 text-slate-200 p-3 rounded flex items-center justify-between text-xs border border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Every master data creation, workflow action, approval, and transaction posting is written immutably to PostgreSQL with operator ID, IP, before/after JSON diffs.
          </span>
        </div>
        <span className="font-mono text-emerald-400 font-semibold text-[11px]">
          {logs.length} Total Records
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by operator email, entity, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">Action:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none bg-white font-medium"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="APPROVE">APPROVE</option>
            <option value="REJECT">REJECT</option>
            <option value="SUBMIT">SUBMIT</option>
            <option value="POST">POST</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Timestamp (UTC/IST)</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Entity Type</th>
              <th className="py-2.5 px-3">Entity ID</th>
              <th className="py-2.5 px-3">Operator</th>
              <th className="py-2.5 px-3">Justification / Reason</th>
              <th className="py-2.5 px-3 text-center">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No audit logs found matching criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        log.action === 'CREATE'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : log.action === 'APPROVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : log.action === 'REJECT'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800">
                    {log.entityType}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-blue-600">
                    {log.entityId}
                  </td>
                  <td className="py-2 px-3 text-slate-700">
                    <div className="font-medium">{log.userName || log.userEmail.split('@')[0]}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.userEmail}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-600 max-w-xs truncate">
                    {log.reason || '-'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => setActiveLog(log)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* JSON Diff / Payload Inspector Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Audit Transaction Record
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {activeLog.action} • {activeLog.entityType} #{activeLog.entityId}
                </h3>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div><span className="font-semibold">Operator:</span> {activeLog.userEmail}</div>
              <div><span className="font-semibold">Timestamp:</span> {new Date(activeLog.timestamp).toISOString()}</div>
              <div><span className="font-semibold">Reason:</span> {activeLog.reason || 'None provided'}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-blue-600" /> State Values Payload:
              </span>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[11px] font-mono max-h-60 overflow-y-auto">
                {JSON.stringify(
                  {
                    oldValues: activeLog.oldValues || null,
                    newValues: activeLog.newValues || null,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
