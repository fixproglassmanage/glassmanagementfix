import React, { useState } from 'react';
import { DueListItem, SellingListItem, Customer, Product } from '../types';
import { Pencil, DollarSign, RotateCcw, X, CheckCircle, Save, Wrench, PlusCircle, AlertTriangle } from 'lucide-react';
import { TechnicianJobModal } from './TechnicianJobModal';
import { matchTextSearch } from '../utils/search';

interface DueListViewProps {
  dueList: DueListItem[];
  setDueList: React.Dispatch<React.SetStateAction<DueListItem[]>>;
  salesList?: SellingListItem[];
  setSalesList?: React.Dispatch<React.SetStateAction<SellingListItem[]>>;
  customers?: Customer[];
  setCustomers?: React.Dispatch<React.SetStateAction<Customer[]>>;
  products?: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  activeUser?: { name: string; role: string };
}

export const DueListView: React.FC<DueListViewProps> = ({
  dueList,
  setDueList,
  salesList = [],
  setSalesList,
  customers,
  setCustomers,
  products,
  setProducts,
  activeUser,
}) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  // Modals state
  const [collectItem, setCollectItem] = useState<DueListItem | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [returnItem, setReturnItem] = useState<DueListItem | null>(null);
  const [successToast, setSuccessToast] = useState<{ title: string; message: string } | null>(null);

  const [editItem, setEditItem] = useState<DueListItem | null>(null);
  const [editForm, setEditForm] = useState<{
    customerName: string;
    phone: string;
    sellingPrice: number;
    afterLassPrice: number;
    payAmount: number;
    salesPerson: string;
  }>({
    customerName: '',
    phone: '',
    sellingPrice: 0,
    afterLassPrice: 0,
    payAmount: 0,
    salesPerson: '',
  });

  // Reset filter handler
  const handleResetFilters = () => {
    setFilterDate('');
    setFilterCustomer('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Action: Open Collect Modal
  const handleOpenCollect = (item: DueListItem) => {
    setCollectItem(item);
    setCollectAmount(item.due);
  };

  // Action: Save Collect
  const handleSaveCollect = () => {
    if (!collectItem) return;
    const amount = Number(collectAmount) || 0;
    if (amount <= 0) {
      alert('Please enter a valid collection amount');
      return;
    }
    if (amount > collectItem.due + 0.01) {
      alert(`Collection amount (৳${amount}) cannot exceed current due (৳${collectItem.due})`);
      return;
    }

    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const collectionTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // 1. Update Due List
    setDueList(prev =>
      prev
        .map(item => {
          if (item.id === collectItem.id) {
            const newPay = item.payAmount + amount;
            const newDue = Math.max(0, item.afterLassPrice - newPay);
            const newStatus: 'Paid' | 'Partial' | 'Unpaid' = newDue <= 0 ? 'Paid' : 'Partial';
            return {
              ...item,
              payAmount: newPay,
              due: newDue,
              paymentStatus: newStatus,
              lastPaymentDate: collectionTime,
            };
          }
          return item;
        })
        .filter(item => item.due > 0)
    );

    // 2. Sync with Sales List if available
    if (setSalesList) {
      setSalesList(prev =>
        prev.map(s => {
          if (
            s.id === collectItem.id ||
            (s.productName === collectItem.productName &&
              s.customerName === collectItem.customerName &&
              s.date === collectItem.date)
          ) {
            const newPay = s.payAmount + amount;
            const newDue = Math.max(0, s.afterLassAmount - newPay);
            return {
              ...s,
              payAmount: newPay,
              due: newDue,
              paymentStatus: newDue <= 0 ? 'Paid' : 'Partial',
              paidDate: newDue <= 0 ? collectionTime : s.paidDate,
              dueReceivedDate: collectionTime,
            };
          }
          return s;
        })
      );
    }

    // 3. Sync Customer Ledger if available
    if (setCustomers && customers && collectItem.customerName) {
      setCustomers(prev =>
        prev.map(c => {
          if (
            c.name.toLowerCase() === collectItem.customerName.toLowerCase() ||
            (collectItem.phone !== 'N/A' && c.phone === collectItem.phone)
          ) {
            return {
              ...c,
              totalDue: Math.max(0, c.totalDue - amount),
            };
          }
          return c;
        })
      );
    }

    setCollectItem(null);
    setSuccessToast({
      title: 'Due Collected Successfully!',
      message: `Collected ৳${amount} for ${collectItem.customerName || 'Customer'}.`,
    });
    setTimeout(() => {
      setSuccessToast(null);
    }, 2000);
  };

  // Action: Open Edit Modal
  const handleOpenEdit = (item: DueListItem) => {
    setEditItem(item);
    setEditForm({
      customerName: item.customerName || '',
      phone: item.phone || '',
      sellingPrice: item.sellingPrice ?? 0,
      afterLassPrice: item.afterLassPrice ?? 0,
      payAmount: item.payAmount ?? 0,
      salesPerson: item.salesPerson || '',
    });
  };

  // Action: Save Edit
  const handleSaveEdit = () => {
    if (!editItem) return;
    const netPrice = Number(editForm.afterLassPrice) || 0;
    const pay = Number(editForm.payAmount) || 0;
    const newDue = Math.max(0, netPrice - pay);
    const newStatus: 'Paid' | 'Partial' | 'Unpaid' = newDue <= 0 ? 'Paid' : pay > 0 ? 'Partial' : 'Unpaid';

    // 1. Update Due List
    setDueList(prev =>
      prev
        .map(item => {
          if (item.id === editItem.id) {
            return {
              ...item,
              customerName: editForm.customerName.trim(),
              phone: editForm.phone.trim() || 'N/A',
              sellingPrice: Number(editForm.sellingPrice) || 0,
              afterLassPrice: netPrice,
              payAmount: pay,
              due: newDue,
              paymentStatus: newStatus,
              salesPerson: editForm.salesPerson.trim(),
            };
          }
          return item;
        })
        .filter(item => item.due > 0)
    );

    // 2. Sync with Sales List
    if (setSalesList) {
      setSalesList(prev =>
        prev.map(s => {
          if (
            s.id === editItem.id ||
            (s.productName === editItem.productName && s.date === editItem.date)
          ) {
            return {
              ...s,
              customerName: editForm.customerName.trim(),
              phone: editForm.phone.trim() || 'N/A',
              sellingPrice: Number(editForm.sellingPrice) || 0,
              afterLassAmount: netPrice,
              payAmount: pay,
              due: newDue,
              paymentStatus: newStatus,
              salesPerson: editForm.salesPerson.trim(),
            };
          }
          return s;
        })
      );
    }

    setEditItem(null);
    setSuccessToast({
      title: 'Due Item Updated!',
      message: `Updated details for ${editItem.customerName || 'Customer'}.`,
    });
    setTimeout(() => {
      setSuccessToast(null);
    }, 2000);
  };

  // Action: Open Return confirmation modal
  const handleOpenReturnModal = (item: DueListItem) => {
    setReturnItem(item);
  };

  // Action: Confirm Return Product
  const handleConfirmReturn = () => {
    if (!returnItem) return;
    const item = returnItem;

    // 1. Remove from Due List
    setDueList(prev => prev.filter(i => i.id !== item.id));

    // 2. Format return timestamp
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');
    const returnTime = `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;

    // 3. Update Sales List
    if (setSalesList) {
      setSalesList(prev =>
        prev.map(s => {
          if (
            s.id === item.id ||
            (s.productName === item.productName &&
              s.customerName === item.customerName &&
              s.date === item.date)
          ) {
            return {
              ...s,
              paymentStatus: 'Returned',
              returnDate: returnTime,
              due: 0,
            };
          }
          return s;
        })
      );
    }

    // 4. Update Customer total due if applicable
    if (setCustomers && customers) {
      setCustomers(prev =>
        prev.map(c => {
          if (
            (item.phone && item.phone !== 'N/A' && c.phone === item.phone) ||
            (item.customerName && c.name.toLowerCase() === item.customerName.toLowerCase())
          ) {
            return {
              ...c,
              totalDue: Math.max(0, c.totalDue - (item.due || 0)),
            };
          }
          return c;
        })
      );
    }

    // 5. Restock product quantity if products list is available
    if (setProducts && products) {
      setProducts(prev =>
        prev.map(p => {
          if (p.productName.toLowerCase() === item.productName.toLowerCase()) {
            return {
              ...p,
              qty: (Number(p.qty) || 0) + (Number(item.qty) || 1),
            };
          }
          return p;
        })
      );
    }

    setReturnItem(null);
    setSuccessToast({
      title: 'Product Returned Successfully!',
      message: `Returned "${item.productName}" for ${item.customerName || 'Customer'}.`,
    });
    setTimeout(() => {
      setSuccessToast(null);
    }, 2500);
  };

  const filtered = dueList
    .filter(d => {
      const isDue = d.due > 0;
      const matchSearch = searchQuery
        ? matchTextSearch(d.customerName, searchQuery) ||
          matchTextSearch(d.productName, searchQuery) ||
          matchTextSearch(d.phone, searchQuery)
        : true;
      const matchCustomer = filterCustomer
        ? matchTextSearch(d.customerName, filterCustomer) ||
          matchTextSearch(d.phone, filterCustomer)
        : true;
      const matchDate = filterDate ? d.date.includes(filterDate) : true;
      return isDue && matchSearch && matchCustomer && matchDate;
    })
    .sort((a, b) => {
      const parseTimestamp = (item: DueListItem) => {
        const dStr = (item.lastPaymentDate && item.lastPaymentDate !== '—') ? item.lastPaymentDate : item.date;
        if (!dStr) return 0;
        const time = new Date(dStr.replace(' ', 'T')).getTime();
        return isNaN(time) ? 0 : time;
      };
      return parseTimestamp(b) - parseTimestamp(a);
    });

  // Pagination Math
  const totalPages = Math.max(1, Math.ceil(filtered.length / entries));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * entries;
  const paginatedList = filtered.slice(startIndex, startIndex + entries);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1700px] mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Success Toast Popup (2 seconds) */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black">{successToast.title}</h4>
              <p className="text-xs font-semibold text-emerald-100">{successToast.message}</p>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="ml-2 p-1 text-emerald-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 sm:gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Filter Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 w-full min-h-[44px]"
            />
          </div>

          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Customer Name / Phone</label>
            <input
              type="text"
              placeholder="Search customer..."
              value={filterCustomer}
              onChange={e => {
                setFilterCustomer(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 w-full min-h-[44px]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <button
              onClick={() => setCurrentPage(1)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#0284c7] hover:bg-sky-600 text-white text-sm font-bold rounded-lg transition-colors shadow-2xs cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Apply Filter
            </button>
            
            {(filterDate || filterCustomer || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Due List Card */}
      <div className="bg-white border border-slate-300/80 rounded-xl shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Outstanding Receivables (Due List)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage customer due balances, collect payments, edit sale prices, or return items.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTechModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Shop Job Entry</span>
            </button>
            <span className="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
              Total Items: {filtered.length}
            </span>
          </div>
        </div>

        {/* Show entries & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={entries}
              onChange={e => {
                setEntries(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0284c7] bg-white cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="shrink-0 font-medium text-slate-700">Search:</span>
            <input
              type="text"
              placeholder="Search due records..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] w-full sm:w-64"
            />
          </div>
        </div>

        {/* Inner Scrollable Table Container */}
        <div className="overflow-x-auto overflow-y-auto max-h-[640px] rounded-lg border border-slate-300/80 scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-sm text-left border-collapse min-w-full md:min-w-[950px] lg:min-w-[1250px]">
            <thead className="sticky top-0 z-10 bg-[#f8fafc] border-b border-slate-300">
              <tr className="text-slate-800 font-bold uppercase text-xs tracking-wider">
                <th className="py-3 px-2 sm:px-3 text-center border-r border-slate-200 w-10">SL</th>
                {/* Sale Date & Time: Hidden on mobile (shown on md/tablet and desktop) */}
                <th className="hidden md:table-cell py-3 px-3.5 border-r border-slate-200 whitespace-nowrap">SALE DATE & TIME</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-200 min-w-[120px] sm:min-w-[160px]">CUSTOMER & PHONE</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-200 min-w-[140px] sm:min-w-[220px]">PRODUCT NAME</th>
                <th className="py-3 px-2 sm:px-3 text-center border-r border-slate-200 w-12">QTY</th>
                {/* Selling Price: Hidden on small mobile, Net Price shown */}
                <th className="hidden sm:table-cell py-3 px-3 text-right border-r border-slate-200">SELLING PRICE</th>
                <th className="py-3 px-2.5 sm:px-3 text-right border-r border-slate-200">NET PRICE</th>
                {/* Paid: Hidden on mobile (shown on md/tablet and desktop) */}
                <th className="hidden md:table-cell py-3 px-3 text-right border-r border-slate-200">PAID</th>
                <th className="py-3 px-2.5 sm:px-3 text-right border-r border-slate-200 text-rose-600">DUE</th>
                {/* Collection Date & Time: Hidden on mobile (shown on md/tablet and desktop) */}
                <th className="hidden md:table-cell py-3 px-3.5 text-center border-r border-slate-200 whitespace-nowrap">COLLECTION DATE & TIME</th>
                <th className="py-3 px-2 sm:px-3 text-center border-r border-slate-200">STATUS</th>
                {/* Sales Person: Hidden on mobile/tablet, shown on lg/desktop */}
                <th className="hidden lg:table-cell py-3 px-3.5 border-r border-slate-200 whitespace-nowrap">SALES PERSON</th>
                <th className="py-3 px-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-10 text-slate-400 font-medium">
                    No due records found matching search.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="py-2.5 px-2 sm:px-3 text-slate-700 font-medium text-center border-r border-slate-200 text-xs">{startIndex + idx + 1}</td>
                    {/* Sale Date & Time: Hidden on mobile */}
                    <td className="hidden md:table-cell py-2.5 px-3.5 text-slate-700 text-xs font-mono font-medium whitespace-nowrap border-r border-slate-200">{item.date}</td>
                    <td className="py-2.5 px-3 sm:px-4 border-r border-slate-200">
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm leading-tight">{item.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.phone}</div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-medium text-slate-800 border-r border-slate-200 text-xs sm:text-sm">
                      <div className="line-clamp-2" title={item.productName}>
                        {item.productName}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 sm:px-3 text-center font-medium text-slate-800 border-r border-slate-200 text-xs sm:text-sm">{item.qty}</td>
                    {/* Selling Price: Hidden on small mobile */}
                    <td className="hidden sm:table-cell py-2.5 px-3 text-right text-slate-700 font-mono border-r border-slate-200 text-xs sm:text-sm">৳{item.sellingPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right text-slate-700 font-mono font-semibold border-r border-slate-200 text-xs sm:text-sm">৳{item.afterLassPrice.toFixed(2)}</td>
                    {/* Paid: Hidden on mobile */}
                    <td className="hidden md:table-cell py-2.5 px-3 text-right font-mono font-medium text-emerald-600 border-r border-slate-200 text-xs sm:text-sm">
                      ৳{item.payAmount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2.5 sm:px-3 text-right font-mono font-bold text-rose-600 border-r border-slate-200 text-xs sm:text-sm">
                      ৳{item.due.toFixed(2)}
                    </td>
                    {/* Collection Date & Time: Hidden on mobile */}
                    <td className="hidden md:table-cell py-2.5 px-3.5 text-center font-mono text-xs font-medium text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {item.lastPaymentDate || '—'}
                    </td>
                    <td className="py-2.5 px-2 sm:px-3 text-center border-r border-slate-200">
                      <span
                        className={`inline-block px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md border whitespace-nowrap ${
                          item.paymentStatus === 'Paid'
                            ? 'bg-emerald-50/70 text-emerald-600 border-emerald-200/80'
                            : item.paymentStatus === 'Partial'
                            ? 'bg-amber-50/70 text-amber-600 border-amber-200/80'
                            : 'bg-rose-50/70 text-rose-600 border-rose-200/80'
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                    {/* Sales Person: Hidden on mobile/tablet */}
                    <td className="hidden lg:table-cell py-2.5 px-3.5 text-slate-700 font-medium border-r border-slate-200 whitespace-nowrap text-xs sm:text-sm">{item.salesPerson}</td>
                    <td className="py-2.5 px-2 sm:px-3 text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
                        {/* Collect Button */}
                        <button
                          onClick={() => handleOpenCollect(item)}
                          disabled={item.due <= 0}
                          className="px-2 sm:px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-md transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Collect Payment"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Collect</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-1.5 sm:px-2.5 py-1 bg-[#0284c7] hover:bg-sky-600 text-white font-medium text-xs rounded-md transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Edit Sale / Discount"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        {/* Return Button */}
                        <button
                          onClick={() => handleOpenReturnModal(item)}
                          className="px-1.5 sm:px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-medium text-xs rounded-md transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
                          title="Return Product"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">Return</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-sm text-slate-600">
          <div>
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to{' '}
            {Math.min(startIndex + entries, filtered.length)} of {filtered.length} entries
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer font-medium"
              >
                &lsaquo; Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                    pageNum === safePage
                      ? 'bg-[#0284c7] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer font-medium"
              >
                Next &rsaquo;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* COLLECT PAYMENT MODAL */}
      {collectItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  ৳
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Collect Due Payment</h3>
                  <p className="text-xs text-slate-500">{collectItem.customerName} ({collectItem.phone})</p>
                </div>
              </div>
              <button
                onClick={() => setCollectItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/80 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Product Name:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">{collectItem.productName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Net Selling Price:</span>
                <span className="font-bold text-slate-800">৳{collectItem.afterLassPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Already Paid:</span>
                <span className="font-bold text-emerald-600">৳{collectItem.payAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-800 pt-2 border-t border-slate-200 text-base font-extrabold">
                <span>Current Due Amount:</span>
                <span className="text-rose-600">৳{collectItem.due.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">Collection Amount (৳)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                <input
                  type="number"
                  value={collectAmount ?? 0}
                  onChange={e => setCollectAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-base font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  min={1}
                  max={collectItem.due}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCollectAmount(collectItem.due)}
                  className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md text-xs font-bold transition-colors cursor-pointer"
                >
                  Full Payment (৳{collectItem.due.toFixed(2)})
                </button>
                {collectItem.due > 1 && (
                  <button
                    type="button"
                    onClick={() => setCollectAmount(Math.round(collectItem.due / 2))}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-md text-xs font-bold transition-colors cursor-pointer"
                  >
                    50% Payment (৳{Math.round(collectItem.due / 2)})
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCollectItem(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCollect}
                className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DUE SALE MODAL */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Edit Due Sale Details</h3>
                <p className="text-xs text-slate-500">Adjust price, paid amount, or customer info for {editItem.productName}</p>
              </div>
              <button
                onClick={() => setEditItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editForm.customerName ?? ''}
                    onChange={e => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone ?? ''}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Selling Price (৳)</label>
                  <input
                    type="number"
                    value={editForm.sellingPrice ?? 0}
                    onChange={e => setEditForm(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Net Price After Discount (৳)</label>
                  <input
                    type="number"
                    value={editForm.afterLassPrice ?? 0}
                    onChange={e => setEditForm(prev => ({ ...prev, afterLassPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paid Amount (৳)</label>
                  <input
                    type="number"
                    value={editForm.payAmount ?? 0}
                    onChange={e => setEditForm(prev => ({ ...prev, payAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Calculated Due (৳)</label>
                  <div className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-extrabold text-rose-600">
                    ৳{Math.max(0, (editForm.afterLassPrice ?? 0) - (editForm.payAmount ?? 0)).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sales Person</label>
                <input
                  type="text"
                  value={editForm.salesPerson ?? ''}
                  onChange={e => setEditForm(prev => ({ ...prev, salesPerson: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 text-sm font-bold bg-[#0284c7] hover:bg-sky-600 text-white rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
            {/* RETURN PRODUCT CONFIRMATION MODAL */}
      {returnItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Process Product Return</h3>
                  <p className="text-xs text-slate-500">Confirm product return and balance adjustment</p>
                </div>
              </div>
              <button
                onClick={() => setReturnItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between items-center text-slate-600">
                <span>Product Name:</span>
                <span className="font-bold text-slate-900 text-sm max-w-[200px] truncate">{returnItem.productName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Customer:</span>
                <span className="font-semibold text-slate-800">{returnItem.customerName} ({returnItem.phone})</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Quantity:</span>
                <span className="font-bold text-slate-800">{returnItem.qty} pcs</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Net Selling Price:</span>
                <span className="font-bold text-slate-800">৳{returnItem.afterLassPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Paid Amount:</span>
                <span className="font-bold text-emerald-600">৳{returnItem.payAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-rose-200/80 text-sm font-extrabold">
                <span className="text-rose-800">Due to Clear:</span>
                <span className="text-rose-600">৳{returnItem.due.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Processing this return will completely clear this record from the Due List and update the transaction ledger as <strong>Returned</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnItem(null)}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technician Job Entry Modal */}
      <TechnicianJobModal
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        dueList={dueList}
        salesList={salesList}
        setDueList={setDueList}
        setSalesList={setSalesList}
        customers={customers}
        setCustomers={setCustomers}
        activeUser={activeUser}
      />
    </div>
  );
};

