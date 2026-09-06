import React, { useState, useMemo } from 'react';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { SellingListItem } from '../types';

interface SellingListViewProps {
  salesList: SellingListItem[];
  setSalesList: React.Dispatch<React.SetStateAction<SellingListItem[]>>;
  activeUser?: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    permissions?: string[];
  };
}

type SortField =
  | 'sl'
  | 'date'
  | 'statusDate'
  | 'phone'
  | 'customerName'
  | 'productName'
  | 'qty'
  | 'purchasePrice'
  | 'sellingPrice'
  | 'afterLassAmount'
  | 'payAmount'
  | 'due'
  | 'paymentStatus';

function parseDateParts(rawDate?: string) {
  if (!rawDate) return { date: '—', time: '—', timestamp: 0 };

  // Handle formats like "14-08-2026 07:56 PM" or "2026-08-14 19:56:00"
  const parts = rawDate.trim().split(' ');
  if (parts.length >= 3 && (parts[2].toUpperCase() === 'AM' || parts[2].toUpperCase() === 'PM')) {
    const dStr = parts[0];
    const tStr = `${parts[1]} ${parts[2].toUpperCase()}`;
    return { date: dStr, time: tStr, timestamp: new Date(`${dStr} ${tStr}`).getTime() || 0 };
  }

  try {
    const d = new Date(rawDate.replace(' ', 'T'));
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const hoursStr = String(hours).padStart(2, '0');
      return {
        date: `${day}-${month}-${year}`,
        time: `${hoursStr}:${minutes} ${ampm}`,
        timestamp: d.getTime(),
      };
    }
  } catch (e) {
    // fallback
  }

  if (parts.length === 2) {
    return { date: parts[0], time: parts[1], timestamp: 0 };
  }
  return { date: rawDate, time: '—', timestamp: 0 };
}

