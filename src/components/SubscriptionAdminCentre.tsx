import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Settings, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Award, 
  Activity, 
  Download, 
  FileText, 
  RefreshCw, 
  Unlock, 
  Lock, 
  HelpCircle,
  HelpCircle as HeartBrokenIcon,
  Smile,
  Frown,
  Coins,
  Printer
} from 'lucide-react';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnually: number;
  orderLimit: number;
  skuLimit: number;
  productLimit: number;
  lockedFeatures: string[];
}

export interface ActiveSubscription {
  planId: string;
  billingInterval: 'monthly' | 'annually';
  startDate: string;
  nextBillingDate: string;
  status: 'active' | 'cancelled' | 'discounted';
  extraOrders: number;
  extraSkus: number;
  extraProducts: number;
  appliedPromoCodes: string[];
}

export interface BillingHistoryEntry {
  id: string;
  date: string;
  amount: number;
  planName: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceNumber: string;
}

export interface PromoCode {
  code: string;
  type: 'orders' | 'skus' | 'products';
  allowance: number;
  description: string;
  active: boolean;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'bronze_starter',
    name: 'Bronze Starter',
    priceMonthly: 19,
    priceAnnually: 15,
    orderLimit: 100,
    skuLimit: 50,
    productLimit: 50,
    lockedFeatures: ['designer', 'crm', 'emails', 'logs']
  },
  {
    id: 'silver_growth',
    name: 'Silver Growth',
    priceMonthly: 49,
    priceAnnually: 39,
    orderLimit: 500,
    skuLimit: 250,
    productLimit: 250,
    lockedFeatures: ['emails', 'logs']
  },
  {
    id: 'gold_professional',
    name: 'Gold Professional',
    priceMonthly: 129,
    priceAnnually: 99,
    orderLimit: 2000,
    skuLimit: 1000,
    productLimit: 1000,
    lockedFeatures: []
  },
  {
    id: 'enterprise_slate',
    name: 'Enterprise Slate',
    priceMonthly: 399,
    priceAnnually: 319,
    orderLimit: 10000,
    skuLimit: 5000,
    productLimit: 5000,
    lockedFeatures: []
  }
];

const DEFAULT_ACTIVE_SUB: ActiveSubscription = {
  planId: 'silver_growth',
  billingInterval: 'monthly',
  startDate: '2026-06-15',
  nextBillingDate: '2026-07-15',
  status: 'active',
  extraOrders: 0,
  extraSkus: 0,
  extraProducts: 0,
  appliedPromoCodes: []
};

const DEFAULT_PROMO_CODES: PromoCode[] = [
  { code: 'FREEBIE_SKUS', type: 'skus', allowance: 75, description: 'Permanently adds 75 bonus SKU allowances to any plan.', active: true },
  { code: 'SLAM_FREE_100', type: 'orders', allowance: 100, description: 'Provides 100 monthly order allocations.', active: true },
  { code: 'ENTERPRISE_PROMO', type: 'products', allowance: 500, description: 'Grants 500 catalog product spots.', active: true }
];

const DEFAULT_BILLING_HISTORY: BillingHistoryEntry[] = [
  { id: 'tx_001', date: '2026-04-15', amount: 49, planName: 'Silver Growth (Monthly)', status: 'paid', invoiceNumber: 'INV-2026-004' },
  { id: 'tx_002', date: '2026-05-15', amount: 49, planName: 'Silver Growth (Monthly)', status: 'paid', invoiceNumber: 'INV-2026-005' },
  { id: 'tx_003', date: '2026-06-15', amount: 49, planName: 'Silver Growth (Monthly)', status: 'paid', invoiceNumber: 'INV-2026-006' }
];

interface SubscriptionAdminCentreProps {
  currentOrderCount: number;
  currentSkuCount: number;
  currentProductCount: number;
  userRole: 'admin' | 'team_member' | null;
  onRefreshLogs?: () => void;
}

