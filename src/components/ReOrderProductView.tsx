import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Product } from '../types';
import { matchProductSearch } from '../utils/search';

interface ReOrderProductViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const ReOrderProductView: React.FC<ReOrderProductViewProps> = ({ products, setProducts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [newQty, setNewQty] = useState('');

  // Low stock / reorder items
  const lowStock = products.filter(p => p.qty <= 1);

  const filtered = lowStock.filter(p => matchProductSearch(p, searchQuery));

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = filtered.slice(startIndex, endIndex);

  const handleUpdateStock = () => {
    if (editingProd && newQty !== '') {
      setProducts(prev =>
        prev.map(p => p.id === editingProd.id ? { ...p, qty: Number(newQty) } : p)
      );
      setEditingProd(null);
      setNewQty('');
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1600px] mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white border border-slate-300/80 rounded-xl shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Re-Order Inventory Alert Index</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Low stock products requiring replenishment</p>
          </div>
          <span className="text-xs text-rose-600 font-bold uppercase tracking-wide bg-rose-50 px-3 py-1 rounded-md border border-rose-200">
            {filtered.length} Stock Alerts
          </span>
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
              placeholder="Search low stock..."
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] w-full sm:w-64"
            />
          </div>
        </div>

        {/* Inner Scrollable Table Container */}
        <div className="overflow-x-auto overflow-y-auto max-h-[640px] rounded-lg border border-slate-300/80 scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-sm text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-[#f8fafc] border-b border-slate-300">
              <tr className="text-slate-800 font-bold uppercase text-xs tracking-wider">
                <th className="py-3 px-3 w-12 text-center border-r border-slate-200">SL</th>
                <th className="py-3 px-4 border-r border-slate-200">PRODUCT NAME</th>
                <th className="py-3 px-3 text-center border-r border-slate-200">BARCODE</th>
                <th className="py-3 px-3 text-center border-r border-slate-200">QTY</th>
                <th className="py-3 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentEntries.map((item, index) => (
                <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-2.5 px-3 text-slate-700 font-medium text-center border-r border-slate-200">{startIndex + index + 1}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-800 border-r border-slate-200">{item.productName}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600 text-xs border-r border-slate-200">{item.barcode}</td>
                  <td className="py-2.5 px-3 text-center border-r border-slate-200">
                    <span className="font-semibold text-rose-600 text-sm bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                      {item.qty}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => {
                        setEditingProd(item);
                        setNewQty(item.qty.toString());
                      }}
                      className="p-1.5 bg-[#0284c7] hover:bg-sky-600 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                      title="Update Stock"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium text-sm">
                    No low stock items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                    p === validCurrentPage
                      ? 'bg-[#0284c7] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}

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

      {/* Stock Update Modal */}
      {editingProd && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-800">Update Stock Quantity</h3>
            <p className="text-sm text-slate-700 font-bold">{editingProd.productName}</p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Stock Qty</label>
              <input
                type="number"
                value={newQty}
                onChange={e => setNewQty(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingProd(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                className="px-5 py-2 bg-[#0284c7] hover:bg-sky-600 text-white text-sm font-extrabold rounded-xl transition-colors shadow-2xs"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
