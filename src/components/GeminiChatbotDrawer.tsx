import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Paperclip,
  Trash2,
  Minimize2,
  Maximize2,
  ChevronDown,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  fileAttachment?: {
    name: string;
    type: string;
    dataUrl?: string;
  };
}

interface GeminiChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiChatbotDrawer: React.FC<GeminiChatbotDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `Hello! I am **ApexAI Enterprise Copilot**, your real-time ERP intelligence assistant for manufacturing, steel supply chain, and double-entry finance.

I can assist you with:
- **Procurement & Delivery Status**: Tracking POs, transit delays, and vendor OTIF performance.
- **Document Intelligence**: Uploading and auditing supplier invoices, MTC test certificates, and weighbridge slips.
- **Financial Controls & Approvals**: Checking double-entry GL accounts, 3-way matching, and Maker/Checker authorizations.

How can I help you optimize operations today?`,
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState<string>('procurement');
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; dataUrl: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Roles and system instructions
  const rolePresets = {
    procurement: {
      name: '📦 Procurement & SCM Specialist',
      instruction: `You are an expert Procurement, SCM, and Purchase Order specialist for a large manufacturing enterprise (Steel & Heavy Industries).
You advise on vendor lead times, transit delays, PO line items, transporter bilty tracking, and On-Time In-Full (OTIF) fulfillment.
Answer queries concisely with actionable next steps. Reference Indian Rupee (₹) and Metric Tons (MT).`,
    },
    operations: {
      name: '🏭 Operations & Plant Incharge',
      instruction: `You are the Head of Plant Operations and Blast Furnace / Rolling Mill Incharge for Apex Steel & Power.
You advise on continuous casting billets, scrap melting mixes, sponge iron feeds, weighbridge gross/tare calibrations, and yard inventory.
Keep answers operational, technically sound, and focused on plant throughput and zero downtime.`,
    },
    finance: {
      name: '💰 CFO & Financial Controller',
      instruction: `You are the Corporate Controller and Chartered Accountant for Apex Steel.
You ensure 100% compliance with Indian GST regulations (CGST/SGST/IGST), double-entry GL charts of accounts, 3-way matching (PO vs Inward GRN vs Vendor Invoice), and Maker/Checker authorization rules.`,
    },
    quality: {
      name: '🔬 Metallurgy & QC Inspector',
      instruction: `You are the Chief Quality Assurance Inspector for structural steel and TMT rebars.
You verify Material Test Certificates (MTC), chemical compositions (Carbon, Manganese, Sulphur, Phosphorus max 0.05%), and tensile/yield stress compliance against IS 1786 and IS 2830 standards.`,
    },
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !attachedFile) || loading) return;

    const userText = input.trim();
    const currentAttachment = attachedFile;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText || (currentAttachment ? `[Uploaded file: ${currentAttachment.name}] Please analyze this document.` : ''),
      timestamp: new Date(),
      fileAttachment: currentAttachment || undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    try {
      // Build conversation payload for multi-turn chat
      const formattedForApi = newMessages.map((m) => {
        const parts: any[] = [];
        if (m.fileAttachment?.dataUrl) {
          const partsSplit = m.fileAttachment.dataUrl.split(';base64,');
          if (partsSplit.length === 2) {
            parts.push({
              inlineData: {
                mimeType: m.fileAttachment.type || 'application/pdf',
                data: partsSplit[1],
              },
            });
          }
        }
        parts.push({ text: m.content });
        return {
          role: m.role === 'model' ? 'model' : 'user',
          parts,
        };
      });

      const res = await fetch('/api/v1/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedForApi,
          model: selectedModel,
          systemInstruction: (rolePresets as any)[selectedRole]?.instruction,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const modelMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          content: data.text || 'I have reviewed your request. Let me know if you need more details.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, modelMessage]);
      } else {
        const err = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'model',
            content: `⚠️ Error from Gemini AI: ${err.error || 'Failed to generate response'}`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `⚠️ Connection error: ${err.message || 'Network failure'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        type: file.type || 'application/pdf',
        dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 shadow-2xl flex flex-col bg-white border border-slate-300 rounded-lg overflow-hidden ${
        isExpanded
          ? 'inset-6 sm:inset-12'
          : 'bottom-4 right-4 w-[92vw] sm:w-[480px] h-[640px] max-h-[92vh]'
      }`}
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600/80 rounded-lg text-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight">ApexAI Enterprise Copilot</h3>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-1.5 py-0.2 rounded font-mono">
                {selectedModel}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Multi-Turn ERP & Document Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1 hover:text-white hover:bg-white/10 rounded"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:text-white hover:bg-white/10 rounded hidden sm:block"
            title={isExpanded ? 'Restore' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:text-white hover:bg-white/10 rounded"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Strip: Role Persona & Model Selector */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Role Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="procurement">📦 Procurement & SCM</option>
            <option value="operations">🏭 Plant Operations & Incharge</option>
            <option value="finance">💰 CFO & Accounts Controller</option>
            <option value="quality">🔬 Metallurgy & QC Lab</option>
          </select>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none"
          >
            <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep)</option>
          </select>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-medium text-slate-400">
              {m.role === 'user' ? (
                <>
                  <span>You</span>
                  <span>•</span>
                  <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-blue-600" />
                  <span className="font-bold text-slate-700">ApexAI Copilot</span>
                  <span>•</span>
                  <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </>
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-lg p-3.5 shadow-2xs whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              {/* If attached file */}
              {m.fileAttachment && (
                <div
                  className={`mb-2 p-2 rounded flex items-center gap-2 text-xs font-mono font-semibold ${
                    m.role === 'user' ? 'bg-blue-700/80 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0 text-amber-300" />
                  <span className="truncate">{m.fileAttachment.name}</span>
                </div>
              )}
              <div>{m.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>ApexAI is analyzing enterprise state & documents...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips */}
      <div className="bg-white px-3 py-2 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-400 font-bold uppercase text-[9px] shrink-0">Prompts:</span>
        {[
          'Check open PO delivery delays',
          'Audit NMDC Pellets Invoice INV-9821',
          'Verify Fe 550D MTC chemical specs',
          'Review weighbridge gross weights',
        ].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleQuickPrompt(chip)}
            className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-full whitespace-nowrap text-slate-700 font-medium transition shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Attachment Preview (if selected) */}
      {attachedFile && (
        <div className="px-3 py-1.5 bg-blue-50 border-t border-blue-200 flex items-center justify-between text-xs text-blue-900 font-mono">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{attachedFile.name}</span>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 hover:bg-blue-100 rounded text-blue-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 border border-slate-300 rounded hover:bg-slate-100 text-slate-600 transition"
          title="Attach Document / Invoice / MTC"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ApexAI Copilot as ${selectedRole}...`}
          className="flex-1 border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading || (!input.trim() && !attachedFile)}
          className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
