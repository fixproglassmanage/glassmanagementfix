import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Plus,
  Trash2,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Package,
  X,
  Calendar,
} from 'lucide-react';
import { SellingListItem, DueListItem, Product, Customer, ReturnItem } from '../types';

interface ReportViewProps {
  salesList?: SellingListItem[];
  dueList?: DueListItem[];
  products?: Product[];
  customers?: Customer[];
  returnList?: ReturnItem[];
  setReturnList?: React.Dispatch<React.SetStateAction<ReturnItem[]>>;
  activeUser?: { name: string; role: string };
  initialReportType?: 'sales' | 'paid' | 'return' | 'due' | 'inventory';
}

export const ReportView: React.FC<ReportViewProps> = ({
  salesList = [],
  dueList = [],
  products = [],
  customers = [],
  returnList = [],
  setReturnList,
  activeUser,
  initialReportType = 'sales',
}) => {
  const [reportType, setReportType] = useState<'sales' | 'paid' | 'return' | 'due' | 'inventory'>(initialReportType);
  const [searchQuery, setSearchQuery] = useState('');

  // Date Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    if (initialReportType) {
      setReportType(initialReportType);
    }
  }, [initialReportType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [reportType, searchQuery, startDate, endDate, entriesPerPage]);

  // Date Filter Helpers
  const getLocalDateString = (d: Date = new Date()) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const handlePresetAllTime = () => {
    setStartDate('');
    setEndDate('');
  };

  const handlePresetToday = () => {
    const today = getLocalDateString();
    setStartDate(today);
    setEndDate(today);
  };

  const handlePresetThisMonth = () => {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const firstDayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(lastDay.getDate())}`;
    setStartDate(firstDayStr);
    setEndDate(lastDayStr);
  };

  const now = new Date();
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  const currentMonthFirst = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const isThisMonthSelected = startDate === currentMonthFirst;

  const isDateInRange = (dateStr?: string) => {
    if (!startDate && !endDate) return true;
    if (!dateStr || dateStr === '—' || dateStr.trim() === '') return false;
    const d = dateStr.trim().substring(0, 10);
    if (!d || d.length < 10) return false;

    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  };

  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string>('');
  const [soldDate, setSoldDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [productName, setProductName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [qty, setQty] = useState(1);
  const [returnAmount, setReturnAmount] = useState(0);
  const [salesPerson, setSalesPerson] = useState(activeUser?.name || 'Shop=PC');
  const [reason, setReason] = useState('Defective item / Refund');

  // Filtered Paid Sales base
  const paidSales = salesList.filter(
    s => s.paymentStatus === 'Paid' || (s.due === 0 && s.payAmount > 0)
  );

  // Filter Data based on Search and Custom Date Filter
  const filteredReturns = returnList.filter(r => {
    const matchesSearch =
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.salesPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = isDateInRange(r.returnDate) || isDateInRange(r.soldDate);
    return matchesSearch && matchesDate;
  });

  const filteredPaidSales = paidSales.filter(s => {
    const matchesSearch =
      s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.phone && s.phone.includes(searchQuery)) ||
      s.salesPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate =
      isDateInRange(s.paidDate) ||
      isDateInRange(s.dueReceivedDate) ||
      isDateInRange(s.date);

    return matchesSearch && matchesDate;
  });

  const filteredAllSales = salesList.filter(s => {
    const matchesSearch =
      s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.phone && s.phone.includes(searchQuery));

    const matchesDate =
      isDateInRange(s.date) ||
      isDateInRange(s.paidDate) ||
      isDateInRange(s.dueReceivedDate);

    return matchesSearch && matchesDate;
  });

  const filteredDueList = dueList.filter(d => {
    const matchesSearch =
      d.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery);

    const matchesDate = isDateInRange(d.date) || isDateInRange(d.lastPaymentDate);
    return matchesSearch && matchesDate;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = isDateInRange(p.date);
    return matchesSearch && matchesDate;
  });

  // Calculations for summary metrics based on filtered lists
  const totalSalesVolume = filteredAllSales.reduce((sum, s) => sum + (Number(s.afterLassAmount) || 0), 0);
  const totalPaidVolume = filteredPaidSales.reduce((sum, s) => sum + (Number(s.payAmount) || 0), 0);
  const totalReturnVolume = filteredReturns.reduce((sum, r) => sum + (Number(r.returnAmount) || 0), 0);
  const totalReturnQty = filteredReturns.reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
  const totalDueVolume = filteredDueList.reduce((sum, d) => sum + (Number(d.due) || 0), 0);

  // Active dataset for current report type
  const getCurrentDataset = () => {
    switch (reportType) {
      case 'return':
        return filteredReturns;
      case 'paid':
        return filteredPaidSales;
      case 'due':
        return filteredDueList;
      case 'inventory':
        return filteredProducts;
      case 'sales':
      default:
        return filteredAllSales;
    }
  };

  const currentDataset = getCurrentDataset();
  const totalEntries = currentDataset.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);

  const paginatedReturns = filteredReturns.slice(startIndex, endIndex);
  const paginatedPaidSales = filteredPaidSales.slice(startIndex, endIndex);
  const paginatedAllSales = filteredAllSales.slice(startIndex, endIndex);
  const paginatedDueList = filteredDueList.slice(startIndex, endIndex);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = validCurrentPage - 1; i <= validCurrentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Open Modal to Record New Return
  const handleOpenReturnModal = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setSelectedSaleId('');
    setSoldDate(nowStr.substring(0, 10));
    setReturnDate(nowStr);
    setProductName('');
    setCustomerName('');
    setPhone('');
    setQty(1);
    setReturnAmount(0);
    setSalesPerson(activeUser?.name || 'Shop=PC');
    setReason('Defective item / Refund');
    setIsReturnModalOpen(true);
  };

  // Populate return fields when selecting a recent sale
  const handleSelectSaleForReturn = (saleId: string) => {
    setSelectedSaleId(saleId);
    const sale = salesList.find(s => s.id === saleId);
    if (sale) {
      setSoldDate(sale.date);
      setProductName(sale.productName);
      setCustomerName(sale.customerName || 'Walk-in Customer');
      setPhone(sale.phone || '');
      setQty(sale.qty);
      setReturnAmount(sale.payAmount || sale.afterLassAmount);
      setSalesPerson(sale.salesPerson || activeUser?.name || 'Shop=PC');
    }
  };

  // Submit New Return
  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !returnDate) return;

    const newReturn: ReturnItem = {
      id: Date.now().toString(),
      sl: returnList.length + 1,
      soldDate: soldDate || new Date().toISOString().substring(0, 10),
      returnDate: returnDate || new Date().toISOString().replace('T', ' ').substring(0, 19),
      productName,
      customerName: customerName || 'Walk-in Customer',
      phone: phone || 'N/A',
      qty: Number(qty) || 1,
      returnAmount: Number(returnAmount) || 0,
      salesPerson: salesPerson || activeUser?.name || 'Shop=PC',
      reason,
    };

    if (setReturnList) {
      setReturnList(prev => [newReturn, ...prev]);
    }
    setIsReturnModalOpen(false);
  };

  const handleDeleteReturn = (id: string) => {
    if (confirm('Are you sure you want to remove this return record?')) {
      if (setReturnList) {
        setReturnList(prev => prev.filter(r => r.id !== id));
      }
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'return') {
      csvContent += 'SL,Sold Date,Return Date & Time,Product Name,Customer,Phone,Qty,Return Amount,Sales Person,Reason\n';
      filteredReturns.forEach(r => {
        csvContent += `"${r.sl}","${r.soldDate}","${r.returnDate}","${r.productName}","${r.customerName}","${r.phone}","${r.qty}","${r.returnAmount}","${r.salesPerson}","${r.reason || ''}"\n`;
      });
    } else if (reportType === 'paid') {
      csvContent += 'SL,Date & Time,Product Name,Customer,Phone,Qty,Net Amount,Paid Amount,Sales Person\n';
      filteredPaidSales.forEach(s => {
        csvContent += `"${s.sl}","${s.date}","${s.productName}","${s.customerName || ''}","${s.phone || ''}","${s.qty}","${s.afterLassAmount}","${s.payAmount}","${s.salesPerson}"\n`;
      });
    } else {
      csvContent += 'SL,Date,Product Name,Qty,Amount,Status,Sales Person\n';
      filteredAllSales.forEach(s => {
        csvContent += `"${s.sl}","${s.date}","${s.productName}","${s.qty}","${s.afterLassAmount}","${s.paymentStatus}","${s.salesPerson}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}-report-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for title & description metadata per sub-category page
  const getHeaderInfo = () => {
    switch (reportType) {
      case 'paid':
        return {
          title: 'Paid List',
          subtitle: 'Filtered view of all sales transactions with 100% paid status and zero due balance',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          metricText: `Total Paid Collection: ৳${totalPaidVolume.toFixed(2)} (${filteredPaidSales.length} Orders)`,
          metricBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'return':
        return {
          title: 'Return List',
          subtitle: 'Product return ledger with original sold dates, return date-time, and refund amounts',
          icon: RotateCcw,
          iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
          metricText: `Total Return Refund: ৳${totalReturnVolume.toFixed(2)} (${totalReturnQty} Qty)`,
          metricBadge: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'due':
        return {
          title: 'Due Collection Ledger',
          subtitle: 'Outstanding customer debt balances and due collection records',
          icon: AlertCircle,
          iconColor: 'text-rose-600 bg-rose-50 border-rose-100',
          metricText: `Outstanding Due Ledger: ৳${totalDueVolume.toFixed(2)} (${filteredDueList.length} Accounts)`,
          metricBadge: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'inventory':
        return {
          title: 'Inventory Stock Ledger',
          subtitle: 'Comprehensive inventory stock counts, categories, and selling rates',
          icon: Package,
          iconColor: 'text-sky-600 bg-sky-50 border-sky-100',
          metricText: `Total Managed Products: ${filteredProducts.length} Items`,
          metricBadge: 'bg-sky-50 text-sky-800 border-sky-200',
        };
      case 'sales':
      default:
        return {
          title: 'Sales Report',
          subtitle: 'Comprehensive ledger breakdowns for all store sales and transactions',
          icon: BarChart3,
          iconColor: 'text-[#0284c7] bg-sky-50 border-sky-100',
          metricText: `Total Sales Volume: ৳${totalSalesVolume.toFixed(2)} (${filteredAllSales.length} Sales)`,
          metricBadge: 'bg-sky-50 text-sky-800 border-sky-200',
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1700px] mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-4 sm:p-6 space-y-5">
        {/* Dedicated Clean Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${headerInfo.iconColor}`}>
              <HeaderIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-slate-900">{headerInfo.title}</h2>
                <span className={`px-2.5 py-0.5 text-xs font-black rounded-full border ${headerInfo.metricBadge}`}>
                  {headerInfo.metricText}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {reportType === 'return' && (
              <button
                onClick={handleOpenReturnModal}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-white" />
                + Record Return Item
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-black rounded-xl transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Excel / CSV
            </button>
          </div>
        </div>

        {/* Date Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          {/* Custom Date Selection Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Date Filter:</span>
            </div>

            {/* Quick Presets */}
            <button
              onClick={handlePresetAllTime}
              type="button"
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                !startDate && !endDate
                  ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              All Time
            </button>
            <button
              onClick={handlePresetToday}
              type="button"
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                startDate === getLocalDateString() && endDate === getLocalDateString()
                  ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={handlePresetThisMonth}
              type="button"
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isThisMonthSelected
                  ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              This Month
            </button>

            {/* Custom Range Picker */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-300 text-xs shadow-2xs">
              <span className="text-slate-500 font-bold px-1">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-1.5 py-0.5 text-xs font-extrabold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
              <span className="text-slate-400 font-bold">-</span>
              <span className="text-slate-500 font-bold px-1">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-1.5 py-0.5 text-xs font-extrabold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
              {(startDate || endDate) && (
                <button
                  onClick={handlePresetAllTime}
                  type="button"
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-md hover:bg-slate-100 cursor-pointer"
                  title="Clear Date Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  reportType === 'return'
                    ? 'Search returned products, customer phone...'
                    : reportType === 'paid'
                    ? 'Search paid transactions...'
                    : reportType === 'due'
                    ? 'Search due records...'
                    : reportType === 'inventory'
                    ? 'Search stock...'
                    : 'Search sales records...'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <p className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:block">
              Total {totalEntries} record(s)
            </p>
          </div>
        </div>

        {/* Entries per page dropdown & range text */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600 px-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Show</span>
            <select
              value={entriesPerPage}
              onChange={e => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0284c7] bg-white cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="font-semibold text-slate-700">entries</span>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
          </div>
        </div>

        {/* ======================= RETURN LIST TAB ======================= */}
        {reportType === 'return' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider">
                    <th className="py-3.5 px-3 text-center w-12">SL</th>
                    <th className="py-3.5 px-3">SALE DATE & TIME</th>
                    <th className="py-3.5 px-4">PRODUCT NAME</th>
                    <th className="py-3.5 px-3">CUSTOMER / PHONE</th>
                    <th className="py-3.5 px-3 text-center">QTY</th>
                    <th className="py-3.5 px-3 text-right">RETURN AMOUNT</th>
                    <th className="py-3.5 px-3 text-center">RETURN DATE & TIME</th>
                    <th className="py-3.5 px-3 text-center">HANDLED BY</th>
                    <th className="py-3.5 px-3">REASON</th>
                    <th className="py-3.5 px-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedReturns.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold text-sm">
                        No returned product records found. Click "+ Record Return Item" above to add a return.
                      </td>
                    </tr>
                  ) : (
                    paginatedReturns.map((item, index) => (
                      <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3.5 px-3 text-slate-500 font-bold text-center text-xs">{startIndex + index + 1}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-600 text-xs font-bold">{item.soldDate}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm max-w-[240px]">
                          {item.productName}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-extrabold text-slate-800 text-xs">{item.customerName}</p>
                          <p className="font-mono text-[11px] text-slate-500 font-semibold">{item.phone}</p>
                        </td>
                        <td className="py-3.5 px-3 text-center font-black text-slate-800">{item.qty}</td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="inline-block px-2.5 py-1 text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                            ৳{item.returnAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-amber-800 text-xs text-center font-black bg-amber-50/50 rounded-lg">
                          {item.returnDate}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-md">
                            {item.salesPerson}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600 font-medium italic max-w-[180px]">
                          {item.reason || '—'}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleDeleteReturn(item.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Remove Return Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= PAID LIST TAB ======================= */}
        {reportType === 'paid' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider">
                    <th className="py-3.5 px-3 text-center w-12">SL</th>
                    <th className="py-3.5 px-3 text-center">SALE DATE & TIME</th>
                    <th className="py-3.5 px-4">PRODUCT / ITEM</th>
                    <th className="py-3.5 px-3">CUSTOMER / PHONE</th>
                    <th className="py-3.5 px-3 text-center">QTY</th>
                    <th className="py-3.5 px-3 text-right">NET AMOUNT</th>
                    <th className="py-3.5 px-3 text-right">PAID AMOUNT</th>
                    <th className="py-3.5 px-3 text-center">PAID DATE & TIME</th>
                    <th className="py-3.5 px-3 text-center">STATUS</th>
                    <th className="py-3.5 px-3 text-center">SALES PERSON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPaidSales.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold text-sm">
                        No fully paid transaction records match your search filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedPaidSales.map((item, index) => (
                      <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="py-3.5 px-3 text-slate-500 font-bold text-center text-xs">{startIndex + index + 1}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-700 text-xs text-center font-bold">
                          {item.date}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm max-w-[280px]">
                          {item.productName}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-extrabold text-slate-800 text-xs">{item.customerName || 'Walk-in Customer'}</p>
                          <p className="font-mono text-[11px] text-slate-500 font-semibold">{item.phone || 'N/A'}</p>
                        </td>
                        <td className="py-3.5 px-3 text-center font-black text-slate-800">{item.qty}</td>
                        <td className="py-3.5 px-3 text-right font-black text-slate-800">৳{item.afterLassAmount.toFixed(2)}</td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="inline-block px-2.5 py-1 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                            ৳{item.payAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-emerald-800 text-xs text-center font-extrabold bg-emerald-50/60 rounded-md">
                          {item.paidDate || item.dueReceivedDate || item.date}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-3 py-1 text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md uppercase tracking-wider">
                            PAID
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-md">
                            {item.salesPerson}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= SALES REPORT TAB ======================= */}
        {reportType === 'sales' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider">
                    <th className="py-3.5 px-3 text-center w-12">SL</th>
                    <th className="py-3.5 px-3 text-center">SALE DATE & TIME</th>
                    <th className="py-3.5 px-4">PRODUCT</th>
                    <th className="py-3.5 px-3 text-center">QTY</th>
                    <th className="py-3.5 px-3 text-right">SELLING PRICE</th>
                    <th className="py-3.5 px-3 text-right">PAID</th>
                    <th className="py-3.5 px-3 text-right">DUE</th>
                    <th className="py-3.5 px-3 text-center">PAYMENT / ACTION DATE</th>
                    <th className="py-3.5 px-3 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAllSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold text-sm">
                        No sales records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedAllSales.map((item, index) => (
                      <tr key={item.id} className="hover:bg-sky-50/20 transition-colors">
                        <td className="py-3.5 px-3 text-slate-500 font-bold text-center text-xs">{startIndex + index + 1}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-700 text-xs text-center font-bold">{item.date}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">{item.productName}</td>
                        <td className="py-3.5 px-3 text-center font-black text-slate-800">{item.qty}</td>
                        <td className="py-3.5 px-3 text-right font-black text-slate-800">৳{item.afterLassAmount.toFixed(2)}</td>
                        <td className="py-3.5 px-3 text-right font-black text-emerald-600">৳{item.payAmount.toFixed(2)}</td>
                        <td className="py-3.5 px-3 text-right font-black text-rose-600">৳{item.due.toFixed(2)}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-600 text-xs text-center font-medium">
                          {item.paidDate || item.dueReceivedDate || (item.due <= 0 ? item.date : '—')}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2.5 py-0.5 text-xs font-black border rounded-md uppercase tracking-wider ${
                            item.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {item.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= DUE REPORT TAB ======================= */}
        {reportType === 'due' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider">
                    <th className="py-3.5 px-3 text-center w-12">SL</th>
                    <th className="py-3.5 px-3 text-center">SALE DATE & TIME</th>
                    <th className="py-3.5 px-4">CUSTOMER / PHONE</th>
                    <th className="py-3.5 px-4">PRODUCT</th>
                    <th className="py-3.5 px-3 text-right">TOTAL PRICE</th>
                    <th className="py-3.5 px-3 text-right">PAID</th>
                    <th className="py-3.5 px-3 text-right">DUE AMOUNT</th>
                    <th className="py-3.5 px-3 text-center">COLLECTION DATE & TIME</th>
                    <th className="py-3.5 px-3 text-center">SALES PERSON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedDueList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold text-sm">
                        No outstanding due debt records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedDueList.map((item, index) => (
                      <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="py-3.5 px-3 text-slate-500 font-bold text-center text-xs">{startIndex + index + 1}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-700 text-xs text-center font-bold">{item.date}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-900 text-sm">{item.customerName}</p>
                          <p className="font-mono text-xs text-slate-500">{item.phone}</p>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-800 text-sm">{item.productName}</td>
                        <td className="py-3.5 px-3 text-right font-black text-slate-800">৳{item.afterLassPrice.toFixed(2)}</td>
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-600">৳{item.payAmount.toFixed(2)}</td>
                        <td className="py-3.5 px-3 text-right font-black text-rose-600 text-base">৳{item.due.toFixed(2)}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-600 text-xs text-center font-semibold">
                          {item.lastPaymentDate || '—'}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-md">
                            {item.salesPerson}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= INVENTORY LEDGER TAB ======================= */}
        {reportType === 'inventory' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider">
                    <th className="py-3.5 px-3 text-center w-12">SL</th>
                    <th className="py-3.5 px-4">PRODUCT NAME</th>
                    <th className="py-3.5 px-3">CATEGORY</th>
                    <th className="py-3.5 px-3">BRAND</th>
                    <th className="py-3.5 px-3 text-center">STOCK QTY</th>
                    <th className="py-3.5 px-3 text-right">SELLING PRICE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-sm">
                        No products found in inventory ledger.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p, index) => (
                      <tr key={p.id} className="hover:bg-sky-50/20 transition-colors">
                        <td className="py-3.5 px-3 text-slate-500 font-bold text-center text-xs">{startIndex + index + 1}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">{p.productName}</td>
                        <td className="py-3.5 px-3 text-slate-600 font-bold text-xs">{p.category}</td>
                        <td className="py-3.5 px-3 text-slate-600 font-bold text-xs">{p.brand}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-3 py-1 text-xs font-black rounded-full ${
                            p.qty === 0 ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                          }`}>
                            {p.qty} Pcs
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-slate-800">৳{p.sellingPrice.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs sm:text-sm text-slate-600 border-t border-slate-100">
          <div>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={validCurrentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs sm:text-sm text-slate-500 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                &lsaquo; Previous
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, i) => {
                  if (p === '...') {
                    return (
                      <span key={`ellipsis-${i}`} className="px-2 py-1 text-slate-400 text-xs sm:text-sm">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = p === validCurrentPage;
                  return (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(p))}
                      className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#0284c7] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs sm:text-sm text-slate-500 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Next &rsaquo;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Record Product Return Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateReturn}
            className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-800">Record Product Return</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Select from Recent Sales */}
            {salesList.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl space-y-1.5">
                <label className="block text-xs font-black text-amber-900">
                  Quick Select from Recent Sales (Optional)
                </label>
                <select
                  value={selectedSaleId}
                  onChange={e => handleSelectSaleForReturn(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="">-- Choose a sold transaction --</option>
                  {salesList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.date} | {s.productName} ({s.customerName || 'Walk-in'} - ৳{s.payAmount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Original Sold Date *</label>
                <input
                  type="text"
                  required
                  placeholder="2026-07-28"
                  value={soldDate ?? ''}
                  onChange={e => setSoldDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Date & Time *</label>
                <input
                  type="text"
                  required
                  placeholder="2026-07-30 11:15:20"
                  value={returnDate ?? ''}
                  onChange={e => setReturnDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Returned Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Samsung A52 Glass / Display"
                value={productName ?? ''}
                onChange={e => setProductName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Farid The Mobile Zone"
                  value={customerName ?? ''}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={phone ?? ''}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Returned *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={qty ?? 1}
                  onChange={e => setQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Refund Amount (৳) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={returnAmount ?? 0}
                  onChange={e => setReturnAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-black text-amber-700 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sales Person / Received By</label>
              <input
                type="text"
                value={salesPerson ?? ''}
                onChange={e => setSalesPerson(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Return Reason / Note</label>
              <textarea
                rows={2}
                placeholder="e.g. Defective touch panel, wrong model, customer exchange"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-extrabold rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                Save Return Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
