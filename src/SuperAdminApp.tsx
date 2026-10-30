import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Users, 
  Coins, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Settings, 
  RefreshCw, 
  Search, 
  Sliders, 
  Mail, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  HardDrive, 
  Activity, 
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  Unlock,
  Building,
  Terminal,
  Send,
  UserCheck,
  Check,
  Zap,
  Globe,
  Key,
  Code,
  Layers,
  Database,
  Cpu,
  CheckCircle2,
  Trash2,
  BookOpen,
  ArrowUpRight,
  ExternalLink,
  SlidersHorizontal,
  Workflow,
  Eye,
  Settings2,
  LockKeyhole
} from 'lucide-react';

// --- DATA TYPES & INTERFACES ---

interface MerchantOnboardingRequest {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  country: string;
  requestedPlan: 'bronze_starter' | 'silver_growth' | 'gold_professional' | 'enterprise_slate';
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  automatedCheck: 'passed' | 'warning' | 'failed';
  warehouseCapacity: number;
}

interface PlatformEnquiry {
  id: string;
  senderName: string;
  email: string;
  subject: string;
  message: string;
  category: 'onboarding' | 'billing' | 'technical' | 'custom_integration';
  receivedDate: string;
  status: 'open' | 'replied' | 'ignored';
  replies: string[];
}

interface GlobalFeatureLock {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'locked';
  restrictedTo: 'all' | 'enterprise_only' | 'admin_only';
}

interface OAuthClient {
  id: string;
  clientName: string;
  clientId: string;
  clientSecret: string;
  allowedScopes: string[];
  status: 'active' | 'revoked';
  issuedAt: string;
}

interface BackendRouteExample {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  rawCode: string;
  mockParams: Record<string, string>;
  mockResponse: Record<string, any>;
}

interface SuperAdminAppProps {
  isEmbedded?: boolean;
}

