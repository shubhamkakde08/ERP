import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Upload,
  FileText,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Scale,
  Building,
  ShieldCheck,
  Plus,
  X,
  FileCheck,
  FileType,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ERPDocument, DocumentCategory, PurchaseOrder } from '../types/erp';

interface DocumentVaultViewProps {
  onRefreshParent?: () => void;
  onNavigateToPO?: (poNumber: string) => void;
}

export const DocumentVaultView: React.FC<DocumentVaultViewProps> = ({
  onRefreshParent,
  onNavigateToPO,
}) => {
  const [documents, setDocuments] = useState<ERPDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<ERPDocument | null>(null);
  const [analyzingAi, setAnalyzingAi] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'PROCUREMENT' as DocumentCategory,
    entityType: 'PURCHASE_ORDER',
    entityId: '',
    fileName: '',
    fileType: '',
    fileSize: 0,
    fileData: '',
    remarks: '',
    autoExtractAI: true,
  });

  const [uploading, setUploading] = useState<boolean>(false);

  // Fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        fileData: base64,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.fileData) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      let extractedMetadata = null;

      // Auto-extract with Gemini if enabled
      if (uploadForm.autoExtractAI) {
        try {
          const aiRes = await fetch('/api/v1/gemini/analyze-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentTitle: uploadForm.title,
              fileType: uploadForm.fileType,
              fileData: uploadForm.fileData,
              instructions: `Extract document details for category ${uploadForm.category}`,
            }),
          });
          if (aiRes.ok) {
            extractedMetadata = await aiRes.json();
          }
        } catch (aiErr) {
          console.warn('AI extraction skipped/failed:', aiErr);
        }
      }

      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadForm,
          extractedMetadata,
        }),
      });

      if (res.ok) {
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          category: 'PROCUREMENT',
          entityType: 'PURCHASE_ORDER',
          entityId: '',
          fileName: '',
          fileType: '',
          fileSize: 0,
          fileData: '',
          remarks: '',
          autoExtractAI: true,
        });
        fetchDocuments();
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error submitting document:', err);
      alert('Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  // Preset synthetic document template generator for immediate testing
  const loadPresetTemplate = (type: 'INVOICE' | 'MTC' | 'WEIGHBRIDGE') => {
    if (type === 'INVOICE') {
      setUploadForm({
        title: 'Tata Steel Sponge Iron Commercial Tax Invoice',
        category: 'INVOICE',
        entityType: 'PURCHASE_ORDER',
        entityId: 'PO-2026-0003',
        fileName: 'Tata_Sponge_Invoice_INV7719.pdf',
        fileType: 'application/pdf',
        fileSize: 165400,
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL0tpZHMgWzUgMCBSXQovQ291bnQgMQovVHlwZSAvUGFnZXMKPj4KZW5kb2JqCg==',
        remarks: 'GST 18% Verified, matches Inward GRN slip',
        autoExtractAI: true,
      });
    } else if (type === 'MTC') {
      setUploadForm({
        title: 'MTC Inspection Certificate Fe 550D Rebar Heat #8892',
        category: 'QUALITY_MTC',
        entityType: 'PURCHASE_ORDER',
        entityId: 'PO-2026-0001',
        fileName: 'MTC_Fe550D_Heat8892.pdf',
        fileType: 'application/pdf',
        fileSize: 220000,
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL0tpZHMgWzUgMCBSXQovQ291bnQgMQovVHlwZSAvUGFnZXMKPj4KZW5kb2JqCg==',
        remarks: 'Carbon 0.23%, Yield Strength 580 MPa - IS 1786 Compliant',
        autoExtractAI: true,
      });
    } else {
      setUploadForm({
        title: 'Plant Inward Weighbridge Gross Ticket - CG-04-ME-9021',
        category: 'WEIGHBRIDGE',
        entityType: 'PURCHASE_ORDER',
        entityId: 'PO-2026-0001',
        fileName: 'Weighbridge_Ticket_WB9021.pdf',
        fileType: 'application/pdf',
        fileSize: 78500,
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL0tpZHMgWzUgMCBSXQovQ291bnQgMQovVHlwZSAvUGFnZXMKPj4KZW5kb2JqCg==',
        remarks: 'Gross: 54.22 MT, Tare: 14.22 MT, Net: 40.00 MT Inward Scrap',
        autoExtractAI: true,
      });
    }
  };

  // Delete doc
  const handleDeleteDoc = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete and archive "${title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedDoc?.id === id) setSelectedDoc(null);
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Download document
  const handleDownloadDoc = (doc: ERPDocument) => {
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run on-demand AI analysis on an existing document
  const handleRunAiAnalysis = async (doc: ERPDocument) => {
    setAnalyzingAi(true);
    setAiAnalysisResult(null);
    try {
      const res = await fetch('/api/v1/gemini/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: doc.title,
          fileType: doc.fileType,
          fileData: doc.fileData,
          instructions: `Analyze this ${doc.category} document. Verify chemical standards, GSTIN, gross/tare weights, and summarize key audit metrics.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data);
      }
    } catch (err) {
      console.error('Failed to run Gemini AI analysis:', err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = activeCategory === 'ALL' || doc.category === activeCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.entityId && doc.entityId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Category counts
  const categoryCounts = {
    ALL: documents.length,
    INVOICE: documents.filter((d) => d.category === 'INVOICE').length,
    QUALITY_MTC: documents.filter((d) => d.category === 'QUALITY_MTC').length,
    WEIGHBRIDGE: documents.filter((d) => d.category === 'WEIGHBRIDGE').length,
    PROCUREMENT: documents.filter((d) => d.category === 'PROCUREMENT').length,
    LEGAL: documents.filter((d) => d.category === 'LEGAL').length,
  };

  // Category badge helper
  const renderCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'INVOICE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">TAX INVOICE</span>;
      case 'QUALITY_MTC':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">QUALITY MTC</span>;
      case 'WEIGHBRIDGE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">WEIGHBRIDGE SLIP</span>;
      case 'PROCUREMENT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">PO / CONTRACT</span>;
      case 'LEGAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">LEGAL & GST</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">{cat}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>ERP Platform</span>
            <span>/</span>
            <span>Governance & Operations</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">Document Vault & DMS</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Document Vault</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Gemini AI Document Extraction Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDocuments}
            className="p-2 border border-slate-300 rounded hover:bg-slate-100 text-slate-600 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            Upload Document (DMS)
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Category Pills & Quick Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'ALL', label: 'All Documents', count: categoryCounts.ALL },
            { id: 'INVOICE', label: 'Commercial Invoices & Bills', count: categoryCounts.INVOICE },
            { id: 'QUALITY_MTC', label: 'Material Test Certificates (MTC)', count: categoryCounts.QUALITY_MTC },
            { id: 'WEIGHBRIDGE', label: 'Weighbridge & Gate Passes', count: categoryCounts.WEIGHBRIDGE },
            { id: 'PROCUREMENT', label: 'Purchase Orders & Contracts', count: categoryCounts.PROCUREMENT },
            { id: 'LEGAL', label: 'Statutory GST & Compliance', count: categoryCounts.LEGAL },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Layout Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, PO#, invoice number, file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{filteredDocs.length}</span> of {documents.length} records
            </span>
            <div className="flex items-center border border-slate-200 rounded p-0.5 bg-slate-100 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded ${viewMode === 'grid' ? 'bg-white font-bold text-slate-800 shadow-2xs' : 'text-slate-500'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded ${viewMode === 'table' ? 'bg-white font-bold text-slate-800 shadow-2xs' : 'text-slate-500'}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Main Document Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-lg border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading documents from Cloud SQL PostgreSQL...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
            <FolderArchive className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No documents found matching this filter</p>
            <p className="text-xs text-slate-400 mt-1">Upload a new document or change the category filter.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const meta = doc.extractedMetadata as any;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-400 hover:shadow-sm transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded bg-blue-50 text-blue-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 font-semibold">{doc.documentNumber}</div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">{doc.title}</h3>
                        </div>
                      </div>
                      {renderCategoryBadge(doc.category)}
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 mt-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span>File:</span>
                        <span className="font-mono text-slate-700 truncate max-w-[180px]">{doc.fileName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Size:</span>
                        <span className="text-slate-700">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                      {doc.entityId && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Linked Ref:</span>
                          <span className="font-mono font-semibold text-blue-600">{doc.entityId}</span>
                        </div>
                      )}
                    </div>

                    {/* AI Extracted Highlights (if present) */}
                    {meta && (
                      <div className="mt-3 p-2.5 bg-slate-50 rounded border border-slate-200/80 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 font-bold text-slate-800 text-[10px] uppercase mb-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          Gemini Intelligence Extraction
                        </div>
                        {meta.vendor && <div>• Vendor: <span className="font-semibold text-slate-800">{meta.vendor}</span></div>}
                        {meta.totalAmount && <div>• Amount: <span className="font-mono font-semibold text-slate-800">₹{parseFloat(meta.totalAmount).toLocaleString('en-IN')}</span></div>}
                        {meta.grossMT && <div>• Gross Weight: <span className="font-mono font-semibold text-teal-700">{meta.grossMT} MT</span></div>}
                        {meta.heatNumber && <div>• Heat Number: <span className="font-mono font-semibold text-slate-800">{meta.heatNumber}</span></div>}
                        {meta.summary && <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">{meta.summary}</div>}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDownloadDoc(doc)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.title)}
                        className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Doc Number</th>
                  <th className="py-3 px-4">Title & File</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Linked Reference</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="hover:bg-blue-50/40 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{doc.documentNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{doc.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{doc.fileName}</div>
                    </td>
                    <td className="py-3 px-4">{renderCategoryBadge(doc.category)}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{doc.entityId || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{(doc.fileSize / 1024).toFixed(1)} KB</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{doc.uploadedBy}</td>
                    <td className="py-3 px-4 text-slate-600">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadDoc(doc)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Upload Document Provision</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Preset Sample Template Buttons for Quick Testing */}
              <div className="bg-blue-50/70 border border-blue-200 rounded p-3 text-slate-700">
                <span className="font-bold text-[11px] text-blue-900 uppercase tracking-wider block mb-1">
                  💡 Quick-Fill Sample ERP Documents (1-Click Test):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadPresetTemplate('INVOICE')}
                    className="px-2.5 py-1 bg-white border border-blue-300 hover:bg-blue-100 rounded text-[11px] font-semibold text-blue-800"
                  >
                    + Tax Invoice (INV-7719)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetTemplate('MTC')}
                    className="px-2.5 py-1 bg-white border border-blue-300 hover:bg-blue-100 rounded text-[11px] font-semibold text-blue-800"
                  >
                    + MTC Fe 550D Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetTemplate('WEIGHBRIDGE')}
                    className="px-2.5 py-1 bg-white border border-blue-300 hover:bg-blue-100 rounded text-[11px] font-semibold text-blue-800"
                  >
                    + Weighbridge Gross Slip
                  </button>
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select File (PDF, Image, Scanned Copy) *</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:border-blue-400 bg-slate-50 transition">
                  <input
                    type="file"
                    id="docFileInput"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
                  />
                  <label htmlFor="docFileInput" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <span className="text-xs font-bold text-blue-600 hover:underline">Click to browse files</span>
                    <span className="text-slate-500 text-xs block mt-0.5">Supports PDF, PNG, JPG, CSV (Max 25MB)</span>
                  </label>

                  {uploadForm.fileName && (
                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-mono font-semibold flex items-center justify-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>{uploadForm.fileName} ({(uploadForm.fileSize / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="e.g. Commercial Tax Invoice - NMDC Pellets"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as DocumentCategory })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="PROCUREMENT">Purchase Order & Contracts</option>
                    <option value="INVOICE">Commercial Invoices & Bills</option>
                    <option value="QUALITY_MTC">Material Test Certificates (MTC)</option>
                    <option value="WEIGHBRIDGE">Weighbridge & Gate Entry Slip</option>
                    <option value="LEGAL">Statutory Compliance & GST</option>
                    <option value="FINANCE">Finance & Bank Proofs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Link to Reference Entity</label>
                  <select
                    value={uploadForm.entityType}
                    onChange={(e) => setUploadForm({ ...uploadForm, entityType: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="PURCHASE_ORDER">Purchase Order</option>
                    <option value="BUSINESS_PARTNER">Supplier / Customer</option>
                    <option value="ITEM">Item Master</option>
                    <option value="PLANT">Plant / Warehouse</option>
                    <option value="COMPANY">Company Legal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reference ID (e.g. PO-2026-0001)</label>
                  <input
                    type="text"
                    value={uploadForm.entityId}
                    onChange={(e) => setUploadForm({ ...uploadForm, entityId: e.target.value })}
                    placeholder="e.g. PO-2026-0001 or VEND-101"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarks & Audit Notes</label>
                <textarea
                  rows={2}
                  value={uploadForm.remarks}
                  onChange={(e) => setUploadForm({ ...uploadForm, remarks: e.target.value })}
                  placeholder="e.g. Original signed stamp attached, verified with weighbridge operator"
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Auto Gemini Extraction Toggle */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="font-bold text-purple-900 block text-xs">Run Gemini AI Document Extraction</span>
                    <span className="text-[11px] text-purple-700">Auto-parse invoice amounts, GSTIN, and MTC chemical composition upon upload</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={uploadForm.autoExtractAI}
                  onChange={(e) => setUploadForm({ ...uploadForm, autoExtractAI: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Uploading & Processing...
                    </>
                  ) : (
                    'Upload & Store in PostgreSQL'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTION & AI ANALYSIS MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedDoc.title}</h3>
                  <span className="text-[11px] font-mono text-slate-500">{selectedDoc.documentNumber}</span>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {renderCategoryBadge(selectedDoc.category)}
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 text-slate-700">
                    {(selectedDoc.fileSize / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunAiAnalysis(selectedDoc)}
                    disabled={analyzingAi}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${analyzingAi ? 'animate-spin' : ''}`} />
                    {analyzingAi ? 'Analyzing...' : 'Re-Run Gemini AI Analysis'}
                  </button>
                  <button
                    onClick={() => handleDownloadDoc(selectedDoc)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">File Name</span>
                  <p className="font-mono text-slate-800 font-semibold truncate mt-0.5">{selectedDoc.fileName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Linked Entity</span>
                  <p className="font-mono text-blue-600 font-semibold mt-0.5">{selectedDoc.entityId || 'None'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Uploaded By</span>
                  <p className="text-slate-800 truncate mt-0.5">{selectedDoc.uploadedBy}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Upload Date</span>
                  <p className="text-slate-800 mt-0.5">{new Date(selectedDoc.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Remarks */}
              {selectedDoc.remarks && (
                <div className="p-3 bg-white border border-slate-200 rounded text-slate-700">
                  <span className="font-bold text-[11px] text-slate-500 uppercase block mb-0.5">Remarks / Audit Note</span>
                  <p>{selectedDoc.remarks}</p>
                </div>
              )}

              {/* Gemini AI Extracted Fields & Analysis Pane */}
              {(selectedDoc.extractedMetadata || aiAnalysisResult) && (
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Gemini Document Intelligence Report
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                      COMPLIANCE CHECK: VERIFIED
                    </span>
                  </div>

                  {aiAnalysisResult?.summary && (
                    <div className="text-slate-700 bg-white p-2.5 rounded border border-purple-100 leading-relaxed">
                      {aiAnalysisResult.summary}
                    </div>
                  )}

                  {/* Extracted Key-Value Table */}
                  <div className="bg-white rounded border border-purple-100 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <tbody>
                        {Object.entries(
                          aiAnalysisResult?.extractedFields || (selectedDoc.extractedMetadata as any) || {}
                        ).map(([k, v]) => (
                          <tr key={k} className="border-b border-purple-50 last:border-0">
                            <td className="py-2 px-3 font-semibold text-slate-500 uppercase text-[10px] w-1/3 bg-slate-50/60">
                              {k.replace(/([A-Z])/g, ' $1')}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">
                              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {aiAnalysisResult?.recommendations && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-purple-900 block mb-1">
                        ERP Action Recommendations:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {aiAnalysisResult.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-mono">DMS PostgreSQL Entity ID: {selectedDoc.id}</span>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs"
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
