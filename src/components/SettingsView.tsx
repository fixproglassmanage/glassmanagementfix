import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  Phone,
  Mail,
  AtSign,
  User,
  Loader2,
  CheckSquare,
  Square,
  RefreshCw,
} from 'lucide-react';
import { Manager } from '../types';

interface SettingsViewProps {
  onResetDatabase?: (options: {
    wipeSales?: boolean;
    wipeDues?: boolean;
    wipeProducts?: boolean;
    wipeCustomers?: boolean;
    wipeReturns?: boolean;
    wipeCategories?: boolean;
    wipeBrands?: boolean;
    wipeUnits?: boolean;
    wipeNonAdminManagers?: boolean;
  }) => Promise<void> | void;
  activeUser?: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    username?: string;
    permissions?: string[];
  };
  managers?: Manager[];
  setManagers?: (managers: Manager[] | ((prev: Manager[]) => Manager[])) => void;
  setActiveUser?: (user: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetDatabase,
  activeUser,
  managers = [],
  setManagers,
  setActiveUser,
}) => {
  const [shopName, setShopName] = useState(() => localStorage.getItem('fixpro_shop_name') || 'FixProBD');
  const [phone, setPhone] = useState(() => localStorage.getItem('fixpro_shop_phone') || '01700000000');
  const [address, setAddress] = useState(() => localStorage.getItem('fixpro_shop_address') || 'Dhaka, Bangladesh');
  const [currency, setCurrency] = useState(() => localStorage.getItem('fixpro_shop_currency') || '৳ (BDT)');
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Find Super Admin Manager
  const adminManager = managers.find(
    (m) => m.role === 'Super Admin' || m.username === 'admin'
  ) || managers[0];

  // Admin Profile & Security state
  const isOwner = activeUser?.role === 'Super Admin';
  const [ownerName, setOwnerName] = useState(adminManager?.name || activeUser?.name || 'FixProBd Admin');
  const [ownerPhone, setOwnerPhone] = useState(adminManager?.phone || activeUser?.phone || '01700000000');
  const [ownerEmail, setOwnerEmail] = useState(adminManager?.email || activeUser?.email || 'fixprobranch2@gmail.com');
  const [ownerUsername, setOwnerUsername] = useState(adminManager?.username || activeUser?.username || 'admin');

  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [changePasswordToggle, setChangePasswordToggle] = useState(false);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Secret Reset Modal State
  const [showSecretResetModal, setShowSecretResetModal] = useState(false);
  const [resetAdminPassInput, setResetAdminPassInput] = useState('');
  const [showResetAdminPass, setShowResetAdminPass] = useState(false);
  const [resetConfirmWord, setResetConfirmWord] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Reset Scopes Selection
  const [wipeSales, setWipeSales] = useState(true);
  const [wipeDues, setWipeDues] = useState(true);
  const [wipeProducts, setWipeProducts] = useState(true);
  const [wipeCustomers, setWipeCustomers] = useState(true);
  const [wipeReturns, setWipeReturns] = useState(true);
  const [wipeCategories, setWipeCategories] = useState(false);
  const [wipeBrands, setWipeBrands] = useState(false);
  const [wipeUnits, setWipeUnits] = useState(false);
  const [wipeNonAdminManagers, setWipeNonAdminManagers] = useState(false);

  // Sync state if managers/activeUser changes
  useEffect(() => {
    if (adminManager) {
      setOwnerName(adminManager.name || activeUser?.name || 'FixProBd Admin');
      setOwnerPhone(adminManager.phone || activeUser?.phone || '01700000000');
      setOwnerEmail(adminManager.email || activeUser?.email || 'fixprobranch2@gmail.com');
      setOwnerUsername(adminManager.username || activeUser?.username || 'admin');
    }
  }, [adminManager, activeUser]);

  const handleShopConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('fixpro_shop_name', shopName);
      localStorage.setItem('fixpro_shop_phone', phone);
      localStorage.setItem('fixpro_shop_address', address);
      localStorage.setItem('fixpro_shop_currency', currency);
    } catch {}
    setStatusMessage('Store profile and general configuration saved successfully!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!isOwner) {
      setPasswordError('Unauthorized access! Only the store owner (Super Admin) can modify these settings.');
      return;
    }

    if (!ownerName.trim()) {
      setPasswordError('Please provide the Owner / Admin full name.');
      return;
    }

    if (!ownerPhone.trim()) {
      setPasswordError('Please provide the contact phone number.');
      return;
    }

    if (!ownerUsername.trim()) {
      setPasswordError('Please provide the login username.');
      return;
    }

    if (!currentAdminPassword.trim()) {
      setPasswordError('Current admin password is required to save modifications.');
      return;
    }

    const actualPass = adminManager?.password || '123';
    if (currentAdminPassword !== actualPass) {
      setPasswordError('Current password is incorrect! Please enter your valid password.');
      return;
    }

    let finalPassword = actualPass;
    if (changePasswordToggle || newAdminPassword.trim().length > 0) {
      if (!newAdminPassword.trim()) {
        setPasswordError('Please enter your new password.');
        return;
      }

      if (newAdminPassword.length < 3) {
        setPasswordError('New password must be at least 3 characters long.');
        return;
      }

      if (newAdminPassword !== confirmAdminPassword) {
        setPasswordError('New password and confirm password do not match.');
        return;
      }
      finalPassword = newAdminPassword;
    }

    if (setManagers) {
      setManagers((prev) =>
        prev.map((m) => {
          if (m.id === adminManager?.id || m.role === 'Super Admin') {
            return {
              ...m,
              name: ownerName.trim(),
              phone: ownerPhone.trim(),
              email: ownerEmail.trim(),
              username: ownerUsername.trim(),
              password: finalPassword,
            };
          }
          return m;
        })
      );
    }

    if (setActiveUser) {
      setActiveUser((prev: any) => ({
        ...prev,
        name: ownerName.trim(),
        phone: ownerPhone.trim(),
        email: ownerEmail.trim(),
        username: ownerUsername.trim(),
        password: finalPassword,
      }));
    }

    setPasswordSuccess('Owner profile and security credentials (name, phone, email, password) successfully updated!');
    setCurrentAdminPassword('');
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    setChangePasswordToggle(false);
    setTimeout(() => setPasswordSuccess(''), 5000);
  };

  const handleExecuteSecretReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!isOwner) {
      setResetError('Unauthorized access! Only the store owner (Super Admin) can perform a system reset.');
      return;
    }

    const actualPass = adminManager?.password || '123';
    if (resetAdminPassInput !== actualPass) {
      setResetError('Incorrect password! Please enter the valid Super Admin password.');
      return;
    }

    if (resetConfirmWord.trim().toUpperCase() !== 'RESET') {
      setResetError('Please type "RESET" into the confirmation box to proceed.');
      return;
    }

    setIsResetting(true);
    try {
      if (onResetDatabase) {
        await onResetDatabase({
          wipeSales,
          wipeDues,
          wipeProducts,
          wipeCustomers,
          wipeReturns,
          wipeCategories,
          wipeBrands,
          wipeUnits,
          wipeNonAdminManagers,
        });
      }
      setShowSecretResetModal(false);
      setResetAdminPassInput('');
      setResetConfirmWord('');
      setStatusMessage('Selected store data has been completely wiped and database refreshed!');
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err: any) {
      setResetError(err?.message || 'Failed to complete data reset. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-800 text-sm font-bold shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-extrabold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. OWNER PROFILE & CREDENTIALS CARD */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs p-5 sm:p-6 max-w-3xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-[#0284c7] rounded-2xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <span>Owner Profile & Security</span>
                <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-extrabold">
                  Super Admin
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Update owner phone number, email, login username & password
              </p>
            </div>
          </div>
        </div>

        {!isOwner ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs font-bold">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              You are currently logged in as <span className="font-extrabold">"{activeUser?.role || 'Staff'}"</span>. Only the Super Admin / Store Owner can update owner profile credentials and password.
            </span>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Owner Full Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Owner Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. FixProBd Admin"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    required
                  />
                </div>
              </div>

              {/* Owner Phone */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    required
                  />
                </div>
              </div>

              {/* Owner Email */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="e.g. fixprobranch2@gmail.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              {/* Owner Login Username */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Login Username (ID) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <AtSign className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={ownerUsername}
                    onChange={(e) => setOwnerUsername(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Current Password Field */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-700 mb-1">
                Current Password (Required to save) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentAdminPassword}
                  onChange={(e) => setCurrentAdminPassword(e.target.value)}
                  placeholder="Enter current password (default: 123)"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Change Toggle */}
            <div className="pt-1">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-xs font-black text-slate-800 block">
                    Change Password Too?
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Leave switched off to keep your current password
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordToggle(!changePasswordToggle);
                    if (changePasswordToggle) {
                      setNewAdminPassword('');
                      setConfirmAdminPassword('');
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    changePasswordToggle ? 'bg-[#0284c7]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      changePasswordToggle ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Optional New Password Fields */}
            {changePasswordToggle && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-sky-50/50 border border-sky-200/80 rounded-2xl animate-in fade-in">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                      required={changePasswordToggle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                      required={changePasswordToggle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-slate-500 font-semibold">
                * Updated credentials will take effect on all connected devices and subsequent logins.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0284c7] hover:bg-sky-600 active:bg-sky-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Owner Profile & Security</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SYSTEM & BUSINESS CONFIGURATION */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs p-5 sm:p-6 max-w-3xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-slate-100 text-slate-800 rounded-2xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800">System & Business Configuration</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Configure store information and printed receipt header</p>
          </div>
        </div>

        <form onSubmit={handleShopConfigSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Establishment / Shop Name</label>
            <input
              type="text"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Telephone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0284c7] hover:bg-sky-600 text-white text-sm font-extrabold rounded-xl transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECRET LOCKED SYSTEM DATA RESET & CLEANUP CARD */}
      {/* ========================================================================= */}
      <div className="bg-white border border-rose-200/80 rounded-3xl shadow-2xs p-5 sm:p-6 max-w-3xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-rose-950 flex items-center gap-2">
                <span>Secret System Data Reset</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                  <Lock className="w-3 h-3 inline" /> Protected Lock
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Wipe transaction records, products, and due history to start fresh
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-rose-50/40 rounded-2xl border border-rose-200/80 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-rose-950">
                Permanent System Reset & Cleanup
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This is a high-security action. Performing a data reset permanently clears selected historical records from the cloud Firebase database and local cache. Super Admin login accounts will remain protected.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setResetError('');
                setResetAdminPassInput('');
                setResetConfirmWord('');
                setShowSecretResetModal(true);
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock & Open Secret Data Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SECRET RESET MODAL DIALOG WITH PIN & PASSWORD LOCK */}
      {/* ========================================================================= */}
      {showSecretResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-rose-600 px-6 py-4.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/15 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide">
                    System Data Reset Verification
                  </h3>
                  <p className="text-[11px] text-rose-100 font-semibold">
                    Super Admin Security Authorization Required
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isResetting && setShowSecretResetModal(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleExecuteSecretReset} className="p-6 space-y-4">
              {resetError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {/* Warning Alert */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-200/90 rounded-2xl text-xs text-rose-900 space-y-1">
                <p className="font-extrabold flex items-center gap-1.5 text-rose-700">
                  <ShieldAlert className="w-4 h-4 inline" /> Confirmation Warning:
                </p>
                <p className="text-[11px] text-slate-600">
                  Selected data collections below will be permanently purged across Firebase and all connected devices. Super Admin owner credentials will remain preserved.
                </p>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  Select Items to Wipe:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wipeSales}
                      onChange={(e) => setWipeSales(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>All Sales & POS</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wipeDues}
                      onChange={(e) => setWipeDues(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>Customer Due List</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wipeProducts}
                      onChange={(e) => setWipeProducts(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>Products & Inventory</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wipeCustomers}
                      onChange={(e) => setWipeCustomers(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>Customer Directory</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wipeReturns}
                      onChange={(e) => setWipeReturns(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>Return Records</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wipeCategories}
                      onChange={(e) => setWipeCategories(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>Categories & Brands (Optional)</span>
                  </label>
                </div>
              </div>

              {/* Owner Password Required */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  1. Enter Super Admin Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showResetAdminPass ? 'text' : 'password'}
                    value={resetAdminPassInput}
                    onChange={(e) => setResetAdminPassInput(e.target.value)}
                    placeholder="Enter Admin Password"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetAdminPass(!showResetAdminPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showResetAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Type RESET word */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  2. Type <span className="text-rose-600 font-black">RESET</span> to confirm <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={resetConfirmWord}
                  onChange={(e) => setResetConfirmWord(e.target.value)}
                  placeholder="Type RESET in capital letters"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-black tracking-widest text-rose-700 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setShowSecretResetModal(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting || resetConfirmWord.trim().toUpperCase() !== 'RESET' || !resetAdminPassInput}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md ${
                    resetConfirmWord.trim().toUpperCase() === 'RESET' && resetAdminPassInput && !isResetting
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resetting Data...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Permanently Wipe & Reset</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
