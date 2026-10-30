import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ExternalLink, 
  Terminal, 
  Database, 
  Cpu, 
  Zap, 
  Lock, 
  Building, 
  Key, 
  SlidersHorizontal,
  LayoutGrid,
  CheckCircle2
} from 'lucide-react';

export default function SuperAdminControlView() {
  const [liveUrl, setLiveUrl] = useState('');

  useEffect(() => {
    // Generate the exact standalone URL
    const standaloneUrl = window.location.origin + '?app=superadmin';
    setLiveUrl(standaloneUrl);
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-slate-950 text-slate-100 min-h-full overflow-y-auto" id="super-admin-portal-launcher">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[150px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-8">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" /> Isolated Platform Sub-App
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2.5">
            Sellershub Super Admin Portal
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Super Administrator Terminal has been detached from the normal merchant subscriber bundle. It now operates as a high-performance standalone application isolated on a dedicated management subdomain path.
          </p>
        </div>

        {/* Browser URL Simulation Widget */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Isolated Sub-App Address</span>
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex items-center gap-3 font-mono text-[11px] text-slate-300">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>
            <div className="h-4 w-[1px] bg-slate-800 shrink-0" />
            <span className="text-emerald-500 shrink-0 select-none">https://</span>
            <span className="truncate select-all text-slate-300">{window.location.host}/?app=superadmin</span>
            <span className="ml-auto bg-slate-900 text-[9px] font-bold text-slate-500 px-2 py-0.5 rounded border border-slate-800 select-none">SSL SECURE</span>
          </div>
        </div>

        {/* Standalone Boards Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex gap-3 items-start">
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11.5px] font-black text-white block">Tenant Isolation Shards</span>
              <p className="text-[10px] text-slate-400 leading-normal">Onboard multi-channel subscribers, allocate isolated PostgreSQL databases, and monitor company capacities.</p>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex gap-3 items-start">
            <div className="bg-pink-500/10 text-pink-400 p-2 rounded-xl shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11.5px] font-black text-white block">OAuth Credential Hub</span>
              <p className="text-[10px] text-slate-400 leading-normal">Authorize third-party developer integrations for Sage ledger webhooks, QuickBooks scopes, and Xero syncers.</p>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex gap-3 items-start">
            <div className="bg-cyan-500/10 text-cyan-400 p-2 rounded-xl shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11.5px] font-black text-white block">Backend Simulator Sandbox</span>
              <p className="text-[10px] text-slate-400 leading-normal">Test real JSON handshake endpoints, check latency thresholds, and simulate physical warehouse barcode routes.</p>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex gap-3 items-start">
            <div className="bg-purple-500/10 text-purple-400 p-2 rounded-xl shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11.5px] font-black text-white block">Global Policy Lockdowns</span>
              <p className="text-[10px] text-slate-400 leading-normal">Instantly toggle platform-wide firewalls, default rate limits, and isolated backup cycles.</p>
            </div>
          </div>

        </div>

        {/* Large Action CTA Button */}
        <div className="pt-2 text-center">
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98]"
          >
            Launch Standalone Admin Portal <ExternalLink className="w-4 h-4 stroke-[2.5]" />
          </a>
          <span className="text-[10px] text-slate-500 block mt-3 font-mono">Bypasses customer cookies and launches fully optimized separate thread application</span>
        </div>

      </div>
    </div>
  );
}
