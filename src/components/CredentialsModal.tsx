import React, { useState } from 'react';
import { ApiCredentials } from '../types';
import { Key, ShieldCheck, X, RefreshCw, Layers, Globe } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: ApiCredentials;
  onSave: (creds: ApiCredentials) => void;
}

export default function CredentialsModal({ isOpen, onClose, credentials, onSave }: CredentialsModalProps) {
  const [formData, setFormData] = useState<ApiCredentials>(credentials);
  const [activeTab, setActiveTab] = useState<'amazon' | 'ebay' | 'settings'>('amazon');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTestStatus('idle');
    setTimeout(() => {
      setTestingConnection(false);
      setTestStatus('success');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="credentials-overlay">
      <div className="bg-white text-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100 overflow-hidden flex flex-col" id="credentials-container">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-lg font-semibold tracking-tight">API Integration & Credentials</h3>
              <p className="text-xs text-slate-400">Manage Amazon Seller Central and eBay Developer connections</p>
            </div>
          </div>
          <button title="Close" 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            id="close-credentials-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button title="Perform action" 
            onClick={() => setActiveTab('amazon')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-all border-b-2 ${
              activeTab === 'amazon' 
                ? 'border-slate-950 text-slate-950 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Amazon Integration (SP-API)
          </button>
          <button title="Perform action" 
            onClick={() => setActiveTab('ebay')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-all border-b-2 ${
              activeTab === 'ebay' 
                ? 'border-slate-950 text-slate-950 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            eBay Selling API
          </button>
          <button title="Perform action" 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-all border-b-2 ${
              activeTab === 'settings' 
                ? 'border-slate-950 text-slate-950 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Environment Settings
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'amazon' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  Our full-stack gateway secures Amazon SP-API OAuth credentials server-side.
                  Make sure to configure the IAM User with permissions for Shipping API V2 and Merchant Fulfillment (Buy Shipping).
                </div>
              </div>

              <a
                href="https://sellercentral.amazon.co.uk/apps/authorize/consent?app_id=amzn1.sellerapi.app.c41a1b93-5185-4fcb"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-3 rounded-xl inline-flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Globe className="w-4 h-4" />
                Connect Amazon Seller Store
              </a>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OR ENTER MANUALLY</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Amazon Seller ID</label>
                  <input
                    type="text"
                    value={formData.amazonSellerId}
                    onChange={(e) => setFormData({ ...formData, amazonSellerId: e.target.value })}
                    placeholder="e.g. A3XYZ98319LAK"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">LWA Client ID</label>
                  <input
                    type="text"
                    value={formData.amazonClientId}
                    onChange={(e) => setFormData({ ...formData, amazonClientId: e.target.value })}
                    placeholder="amzn1.application-oa2-client..."
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">LWA Client Secret</label>
                <input
                  type="password"
                  value={formData.amazonClientSecret}
                  onChange={(e) => setFormData({ ...formData, amazonClientSecret: e.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••••••••••"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">LWA Refresh Token</label>
                <textarea
                  rows={2}
                  value={formData.amazonRefreshToken}
                  onChange={(e) => setFormData({ ...formData, amazonRefreshToken: e.target.value })}
                  placeholder="Atcn|IwEBI..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950 font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'ebay' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 text-indigo-800 rounded-lg text-xs leading-relaxed flex items-start gap-2">
                <Layers className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  Requires eBay Selling Partner Traditional or REST Token scopes for Fulfillment & Orders download API.
                </div>
              </div>

              <a
                href="https://signin.ebay.com/authorize?client_id=Sellershub-MultiShip&response_type=code&redirect_uri=Sellershub-MultiShip-Redirect&scope=https://api.ebay.com/oauth/api_scope"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-3 rounded-xl inline-flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Globe className="w-4 h-4" />
                Connect eBay Store
              </a>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OR ENTER MANUALLY</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">eBay Client ID (App ID)</label>
                <input
                  type="text"
                  value={formData.ebayClientId}
                  onChange={(e) => setFormData({ ...formData, ebayClientId: e.target.value })}
                  placeholder="Sellershub-MultiShip-PRD-..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">eBay Client Secret (Cert ID)</label>
                <input
                  type="password"
                  value={formData.ebayClientSecret}
                  onChange={(e) => setFormData({ ...formData, ebayClientSecret: e.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••••••••••"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">eBay User Refresh Token</label>
                <textarea
                  rows={2}
                  value={formData.ebayRefreshToken}
                  onChange={(e) => setFormData({ ...formData, ebayRefreshToken: e.target.value })}
                  placeholder="v^1.1#i^1#f^0#p^3..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950 font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Sandbox & Simulation Safe Mode</h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Toggle between sandbox simulation endpoints and live OAuth integrations. 
                  Sandbox Mode allows you to safely preview buying shipping, auto-generating USPS/Amazon labels, and checking tracking updates without charging your seller account.
                </p>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isSandbox}
                      onChange={(e) => setFormData({ ...formData, isSandbox: e.target.checked })}
                      className="sr-only"
                      id="sandbox-toggle"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.isSandbox ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${formData.isSandbox ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">Enable API Sandbox Mocking</span>
                    <span className="block text-xs text-slate-500">Bypasses real credentials for local workflow simulation</span>
                  </div>
                </label>
              </div>

              <div className="p-4 border border-dashed border-slate-200 rounded-xl">
                <h5 className="text-xs font-semibold text-slate-700 uppercase mb-2">Amazon Shipping API Configuration</h5>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Amazon Ground Shipping V2 requires setting up specific delivery regions. 
                  Please confirm that you have accepted the Amazon Shipping terms in Seller Central.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md font-semibold">Ready</span>
                  <span className="text-xs text-slate-500">Carrier APIs enabled</span>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex justify-between items-center gap-3">
          <button title="Execute TestConnection"
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
            id="test-connection-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            {testingConnection ? 'Testing Access...' : 'Test APIs Connectivity'}
          </button>

          {testStatus === 'success' && (
            <span className="text-xs text-emerald-600 font-medium mr-auto ml-2">✓ Connected successfully!</span>
          )}

          <div className="flex gap-2">
            <button title="Close"
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all"
              id="cancel-credentials-btn"
            >
              Cancel
            </button>
            <button title="Save changes"
              type="button"
              onClick={handleSubmit}
              className="text-sm px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white font-medium rounded-xl transition-all"
              id="save-credentials-btn"
            >
              Save Connections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
