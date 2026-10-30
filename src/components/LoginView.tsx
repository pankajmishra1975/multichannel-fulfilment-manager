import React, { useState } from 'react';
import { Shield, Users, Key, Loader2, Info, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (role: 'admin' | 'team_member', userName: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'team_member'>('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gdprAccepted, setGdprAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!gdprAccepted) {
      setErrorMsg('You must review and accept the Cookie Policy and GDPR Terms to proceed.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (selectedRole === 'admin') {
        if (password === 'admin') {
          onLoginSuccess('admin', 'Pankaj (Sellershub Admin)');
        } else {
          setErrorMsg('Invalid Administrator access credentials.');
          setLoading(false);
        }
      } else if ((selectedRole as any) === 'super_admin') {
        if (password === 'superadmin') {
          onLoginSuccess('super_admin' as any, 'Sellershub Super Admin');
        } else {
          setErrorMsg('Invalid Super Administrator credentials.');
          setLoading(false);
        }
      } else {
        if (password === 'team') {
          onLoginSuccess('team_member', 'Warehouse Operations Team');
        } else {
          setErrorMsg('Invalid Team Member access PIN/credentials.');
          setLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden" id="login-screen-view">
      {/* Abstract beautiful backdrop lights */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6 relative z-10 animate-fade-in">
        
        {/* Logo and Titles */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-teal-400 p-3 rounded-2xl shadow-lg shadow-emerald-500/10">
            <Shield className="w-8 h-8 text-slate-950 stroke-[2.2]" />
          </div>
          <h2 className="text-lg font-black tracking-wider text-white uppercase">
            Sellershub Gateway Secure Portal
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized multi-channel dispatch & logistics terminal credentials check.
          </p>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold text-center animate-pulse">
            {errorMsg}
          </div>
        )}

        {/* Role Toggle Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
          <button title="Perform action" 
            type="button"
            onClick={() => {
              setSelectedRole('admin');
              setPassword('');
              setErrorMsg(null);
            }}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-slate-800 text-white shadow font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${selectedRole === 'admin' ? 'text-emerald-400' : ''}`} />
            <span className="text-[9px] uppercase tracking-wider text-center">Main Admin</span>
          </button>
          <button title="Perform action" 
            type="button"
            onClick={() => {
              setSelectedRole('team_member');
              setPassword('');
              setErrorMsg(null);
            }}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              selectedRole === 'team_member'
                ? 'bg-slate-800 text-white shadow font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${selectedRole === 'team_member' ? 'text-emerald-400' : ''}`} />
            <span className="text-[9px] uppercase tracking-wider text-center">Team Pass</span>
          </button>
          <button title="Perform action" 
            type="button"
            onClick={() => {
              setSelectedRole('super_admin' as any);
              setPassword('');
              setErrorMsg(null);
            }}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              (selectedRole as any) === 'super_admin'
                ? 'bg-slate-800 text-white shadow font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${(selectedRole as any) === 'super_admin' ? 'text-indigo-400' : ''}`} />
            <span className="text-[9px] uppercase tracking-wider text-center">Super Admin</span>
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              {selectedRole === 'admin' ? 'Administrator Password' : (selectedRole as any) === 'super_admin' ? 'Super Admin Security Key' : 'Team Member Security PIN / Pass'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-500">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={selectedRole === 'admin' ? 'Enter admin password' : (selectedRole as any) === 'super_admin' ? 'Enter superadmin key' : 'Enter team password'}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/80 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                id="login-password-field"
              />
            </div>
          </div>
          
          {/* GDPR Cookies Checkbox */}
          <div className="flex items-start gap-2.5 mt-2">
            <input
              type="checkbox"
              id="gdpr-checkbox"
              checked={gdprAccepted}
              onChange={(e) => setGdprAccepted(e.target.checked)}
              className="mt-1 shrink-0 w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500 focus:ring-2"
            />
            <label htmlFor="gdpr-checkbox" className="text-[10px] text-slate-400 leading-relaxed cursor-pointer select-none">
              I agree to the <a href="#" className="text-emerald-400 underline hover:text-emerald-300">Cookie Policy</a> and <a href="#" className="text-emerald-400 underline hover:text-emerald-300">GDPR Terms & Conditions</a>. This system tracks logistics interactions using essential secure cookies.
            </label>
          </div>

          <button title="Submit form" 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating authority...
              </>
            ) : (
              <>
                Confirm Identity
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* User login instruction helper */}
        <div className="p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-start gap-2 text-[10px] text-slate-500 leading-normal">
          <Info className="w-4 h-4 text-emerald-500/70 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold text-slate-400">Sandbox Login Hints:</span>
            <p>Admin login password is: <strong className="font-mono text-emerald-400">admin</strong></p>
            <p>Team member login password is: <strong className="font-mono text-emerald-400">team</strong></p>
            <p>Super Admin login password is: <strong className="font-mono text-indigo-400">superadmin</strong></p>
          </div>
        </div>

      </div>
    </div>
  );
}
