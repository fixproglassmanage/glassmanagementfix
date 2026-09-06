import React from 'react';
import {
  Package,
  ShoppingCart,
  User,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Product, Customer, SellingListItem, DueListItem } from '../types';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  products: Product[];
  customers: Customer[];
  salesList: SellingListItem[];
  dueList: DueListItem[];
  userPermissions?: string[];
  isSuperAdmin?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  products = [],
  customers = [],
  salesList = [],
  dueList = [],
  userPermissions,
  isSuperAdmin = false,
}) => {
  const hasCollectionAccess =
    isSuperAdmin || !userPermissions || userPermissions.length === 0 || userPermissions.includes('collection-breakdown');

  const totalProductsCount = products.length;
  const totalProductQty = products.reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
  const totalCustomersCount = customers.length;

  const totalSalesPaid = salesList.reduce((sum, s) => sum + (Number(s.payAmount) || 0), 0);
  const totalDueAmount = dueList.reduce((sum, d) => sum + (Number(d.due) || 0), 0);

  // Take top 10 recent sales
  const recentSales = salesList.slice(0, 10);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1700px] mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Statistics Count Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-wider">
            Live Statistics Overview
          </p>
          <span className="text-xs font-extrabold text-[#0284c7] bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Real-time Updates
          </span>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasCollectionAccess ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 sm:gap-5 pt-1`}>
          {/* Products Count */}
          <div
            onClick={() => setActiveTab('product-list')}
            className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{totalProductsCount}</p>
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1.5 uppercase tracking-wide">
                Total Products
              </p>
            </div>
          </div>

          {/* Total Quantity */}
          <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{totalProductQty}</p>
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1.5 uppercase tracking-wide">
                Stock Quantity (QTY)
              </p>
            </div>
          </div>

          {/* Customers Count */}
          <div
            onClick={() => setActiveTab('customer')}
            className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <User className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{totalCustomersCount}</p>
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1.5 uppercase tracking-wide">
                Total Customers
              </p>
            </div>
          </div>

          {/* Collection Breakdown Square Card (Only if user has permission) */}
          {hasCollectionAccess && (
            <div
              onClick={() => setActiveTab('collection-breakdown')}
              className="flex flex-col justify-between bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none truncate">
                    ৳{totalSalesPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1.5 uppercase tracking-wide">
                    Collection Source
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/60 text-[11px] font-extrabold text-[#0284c7]">
                <span>POS vs Job Details</span>
                <span className="inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 text-[#0284c7]">
                  View <ArrowRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sparkline / Total Sales & Due Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Total Sales Paid / Collection */}
        <div
          onClick={() => setActiveTab('selling-list')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Total Sales Collection (Paid)
            </p>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            ৳{totalSalesPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Total cash received from sales transactions
          </p>

          <div className="mt-4 h-12">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
              <path
                d="M 0 25 L 25 18 L 50 22 L 75 10 L 100 4"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="25" cy="18" r="3.5" fill="#10b981" />
              <circle cx="50" cy="22" r="3.5" fill="#10b981" />
              <circle cx="75" cy="10" r="3.5" fill="#10b981" />
              <circle cx="100" cy="4" r="3.5" fill="#10b981" />
            </svg>
          </div>
        </div>

        {/* Total Due Balance */}
        <div
          onClick={() => setActiveTab('due-list')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Total Pending Due Balance
            </p>
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600 mt-2">
            ৳{totalDueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Total outstanding payments owed by clients
          </p>

          <div className="mt-4 h-12">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
              <path
                d="M 0 22 L 25 12 L 50 18 L 75 8 L 100 2"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="25" cy="12" r="3.5" fill="#f43f5e" />
              <circle cx="50" cy="18" r="3.5" fill="#f43f5e" />
              <circle cx="75" cy="8" r="3.5" fill="#f43f5e" />
              <circle cx="100" cy="2" r="3.5" fill="#f43f5e" />
            </svg>
          </div>
        </div>
      </div>

      {/* Live Recent Sales Full Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-black text-slate-900">Live Recent Sales</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Real-time POS checkout transactions recorded in the system
            </p>
          </div>
          <button
            onClick={() => setActiveTab('selling-list')}
            className="text-xs font-extrabold text-[#0284c7] hover:text-sky-700 flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 transition-colors cursor-pointer"
          >
            <span>View All Selling Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-y border-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider">
                <th className="py-3.5 px-3 text-center w-12">SL</th>
                <th className="py-3.5 px-4">PRODUCT / ITEMS</th>
                <th className="py-3.5 px-3">CUSTOMER / PHONE</th>
                <th className="py-3.5 px-3 text-center">QTY</th>
                <th className="py-3.5 px-3 text-right">NET AMOUNT</th>
                <th className="py-3.5 px-3 text-right">PAID AMOUNT</th>
                <th className="py-3.5 px-3 text-center">SALES PERSON</th>
                <th className="py-3.5 px-3 text-center">DATE & TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-semibold text-sm">
                    No recent sales records available. Process a sale in POS to see live updates.
                  </td>
                </tr>
              ) : (
                recentSales.map((sale, index) => (
                  <tr key={sale.id} className="hover:bg-sky-50/20 transition-colors">
                    <td className="py-3.5 px-3 text-slate-500 font-bold text-center text-xs">{index + 1}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm max-w-[280px]">
                      {sale.productName}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-extrabold text-slate-800 text-xs">{sale.customerName || 'Walk-in Customer'}</p>
                      <p className="font-mono text-[11px] text-slate-500 font-semibold">{sale.phone || 'N/A'}</p>
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-slate-800">{sale.qty}</td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-800">৳{sale.afterLassAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="inline-block px-2.5 py-1 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                        ৳{sale.payAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-md">
                        {sale.salesPerson}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-center text-xs font-semibold">
                      {sale.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



