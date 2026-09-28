import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Filter,
  Search,
  Plus,
  ArrowRight,
  Package,
  Factory,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  X,
  RefreshCw,
  Scale,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  Download,
  Check,
  FolderArchive,
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderLine, BusinessPartner, Item, Plant } from '../types/erp';

interface ProcurementDashboardViewProps {
  tenantId?: string;
  items: Item[];
  partners: BusinessPartner[];
  plants: Plant[];
  onNavigateToWorkflows?: () => void;
  onNavigateToDocuments?: (entityId?: string) => void;
}

export const ProcurementDashboardView: React.FC<ProcurementDashboardViewProps> = ({
  tenantId,
  items,
  partners,
  plants,
  onNavigateToWorkflows,
  onNavigateToDocuments,
}) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [plantFilter, setPlantFilter] = useState<string>('ALL');
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<number | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showReceiveModal, setShowReceiveModal] = useState<boolean>(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedPOLines, setSelectedPOLines] = useState<PurchaseOrderLine[]>([]);
  const [loadingLines, setLoadingLines] = useState<boolean>(false);

  // Delivery status update form
  const [statusForm, setStatusForm] = useState({
    deliveryStatus: 'IN_TRANSIT',
    transporterName: '',
    vehicleNumber: '',
    trackingNumber: '',
  });

  // Goods receipt form
  const [receiveForm, setReceiveForm] = useState({
    gatePassNo: '',
    weighbridgeGrossMT: '',
    receipts: [] as Array<{ lineId: string; receivedQuantity: string; maxQuantity: string }>,
  });

  // Create PO form
  const [newPO, setNewPO] = useState({
    poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    supplierId: '',
    plantId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    paymentTermsDays: 30,
    transporterName: '',
    vehicleNumber: '',
    trackingNumber: '',
    remarks: 'Urgent procurement for continuous casting & TMT rolling lines',
    lines: [
      {
        itemId: '',
        quantity: '50.000',
        uom: 'MT',
        unitRate: '46000.00',
        gstRate: '18.00',
      },
    ],
  });

  // Fetch purchase orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/procurement/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch lines for a PO
  const fetchLinesForPO = async (po: PurchaseOrder) => {
    setSelectedPO(po);
    setLoadingLines(true);
    try {
      const res = await fetch(`/api/v1/procurement/orders/${po.id}/lines`);
      if (res.ok) {
        const data: PurchaseOrderLine[] = await res.json();
        setSelectedPOLines(data);

        // Prepopulate receive receipts
        setReceiveForm({
          gatePassNo: `GP-${po.poNumber.replace('PO-', '')}`,
          weighbridgeGrossMT: '',
          receipts: data.map((l) => ({
            lineId: l.id,
            receivedQuantity: (parseFloat(l.quantity) - parseFloat(l.receivedQuantity || '0')).toFixed(3),
            maxQuantity: (parseFloat(l.quantity) - parseFloat(l.receivedQuantity || '0')).toFixed(3),
          })),
        });
      }
    } catch (err) {
      console.error('Failed to load PO lines:', err);
    } finally {
      setLoadingLines(false);
    }
  };

  // Open Status modal
  const handleOpenStatusModal = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setStatusForm({
      deliveryStatus: po.deliveryStatus,
      transporterName: po.transporterName || '',
      vehicleNumber: po.vehicleNumber || '',
      trackingNumber: po.trackingNumber || '',
    });
    setShowStatusModal(true);
  };

  // Submit delivery status update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const res = await fetch(`/api/v1/procurement/orders/${selectedPO.id}/delivery-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusForm),
      });
      if (res.ok) {
        setShowStatusModal(false);
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update delivery status:', err);
    }
  };

  // Submit goods receipt
  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const res = await fetch(`/api/v1/procurement/orders/${selectedPO.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatePassNo: receiveForm.gatePassNo,
          weighbridgeGrossMT: receiveForm.weighbridgeGrossMT,
          receipts: receiveForm.receipts.map((r) => ({
            lineId: r.lineId,
            receivedQuantity: r.receivedQuantity,
          })),
        }),
      });
      if (res.ok) {
        setShowReceiveModal(false);
        fetchOrders();
        // Refresh lines if currently viewing drawer
        fetchLinesForPO(selectedPO);
      }
    } catch (err) {
      console.error('Failed to receive goods:', err);
    }
  };

  // Create new PO
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPO.supplierId || !newPO.plantId || newPO.lines.length === 0 || !newPO.lines[0].itemId) {
      alert('Please select a supplier, plant, and at least one item line.');
      return;
    }

    try {
      const res = await fetch('/api/v1/procurement/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPO),
      });

      if (res.ok) {
        setShowCreateModal(false);
        // Reset form
        setNewPO({
          poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          supplierId: '',
          plantId: '',
          orderDate: new Date().toISOString().split('T')[0],
          expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          paymentTermsDays: 30,
          transporterName: '',
          vehicleNumber: '',
          trackingNumber: '',
          remarks: 'Urgent procurement for continuous casting & TMT rolling lines',
          lines: [
            {
              itemId: '',
              quantity: '50.000',
              uom: 'MT',
              unitRate: '46000.00',
              gstRate: '18.00',
            },
          ],
        });
        fetchOrders();
      } else {
        const err = await res.json();
        alert(`Failed to create PO: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error creating PO:', err);
    }
  };

  // Add line to new PO form
  const handleAddLine = () => {
    setNewPO((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          itemId: '',
          quantity: '25.000',
          uom: 'MT',
          unitRate: '45000.00',
          gstRate: '18.00',
        },
      ],
    }));
  };

  // Remove line from new PO form
  const handleRemoveLine = (idx: number) => {
    if (newPO.lines.length <= 1) return;
    setNewPO((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  // Update line field
  const handleLineChange = (idx: number, field: string, value: string) => {
    setNewPO((prev) => {
      const updatedLines = [...prev.lines];
      updatedLines[idx] = { ...updatedLines[idx], [field]: value };

      // If item changed, autofill uom
      if (field === 'itemId') {
        const selectedItem = items.find((it) => it.id === value);
        if (selectedItem) {
          updatedLines[idx].uom = selectedItem.uomCode || 'MT';
          updatedLines[idx].unitRate = selectedItem.standardCost || '45000.00';
        }
      }
      return { ...prev, lines: updatedLines };
    });
  };

  // Filtered orders
  const filteredOrders = orders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.supplierName && po.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.vehicleNumber && po.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.trackingNumber && po.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.transporterName && po.transporterName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'OPEN'
        ? po.deliveryStatus !== 'DELIVERED' && po.deliveryStatus !== 'CANCELLED'
        : po.deliveryStatus === statusFilter;

    const matchesPlant = plantFilter === 'ALL' || po.plantId === plantFilter;

    const matchesStage = activeWorkflowStage === null || po.currentWorkflowStep === activeWorkflowStage;

    return matchesSearch && matchesStatus && matchesPlant && matchesStage;
  });

  // Calculate Metrics
  const totalOpenValue = orders
    .filter((po) => po.deliveryStatus !== 'DELIVERED' && po.deliveryStatus !== 'CANCELLED')
    .reduce((acc, curr) => acc + (parseFloat(curr.netAmount) || 0), 0);

  const inTransitCount = orders.filter(
    (po) => po.deliveryStatus === 'IN_TRANSIT' || po.deliveryStatus === 'SHIPPED'
  ).length;

  const gateEntryCount = orders.filter((po) => po.deliveryStatus === 'GATE_ENTRY').length;

  const pendingApprovalsCount = orders.filter((po) => po.approvalStatus === 'PENDING_APPROVAL').length;

  const deliveredCount = orders.filter((po) => po.deliveryStatus === 'DELIVERED').length;

  // Supplier performance aggregation
  const supplierStats = partners
    .filter((p) => p.partnerType === 'SUPPLIER' || p.partnerType === 'BOTH')
    .map((s) => {
      const supplierOrders = orders.filter((o) => o.supplierId === s.id);
      const totalAmount = supplierOrders.reduce((sum, o) => sum + (parseFloat(o.netAmount) || 0), 0);
      const activeShipments = supplierOrders.filter(
        (o) => o.deliveryStatus === 'IN_TRANSIT' || o.deliveryStatus === 'GATE_ENTRY'
      ).length;
      const completed = supplierOrders.filter((o) => o.deliveryStatus === 'DELIVERED').length;
      return {
        supplier: s,
        orderCount: supplierOrders.length,
        totalAmount,
        activeShipments,
        completed,
        otifScore: supplierOrders.length > 0 ? (completed / supplierOrders.length >= 0.5 ? '96%' : '88%') : 'N/A',
      };
    })
    .filter((s) => s.orderCount > 0);

  // Workflow Stages definition
  const workflowStages = [
    {
      step: 1,
      name: 'Requisition & Approval',
      desc: 'Purchase indent initiated & pending multi-tier approval',
      icon: Clock,
      count: orders.filter((o) => o.currentWorkflowStep === 1).length,
      color: 'border-amber-400 bg-amber-50 text-amber-900',
      activeColor: 'bg-amber-600 text-white',
    },
    {
      step: 2,
      name: 'PO Issued & Supplier Ack',
      desc: 'Approved PO sent to vendor, manufacturing/loading ready',
      icon: FileText,
      count: orders.filter((o) => o.currentWorkflowStep === 2).length,
      color: 'border-blue-400 bg-blue-50 text-blue-900',
      activeColor: 'bg-blue-600 text-white',
    },
    {
      step: 3,
      name: 'Dispatch & In-Transit',
      desc: 'Vehicle loaded, LR/Bilty issued, GPS tracking active',
      icon: Truck,
      count: orders.filter((o) => o.currentWorkflowStep === 3).length,
      color: 'border-indigo-400 bg-indigo-50 text-indigo-900',
      activeColor: 'bg-indigo-600 text-white',
    },
    {
      step: 4,
      name: 'Gate Entry & Weighbridge QC',
      desc: 'Truck at plant gate, gross weight taken, QC chemistry check',
      icon: Scale,
      count: orders.filter((o) => o.currentWorkflowStep === 4).length,
      color: 'border-teal-400 bg-teal-50 text-teal-900',
      activeColor: 'bg-teal-600 text-white',
    },
    {
      step: 5,
      name: 'Goods Receipt (GRN) & Match',
      desc: 'Tare weight recorded, offloaded, 3-way matching ready',
      icon: CheckCircle2,
      count: orders.filter((o) => o.currentWorkflowStep === 5).length,
      color: 'border-emerald-400 bg-emerald-50 text-emerald-900',
      activeColor: 'bg-emerald-600 text-white',
    },
  ];

  // Helper for status badge
  const renderDeliveryBadge = (status: string) => {
    switch (status) {
      case 'ORDERED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">ORDERED</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">SHIPPED</span>;
      case 'IN_TRANSIT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">🚚 IN TRANSIT</span>;
      case 'GATE_ENTRY':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">⚖️ GATE ENTRY / WB</span>;
      case 'PARTIALLY_DELIVERED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">PARTIAL RECEIPT</span>;
      case 'DELIVERED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">✓ GRN COMPLETE</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Helper for approval badge
  const renderApprovalBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">APPROVED</span>;
      case 'PENDING_APPROVAL':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">MAKER/CHECKER PENDING</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">REJECTED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>ERP Platform</span>
            <span>/</span>
            <span>Supply Chain Management</span>
            <span>/</span>
            <span className="text-blue-600">Procurement & PO Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Procurement Dashboard</h1>
            <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-blue-200">
              Procure-to-Pay (P2P) Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOrders}
            className="p-2 border border-slate-300 rounded hover:bg-slate-100 text-slate-600 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => {
              // Export POs as CSV
              const headers = ['PO Number', 'Supplier', 'Order Date', 'Delivery Date', 'Status', 'Approval', 'Net Amount (INR)', 'Transporter', 'Vehicle No'];
              const rows = orders.map((o) => [
                o.poNumber,
                `"${o.supplierName || ''}"`,
                o.orderDate,
                o.expectedDeliveryDate,
                o.deliveryStatus,
                o.approvalStatus,
                o.netAmount,
                `"${o.transporterName || ''}"`,
                `"${o.vehicleNumber || ''}"`,
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `Procurement_PO_Report_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-2 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Raise Purchase Order
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Metrics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open PO Commitment</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              ₹ {(totalOpenValue / 10000000).toFixed(2)} Cr
            </div>
            <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <span className="font-semibold text-slate-700">{orders.length} total orders</span> active in system
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In-Transit Shipments</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600">{inTransitCount} Loads</div>
            <div className="mt-1 text-xs text-slate-500">Live GPS & Bilty issued</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">At Plant Gate / Weighbridge</span>
              <div className="p-2 bg-teal-50 text-teal-600 rounded">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-teal-700">{gateEntryCount} Trucks</div>
            <div className="mt-1 text-xs text-slate-500">Gross weighment & QC sampling</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Desk Pending</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-600">{pendingApprovalsCount} POs</div>
            <div className="mt-1 text-xs text-slate-500">
              <button
                onClick={onNavigateToWorkflows}
                className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
              >
                Review in Workflow Engine →
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered & Closed</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">{deliveredCount} POs</div>
            <div className="mt-1 text-xs text-slate-500">GRN posted to Inventory</div>
          </div>
        </div>

        {/* Visual Status Tracker for Open Procurement Workflows (5-Stage Pipeline) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Visual Procurement Lifecycle Tracker (P2P Pipeline)
              </h2>
              <p className="text-xs text-slate-500">
                End-to-end stage tracker from Indent Requisition to Dual Approvals, In-Transit Transit Dispatch, Weighbridge Gate Entry, and Final GRN
              </p>
            </div>
            {activeWorkflowStage !== null && (
              <button
                onClick={() => setActiveWorkflowStage(null)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium self-start sm:self-auto flex items-center gap-1"
              >
                Clear Stage Filter (Show All)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {workflowStages.map((stage) => {
              const Icon = stage.icon;
              const isSelected = activeWorkflowStage === stage.step;
              return (
                <div
                  key={stage.step}
                  onClick={() => setActiveWorkflowStage(isSelected ? null : stage.step)}
                  className={`relative p-3.5 rounded-lg border transition cursor-pointer select-none ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Step {stage.step}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? stage.activeColor : stage.color
                      }`}
                    >
                      {stage.count} POs
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 leading-snug">{stage.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{stage.desc}</p>

                  <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-semibold text-blue-600">
                    <span>{isSelected ? 'Filtering view' : 'Click to inspect'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supplier Delivery Status Matrix */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Supplier Delivery Status Matrix & Logistics Overview
              </h2>
              <p className="text-xs text-slate-500">
                Key vendor performance, active in-transit loads, and On-Time In-Full (OTIF) fulfillment reliability
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {supplierStats.length} Strategic Suppliers Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supplierStats.map((stat) => (
              <div
                key={stat.supplier.id}
                className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-white to-slate-50/60 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{stat.supplier.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Code: {stat.supplier.code} | GSTIN: {stat.supplier.gstin}</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800">
                      OTIF: {stat.otifScore}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-white p-2 rounded border border-slate-100">
                      <div className="text-xs text-slate-400 font-medium">Orders</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{stat.orderCount}</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100">
                      <div className="text-xs text-slate-400 font-medium">In Transit</div>
                      <div className="text-sm font-bold text-amber-600 mt-0.5">{stat.activeShipments}</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100">
                      <div className="text-xs text-slate-400 font-medium">Total Spend</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">₹{(stat.totalAmount / 100000).toFixed(1)}L</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {stat.activeShipments > 0 ? (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        {stat.activeShipments} vehicle(s) on route
                      </span>
                    ) : (
                      'All dispatches up-to-date'
                    )}
                  </span>
                  <button
                    onClick={() => {
                      setSearchTerm(stat.supplier.name);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                  >
                    Filter POs →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PO Master Data Grid & Filtering */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search PO#, Supplier, Vehicle No, Transporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  <option value="ALL">All Delivery Statuses</option>
                  <option value="OPEN">All Open Orders</option>
                  <option value="ORDERED">ORDERED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="IN_TRANSIT">IN TRANSIT</option>
                  <option value="GATE_ENTRY">GATE ENTRY / WEIGHBRIDGE</option>
                  <option value="PARTIALLY_DELIVERED">PARTIALLY DELIVERED</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
              </div>

              {/* Plant Filter */}
              <select
                value={plantFilter}
                onChange={(e) => setPlantFilter(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
              >
                <option value="ALL">All Plants</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900">{filteredOrders.length}</span> of {orders.length} Purchase Orders
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">PO Number & Stage</th>
                  <th className="py-3 px-4">Supplier & GSTIN</th>
                  <th className="py-3 px-4">Destination Plant</th>
                  <th className="py-3 px-4">Order / Delivery Date</th>
                  <th className="py-3 px-4">Net Value (₹)</th>
                  <th className="py-3 px-4">Approval State</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4">Logistics / Vehicle</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Loading live purchase orders from Cloud SQL PostgreSQL...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No purchase orders match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((po) => {
                    const isOverdue =
                      new Date(po.expectedDeliveryDate) < new Date() && po.deliveryStatus !== 'DELIVERED';
                    return (
                      <tr
                        key={po.id}
                        className="hover:bg-blue-50/40 transition group cursor-pointer"
                        onClick={() => fetchLinesForPO(po)}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{po.poNumber}</span>
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              Gate {po.currentWorkflowStep}/5
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{po.supplierName || 'N/A'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{po.supplierGstin || 'No GSTIN'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          <div className="flex items-center gap-1">
                            <Factory className="w-3.5 h-3.5 text-slate-400" />
                            {po.plantName || 'Main Plant'}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-slate-800 font-medium">{po.orderDate}</div>
                          <div
                            className={`text-[11px] flex items-center gap-1 font-semibold ${
                              isOverdue ? 'text-rose-600' : 'text-slate-500'
                            }`}
                          >
                            {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                            Exp: {po.expectedDeliveryDate}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          ₹ {parseFloat(po.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          <div className="text-[10px] text-slate-400 font-normal">
                            Tax: ₹{parseFloat(po.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {renderApprovalBadge(po.approvalStatus)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {renderDeliveryBadge(po.deliveryStatus)}
                        </td>
                        <td className="py-3 px-4">
                          {po.vehicleNumber ? (
                            <div>
                              <div className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                                <Truck className="w-3 h-3 text-blue-500" />
                                {po.vehicleNumber}
                              </div>
                              <div className="text-[11px] text-slate-500">{po.transporterName || 'Fleet'}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not Assigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenStatusModal(po)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition"
                              title="Update Delivery Stage & Vehicle"
                            >
                              Status
                            </button>
                            <button
                              onClick={() => {
                                fetchLinesForPO(po);
                                setShowReceiveModal(true);
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded font-semibold text-[11px] transition"
                              title="Gate Entry / Goods Receipt (GRN)"
                            >
                              Receive GRN
                            </button>
                            <button
                              onClick={() => fetchLinesForPO(po)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-500"
                              title="View Order Details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PO Line Items & Detailed Drawer (When PO selected) */}
        {selectedPO && (
          <div className="bg-white rounded-lg border border-blue-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-mono">{selectedPO.poNumber}</h3>
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                    Stage {selectedPO.currentWorkflowStep} of 5
                  </span>
                  {renderDeliveryBadge(selectedPO.deliveryStatus)}
                  {renderApprovalBadge(selectedPO.approvalStatus)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Vendor: <span className="font-semibold text-slate-800">{selectedPO.supplierName}</span> | Plant:{' '}
                  <span className="font-semibold text-slate-800">{selectedPO.plantName}</span> | Payment Terms:{' '}
                  {selectedPO.paymentTermsDays} Days Credit
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToDocuments && (
                  <button
                    onClick={() => onNavigateToDocuments(selectedPO.poNumber)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold flex items-center gap-1.5"
                    title="View & Upload PO Attachments (Invoices, MTC, Weighbridge)"
                  >
                    <FolderArchive className="w-3.5 h-3.5" />
                    PO Documents (DMS)
                  </button>
                )}
                <button
                  onClick={() => setShowReceiveModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Post Goods Receipt (GRN)
                </button>
                <button
                  onClick={() => handleOpenStatusModal(selectedPO)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Update Logistics
                </button>
                <button
                  onClick={() => setSelectedPO(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Line Items Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Item Code & Description</th>
                    <th className="py-2.5 px-3">Ordered Qty</th>
                    <th className="py-2.5 px-3">Received Qty</th>
                    <th className="py-2.5 px-3">Fulfillment Progress</th>
                    <th className="py-2.5 px-3">Unit Rate (₹)</th>
                    <th className="py-2.5 px-3">GST %</th>
                    <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loadingLines ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-400">
                        Loading item lines...
                      </td>
                    </tr>
                  ) : selectedPOLines.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-400">
                        No lines found for this purchase order.
                      </td>
                    </tr>
                  ) : (
                    selectedPOLines.map((line) => {
                      const ordered = parseFloat(line.quantity) || 0;
                      const received = parseFloat(line.receivedQuantity || '0') || 0;
                      const pct = ordered > 0 ? Math.min(100, (received / ordered) * 100) : 0;
                      return (
                        <tr key={line.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{line.lineNumber}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{line.itemName || line.itemCode}</div>
                            <div className="text-[11px] font-mono text-slate-400 font-normal">{line.itemCode}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold">
                            {line.quantity} {line.uom}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">
                            {line.receivedQuantity || '0.000'} {line.uom}
                          </td>
                          <td className="py-2.5 px-3 w-40">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full ${
                                    pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-slate-300'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                              <span className="text-[11px] font-mono font-bold text-slate-700">{pct.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono">₹{parseFloat(line.unitRate).toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{line.gstRate}%</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">
                            ₹{parseFloat(line.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Transporter & Delivery Information Footer */}
            <div className="bg-slate-50 rounded p-3.5 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Transporter</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedPO.transporterName || 'To Be Assigned'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Vehicle Registration</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedPO.vehicleNumber || 'To Be Assigned'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">LR / Bilty / Docket No</span>
                <p className="font-semibold font-mono text-slate-800 mt-0.5">{selectedPO.trackingNumber || 'Pending Dispatch'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Special Instructions / Remarks</span>
                <p className="text-slate-700 mt-0.5 line-clamp-1">{selectedPO.remarks || 'Standard TMT / Billets quality inspection required'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Raise Purchase Order (PO)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">PO Number *</label>
                  <input
                    type="text"
                    required
                    value={newPO.poNumber}
                    onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Supplier / Vendor *</label>
                  <select
                    required
                    value={newPO.supplierId}
                    onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Supplier</option>
                    {partners
                      .filter((p) => p.partnerType === 'SUPPLIER' || p.partnerType === 'BOTH')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Receiving Plant *</label>
                  <select
                    required
                    value={newPO.plantId}
                    onChange={(e) => setNewPO({ ...newPO, plantId: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Plant Location</option>
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Order Date *</label>
                  <input
                    type="date"
                    required
                    value={newPO.orderDate}
                    onChange={(e) => setNewPO({ ...newPO, orderDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expected Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={newPO.expectedDeliveryDate}
                    onChange={(e) => setNewPO({ ...newPO, expectedDeliveryDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Credit Terms (Days)</label>
                  <input
                    type="number"
                    value={newPO.paymentTermsDays}
                    onChange={(e) => setNewPO({ ...newPO, paymentTermsDays: parseInt(e.target.value) || 30 })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items Section */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Purchase Order Line Items</h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Material Line
                  </button>
                </div>

                <div className="space-y-2">
                  {newPO.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded border border-slate-200"
                    >
                      <div className="col-span-5">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Item / Raw Material</label>
                        <select
                          required
                          value={line.itemId}
                          onChange={(e) => handleLineChange(idx, 'itemId', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                        >
                          <option value="">Select Material</option>
                          {items.map((it) => (
                            <option key={it.id} value={it.id}>
                              {it.name} ({it.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Quantity ({line.uom})</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={line.quantity}
                          onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white font-mono"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Rate / Unit (₹)</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={line.unitRate}
                          onChange={(e) => handleLineChange(idx, 'unitRate', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white font-mono"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">GST %</label>
                        <select
                          value={line.gstRate}
                          onChange={(e) => handleLineChange(idx, 'gstRate', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white font-mono"
                        >
                          <option value="18.00">18%</option>
                          <option value="12.00">12%</option>
                          <option value="5.00">5%</option>
                          <option value="28.00">28%</option>
                        </select>
                      </div>

                      <div className="col-span-1 text-center pt-3">
                        {newPO.lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-slate-400 hover:text-rose-600"
                            title="Remove Line"
                          >
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarks & Specifications</label>
                <textarea
                  rows={2}
                  value={newPO.remarks}
                  onChange={(e) => setNewPO({ ...newPO, remarks: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Test certificate mandatory, IS 1786 Fe 550D compliant, dispatch in 40ft trailers"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Posting this purchase order will register it under Stage 1 and immediately trigger the SAP-style Maker/Checker
                  Approval Matrix in the Workflow Engine.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs"
                >
                  Submit & Route to Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE DELIVERY STATUS MODAL */}
      {showStatusModal && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Update Delivery Status: {selectedPO.poNumber}</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Delivery Stage *</label>
                <select
                  value={statusForm.deliveryStatus}
                  onChange={(e) => setStatusForm({ ...statusForm, deliveryStatus: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ORDERED">1. ORDERED (Awaiting Vendor Dispatch)</option>
                  <option value="SHIPPED">2. SHIPPED (Loaded at Supplier Facility)</option>
                  <option value="IN_TRANSIT">3. IN_TRANSIT (On Highway / En Route)</option>
                  <option value="GATE_ENTRY">4. GATE_ENTRY (At Plant Gate / Weighbridge)</option>
                  <option value="PARTIALLY_DELIVERED">5. PARTIALLY DELIVERED (Partial Offloading)</option>
                  <option value="DELIVERED">6. DELIVERED (GRN Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transporter / Logistics Partner</label>
                <input
                  type="text"
                  value={statusForm.transporterName}
                  onChange={(e) => setStatusForm({ ...statusForm, transporterName: e.target.value })}
                  placeholder="e.g. VRL Logistics / TCI Freight"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Truck / Vehicle Registration No.</label>
                <input
                  type="text"
                  value={statusForm.vehicleNumber}
                  onChange={(e) => setStatusForm({ ...statusForm, vehicleNumber: e.target.value })}
                  placeholder="e.g. CG-04-ME-9021"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">LR / Bilty / Docket Number</label>
                <input
                  type="text"
                  value={statusForm.trackingNumber}
                  onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                  placeholder="e.g. LR-77821-BL"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GOODS RECEIPT / GRN MODAL */}
      {showReceiveModal && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-emerald-50">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Gate Receipt & Weighbridge Entry (GRN) — {selectedPO.poNumber}
                </h3>
              </div>
              <button onClick={() => setShowReceiveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReceiveGoods} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gate Pass / Inward Slip No. *</label>
                  <input
                    type="text"
                    required
                    value={receiveForm.gatePassNo}
                    onChange={(e) => setReceiveForm({ ...receiveForm, gatePassNo: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Weighbridge Gross Weight (MT) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 52.840 MT"
                    value={receiveForm.weighbridgeGrossMT}
                    onChange={(e) => setReceiveForm({ ...receiveForm, weighbridgeGrossMT: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Line Items Received Quantities
                </h4>
                <div className="border border-slate-200 rounded divide-y divide-slate-200">
                  {selectedPOLines.map((line, idx) => {
                    const r = receiveForm.receipts[idx];
                    return (
                      <div key={line.id} className="p-3 bg-slate-50 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-slate-900">{line.itemName}</div>
                          <div className="text-slate-500 text-[11px]">
                            Ordered: <span className="font-mono font-semibold">{line.quantity} {line.uom}</span> | Prev
                            Recv: <span className="font-mono text-emerald-700">{line.receivedQuantity || '0'} {line.uom}</span>
                          </div>
                        </div>

                        <div className="w-36">
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                            This Inward ({line.uom})
                          </label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={r?.receivedQuantity || '0'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReceiveForm((prev) => {
                                const receipts = [...prev.receipts];
                                receipts[idx] = { ...receipts[idx], receivedQuantity: val };
                                return { ...prev, receipts };
                              });
                            }}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded text-slate-600 text-[11px]">
                Upon confirmation, this transaction records a formal Goods Receipt Note (GRN) in the Cloud SQL audit trail
                and updates the material inventory status to Stage 5 (Delivered).
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold"
                >
                  Confirm GRN & Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
