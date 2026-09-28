import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// -------------------------------------------------------------
// 1. TENANT & MULTI-ORGANIZATION HIERARCHY
// -------------------------------------------------------------

export const tenants = pgTable('tenants', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  code: text('code').notNull().unique(), // e.g. T-STEEL-01
  name: text('name').notNull(),
  plan: text('plan').default('ENTERPRISE').notNull(),
  status: text('status').default('ACTIVE').notNull(), // ACTIVE, SUSPENDED
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  currency: text('currency').default('INR').notNull(),
  timezone: text('timezone').default('Asia/Kolkata').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const companies = pgTable('companies', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // e.g. COMP-1000
  name: text('name').notNull(),
  legalName: text('legal_name'),
  gstin: text('gstin').notNull(),
  pan: text('pan').notNull(),
  cin: text('cin'),
  currency: text('currency').default('INR').notNull(),
  registeredAddress: text('registered_address').notNull(),
  isDefault: boolean('is_default').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const divisions = pgTable('divisions', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // e.g. DIV-TMT
  name: text('name').notNull(), // e.g. Steel & TMT Division
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const plants = pgTable('plants', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  divisionId: uuid('division_id').references(() => divisions.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // e.g. PLT-RAIPUR
  name: text('name').notNull(),
  plantType: text('plant_type').default('MANUFACTURING').notNull(), // MANUFACTURING, TRADING, ROLLING_MILL
  address: text('address').notNull(),
  stateCode: text('state_code').default('22').notNull(), // GST state code (e.g. 22 for CG, 27 for MH)
  gstin: text('gstin'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const warehouses = pgTable('warehouses', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  plantId: uuid('plant_id').references(() => plants.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // e.g. WH-RM-01
  name: text('name').notNull(),
  warehouseType: text('warehouse_type').default('RAW_MATERIAL').notNull(), // RAW_MATERIAL, FINISHED_GOODS, SPARES, SCRAP
  location: text('location').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const warehouseLocations = pgTable('warehouse_locations', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // e.g. RACK-A-BIN-01
  aisle: text('aisle'),
  rack: text('rack'),
  bin: text('bin'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const financialYears = pgTable('financial_years', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // e.g. FY 2026-27
  startDate: text('start_date').notNull(), // YYYY-MM-DD
  endDate: text('end_date').notNull(), // YYYY-MM-DD
  isCurrent: boolean('is_current').default(true).notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 2. USERS, ROLES & PERMISSIONS
// -------------------------------------------------------------

export const roles = pgTable('roles', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // ADMIN, PLANT_MANAGER, FINANCE_HEAD, STORE_INCHARGE, QC_MANAGER
  name: text('name').notNull(),
  description: text('description'),
  permissions: jsonb('permissions').$type<string[]>().default([]).notNull(),
  isSystem: boolean('is_system').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  roleId: uuid('role_id').references(() => roles.id),
  department: text('department').default('Operations').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  approvalLimit: decimal('approval_limit', { precision: 18, scale: 2 }).default('500000.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 3. MASTER DATA: UOM, GST, GL ACCOUNTS, COST CENTERS
// -------------------------------------------------------------

export const uoms = pgTable('uoms', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // MT, KG, PCS, NOS, MTR, TON
  name: text('name').notNull(),
  decimalPlaces: integer('decimal_places').default(3).notNull(),
  isStandard: boolean('is_standard').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const gstMasters = pgTable('gst_masters', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  hsnSacCode: text('hsn_sac_code').notNull(), // e.g. 7214 (TMT Rebars), 7204 (Ferrous Scrap)
  description: text('description').notNull(),
  type: text('type').default('GOODS').notNull(), // GOODS, SERVICES
  igstRate: decimal('igst_rate', { precision: 5, scale: 2 }).default('18.00').notNull(),
  cgstRate: decimal('cgst_rate', { precision: 5, scale: 2 }).default('9.00').notNull(),
  sgstRate: decimal('sgst_rate', { precision: 5, scale: 2 }).default('9.00').notNull(),
  rcmApplicable: boolean('rcm_applicable').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const glAccounts = pgTable('gl_accounts', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  accountCode: text('account_code').notNull(), // e.g. 100010 (Raw Material Stock), 200010 (Accounts Payable)
  accountName: text('account_name').notNull(),
  scheduleType: text('schedule_type').notNull(), // BALANCE_SHEET, PROFIT_LOSS
  accountClass: text('account_class').notNull(), // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  subAccountType: text('sub_account_type').notNull(), // CURRENT_ASSET, INVENTORY, DIRECT_EXPENSE, etc.
  normalBalance: text('normal_balance').default('DEBIT').notNull(), // DEBIT, CREDIT
  isControlAccount: boolean('is_control_account').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const costCenters = pgTable('cost_centers', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // CC-MELT-01, CC-ROLLING-01
  name: text('name').notNull(),
  department: text('department').notNull(),
  isProduction: boolean('is_production').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 4. BUSINESS PARTNERS (CUSTOMERS & SUPPLIERS)
// -------------------------------------------------------------

export const businessPartners = pgTable('business_partners', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // CUST-0001, SUPP-0001
  name: text('name').notNull(),
  partnerType: text('partner_type').notNull(), // CUSTOMER, SUPPLIER, BOTH
  gstin: text('gstin').notNull(),
  pan: text('pan').notNull(),
  email: text('email'),
  phone: text('phone'),
  creditLimit: decimal('credit_limit', { precision: 18, scale: 2 }).default('1000000.00'),
  paymentTermsDays: integer('payment_terms_days').default(30).notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  stateCode: text('state_code').default('22').notNull(),
  pincode: text('pincode').notNull(),
  glAccountId: uuid('gl_account_id').references(() => glAccounts.id),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 5. ITEM MASTER & INVENTORY DEFINITION
// -------------------------------------------------------------

export const items = pgTable('items', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // e.g. TMT-FE550D-12MM, BILLET-100X100
  name: text('name').notNull(),
  itemGroup: text('item_group').notNull(), // RAW_MATERIAL, FINISHED_GOODS, SEMI_FINISHED, CONSUMABLES, SPARES
  itemCategory: text('item_category').default('STEEL').notNull(),
  uomId: uuid('uom_id').references(() => uoms.id).notNull(),
  hsnSacId: uuid('hsn_sac_id').references(() => gstMasters.id),
  valuationMethod: text('valuation_method').default('WEIGHTED_AVERAGE').notNull(), // FIFO, WEIGHTED_AVERAGE, STANDARD
  standardCost: decimal('standard_cost', { precision: 18, scale: 2 }).default('0.00').notNull(),
  sellingPrice: decimal('selling_price', { precision: 18, scale: 2 }).default('0.00').notNull(),
  minStockLevel: decimal('min_stock_level', { precision: 18, scale: 3 }).default('0.000'),
  maxStockLevel: decimal('max_stock_level', { precision: 18, scale: 3 }).default('10000.000'),
  reorderPoint: decimal('reorder_point', { precision: 18, scale: 3 }).default('50.000'),
  isQualityCheckRequired: boolean('is_quality_check_required').default(true).notNull(),
  isBatchManaged: boolean('is_batch_managed').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 6. WORKFLOW & APPROVAL MATRIX ENGINE
// -------------------------------------------------------------

export const workflowDefinitions = pgTable('workflow_definitions', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  documentType: text('document_type').notNull(), // PO, SO, GRN, JV, PR
  name: text('name').notNull(),
  minAmount: decimal('min_amount', { precision: 18, scale: 2 }).default('0.00').notNull(),
  maxAmount: decimal('max_amount', { precision: 18, scale: 2 }).default('999999999.00').notNull(),
  approvalLevels: jsonb('approval_levels').$type<Array<{
    level: number;
    role: string;
    description: string;
    canReject: boolean;
  }>>().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workflowInstances = pgTable('workflow_instances', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  documentType: text('document_type').notNull(),
  documentId: text('document_id').notNull(), // voucher or order number
  documentAmount: decimal('document_amount', { precision: 18, scale: 2 }).default('0.00').notNull(),
  currentLevel: integer('current_level').default(1).notNull(),
  status: text('status').default('PENDING').notNull(), // PENDING, APPROVED, REJECTED, CANCELLED
  requestedBy: text('requested_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workflowSteps = pgTable('workflow_steps', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  workflowInstanceId: uuid('workflow_instance_id').references(() => workflowInstances.id, { onDelete: 'cascade' }).notNull(),
  level: integer('level').notNull(),
  approverEmail: text('approver_email').notNull(),
  approverRole: text('approver_role').notNull(),
  action: text('action').notNull(), // SUBMIT, APPROVE, REJECT
  comments: text('comments'),
  actedAt: timestamp('acted_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 7. ENTERPRISE AUDIT TRAIL ENGINE
// -------------------------------------------------------------

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  action: text('action').notNull(), // CREATE, UPDATE, DELETE, APPROVE, POST, REVERSE
  entityType: text('entity_type').notNull(), // ITEM, PARTNER, PO, GRN, JV, USER, etc.
  entityId: text('entity_id').notNull(),
  ipAddress: text('ip_address'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  reason: text('reason'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 8. PROCUREMENT (P2P): PURCHASE ORDERS & DELIVERY STATUS
// -------------------------------------------------------------

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  poNumber: text('po_number').notNull(), // e.g. PO-2026-000101
  supplierId: uuid('supplier_id').references(() => businessPartners.id).notNull(),
  plantId: uuid('plant_id').references(() => plants.id).notNull(),
  orderDate: text('order_date').notNull(), // YYYY-MM-DD
  expectedDeliveryDate: text('expected_delivery_date').notNull(), // YYYY-MM-DD
  paymentTermsDays: integer('payment_terms_days').default(30).notNull(),
  deliveryStatus: text('delivery_status').default('ORDERED').notNull(), // ORDERED, DISPATCHED, IN_TRANSIT, WEIGHBRIDGE_IN, GRN_COMPLETED, DELAYED
  approvalStatus: text('approval_status').default('PENDING_APPROVAL').notNull(), // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED
  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }).default('0.00').notNull(),
  taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).default('0.00').notNull(),
  netAmount: decimal('net_amount', { precision: 18, scale: 2 }).default('0.00').notNull(),
  trackingNumber: text('tracking_number'),
  transporterName: text('transporter_name'),
  vehicleNumber: text('vehicle_number'),
  remarks: text('remarks'),
  currentWorkflowStep: integer('current_workflow_step').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const purchaseOrderLines = pgTable('purchase_order_lines', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  purchaseOrderId: uuid('purchase_order_id').references(() => purchaseOrders.id, { onDelete: 'cascade' }).notNull(),
  itemId: uuid('item_id').references(() => items.id).notNull(),
  lineNumber: integer('line_number').notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  receivedQuantity: decimal('received_quantity', { precision: 18, scale: 3 }).default('0.000').notNull(),
  uom: text('uom').default('MT').notNull(),
  unitRate: decimal('unit_rate', { precision: 18, scale: 2 }).notNull(),
  gstRate: decimal('gst_rate', { precision: 5, scale: 2 }).default('18.00').notNull(),
  lineTotal: decimal('line_total', { precision: 18, scale: 2 }).notNull(),
  remarks: text('remarks'),
});

// -------------------------------------------------------------
// 8. RELATIONS
// -------------------------------------------------------------

export const tenantRelations = relations(tenants, ({ many }) => ({
  companies: many(companies),
  users: many(users),
  roles: many(roles),
  uoms: many(uoms),
  gstMasters: many(gstMasters),
  items: many(items),
  businessPartners: many(businessPartners),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [companies.tenantId],
    references: [tenants.id],
  }),
  divisions: many(divisions),
  financialYears: many(financialYears),
  glAccounts: many(glAccounts),
  costCenters: many(costCenters),
}));

export const divisionsRelations = relations(divisions, ({ one, many }) => ({
  company: one(companies, {
    fields: [divisions.companyId],
    references: [companies.id],
  }),
  plants: many(plants),
}));

export const plantsRelations = relations(plants, ({ one, many }) => ({
  division: one(divisions, {
    fields: [plants.divisionId],
    references: [divisions.id],
  }),
  warehouses: many(warehouses),
}));

export const warehousesRelations = relations(warehouses, ({ one, many }) => ({
  plant: one(plants, {
    fields: [warehouses.plantId],
    references: [plants.id],
  }),
  locations: many(warehouseLocations),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  tenant: one(tenants, {
    fields: [items.tenantId],
    references: [tenants.id],
  }),
  uom: one(uoms, {
    fields: [items.uomId],
    references: [uoms.id],
  }),
  gst: one(gstMasters, {
    fields: [items.hsnSacId],
    references: [gstMasters.id],
  }),
}));

export const businessPartnersRelations = relations(businessPartners, ({ one }) => ({
  tenant: one(tenants, {
    fields: [businessPartners.tenantId],
    references: [tenants.id],
  }),
  glAccount: one(glAccounts, {
    fields: [businessPartners.glAccountId],
    references: [glAccounts.id],
  }),
}));

// -------------------------------------------------------------
// 9. ENTERPRISE DOCUMENT REPOSITORY (DMS)
// -------------------------------------------------------------
export const documents = pgTable('documents', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  documentNumber: text('document_number').notNull(), // e.g. DOC-2026-0001
  title: text('title').notNull(),
  category: text('category').default('PROCUREMENT').notNull(), // PROCUREMENT, INVOICE, WEIGHBRIDGE, QUALITY_MTC, LEGAL, FINANCE
  entityType: text('entity_type'), // e.g. PURCHASE_ORDER, ITEM, SUPPLIER, WEIGHBRIDGE
  entityId: text('entity_id'), // e.g. PO-2026-0001
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(), // e.g. application/pdf, image/jpeg, text/csv
  fileSize: integer('file_size').notNull(), // in bytes
  fileData: text('file_data').notNull(), // base64 data uri or encoded string
  extractedMetadata: jsonb('extracted_metadata'), // Gemini AI extracted metadata (vendor, gstin, total, etc.)
  uploadedBy: text('uploaded_by').notNull(),
  status: text('status').default('VERIFIED').notNull(), // VERIFIED, PENDING_REVIEW, REJECTED
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

