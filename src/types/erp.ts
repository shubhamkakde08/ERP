export interface Tenant {
  id: string;
  code: string;
  name: string;
  plan: string;
  status: string;
  contactEmail: string;
  contactPhone?: string;
  currency: string;
  timezone: string;
  createdAt: string;
}

export interface Company {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  legalName?: string;
  gstin: string;
  pan: string;
  cin?: string;
  currency: string;
  registeredAddress: string;
  isDefault: boolean;
}

export interface Plant {
  id: string;
  tenantId: string;
  divisionId: string;
  code: string;
  name: string;
  plantType: string;
  address: string;
  stateCode: string;
  gstin?: string;
}

export interface Warehouse {
  id: string;
  tenantId: string;
  plantId: string;
  code: string;
  name: string;
  warehouseType: string;
  location: string;
  isActive: boolean;
}

export interface Item {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  itemGroup: string;
  itemCategory: string;
  uomId: string;
  uomCode?: string;
  hsnSacId?: string;
  valuationMethod: string;
  standardCost: string;
  sellingPrice: string;
  minStockLevel: string;
  maxStockLevel: string;
  reorderPoint: string;
  isQualityCheckRequired: boolean;
  isBatchManaged: boolean;
  isActive: boolean;
}

export interface BusinessPartner {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  partnerType: 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
  gstin: string;
  pan: string;
  email?: string;
  phone?: string;
  creditLimit: string;
  paymentTermsDays: number;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  glAccountId?: string;
  isActive: boolean;
}

export interface GLAccount {
  id: string;
  tenantId: string;
  companyId: string;
  accountCode: string;
  accountName: string;
  scheduleType: string;
  accountClass: string;
  subAccountType: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  isControlAccount: boolean;
  isActive: boolean;
}

export interface CostCenter {
  id: string;
  tenantId: string;
  companyId: string;
  code: string;
  name: string;
  department: string;
  isProduction: boolean;
}

export interface UOM {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  decimalPlaces: number;
  isStandard: boolean;
}

export interface GSTMaster {
  id: string;
  tenantId: string;
  hsnSacCode: string;
  description: string;
  type: string;
  igstRate: string;
  cgstRate: string;
  sgstRate: string;
  rcmApplicable: boolean;
}

export interface WorkflowDefinition {
  id: string;
  tenantId: string;
  documentType: string;
  name: string;
  minAmount: string;
  maxAmount: string;
  approvalLevels: Array<{
    level: number;
    role: string;
    description: string;
    canReject: boolean;
  }>;
  isActive: boolean;
}

export interface WorkflowInstance {
  id: string;
  tenantId: string;
  documentType: string;
  documentId: string;
  documentAmount: string;
  currentLevel: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userEmail: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  oldValues?: any;
  newValues?: any;
  reason?: string;
  timestamp: string;
}

export interface Role {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
}

export interface User {
  id: string;
  tenantId: string;
  uid: string;
  email: string;
  fullName: string;
  roleId?: string;
  department: string;
  isActive: boolean;
  approvalLimit: string;
}

export type PODeliveryStatus =
  | 'ORDERED'
  | 'DISPATCHED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'WEIGHBRIDGE_IN'
  | 'GATE_ENTRY'
  | 'PARTIALLY_DELIVERED'
  | 'GRN_COMPLETED'
  | 'DELIVERED'
  | 'DELAYED'
  | 'CANCELLED';

export type POApprovalStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string;
  supplierId: string;
  supplierName?: string;
  supplierGstin?: string;
  plantId: string;
  plantName?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  paymentTermsDays: number;
  deliveryStatus: PODeliveryStatus;
  approvalStatus: POApprovalStatus;
  totalAmount: string;
  taxAmount: string;
  netAmount: string;
  trackingNumber?: string;
  transporterName?: string;
  vehicleNumber?: string;
  remarks?: string;
  currentWorkflowStep: number;
  createdAt: string;
  lines?: PurchaseOrderLine[];
}

export interface PurchaseOrderLine {
  id: string;
  tenantId: string;
  purchaseOrderId: string;
  itemId: string;
  itemCode?: string;
  itemName?: string;
  lineNumber: number;
  quantity: string;
  receivedQuantity: string;
  uom: string;
  unitRate: string;
  gstRate: string;
  lineTotal: string;
  remarks?: string;
}

export type DocumentCategory =
  | 'PROCUREMENT'
  | 'INVOICE'
  | 'WEIGHBRIDGE'
  | 'QUALITY_MTC'
  | 'LEGAL'
  | 'FINANCE';

export interface ERPDocument {
  id: string;
  tenantId: string;
  documentNumber: string;
  title: string;
  category: DocumentCategory;
  entityType?: string;
  entityId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  extractedMetadata?: Record<string, any>;
  uploadedBy: string;
  status: 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