export default function SuperAdminApp({ isEmbedded = false }: SuperAdminAppProps) {
  // --- STATE 1: ONBOARDING REQUESTS ---
  const [onboardRequests, setOnboardRequests] = useState<MerchantOnboardingRequest[]>(() => {
    const defaults: MerchantOnboardingRequest[] = [
      {
        id: 'req_1',
        storeName: 'Slamtech Retail UK Ltd',
        ownerName: 'Pankaj Slamtech',
        email: 'pankaj@slamtech.co.uk',
        country: 'United Kingdom',
        requestedPlan: 'enterprise_slate',
        appliedDate: '2026-07-15',
        status: 'pending',
        automatedCheck: 'passed',
        warehouseCapacity: 12500
      },
      {
        id: 'req_2',
        storeName: 'FashionForward Boutique',
        ownerName: 'Sarah Jenkins',
        email: 'billing@fashionforward.io',
        country: 'France',
        requestedPlan: 'silver_growth',
        appliedDate: '2026-07-16',
        status: 'pending',
        automatedCheck: 'passed',
        warehouseCapacity: 2500
      },
      {
        id: 'req_3',
        storeName: 'Apex Electronics Distributor',
        ownerName: 'David Mercer',
        email: 'wholesale@apexelectronics.com',
        country: 'United States',
        requestedPlan: 'gold_professional',
        appliedDate: '2026-07-14',
        status: 'approved',
        automatedCheck: 'passed',
        warehouseCapacity: 7500
      },
      {
        id: 'req_4',
        storeName: 'Vintage Vinyl & Co',
        ownerName: 'Marcus Grooves',
        email: 'marcus@vintagevinyl.store',
        country: 'Netherlands',
        requestedPlan: 'bronze_starter',
        appliedDate: '2026-07-12',
        status: 'rejected',
        automatedCheck: 'warning',
        warehouseCapacity: 500
      }
    ];
    try {
      const saved = localStorage.getItem('super_admin_onboarding');
      return saved ? JSON.parse(saved) : defaults;
    } catch {
      return defaults;
    }
  });

  // --- STATE 2: PLATFORM ENQUIRIES & TICKETS ---
  const [enquiries, setEnquiries] = useState<PlatformEnquiry[]>(() => {
    const defaults: PlatformEnquiry[] = [
      {
        id: 'enq_1',
        senderName: 'Sagar Patel (Sage developer)',
        email: 'sagar@sage-integrators.net',
        subject: 'Custom double-entry ledger endpoint scope mismatch',
        message: 'Hello, we are attempting to establish a real-time ledger link using the new granular checklist API. Whenever we submit sales invoices, we receive a 403 Forbidden payload. We have checked the "accounts:write" checkbox in our developer portal. Can the superadmin manually bypass this authorization threshold or audit our handshake log?',
        category: 'custom_integration',
        receivedDate: '2026-07-16',
        status: 'open',
        replies: []
      },
      {
        id: 'enq_2',
        senderName: 'Michelle Dupont',
        email: 'info@dupont-logistique.fr',
        subject: 'Sellershub Onboarding - API Access Speed & Evri presets',
        message: 'We are evaluating your enterprise plan for on-boarding 12 warehouse sub-locations in France. Do you support high frequency label generation triggers (120+ prints/min)? Does the system include automatic routing rules for French postal networks?',
        category: 'onboarding',
        receivedDate: '2026-07-15',
        status: 'open',
        replies: []
      },
      {
        id: 'enq_3',
        senderName: 'Gregory Finch',
        email: 'gregory@finch-holdings.co',
        subject: 'Enterprise subscription query - Custom pricing matrix',
        message: 'Hello, Finch Holdings operates 4 individual subsidiaries with unique VAT brackets. Can you customize the "Enterprise Slate" plan settings to support 25,000 orders/mo instead of the standard 10,000 threshold, and what would the customized recurring charge be?',
        category: 'billing',
        receivedDate: '2026-07-14',
        status: 'replied',
        replies: ['Thank you Gregory. Superadmin has customized your database tier capabilities to accommodate 25K orders with custom invoice ledger templates.']
      }
    ];
    try {
      const saved = localStorage.getItem('super_admin_enquiries');
      return saved ? JSON.parse(saved) : defaults;
    } catch {
      return defaults;
    }
  });

  // --- STATE 3: GLOBAL SYSTEM FEATURE CONTROLS ---
  const [globalLocks, setGlobalLocks] = useState<GlobalFeatureLock[]>(() => {
    const defaults: GlobalFeatureLock[] = [
      { id: 'f_1', name: 'Third-Party Developer Keys Hub', description: 'Allows merchants to create granular checklist keys for Sage, Xero, QuickBooks etc.', status: 'active', restrictedTo: 'all' },
      { id: 'f_2', name: 'High-Volume Evri Bulk Label Generation', description: 'Simultaneous API dispatcher for printing 100+ shipping labels.', status: 'active', restrictedTo: 'enterprise_only' },
      { id: 'f_3', name: 'AI Customer Response Predictor (CRM)', description: 'Generates automated ticket responses based on order delivery anomalies.', status: 'active', restrictedTo: 'all' },
      { id: 'f_4', name: 'WMS Warehouse Bin Mapping Matrix', description: 'Advanced coordinates engine for visual barcode sorting routes.', status: 'active', restrictedTo: 'all' },
      { id: 'f_5', name: 'Platform Debug Terminal & Logs', description: 'Verbose terminal output showcasing raw JSON webhook parameters.', status: 'active', restrictedTo: 'admin_only' }
    ];
    try {
      const saved = localStorage.getItem('super_admin_locks');
      return saved ? JSON.parse(saved) : defaults;
    } catch {
      return defaults;
    }
  });

  // --- STATE 4: OAUTH CREDENTIALS & APPS ---
  const [oauthClients, setOauthClients] = useState<OAuthClient[]>(() => {
    const defaults: OAuthClient[] = [
      {
        id: 'client_sage',
        clientName: 'Sage double-entry ledger tool',
        clientId: 'cli_3840192837492',
        clientSecret: 'sh_sec_d3f9a72d1b82c3e4f5a6b7c8d9e0f1a2',
        allowedScopes: ['orders:read', 'accounts:write'],
        status: 'active',
        issuedAt: '2026-06-12'
      },
      {
        id: 'client_xero',
        clientName: 'Xero Accounting Syncer',
        clientId: 'cli_5948203918273',
        clientSecret: 'sh_sec_9d8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d',
        allowedScopes: ['orders:read', 'inventory:write', 'accounts:write'],
        status: 'active',
        issuedAt: '2026-07-02'
      },
      {
        id: 'client_ship_easy',
        clientName: 'ShipEasy Premium Courier Integration',
        clientId: 'cli_1029384756102',
        clientSecret: 'sh_sec_a1b2c3d4e5f60718293a4b5c6d7e8f90',
        allowedScopes: ['orders:read', 'inventory:write'],
        status: 'revoked',
        issuedAt: '2026-05-18'
      }
    ];
    try {
      const saved = localStorage.getItem('super_admin_oauth');
      return saved ? JSON.parse(saved) : defaults;
    } catch {
      return defaults;
    }
  });

  // --- SYSTEM PARAMS ---
  const [mrrTarget, setMrrTarget] = useState(38500);
  const [globalRateLimitCap, setGlobalRateLimitCap] = useState(120);
  const [backupScheduleHours, setBackupScheduleHours] = useState(12);
  const [maintenanceModeActive, setMaintenanceModeActive] = useState(false);
  const [sandboxBypassCode, setSandboxBypassCode] = useState('SUPER_PASS_2026');
  const [activeSideTab, setActiveSideTab] = useState<'overview' | 'tenants' | 'enquiries' | 'oauth' | 'policies' | 'sandbox' | 'global_dev_keys'>('overview');

  // --- STATE 5: GLOBAL CORPORATE DEV KEYS ---
  const [globalDevKeys, setGlobalDevKeys] = useState<any>(() => {
    const defaults = {
      amazon: { sellerId: 'AMZN_CORP_SELL_99', clientId: 'amzn1.application-oa2-client.corporate-sellershub-id', clientSecret: 'amzn1.oa2-cs.corporate-sellershub-secret-abc123xyz', developerToken: 'amzn1.spapi.dev_token.corp_99112' },
      ebay: { appId: 'Sellersh-MultiShi-PRD-corp8821', certId: 'PRD-corp8821-secret-772fa8', ruName: 'Sellersh-MultiShi-Redirect-corp' },
      shopify: { shopDomain: 'corporate-hub.myshopify.com', apiKey: 'shp_corp_key_123', apiToken: 'shpat_corporate_token_abc' },
      evri: { apiKey: 'evri_corp_api_key_8821', clientSecret: 'evri_corp_secret_7721', depotCode: 'DEPOT-99' },
      royal_mail: { clientId: 'rm_corp_client_33', clientSecret: 'rm_corp_secret_44', accountNum: 'RM-OBA-100293' },
      fedex: { accountNum: 'FDX-CORP-9921', clientId: 'fedex_corp_client_22', clientSecret: 'fedex_corp_secret_33' }
    };
    try {
      const saved = localStorage.getItem('super_admin_global_dev_keys');
      return saved ? JSON.parse(saved) : defaults;
    } catch {
      return defaults;
    }
  });

  const saveGlobalDevKeys = (keys: any) => {
    setGlobalDevKeys(keys);
    localStorage.setItem('super_admin_global_dev_keys', JSON.stringify(keys));
    triggerToast('🛡️ Deployed Corporate Keys to Client Registry!');
    addAuditLog(`[${new Date().toLocaleTimeString()}] 🛡️ Global Corporate Dev Keys updated and deployed to all client and user platforms.`);
  };

  // Filters & Selected objects
  const [onboardingFilter, setOnboardingFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | 'open' | 'replied'>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<PlatformEnquiry | null>(null);
  const [replyMessageText, setReplyMessageText] = useState('');
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Client creation form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientScopes, setNewClientScopes] = useState<string[]>(['orders:read']);
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Interactive mock backend routing states
  const [selectedRoute, setSelectedRoute] = useState<string>('onboard');
  const [mockLoading, setMockLoading] = useState(false);
  const [mockOutput, setMockOutput] = useState<any>(null);
  const [databaseLag, setDatabaseLag] = useState<number>(120); // ms

  // Server performance simulated metrics
  const [serverCpuLoad, setServerCpuLoad] = useState<number>(24);
  const [serverMemoryUsage, setServerMemoryUsage] = useState<number>(312); // mb
  const [databaseConnPool, setDatabaseConnPool] = useState<number>(8);

  // Triggering visual changes periodically for standard "live feed dashboard" look-and-feel
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate small CPU and memory ripples
      setServerCpuLoad(prev => {
        const diff = Math.floor(Math.random() * 7) - 3;
        const next = prev + diff;
        return next < 5 ? 5 : next > 85 ? 40 : next;
      });
      setServerMemoryUsage(prev => {
        const diff = Math.floor(Math.random() * 9) - 4;
        const next = prev + diff;
        return next < 250 ? 250 : next > 500 ? 320 : next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Set up initial audit logs
  useEffect(() => {
    setAuditLogs([
      `[${new Date().toLocaleTimeString()}] 🛡️ Super Admin Standalone Application loaded successfully. Address initialized on custom subdomain endpoint.`,
      `[${new Date().toLocaleTimeString()}] 🔗 Evri bulk label dispatcher connected with credentials pool ID #EV_39482.`,
      `[${new Date().toLocaleTimeString()}] 📊 Loading MRR aggregates: $34,890 total platform subscription revenue on-chain.`,
      `[${new Date().toLocaleTimeString()}] 🛡️ Security audit: 0 active token leaks detected. Database schemas verified.`,
      `[${new Date().toLocaleTimeString()}] 🔑 Handshake token registry is waiting on custom Sage Integrations auth queries.`
    ]);
  }, []);

  // Save changes functions
  const saveOnboard = (data: MerchantOnboardingRequest[]) => {
    setOnboardRequests(data);
    localStorage.setItem('super_admin_onboarding', JSON.stringify(data));
  };

  const saveEnquiries = (data: PlatformEnquiry[]) => {
    setEnquiries(data);
    localStorage.setItem('super_admin_enquiries', JSON.stringify(data));
  };

  const saveLocks = (data: GlobalFeatureLock[]) => {
    setGlobalLocks(data);
    localStorage.setItem('super_admin_locks', JSON.stringify(data));
  };

  const saveOauth = (data: OAuthClient[]) => {
    setOauthClients(data);
    localStorage.setItem('super_admin_oauth', JSON.stringify(data));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addAuditLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAuditLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
  };

  // Actions for Onboarding
  const handleApproveOnboarding = (reqId: string) => {
    const req = onboardRequests.find(r => r.id === reqId);
    if (!req) return;
    const updated = onboardRequests.map(r => r.id === reqId ? { ...r, status: 'approved' as const } : r);
    saveOnboard(updated);
    addAuditLog(`🟢 Tenant approved and database provisioned for: "${req.storeName}" (${req.requestedPlan.toUpperCase()})`);
    triggerToast(`Store "${req.storeName}" has been approved. Tenant database isolated successfully.`);
  };

  const handleRejectOnboarding = (reqId: string) => {
    const req = onboardRequests.find(r => r.id === reqId);
    if (!req) return;
    const updated = onboardRequests.map(r => r.id === reqId ? { ...r, status: 'rejected' as const } : r);
    saveOnboard(updated);
    addAuditLog(`🔴 Tenant onboarding application rejected for: "${req.storeName}" (${req.email})`);
    triggerToast(`Onboarding request for "${req.storeName}" rejected.`);
  };

  // Reply message trigger
  const handleSendEnquiryReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !replyMessageText.trim()) return;

    const updated = enquiries.map(enq => {
      if (enq.id === selectedEnquiry.id) {
        return {
          ...enq,
          status: 'replied' as const,
          replies: [...enq.replies, replyMessageText]
        };
      }
      return enq;
    });

    saveEnquiries(updated);
    addAuditLog(`✉️ Outbound official platform response dispatched to ${selectedEnquiry.email} regarding: "${selectedEnquiry.subject}"`);
    triggerToast(`Response dispatched securely.`);
    setReplyMessageText('');
    setSelectedEnquiry(null);
  };

  // Feature Toggles
  const handleToggleFeatureStatus = (id: string) => {
    const updated = globalLocks.map(f => {
      if (f.id === id) {
        const nextStatus: 'active' | 'maintenance' | 'locked' = 
          f.status === 'active' ? 'locked' : f.status === 'locked' ? 'maintenance' : 'active';
        return { ...f, status: nextStatus };
      }
      return f;
    });
    saveLocks(updated);
    const target = updated.find(f => f.id === id);
    if (target) {
      addAuditLog(`⚙️ Global Feature policy updated for "${target.name}": Status changed to ${target.status.toUpperCase()}`);
    }
  };

  // Simulate new request creators
  const handleCreateMockOnboarding = () => {
    const storeNames = ['TechMart Digital UK', 'GrooveRecord Retro', 'London Luxury Fragrance', 'Elite Power Tools'];
    const ownerNames = ['Ali Al-Sudani', 'Emma Vance', 'Charlotte Dupont', 'William Vance'];
    const emailSuffix = ['techmart-digital.co.uk', 'grooverecords.net', 'london-luxury.co.uk', 'elite-powertools.com'];
    
    const index = Math.floor(Math.random() * storeNames.length);
    const mockId = `req_${Date.now()}`;
    const plans: ('bronze_starter' | 'silver_growth' | 'gold_professional' | 'enterprise_slate')[] = 
      ['bronze_starter', 'silver_growth', 'gold_professional', 'enterprise_slate'];
    const selectedPlan = plans[Math.floor(Math.random() * plans.length)];

    const newRequest: MerchantOnboardingRequest = {
      id: mockId,
      storeName: storeNames[index] + ' ' + Math.floor(Math.random() * 90 + 10),
      ownerName: ownerNames[index],
      email: `contact@${emailSuffix[index]}`,
      country: ['United Kingdom', 'France', 'United States', 'Germany'][Math.floor(Math.random() * 4)],
      requestedPlan: selectedPlan,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      automatedCheck: Math.random() > 0.3 ? 'passed' : 'warning',
      warehouseCapacity: Math.floor(Math.random() * 10000) + 1000
    };

    saveOnboard([newRequest, ...onboardRequests]);
    addAuditLog(`📩 New incoming multi-channel registration request: "${newRequest.storeName}" applying for ${newRequest.requestedPlan.toUpperCase()}`);
    triggerToast(`Simulated Onboarding Request received for ${newRequest.storeName}.`);
  };

  const handleCreateMockEnquiry = () => {
    const names = ['Michael Scott', 'Jessica Miller', 'Dieter Müller', 'Alistair Thorne'];
    const emails = ['michael@dundermifflin.co.uk', 'jessica@millershipping.io', 'support@mueller-logistik.de', 'ceo@thorney-holdings.co.uk'];
    const subjects = [
      'Xero Tax Rates sync error - 20% VAT rounding difference',
      'Evri bulk dispatch - can we purchase pre-paid envelopes through the API?',
      'QuickBooks mapping error on multi-currency orders',
      'Request to expand master catalog product SKU limits to 12,500'
    ];
    const messages = [
      'We are matching our sales summary ledger entries with Xero. Our VAT total differs by £1.42. Does the API calculate taxes individually per invoice row or at the aggregate shipment level?',
      'Hello, our team is processing up to 350 shipping labels a day. We need an automated webhook that lets us buy parcel postage allocations directly from Sellershub ledger credits.',
      'We operate dual shops in GBP and EUR. When pushing inventory stock updates back to Sage, the unit price conversion rate gets rounded incorrectly to two decimal spots.',
      'We represent a wholesale parts store. The standard Gold tier is locked to 1,000 SKUs, but we have over 12,000 active references. Can we schedule a premium Enterprise onboarding?'
    ];
    const categories: ('onboarding' | 'billing' | 'technical' | 'custom_integration')[] = 
      ['onboarding', 'billing', 'technical', 'custom_integration'];

    const index = Math.floor(Math.random() * names.length);
    const mockId = `enq_${Date.now()}`;

    const newEnquiry: PlatformEnquiry = {
      id: mockId,
      senderName: names[index],
      email: emails[index],
      subject: subjects[index],
      message: messages[index],
      category: categories[Math.floor(Math.random() * categories.length)],
      receivedDate: new Date().toISOString().split('T')[0],
      status: 'open',
      replies: []
    };

    saveEnquiries([newEnquiry, ...enquiries]);
    addAuditLog(`📩 New platform inquiry received from ${newEnquiry.senderName} (${newEnquiry.category.toUpperCase()})`);
    triggerToast(`Simulated platform enquiry received.`);
  };

  // Create OAuth Client handler
  const handleCreateOAuthClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const clientId = 'cli_' + Math.random().toString(10).slice(2, 15);
    const clientSecret = 'sh_sec_' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
    
    const newClient: OAuthClient = {
      id: 'cli_' + Date.now(),
      clientName: newClientName,
      clientId,
      clientSecret,
      allowedScopes: newClientScopes,
      status: 'active',
      issuedAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newClient, ...oauthClients];
    saveOauth(updated);
    addAuditLog(`🔑 OAuth client created: "${newClient.clientName}". Cli-ID: ${newClient.clientId}. Granular scopes: [${newClient.allowedScopes.join(', ')}]`);
    triggerToast(`OAuth Credentials generated for ${newClient.clientName}.`);
    
    // reset form
    setNewClientName('');
    setNewClientScopes(['orders:read']);
    setIsCreatingClient(false);
  };

  // Revoke OAuth client
  const handleToggleOAuthClientStatus = (clientId: string) => {
    const updated = oauthClients.map(c => {
      if (c.clientId === clientId) {
        const nextStatus = c.status === 'active' ? 'revoked' : 'active';
        return { ...c, status: nextStatus as 'active' | 'revoked' };
      }
      return c;
    });
    saveOauth(updated);
    const client = updated.find(c => c.clientId === clientId);
    if (client) {
      addAuditLog(`🔑 OAuth security token policy changed for "${client.clientName}": Status set to ${client.status.toUpperCase()}`);
      triggerToast(`OAuth Client ${client.clientName} status updated to ${client.status}.`);
    }
  };

  // Toggle Scopes selection in checkbox list
  const toggleScope = (scope: string) => {
    if (newClientScopes.includes(scope)) {
      setNewClientScopes(newClientScopes.filter(s => s !== scope));
    } else {
      setNewClientScopes([...newClientScopes, scope]);
    }
  };

  // Run Backend code sandbox simulation
  const handleExecuteSandboxMock = () => {
    setMockLoading(true);
    setMockOutput(null);

    const backendMockRoutes: Record<string, any> = {
      onboard: {
        timestamp: new Date().toISOString(),
        route: "POST /api/admin/onboard",
        status: "201 Created",
        database_pool: `isolation_bucket_tenant_${Math.floor(Math.random() * 90000 + 10000)}`,
        evri_api_sandbox: "initialized_success",
        actions_taken: [
          "Verifying company lookup in UK Companies House registrar...",
          "Validating owner KYC credentials...",
          "Deploying dedicated PostgreSQL schema isolates...",
          "Binding master Evri label courier dispatch webhooks..."
        ],
        payload: {
          database_lag_ms: databaseLag,
          allocated_bin_spots: 12500,
          secure_salt_hash: "a9fd2bb87ca43b"
        }
      },
      oauth_authorize: {
        timestamp: new Date().toISOString(),
        route: "POST /api/admin/oauth/authorize",
        status: "200 Success",
        token_type: "Bearer",
        expires_in: 3600,
        access_token: "sh_tok_f0a9b8c7d6e5f4a3b2c1",
        refresh_token: "sh_ref_a1b2c3d4e5f6g7h8i9j0",
        scopes_authorized: ["orders:read", "inventory:write", "accounts:write"],
        signature_handshake: "SellershubOAuthv2_Sha256_Validated"
      },
      ledger_sync: {
        timestamp: new Date().toISOString(),
        route: "POST /api/admin/ledger-sync",
        status: "200 Completed",
        sync_results: {
          invoices_processed: 48,
          vat_differential_reconciled: "£0.00",
          double_entry_handshake_target: "Sage ledger endpoint v2",
          network_latency: `${databaseLag - 20}ms`
        }
      }
    };

    setTimeout(() => {
      setMockLoading(false);
      setMockOutput(backendMockRoutes[selectedRoute] || { error: "Unknown route" });
      addAuditLog(`💻 Sandbox Simulator executed route: POST /api/admin/${selectedRoute} [Latency: ${databaseLag}ms]`);
    }, 600);
  };

  // Metrics aggregates
  const totalStores = onboardRequests.filter(r => r.status === 'approved').length + 12; // simulated existing
  const activeEnquiriesCount = enquiries.filter(e => e.status === 'open').length;
  const pendingOnboardCount = onboardRequests.filter(r => r.status === 'pending').length;
  const activeKeysCount = oauthClients.filter(c => c.status === 'active').length;

  return (
    <div className={`${isEmbedded ? 'h-full flex-1 overflow-hidden' : 'min-h-screen'} bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white`} id="standalone-super-admin-root">
      
      {/* Dynamic Toast System */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-emerald-500/30 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 max-w-sm animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-wide leading-relaxed uppercase">{toastMessage}</span>
        </div>
      )}

      {/* Top Professional Header Bar */}
      {!isEmbedded && (
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-lg relative z-10">
          
          {/* Glow behind logo */}
          <div className="absolute top-0 left-0 w-80 h-10 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black uppercase tracking-wider text-white">Sellershub Platform</h1>
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 font-mono">STANDALONE HOST</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase">SUPER ADMIN DECISION CONTROL TERMINAL</p>
            </div>
          </div>

          {/* Global connection/health ribbon */}
          <div className="flex flex-wrap items-center gap-3 md:gap-5 text-[11px] bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Database:</span>
              <span className="font-mono font-bold text-slate-200">PostgreSQL (Isolates OK)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-slate-400">OAuth Router:</span>
              <span className="font-mono font-bold text-slate-200">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Evri Dispatcher:</span>
              <span className="font-mono font-bold text-slate-200">OK</span>
            </div>
          </div>

          {/* Action Button: Return to standard app */}
          <div className="flex items-center gap-3 shrink-0">
            <button title="Perform action"  
              onClick={() => {
                addAuditLog(`🛡️ Super Admin manually purges local storage caches and logs out...`);
                triggerToast(`Simulating Admin Logout...`);
                setTimeout(() => {
                  localStorage.removeItem('sellershub_user_role');
                  localStorage.removeItem('sellershub_user_name');
                  window.location.href = window.location.origin; // Reloads the page back to main customer dashboard
                }, 1000);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              Exit Terminal
            </button>
            
            <a
              href={window.location.origin}
              target="_blank"
              rel="noreferrer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              Launch Main App <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>
      )}

      {/* Main Grid Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Side Tab Navigation Panel */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none overflow-y-auto">
          
          {/* Quick User Identity Card */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-indigo-400 border border-slate-700">
              PA
            </div>
            <div>
              <span className="text-xs font-black text-white block leading-tight">Pankaj Slamtech</span>
              <span className="text-[9.5px] text-slate-400 font-semibold block uppercase">Multi-Tenant Owner</span>
            </div>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">ADMIN CONTROL BOARDS</span>
          </div>

          {/* Tab Selection */}
          <div className="px-3 pb-4 space-y-1 flex-1">
            <button title="Perform action" 
              onClick={() => setActiveSideTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSideTab === 'overview'
                  ? 'bg-indigo-600 text-white border border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4 text-indigo-400" />
              Overview & Server Performance
            </button>

            <button title="Perform action" 
              onClick={() => setActiveSideTab('tenants')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSideTab === 'tenants'
                  ? 'bg-indigo-600 text-white border border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Tenant Onboarding</span>
              </div>
              {pendingOnboardCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingOnboardCount}
                </span>
              )}
            </button>

            <button title="Perform action" 
              onClick={() => setActiveSideTab('enquiries')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSideTab === 'enquiries'
                  ? 'bg-indigo-600 text-white border border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Developer Enquiries</span>
              </div>
              {activeEnquiriesCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {activeEnquiriesCount}
                </span>
              )}
            </button>

            <button title="Perform action" 
              onClick={() => setActiveSideTab('oauth')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSideTab === 'oauth'
                  ? 'bg-indigo-600 text-white border border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-pink-400" />
                <span>OAuth Credential Hub</span>
              </div>
              <span className="text-[9.5px] font-mono text-slate-500 font-bold">{activeKeysCount} Active</span>
            </button>

            <button title="Perform action" 
              onClick={() => setActiveSideTab('policies')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSideTab === 'policies'
                  ? 'bg-indigo-600 text-white border border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              Platform Policies & Limits
            </button>

            <button title="Perform action" 
              onClick={() => setActiveSideTab('sandbox')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSideTab === 'sandbox'
                  ? 'bg-indigo-600 text-white border border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Code className="w-4 h-4 text-cyan-400" />
              Backend Route Sandbox
            </button>

            <button title="Perform action" 
              onClick={() => setActiveSideTab('global_dev_keys')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSideTab === 'global_dev_keys'
                  ? 'bg-indigo-600 text-white border border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Workflow className="w-4 h-4 text-emerald-400" />
              Corporate Dev Keys
            </button>
          </div>

          {/* Quick status bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/20 space-y-3 shrink-0">
            <span className="text-[9.5px] font-mono font-bold text-slate-500 block uppercase">SIMULATED HEALTH LOCKS</span>
            <div className="space-y-1.5 text-[10px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>Sage Ledger Webhooks:</span>
                <span className="text-emerald-400 font-bold font-mono">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Evri Postage API:</span>
                <span className="text-emerald-400 font-bold font-mono">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Connection Pool:</span>
                <span className="text-amber-400 font-bold font-mono">{databaseConnPool}/20 Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Standalone Workspace Panel Area */}
        <main className="flex-1 bg-slate-950 overflow-y-auto p-6 space-y-6">
          
          {/* Global Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Simulated Monthly MRR</span>
                <span className="text-2xl font-black text-indigo-400 mt-1 block">${mrrTarget.toLocaleString()}</span>
                <span className="text-[9.5px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> +12.4% vs last month
                </span>
              </div>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Active Tenant Database Buckets</span>
                <span className="text-2xl font-black text-white mt-1 block">{totalStores} Isolated</span>
                <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5">Separate schema mapping bounds</span>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Database className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">OAuth Credentials Issued</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">{activeKeysCount} Clients</span>
                <span className="text-[9.5px] text-amber-500 font-semibold block mt-0.5">Double-entry ledger scopes</span>
              </div>
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Key className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Developer Enquiry Inbox</span>
                <span className="text-2xl font-black text-rose-400 mt-1 block">{activeEnquiriesCount} Pending</span>
                <span className="text-[9.5px] text-rose-400 font-semibold block mt-0.5">API mismatch query rate</span>
              </div>
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
                <Mail className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* --- TAB VIEW 1: OVERVIEW & SERVER PERFORMANCE --- */}
          {activeSideTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="overview-dashboard-board">
              
              {/* Left Side: Server diagnostics & Webhook graphs */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Diagnostics overview */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Live System Resource Diagnostics</h3>
                    </div>
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-500/25">REFRESHING LIVE</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    
                    {/* CPU gauge */}
                    <div className="space-y-2 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-semibold">Node.js Server CPU Load</span>
                        <span className="font-mono text-xs font-black text-white">{serverCpuLoad}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${serverCpuLoad}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">Container host: Cloud Run</span>
                    </div>

                    {/* RAM usage */}
                    <div className="space-y-2 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-semibold">V8 Memory Allocation</span>
                        <span className="font-mono text-xs font-black text-white">{serverMemoryUsage} MB</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${(serverMemoryUsage / 512) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">Sandbox limit: 512 MB</span>
                    </div>

                    {/* Database connection pool status */}
                    <div className="space-y-2 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-semibold">Postgres Schema Pool</span>
                        <span className="font-mono text-xs font-black text-white">{databaseConnPool}/20 Pool</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full transition-all" 
                          style={{ width: `${(databaseConnPool / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">Bypass triggers active</span>
                    </div>

                  </div>

                  {/* Manual Controls to adjust diagnostic values */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Diagnostics Simulation Override</span>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="space-y-1 w-full sm:w-1/2">
                        <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                          <span>Simulated Database Delay Limit</span>
                          <span className="text-white font-mono">{databaseLag} ms</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={500}
                          step={20}
                          value={databaseLag}
                          onChange={(e) => {
                            setDatabaseLag(Number(e.target.value));
                            addAuditLog(`⚙️ Sandbox lag latency target adjusted to ${Number(e.target.value)}ms`);
                          }}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button title="Perform action" 
                          onClick={() => {
                            const nextPool = databaseConnPool >= 20 ? 4 : databaseConnPool + 2;
                            setDatabaseConnPool(nextPool);
                            addAuditLog(`🗄️ Manually adjusted simulated database connection pool thread count to ${nextPool}`);
                            triggerToast(`Schema Connections Updated`);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Cycle DB Pool
                        </button>
                        <button title="Perform action" 
                          onClick={() => {
                            addAuditLog(`🔄 Executing live network garbage collection for database isolated shards.`);
                            triggerToast(`Garbage Collected Successfully`);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10.5px] px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                        >
                          Trigger DB Shard GC
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Subscriptions Tier distributions & channel mapping charts */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Subscriber Plans & Database Distributions</h3>
                    </div>
                    <span className="text-slate-400 text-xs font-semibold">4 active plans in use</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sellershub isolates each subscription tier with pre-allocated warehouse sizes, API limits, and specific channel integrations (Amazon SP-API, Evri Bulk label triggers, Sage general ledger handshake webhooks).
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Bronze Starter</span>
                      <span className="text-lg font-mono font-black text-slate-200">5 Stores</span>
                      <p className="text-[9px] text-slate-500">Max 250 orders/mo</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] text-indigo-400 font-bold block uppercase">Silver Growth</span>
                      <span className="text-lg font-mono font-black text-indigo-300">4 Stores</span>
                      <p className="text-[9px] text-slate-500">Max 1000 orders/mo</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] text-amber-400 font-bold block uppercase">Gold Professional</span>
                      <span className="text-lg font-mono font-black text-amber-300">2 Stores</span>
                      <p className="text-[9px] text-slate-500">Max 5000 orders/mo</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] text-pink-400 font-bold block uppercase">Enterprise Slate</span>
                      <span className="text-lg font-mono font-black text-pink-300">1 Store</span>
                      <p className="text-[9px] text-slate-500">Unlimited capacity</p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Side: Live Handshake Audit Log Terminal */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Simulated logs terminal */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col h-[460px]">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-300">Live Handshake Monitor</span>
                    </div>
                    <button title="Perform action" 
                      onClick={() => {
                        setAuditLogs([`[${new Date().toLocaleTimeString()}] 🛡️ Super Admin Terminal log manual purge executed.`]);
                      }}
                      className="text-[9.5px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Clear Log
                    </button>
                  </div>

                  {/* Log scrolling list */}
                  <div className="p-3 font-mono text-[10px] overflow-y-auto space-y-2 flex-1 bg-slate-950 rounded-xl border border-slate-800 scrollbar-thin scrollbar-thumb-slate-800">
                    {auditLogs.map((log, idx) => {
                      let colorClass = 'text-slate-400';
                      if (log.includes('🟢') || log.includes('passed')) colorClass = 'text-emerald-400 font-bold';
                      if (log.includes('🔴') || log.includes('rejected') || log.includes('ALERT') || log.includes('⛔')) colorClass = 'text-rose-400 font-extrabold';
                      if (log.includes('⚙️')) colorClass = 'text-indigo-400 font-semibold';
                      if (log.includes('✉️')) colorClass = 'text-amber-400';
                      if (log.includes('🔑')) colorClass = 'text-pink-400';
                      if (log.includes('💻')) colorClass = 'text-cyan-400';

                      return (
                        <div key={idx} className={`${colorClass} leading-normal`}>
                          {log}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-2 shrink-0 pt-1">
                    <button title="Execute CreateMockOnboarding"
                      onClick={handleCreateMockOnboarding}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-[10.5px] py-2 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Simulate Store App
                    </button>
                    <button title="Execute CreateMockEnquiry"
                      onClick={handleCreateMockEnquiry}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-[10.5px] py-2 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Simulate Developer Tick
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* --- TAB VIEW 2: TENANT ONBOARDING BOARD --- */}
          {activeSideTab === 'tenants' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6" id="tenant-onboarding-panel">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Merchant Onboarding & Application Gate</h3>
                  </div>
                  <p className="text-xs text-slate-400">Review prospective subscribers, provision company isolated schemas, and register warehouse bin limits.</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Filters */}
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                      <button title="Perform action" 
                        key={f}
                        onClick={() => setOnboardingFilter(f)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all cursor-pointer ${
                          onboardingFilter === f
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <button title="Execute CreateMockOnboarding"
                    onClick={handleCreateMockOnboarding}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" /> Simulate Request
                  </button>
                </div>
              </div>

              {/* Main table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-800 border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider bg-slate-950">
                      <th className="p-4">Store Name</th>
                      <th className="p-4">Requested Plan</th>
                      <th className="p-4">Owner & Location</th>
                      <th className="p-4">Warehouse Spots</th>
                      <th className="p-4">Automated Checks</th>
                      <th className="p-4">Status & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                    {onboardRequests.filter(r => onboardingFilter === 'all' || r.status === onboardingFilter).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500 space-y-2">
                          <UserCheck className="w-10 h-10 text-slate-700 mx-auto" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Subscriber Applications Match Filter</p>
                          <p className="text-[11px] text-slate-500">Click "Simulate Request" to trigger custom incoming merchant applications.</p>
                        </td>
                      </tr>
                    ) : (
                      onboardRequests
                        .filter(r => onboardingFilter === 'all' || r.status === onboardingFilter)
                        .map(req => (
                          <tr key={req.id} className="hover:bg-slate-950/20 transition-all">
                            
                            {/* Store details */}
                            <td className="p-4">
                              <span className="font-bold text-white block">{req.storeName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{req.email}</span>
                            </td>

                            {/* Plan Badge */}
                            <td className="p-4">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                req.requestedPlan === 'enterprise_slate' ? 'bg-purple-950/40 text-purple-400 border-purple-800/40' :
                                req.requestedPlan === 'gold_professional' ? 'bg-amber-950/40 text-amber-400 border-amber-800/40' :
                                req.requestedPlan === 'silver_growth' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40' :
                                'bg-slate-850 text-slate-400 border-slate-700'
                              }`}>
                                {req.requestedPlan.replace('_', ' ')}
                              </span>
                            </td>

                            {/* Owner */}
                            <td className="p-4">
                              <span className="text-slate-300 block font-semibold">{req.ownerName}</span>
                              <span className="text-[10.5px] text-slate-500">{req.country}</span>
                            </td>

                            {/* Warehouse spots */}
                            <td className="p-4">
                              <span className="font-mono font-bold text-indigo-400">{req.warehouseCapacity.toLocaleString()} Bins</span>
                              <span className="text-[10px] text-slate-500 block">Isolated stock tracks</span>
                            </td>

                            {/* Automated checks */}
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${req.automatedCheck === 'passed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                <span className={`font-mono text-[10.5px] ${req.automatedCheck === 'passed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {req.automatedCheck === 'passed' ? 'VAT & Address OK' : 'Verification Flagged'}
                                </span>
                              </div>
                            </td>

                            {/* Actions controls */}
                            <td className="p-4 shrink-0">
                              {req.status === 'pending' ? (
                                <div className="flex gap-1.5">
                                  <button title="Perform action" 
                                    onClick={() => handleApproveOnboarding(req.id)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10.5px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button title="Perform action" 
                                    onClick={() => handleRejectOnboarding(req.id)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-extrabold text-[10.5px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {req.status === 'approved' ? '✓ Provisioned' : '✗ Rejected'}
                                </span>
                              )}
                            </td>

                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* --- TAB VIEW 3: DEVELOPER ENQUIRIES --- */}
          {activeSideTab === 'enquiries' && (
            <div className="space-y-6" id="developer-enquiries-panel">
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Subscribers & Granular Ledger API Queries</h3>
                    </div>
                    <p className="text-xs text-slate-400">Review custom developer integrations questions, resolve double-entry tax rounding differences, and dispatch handshakes.</p>
                  </div>

                  <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                    {(['all', 'open', 'replied'] as const).map(f => (
                      <button title="Perform action" 
                        key={f}
                        onClick={() => setEnquiryFilter(f)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all cursor-pointer ${
                          enquiryFilter === f
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-slate-800">
                  {enquiries.filter(e => enquiryFilter === 'all' || e.status === enquiryFilter).length === 0 ? (
                    <div className="p-12 text-center text-slate-500 space-y-2">
                      <Mail className="w-10 h-10 text-slate-700 mx-auto" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Enquiries Match Filter</p>
                      <p className="text-[11px] text-slate-500">Click "Simulate Enquiry" to load prospect tickets.</p>
                    </div>
                  ) : (
                    enquiries
                      .filter(e => enquiryFilter === 'all' || e.status === enquiryFilter)
                      .map(enq => (
                        <div key={enq.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                          
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2.5">
                                <span className="text-sm font-black text-white">{enq.senderName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({enq.email})</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-indigo-400">Subject: {enq.subject}</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${
                                enq.category === 'custom_integration' ? 'bg-amber-950/40 text-amber-400 border-amber-800/40' :
                                enq.category === 'onboarding' ? 'bg-green-950/40 text-green-400 border-green-800/40' :
                                enq.category === 'billing' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40' :
                                'bg-slate-850 text-slate-400 border-slate-700'
                              }`}>
                                {enq.category.replace('_', ' ')}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                enq.status === 'open' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {enq.status}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-850 leading-relaxed font-semibold">
                            {enq.message}
                          </p>

                          {/* Replies list */}
                          {enq.replies.length > 0 && (
                            <div className="space-y-2 pl-4 border-l-2 border-indigo-500 pt-1">
                              <span className="text-[9.5px] uppercase font-mono font-bold text-indigo-400 block tracking-widest">Platform Admin Replies dispatched:</span>
                              {enq.replies.map((rep, idx) => (
                                <p key={idx} className="text-xs italic text-slate-400 font-semibold leading-relaxed">
                                  "{rep}"
                                </p>
                              ))}
                            </div>
                          )}

                          {enq.status === 'open' && (
                            <div className="flex justify-end pt-1">
                              <button title="Perform action" 
                                onClick={() => setSelectedEnquiry(enq)}
                                className="bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
                              >
                                Compose Handshake Response
                              </button>
                            </div>
                          )}

                        </div>
                      ))
                  )}
                </div>

              </div>

              {/* Responder panel */}
              {selectedEnquiry && (
                <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 space-y-4 animate-fade-in">
                  
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">Custom double-entry dispatch editor</h4>
                    </div>
                    <button title="Perform action" 
                      onClick={() => setSelectedEnquiry(null)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer font-semibold"
                    >
                      Close Box
                    </button>
                  </div>

                  <div className="text-xs space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <p><span className="text-slate-500 font-mono">To:</span> <span className="font-bold text-slate-200">{selectedEnquiry.senderName} ({selectedEnquiry.email})</span></p>
                    <p><span className="text-slate-500 font-mono">Scope:</span> <span className="font-bold text-slate-200">Re: {selectedEnquiry.subject}</span></p>
                  </div>

                  <form onSubmit={handleSendEnquiryReply} className="space-y-4">
                    <textarea
                      required
                      rows={4}
                      placeholder="Enter resolution notes, API bypass codes, or direct custom billing allocations to send to this merchant subscriber..."
                      value={replyMessageText}
                      onChange={(e) => setReplyMessageText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-xs font-medium text-slate-200 focus:outline-none placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/15"
                    />

                    <div className="flex justify-end gap-2">
                      <button title="Perform action" 
                        type="button"
                        onClick={() => setSelectedEnquiry(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[11px] px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Discard Reply
                      </button>
                      <button title="Submit form" 
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[11px] px-5 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        Dispatch Handshake Response
                      </button>
                    </div>
                  </form>

                </div>
              )}

            </div>
          )}

          {/* --- TAB VIEW 4: OAUTH CREDENTIAL HUB --- */}
          {activeSideTab === 'oauth' && (
            <div className="space-y-6" id="oauth-hub-panel">
              
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Left col: OAuth registry list */}
                <div className="xl:col-span-8 space-y-6">
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-pink-400" />
                          <h3 className="text-sm font-black text-white uppercase tracking-wider">Granular OAuth 2.0 Clients</h3>
                        </div>
                        <p className="text-xs text-slate-400">Authorise third-party developers, Sage integration channels, and QuickBooks ledger synchronizers.</p>
                      </div>

                      <button title="Perform action" 
                        onClick={() => setIsCreatingClient(!isCreatingClient)}
                        className="bg-pink-600 hover:bg-pink-500 text-white font-black text-[11px] px-3.5 py-2 rounded-xl transition-all shadow-md shadow-pink-600/10 cursor-pointer"
                      >
                        + Create OAuth Client
                      </button>
                    </div>

                    <div className="space-y-4">
                      {oauthClients.map(client => (
                        <div key={client.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 hover:border-slate-800 transition-all">
                          
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-black text-white">{client.clientName}</h4>
                              <p className="text-[10px] text-slate-500">Issued Date: {client.issuedAt}</p>
                            </div>

                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border self-start sm:self-center ${
                              client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {client.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] bg-slate-900/60 p-3 rounded-lg border border-slate-850 font-mono">
                            <div className="space-y-0.5">
                              <span className="text-slate-500 uppercase font-bold tracking-wider">Client ID</span>
                              <span className="text-slate-300 block select-all">{client.clientId}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-slate-500 uppercase font-bold tracking-wider">Client Secret</span>
                              <span className="text-slate-300 block select-all">{client.clientSecret}</span>
                            </div>
                          </div>

                          {/* Scopes & Toggle Status */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">Authorized Scopes:</span>
                              {client.allowedScopes.map(scope => (
                                <span key={scope} className="bg-slate-800 text-slate-300 text-[9.5px] font-mono px-2 py-0.5 rounded border border-slate-700">
                                  {scope}
                                </span>
                              ))}
                            </div>

                            <button title="Perform action" 
                              onClick={() => handleToggleOAuthClientStatus(client.clientId)}
                              className={`font-black text-[10.5px] px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                client.status === 'active' 
                                  ? 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/40 border border-rose-900/30' 
                                  : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-900/30'
                              }`}
                            >
                              {client.status === 'active' ? 'Revoke Token Access' : 'Re-Authorize Client'}
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>

                </div>

                {/* Right col: Form / Settings info */}
                <div className="xl:col-span-4 space-y-6">
                  
                  {isCreatingClient && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 animate-fade-in">
                      
                      <div className="border-b border-slate-800 pb-3">
                        <h4 className="text-xs font-black uppercase text-pink-400 tracking-wider">Create OAuth Credentials</h4>
                        <p className="text-[10px] text-slate-400">Generate isolated Client ID and secret hash values for a subscriber's custom double-entry integrations.</p>
                      </div>

                      <form onSubmit={handleCreateOAuthClient} className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">Client Tool Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sage ledger pipeline v2"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl p-3 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500/10"
                          />
                        </div>

                        {/* Granular Scope selection */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">Select Authorized Scopes</label>
                          
                          <div className="space-y-2">
                            {[
                              { id: 'orders:read', label: 'orders:read (Fetch multi-channel sales summaries)' },
                              { id: 'inventory:write', label: 'inventory:write (Trigger catalog stock updates)' },
                              { id: 'accounts:write', label: 'accounts:write (Post sales invoices to double-entry ledger)' }
                            ].map(scope => {
                              const checked = newClientScopes.includes(scope.id);
                              return (
                                <label key={scope.id} className="flex items-start gap-2 text-[10.5px] font-semibold text-slate-300 cursor-pointer hover:text-white transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleScope(scope.id)}
                                    className="mt-0.5 accent-pink-600 rounded"
                                  />
                                  <span>{scope.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          <button title="Cancel and close" 
                            type="button"
                            onClick={() => setIsCreatingClient(false)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-extrabold text-[10.5px] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button title="Submit form" 
                            type="submit"
                            className="bg-pink-600 hover:bg-pink-500 text-white font-black text-[10.5px] px-4 py-1.5 rounded-xl transition-all shadow-md shadow-pink-600/10 cursor-pointer"
                          >
                            Generate Client
                          </button>
                        </div>
                      </form>

                    </div>
                  )}

                  {/* Information Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <LockKeyhole className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-black uppercase text-slate-200 tracking-wider">OAuth Integration Flow</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sellershub employs standard bearer token queries. Third-party developer applications should retrieve authorization keys by submitting credentials securely via `POST /api/oauth/token` as shown in the sandbox console.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono bg-slate-950 p-3 rounded-lg border border-slate-850">
                      POST https://api.sellershub.net/oauth/token
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* --- TAB VIEW 5: PLATFORM POLICIES & LIMITS --- */}
          {activeSideTab === 'policies' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="platform-policies-panel">
              
              {/* Left col: Global Switches */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Core locks */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Core Feature Policy Lockdowns</h3>
                    </div>
                    <span className="text-slate-400 text-xs font-semibold">5 system features registered</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Direct Super Admin switches to instantly restrict specific feature sets platform-wide. If a feature status is set to blocked or maintenance, users receive appropriate 503 fallback headers.
                  </p>

                  <div className="space-y-3 pt-2">
                    {globalLocks.map(f => (
                      <div key={f.id} className="p-3.5 rounded-xl border border-slate-850 flex items-center justify-between gap-4 bg-slate-950/40 hover:border-slate-800 transition-all">
                        <div className="space-y-1">
                          <span className="text-xs font-black text-white block">{f.name}</span>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{f.description}</p>
                          <span className="text-[9px] text-slate-400 font-mono">Restricted to: <strong className="text-slate-300 capitalize">{f.restrictedTo.replace('_', ' ')}</strong></span>
                        </div>

                        <button title="Perform action" 
                          onClick={() => handleToggleFeatureStatus(f.id)}
                          className={`text-[9.5px] font-black uppercase px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${
                            f.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            f.status === 'maintenance' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' :
                            'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}
                        >
                          {f.status === 'active' ? '● Active' : f.status === 'maintenance' ? '● Maintenance' : '● Blocked'}
                        </button>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              {/* Right col: Parameter sliders */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
                  <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase text-slate-200 tracking-wider">Live System Parameters</span>
                  </div>

                  {/* MRR Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                      <span>Target Monthly Platform MRR</span>
                      <span className="text-indigo-400 font-mono font-bold">${mrrTarget.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={100000}
                      step={2500}
                      value={mrrTarget}
                      onChange={(e) => {
                        setMrrTarget(Number(e.target.value));
                        addAuditLog(`⚙️ Platform revenue alert: Target MRR threshold updated to $${Number(e.target.value).toLocaleString()}`);
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Throttle Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                      <span>API Rate Limit Cap</span>
                      <span className="text-indigo-400 font-mono font-bold">{globalRateLimitCap} req/min</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={300}
                      step={30}
                      value={globalRateLimitCap}
                      onChange={(e) => {
                        setGlobalRateLimitCap(Number(e.target.value));
                        addAuditLog(`⚙️ Global Throttle: Default third-party API rate limit ceiling set to ${Number(e.target.value)} requests.`);
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Backup hours select */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">Isolated Backup Schedule</label>
                    <select
                      value={backupScheduleHours}
                      onChange={(e) => {
                        setBackupScheduleHours(Number(e.target.value));
                        addAuditLog(`⚙️ Backup schedule updated to run every ${e.target.value} hours for database isolated shards.`);
                        triggerToast(`Backup rules adjusted`);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value={6}>Every 6 Hours</option>
                      <option value={12}>Every 12 Hours</option>
                      <option value={24}>Every 24 Hours</option>
                      <option value={48}>Every 48 Hours</option>
                    </select>
                  </div>

                  {/* Sandbox Bypass Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">Sandbox API Bypass Key</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sandboxBypassCode}
                        onChange={(e) => {
                          setSandboxBypassCode(e.target.value);
                          addAuditLog(`⚙️ Authentication bypass pass modified.`);
                        }}
                        className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 focus:outline-none focus:border-indigo-500 text-indigo-400"
                      />
                      <Zap className="w-3.5 h-3.5 text-indigo-500 absolute right-3 top-3 animate-pulse" />
                    </div>
                  </div>

                  {/* Global maintenance block */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">Global Platform Lockout</span>
                      <p className="text-[9px] text-slate-500 leading-normal">Forces 503 page to all normal subscribers.</p>
                    </div>
                    <button title="Perform action" 
                      type="button"
                      onClick={() => {
                        const next = !maintenanceModeActive;
                        setMaintenanceModeActive(next);
                        addAuditLog(next 
                          ? `⛔ ALERT: Super admin enabled GLOBAL PLATFORM MAINTENANCE MODE. All subscribers blocked.` 
                          : `🟢 ALERT: Super admin disabled maintenance mode. Normal client operations restored.`
                        );
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        maintenanceModeActive ? 'bg-rose-500' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        maintenanceModeActive ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* --- TAB VIEW 6: BACKEND ROUTE SANDBOX --- */}
          {activeSideTab === 'sandbox' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="backend-route-sandbox-panel">
              
              {/* Left col: Route selection & details */}
              <div className="lg:col-span-6 space-y-6">
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  
                  <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Sellershub Backend Simulator</h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Test actual JSON endpoint behaviors, database schema setups, company isolated provisioning schemas, and granular OAuth authorization callbacks directly from this panel.
                  </p>

                  <div className="space-y-3">
                    {[
                      { id: 'onboard', name: 'POST /api/admin/onboard', desc: 'Isolate company database pool and bind courier credentials.' },
                      { id: 'oauth_authorize', name: 'POST /api/admin/oauth/authorize', desc: 'Exchange developer credentials for granular OAuth access tokens.' },
                      { id: 'ledger_sync', name: 'POST /api/admin/ledger-sync', desc: 'Trigger webhook synchronization targeting Sage ledger API scope.' }
                    ].map(route => (
                      <button title="Perform action" 
                        key={route.id}
                        onClick={() => {
                          setSelectedRoute(route.id);
                          setMockOutput(null);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer block ${
                          selectedRoute === route.id
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold block">{route.name}</span>
                        <span className="text-[10px] text-slate-400 mt-1 block">{route.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-mono block">Simulation latency target:</span>
                      <span className="text-xs font-mono font-bold text-slate-300">{databaseLag} ms</span>
                    </div>

                    <button title="Execute ExecuteSandboxMock"
                      onClick={handleExecuteSandboxMock}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-cyan-500/10 cursor-pointer flex items-center gap-2"
                    >
                      <Workflow className="w-4 h-4 animate-spin-slow" /> Execute Sandbox Request
                    </button>
                  </div>

                </div>

              </div>

              {/* Right col: Mock raw code & Output payload */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Code editor preview */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col h-[480px]">
                  
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
                    <span className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider">Live Route Handler Snippet</span>
                    <span className="bg-slate-950 text-slate-500 text-[9px] font-mono px-2 py-0.5 rounded border border-slate-800">TypeScript / Express</span>
                  </div>

                  {/* Editor window */}
                  <div className="flex-1 font-mono text-[9.5px] bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-auto select-none scrollbar-thin scrollbar-thumb-slate-800">
                    {selectedRoute === 'onboard' && (
                      <pre className="text-cyan-400">
{`// Express Route: POST /api/admin/onboard
import { Router } from 'express';
import { db } from './db';

const router = Router();

router.post('/onboard', async (req, res) => {
  const { storeName, requestedPlan, warehouseCapacity } = req.body;
  const dbLag = ${databaseLag}; // Override

  try {
    await sleep(dbLag); // Simulate isolation load
    
    // Create Isolated PostgreSQL Tenant Shard
    const isolatedDbBucket = await db.schema.createIsolatedBucket({
      storeName,
      pricingTier: requestedPlan,
      limit_bins: warehouseCapacity
    });

    return res.status(201).json({
      status: "created",
      database_pool: isolatedDbBucket.id,
      evri_api_sandbox: "initialized_success",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});`}
                      </pre>
                    )}

                    {selectedRoute === 'oauth_authorize' && (
                      <pre className="text-pink-400">
{`// Express Route: POST /api/admin/oauth/authorize
import { Router } from 'express';
import { authRegistry } from './services/oauth';

const router = Router();

router.post('/oauth/authorize', async (req, res) => {
  const { clientId, clientSecret, bypassCode } = req.body;

  // Validate bypass codes
  if (bypassCode === "${sandboxBypassCode}") {
    const defaultToken = authRegistry.generateBypassToken();
    return res.json(defaultToken);
  }

  const client = await authRegistry.verifySecret(clientId, clientSecret);
  if (!client) {
    return res.status(403).json({ error: "Forbidden scope" });
  }

  const bearerResponse = authRegistry.generateBearerResponse(client);
  return res.json(bearerResponse);
});`}
                      </pre>
                    )}

                    {selectedRoute === 'ledger_sync' && (
                      <pre className="text-amber-400">
{`// Express Route: POST /api/admin/ledger-sync
import { Router } from 'express';
import { sageLedger } from './integrations/sage';

const router = Router();

router.post('/ledger-sync', async (req, res) => {
  try {
    const handshake = await sageLedger.reconcileVATDiffs({
      reconciliationType: 'aggregate_invoice',
      roundingPrecision: 2
    });

    return res.json({
      status: "completed",
      sync_results: {
        invoices_processed: handshake.rows,
        vat_differential_reconciled: handshake.reconciledText,
        database_lag_ms: ${databaseLag}
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});`}
                      </pre>
                    )}
                  </div>

                  {/* Sandbox response output */}
                  <div className="shrink-0 h-[140px] bg-slate-950 p-3 rounded-xl border border-slate-850 overflow-y-auto font-mono text-[9px]">
                    <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mb-1">Response JSON Payload</div>
                    {mockLoading ? (
                      <div className="flex items-center gap-2 text-indigo-400 py-2 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending payload handshake through PostgreSQL isolates...</span>
                      </div>
                    ) : mockOutput ? (
                      <pre className="text-emerald-400 leading-normal select-all">
                        {JSON.stringify(mockOutput, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-slate-600 block py-3">Click "Execute Sandbox Request" above to trigger Express pipeline...</span>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* --- TAB VIEW 7: GLOBAL CHANNEL DEV KEYS --- */}
          {activeSideTab === 'global_dev_keys' && (
            <div className="space-y-6 animate-fade-in text-slate-100" id="global-dev-keys-panel">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Corporate Developer Keys Registry</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Define pre-approved global developer connection keys, secrets, and authorization payloads. When populated, these gateways will become available to standard subscribers for one-click store and courier integrations, bypassing their need for manual developer accounts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amazon */}
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">Amazon SP-API Corporate Gateway</h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">Corporate Seller ID</label>
                        <input
                          type="text"
                          value={globalDevKeys.amazon.sellerId}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, amazon: { ...globalDevKeys.amazon, sellerId: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">LWA Client ID</label>
                        <input
                          type="text"
                          value={globalDevKeys.amazon.clientId}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, amazon: { ...globalDevKeys.amazon, clientId: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">LWA Client Secret</label>
                        <input
                          type="password"
                          value={globalDevKeys.amazon.clientSecret}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, amazon: { ...globalDevKeys.amazon, clientSecret: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* eBay */}
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">eBay Traditional/REST App Gateway</h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">eBay App ID (Client ID)</label>
                        <input
                          type="text"
                          value={globalDevKeys.ebay.appId}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, ebay: { ...globalDevKeys.ebay, appId: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">eBay Cert ID (Client Secret)</label>
                        <input
                          type="password"
                          value={globalDevKeys.ebay.certId}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, ebay: { ...globalDevKeys.ebay, certId: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">eBay RuName (Redirect URI Name)</label>
                        <input
                          type="text"
                          value={globalDevKeys.ebay.ruName}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, ebay: { ...globalDevKeys.ebay, ruName: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shopify */}
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">Shopify Corporate Partner Gateway</h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">Corporate Shop Domain</label>
                        <input
                          type="text"
                          value={globalDevKeys.shopify.shopDomain}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, shopify: { ...globalDevKeys.shopify, shopDomain: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">Custom API Key</label>
                        <input
                          type="text"
                          value={globalDevKeys.shopify.apiKey}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, shopify: { ...globalDevKeys.shopify, apiKey: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">Admin Access Token</label>
                        <input
                          type="password"
                          value={globalDevKeys.shopify.apiToken}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, shopify: { ...globalDevKeys.shopify, apiToken: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Couriers (Evri, Royal Mail, FedEx) */}
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">Couriers Corporate Keys Gateway</h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">Royal Mail OBA Account Number</label>
                        <input
                          type="text"
                          value={globalDevKeys.royal_mail.accountNum}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, royal_mail: { ...globalDevKeys.royal_mail, accountNum: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">EVRi Client ID / API Key</label>
                        <input
                          type="text"
                          value={globalDevKeys.evri.apiKey}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, evri: { ...globalDevKeys.evri, apiKey: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">FedEx Corporate Account Number</label>
                        <input
                          type="text"
                          value={globalDevKeys.fedex.accountNum}
                          onChange={(e) => setGlobalDevKeys({ ...globalDevKeys, fedex: { ...globalDevKeys.fedex, accountNum: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                  <button title="Save configuration" 
                    onClick={() => saveGlobalDevKeys(globalDevKeys)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save and Deploy Corporate Credentials
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
