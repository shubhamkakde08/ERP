import React, { useState } from 'react';
import { WorkflowDefinition, WorkflowInstance } from '../types/erp.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ShieldCheck,
  Plus,
  Send,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface WorkflowViewProps {
  definitions: WorkflowDefinition[];
  instances: WorkflowInstance[];
  onRefresh: () => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  definitions,
  instances,
  onRefresh,
}) => {
  const { currentUser, authFetch } = useAuth();
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [actionComments, setActionComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New simulation document state
  const [docType, setDocType] = useState('PO');
  const [docId, setDocId] = useState(`PO-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [docAmount, setDocAmount] = useState('750000.00');

  const pendingInstances = instances.filter((i) => i.status === 'PENDING');
  const resolvedInstances = instances.filter((i) => i.status !== 'PENDING');

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedInstance) return;

    setIsProcessing(true);
    try {
      const res = await authFetch(`/api/v1/workflows/instances/${selectedInstance.id}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          comments: actionComments || `${action} by ${currentUser.role}`,
          approverRole: currentUser.role,
        }),
      });

      if (res.ok) {
        setSelectedInstance(null);
        setActionComments('');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to process workflow action');
      }
    } catch (err: any) {
      alert(err.message || 'Error executing approval action');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await authFetch('/api/v1/workflows/instances', {
        method: 'POST',
        body: JSON.stringify({
          documentType: docType,
          documentId: docId,
          documentAmount: docAmount,
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setDocId(`PO-2026-${Math.floor(100000 + Math.random() * 900000)}`);
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit workflow document');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting workflow document');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-5 space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Governance & Internal Controls / Maker-Checker Engine
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Configurable Workflow Approvals & Matrix
          </h1>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Submit Transaction for Approval</span>
        </button>
      </div>

      {/* Role Alert Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-xs text-indigo-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Active Approver Persona:</span> {currentUser.name} (Role:{' '}
            <span className="font-mono font-bold text-indigo-700">{currentUser.role}</span>)
            <div className="text-[11px] text-indigo-700">
              Department: {currentUser.department} • Tiered approvals require authorized roles. Switch roles in the top bar to test dual control.
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approvals Desk & Approval Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Pending Approval Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Documents Awaiting Action ({pendingInstances.length})
                </h2>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                Maker-Checker dual control
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingInstances.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All submitted transaction vouchers and orders have been processed!
                </div>
              ) : (
                pendingInstances.map((inst) => {
                  const isSelected = selectedInstance?.id === inst.id;
                  return (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedInstance(inst)}
                      className={`p-4 transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/60 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white font-mono">
                            {inst.documentType}
                          </span>
                          <span className="font-bold text-xs text-slate-900 font-mono">
                            {inst.documentId}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          ₹ {Number(inst.documentAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Initiated by: {inst.requestedBy}</span>
                        <div className="flex items-center gap-1.5 font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <span>Stage: Level {inst.currentLevel} Approval</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-blue-200/60 space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Approver Audit Comments & Justification:
                            </label>
                            <input
                              type="text"
                              value={actionComments}
                              onChange={(e) => setActionComments(e.target.value)}
                              placeholder="e.g. Verified vendor price comparison and budgeted allocation."
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none bg-white"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction('REJECT');
                              }}
                              disabled={isProcessing}
                              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3 py-1.5 rounded transition cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject Document</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction('APPROVE');
                              }}
                              disabled={isProcessing}
                              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Advance</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recently Concluded Approvals */}
          <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Processed / Resolved Approvals History
              </h2>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {resolvedInstances.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  No resolved workflow instances yet.
                </div>
              ) : (
                resolvedInstances.slice(0, 5).map((inst) => (
                  <div key={inst.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 font-mono">
                        {inst.documentType} #{inst.documentId}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Requested by: {inst.requestedBy}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-slate-800">
                        ₹ {Number(inst.documentAmount).toLocaleString('en-IN')}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          inst.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {inst.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Configured Approval Matrices */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded shadow-xs p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Configured Tiered Matrices
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">
              Threshold limits and role delegation rules stored in Cloud SQL
            </p>

            <div className="space-y-3">
              {definitions.map((def) => (
                <div key={def.id} className="border border-slate-200 rounded p-3 text-xs bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono">
                      {def.documentType} Workflow
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-1">
                    {def.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Threshold: Up to ₹ {Number(def.maxAmount).toLocaleString('en-IN')}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1.5">
                    {def.approvalLevels?.map((lvl) => (
                      <div
                        key={lvl.level}
                        className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded border border-slate-200"
                      >
                        <span className="font-semibold text-slate-800">
                          L{lvl.level}: {lvl.role}
                        </span>
                        <span className="text-slate-500 truncate max-w-[130px]">
                          {lvl.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Modal to Submit Test Transaction */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Maker Control
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Document for Approval
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none bg-white"
                >
                  <option value="PO">Purchase Order (PO)</option>
                  <option value="JV">Journal Voucher (JV)</option>
                  <option value="SO">Sales Order (SO)</option>
                  <option value="PR">Purchase Requisition (PR)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Document Reference ID / Number
                </label>
                <input
                  type="text"
                  required
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Transaction Amount (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={docAmount}
                  onChange={(e) => setDocAmount(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition cursor-pointer"
                >
                  {isProcessing ? 'Submitting...' : 'Submit to Matrix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
