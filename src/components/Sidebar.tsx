import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Package,
  Store,
  ListFilter,
  AlertCircle,
  CreditCard,
  RefreshCw,
  User,
  UserPlus,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle2,
  RotateCcw,
  FileSpreadsheet,
  LogOut,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  userPermissions?: string[];
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  userPermissions,
  onLogout,
}) => {
  const [reportOpen, setReportOpen] = useState(activeTab.startsWith('report') || activeTab === 'report');

  // Permission checker helper
  const hasAccess = (permId: string) => {
    if (!userPermissions || userPermissions.length === 0) return true;
    return userPermissions.includes(permId);
  };

  // Keep report sub-menu open if any report sub-category is active
  useEffect(() => {
    if (activeTab.startsWith('report') || activeTab === 'report') {
      setReportOpen(true);
    }
  }, [activeTab]);

  const reportSubItems = [
    { id: 'report-paid', label: 'Paid List', icon: CheckCircle2 },
    { id: 'report-return', label: 'Return List', icon: RotateCcw },
    { id: 'report-sales', label: 'Sales Report', icon: FileSpreadsheet },
    { id: 'report-due', label: 'Due Collection', icon: AlertCircle },
    { id: 'report-inventory', label: 'Inventory Ledger', icon: Package },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const handleToggleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReportOpen(prev => !prev);
    if (!activeTab.startsWith('report')) {
      handleSelectTab('report-sales');
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white border-r border-slate-200/80 shrink-0 flex flex-col transition-all duration-300 z-50 ${
          mobileOpen
            ? 'fixed inset-y-0 left-0 w-72 shadow-2xl md:static'
            : 'hidden md:flex'
        } ${
          collapsed ? 'md:w-16' : 'md:w-64'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80">
          {(!collapsed || mobileOpen) && (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleSelectTab('dashboard')}
            >
              <span className="text-2xl font-black text-[#0284c7] tracking-tight">
                fixprobd
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#0284c7] px-2 py-0.5 rounded border border-sky-100">
                POS
              </span>
            </div>
          )}

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg md:hidden cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {/* Main Navigation Items */}
          {hasAccess('dashboard') && (
            <button
              onClick={() => handleSelectTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <Gauge className={`w-5 h-5 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Dashboard</span>}
            </button>
          )}

          {hasAccess('selling') && (
            <button
              onClick={() => handleSelectTab('selling')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'selling'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <Store className={`w-5 h-5 shrink-0 ${activeTab === 'selling' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Selling (POS)</span>}
            </button>
          )}

          {hasAccess('selling-list') && (
            <button
              onClick={() => handleSelectTab('selling-list')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'selling-list'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <ListFilter className={`w-5 h-5 shrink-0 ${activeTab === 'selling-list' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Selling List</span>}
            </button>
          )}

          {hasAccess('due-list') && (
            <button
              onClick={() => handleSelectTab('due-list')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'due-list'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <AlertCircle className={`w-5 h-5 shrink-0 ${activeTab === 'due-list' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Due List</span>}
            </button>
          )}

          {hasAccess('reorder-product') && (
            <button
              onClick={() => handleSelectTab('reorder-product')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'reorder-product'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <RefreshCw className={`w-5 h-5 shrink-0 ${activeTab === 'reorder-product' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Re-Order Product</span>}
            </button>
          )}

          {hasAccess('customer') && (
            <button
              onClick={() => handleSelectTab('customer')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <User className={`w-5 h-5 shrink-0 ${activeTab === 'customer' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Customer</span>}
            </button>
          )}

          {hasAccess('product') && (
            <button
              onClick={() => handleSelectTab('product')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'product' || ['category', 'brand', 'units'].includes(activeTab)
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <Package className={`w-5 h-5 shrink-0 ${activeTab === 'product' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Product List</span>}
            </button>
          )}

          {hasAccess('due-payment-list') && (
            <button
              onClick={() => handleSelectTab('due-payment-list')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'due-payment-list'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <CreditCard className={`w-5 h-5 shrink-0 ${activeTab === 'due-payment-list' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Due Payment</span>}
            </button>
          )}

          {hasAccess('manager-create') && (
            <button
              onClick={() => handleSelectTab('manager-create')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'manager-create'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <UserPlus className={`w-5 h-5 shrink-0 ${activeTab === 'manager-create' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Manager Create</span>}
            </button>
          )}

          {/* ======================= EXPANDABLE REPORT MENU ======================= */}
          {hasAccess('report') && (
            <div className="space-y-1">
              <button
                onClick={handleToggleReport}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab.startsWith('report') || activeTab === 'report'
                    ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                    : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
                }`}
              >
                <BarChart3
                  className={`w-5 h-5 shrink-0 ${
                    activeTab.startsWith('report') || activeTab === 'report' ? 'text-white' : 'text-slate-600'
                  }`}
                />
                {(!collapsed || mobileOpen) && (
                  <>
                    <span className="truncate flex-1 text-left">Report</span>
                    {reportOpen ? (
                      <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200" />
                    )}
                  </>
                )}
              </button>

              {/* Sub Categories list under Report */}
              {(!collapsed || mobileOpen) && reportOpen && (
                <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-sky-100 ml-5 my-1">
                  {reportSubItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeTab === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectTab(sub.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSubActive
                            ? 'bg-sky-50 text-[#0284c7] font-black border border-sky-200/80 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <SubIcon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSubActive ? 'text-[#0284c7]' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate text-left">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {hasAccess('settings') && (
            <button
              onClick={() => handleSelectTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <Settings className={`w-5 h-5 shrink-0 ${activeTab === 'settings' ? 'text-white' : 'text-slate-600'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left">Settings</span>}
            </button>
          )}

          {/* Logout */}
          {onLogout && (
            <div className="pt-3 mt-3 border-t border-slate-100">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer group"
                title="Logout Account"
              >
                <LogOut className="w-5 h-5 shrink-0 text-rose-600 group-hover:scale-110 transition-transform" />
                {(!collapsed || mobileOpen) && <span className="truncate flex-1 text-left font-extrabold">Logout</span>}
              </button>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};
