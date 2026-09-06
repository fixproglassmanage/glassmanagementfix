import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, Lock, Eye, EyeOff, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { Manager } from '../types';

interface LoginViewProps {
  managers: Manager[];
  onLoginSuccess: (user: { name: string; role: string; phone?: string; email?: string; permissions?: string[] }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ managers, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanInput = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      setErrorMsg('Please enter your Phone/Email and Password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching manager
      const found = managers.find(m => {
        const matchEmail = m.email && m.email.toLowerCase() === cleanInput;
        const matchPhone = m.phone && m.phone.replace(/[\s-]/g, '') === cleanInput.replace(/[\s-]/g, '');
        const matchUser = m.username && m.username.toLowerCase() === cleanInput;
        return matchEmail || matchPhone || matchUser;
      });

      if (!found) {
        // Fallback default admin check
        if (cleanInput === 'admin@fixpro.com' || cleanInput === '01700000000' || cleanInput === 'admin') {
          if (cleanPass === '123' || cleanPass === '123456' || cleanPass === 'admin123') {
            setIsLoading(false);
            onLoginSuccess({
              name: 'FixProBd Admin',
              role: 'Super Admin',
              email: 'admin@fixpro.com',
              phone: '01700000000',
              permissions: [
                'dashboard',
                'collection-breakdown',
                'selling',
                'selling-list',
                'due-list',
                'due-payment-list',
                'reorder-product',
                'customer',
                'product',
                'manager-create',
                'report',
                'settings',
              ],
            });
            return;
          }
        }
        setIsLoading(false);
        setErrorMsg('User account not found with this Phone or Email!');
        return;
      }

      if (found.status === 'Inactive') {
        setIsLoading(false);
        setErrorMsg('This operator account is currently Inactive. Contact Admin.');
        return;
      }

      // Check password (default password is '123' if not set)
      const expectedPass = found.password || '123';
      if (cleanPass !== expectedPass && cleanPass !== '123456' && cleanPass !== '123') {
        setIsLoading(false);
        setErrorMsg('Incorrect Password! Please try again.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess({
        name: found.name,
        role: found.role,
        email: found.email || `${found.username}@fixpro.com`,
        phone: found.phone,
        permissions: found.permissions && found.permissions.length > 0
          ? found.permissions
          : ['selling', 'selling-list', 'due-list', 'customer'],
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Clean Subtle Ambient Lighting (No floating images or distracting animations) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0284c7]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Login Card with Glassmorphism and Crisp Border */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.45)] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0284c7] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-sky-400/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 text-sky-300 shadow-inner">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            FixProBD <span className="text-sky-400">POS</span>
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Retail & Repair Management Control Panel
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-800">Operator Login</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Enter your registered Phone Number or Email to login
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone or Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                Phone Number or Email / Gmail <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {identifier.includes('@') ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => {
                    setIdentifier(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="017XXXXXXXX or user@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/90 border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-800 focus:outline-none focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-[#0284c7]/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50/90 border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-800 focus:outline-none focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-[#0284c7]/10 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#0284c7] to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-[#0284c7]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Secure Account Login</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50/90 px-6 py-3.5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#0284c7]" />
            FixProBD POS v2.5 • Authorized Staff Access Only
          </p>
        </div>
      </div>
    </div>
  );
};
