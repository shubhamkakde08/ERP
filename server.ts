import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import firebaseConfig from './firebase-applet-config.json';
import {
  getDefaultTenant,
  getTenants,
  getCompanies,
  getDivisions,
  getPlants,
  createPlant,
  getWarehouses,
  getFinancialYears,
  getItems,
  createItem,
  getBusinessPartners,
  createBusinessPartner,
  getGLAccounts,
  createGLAccount,
  getCostCenters,
  getUOMs,
  getGSTMasters,
  getRoles,
  getUsers,
  syncUser,
  getWorkflowDefinitions,
  getWorkflowInstances,
  createWorkflowInstance,
  actionWorkflowStep,
  getAuditLogs,
  getDashboardData,
  searchGlobal,
  getPurchaseOrders,
  getPurchaseOrderLines,
  createPurchaseOrder,
  updatePODeliveryStatus,
  receivePOGoods,
  getDocuments,
  createDocument,
  deleteDocument,
} from './src/db/services.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Multi-tenant resolution helper
async function resolveTenantId(req: AuthRequest): Promise<string> {
  const headerTenantId = req.headers['x-tenant-id'];
  if (headerTenantId && typeof headerTenantId === 'string') {
    return headerTenantId;
  }
  const defaultTenant = await getDefaultTenant();
  return defaultTenant ? defaultTenant.id : '';
}

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    project: firebaseConfig.projectId,
    timestamp: new Date().toISOString(),
    version: '1.0.0-enterprise',
  });
});

// -------------------------------------------------------------
// ORGANIZATIONAL HIERARCHY
// -------------------------------------------------------------
app.get('/api/v1/tenant/current', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenant = await getDefaultTenant();
    res.json(tenant);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch current tenant' });
  }
});

app.get('/api/v1/tenants', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await getTenants();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch tenants' });
  }
});

app.get('/api/v1/companies', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getCompanies(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch companies' });
  }
});

app.get('/api/v1/divisions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getDivisions(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch divisions' });
  }
});

app.get('/api/v1/plants', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getPlants(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch plants' });
  }
});

app.post('/api/v1/plants', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const operatorEmail = req.user?.email || 'admin@apexsteel.com';
    const newPlant = await createPlant(tenantId, req.body, operatorEmail);
    res.status(201).json(newPlant);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create plant' });
  }
});

app.get('/api/v1/warehouses', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getWarehouses(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch warehouses' });
  }
});

app.get('/api/v1/financial-years', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getFinancialYears(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch financial years' });
  }
});

// -------------------------------------------------------------
// MASTER DATA
// -------------------------------------------------------------
app.get('/api/v1/items', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getItems(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch items' });
  }
});

app.post('/api/v1/items', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const operatorEmail = req.user?.email || 'admin@apexsteel.com';
    const newItem = await createItem(tenantId, req.body, operatorEmail);
    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create item' });
  }
});

app.get('/api/v1/business-partners', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getBusinessPartners(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch business partners' });
  }
});

app.post('/api/v1/business-partners', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const operatorEmail = req.user?.email || 'admin@apexsteel.com';
    const newPartner = await createBusinessPartner(tenantId, req.body, operatorEmail);
    res.status(201).json(newPartner);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create business partner' });
  }
});

app.get('/api/v1/gl-accounts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getGLAccounts(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch GL accounts' });
  }
});

app.post('/api/v1/gl-accounts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const operatorEmail = req.user?.email || 'admin@apexsteel.com';
    const companiesList = await getCompanies(tenantId);
    const companyId = companiesList[0]?.id;
    if (!companyId) throw new Error('No company found for tenant');

    const newAccount = await createGLAccount(tenantId, companyId, req.body, operatorEmail);
    res.status(201).json(newAccount);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create GL account' });
  }
});

app.get('/api/v1/cost-centers', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getCostCenters(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch cost centers' });
  }
});

app.get('/api/v1/uoms', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getUOMs(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch UOMs' });
  }
});

app.get('/api/v1/gst-masters', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getGSTMasters(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch GST masters' });
  }
});

// -------------------------------------------------------------
// ROLES & USERS
// -------------------------------------------------------------
app.get('/api/v1/roles', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getRoles(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch roles' });
  }
});

app.get('/api/v1/users', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getUsers(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

app.post('/api/v1/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const { uid, email, name } = req.body;
    const synced = await syncUser(tenantId, uid, email, name);
    res.json(synced);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// -------------------------------------------------------------
// WORKFLOWS & APPROVAL MATRIX
// -------------------------------------------------------------
app.get('/api/v1/workflows/definitions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getWorkflowDefinitions(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch workflows' });
  }
});

app.get('/api/v1/workflows/instances', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const list = await getWorkflowInstances(tenantId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch workflow instances' });
  }
});

app.post('/api/v1/workflows/instances', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const instance = await createWorkflowInstance(tenantId, {
      ...req.body,
      requestedBy: req.user?.email || 'operator@apexsteel.com',
    });
    res.status(201).json(instance);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit workflow instance' });
  }
});

app.post('/api/v1/workflows/instances/:id/action', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const instanceId = req.params.id;
    const { action, comments, approverRole } = req.body;
    const result = await actionWorkflowStep(
      tenantId,
      instanceId,
      action,
      req.user?.email || 'admin@apexsteel.com',
      approverRole || 'DIRECTOR',
      comments
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process workflow action' });
  }
});

// -------------------------------------------------------------
// AUDIT & DASHBOARD
// -------------------------------------------------------------
app.get('/api/v1/audit/logs', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const logs = await getAuditLogs(tenantId, 100);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
});

