import React, { useState, useMemo } from 'react';
import { SellingListItem } from '../types';

interface DuePaymentListViewProps {
  salesList: SellingListItem[];
  activeUser?: { name: string; role: string; email?: string; phone?: string; permissions?: string[] };
}

export const DuePaymentListView: React.FC<DuePaymentListViewProps> = ({ salesList, activeUser }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [dueReceivedUser, setDueReceivedUser] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Strict Owner / Super Admin Access Control for Purchase Price (No manual buttons or public bypass)
  const isUserOwner = useMemo(() => {
    if (!activeUser) return false;
    const r = (activeUser.role || '').toLowerCase();
    const n = (activeUser.name || '').toLowerCase();
    return (
      r === 'super admin' ||
      r === 'owner' ||
      r === 'admin' ||
      r.includes('super admin') ||
      r.includes('owner') ||
      r.includes('admin') ||
      n.includes('admin') ||
      n.includes('owner')
    );
  }, [activeUser]);

  // Filtered lists
  const filtered = useMemo(() => {
    return salesList
      .filter(item => {
        const matchSearch = searchQuery
          ? item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.salesPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.customerName && item.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
          : true;
        const matchPhone = phone ? (item.phone || '').includes(phone) : true;
        const matchCustomer = customerName ? (item.customerName || '').toLowerCase().includes(customerName.toLowerCase()) : true;
        const matchFrom = fromDate ? item.date >= fromDate : true;
        const matchTo = toDate ? item.date <= toDate + ' 23:59:59' : true;
        const matchUser = dueReceivedUser !== 'All' ? item.salesPerson.toLowerCase().includes(dueReceivedUser.toLowerCase()) : true;

        return matchSearch && matchPhone && matchCustomer && matchFrom && matchTo && matchUser;
      })
      .sort((a, b) => {
        const parseTimestamp = (item: SellingListItem) => {
          const dStr = item.dueReceivedDate || item.paidDate || item.date;
          if (!dStr) return 0;
          const time = new Date(dStr.replace(' ', 'T')).getTime();
          return isNaN(time) ? 0 : time;
        };
        return parseTimestamp(b) - parseTimestamp(a);
      });
  }, [salesList, searchQuery, phone, customerName, fromDate, toDate, dueReceivedUser]);

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = filtered.slice(startIndex, endIndex);

  const totalQty = filtered.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  const totalPurchasePrice = filtered.reduce((acc, curr) => acc + (Number(curr.purchasePrice) || 0), 0);
  const totalSellingPrice = filtered.reduce((acc, curr) => acc + (Number(curr.sellingPrice) || 0), 0);
  const totalNetAmount = filtered.reduce((acc, curr) => acc + (Number(curr.afterLassAmount) || 0), 0);
  const totalPayAmount = filtered.reduce((acc, curr) => acc + (Number(curr.payAmount) || 0), 0);
  const totalDue = filtered.reduce((acc, curr) => acc + (Number(curr.due) || 0), 0);

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setPhone('');
    setCustomerName('');
    setDueReceivedUser('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

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
      {/* Filter Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Filter Due Settlement Ledger</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Phone</label>
            <input
              type="text"
              placeholder=""
              value={phone}
              onChange={e => {
                setPhone(e.target.value);
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
              value={customerName}
              onChange={e => {
                setCustomerName(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Due Received User</label>
            <select
              value={dueReceivedUser}
              onChange={e => {
                setDueReceivedUser(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0284c7] bg-white cursor-pointer"
            >
              <option value="All">All Users</option>
              <option value="Refat">Refat</option>
              <option value="Shop=PC">Shop=PC</option>
            </select>
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

      {/* Main Table Card */}
      <div className="bg-white border border-slate-300/80 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center flex-wrap gap-2.5">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Received Due Settlement Ledger</h2>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
              Payment History ({filtered.length})
            </span>
          </div>
        </div>

        {/* Entries & Search */}
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
              placeholder="Search due records..."
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] w-full sm:w-64"
            />
          </div>
        </div>

        {/* Inner Scrollable Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[640px] rounded-lg border border-slate-300/80 scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-sm text-left border-collapse min-w-[1250px]">
            <thead className="sticky top-0 z-10 bg-[#f8fafc] border-b border-slate-300">
              <tr className="text-slate-800 font-bold uppercase text-xs tracking-wider">
                <th className="py-3 px-3.5 border-r border-slate-200">SALE DATE & TIME</th>
                <th className="py-3 px-4 border-r border-slate-200">CUSTOMER NAME</th>
                <th className="py-3 px-4 border-r border-slate-200 min-w-[220px]">PRODUCT NAME</th>
                <th className="py-3 px-3 text-center border-r border-slate-200">QTY</th>
                {isUserOwner && (
                  <th className="py-3 px-3 text-right border-r border-slate-200 whitespace-nowrap bg-amber-50/50 text-amber-900">
                    PURCHASE PRICE
                  </th>
                )}
                <th className="py-3 px-3 text-right border-r border-slate-200">SELLING PRICE</th>
                <th className="py-3 px-3 text-right border-r border-slate-200">NET AMOUNT</th>
                <th className="py-3 px-3 text-right border-r border-slate-200">PAY AMOUNT</th>
                <th className="py-3 px-3 text-right border-r border-slate-200">DUE</th>
                <th className="py-3 px-3.5 text-center border-r border-slate-200">DUE RECEIVED DATE & TIME</th>
                <th className="py-3 px-3 text-center border-r border-slate-200">STATUS</th>
                <th className="py-3 px-3.5 border-r border-slate-200">SALES PERSON</th>
                <th className="py-3 px-3.5">RECEIVED BY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={isUserOwner ? 13 : 12} className="text-center py-10 text-slate-400 font-medium">
                    No due settlement records found.
                  </td>
                </tr>
              ) : (
                currentEntries.map((item) => {
                  const isReturned = item.paymentStatus === 'Returned';
                  const isPaid = !isReturned && (item.paymentStatus === 'Paid' || (item.due <= 0 && item.payAmount > 0));
                  const isPartial = !isReturned && !isPaid && item.payAmount > 0 && item.due > 0;

                  return (
                    <tr key={item.id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-xs font-medium text-slate-700 whitespace-nowrap border-r border-slate-200">{item.date}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap">{item.customerName || '—'}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800 border-r border-slate-200 min-w-[220px]">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-800 border-r border-slate-200">{item.qty}</td>
                      {isUserOwner && (
                        <td className="py-2.5 px-3 text-right text-slate-700 font-mono border-r border-slate-200 bg-amber-50/20">
                          ৳{(item.purchasePrice || 0).toFixed(2)}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right text-slate-700 font-mono border-r border-slate-200">৳{(item.sellingPrice || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-mono border-r border-slate-200">৳{(item.afterLassAmount || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-600 border-r border-slate-200">
                        ৳{(item.payAmount || 0).toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-medium border-r border-slate-200 ${item.due > 0 ? 'text-rose-600' : 'text-rose-400'}`}>
                        ৳{(item.due || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-emerald-700 text-xs font-medium text-center border-r border-slate-200">
                        {item.dueReceivedDate || item.paidDate || (item.due <= 0 ? item.date : '—')}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-200">
                        {isReturned ? (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-md">
                            Returned
                          </span>
                        ) : isPaid ? (
                          <span className="inline-block px-3 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/80 rounded-md">
                            Paid
                          </span>
                        ) : isPartial ? (
                          <span className="inline-block px-3 py-0.5 text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/80 rounded-md">
                            Partial
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-0.5 text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/80 rounded-md">
                            Due
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-700 font-medium border-r border-slate-200">{item.salesPerson}</td>
                      <td className="py-2.5 px-3.5 text-slate-600 font-medium">{item.dueReceivedUser || 'Refat'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Footer Total Summary Row */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs text-slate-800">
                <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wide text-xs text-slate-600 border-r border-slate-200">
                  Total Summary:
                </td>
                <td className="py-3 px-3 text-center font-bold text-slate-900 border-r border-slate-200">{totalQty}</td>
                {isUserOwner && (
                  <td className="py-3 px-3 text-right text-slate-800 font-mono border-r border-slate-200 bg-amber-50/40">
                    ৳{totalPurchasePrice.toFixed(2)}
                  </td>
                )}
                <td className="py-3 px-3 text-right text-slate-700 font-mono border-r border-slate-200">৳{totalSellingPrice.toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-slate-800 font-mono border-r border-slate-200">৳{totalNetAmount.toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-bold font-mono text-[#0284c7] border-r border-slate-200">
                  ৳{totalPayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-bold font-mono text-slate-700 border-r border-slate-200">
                  ৳{totalDue.toFixed(2)}
                </td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Pagination */}
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
    </div>
  );
};