export default function SubscriptionAdminCentre({
  currentOrderCount = 248,
  currentSkuCount = 78,
  currentProductCount = 112,
  userRole = 'admin',
  onRefreshLogs
}: SubscriptionAdminCentreProps) {
  // App States load from storage or fallback defaults
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = localStorage.getItem('sub_plans');
    return saved ? JSON.parse(saved) : DEFAULT_PLANS;
  });

  const [activeSub, setActiveSub] = useState<ActiveSubscription>(() => {
    const saved = localStorage.getItem('sub_active');
    return saved ? JSON.parse(saved) : DEFAULT_ACTIVE_SUB;
  });

  const [promos, setPromos] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('sub_promos');
    return saved ? JSON.parse(saved) : DEFAULT_PROMO_CODES;
  });

  const [billingHistory, setBillingHistory] = useState<BillingHistoryEntry[]>(() => {
    const saved = localStorage.getItem('sub_billing_history');
    return saved ? JSON.parse(saved) : DEFAULT_BILLING_HISTORY;
  });

  // Admin Config Panel States
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editedPriceMonthly, setEditedPriceMonthly] = useState<number>(0);
  const [editedPriceAnnually, setEditedPriceAnnually] = useState<number>(0);
  const [editedOrders, setEditedOrders] = useState<number>(0);
  const [editedSkus, setEditedSkus] = useState<number>(0);
  const [editedProducts, setEditedProducts] = useState<number>(0);
  const [editedLocked, setEditedLocked] = useState<string[]>([]);

  // Promo addition states
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'orders' | 'skus' | 'products'>('skus');
  const [newPromoAllowance, setNewPromoAllowance] = useState(50);
  const [newPromoDesc, setNewPromoDesc] = useState('');

  // User Interactive Promo Apply State
  const [userPromoInput, setUserPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Manual Ledger add state
  const [isAddingHistory, setIsAddingHistory] = useState(false);
  const [newHistoryDate, setNewHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHistoryAmount, setNewHistoryAmount] = useState(49);
  const [newHistoryPlan, setNewHistoryPlan] = useState('Silver Growth (Monthly)');
  const [newHistoryStatus, setNewHistoryStatus] = useState<'paid' | 'pending' | 'failed'>('paid');

  // Cancel Retention States
  const [retentionStep, setRetentionStep] = useState<'none' | 'offer' | 'feedback' | 'confirmed'>('none');
  const [cancelFeedbackReason, setCancelFeedbackReason] = useState('');
  const [cancelFeedbackNotes, setCancelFeedbackNotes] = useState('');

  // Active Billing Modal Simulation
  const [viewInvoice, setViewInvoice] = useState<BillingHistoryEntry | null>(null);

  // Tab view selection
  const [adminTab, setAdminTab] = useState<'customer' | 'admin'>('customer');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sub_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('sub_active', JSON.stringify(activeSub));
    // Dispatch custom event to let other views sync locks dynamically
    window.dispatchEvent(new Event('subscription_updated'));
  }, [activeSub]);

  useEffect(() => {
    localStorage.setItem('sub_promos', JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem('sub_billing_history', JSON.stringify(billingHistory));
  }, [billingHistory]);

  const logToBackend = async (level: 'info' | 'warn' | 'error', message: string) => {
    try {
      await fetch('/api/logs/create_quick_print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'SUB-SYS',
          templateName: message,
          templateType: level.toUpperCase()
        })
      });
      if (onRefreshLogs) onRefreshLogs();
    } catch(e) {}
  };

  // Switch/Update Plan Simulation
  const handleUpgradeDowngrade = (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    const price = activeSub.billingInterval === 'annually' ? selectedPlan.priceAnnually : selectedPlan.priceMonthly;
    const invNo = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    
    // Add charge log
    const newEntry: BillingHistoryEntry = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: price,
      planName: `${selectedPlan.name} (${activeSub.billingInterval === 'annually' ? 'Annual' : 'Monthly'})`,
      status: 'paid',
      invoiceNumber: invNo
    };

    setBillingHistory(prev => [newEntry, ...prev]);
    setActiveSub(prev => ({
      ...prev,
      planId: planId,
      status: 'active', // reset if cancelled or discounted
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    logToBackend('info', `Subscription plan modified to: ${selectedPlan.name}. Allocated: ${selectedPlan.orderLimit} orders, ${selectedPlan.skuLimit} SKUs.`);
    alert(`Successfully switched plan to ${selectedPlan.name}! A dynamic simulated transaction has been logged.`);
  };

  // Toggle Billing Cycle
  const handleToggleInterval = () => {
    const newInterval = activeSub.billingInterval === 'monthly' ? 'annually' : 'monthly';
    setActiveSub(prev => ({ ...prev, billingInterval: newInterval }));
    logToBackend('info', `User swapped billing frequency toggle to [${newInterval.toUpperCase()}].`);
  };

  // Apply Promo Logic
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMessage(null);

    const codeClean = userPromoInput.trim().toUpperCase();
    if (!codeClean) return;

    if (activeSub.appliedPromoCodes.includes(codeClean)) {
      setPromoMessage({ text: 'This promo code has already been applied!', error: true });
      return;
    }

    const matched = promos.find(p => p.code.toUpperCase() === codeClean && p.active);
    if (!matched) {
      setPromoMessage({ text: 'Invalid or expired promo code.', error: true });
      return;
    }

    // Apply allowances
    setActiveSub(prev => {
      const updatedCodes = [...prev.appliedPromoCodes, codeClean];
      let plusOrders = prev.extraOrders;
      let plusSkus = prev.extraSkus;
      let plusProducts = prev.extraProducts;

      if (matched.type === 'orders') plusOrders += matched.allowance;
      if (matched.type === 'skus') plusSkus += matched.allowance;
      if (matched.type === 'products') plusProducts += matched.allowance;

      return {
        ...prev,
        appliedPromoCodes: updatedCodes,
        extraOrders: plusOrders,
        extraSkus: plusSkus,
        extraProducts: plusProducts
      };
    });

    setPromoMessage({ text: `Success! Redeemed promo code. Added +${matched.allowance} limit to ${matched.type}.`, error: false });
    setUserPromoInput('');
    logToBackend('info', `Redeemed promo [${codeClean}]. Added +${matched.allowance} allowance to ${matched.type.toUpperCase()}.`);
  };

  // Save tier edits
  const handleSavePlanEdits = (planId: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          priceMonthly: editedPriceMonthly,
          priceAnnually: editedPriceAnnually,
          orderLimit: editedOrders,
          skuLimit: editedSkus,
          productLimit: editedProducts,
          lockedFeatures: editedLocked
        };
      }
      return p;
    }));
    setEditingPlanId(null);
    logToBackend('warn', `Admin modified subscription tier specs for plan ID: ${planId}`);
  };

  // Start editing a plan
  const handleStartEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setEditedPriceMonthly(plan.priceMonthly);
    setEditedPriceAnnually(plan.priceAnnually);
    setEditedOrders(plan.orderLimit);
    setEditedSkus(plan.skuLimit);
    setEditedProducts(plan.productLimit);
    setEditedLocked(plan.lockedFeatures || []);
  };

  // Create a new custom promo code
  const handleAddPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode) return;

    const promo: PromoCode = {
      code: newPromoCode.trim().toUpperCase(),
      type: newPromoType,
      allowance: newPromoAllowance,
      description: newPromoDesc || `Grants +${newPromoAllowance} allowance to ${newPromoType}`,
      active: true
    };

    setPromos(prev => [...prev, promo]);
    setNewPromoCode('');
    setNewPromoDesc('');
    logToBackend('info', `Admin registered new custom promotion voucher: ${promo.code}`);
  };

  // Toggle active/inactive promo code
  const handleTogglePromoStatus = (code: string) => {
    setPromos(prev => prev.map(p => p.code === code ? { ...p, active: !p.active } : p));
  };

  // Remove promo code
  const handleDeletePromo = (code: string) => {
    setPromos(prev => prev.filter(p => p.code !== code));
  };

  // Manual Billing entries
  const handleAddManualHistory = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: BillingHistoryEntry = {
      id: `tx_${Date.now()}`,
      date: newHistoryDate,
      amount: newHistoryAmount,
      planName: newHistoryPlan,
      status: newHistoryStatus,
      invoiceNumber: `INV-MAN-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setBillingHistory(prev => [entry, ...prev]);
    setIsAddingHistory(false);
    logToBackend('warn', `Admin appended manual billing transaction: ${entry.invoiceNumber} for ${entry.amount} USD`);
  };

  const handleDeleteHistory = (id: string) => {
    setBillingHistory(prev => prev.filter(e => e.id !== id));
  };

  // Retention Action Options
  const handleAcceptRetentionOffer = () => {
    // Loyalty tier gives 50% discount and extra 500 order allowances
    setActiveSub(prev => ({
      ...prev,
      status: 'discounted',
      extraOrders: prev.extraOrders + 500
    }));

    // Add immediate loyalty discount note log
    logToBackend('info', `Retention logic triggered: Subscriber accepted loyalty offer. Retained subscriber at discounted status.`);
    setRetentionStep('none');
    alert('Thank you! Your loyalty discount is applied. Your account is credited with +500 order allowances.');
  };

  const handleProceedCancellationFeedback = () => {
    setRetentionStep('feedback');
  };

  const handleSubmitCancellation = () => {
    setActiveSub(prev => ({
      ...prev,
      status: 'cancelled'
    }));
    logToBackend('warn', `Subscription scheduled for cancellation. Reason: ${cancelFeedbackReason}. Note: ${cancelFeedbackNotes}`);
    setRetentionStep('confirmed');
  };

  // Compute active variables
  const currentPlan = plans.find(p => p.id === activeSub.planId) || plans[0];
  const maxOrders = currentPlan.orderLimit + activeSub.extraOrders;
  const maxSkus = currentPlan.skuLimit + activeSub.extraSkus;
  const maxProducts = currentPlan.productLimit + activeSub.extraProducts;

  const orderPercentage = Math.min(100, (currentOrderCount / maxOrders) * 100);
  const skuPercentage = Math.min(100, (currentSkuCount / maxSkus) * 100);
  const productPercentage = Math.min(100, (currentProductCount / maxProducts) * 100);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-900 text-slate-100" id="subscription-hub-root">
      
      {/* Upper Navigation Header */}
      <div className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-400" />
            <h1 className="text-base font-black uppercase tracking-wider text-white">Subscription Admin Centre</h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Configure system tier ceilings, manage corporate pricing logic, lock modules, and trigger customer retention funnels.
          </p>
        </div>
        
        {/* Toggle between Subscriber View and Admin configuration */}
        <div className="flex gap-1.5 bg-slate-900/80 p-1 border border-slate-800 rounded-xl shrink-0 self-stretch sm:self-auto">
          <button title="Perform action" 
            onClick={() => setAdminTab('customer')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
              adminTab === 'customer' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Subscriber View
          </button>
          
          {userRole === 'admin' ? (
            <button title="Perform action" 
              onClick={() => setAdminTab('admin')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                adminTab === 'admin' 
                  ? 'bg-slate-800 text-indigo-400 border border-indigo-500/20 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Corporate Admin Controls
            </button>
          ) : (
            <div className="text-[10px] text-slate-500 flex items-center px-3" title="Locked to Pankaj (Sellershub Admin)">
              🔒 Admin Restricted
            </div>
          )}
        </div>
      </div>

      {/* Main Panel Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* CUSTOMER/SUBSCRIBER COCKPIT TAB */}
        {adminTab === 'customer' && (
          <div className="space-y-8 max-w-7xl mx-auto">
            
            {/* Subscription active banner status */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl ${
              activeSub.status === 'cancelled' 
                ? 'bg-rose-500/10 border-rose-500/30' 
                : activeSub.status === 'discounted'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-indigo-500/10 border-indigo-500/30'
            }`}>
              {/* Abs grid elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    activeSub.status === 'cancelled'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : activeSub.status === 'discounted'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {activeSub.status === 'cancelled' ? 'Cancellation Scheduled' : activeSub.status === 'discounted' ? 'Premium Loyalty Disc.' : 'Active Subscription'}
                  </span>
                  
                  {activeSub.appliedPromoCodes.length > 0 && (
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                      +{activeSub.appliedPromoCodes.length} Freebies Applied
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Current Plan:</span>
                  <span className="text-indigo-400">{currentPlan.name}</span>
                </h2>
                
                <p className="text-xs text-slate-300 max-w-xl">
                  Your billing period is recurring on a <span className="font-bold underline text-white">{activeSub.billingInterval}</span> cycle. Next charge will occur on <span className="font-bold text-white">{activeSub.nextBillingDate}</span> for <span className="text-indigo-300 font-extrabold">{formatCurrency(activeSub.billingInterval === 'annually' ? currentPlan.priceAnnually : currentPlan.priceMonthly)}</span>.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2.5 relative z-10">
                <button title="Execute ToggleInterval"
                  onClick={handleToggleInterval}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 rounded-xl transition-all"
                >
                  Switch to {activeSub.billingInterval === 'monthly' ? 'Annual (Save 20%)' : 'Monthly Cycle'}
                </button>
                
                {activeSub.status !== 'cancelled' ? (
                  <button title="Cancel and close" 
                    onClick={() => setRetentionStep('offer')}
                    className="px-4 py-2 text-xs font-black text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 rounded-xl transition-all"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <button title="Cancel and close" 
                    onClick={() => {
                      setActiveSub(prev => ({ ...prev, status: 'active' }));
                      logToBackend('info', 'Subscriber revoked cancellation request, restoring active status.');
                      alert('Your subscription has been successfully restored to active status!');
                    }}
                    className="px-4 py-2 text-xs font-black text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 rounded-xl transition-all"
                  >
                    Keep My Subscription
                  </button>
                )}
              </div>
            </div>

            {/* Logical limits meters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. Orders processing limits card */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Orders Usage</span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {currentOrderCount} <span className="text-slate-500 text-xs font-medium">/ {maxOrders} limit</span>
                    </h3>
                  </div>
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 text-xs font-bold">
                    {activeSub.extraOrders > 0 ? `+${activeSub.extraOrders} freebies` : 'Standard'}
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        orderPercentage > 90 ? 'bg-rose-500' : orderPercentage > 75 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${orderPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>{orderPercentage.toFixed(0)}% Consumed</span>
                    <span>{maxOrders - currentOrderCount} Orders Left</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Every sales channel import consumes order limits. Upgrade your tier to handle expanding bulk thermal print queues.
                </p>
              </div>

              {/* 2. SKU Catalog Limit Card */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Active SKU Limits</span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {currentSkuCount} <span className="text-slate-500 text-xs font-medium">/ {maxSkus} limit</span>
                    </h3>
                  </div>
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 text-xs font-bold">
                    {activeSub.extraSkus > 0 ? `+${activeSub.extraSkus} freebies` : 'Standard'}
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        skuPercentage > 90 ? 'bg-rose-500' : skuPercentage > 75 ? 'bg-amber-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${skuPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>{skuPercentage.toFixed(0)}% Consumed</span>
                    <span>{maxSkus - currentSkuCount} SKUs Available</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Total SKU mapped rule configurations. Add promotional code <strong>FREEBIE_SKUS</strong> to extend allowances!
                </p>
              </div>

              {/* 3. Products Database Limit Card */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Catalog Storage</span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {currentProductCount} <span className="text-slate-500 text-xs font-medium">/ {maxProducts} limit</span>
                    </h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-bold">
                    {activeSub.extraProducts > 0 ? `+${activeSub.extraProducts} freebies` : 'Standard'}
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        productPercentage > 90 ? 'bg-rose-500' : productPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${productPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>{productPercentage.toFixed(0)}% Consumed</span>
                    <span>{maxProducts - currentProductCount} Spots Left</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Total physical product items registered in inventory catalog. Limit extends with scale-up tier plans.
                </p>
              </div>

            </div>

            {/* Dynamic Interactive Tier Selector / Pricing Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Available Subscription Levels</h3>
                  <p className="text-xs text-slate-400">Compare allowances and seamlessly adjust subscription limits below.</p>
                </div>
                <div className="text-xs text-indigo-400 font-mono bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
                  {activeSub.billingInterval === 'annually' ? 'Showing Annual Pricing (20% Savings applied)' : 'Showing Monthly Cycle rates'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {plans.map((p) => {
                  const isCurrent = activeSub.planId === p.id;
                  const price = activeSub.billingInterval === 'annually' ? p.priceAnnually : p.priceMonthly;
                  const savings = p.priceMonthly - p.priceAnnually;

                  return (
                    <div 
                      key={p.id} 
                      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
                        isCurrent 
                          ? 'bg-slate-950 border-indigo-500/60 shadow-indigo-500/10 ring-2 ring-indigo-500/20 scale-[1.01]' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      {/* Popular / Active absolute tag */}
                      {isCurrent && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md">
                          My Plan
                        </div>
                      )}

                      <div className="p-6 space-y-6">
                        <div>
                          <h4 className="text-sm font-black text-white">{p.name}</h4>
                          <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-black text-white">{formatCurrency(price)}</span>
                            <span className="text-slate-500 text-xs">/mo</span>
                          </div>
                          {activeSub.billingInterval === 'annually' && savings > 0 && (
                            <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                              Save {formatCurrency(savings * 12)} / year
                            </span>
                          )}
                        </div>

                        {/* List of structural limits */}
                        <div className="space-y-3.5 border-t border-slate-800/80 pt-4 text-xs">
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-400">Order Allowance</span>
                            <span className="font-extrabold text-white">{p.orderLimit.toLocaleString()} / mo</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-400">SKU Limit</span>
                            <span className="font-extrabold text-white">{p.skuLimit.toLocaleString()} SKUs</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-400">Product Limit</span>
                            <span className="font-extrabold text-white">{p.productLimit.toLocaleString()} Products</span>
                          </div>
                        </div>

                        {/* Feature Lock Summary */}
                        <div className="border-t border-slate-800/80 pt-4 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Features Included</span>
                          <div className="space-y-1.5 text-[11px]">
                            {['designer', 'crm', 'emails', 'logs'].map((feature) => {
                              const isLocked = p.lockedFeatures?.includes(feature);
                              const labelMap: Record<string, string> = {
                                designer: 'Template Designer',
                                crm: 'CRM Customers',
                                emails: 'Email Templates',
                                logs: 'API logs'
                              };
                              return (
                                <div key={feature} className="flex items-center gap-2 text-slate-300">
                                  {isLocked ? (
                                    <>
                                      <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span className="line-through text-slate-600">{labelMap[feature]}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span className="text-slate-300 font-medium">{labelMap[feature]}</span>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Upgrade/Select Action */}
                      <div className="p-4 bg-slate-950 border-t border-slate-900 shrink-0">
                        {isCurrent ? (
                          <div className="w-full text-center py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-black rounded-xl">
                            Active Package
                          </div>
                        ) : (
                          <button title="Perform action" 
                            onClick={() => handleUpgradeDowngrade(p.id)}
                            className="w-full text-center py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                          >
                            Select Plan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Panel: Voucher Promo Application & Simulated payment cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Promo redeem Panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Redeem Extendable Freebies</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Redeem promotional voucher codes generated by administrators to instantly add free limits to your current tier.
                </p>

                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={userPromoInput}
                    onChange={(e) => setUserPromoInput(e.target.value)}
                    placeholder="Enter Code (e.g. FREEBIE_SKUS)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                  />
                  <button title="Submit form" 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md shrink-0"
                  >
                    Apply Perks
                  </button>
                </form>

                {promoMessage && (
                  <div className={`mt-3 p-3 rounded-xl border text-xs font-semibold ${
                    promoMessage.error 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {promoMessage.text}
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Currently Redeemed Vouchers</span>
                  {activeSub.appliedPromoCodes.length === 0 ? (
                    <span className="text-xs text-slate-500 italic block">No active vouchers applied yet. Try redeeming "FREEBIE_SKUS" to get started!</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeSub.appliedPromoCodes.map((code) => (
                        <span key={code} className="bg-slate-900 text-slate-200 border border-slate-800 text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg">
                          🎁 {code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Simulated Card Billing Panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Payment Simulation Method</h3>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Authorized payment instrument used for recurring monthly subscription bills.
                  </p>

                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-indigo-600 rounded flex items-center justify-center font-extrabold text-[10px] text-white tracking-widest shadow">
                        VISA
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">Sellershub Solutions</span>
                        <span className="text-[10px] font-mono text-slate-400">•••• •••• •••• 8821</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-slate-500 block">Expires</span>
                      <span className="text-[10px] font-mono font-bold text-white">09/2028</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button title="Perform action" 
                    onClick={() => {
                      // Simulate card update
                      alert('Simulated Card Details: In a real environment, this opens the Stripe Customer Portal elements integration securely.');
                    }}
                    className="flex-1 text-center py-2.5 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Update Payment Method
                  </button>
                  <button title="Perform action" 
                    onClick={() => {
                      // Trigger Instant recurring payment renewal
                      const nextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      const price = activeSub.billingInterval === 'annually' ? currentPlan.priceAnnually : currentPlan.priceMonthly;
                      
                      const newBill: BillingHistoryEntry = {
                        id: `tx_${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        amount: price,
                        planName: `${currentPlan.name} (${activeSub.billingInterval === 'annually' ? 'Annual' : 'Monthly'})`,
                        status: 'paid',
                        invoiceNumber: `INV-AUTO-${Math.floor(1000 + Math.random() * 9000)}`
                      };

                      setBillingHistory(prev => [newBill, ...prev]);
                      setActiveSub(prev => ({
                        ...prev,
                        nextBillingDate: nextDate
                      }));

                      logToBackend('info', `Simulated instant manual billing renewal completed successfully. Ledger ID: ${newBill.invoiceNumber}`);
                      alert(`Simulation Triggered! Instantly processed payment of ${formatCurrency(price)}. Next invoice generated.`);
                    }}
                    className="flex-1 text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow cursor-pointer"
                  >
                    Simulate Next Payment Now
                  </button>
                </div>
              </div>

            </div>

            {/* BILLING HISTORY ARCHIVE LEDGER */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Billing & Recurring Invoice Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Historical monthly payments processed. Download receipts or generate manual ledger reports.</p>
                </div>
                
                {userRole === 'admin' && (
                  <button title="Add new item" 
                    onClick={() => setIsAddingHistory(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-indigo-500/10 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Manual Invoice
                  </button>
                )}
              </div>

              {/* Add manual transaction form */}
              {isAddingHistory && (
                <form onSubmit={handleAddManualHistory} className="mb-6 p-4 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Billing Date</label>
                    <input
                      type="date"
                      value={newHistoryDate}
                      onChange={(e) => setNewHistoryDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Amount (USD)</label>
                    <input
                      type="number"
                      value={newHistoryAmount}
                      onChange={(e) => setNewHistoryAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Plan Name Description</label>
                    <input
                      type="text"
                      value={newHistoryPlan}
                      onChange={(e) => setNewHistoryPlan(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Status</label>
                    <div className="flex gap-2">
                      <select
                        value={newHistoryStatus}
                        onChange={(e) => setNewHistoryStatus(e.target.value as any)}
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                      <button title="Submit form" 
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-lg hover:bg-emerald-500"
                      >
                        Add
                      </button>
                      <button title="Cancel and close" 
                        type="button"
                        onClick={() => setIsAddingHistory(false)}
                        className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Transactions List */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-2">
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Billing Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Paid Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Receipt Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {billingHistory.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-900/40 text-slate-300">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{e.invoiceNumber}</td>
                        <td className="py-3.5 px-4">{e.date}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-200">{e.planName}</td>
                        <td className="py-3.5 px-4 font-bold text-white font-mono">{formatCurrency(e.amount)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            e.status === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : e.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {e.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button 
                            onClick={() => setViewInvoice(e)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded transition-all inline-flex items-center gap-1 text-[11px]"
                            title="View / Print Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                          
                          {userRole === 'admin' && (
                            <button 
                              onClick={() => handleDeleteHistory(e.id)}
                              className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-all"
                              title="Delete Transaction Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* CORPORATE CORPORATE ADMIN CONTROLS DECK */}
        {adminTab === 'admin' && userRole === 'admin' && (
          <div className="space-y-8 max-w-7xl mx-auto">
            
            {/* Upper Admin Alert Info */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold text-white uppercase block mb-0.5">Corporate Admin Space</span>
                <span className="text-slate-300">
                  You are editing global settings stored dynamically in the Sellershub local state database. Edits instantly impact pricing configurations, features blocked, and extendable promotional parameters for subscribers. Use caution.
                </span>
              </div>
            </div>

            {/* 1. Feature lock manager panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">existing feature lock rules</h3>
              <p className="text-xs text-slate-400 mb-5">
                Map existing core system features and tabs to specific subscription levels. Toggling checks under a tier locks the module from users currently assigned to that tier or below.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {plans.map((p) => (
                  <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">Subscription Tier</span>
                      <span className="text-xs font-extrabold text-white">{p.name}</span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Blocked Modules</span>
                      
                      {[
                        { id: 'designer', label: 'Template Designer' },
                        { id: 'crm', label: 'CRM & Customers' },
                        { id: 'emails', label: 'Email Notifications' },
                        { id: 'logs', label: "API's Logs" }
                      ].map((feature) => {
                        const isBlocked = p.lockedFeatures?.includes(feature.id);
                        return (
                          <label key={feature.id} className="flex items-center gap-2.5 text-xs text-slate-300 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isBlocked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setPlans(prev => prev.map(item => {
                                  if (item.id === p.id) {
                                    const currentLocked = item.lockedFeatures || [];
                                    const nextLocked = checked 
                                      ? [...currentLocked, feature.id]
                                      : currentLocked.filter(f => f !== feature.id);
                                    return { ...item, lockedFeatures: nextLocked };
                                  }
                                  return item;
                                }));
                                logToBackend('warn', `Admin mapped block rule: feature [${feature.id}] status set to ${checked} on plan [${p.name}]`);
                              }}
                              className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                            />
                            <span className={isBlocked ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              {feature.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Global Plan Tier Limits Editor */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">global tier packages & logic ceilings</h3>
              <p className="text-xs text-slate-400 mb-5">
                Customize structural billing configurations, pricing formulas, and physical allowance limits.
              </p>

              <div className="space-y-4">
                {plans.map((p) => {
                  const isEditing = editingPlanId === p.id;
                  return (
                    <div key={p.id} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 transition-all">
                      {isEditing ? (
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 items-end">
                          <div className="col-span-2 sm:col-span-1">
                            <span className="block text-[10px] font-black uppercase text-indigo-400 tracking-wider mb-1">Editing Plan</span>
                            <span className="text-xs font-black text-white">{p.name}</span>
                          </div>
                          
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Price ($)</label>
                            <input
                              type="number"
                              value={editedPriceMonthly}
                              onChange={(e) => setEditedPriceMonthly(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-1.5 focus:outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Annual Price ($/mo)</label>
                            <input
                              type="number"
                              value={editedPriceAnnually}
                              onChange={(e) => setEditedPriceAnnually(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-1.5 focus:outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Limit</label>
                            <input
                              type="number"
                              value={editedOrders}
                              onChange={(e) => setEditedOrders(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-1.5 focus:outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SKU limit</label>
                            <input
                              type="number"
                              value={editedSkus}
                              onChange={(e) => setEditedSkus(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-1.5 focus:outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button title="Edit item" 
                              type="button"
                              onClick={() => handleSavePlanEdits(p.id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2 rounded transition-all cursor-pointer"
                            >
                              Save
                            </button>
                            <button title="Edit item" 
                              type="button"
                              onClick={() => setEditingPlanId(null)}
                              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black py-2 rounded transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white">{p.name}</span>
                              <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15">
                                Monthly: ${p.priceMonthly} &bull; Annual: ${p.priceAnnually}/mo
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-x-4">
                              <span>Orders Cap: <strong className="text-slate-200">{p.orderLimit.toLocaleString()}</strong></span>
                              <span>SKU Cap: <strong className="text-slate-200">{p.skuLimit.toLocaleString()}</strong></span>
                              <span>Product Cap: <strong className="text-slate-200">{p.productLimit.toLocaleString()}</strong></span>
                            </div>
                          </div>
                          
                          <button title="Edit item" 
                            type="button"
                            onClick={() => handleStartEditPlan(p)}
                            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all"
                          >
                            Edit Pricing & Specs
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Freebies Promo Code Configurator */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">promotions & extendable freebies repository</h3>
              <p className="text-xs text-slate-400 mb-5">
                Generate dynamic promo codes that allow customers to extend tier thresholds free of charge. Set custom allowance limits.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Promo Code creation form */}
                <form onSubmit={handleAddPromoCode} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block border-b border-slate-800 pb-1.5">Generate Promo Voucher</span>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Promo Code</label>
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      placeholder="e.g. EXTRA_500_ORDERS"
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 focus:outline-none focus:border-indigo-500 font-mono placeholder-slate-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Bonus Type</label>
                      <select
                        value={newPromoType}
                        onChange={(e) => setNewPromoType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="orders">Orders allowance</option>
                        <option value="skus">SKUs capacity</option>
                        <option value="products">Products limit</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Allowance Value</label>
                      <input
                        type="number"
                        value={newPromoAllowance}
                        onChange={(e) => setNewPromoAllowance(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Internal Description</label>
                    <textarea
                      rows={2}
                      value={newPromoDesc}
                      onChange={(e) => setNewPromoDesc(e.target.value)}
                      placeholder="Specify voucher purpose"
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                    />
                  </div>

                  <button title="Submit form" 
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg transition-all shadow cursor-pointer"
                  >
                    Add Active Voucher
                  </button>
                </form>

                {/* Promos table listing */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block border-b border-slate-800 pb-1.5 mb-3">Vouchers database</span>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="text-slate-500 font-bold pb-2 border-b border-slate-800 uppercase tracking-widest text-[9px]">
                          <th className="py-2 px-1">Code</th>
                          <th className="py-2 px-1">Effect Type</th>
                          <th className="py-2 px-1">Bonus Allowance</th>
                          <th className="py-2 px-1">Voucher Description</th>
                          <th className="py-2 px-1">Status</th>
                          <th className="py-2 px-1 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {promos.map((p) => (
                          <tr key={p.code} className="hover:bg-slate-950/40 text-slate-300">
                            <td className="py-2 px-1 font-bold text-white">{p.code}</td>
                            <td className="py-2 px-1 text-indigo-300 font-bold uppercase">{p.type}</td>
                            <td className="py-2 px-1 text-emerald-400 font-bold">+{p.allowance.toLocaleString()}</td>
                            <td className="py-2 px-1 font-sans text-slate-400 text-[10px]">{p.description}</td>
                            <td className="py-2 px-1">
                              <button title="Perform action" 
                                type="button"
                                onClick={() => handleTogglePromoStatus(p.code)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  p.active 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {p.active ? 'Active' : 'Disabled'}
                              </button>
                            </td>
                            <td className="py-2 px-1 text-right">
                              <button title="Perform action" 
                                type="button"
                                onClick={() => handleDeletePromo(p.code)}
                                className="text-slate-600 hover:text-rose-400 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* RETAINER RETENTION STEP MODAL/OVERLAY */}
      {retentionStep !== 'none' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative overflow-hidden text-white flex flex-col space-y-6">
            
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* STEP 1: RETAIN OFFER DECK */}
            {retentionStep === 'offer' && (
              <div className="space-y-6 text-center">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                  <Award className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Wait Pankaj, We value your partnership!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    We noticed you processed <strong className="text-white">{currentOrderCount} orders</strong> this period. Sellershub Logistics has automated complex SP-API channels on your behalf.
                  </p>
                </div>

                {/* Offer visual box */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 text-left space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-spin" />
                    <span className="text-xs font-black uppercase text-indigo-300 tracking-wider">Exclusive Loyalty Perk Offer</span>
                  </div>
                  <h4 className="text-sm font-black text-white leading-snug">
                    Accept 50% pricing reduction on Silver Growth for 3 months AND receive +500 order allowances immediately!
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Cancel anytime later. Your settings, catalog mappings, and templates remain intact. Keep shipping at high speed!
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button title="Execute AcceptRetentionOffer"
                    onClick={handleAcceptRetentionOffer}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow"
                  >
                    Accept Loyalty Perk (50% Off & +500 limit)
                  </button>
                  <button title="Execute ProceedCancellationFeedback"
                    onClick={handleProceedCancellationFeedback}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    No thanks, proceed to cancel
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CANCELLATION QUESTIONNAIRE */}
            {retentionStep === 'feedback' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Help Us Improve, Pankaj</h3>
                  <p className="text-xs text-slate-400">Let us know why you are considering scheduling a subscription downgrade.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Primary reason</label>
                    <select
                      value={cancelFeedbackReason}
                      onChange={(e) => setCancelFeedbackReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Choose Option --</option>
                      <option value="pricing">Too expensive / Pricing model</option>
                      <option value="missing_features">Missing important features</option>
                      <option value="switched_tool">Moved to a competing logistics solution</option>
                      <option value="complexity">Too complex / Difficult setup flow</option>
                      <option value="temporary">Temporary store shutdown</option>
                      <option value="other">Other reason</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">What can we do to win you back? (Optional)</label>
                    <textarea
                      rows={3}
                      value={cancelFeedbackNotes}
                      onChange={(e) => setCancelFeedbackNotes(e.target.value)}
                      placeholder="Your honest feedback is critical..."
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button title="Execute SubmitCancellation"
                    onClick={handleSubmitCancellation}
                    disabled={!cancelFeedbackReason}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      cancelFeedbackReason 
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    Confirm Downgrade/Cancellation
                  </button>
                  <button title="Cancel and close" 
                    onClick={() => setRetentionStep('none')}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel & Keep Subscription
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRMED */}
            {retentionStep === 'confirmed' && (
              <div className="space-y-6 text-center">
                <div className="w-14 h-14 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto">
                  <Frown className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Subscription Cancelled</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your Silver Growth subscription has been scheduled for downgrade. You will have full premium capabilities until <strong className="text-white">{activeSub.nextBillingDate}</strong>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 text-left">
                  We have registered your feedback under category: <strong className="text-white">{cancelFeedbackReason}</strong>. If you ever change your mind, restoring your service is just one click away.
                </div>

                <button title="Perform action" 
                  onClick={() => setRetentionStep('none')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow"
                >
                  Dismiss Spooler
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIRTUAL INVOICE RECEIPT MOCKUP DIALOG */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white text-slate-950 rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-slate-200 overflow-hidden flex flex-col justify-between max-h-[85vh]">
            
            {/* Print Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-black text-slate-900 tracking-tight">SELLERSHUB LOGISTICS HOLDINGS</h4>
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Silicon Valley HQ &bull; San Jose, CA</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold block text-slate-700">INVOICE RECEIPT</span>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{viewInvoice.invoiceNumber}</span>
              </div>
            </div>

            {/* Invoice fields */}
            <div className="py-6 space-y-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Customer</span>
                  <span className="font-bold text-slate-800">Pankaj (Sellershub Admin)</span>
                  <span className="text-slate-500 block mt-0.5">pankaj@sellershub.co.uk</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Billing Date</span>
                  <span className="font-bold text-slate-800 font-mono">{viewInvoice.date}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 px-4 py-2 font-black text-slate-600 border-b border-slate-100 grid grid-cols-12 gap-1 text-[10px] uppercase">
                  <span className="col-span-8">Billing Particulars</span>
                  <span className="col-span-4 text-right">Amount</span>
                </div>
                <div className="p-4 grid grid-cols-12 gap-1 font-semibold text-slate-800">
                  <div className="col-span-8">
                    <span>Recurring Subscription Item: </span>
                    <span className="font-extrabold text-slate-900">{viewInvoice.planName}</span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Multi-Channel automated orders, advanced routing tools, dynamic print queues.</p>
                  </div>
                  <div className="col-span-4 text-right font-mono text-slate-900">
                    {formatCurrency(viewInvoice.amount)}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Amount</span>
                  <span>{formatCurrency(viewInvoice.amount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>VAT / Local Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-100 pt-2">
                  <span>Total Paid USD</span>
                  <span>{formatCurrency(viewInvoice.amount)}</span>
                </div>
              </div>

              <div className="text-center bg-slate-50 rounded-xl p-3 text-[10.5px] text-slate-500 leading-normal">
                This is a virtual transaction ledger document generated for multi-channel shipping verification. Paid via Visa card ending in 8821.
              </div>
            </div>

            {/* Actions footer */}
            <div className="border-t border-slate-100 pt-4 flex gap-2">
              <button title="Perform action" 
                type="button"
                onClick={() => setViewInvoice(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl transition-all"
              >
                Dismiss Receipt
              </button>
              <button title="Print document" 
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                Trigger Hardware Print
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
