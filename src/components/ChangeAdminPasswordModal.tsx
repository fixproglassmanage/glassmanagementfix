import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, X, Phone, Mail, User, AtSign, Save } from 'lucide-react';
import { Manager } from '../types';

interface ChangeAdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  managers: Manager[];
  setManagers: (managers: Manager[] | ((prev: Manager[]) => Manager[])) => void;
  activeUser: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    username?: string;
  };
  setActiveUser?: (user: any) => void;
  onSuccess?: (msg: string) => void;
}

export const ChangeAdminPasswordModal: React.FC<ChangeAdminPasswordModalProps> = ({
  isOpen,
  onClose,
  managers,
  setManagers,
  activeUser,
  setActiveUser,
  onSuccess,
}) => {
  // Find the Super Admin / Owner manager record
  const adminManager = managers.find(
    (m) => m.role === 'Super Admin' || m.username === 'admin'
  ) || managers[0];

  const [name, setName] = useState(adminManager?.name || activeUser.name || 'FixProBd Admin');
  const [phone, setPhone] = useState(adminManager?.phone || activeUser.phone || '01700000000');
  const [email, setEmail] = useState(adminManager?.email || activeUser.email || 'fixprobranch2@gmail.com');
  const [username, setUsername] = useState(adminManager?.username || activeUser.username || 'admin');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordToggle, setChangePasswordToggle] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(adminManager?.name || activeUser.name || 'FixProBd Admin');
      setPhone(adminManager?.phone || activeUser.phone || '01700000000');
      setEmail(adminManager?.email || activeUser.email || 'fixprobranch2@gmail.com');
      setUsername(adminManager?.username || activeUser.username || 'admin');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangePasswordToggle(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen, adminManager, activeUser]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if active user is really Super Admin
    if (activeUser.role !== 'Super Admin') {
      setError('Unauthorized access! Only the store owner (Super Admin) can modify these settings.');
      return;
    }

    if (!name.trim()) {
      setError('Please provide the Owner / Admin full name.');
      return;
    }

    if (!phone.trim()) {
      setError('Please provide the contact phone number.');
      return;
    }

    if (!username.trim()) {
      setError('Please provide the login username.');
      return;
    }

    // Check current password for safety
    const actualCurrentPass = adminManager?.password || '123';
    if (!currentPassword.trim()) {
      setError('Current admin password is required to save modifications.');
      return;
    }

    if (currentPassword !== actualCurrentPass) {
      setError('Current password is incorrect! Please enter your valid password.');
      return;
    }

    // Password change validation if enabled
    let updatedPassword = actualCurrentPass;
    if (changePasswordToggle || newPassword.trim().length > 0) {
      if (!newPassword.trim()) {
        setError('Please enter your new password.');
        return;
      }
      if (newPassword.length < 3) {
        setError('New password must be at least 3 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match.');
        return;
      }
      updatedPassword = newPassword;
    }

    // Update manager record in state
    setManagers((prev) =>
      prev.map((m) => {
        if (m.id === adminManager?.id || m.role === 'Super Admin') {
          return {
            ...m,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            username: username.trim(),
            password: updatedPassword,
          };
        }
        return m;
      })
    );

    // Also update active logged-in user session
    if (setActiveUser) {
      setActiveUser((prev: any) => ({
        ...prev,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        username: username.trim(),
        password: updatedPassword,
      }));
    }

    const msg = 'Owner profile and security credentials (name, phone, email, password) successfully updated!';
    setSuccess(msg);
    if (onSuccess) onSuccess(msg);

    // Reset form & close modal after slight delay
    setTimeout(() => {
      setError('');
      setSuccess('');
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg my-6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0284c7] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-sky-300 border border-white/10 shadow-inner">
              <KeyRound className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight">
                Owner Access & Profile Settings
              </h3>
              <p className="text-xs text-sky-200/90 font-medium">
                Update owner phone number, email, login username & password
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Owner-Only Notice */}
          <div className="p-3 bg-sky-50 border border-sky-200/80 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900">
              <span className="font-extrabold block">Owner-Exclusive Security Control</span>
              <span>Modifications here are strictly reserved for the Super Admin / Store Owner account.</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs font-bold text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Owner Name */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                Owner Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@fixprobd.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            {/* Login Username */}
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Current Password Validation Required */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-black text-slate-700 mb-1">
              Current Password (Required to save) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password to save changes (default: 123)"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Toggle Password Change Option */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <span className="text-xs font-black text-slate-800 block">
                  Change Password Too?
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Leave switched off to keep existing password
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setChangePasswordToggle(!changePasswordToggle);
                  if (changePasswordToggle) {
                    setNewPassword('');
                    setConfirmPassword('');
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

          {/* New Password & Confirm (Visible if toggle active) */}
          {changePasswordToggle && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-sky-50/50 border border-sky-200/80 rounded-2xl animate-in fade-in">
              {/* New Password */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    required={changePasswordToggle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    required={changePasswordToggle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0284c7] hover:bg-sky-600 active:bg-sky-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Owner Profile & Security</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

