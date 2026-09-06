import React from 'react';
import {
  Store,
  AlertCircle,
  BarChart3,
  Package,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  userPermissions?: string[];
  dueCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  setMobileSidebarOpen,
  userPermissions,
  dueCount = 0,
}) => {
  const hasAccess = (permId: string) => {
    if (!userPermissions || userPermissions.length === 0) return true;
    return userPermissions.includes(permId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden px-1 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),8px)] flex items-center justify-around">
      {/* 1. POS / Selling */}
      {hasAccess('selling') && (
        <button
          type="button"
          onClick={() => setActiveTab('selling')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'selling'
              ? 'text-[#0284c7] font-black'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              activeTab === 'selling' ? 'bg-sky-100 text-[#0284c7]' : ''
            }`}
          >
            <Store className="w-[18px] h-[18px]" />
          </div>
          <span className="text-[9.5px] mt-0.5 tracking-tight truncate max-w-[60px]">POS Sale</span>
        </button>
      )}

      {/* 2. Due List */}
      {hasAccess('due-list') && (
        <button
          type="button"
          onClick={() => setActiveTab('due-list')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-lg transition-all cursor-pointer relative ${
            activeTab === 'due-list'
              ? 'text-[#0284c7] font-black'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all relative ${
              activeTab === 'due-list' ? 'bg-sky-100 text-[#0284c7]' : ''
            }`}
          >
            <AlertCircle className="w-[18px] h-[18px]" />
            {dueCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8.5px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-2xs">
                {dueCount > 99 ? '99+' : dueCount}
              </span>
            )}
          </div>
          <span className="text-[9.5px] mt-0.5 tracking-tight truncate max-w-[60px]">Due List</span>
        </button>
      )}

      {/* 3. Reports */}
      {hasAccess('report') && (
        <button
          type="button"
          onClick={() => setActiveTab('report-sales')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-lg transition-all cursor-pointer ${
            activeTab.startsWith('report') || activeTab === 'report'
              ? 'text-[#0284c7] font-black'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              activeTab.startsWith('report') || activeTab === 'report'
                ? 'bg-sky-100 text-[#0284c7]'
                : ''
            }`}
          >
            <BarChart3 className="w-[18px] h-[18px]" />
          </div>
          <span className="text-[9.5px] mt-0.5 tracking-tight truncate max-w-[60px]">Reports</span>
        </button>
      )}

      {/* 4. Products / Inventory */}
      {hasAccess('product') && (
        <button
          type="button"
          onClick={() => setActiveTab('product')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'product' || ['product-list', 'category', 'brand', 'units'].includes(activeTab)
              ? 'text-[#0284c7] font-black'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              activeTab === 'product' || ['product-list', 'category', 'brand', 'units'].includes(activeTab)
                ? 'bg-sky-100 text-[#0284c7]'
                : ''
            }`}
          >
            <Package className="w-[18px] h-[18px]" />
          </div>
          <span className="text-[9.5px] mt-0.5 tracking-tight truncate max-w-[60px]">Products</span>
        </button>
      )}

      {/* 5. Menu Drawer Trigger */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-lg text-slate-500 hover:text-slate-800 font-semibold transition-all cursor-pointer"
      >
        <div className="p-1 rounded-lg">
          <Menu className="w-[18px] h-[18px]" />
        </div>
        <span className="text-[9.5px] mt-0.5 tracking-tight truncate max-w-[60px]">Menu</span>
      </button>
    </nav>
  );
};