app.get('/api/v1/dashboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const data = await getDashboardData(tenantId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard data' });
  }
});

app.get('/api/v1/search', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const q = (req.query.q as string) || '';
    const results = await searchGlobal(tenantId, q);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

// -------------------------------------------------------------
// PROCUREMENT & PURCHASE ORDERS
// -------------------------------------------------------------
app.get('/api/v1/procurement/orders', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const pos = await getPurchaseOrders(tenantId);
    res.json(pos);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch purchase orders' });
  }
});

app.get('/api/v1/procurement/orders/:id/lines', requireAuth, async (req: AuthRequest, res) => {
  try {
    const lines = await getPurchaseOrderLines(req.params.id);
    res.json(lines);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch PO lines' });
  }
});

app.post('/api/v1/procurement/orders', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const newPO = await createPurchaseOrder(
      tenantId,
      req.body,
      req.user?.email || 'procurement@apexsteel.com'
    );
    res.status(201).json(newPO);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create purchase order' });
  }
});

app.patch('/api/v1/procurement/orders/:id/delivery-status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const { deliveryStatus, trackingNumber, transporterName, vehicleNumber } = req.body;
    const updated = await updatePODeliveryStatus(
      tenantId,
      req.params.id,
      deliveryStatus,
      trackingNumber,
      transporterName,
      vehicleNumber,
      req.user?.email || 'logistics@apexsteel.com'
    );
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update delivery status' });
  }
});

app.post('/api/v1/procurement/orders/:id/receive', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const { receipts, gatePassNo, weighbridgeGrossMT } = req.body;
    const updated = await receivePOGoods(
      tenantId,
      req.params.id,
      receipts,
      gatePassNo,
      weighbridgeGrossMT,
      req.user?.email || 'stores@apexsteel.com'
    );
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process goods receipt' });
  }
});

// -------------------------------------------------------------
// DOCUMENT MANAGEMENT SYSTEM (DMS) & PROVISION
// -------------------------------------------------------------
app.get('/api/v1/documents', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const category = req.query.category as string | undefined;
    const entityType = req.query.entityType as string | undefined;
    const entityId = req.query.entityId as string | undefined;
    const list = await getDocuments(tenantId, category, entityType, entityId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch documents' });
  }
});

app.post('/api/v1/documents', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const newDoc = await createDocument(
      tenantId,
      req.body,
      req.user?.email || 'document.controller@apexsteel.com'
    );
    res.status(201).json(newDoc);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upload document' });
  }
});

app.delete('/api/v1/documents/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tenantId = await resolveTenantId(req);
    const result = await deleteDocument(
      tenantId,
      req.params.id,
      req.user?.email || 'admin@apexsteel.com'
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete document' });
  }
});

// -------------------------------------------------------------
// GEMINI ENTERPRISE AI & CHATBOT SERVICES
// -------------------------------------------------------------
app.post('/api/v1/gemini/chat', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { messages, systemInstruction, model } = req.body;
    // Default to gemini-3.5-flash for general tasks, or gemini-3.1-flash-lite for fast tasks
    const targetModel = model || 'gemini-3.5-flash';

    const defaultSystemInstruction =
      systemInstruction ||
      `You are ApexERP AI Copilot, an enterprise ERP and Steel Manufacturing domain assistant.
You assist operations heads, procurement managers, plant in-charges, and CFOs.
You provide precise guidance on purchase orders, supplier delivery statuses, weighbridge operations, material test certificates (MTC Fe 550D/billets), GST 3-way matching, inventory valuations, and Maker/Checker workflow authorizations.
Maintain a professional, concise, enterprise-grade tone. When analyzing numbers, use Indian Rupee (₹ Lakhs / Crores) and Metric Tons (MT).`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: Array.isArray(m.parts)
        ? m.parts
        : [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
    }));

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: formattedContents,
      config: {
        systemInstruction: defaultSystemInstruction,
      },
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Gemini Chatbot Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Gemini response' });
  }
});

app.post('/api/v1/gemini/analyze-document', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { documentTitle, fileType, fileData, instructions } = req.body;
    let base64Content = fileData;
    let mimeType = fileType || 'application/pdf';

    if (fileData && fileData.includes(';base64,')) {
      const parts = fileData.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Content = parts[1];
    }

    const parts: any[] = [];
    if (base64Content && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
      parts.push({
        inlineData: {
          mimeType,
          data: base64Content,
        },
      });
    }

    const promptText = `
You are an expert Document AI Specialist for Enterprise Manufacturing ERP.
Analyze this document titled: "${documentTitle}".
${instructions || 'Extract key structured data fields and provide an executive summary.'}

Return your answer as valid JSON with the following structure:
{
  "summary": "2-sentence executive summary of the document",
  "category": "INVOICE | WEIGHBRIDGE | QUALITY_MTC | PROCUREMENT | LEGAL",
  "extractedFields": {
    "documentNumber": "e.g. INV-1002 or WB-9921",
    "vendorOrPartner": "Entity name",
    "gstin": "GSTIN if applicable",
    "totalAmount": "Total value if applicable",
    "grossWeightMT": "Weight in MT if applicable",
    "tareWeightMT": "Tare in MT if applicable",
    "netWeightMT": "Net in MT if applicable",
    "heatNumber": "Heat number if MTC",
    "materialGrade": "e.g. Fe 550D or Continuous Cast Billets",
    "date": "Document date"
  },
  "complianceCheck": "VERIFIED or FLAGGED_DISCREPANCY with reason",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
`;
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Document Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze document' });
  }
});



// -------------------------------------------------------------
// VITE DEV SERVER / STATIC ASSETS INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApexERP Enterprise Server running on port ${PORT}`);
  });
}

startServer();
