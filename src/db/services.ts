import { db } from './index.ts';
import {
  tenants,
  companies,
  divisions,
  plants,
  warehouses,
  warehouseLocations,
  financialYears,
  roles,
  users,
  uoms,
  gstMasters,
  glAccounts,
  costCenters,
  businessPartners,
  items,
  workflowDefinitions,
  workflowInstances,
  workflowSteps,
  auditLogs,
  purchaseOrders,
  purchaseOrderLines,
  documents,
} from './schema.ts';
import { desc, eq, ilike, or } from 'drizzle-orm';

// -------------------------------------------------------------
// AUDIT LOG HELPER
// -------------------------------------------------------------
export async function recordAudit(
  tenantId: string,
  userEmail: string,
  userName: string,
  action: string,
  entityType: string,
  entityId: string,
  reason?: string,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string
) {
  try {
    await db.insert(auditLogs).values({
      tenantId,
      userEmail,
      userName,
      action,
      entityType,
      entityId,
      reason,
      oldValues: oldValues || null,
      newValues: newValues || null,
      ipAddress: ipAddress || '127.0.0.1',
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

// -------------------------------------------------------------
// 1. TENANT & ORG SERVICES
// -------------------------------------------------------------
export async function getTenants() {
  try {
    return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw new Error('Failed to fetch tenants.', { cause: error });
  }
}

export async function getDefaultTenant() {
  try {
    const all = await db.select().from(tenants).limit(1);
    return all[0] || null;
  } catch (error) {
    console.error('Error fetching default tenant:', error);
    throw new Error('Failed to fetch default tenant.', { cause: error });
  }
}

export async function getCompanies(tenantId: string) {
  try {
    return await db
      .select()
      .from(companies)
      .where(eq(companies.tenantId, tenantId))
      .orderBy(companies.code);
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies.', { cause: error });
  }
}

export async function getDivisions(tenantId: string) {
  try {
    return await db
      .select()
      .from(divisions)
      .where(eq(divisions.tenantId, tenantId))
      .orderBy(divisions.code);
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw new Error('Failed to fetch divisions.', { cause: error });
  }
}

export async function getPlants(tenantId: string) {
  try {
    return await db
      .select()
      .from(plants)
      .where(eq(plants.tenantId, tenantId))
      .orderBy(plants.code);
  } catch (error) {
    console.error('Error fetching plants:', error);
    throw new Error('Failed to fetch plants.', { cause: error });
  }
}

export async function createPlant(
  tenantId: string,
  data: {
    divisionId: string;
    code: string;
    name: string;
    plantType: string;
    address: string;
    stateCode: string;
    gstin?: string;
  },
  operatorEmail: string
) {
  try {
    const inserted = await db
      .insert(plants)
      .values({
        tenantId,
        divisionId: data.divisionId,
        code: data.code,
        name: data.name,
        plantType: data.plantType,
        address: data.address,
        stateCode: data.stateCode,
        gstin: data.gstin || null,
      })
      .returning();

    await recordAudit(
      tenantId,
      operatorEmail,
      'ERP Admin',
      'CREATE',
      'PLANT',
      data.code,
      'Added new manufacturing / processing plant',
      null,
      inserted[0]
    );

    return inserted[0];
  } catch (error) {
    console.error('Error creating plant:', error);
    throw new Error('Failed to create plant.', { cause: error });
  }
}

export async function getWarehouses(tenantId: string) {
  try {
    return await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.tenantId, tenantId))
      .orderBy(warehouses.code);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw new Error('Failed to fetch warehouses.', { cause: error });
  }
}

export async function getFinancialYears(tenantId: string) {
  try {
    return await db
      .select()
      .from(financialYears)
      .where(eq(financialYears.tenantId, tenantId))
      .orderBy(desc(financialYears.startDate));
  } catch (error) {
    console.error('Error fetching financial years:', error);
    throw new Error('Failed to fetch financial years.', { cause: error });
  }
}

// -------------------------------------------------------------
// 2. MASTER DATA SERVICES (ITEMS, PARTNERS, GL, UOM, GST)
// -------------------------------------------------------------
export async function getItems(tenantId: string) {
  try {
    return await db
      .select()
      .from(items)
      .where(eq(items.tenantId, tenantId))
      .orderBy(items.code);
  } catch (error) {
    console.error('Error fetching items:', error);
    throw new Error('Failed to fetch items.', { cause: error });
  }
}

export async function createItem(
  tenantId: string,
  data: {
    code: string;
    name: string;
    itemGroup: string;
    itemCategory: string;
    uomId: string;
    hsnSacId?: string;
    valuationMethod: string;
    standardCost: string;
    sellingPrice: string;
    minStockLevel?: string;
    maxStockLevel?: string;
    reorderPoint?: string;
    isQualityCheckRequired: boolean;
    isBatchManaged: boolean;
  },
  operatorEmail: string
) {
  try {
    const inserted = await db
      .insert(items)
      .values({
        tenantId,
        code: data.code,
        name: data.name,
        itemGroup: data.itemGroup,
        itemCategory: data.itemCategory,
        uomId: data.uomId,
        hsnSacId: data.hsnSacId || null,
        valuationMethod: data.valuationMethod,
        standardCost: data.standardCost,
        sellingPrice: data.sellingPrice,
        minStockLevel: data.minStockLevel || '0.000',
        maxStockLevel: data.maxStockLevel || '10000.000',
        reorderPoint: data.reorderPoint || '50.000',
        isQualityCheckRequired: data.isQualityCheckRequired,
        isBatchManaged: data.isBatchManaged,
        isActive: true,
      })
      .returning();

    await recordAudit(
      tenantId,
      operatorEmail,
      'Materials Controller',
      'CREATE',
      'ITEM',
      data.code,
      'Created new ERP item master definition',
      null,
      inserted[0]
    );

    return inserted[0];
  } catch (error) {
    console.error('Error creating item:', error);
    throw new Error('Failed to create item.', { cause: error });
  }
}

export async function getBusinessPartners(tenantId: string) {
  try {
    return await db
      .select()
      .from(businessPartners)
      .where(eq(businessPartners.tenantId, tenantId))
      .orderBy(businessPartners.code);
  } catch (error) {
    console.error('Error fetching business partners:', error);
    throw new Error('Failed to fetch business partners.', { cause: error });
  }
}

export async function createBusinessPartner(
  tenantId: string,
  data: {
    code: string;
    name: string;
    partnerType: string;
    gstin: string;
    pan: string;
    email?: string;
    phone?: string;
    creditLimit?: string;
    paymentTermsDays: number;
    address: string;
    city: string;
    state: string;
    stateCode: string;
    pincode: string;
    glAccountId?: string;
  },
  operatorEmail: string
) {
  try {
    const inserted = await db
      .insert(businessPartners)
      .values({
        tenantId,
        code: data.code,
        name: data.name,
        partnerType: data.partnerType,
        gstin: data.gstin,
        pan: data.pan,
        email: data.email || null,
        phone: data.phone || null,
        creditLimit: data.creditLimit || '1000000.00',
        paymentTermsDays: data.paymentTermsDays || 30,
        address: data.address,
        city: data.city,
        state: data.state,
        stateCode: data.stateCode || '22',
        pincode: data.pincode,
        glAccountId: data.glAccountId || null,
        isActive: true,
      })
      .returning();

    await recordAudit(
      tenantId,
      operatorEmail,
      'Commercial Head',
      'CREATE',
      'PARTNER',
      data.code,
      `Registered ${data.partnerType} partner: ${data.name}`,
      null,
      inserted[0]
    );

    return inserted[0];
  } catch (error) {
    console.error('Error creating business partner:', error);
    throw new Error('Failed to create business partner.', { cause: error });
  }
}

export async function getGLAccounts(tenantId: string) {
  try {
    return await db
      .select()
      .from(glAccounts)
      .where(eq(glAccounts.tenantId, tenantId))
      .orderBy(glAccounts.accountCode);
  } catch (error) {
    console.error('Error fetching GL accounts:', error);
    throw new Error('Failed to fetch GL accounts.', { cause: error });
  }
}

export async function createGLAccount(
  tenantId: string,
  companyId: string,
  data: {
    accountCode: string;
    accountName: string;
    scheduleType: string;
    accountClass: string;
    subAccountType: string;
    normalBalance: string;
    isControlAccount: boolean;
  },
  operatorEmail: string
) {
  try {
    const inserted = await db
      .insert(glAccounts)
      .values({
        tenantId,
        companyId,
        accountCode: data.accountCode,
        accountName: data.accountName,
        scheduleType: data.scheduleType,
        accountClass: data.accountClass,
        subAccountType: data.subAccountType,
        normalBalance: data.normalBalance,
        isControlAccount: data.isControlAccount,
        isActive: true,
      })
      .returning();

    await recordAudit(
      tenantId,
      operatorEmail,
      'Finance Head',
      'CREATE',
      'GL_ACCOUNT',
      data.accountCode,
      `Created GL Account ${data.accountCode} - ${data.accountName}`,
      null,
      inserted[0]
    );

    return inserted[0];
  } catch (error) {
    console.error('Error creating GL account:', error);
    throw new Error('Failed to create GL account.', { cause: error });
  }
}

export async function getCostCenters(tenantId: string) {
  try {
    return await db
      .select()
      .from(costCenters)
      .where(eq(costCenters.tenantId, tenantId))
      .orderBy(costCenters.code);
  } catch (error) {
    console.error('Error fetching cost centers:', error);
    throw new Error('Failed to fetch cost centers.', { cause: error });
  }
}

export async function getUOMs(tenantId: string) {
  try {
    return await db
      .select()
      .from(uoms)
      .where(eq(uoms.tenantId, tenantId))
      .orderBy(uoms.code);
  } catch (error) {
    console.error('Error fetching UOMs:', error);
    throw new Error('Failed to fetch UOMs.', { cause: error });
  }
}

export async function getGSTMasters(tenantId: string) {
  try {
    return await db
      .select()
      .from(gstMasters)
      .where(eq(gstMasters.tenantId, tenantId))
      .orderBy(gstMasters.hsnSacCode);
  } catch (error) {
    console.error('Error fetching GST Masters:', error);
    throw new Error('Failed to fetch GST Masters.', { cause: error });
  }
}

// -------------------------------------------------------------
// 3. SECURITY, USERS & ROLES
// -------------------------------------------------------------
export async function getRoles(tenantId: string) {
  try {
    return await db
      .select()
      .from(roles)
      .where(eq(roles.tenantId, tenantId))
      .orderBy(roles.code);
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw new Error('Failed to fetch roles.', { cause: error });
  }
}

export async function getUsers(tenantId: string) {
  try {
    return await db
      .select()
      .from(users)
      .where(eq(users.tenantId, tenantId))
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users.', { cause: error });
  }
}

export async function syncUser(tenantId: string, uid: string, email: string, name?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }
    // Auto-assign first available role
    const allRoles = await db.select().from(roles).where(eq(roles.tenantId, tenantId)).limit(1);
    const roleId = allRoles.length > 0 ? allRoles[0].id : null;

    const inserted = await db
      .insert(users)
      .values({
        tenantId,
        uid,
        email,
        fullName: name || email.split('@')[0],
        roleId,
        department: 'Operations',
        isActive: true,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Error synchronizing user:', error);
    throw new Error('Failed to synchronize user.', { cause: error });
  }
}

// -------------------------------------------------------------
// 4. WORKFLOW ENGINE
// -------------------------------------------------------------
export async function getWorkflowDefinitions(tenantId: string) {
  try {
    return await db
      .select()
      .from(workflowDefinitions)
      .where(eq(workflowDefinitions.tenantId, tenantId));
  } catch (error) {
    console.error('Error fetching workflow definitions:', error);
    throw new Error('Failed to fetch workflow definitions.', { cause: error });
  }
}

export async function getWorkflowInstances(tenantId: string) {
  try {
    return await db
      .select()
      .from(workflowInstances)
      .where(eq(workflowInstances.tenantId, tenantId))
      .orderBy(desc(workflowInstances.createdAt));
  } catch (error) {
    console.error('Error fetching workflow instances:', error);
    throw new Error('Failed to fetch workflow instances.', { cause: error });
  }
}

export async function createWorkflowInstance(
  tenantId: string,
  data: {
    documentType: string;
    documentId: string;
    documentAmount: string;
    requestedBy: string;
  }
) {
  try {
    const inserted = await db
      .insert(workflowInstances)
      .values({
        tenantId,
        documentType: data.documentType,
        documentId: data.documentId,
        documentAmount: data.documentAmount,
        currentLevel: 1,
        status: 'PENDING',
        requestedBy: data.requestedBy,
      })
      .returning();

    await db.insert(workflowSteps).values({
      workflowInstanceId: inserted[0].id,
      level: 1,
      approverEmail: data.requestedBy,
      approverRole: 'INITIATOR',
      action: 'SUBMIT',
      comments: `Submitted ${data.documentType} ${data.documentId} (Amount: ₹${data.documentAmount}) for approval.`,
    });

    await recordAudit(
      tenantId,
      data.requestedBy,
      'ERP Workflow Engine',
      'SUBMIT',
      'WORKFLOW',
      data.documentId,
      `Submitted ${data.documentType} for tiered approval`,
      null,
      inserted[0]
    );

    return inserted[0];
  } catch (error) {
    console.error('Error creating workflow instance:', error);
    throw new Error('Failed to create workflow instance.', { cause: error });
  }
}

export async function actionWorkflowStep(
  tenantId: string,
  instanceId: string,
  action: 'APPROVE' | 'REJECT',
  approverEmail: string,
  approverRole: string,
  comments: string
) {
  try {
    const instance = await db
      .select()
      .from(workflowInstances)
      .where(eq(workflowInstances.id, instanceId));

    if (!instance || instance.length === 0) {
      throw new Error('Workflow instance not found');
    }

    const current = instance[0];
    const newStatus = action === 'REJECT' ? 'REJECTED' : current.currentLevel >= 2 ? 'APPROVED' : 'PENDING';
    const nextLevel = action === 'APPROVE' ? current.currentLevel + 1 : current.currentLevel;

    await db
      .update(workflowInstances)
      .set({
        status: newStatus,
        currentLevel: nextLevel,
        updatedAt: new Date(),
      })
      .where(eq(workflowInstances.id, instanceId));

    await db.insert(workflowSteps).values({
      workflowInstanceId: instanceId,
      level: current.currentLevel,
      approverEmail,
      approverRole,
      action,
      comments: comments || `${action} by ${approverRole}`,
    });

    await recordAudit(
      tenantId,
      approverEmail,
      approverRole,
      action,
      'WORKFLOW',
      current.documentId,
      `${action} level ${current.currentLevel} for ${current.documentType} ${current.documentId}`,
      { previousStatus: current.status },
      { newStatus, level: current.currentLevel }
    );

    return { success: true, status: newStatus, level: nextLevel };
  } catch (error) {
    console.error('Error actioning workflow step:', error);
    throw new Error('Failed to action workflow step.', { cause: error });
  }
}

// -------------------------------------------------------------
// 5. AUDIT TRAIL LOGS
// -------------------------------------------------------------
export async function getAuditLogs(tenantId: string, limitCount = 50) {
  try {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.tenantId, tenantId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limitCount);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error('Failed to fetch audit logs.', { cause: error });
  }
}

// -------------------------------------------------------------
// 7. PROCUREMENT & PURCHASE ORDERS SERVICES
// -------------------------------------------------------------
export async function getPurchaseOrders(tenantId: string) {
  try {
    const pos = await db
      .select({
        id: purchaseOrders.id,
        tenantId: purchaseOrders.tenantId,
        poNumber: purchaseOrders.poNumber,
        supplierId: purchaseOrders.supplierId,
        supplierName: businessPartners.name,
        supplierGstin: businessPartners.gstin,
        plantId: purchaseOrders.plantId,
        plantName: plants.name,
        orderDate: purchaseOrders.orderDate,
        expectedDeliveryDate: purchaseOrders.expectedDeliveryDate,
        paymentTermsDays: purchaseOrders.paymentTermsDays,
        deliveryStatus: purchaseOrders.deliveryStatus,
        approvalStatus: purchaseOrders.approvalStatus,
        totalAmount: purchaseOrders.totalAmount,
        taxAmount: purchaseOrders.taxAmount,
        netAmount: purchaseOrders.netAmount,
        trackingNumber: purchaseOrders.trackingNumber,
        transporterName: purchaseOrders.transporterName,
        vehicleNumber: purchaseOrders.vehicleNumber,
        remarks: purchaseOrders.remarks,
        currentWorkflowStep: purchaseOrders.currentWorkflowStep,
        createdAt: purchaseOrders.createdAt,
      })
      .from(purchaseOrders)
      .leftJoin(businessPartners, eq(purchaseOrders.supplierId, businessPartners.id))
      .leftJoin(plants, eq(purchaseOrders.plantId, plants.id))
      .where(eq(purchaseOrders.tenantId, tenantId))
      .orderBy(desc(purchaseOrders.createdAt));

    return pos;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw new Error('Failed to fetch purchase orders.', { cause: error });
  }
}

export async function getPurchaseOrderLines(poId: string) {
  try {
    return await db
      .select({
        id: purchaseOrderLines.id,
        purchaseOrderId: purchaseOrderLines.purchaseOrderId,
        itemId: purchaseOrderLines.itemId,
        itemCode: items.code,
        itemName: items.name,
        lineNumber: purchaseOrderLines.lineNumber,
        quantity: purchaseOrderLines.quantity,
        receivedQuantity: purchaseOrderLines.receivedQuantity,
        uom: purchaseOrderLines.uom,
        unitRate: purchaseOrderLines.unitRate,
        gstRate: purchaseOrderLines.gstRate,
        lineTotal: purchaseOrderLines.lineTotal,
        remarks: purchaseOrderLines.remarks,
      })
      .from(purchaseOrderLines)
      .leftJoin(items, eq(purchaseOrderLines.itemId, items.id))
      .where(eq(purchaseOrderLines.purchaseOrderId, poId))
      .orderBy(purchaseOrderLines.lineNumber);
  } catch (error) {
    console.error('Error fetching PO lines:', error);
    throw new Error('Failed to fetch PO lines.', { cause: error });
  }
}

export async function createPurchaseOrder(
  tenantId: string,
  data: {
    poNumber: string;
    supplierId: string;
    plantId: string;
    orderDate: string;
    expectedDeliveryDate: string;
    paymentTermsDays?: number;
    transporterName?: string;
    vehicleNumber?: string;
    trackingNumber?: string;
    remarks?: string;
    lines: Array<{
      itemId: string;
      quantity: string;
      uom: string;
      unitRate: string;
      gstRate: string;
    }>;
  },
  operatorEmail: string
) {
  try {
    let subtotal = 0;
    let totalTax = 0;

    data.lines.forEach((l) => {
      const q = parseFloat(l.quantity) || 0;
      const r = parseFloat(l.unitRate) || 0;
      const gst = parseFloat(l.gstRate) || 18;
      const lineAmt = q * r;
      const lineTax = (lineAmt * gst) / 100;
      subtotal += lineAmt;
      totalTax += lineTax;
    });

    const netAmount = subtotal + totalTax;

    const insertedPO = await db
      .insert(purchaseOrders)
      .values({
        tenantId,
        poNumber: data.poNumber,
        supplierId: data.supplierId,
        plantId: data.plantId,
        orderDate: data.orderDate,
        expectedDeliveryDate: data.expectedDeliveryDate,
        paymentTermsDays: data.paymentTermsDays || 30,
        deliveryStatus: 'ORDERED',
        approvalStatus: 'PENDING_APPROVAL',
        totalAmount: subtotal.toFixed(2),
        taxAmount: totalTax.toFixed(2),
        netAmount: netAmount.toFixed(2),
        trackingNumber: data.trackingNumber || null,
        transporterName: data.transporterName || null,
        vehicleNumber: data.vehicleNumber || null,
        remarks: data.remarks || null,
        currentWorkflowStep: 1,
      })
      .returning();

    const poId = insertedPO[0].id;

    for (let i = 0; i < data.lines.length; i++) {
      const line = data.lines[i];
      const q = parseFloat(line.quantity) || 0;
      const r = parseFloat(line.unitRate) || 0;
      const lineTotal = (q * r).toFixed(2);

      await db.insert(purchaseOrderLines).values({
        tenantId,
        purchaseOrderId: poId,
        itemId: line.itemId,
        lineNumber: i + 1,
        quantity: line.quantity,
        receivedQuantity: '0.000',
        uom: line.uom || 'MT',
        unitRate: line.unitRate,
        gstRate: line.gstRate || '18.00',
        lineTotal,
      });
    }

    // Also register workflow instance so maker/checker can approve it
    await db.insert(workflowInstances).values({
      tenantId,
      documentType: 'PO',
      documentId: data.poNumber,
      documentAmount: netAmount.toFixed(2),
      currentLevel: 1,
      status: 'PENDING',
      requestedBy: operatorEmail,
    });

    await recordAudit(
      tenantId,
      operatorEmail,
      'Procurement Manager',
      'CREATE',
      'PURCHASE_ORDER',
      data.poNumber,
      `Issued PO ${data.poNumber} for ₹${netAmount.toFixed(2)} with ${data.lines.length} items`,
      null,
      insertedPO[0]
    );

    return insertedPO[0];
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw new Error('Failed to create purchase order.', { cause: error });
  }
}

export async function updatePODeliveryStatus(
  tenantId: string,
  poId: string,
  deliveryStatus: string,
  trackingNumber?: string,
  transporterName?: string,
  vehicleNumber?: string,
  operatorEmail?: string
) {
  try {
    const updated = await db
      .update(purchaseOrders)
      .set({
        deliveryStatus,
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        ...(transporterName !== undefined ? { transporterName } : {}),
        ...(vehicleNumber !== undefined ? { vehicleNumber } : {}),
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, poId))
      .returning();

    if (updated.length > 0) {
      await recordAudit(
        tenantId,
        operatorEmail || 'logistics@apexsteel.com',
        'Logistics & Stores Incharge',
        'UPDATE',
        'PURCHASE_ORDER',
        updated[0].poNumber,
        `Updated delivery status to ${deliveryStatus}`,
        null,
        { deliveryStatus, vehicleNumber }
      );
    }

    return updated[0];
  } catch (error) {
    console.error('Error updating PO delivery status:', error);
    throw new Error('Failed to update PO delivery status.', { cause: error });
  }
}

export async function receivePOGoods(
  tenantId: string,
  poId: string,
  receipts: Array<{ lineId: string; receivedQuantity: string }>,
  gatePassNo?: string,
  weighbridgeGrossMT?: string,
  operatorEmail?: string
) {
  try {
    for (const r of receipts) {
      await db
        .update(purchaseOrderLines)
        .set({
          receivedQuantity: r.receivedQuantity,
        })
        .where(eq(purchaseOrderLines.id, r.lineId));
    }

    // Check if fully received or partially received
    const lines = await db
      .select()
      .from(purchaseOrderLines)
      .where(eq(purchaseOrderLines.purchaseOrderId, poId));

    let fullyReceived = true;
    let anyReceived = false;

    lines.forEach((l) => {
      const q = parseFloat(l.quantity) || 0;
      const rec = parseFloat(l.receivedQuantity) || 0;
      if (rec > 0) anyReceived = true;
      if (rec < q) fullyReceived = false;
    });

    const newDeliveryStatus = fullyReceived
      ? 'DELIVERED'
      : anyReceived
      ? 'PARTIALLY_DELIVERED'
      : 'IN_TRANSIT';

    const updatedPO = await db
      .update(purchaseOrders)
      .set({
        deliveryStatus: newDeliveryStatus,
        currentWorkflowStep: fullyReceived ? 5 : 4,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, poId))
      .returning();

    await recordAudit(
      tenantId,
      operatorEmail || 'stores@apexsteel.com',
      'QC & Stores Incharge',
      'GOODS_RECEIPT',
      'PURCHASE_ORDER',
      updatedPO[0]?.poNumber || poId,
      `GRN goods received for ${updatedPO[0]?.poNumber}. Gate Pass: ${gatePassNo || 'GP-AUTO'}, Gross MT: ${weighbridgeGrossMT || 'N/A'}. Status: ${newDeliveryStatus}`,
      null,
      { newDeliveryStatus, receipts }
    );

    return updatedPO[0];
  } catch (error) {
    console.error('Error receiving PO goods:', error);
    throw new Error('Failed to record goods receipt.', { cause: error });
  }
}

export async function getDashboardData(tenantId: string) {
  try {
    const allItems = await db.select().from(items).where(eq(items.tenantId, tenantId));
    const allPartners = await db.select().from(businessPartners).where(eq(businessPartners.tenantId, tenantId));
    const allPlants = await db.select().from(plants).where(eq(plants.tenantId, tenantId));
    const allWorkflows = await db.select().from(workflowInstances).where(eq(workflowInstances.tenantId, tenantId));
    const recentAudits = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.tenantId, tenantId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(10);

    const pendingApprovals = allWorkflows.filter((w) => w.status === 'PENDING').length;
    const customersCount = allPartners.filter((p) => p.partnerType === 'CUSTOMER').length;
    const suppliersCount = allPartners.filter((p) => p.partnerType === 'SUPPLIER').length;

    return {
      metrics: {
        totalItems: allItems.length,
        totalPlants: allPlants.length,
        customersCount,
        suppliersCount,
        pendingApprovals,
        inventoryValuation: '₹ 14.85 Cr',
        receivablesOutstanding: '₹ 4.12 Cr',
        payablesOutstanding: '₹ 2.84 Cr',
        dailyDespatchMT: '1,420 MT',
        activeVehiclesInYard: 18,
        awaitingWeighment: 4,
      },
      recentAudits,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Failed to fetch dashboard data.', { cause: error });
  }
}

export async function searchGlobal(tenantId: string, term: string) {
  try {
    if (!term || term.trim() === '') return { items: [], partners: [], plants: [] };

    const searchStr = `%${term.trim()}%`;
    const matchedItems = await db
      .select()
      .from(items)
      .where(or(ilike(items.code, searchStr), ilike(items.name, searchStr)))
      .limit(5);

    const matchedPartners = await db
      .select()
      .from(businessPartners)
      .where(or(ilike(businessPartners.code, searchStr), ilike(businessPartners.name, searchStr)))
      .limit(5);

    const matchedPlants = await db
      .select()
      .from(plants)
      .where(or(ilike(plants.code, searchStr), ilike(plants.name, searchStr)))
      .limit(5);

    return {
      items: matchedItems,
      partners: matchedPartners,
      plants: matchedPlants,
    };
  } catch (error) {
    console.error('Error in global search:', error);
    throw new Error('Failed to perform global search.', { cause: error });
  }
}

// -------------------------------------------------------------
// 8. ENTERPRISE DOCUMENT REPOSITORY (DMS)
// -------------------------------------------------------------
export async function getDocuments(tenantId: string, category?: string, entityType?: string, entityId?: string) {
  try {
    let query = db
      .select()
      .from(documents)
      .where(eq(documents.tenantId, tenantId))
      .orderBy(desc(documents.createdAt));

    const list = await query;

    return list.filter((doc) => {
      if (category && category !== 'ALL' && doc.category !== category) return false;
      if (entityType && doc.entityType !== entityType) return false;
      if (entityId && doc.entityId !== entityId) return false;
      return true;
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw new Error('Failed to fetch documents.', { cause: error });
  }
}

export async function createDocument(
  tenantId: string,
  data: {
    documentNumber?: string;
    title: string;
    category: string;
    entityType?: string;
    entityId?: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string;
    extractedMetadata?: any;
    remarks?: string;
  },
  operatorEmail: string
) {
  try {
    const docNum =
      data.documentNumber ||
      `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const inserted = await db
      .insert(documents)
      .values({
        tenantId,
        documentNumber: docNum,
        title: data.title,
        category: data.category || 'PROCUREMENT',
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        fileData: data.fileData,
        extractedMetadata: data.extractedMetadata || null,
        uploadedBy: operatorEmail,
        status: 'VERIFIED',
        remarks: data.remarks || null,
      })
      .returning();

    await recordAudit(
      tenantId,
      operatorEmail,
      'Document Controller',
      'CREATE',
      'DOCUMENT',
      docNum,
      `Uploaded ${data.category} document: "${data.title}" (${data.fileName}, ${(data.fileSize / 1024).toFixed(1)} KB)`,
      null,
      { documentNumber: docNum, category: data.category, entityId: data.entityId }
    );

    return inserted[0];
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document.', { cause: error });
  }
}

export async function deleteDocument(tenantId: string, id: string, operatorEmail: string) {
  try {
    const existing = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));

    if (existing.length === 0) {
      throw new Error('Document not found');
    }

    await db.delete(documents).where(eq(documents.id, id));

    await recordAudit(
      tenantId,
      operatorEmail,
      'Document Controller',
      'DELETE',
      'DOCUMENT',
      existing[0].documentNumber,
      `Archived/Deleted document ${existing[0].documentNumber} (${existing[0].title})`,
      existing[0],
      null
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document.', { cause: error });
  }
}

