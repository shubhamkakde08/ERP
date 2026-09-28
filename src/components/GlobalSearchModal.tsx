import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Users2, Factory, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { NavView } from './Sidebar.tsx';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: NavView) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { authFetch } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    items: any[];
    partners: any[];
    plants: any[];
  }>({ items: [], partners: [], plants: [] });
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ items: [], partners: [], plants: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ items: [], partners: [], plants: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await authFetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults =
    results.items.length + results.partners.length + results.plants.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 font-sans">
      <div className="bg-white border border-slate-300 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search items (TMT, DRI, Scrap), partners (L&T, NMDC), plants, GL codes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-medium text-slate-800 bg-transparent focus:outline-none placeholder-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 flex-1 text-xs">
          {isSearching && (
            <div className="py-4 text-center text-slate-400">
              Querying Cloud SQL PostgreSQL...
            </div>
          )}

          {!isSearching && query && totalResults === 0 && (
            <div className="py-8 text-center text-slate-400">
              No matching ERP master records found for "{query}".
            </div>
          )}

          {!query && (
            <div className="py-4 text-center text-slate-400 space-y-2">
              <div className="font-semibold text-slate-600">
                Universal Enterprise ERP Omnibox
              </div>
              <div className="text-[11px] text-slate-400">
                Try searching for <span className="font-mono text-blue-600">TMT</span>,{' '}
                <span className="font-mono text-blue-600">CUST-001</span>,{' '}
                <span className="font-mono text-blue-600">RAIPUR</span>, or{' '}
                <span className="font-mono text-blue-600">SCRAP</span>.
              </div>
            </div>
          )}

          {/* Items Section */}
          {results.items.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-blue-600" /> Item Masters
              </div>
              <div className="space-y-1">
                {results.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate('items');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-blue-50 text-left transition cursor-pointer group"
                  >
                    <div>
                      <div className="font-mono font-bold text-blue-700 group-hover:text-blue-800">
                        {item.code}
                      </div>
                      <div className="text-[11px] text-slate-600">{item.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500">
                        ₹ {Number(item.sellingPrice).toLocaleString('en-IN')}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Partners Section */}
          {results.partners.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Users2 className="w-3.5 h-3.5 text-emerald-600" /> Business Partners
              </div>
              <div className="space-y-1">
                {results.partners.map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => {
                      onNavigate('partners');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-emerald-50 text-left transition cursor-pointer group"
                  >
                    <div>
                      <div className="font-mono font-bold text-emerald-700 group-hover:text-emerald-800">
                        {partner.code} • {partner.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        GSTIN: {partner.gstin} • {partner.city}, {partner.state}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plants Section */}
          {results.plants.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Factory className="w-3.5 h-3.5 text-amber-600" /> Manufacturing Facilities
              </div>
              <div className="space-y-1">
                {results.plants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => {
                      onNavigate('plants');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-amber-50 text-left transition cursor-pointer group"
                  >
                    <div>
                      <div className="font-mono font-bold text-amber-800">
                        {plant.code} • {plant.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{plant.address}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-2.5 bg-slate-100/80 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Navigate with mouse or click result to drill-down</span>
          <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px]">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
};
