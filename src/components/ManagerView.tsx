import React, { useState } from 'react';
import { Manager, ALL_APP_PERMISSIONS, PermissionKey } from '../types';
import {
  Plus,
  Trash2,
  Edit3,
  UserCheck,
  Shield,
  CheckSquare,
  Square,
  Sparkles,
  Check,
  AlertCircle,
  KeyRound,
  Layers,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { ChangeAdminPasswordModal } from './ChangeAdminPasswordModal';

interface ManagerViewProps {
  managers: Manager[];
  setManagers: React.Dispatch<React.SetStateAction<Manager[]>>;
  activeUser?: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    username?: string;
    permissions?: string[];
  };
  setActiveUser?: (user: any) => void;
}

const ALL_PERMISSION_KEYS = ALL_APP_PERMISSIONS.map(p => p.id);

export const ManagerView: React.FC<ManagerViewProps> = ({
  managers,
  setManagers,
  activeUser,
  setActiveUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [adminPasswordModalOpen, setAdminPasswordModalOpen] = useState(false);

  const isOwner = activeUser?.role === 'Super Admin';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sales Manager');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [permissions, setPermissions] = useState<string[]>(ALL_PERMISSION_KEYS);
  const [permissionError, setPermissionError] = useState('');

  const handleOpenRegister = () => {
    setEditingManager(null);
    setName('');
    setPhone('');
    setEmail('');
    setUsername('');
    setPassword('123');
    setRole('Sales Manager');
    setStatus('Active');
    // Default preset for new manager
    setPermissions([
      'dashboard',
      'collection-breakdown',
      'selling',
      'selling-list',
      'due-list',
      'due-payment-list',
      'customer',
      'product',
      'report',
    ]);
    setPermissionError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Manager) => {
    // If editing Super Admin and user is not Super Admin, deny
    if (m.role === 'Super Admin' && !isOwner) {
      alert('Only the Super Admin (Shop Owner) can edit the Super Admin account!');
      return;
    }
    setEditingManager(m);
    setName(m.name || '');
    setPhone(m.phone || '');
    setEmail(m.email || '');
    setUsername(m.username || '');
    setPassword(m.password || '123');
    setRole(m.role || 'Sales Manager');
    setStatus(m.status || 'Active');
    setPermissions(m.permissions && m.permissions.length > 0 ? m.permissions : ALL_PERMISSION_KEYS);
    setPermissionError('');
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setPermissionError('');
    setPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const applyPreset = (preset: 'all' | 'cashier' | 'manager' | 'inventory' | 'clear') => {
    setPermissionError('');
    switch (preset) {
      case 'all':
        setPermissions(ALL_PERMISSION_KEYS);
        break;
      case 'cashier':
        setPermissions(['selling', 'selling-list', 'due-list', 'customer']);
        break;
      case 'manager':
        setPermissions([
          'dashboard',
          'collection-breakdown',
          'selling',
          'selling-list',
          'due-list',
          'due-payment-list',
          'customer',
          'product',
          'report',
        ]);
        break;
      case 'inventory':
        setPermissions(['product', 'reorder-product', 'customer']);
        break;
      case 'clear':
        setPermissions([]);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    if (permissions.length === 0) {
      setPermissionError('Please select at least 1 module permission for this user!');
      return;
    }

    if (editingManager) {
      setManagers(prev =>
        prev.map(m =>
          m.id === editingManager.id
            ? { ...m, name, phone, email, username, password, role, status, permissions }
            : m
        )
      );
    } else {
      const newM: Manager = {
        id: Date.now().toString(),
        sl: managers.length + 1,
        name,
        phone,
        email,
        username,
        password: password || '123',
        role,
        status,
        permissions,
      };
      setManagers(prev => [...prev, newM]);
    }

    setIsModalOpen(false);
    setEditingManager(null);
    setName('');
    setPhone('');
    setEmail('');
    setUsername('');
    setPassword('');
    setPermissions(ALL_PERMISSION_KEYS);
  };

  // Group permissions by category for clear presentation
  const categories = Array.from(new Set(ALL_APP_PERMISSIONS.map(p => p.category)));

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1650px] mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner & Action */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0284c7]" />
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Staff & Operator Access Control
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Create operator accounts and configure individual module access permissions for each user
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {isOwner && (
              <button
                type="button"
                onClick={() => setAdminPasswordModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                title="Change Owner Phone, Email and Password"
              >
                <KeyRound className="w-4 h-4 stroke-[2.5]" />
                <span>Owner Profile & Access</span>
              </button>
            )}
            <button
              onClick={handleOpenRegister}
              className="bg-[#0284c7] hover:bg-sky-600 active:bg-sky-700 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add New Operator</span>
            </button>
          </div>
        </div>

        {/* Operators Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-sm text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider">
                <th className="py-3.5 px-3.5 text-center w-12">SL</th>
                <th className="py-3.5 px-3.5">OPERATOR NAME</th>
                <th className="py-3.5 px-3">LOGIN CREDENTIALS</th>
                <th className="py-3.5 px-3">ROLE</th>
                <th className="py-3.5 px-3">GRANTED ACCESS MODULES</th>
                <th className="py-3.5 px-3 text-center">STATUS</th>
                <th className="py-3.5 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {managers.map((m) => {
                const userPerms = m.permissions || ALL_PERMISSION_KEYS;
                const isFullAccess = userPerms.length === ALL_APP_PERMISSIONS.length;
                const isSuperAdminRow = m.role === 'Super Admin';

                return (
                  <tr key={m.id} className={`hover:bg-sky-50/30 transition-colors ${isSuperAdminRow ? 'bg-sky-50/20 font-medium' : ''}`}>
                    <td className="py-3.5 px-3.5 text-slate-500 font-bold text-center text-xs">
                      {m.sl}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-800 text-sm">{m.name}</span>
                        {isSuperAdminRow && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">{m.email || 'No email provided'}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-slate-800 font-bold text-xs">@{m.username}</div>
                      <div className="font-mono text-slate-500 text-[11px]">{m.phone || '—'}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black border ${
                        isSuperAdminRow
                          ? 'bg-sky-100 text-sky-900 border-sky-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isSuperAdminRow ? 'Super Admin (Owner)' : m.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 max-w-[320px]">
                      {isFullAccess ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Full Access (All {ALL_APP_PERMISSIONS.length} Modules)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-sky-100 text-sky-800 border border-sky-200">
                            {userPerms.length} / {ALL_APP_PERMISSIONS.length} Modules
                          </span>
                          {userPerms.slice(0, 3).map(pId => {
                            const pObj = ALL_APP_PERMISSIONS.find(item => item.id === pId);
                            return (
                              <span
                                key={pId}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {pObj?.label || pId}
                              </span>
                            );
                          })}
                          {userPerms.length > 3 && (
                            <span className="text-[10px] font-extrabold text-slate-500">
                              +{userPerms.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-3 py-1 text-xs font-black border rounded-md uppercase tracking-wider ${
                          m.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isSuperAdminRow && isOwner && (
                          <button
                            type="button"
                            onClick={() => setAdminPasswordModalOpen(true)}
                            className="p-2 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Owner Phone, Email, Username & Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-2 bg-sky-50 hover:bg-[#0284c7] hover:text-white text-[#0284c7] rounded-lg transition-colors cursor-pointer"
                          title={isSuperAdminRow ? 'Edit Owner Profile & Password' : 'Edit Permissions & Credentials'}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {isSuperAdminRow ? (
                          <span
                            className="p-2 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed"
                            title="Super Admin / Owner account cannot be deleted"
                          >
                            <Lock className="w-4 h-4" />
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${m.name}?`)) {
                                setManagers(prev => prev.filter(item => item.id !== m.id));
                              }
                            }}
                            className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Remove Operator"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register / Edit Modal with Permission Checklist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-sky-400">
                  <UserCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {editingManager ? 'Edit Operator & Access Permissions' : 'Register Operator & Grant Access'}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold">
                    Set login credentials and customize module permissions
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-white/10 rounded-lg text-sky-300 border border-white/10">
                {editingManager ? 'Update' : 'New User'}
              </span>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                  <KeyRound className="w-4 h-4 text-[#0284c7]" />
                  <span>1. Account Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Kabir Ahmed"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Username (Login ID) *</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="e.g. kabir_pos"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Phone Number (Login ID) *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Email / Gmail (Login ID)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@fixpro.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Password *</label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="123"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Designation / Role</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    >
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Counter User">Counter User / Cashier</option>
                      <option value="Store Keeper">Store Keeper</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Account Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Granular Permission Checklist Section */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-[#0284c7]" />
                    <span>2. Option Access Permissions</span>
                  </div>
                  <span className="text-xs font-black text-[#0284c7] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                    Selected: {permissions.length} of {ALL_APP_PERMISSIONS.length} Modules
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-extrabold text-slate-500 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" /> Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 transition-colors cursor-pointer"
                  >
                    ⭐ Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cashier')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 transition-colors cursor-pointer"
                  >
                    🛒 Cashier / POS Only
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('manager')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 transition-colors cursor-pointer"
                  >
                    💼 Manager Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('inventory')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 transition-colors cursor-pointer"
                  >
                    📦 Store Keeper
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('clear')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {permissionError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-extrabold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{permissionError}</span>
                  </div>
                )}

                {/* Categorized Permissions Grid */}
                <div className="space-y-4 pt-2">
                  {categories.map(cat => {
                    const items = ALL_APP_PERMISSIONS.filter(p => p.category === cat);
                    return (
                      <div key={cat} className="space-y-2">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-600 bg-slate-100/70 px-2.5 py-1 rounded-md">
                          {cat}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map(p => {
                            const isChecked = permissions.includes(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => togglePermission(p.id)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                                  isChecked
                                    ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-300 shadow-2xs'
                                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                              >
                                <div className="mt-0.5 text-[#0284c7] shrink-0">
                                  {isChecked ? (
                                    <div className="w-4 h-4 rounded bg-[#0284c7] text-white flex items-center justify-center">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`text-xs font-black ${isChecked ? 'text-sky-950' : 'text-slate-800'}`}>
                                      {p.label}
                                    </span>
                                    <span className="text-[10px] font-extrabold text-slate-500">
                                      {p.banglaLabel}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-500 font-semibold leading-snug mt-0.5 line-clamp-1">
                                    {p.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs font-extrabold text-slate-500">
                Granted: <span className="text-[#0284c7] font-black">{permissions.length}</span> / {ALL_APP_PERMISSIONS.length}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-black rounded-xl hover:bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0284c7] hover:bg-sky-600 active:bg-sky-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  {editingManager ? 'Update Operator Access' : 'Create Operator'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Change Admin Password Modal */}
      {isOwner && (
        <ChangeAdminPasswordModal
          isOpen={adminPasswordModalOpen}
          onClose={() => setAdminPasswordModalOpen(false)}
          managers={managers}
          setManagers={setManagers}
          activeUser={activeUser || { name: 'Admin', role: 'Super Admin' }}
          setActiveUser={setActiveUser}
        />
      )}
    </div>
  );
};

