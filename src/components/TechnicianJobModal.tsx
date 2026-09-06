import React, { useState } from 'react';
import { Store, Tag, DollarSign, X, CheckCircle2, Wrench } from 'lucide-react';
import { DueListItem, SellingListItem, Customer } from '../types';

interface TechnicianJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  dueList: DueListItem[];
  salesList: SellingListItem[];
  setDueList: React.Dispatch<React.SetStateAction<DueListItem[]>>;
  setSalesList: React.Dispatch<React.SetStateAction<SellingListItem[]>>;
  customers?: Customer[];
  setCustomers?: React.Dispatch<React.SetStateAction<Customer[]>>;
  activeUser?: { name: string; role: string };
}

export const TechnicianJobModal: React.FC<TechnicianJobModalProps> = ({
  isOpen,
  onClose,
  dueList,
  salesList,
  setDueList,
  setSalesList,
  customers,
  setCustomers,
  activeUser,
}) => {
  const [shopName, setShopName] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const numPrice = Number(price) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopName.trim()) {
      alert('Please enter Shop / Customer Name!');
      return;
    }
    if (!productName.trim()) {
      alert('Please enter Product / Repair Work Name!');
      return;
    }
    if (numPrice <= 0) {
      alert('Please enter a valid Price!');
      return;
    }

    const fullProductName = productName.trim();

    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const defaultSalesPerson = activeUser?.name || 'Shop=PC';

    // 1. Create Due Item
    const newDueItem: DueListItem = {
      id: `due-${Date.now()}`,
      sl: dueList.length + 1,
      date: dateStr,
      phone: 'N/A',
      customerName: shopName.trim(),
      productName: fullProductName,
      qty: 1,
      sellingPrice: numPrice,
      afterLassPrice: numPrice,
      payAmount: 0,
      due: numPrice,
      paymentStatus: 'Unpaid',
      salesPerson: defaultSalesPerson,
      lastPaymentDate: '—',
      source: 'shop_job',
    };

    // 2. Create Sale Item
    const newSaleItem: SellingListItem = {
      id: `sale-${Date.now()}`,
      sl: salesList.length + 1,
      productName: fullProductName,
      qty: 1,
      purchasePrice: Math.round(numPrice * 0.4),
      sellingPrice: numPrice,
      afterLassAmount: numPrice,
      payAmount: 0,
      due: numPrice,
      paymentStatus: 'Unpaid',
      salesPerson: defaultSalesPerson,
      date: dateStr,
      paidDate: '—',
      customerName: shopName.trim(),
      phone: 'N/A',
      source: 'shop_job',
    };

    setDueList(prev => [newDueItem, ...prev]);
    setSalesList(prev => [newSaleItem, ...prev]);

    // 3. Update Customer records if available
    if (setCustomers && customers && shopName.trim()) {
      const existing = customers.find(c => c.name.toLowerCase() === shopName.trim().toLowerCase());
      if (existing) {
        setCustomers(prev =>
          prev.map(c =>
            c.id === existing.id
              ? {
                  ...c,
                  totalPurchases: c.totalPurchases + numPrice,
                  totalDue: c.totalDue + numPrice,
                }
              : c
          )
        );
      } else {
        setCustomers(prev => [
          ...prev,
          {
            id: `cust-${Date.now()}`,
            sl: prev.length + 1,
            name: shopName.trim(),
            phone: 'N/A',
            address: 'Shop Customer',
            totalPurchases: numPrice,
            totalDue: numPrice,
          },
        ]);
      }
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setShopName('');
      setProductName('');
      setPrice('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 text-slate-900 rounded-lg flex items-center justify-center font-bold shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Shop Job Entry</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Shop Name, Product/Job details and price
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-800">Added to Due List!</h4>
            <p className="text-xs text-slate-500 font-medium">
              Successfully recorded in the Due List ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            {/* Shop Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                Shop Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Digital Mobile Repair / BAZAR"
                value={shopName ?? ''}
                onChange={e => setShopName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Product / Work Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                Product Name / Work <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Samsung A52 Charging Logic"
                value={productName ?? ''}
                onChange={e => setProductName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                Price Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="0.00"
                value={price ?? ''}
                onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                Submit to Due List
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
