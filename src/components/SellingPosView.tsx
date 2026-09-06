import React, { useState } from 'react';
import { Product, Customer, SellingListItem, DueListItem } from '../types';
import { Trash2, CheckCircle2, DollarSign, X, Wrench, PlusCircle, ChevronRight } from 'lucide-react';
import { TechnicianJobModal } from './TechnicianJobModal';
import { matchProductSearch } from '../utils/search';

interface SellingPosViewProps {
  products: Product[];
  customers: Customer[];
  salesList: SellingListItem[];
  dueList: DueListItem[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setSalesList: React.Dispatch<React.SetStateAction<SellingListItem[]>>;
  setDueList: React.Dispatch<React.SetStateAction<DueListItem[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setActiveTab: (tab: string) => void;
  activeUser?: { name: string; role: string };
}

interface CartItem {
  product: Product;
  qty: number;
  customPrice: number;
}

export const SellingPosView: React.FC<SellingPosViewProps> = ({
  products,
  customers,
  salesList,
  dueList,
  setProducts,
  setSalesList,
  setDueList,
  setCustomers,
  setActiveTab,
  activeUser,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Checkout Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [payAmountInput, setPayAmountInput] = useState<number | ''>('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');
  const [salesPerson, setSalesPerson] = useState('Shop=PC');

  // 2-second Success Toast Popup State
  const [successToast, setSuccessToast] = useState<{
    total: number;
    paid: number;
    due: number;
    customer: string;
    date: string;
  } | null>(null);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1, customPrice: product.sellingPrice }];
    });
  };

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, qty: newQty } : item
        )
      );
    }
  };

  const updateCartPrice = (productId: string, price: number) => {
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, customPrice: price } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.customPrice * item.qty, 0);
  const totalPurchaseCost = cart.reduce((sum, item) => sum + item.product.purchasePrice * item.qty, 0);

  const handleDirectProcessPayment = (forcedPaid?: number, forcedDiscount?: number) => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const discountVal = forcedDiscount !== undefined ? forcedDiscount : (Number(discount) || 0);
    const netAmount = Math.max(0, totalAmount - discountVal);
    const paidVal = forcedPaid !== undefined ? forcedPaid : (payAmountInput === '' ? 0 : Number(payAmountInput));
    const paid = Math.min(netAmount, Math.max(0, paidVal));
    const calculatedDue = Math.max(0, netAmount - paid);

    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    let custName = selectedCustomer || customCustomerName.trim() || 'Walk-in Customer';
    let custPhone = customCustomerPhone.trim() || 'N/A';

    if (selectedCustomer) {
      const found = customers.find(c => c.name === selectedCustomer);
      custName = selectedCustomer;
      custPhone = found?.phone || 'N/A';
    }

    const productNameSummary = cart.map(i => `${i.product.productName} (x${i.qty})`).join(', ');
    const totalQtySold = cart.reduce((s, i) => s + i.qty, 0);

    const status: 'Paid' | 'Unpaid' | 'Partial' =
      calculatedDue <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';

    const saleId = `sale-${Date.now()}`;

    // 1. Add to Sales List
    const newSaleItem: SellingListItem = {
      id: saleId,
      sl: salesList.length + 1,
      productName: productNameSummary,
      qty: totalQtySold,
      purchasePrice: totalPurchaseCost,
      sellingPrice: totalAmount,
      afterLassAmount: netAmount,
      payAmount: paid,
      due: calculatedDue,
      paymentStatus: status,
      salesPerson: activeUser?.name || salesPerson || 'Shop=PC',
      date: dateStr,
      paidDate: paid > 0 ? dateStr : undefined,
      customerName: custName,
      phone: custPhone,
      source: 'pos',
    };

    setSalesList(prev => [newSaleItem, ...prev]);

    // 2. Add to Due List if there is remaining due amount
    if (calculatedDue > 0) {
      const newDueItem: DueListItem = {
        id: saleId,
        sl: dueList.length + 1,
        date: dateStr,
        lastPaymentDate: paid >= netAmount ? dateStr : '—',
        phone: custPhone,
        customerName: custName,
        productName: productNameSummary,
        qty: totalQtySold,
        sellingPrice: totalAmount,
        afterLassPrice: netAmount,
        payAmount: paid,
        due: calculatedDue,
        paymentStatus: status,
        salesPerson: activeUser?.name || salesPerson || 'Shop=PC',
        source: 'pos',
      };

      setDueList(prev => [newDueItem, ...prev]);
    }

    // 3. Update Product Quantities
    setProducts(prev =>
      prev.map(p => {
        const cartMatch = cart.find(ci => ci.product.id === p.id);
        if (cartMatch) {
          const newQty = Math.max(0, p.qty - cartMatch.qty);
          return { ...p, qty: newQty, netAmt: newQty * p.purchasePrice };
        }
        return p;
      })
    );

    // 4. Update Customer Purchases & Due
    if (custName && custName !== 'Walk-in Customer') {
      setCustomers(prev => {
        const existing = prev.find(
          c => c.name.toLowerCase() === custName.toLowerCase() || (c.phone && c.phone === custPhone && custPhone !== 'N/A')
        );
        if (existing) {
          return prev.map(c =>
            c.id === existing.id
              ? {
                  ...c,
                  totalPurchases: c.totalPurchases + netAmount,
                  totalDue: c.totalDue + calculatedDue,
                }
              : c
          );
        } else {
          return [
            ...prev,
            {
              id: `cust-${Date.now()}`,
              sl: prev.length + 1,
              name: custName,
              phone: custPhone,
              address: '',
              totalPurchases: netAmount,
              totalDue: calculatedDue,
            },
          ];
        }
      });
    }

    // Reset fields & Cart
    clearCart();
    setDiscount(0);
    setPayAmountInput('');
    setCustomCustomerName('');
    setCustomCustomerPhone('');

    // Trigger Success Toast Popup at TOP of screen
    setSuccessToast({
      total: netAmount,
      paid: paid,
      due: calculatedDue,
      customer: custName,
      date: dateStr,
    });

    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory ? p.category === selectedCategory : true;
    const matchBrand = selectedBrand ? p.brand === selectedBrand : true;
    const matchSearch = matchProductSearch(p, searchQuery);
    return matchCat && matchBrand && matchSearch;
  });

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1700px] mx-auto font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* SUCCESS TOAST POPUP AT TOP OF SCREEN */}
      {successToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-top duration-300">
          <div className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 border border-emerald-400 pointer-events-auto">
            <div className="w-9 h-9 bg-white/20 text-white rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-base font-black tracking-wide">Selling Successful!</h4>
              <p className="text-xs font-semibold text-emerald-100">
                Total: ৳{successToast.total.toFixed(2)} • Customer: {successToast.customer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile POS Tab Selector Header */}
      <div className="lg:hidden flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setMobileTab('products')}
          className={`flex-1 py-3 text-center text-sm font-extrabold rounded-xl transition-all ${
            mobileTab === 'products'
              ? 'bg-[#0284c7] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📦 Products List
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-3 text-center text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'cart'
              ? 'bg-[#0284c7] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🛒 Cart & Checkout</span>
          {cart.length > 0 && (
            <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANEL: PRODUCT SEARCH & LIST */}
        <div
          className={`lg:col-span-6 xl:col-span-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-4 sm:p-5 space-y-5 ${
            mobileTab === 'cart' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Top Filter Bar */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Product Selection
                </span>
                <button
                  onClick={() => setIsTechModalOpen(true)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                  title="Shop Repair / Technician Job Entry"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Shop Job Entry</span>
                </button>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-[#0284c7] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-[#0284c7] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="sm:col-span-3 px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20"
              >
                <option value="">All Category</option>
                {Array.from(new Set(products.map(p => p.category))).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="sm:col-span-3 px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20"
              >
                <option value="">Brands</option>
                {Array.from(new Set(products.map(p => p.brand))).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search product name, model code, or barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="sm:col-span-4 px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20"
              />

              <div className="sm:col-span-2 flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedBrand('');
                    setSearchQuery('');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Product Table or Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[450px]">
              {filteredProducts.slice(0, 12).map((prod) => (
                <div key={prod.id} className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/50 hover:bg-sky-50/30 transition-colors flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">{prod.productName}</p>
                      <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded shrink-0">
                        Qty: {prod.qty}
                      </span>
                    </div>
                    {prod.skuCode && (
                      <p className="text-[11px] font-extrabold text-[#0284c7] font-mono mt-1">Model/SKU: {prod.skuCode}</p>
                    )}
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Rack: {prod.rowRack || '—'}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                    <span className="text-base font-black text-[#0284c7]">৳{prod.sellingPrice.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(prod)}
                      className="px-4 py-1.5 bg-[#0284c7] hover:bg-sky-600 text-white font-extrabold text-xs sm:text-sm rounded-lg transition-colors shadow-2xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[450px]">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#f1f5f9] border-y border-slate-200 text-slate-700 font-extrabold uppercase text-xs tracking-tight">
                    <th className="py-3 px-2 text-center w-8">SL</th>
                    <th className="py-3 px-3">PRODUCT NAME</th>
                    <th className="py-3 px-2">RACK</th>
                    <th className="py-3 px-2 text-center">QTY</th>
                    <th className="py-3 px-3 text-right">SELLING PRICE</th>
                    <th className="py-3 px-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.slice(0, 12).map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-2 text-slate-500 font-bold text-center text-xs">{prod.sl}</td>
                      <td className="py-3 px-3 max-w-[240px]">
                        <div className="font-extrabold text-slate-800 text-sm leading-snug">{prod.productName}</div>
                        {prod.skuCode && (
                          <div className="inline-block mt-0.5 text-[10px] font-extrabold font-mono bg-sky-50 text-[#0284c7] px-1.5 py-0.5 rounded border border-sky-200/60">
                            Model: {prod.skuCode}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-600 text-xs font-semibold">{prod.rowRack || '—'}</td>
                      <td className="py-3 px-2 text-center font-black text-slate-800 text-sm">{prod.qty}</td>
                      <td className="py-3 px-3 text-right font-black text-[#0284c7] text-base">৳{prod.sellingPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => addToCart(prod)}
                          className="px-4 py-1.5 bg-[#0284c7] hover:bg-sky-600 text-white font-extrabold text-xs sm:text-sm rounded-lg transition-colors shadow-2xs"
                        >
                          + Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 text-sm pt-3 border-t border-slate-100">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-medium text-xs">&lt;</button>
            <button className="w-8 h-8 rounded-lg bg-[#0284c7] text-white font-black text-xs flex items-center justify-center shadow-2xs">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">3</button>
            <span className="text-slate-400 font-bold px-1">...</span>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-medium text-xs">&gt;</button>
          </div>
        </div>

        {/* RIGHT PANEL: CART & CHECKOUT */}
        <div
          className={`lg:col-span-6 xl:col-span-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-4 sm:p-5 flex flex-col justify-between min-h-[580px] ${
            mobileTab === 'products' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div>
            {/* Right Top Header Actions */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-800">Order Cart</span>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-sky-50 text-[#0284c7] border border-sky-200 rounded-full">
                  {cart.length} Items
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="px-3.5 py-2 bg-[#0284c7] hover:bg-sky-600 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-colors shadow-2xs"
                >
                  + New Customer
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>

            {/* Cart Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#f1f5f9] border-y border-slate-200 text-slate-700 font-extrabold uppercase text-xs tracking-tight">
                    <th className="py-3 px-2 text-rose-600 cursor-pointer font-extrabold text-center" onClick={clearCart}>
                      CLEAR
                    </th>
                    <th className="py-3 px-3">PRODUCT</th>
                    <th className="py-3 px-2 text-right">UNIT PRICE</th>
                    <th className="py-3 px-2 text-center">EDIT PRICE</th>
                    <th className="py-3 px-2 text-center">QTY</th>
                    <th className="py-3 px-3 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400 text-sm font-semibold">
                        Cart is currently empty. Add products from left list.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item) => (
                      <tr key={item.product.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-800 text-sm max-w-[140px]">
                          {item.product.productName}
                        </td>
                        <td className="py-3 px-2 text-right text-slate-600 font-bold text-sm">৳{item.product.sellingPrice.toFixed(2)}</td>
                        <td className="py-3 px-2 text-center">
                          <input
                            type="number"
                            value={item.customPrice ?? item.product?.sellingPrice ?? 0}
                            onChange={e => updateCartPrice(item.product.id, Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-slate-300 text-center rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#0284c7]"
                          />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                              className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center font-black text-sm"
                            >
                              -
                            </button>
                            <span className="font-black text-slate-800 text-base w-6 text-center">{item.qty}</span>
                            <button
                              onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                              className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center font-black text-sm"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900 text-base">
                          ৳{(item.customPrice * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Controls Area */}
          <div className="pt-4 border-t border-slate-200 space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Select Customer */}
              <div className="w-full">
                <label className="block text-xs font-bold text-slate-600 mb-1">Select Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20"
                >
                  <option value="">Walk-in Customer / Cash Sale</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Discount / Less */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Less / Discount (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={discount === 0 ? '' : discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20"
                />
              </div>

              {/* Pay Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Paid Amount (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={payAmountInput}
                  onChange={e => setPayAmountInput(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00 (Due Sale)"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20"
                />
              </div>
            </div>

            {/* Total Box & Net Amount */}
            <div className="flex items-center justify-between gap-4 p-3.5 bg-sky-50/80 border border-sky-200 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm text-slate-600 font-extrabold uppercase tracking-wide">Net Total:</span>
                <span className="text-2xl font-black text-[#0284c7]">
                  ৳ {Math.max(0, totalAmount - (Number(discount) || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleDirectProcessPayment()}
                className="w-full py-3.5 bg-[#0284c7] hover:bg-sky-600 text-white text-base font-black rounded-xl transition-colors text-center shadow-md shadow-sky-500/20 cursor-pointer"
              >
                Process Payment
              </button>
              <button
                onClick={clearCart}
                className="w-full py-3.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-base font-bold rounded-xl transition-colors text-center cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER CREATE MODAL */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-800">Create New Customer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Phone</label>
                <input
                  type="text"
                  value={newCustomerPhone}
                  onChange={e => setNewCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newCustomerName) {
                    setSelectedCustomer(newCustomerName);
                    setIsCustomerModalOpen(false);
                    setNewCustomerName('');
                    setNewCustomerPhone('');
                  }
                }}
                className="px-5 py-2 bg-[#0284c7] text-white text-sm font-bold rounded-xl shadow-2xs"
              >
                Save
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

      {/* Mobile Sticky Quick Cart Action Banner at bottom */}
      {mobileTab === 'products' && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-[60px] left-2 right-2 z-30 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl text-white flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 pl-1">
            <span className="bg-[#0284c7] text-white font-black text-xs px-2.5 py-1 rounded-lg">
              {cart.reduce((s, i) => s + i.qty, 0)} Items
            </span>
            <span className="text-sm font-extrabold text-white">
              ৳{totalAmount.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => setMobileTab('cart')}
            className="px-4 py-2 bg-[#0284c7] hover:bg-sky-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>View Cart</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

