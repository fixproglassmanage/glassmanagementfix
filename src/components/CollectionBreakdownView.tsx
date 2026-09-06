import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Wrench,
  DollarSign,
  Search,
  Calendar,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Layers,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  List,
  Phone,
  User,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { SellingListItem, DueListItem } from '../types';

interface CollectionBreakdownViewProps {
  setActiveTab: (tab: string) => void;
  salesList: SellingListItem[];
  dueList?: DueListItem[];
  activeUser?: {
    name: string;
    role: string;
  };
}

export const CollectionBreakdownView: React.FC<CollectionBreakdownViewProps> = ({
  setActiveTab,
  salesList = [],
  activeUser,
}) => {
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, today, yesterday, 7days, month, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Mobile Active Tab Selector: 'all' (Both side-by-side or stacked), 'pos' (POS only), 'job' (Job only)
  const [mobileActiveView, setMobileActiveView] = useState<'all' | 'pos' | 'job'>('all');
  // Display Mode on mobile: 'cards' or 'table'
  const [viewFormat, setViewFormat] = useState<'cards' | 'table'>('cards');

  const [posSearch, setPosSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [posStatusFilter, setPosStatusFilter] = useState<string>('all');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('all');

  // Helper date parser
  const parseItemDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr === '—') return null;
    if (dateStr.includes('-')) {
      const parts = dateStr.split(' ')[0].split('-');
      if (parts[0].length === 4) {
        return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else if (parts[2]?.length === 4) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const isWithinDateRange = (itemDateStr: string) => {
    if (dateFilter === 'all') return true;
    const itemDate = parseItemDate(itemDateStr);
    if (!itemDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const itemDay = new Date(itemDate);
    itemDay.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      return itemDay.getTime() === today.getTime();
    }
    if (dateFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return itemDay.getTime() === yesterday.getTime();
    }
    if (dateFilter === '7days') {
      const past7 = new Date(today);
      past7.setDate(today.getDate() - 7);
      return itemDay.getTime() >= past7.getTime();
    }
    if (dateFilter === 'month') {
      return (
        itemDay.getMonth() === today.getMonth() &&
        itemDay.getFullYear() === today.getFullYear()
      );
    }
    if (dateFilter === 'custom') {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return itemDay.getTime() >= start.getTime() && itemDay.getTime() <= end.getTime();
      } else if (customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        return itemDay.getTime() >= start.getTime();
      } else if (customEndDate) {
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return itemDay.getTime() <= end.getTime();
      }
    }
    return true;
  };

  // Filtered POS Items (Left Side)
  const posItems = useMemo(() => {
    return salesList.filter(item => {
      if (item.source === 'shop_job') return false;
      if (!isWithinDateRange(item.date || '')) return false;

      if (posStatusFilter !== 'all') {
        if (posStatusFilter === 'Paid' && item.paymentStatus !== 'Paid') return false;
        if (posStatusFilter === 'Partial' && item.paymentStatus !== 'Partial') return false;
        if (posStatusFilter === 'Unpaid' && item.paymentStatus !== 'Unpaid') return false;
      }

      if (posSearch.trim()) {
        const q = posSearch.toLowerCase();
        const mCustomer = (item.customerName || '').toLowerCase().includes(q);
        const mProduct = (item.productName || '').toLowerCase().includes(q);
        const mPhone = (item.phone || '').toLowerCase().includes(q);
        const mId = (item.id || '').toLowerCase().includes(q);
        if (!mCustomer && !mProduct && !mPhone && !mId) return false;
      }
      return true;
    });
  }, [salesList, dateFilter, customStartDate, customEndDate, posStatusFilter, posSearch]);

  // Filtered Shop Job Items (Right Side)
  const jobItems = useMemo(() => {
    return salesList.filter(item => {
      if (item.source !== 'shop_job') return false;
      if (!isWithinDateRange(item.date || '')) return false;

      if (jobStatusFilter !== 'all') {
        if (jobStatusFilter === 'Paid' && item.paymentStatus !== 'Paid') return false;
        if (jobStatusFilter === 'Partial' && item.paymentStatus !== 'Partial') return false;
        if (jobStatusFilter === 'Unpaid' && item.paymentStatus !== 'Unpaid') return false;
      }

      if (jobSearch.trim()) {
        const q = jobSearch.toLowerCase();
        const mCustomer = (item.customerName || '').toLowerCase().includes(q);
        const mProduct = (item.productName || '').toLowerCase().includes(q);
        const mPhone = (item.phone || '').toLowerCase().includes(q);
        const mId = (item.id || '').toLowerCase().includes(q);
        if (!mCustomer && !mProduct && !mPhone && !mId) return false;
      }
      return true;
    });
  }, [salesList, dateFilter, customStartDate, customEndDate, jobStatusFilter, jobSearch]);

  // POS Statistics
  const posTotals = useMemo(() => {
    const totalCollected = posItems.reduce((s, i) => s + (Number(i.payAmount) || 0), 0);
    const totalSales = posItems.reduce((s, i) => s + (Number(i.afterLassAmount || i.sellingPrice) || 0), 0);
    const totalDue = posItems.reduce((s, i) => s + (Number(i.due) || 0), 0);
    return { totalCollected, totalSales, totalDue, count: posItems.length };
  }, [posItems]);

  // Shop Job Statistics
  const jobTotals = useMemo(() => {
    const totalCollected = jobItems.reduce((s, i) => s + (Number(i.payAmount) || 0), 0);
    const totalValue = jobItems.reduce((s, i) => s + (Number(i.afterLassAmount || i.sellingPrice) || 0), 0);
    const totalDue = jobItems.reduce((s, i) => s + (Number(i.due) || 0), 0);
    return { totalCollected, totalValue, totalDue, count: jobItems.length };
  }, [jobItems]);

  const grandCollected = posTotals.totalCollected + jobTotals.totalCollected;
  const posShare = grandCollected > 0 ? (posTotals.totalCollected / grandCollected) * 100 : 0;
  const jobShare = grandCollected > 0 ? (jobTotals.totalCollected / grandCollected) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Type', 'SL', 'Date', 'Customer/Shop', 'Phone', 'Item / Work Description', 'Total Amount', 'Collected (Paid)', 'Due Amount', 'Status'];
    const rows: (string | number)[][] = [];

    posItems.forEach((p, idx) => {
      rows.push([
        'POS Selling',
        idx + 1,
        `"${p.date || ''}"`,
        `"${p.customerName || 'Walk-in'}"`,
        `"${p.phone || 'N/A'}"`,
        `"${p.productName || ''}"`,
        p.afterLassAmount || 0,
        p.payAmount || 0,
        p.due || 0,
        p.paymentStatus || 'Unpaid',
      ]);
    });

    jobItems.forEach((j, idx) => {
      rows.push([
        'Shop Job Entry',
        idx + 1,
        `"${j.date || ''}"`,
        `"${j.customerName || 'Customer'}"`,
        `"${j.phone || 'N/A'}"`,
        `"${j.productName || ''}"`,
        j.afterLassAmount || 0,
        j.payAmount || 0,
        j.due || 0,
        j.paymentStatus || 'Unpaid',
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Collection_POS_vs_Job_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6 max-w-[1800px] mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#0284c7] hover:border-sky-300 hover:bg-sky-50/50 transition-all cursor-pointer shadow-2xs group shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  Collection Breakdown
                </h1>
                <span className="text-[10px] sm:text-xs font-black text-[#0284c7] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  POS vs Shop Job
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5 truncate">
                Compare side-by-side collections between POS Selling and Shop Job Entries
              </p>
            </div>
          </div>

          {/* Action Buttons & Format Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {/* View Format Selector for mobile (Cards vs Table) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewFormat('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewFormat === 'cards' ? 'bg-white text-[#0284c7] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card View (Mobile Optimized)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xs:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewFormat === 'table' ? 'bg-white text-[#0284c7] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xs:inline">Table</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200/80 transition-all cursor-pointer"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-black text-white bg-[#0284c7] hover:bg-sky-600 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Filter Bar & Custom Date Range */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date:
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7days', label: 'Last 7 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'custom', label: 'Custom Date' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setDateFilter(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  dateFilter === pill.id
                    ? 'bg-[#0284c7] text-white shadow-2xs ring-2 ring-sky-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs (Clean responsive layout) */}
          {dateFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-sky-50/70 rounded-xl border border-sky-200">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-bold text-slate-600 w-10 sm:w-auto">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-bold text-slate-600 w-10 sm:w-auto">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-300"
                />
              </div>
              {(customStartDate || customEndDate) && (
                <button
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Grand Collection */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Total Grand Collection
            </span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            ৳{grandCollected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3 flex">
            <div style={{ width: `${posShare}%` }} className="bg-[#0284c7] h-full" title={`POS: ${posShare.toFixed(1)}%`} />
            <div style={{ width: `${jobShare}%` }} className="bg-amber-500 h-full" title={`Job: ${jobShare.toFixed(1)}%`} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-2">
            <span className="text-sky-700">POS: {posShare.toFixed(1)}%</span>
            <span className="text-amber-700">Job: {jobShare.toFixed(1)}%</span>
          </div>
        </div>

        {/* POS Collection Quick Card */}
        <div
          onClick={() => setMobileActiveView('pos')}
          className={`bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            mobileActiveView === 'pos' ? 'border-sky-400 ring-2 ring-sky-300' : 'border-sky-200 shadow-2xs hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-sky-900">
                POS Selling
              </span>
            </div>
            <span className="text-xs font-extrabold text-sky-700 bg-white px-2 py-0.5 rounded-md border border-sky-200">
              {posTotals.count} Invoices
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-700 mt-2">
            ৳{posTotals.totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mt-2 pt-2 border-t border-sky-100">
            <span>Sales: ৳{posTotals.totalSales.toLocaleString('en-IN')}</span>
            <span className="text-rose-600">Due: ৳{posTotals.totalDue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Shop Job Collection Quick Card */}
        <div
          onClick={() => setMobileActiveView('job')}
          className={`bg-gradient-to-br from-amber-50 to-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            mobileActiveView === 'job' ? 'border-amber-400 ring-2 ring-amber-300' : 'border-amber-200 shadow-2xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Shop Job Entry
              </span>
            </div>
            <span className="text-xs font-extrabold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200">
              {jobTotals.count} Jobs
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
            ৳{jobTotals.totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mt-2 pt-2 border-t border-amber-100">
            <span>Value: ৳{jobTotals.totalValue.toLocaleString('en-IN')}</span>
            <span className="text-rose-600">Due: ৳{jobTotals.totalDue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Screen View Switcher Tabs (Only visible on small & medium screens) */}
      <div className="flex xl:hidden bg-slate-200/80 p-1 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setMobileActiveView('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileActiveView === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Both Views</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveView('pos')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileActiveView === 'pos'
              ? 'bg-[#0284c7] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>POS (৳{posTotals.totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveView('job')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileActiveView === 'job'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Job (৳{jobTotals.totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })})</span>
        </button>
      </div>

      {/* Main Side-by-Side Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* ================= LEFT SIDE: POS SELLING COLLECTION ================= */}
        {(mobileActiveView === 'all' || mobileActiveView === 'pos') && (
          <div className="bg-white rounded-2xl border border-sky-200 shadow-2xs overflow-hidden flex flex-col">
            {/* Left Column Header */}
            <div className="bg-sky-50/80 p-3.5 sm:p-4 border-b border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shadow-xs shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    POS Selling Collection
                  </h2>
                  <p className="text-[10px] sm:text-[11px] font-bold text-sky-800">
                    Direct counter sales and checkout collections
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Collected: ৳{posTotals.totalCollected.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Left Filter & Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={posSearch}
                  onChange={e => setPosSearch(e.target.value)}
                  placeholder="Search POS items, customer, phone..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <select
                value={posStatusFilter}
                onChange={e => setPosStatusFilter(e.target.value)}
                className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
              >
                <option value="all">All</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            {/* Content: Cards View for Mobile OR Table View */}
            {viewFormat === 'cards' ? (
              <div className="p-3 space-y-2.5 max-h-[580px] overflow-y-auto bg-slate-50/40">
                {posItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-semibold text-xs">
                    No POS sales records found.
                  </div>
                ) : (
                  posItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-black text-slate-800 truncate">
                              {item.productName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold">
                            <span className="flex items-center gap-0.5 text-slate-700 font-bold truncate">
                              <User className="w-3 h-3 text-slate-400" />
                              {item.customerName || 'Walk-in'}
                            </span>
                            {item.phone && item.phone !== 'N/A' && (
                              <span className="flex items-center gap-0.5 font-mono text-[10px]">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                {item.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded shrink-0 ${
                            item.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.paymentStatus === 'Partial'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </div>

                      {/* Amounts Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Net Total</span>
                          <span className="font-bold text-slate-700">
                            ৳{(item.afterLassAmount || item.sellingPrice || 0).toFixed(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 font-bold block uppercase">Collected (Paid)</span>
                          <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ৳{(item.payAmount || 0).toFixed(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-500 font-bold block uppercase">Due</span>
                          <span className={`font-black ${(item.due || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            ৳{(item.due || 0).toFixed(0)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Date</span>
                          <span className="text-[10.5px] font-mono text-slate-500">
                            {item.date?.split(' ')[0] || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* POS Table View */
              <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-2 text-center w-8">SL</th>
                      <th className="py-2.5 px-3">Item / Product</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-2 text-right">Net</th>
                      <th className="py-2.5 px-2 text-right text-emerald-700">Collected</th>
                      <th className="py-2.5 px-2 text-right text-rose-600">Due</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                      <th className="py-2.5 px-2 text-center">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {posItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 font-semibold text-xs">
                          No POS sales records found.
                        </td>
                      </tr>
                    ) : (
                      posItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-sky-50/30 transition-colors">
                          <td className="py-2.5 px-2 text-slate-400 font-bold text-center text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-800 max-w-[160px] truncate" title={item.productName}>
                            {item.productName}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-slate-800 truncate max-w-[120px]">{item.customerName || 'Walk-in'}</p>
                            <p className="font-mono text-[10px] text-slate-400">{item.phone && item.phone !== 'N/A' ? item.phone : ''}</p>
                          </td>
                          <td className="py-2.5 px-2 text-right font-black text-slate-700">
                            ৳{(item.afterLassAmount || item.sellingPrice || 0).toFixed(0)}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <span className="font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              ৳{(item.payAmount || 0).toFixed(0)}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-black">
                            {(item.due || 0) > 0 ? (
                              <span className="text-rose-600">৳{(item.due || 0).toFixed(0)}</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                item.paymentStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.paymentStatus === 'Partial'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {item.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-slate-500 font-mono text-center text-[10px]">
                            {item.date?.split(' ')[0] || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Left Column Summary Footer */}
            <div className="bg-sky-50/50 p-3 border-t border-sky-200 flex flex-wrap items-center justify-between gap-2 text-xs font-black text-slate-800">
              <span>{posItems.length} POS Items</span>
              <div className="flex items-center gap-2.5 text-[11px] sm:text-xs">
                <span className="text-slate-600">Total: ৳{posTotals.totalSales.toLocaleString('en-IN')}</span>
                <span className="text-emerald-700">Paid: ৳{posTotals.totalCollected.toLocaleString('en-IN')}</span>
                <span className="text-rose-600">Due: ৳{posTotals.totalDue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= RIGHT SIDE: SHOP JOB ENTRY COLLECTION ================= */}
        {(mobileActiveView === 'all' || mobileActiveView === 'job') && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-2xs overflow-hidden flex flex-col">
            {/* Right Column Header */}
            <div className="bg-amber-50/80 p-3.5 sm:p-4 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    Shop Job Entry Collection
                  </h2>
                  <p className="text-[10px] sm:text-[11px] font-bold text-amber-800">
                    Technician service and repair job collections
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Collected: ৳{jobTotals.totalCollected.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Right Filter & Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  placeholder="Search Repair job, shop, phone..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <select
                value={jobStatusFilter}
                onChange={e => setJobStatusFilter(e.target.value)}
                className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
              >
                <option value="all">All</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            {/* Content: Cards View for Mobile OR Table View */}
            {viewFormat === 'cards' ? (
              <div className="p-3 space-y-2.5 max-h-[580px] overflow-y-auto bg-slate-50/40">
                {jobItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-semibold text-xs">
                    No Shop Job repair records found.
                  </div>
                ) : (
                  jobItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              #{idx + 1} 🔧
                            </span>
                            <span className="text-xs font-black text-slate-800 truncate">
                              {item.productName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold">
                            <span className="flex items-center gap-0.5 text-slate-700 font-bold truncate">
                              <User className="w-3 h-3 text-slate-400" />
                              {item.customerName || 'Customer'}
                            </span>
                            {item.phone && item.phone !== 'N/A' && (
                              <span className="flex items-center gap-0.5 font-mono text-[10px]">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                {item.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded shrink-0 ${
                            item.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.paymentStatus === 'Partial'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </div>

                      {/* Amounts Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Job Charge</span>
                          <span className="font-bold text-slate-700">
                            ৳{(item.afterLassAmount || item.sellingPrice || 0).toFixed(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 font-bold block uppercase">Collected (Paid)</span>
                          <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ৳{(item.payAmount || 0).toFixed(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-500 font-bold block uppercase">Due</span>
                          <span className={`font-black ${(item.due || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            ৳{(item.due || 0).toFixed(0)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Date</span>
                          <span className="text-[10.5px] font-mono text-slate-500">
                            {item.date?.split(' ')[0] || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Shop Job Table View */
              <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-2 text-center w-8">SL</th>
                      <th className="py-2.5 px-3">Repair Work / Job</th>
                      <th className="py-2.5 px-3">Shop / Customer</th>
                      <th className="py-2.5 px-2 text-right">Charge</th>
                      <th className="py-2.5 px-2 text-right text-emerald-700">Collected</th>
                      <th className="py-2.5 px-2 text-right text-rose-600">Due</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                      <th className="py-2.5 px-2 text-center">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {jobItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 font-semibold text-xs">
                          No Shop Job repair records found.
                        </td>
                      </tr>
                    ) : (
                      jobItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-2.5 px-2 text-slate-400 font-bold text-center text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-800 max-w-[160px] truncate" title={item.productName}>
                            <div className="flex items-center gap-1">
                              <span className="text-amber-500 text-[11px]">🔧</span>
                              <span className="truncate">{item.productName}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-slate-800 truncate max-w-[120px]">{item.customerName || 'Customer'}</p>
                            <p className="font-mono text-[10px] text-slate-400">{item.phone && item.phone !== 'N/A' ? item.phone : ''}</p>
                          </td>
                          <td className="py-2.5 px-2 text-right font-black text-slate-700">
                            ৳{(item.afterLassAmount || item.sellingPrice || 0).toFixed(0)}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <span className="font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              ৳{(item.payAmount || 0).toFixed(0)}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-black">
                            {(item.due || 0) > 0 ? (
                              <span className="text-rose-600">৳{(item.due || 0).toFixed(0)}</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                item.paymentStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.paymentStatus === 'Partial'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {item.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-slate-500 font-mono text-center text-[10px]">
                            {item.date?.split(' ')[0] || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Right Column Summary Footer */}
            <div className="bg-amber-50/50 p-3 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs font-black text-slate-800">
              <span>{jobItems.length} Job Repairs</span>
              <div className="flex items-center gap-2.5 text-[11px] sm:text-xs">
                <span className="text-slate-600">Total: ৳{jobTotals.totalValue.toLocaleString('en-IN')}</span>
                <span className="text-emerald-700">Paid: ৳{jobTotals.totalCollected.toLocaleString('en-IN')}</span>
                <span className="text-rose-600">Due: ৳{jobTotals.totalDue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