export const SellingListView: React.FC<SellingListViewProps> = ({
  salesList,
  setSalesList,
  activeUser,
}) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterSalesPerson, setFilterSalesPerson] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Owner Access Control for Purchase Price (Strictly only when logged in user is Owner/Super Admin/Admin)
  const isUserOwner = useMemo(() => {
    if (!activeUser) return true; // Default if not provided
    const r = (activeUser.role || '').toLowerCase();
    const n = (activeUser.name || '').toLowerCase();
    return (
      r === 'super admin' ||
      r === 'owner' ||
      r === 'admin' ||
      r.includes('owner') ||
      r.includes('admin') ||
      n.includes('admin') ||
      n.includes('owner')
    );
  }, [activeUser]);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filtered = useMemo(() => {
    return salesList.filter(s => {
      const { date } = parseDateParts(s.date);
      const matchDate = filterDate ? (s.date.includes(filterDate) || date.includes(filterDate)) : true;
      const matchPhone = filterPhone ? (s.phone || '').includes(filterPhone) : true;
      const matchCustomer = filterCustomer
        ? (s.customerName || '').toLowerCase().includes(filterCustomer.toLowerCase())
        : true;
      const matchSalesPerson = filterSalesPerson
        ? (s.salesPerson || '').toLowerCase().includes(filterSalesPerson.toLowerCase())
        : true;
      const matchSearch = searchQuery
        ? s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.salesPerson || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (s.phone && s.phone.includes(searchQuery)) ||
          (s.paymentStatus && s.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (s.paidDate && s.paidDate.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (s.returnDate && s.returnDate.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return matchDate && matchPhone && matchCustomer && matchSalesPerson && matchSearch;
    });
  }, [salesList, filterDate, filterPhone, filterCustomer, filterSalesPerson, searchQuery]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let valA: any = a[sortField as keyof SellingListItem];
      let valB: any = b[sortField as keyof SellingListItem];

      if (sortField === 'date') {
        valA = parseDateParts(a.date).timestamp;
        valB = parseDateParts(b.date).timestamp;
      } else if (sortField === 'statusDate') {
        const rawA =
          a.paymentStatus === 'Returned'
            ? a.returnDate
            : a.paidDate || (a.payAmount > 0 ? a.date : '');
        const rawB =
          b.paymentStatus === 'Returned'
            ? b.returnDate
            : b.paidDate || (b.payAmount > 0 ? b.date : '');
        valA = rawA ? parseDateParts(rawA).timestamp : 0;
        valB = rawB ? parseDateParts(rawB).timestamp : 0;
      } else if (sortField === 'phone') {
        valA = a.phone || '';
        valB = b.phone || '';
      } else if (sortField === 'customerName') {
        valA = a.customerName || '';
        valB = b.customerName || '';
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortField, sortDirection]);

  // Pagination calculations
  const totalEntries = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = sorted.slice(startIndex, endIndex);

  const handleReset = () => {
    setFilterDate('');
    setFilterPhone('');
    setFilterCustomer('');
    setFilterSalesPerson('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale record?')) {
      setSalesList(prev => prev.filter(item => item.id !== id));
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-3 h-3 text-slate-400 shrink-0 inline-block ml-0.5 opacity-60" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-[#0284c7] shrink-0 inline-block ml-0.5" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#0284c7] shrink-0 inline-block ml-0.5" />
    );
  };

  // Generate page numbers array
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

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1700px] mx-auto font-['Plus_Jakarta_Sans',sans-serif] text-slate-700">
      {/* Top Filter Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="mm/dd/yyyy"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Phone</label>
            <input
              type="text"
              placeholder=""
              value={filterPhone}
              onChange={e => {
                setFilterPhone(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Name</label>
            <input
              type="text"
              placeholder=""
              value={filterCustomer}
              onChange={e => {
                setFilterCustomer(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sales Person</label>
            <input
              type="text"
              placeholder=""
              value={filterSalesPerson}
              onChange={e => {
                setFilterSalesPerson(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-4">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className="px-5 py-2 bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2 bg-[#f87171] hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Selling List Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Card Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100">
          <div className="flex items-center flex-wrap gap-2.5">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Selling List</h2>
          </div>
        </div>

        {/* Entries Selector & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={e => {
                setEntriesPerPage(Number(e.target.value));
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
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder=""
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] w-full sm:w-64"
            />
          </div>
        </div>

        {/* Inner Scrollable Table Container (Fixed frame so page doesn't scroll excessively) */}
        <div className="overflow-x-auto overflow-y-auto max-h-[640px] rounded-lg border border-slate-300/80 scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-sm text-left border-collapse min-w-[1300px]">
            <thead className="sticky top-0 z-10 bg-[#f8fafc] border-b border-slate-300">
              <tr className="text-slate-800 font-bold uppercase text-xs tracking-wider">
                <th
                  onClick={() => handleSort('sl')}
                  className="py-3 px-3 text-center border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>SL</span>
                    {renderSortIcon('sl')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>DATE</span>
                    {renderSortIcon('date')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('phone')}
                  className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>PHONE</span>
                    {renderSortIcon('phone')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('customerName')}
                  className="py-3 px-4 border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>CUSTOMER NAME</span>
                    {renderSortIcon('customerName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('productName')}
                  className="py-3 px-4 border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none min-w-[240px]"
                >
                  <div className="flex items-center gap-1">
                    <span>PRODUCT NAME</span>
                    {renderSortIcon('productName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('qty')}
                  className="py-3 px-3 text-center border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>QTY</span>
                    {renderSortIcon('qty')}
                  </div>
                </th>
                {isUserOwner && (
                  <th
                    onClick={() => handleSort('purchasePrice')}
                    className="py-3 px-3 text-right border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none bg-amber-50/50 text-amber-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>PURCHASE PRICE</span>
                      {renderSortIcon('purchasePrice')}
                    </div>
                  </th>
                )}
                <th
                  onClick={() => handleSort('sellingPrice')}
                  className="py-3 px-3 text-right border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>SELLING PRICE</span>
                    {renderSortIcon('sellingPrice')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('afterLassAmount')}
                  className="py-3 px-3 text-right border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>AFTER LASS AMOUNT</span>
                    {renderSortIcon('afterLassAmount')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('payAmount')}
                  className="py-3 px-3 text-right border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PAY AMOUNT</span>
                    {renderSortIcon('payAmount')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('due')}
                  className="py-3 px-3 text-right border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>DUE</span>
                    {renderSortIcon('due')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('statusDate')}
                  className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>STATUS DATE</span>
                    {renderSortIcon('statusDate')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('paymentStatus')}
                  className="py-3 px-3 text-center border-r border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>PAYMENT STATUS</span>
                    {renderSortIcon('paymentStatus')}
                  </div>
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={isUserOwner ? 14 : 13} className="text-center py-10 text-slate-400 font-medium">
                    No sales records found.
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, idx) => {
                  const { date, time } = parseDateParts(item.date);
                  const isReturned = item.paymentStatus === 'Returned';
                  const isPaid = !isReturned && (item.paymentStatus === 'Paid' || item.due <= 0);
                  const isUnpaid = !isReturned && (item.paymentStatus === 'Unpaid' || item.payAmount <= 0);

                  // Extract date and time for the status event (Paid date or Return date)
                  const rawStatusDate = isReturned
                    ? item.returnDate
                    : item.paidDate || (item.payAmount > 0 ? item.date : undefined);
                  const statusParts = rawStatusDate ? parseDateParts(rawStatusDate) : null;

                  const slNo = startIndex + idx + 1;

                  return (
                    <tr key={item.id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-700 font-medium border-r border-slate-200">
                        {slNo}
                      </td>
                      {/* DATE with compact time underneath */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-slate-200">
                        <div className="font-mono text-xs font-semibold text-slate-800">{date}</div>
                        {time && time !== '—' && (
                          <div className="text-[10px] font-mono text-slate-400 leading-tight mt-0.5">{time}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-700 font-mono text-xs font-medium whitespace-nowrap border-r border-slate-200">
                        {item.phone || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium border-r border-slate-200 whitespace-nowrap">
                        {item.customerName || 'Walk-in'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium border-r border-slate-200 min-w-[240px]">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-800 font-medium border-r border-slate-200">
                        {item.qty}
                      </td>
                      {isUserOwner && (
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/30 border-r border-slate-200">
                          {item.purchasePrice}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right text-slate-700 font-mono border-r border-slate-200">
                        {item.sellingPrice}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-mono border-r border-slate-200">
                        {item.afterLassAmount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-600 border-r border-slate-200">
                        {item.payAmount.toFixed(2)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-medium border-r border-slate-200 ${
                          item.due > 0 ? 'text-rose-600' : 'text-rose-400'
                        }`}
                      >
                        {item.due.toFixed(2)}
                      </td>
                      {/* STATUS DATE (Shows date & time of payment or return right before Payment Status) */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-slate-200">
                        {statusParts ? (
                          <div>
                            <div
                              className={`font-mono text-xs font-semibold ${
                                isReturned ? 'text-purple-700' : 'text-emerald-700'
                              }`}
                            >
                              {statusParts.date}
                            </div>
                            {statusParts.time && statusParts.time !== '—' && (
                              <div
                                className={`text-[10px] font-mono leading-tight mt-0.5 ${
                                  isReturned ? 'text-purple-600/70' : 'text-emerald-600/70'
                                }`}
                              >
                                {statusParts.time}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-200">
                        {isReturned ? (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-md">
                            Returned
                          </span>
                        ) : isPaid ? (
                          <span className="inline-block px-3 py-0.5 text-xs font-medium text-emerald-600 bg-emerald-50/70 border border-emerald-200/80 rounded-md">
                            Paid
                          </span>
                        ) : isUnpaid ? (
                          <span className="inline-block px-3 py-0.5 text-xs font-semibold text-rose-600 bg-rose-50/70 border border-rose-200/80 rounded-md">
                            Due
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-0.5 text-xs font-medium text-amber-600 bg-amber-50/70 border border-amber-200/80 rounded-md">
                            Partial
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4 inline-block" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination & Showing Count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-sm text-slate-600">
          <div>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={validCurrentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer font-medium"
              >
                &lsaquo; Previous
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, i) => {
                  if (p === '...') {
                    return (
                      <span key={`ellipsis-${i}`} className="px-2 py-1 text-slate-400 text-sm">
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
                      className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
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
                disabled={validCurrentPage === totalPages || totalEntries === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer font-medium"
              >
                Next &rsaquo;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding Matching Target Reference */}
      <footer className="text-xs text-slate-500 pt-2 pb-6">
        <p>&copy; fixprobd.com, All rights Reserved.</p>
      </footer>
    </div>
  );
};

