import React, { useState } from 'react';
import { Customer } from '../types';
import { Pencil, Trash2, Plus, UserCheck, Upload, X, User } from 'lucide-react';

interface CustomerViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ customers, setCustomers }) => {
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<string>('');

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setAddress('');
    setImage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name || '');
    setPhone(c.phone || '');
    setAddress(c.address || '');
    setImage(c.image || '');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingCustomer) {
      setCustomers(prev =>
        prev.map(c =>
          c.id === editingCustomer.id
            ? { ...c, name, phone, address, image }
            : c
        )
      );
    } else {
      const newCust: Customer = {
        id: Date.now().toString(),
        sl: customers.length + 1,
        name,
        phone,
        address,
        image,
        totalPurchases: 0,
        totalDue: 0,
      };
      setCustomers(prev => [...prev, newCust]);
    }

    setIsModalOpen(false);
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setAddress('');
    setImage('');
  };

  const handleDelete = (c: Customer) => {
    if (confirm(`Are you sure you want to delete customer "${c.name}"?`)) {
      setCustomers(prev => prev.filter(item => item.id !== c.id));
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = filtered.slice(startIndex, endIndex);

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1600px] mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white border border-slate-300/80 rounded-xl shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Client & Customer Directory</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Manage customer profiles, photos, and accounts</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#0284c7] hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Register Customer
          </button>
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
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] w-full sm:w-64"
            />
          </div>
        </div>

        {/* Inner Scrollable Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[640px] rounded-lg border border-slate-300/80 scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-sm text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-[#f8fafc] border-b border-slate-300">
              <tr className="text-slate-800 font-bold uppercase text-xs tracking-wider">
                <th className="py-3 px-3 text-center border-r border-slate-200">SL</th>
                <th className="py-3 px-3.5 text-center border-r border-slate-200">PHOTO</th>
                <th className="py-3 px-4 border-r border-slate-200">NAME</th>
                <th className="py-3 px-3.5 border-r border-slate-200">PHONE</th>
                <th className="py-3 px-4 border-r border-slate-200">ADDRESS</th>
                <th className="py-3 px-3.5 text-right border-r border-slate-200">TOTAL PURCHASES</th>
                <th className="py-3 px-3.5 text-right border-r border-slate-200">TOTAL DUE</th>
                <th className="py-3 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentEntries.map((c, idx) => (
                <tr key={c.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-700 font-medium text-center border-r border-slate-200">{startIndex + idx + 1}</td>
                  <td className="py-2 px-3.5 text-center border-r border-slate-200">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs mx-auto"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-sky-100 text-[#0284c7] font-bold text-xs flex items-center justify-center border border-sky-200 mx-auto">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-800 border-r border-slate-200">{c.name}</td>
                  <td className="py-2.5 px-3.5 font-mono text-slate-700 text-xs font-medium border-r border-slate-200">{c.phone}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-medium border-r border-slate-200">{c.address || '—'}</td>
                  <td className="py-2.5 px-3.5 text-right font-medium text-slate-800 font-mono border-r border-slate-200">৳{c.totalPurchases.toFixed(2)}</td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-medium text-rose-600 border-r border-slate-200">৳{c.totalDue.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 text-slate-500 hover:text-[#0284c7] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Customer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-medium text-sm">
                    No customers found matching your search.
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

      {/* Register / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0284c7]" />
                <h3 className="text-base font-extrabold text-slate-800">
                  {editingCustomer ? 'Edit Customer Details' : 'Register New Customer'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="relative">
                {image ? (
                  <img
                    src={image}
                    alt="Customer preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#0284c7] shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center border border-sky-200">
                    <User className="w-7 h-7" />
                  </div>
                )}
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-md hover:bg-rose-700"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Customer Photo</label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farid The Mobile Zone"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka, Bangladesh"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0284c7] hover:bg-sky-600 text-white text-sm font-extrabold rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                {editingCustomer ? 'Update Customer' : 'Save Customer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

