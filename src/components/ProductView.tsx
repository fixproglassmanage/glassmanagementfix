import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { Product, Category, Brand, Unit } from '../types';
import { matchProductSearch } from '../utils/search';

interface ProductViewProps {
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  units: Unit[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  activeUser?: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    permissions?: string[];
  };
}

export const ProductView: React.FC<ProductViewProps> = ({
  activeSubTab,
  setActiveSubTab,
  products,
  setProducts,
  categories,
  setCategories,
  brands,
  setBrands,
  units,
  setUnits,
  activeUser,
}) => {
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Owner Access Control for Purchase Price
  const isUserOwner = useMemo(() => {
    if (!activeUser) return true;
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

  // Edit / Add Modal States
  const [modalType, setModalType] = useState<'category' | 'brand' | 'unit' | null>(null);
  const [modalInputValue, setModalInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State for Create Product (Screenshot 10)
  const [productForm, setProductForm] = useState({
    productName: '',
    skuCode: '',
    category: '',
    rowRack: '',
    brand: '',
    unit: '',
    reOrder: '',
    purchasePrice: '',
    sellingPrice: '',
    qty: '',
    barcode: '',
  });

  // Handle Product Create Submit
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.productName) return;

    if (editingId) {
      setProducts(prev =>
        prev.map(p =>
          p.id === editingId
            ? {
                ...p,
                productName: productForm.productName,
                skuCode: productForm.skuCode,
                category: productForm.category || 'General',
                rowRack: productForm.rowRack,
                brand: productForm.brand || 'Generic',
                unit: productForm.unit || 'Pcs',
                purchasePrice: Number(productForm.purchasePrice) || 0,
                sellingPrice: Number(productForm.sellingPrice) || 0,
                qty: Number(productForm.qty) || 0,
                netAmt: (Number(productForm.sellingPrice) || 0) * (Number(productForm.qty) || 0),
              }
            : p
        )
      );
    } else {
      const newProd: Product = {
        id: Date.now().toString(),
        sl: products.length + 1,
        productName: productForm.productName,
        skuCode: productForm.skuCode,
        barcode: productForm.barcode || Math.floor(1000000 + Math.random() * 9000000).toString(),
        purchasePrice: Number(productForm.purchasePrice) || 0,
        sellingPrice: Number(productForm.sellingPrice) || 0,
        qty: Number(productForm.qty) || 0,
        netAmt: (Number(productForm.sellingPrice) || 0) * (Number(productForm.qty) || 0),
        rowRack: productForm.rowRack,
        date: new Date().toISOString().split('T')[0].split('-').reverse().join('-'),
        category: productForm.category || 'General',
        brand: productForm.brand || 'Generic',
        unit: productForm.unit || 'Pcs',
      };
      setProducts([newProd, ...products]);
    }

    setIsCreatingProduct(false);
    setEditingId(null);
    setProductForm({
      productName: '',
      skuCode: '',
      category: '',
      rowRack: '',
      brand: '',
      unit: '',
      reOrder: '',
      purchasePrice: '',
      sellingPrice: '',
      qty: '',
      barcode: '',
    });
  };

  const handleEditProduct = (prod: Product) => {
    setEditingId(prod.id);
    setProductForm({
      productName: prod.productName || '',
      skuCode: prod.skuCode || '',
      category: prod.category || '',
      rowRack: prod.rowRack || '',
      brand: prod.brand || '',
      unit: prod.unit || '',
      reOrder: prod.reOrderLevel != null ? prod.reOrderLevel.toString() : '',
      purchasePrice: prod.purchasePrice != null ? prod.purchasePrice.toString() : '',
      sellingPrice: prod.sellingPrice != null ? prod.sellingPrice.toString() : '',
      qty: prod.qty != null ? prod.qty.toString() : '',
      barcode: prod.barcode || '',
    });
    setIsCreatingProduct(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Generic Category/Brand/Unit Modal Save
  const handleSaveModal = () => {
    if (!modalInputValue.trim()) return;
    if (modalType === 'category') {
      if (editingId) {
        setCategories(prev => prev.map(c => c.id === editingId ? { ...c, name: modalInputValue } : c));
      } else {
        setCategories(prev => [...prev, { id: Date.now().toString(), sl: prev.length + 1, name: modalInputValue }]);
      }
    } else if (modalType === 'brand') {
      if (editingId) {
        setBrands(prev => prev.map(b => b.id === editingId ? { ...b, name: modalInputValue } : b));
      } else {
        setBrands(prev => [...prev, { id: Date.now().toString(), sl: prev.length + 1, name: modalInputValue }]);
      }
    } else if (modalType === 'unit') {
      if (editingId) {
        setUnits(prev => prev.map(u => u.id === editingId ? { ...u, name: modalInputValue } : u));
      } else {
        setUnits(prev => [...prev, { id: Date.now().toString(), sl: prev.length + 1, name: modalInputValue }]);
      }
    }
    setModalType(null);
    setModalInputValue('');
    setEditingId(null);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = filterCategory ? p.category === filterCategory : true;
    const matchesBrand = filterBrand ? p.brand === filterBrand : true;
    const matchesSearch = matchProductSearch(p, filterSearch);
    return matchesCategory && matchesBrand && matchesSearch;
  });

  const resetFilters = () => {
    setFilterCategory('');
    setFilterBrand('');
    setFilterSearch('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Top Breadcrumb Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setActiveSubTab('product-list');
            setIsCreatingProduct(false);
          }}
          className={`px-4 py-2 text-sm font-extrabold rounded-xl transition-all ${
            activeSubTab === 'product-list' && !isCreatingProduct
              ? 'bg-[#0284c7] text-white shadow-2xs'
              : 'bg-slate-200/70 hover:bg-slate-200 text-slate-800'
          }`}
        >
          Product List
        </button>
        <span className="text-slate-400 font-bold">&gt;</span>
        <button
          onClick={() => {
            setActiveSubTab('category');
            setIsCreatingProduct(false);
          }}
          className={`px-4 py-2 text-sm font-extrabold rounded-xl transition-all ${
            activeSubTab === 'category'
              ? 'bg-[#0284c7] text-white shadow-2xs'
              : 'bg-slate-200/70 hover:bg-slate-200 text-slate-800'
          }`}
        >
          Category
        </button>
        <span className="text-slate-400 font-bold">&gt;</span>
        <button
          onClick={() => {
            setActiveSubTab('brand');
            setIsCreatingProduct(false);
          }}
          className={`px-4 py-2 text-sm font-extrabold rounded-xl transition-all ${
            activeSubTab === 'brand'
              ? 'bg-[#0284c7] text-white shadow-2xs'
              : 'bg-slate-200/70 hover:bg-slate-200 text-slate-800'
          }`}
        >
          Brand
        </button>
        <span className="text-slate-400 font-bold">&gt;</span>
        <button
          onClick={() => {
            setActiveSubTab('units');
            setIsCreatingProduct(false);
          }}
          className={`px-4 py-2 text-sm font-extrabold rounded-xl transition-all ${
            activeSubTab === 'units'
              ? 'bg-[#0284c7] text-white shadow-2xs'
              : 'bg-slate-200/70 hover:bg-slate-200 text-slate-800'
          }`}
        >
          Units
        </button>
      </div>

      {/* CREATE PRODUCT FORM VIEW (Screenshot 10) */}
      {isCreatingProduct ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <h2 className="text-base font-bold text-slate-800">
              {editingId ? 'Edit Product' : 'Product Create Here'}
            </h2>
            <button
              onClick={() => {
                setIsCreatingProduct(false);
                setEditingId(null);
              }}
              className="bg-[#f43f5e] hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors"
            >
              Back To Record
            </button>
          </div>

          <form onSubmit={handleProductSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Product Name"
                  value={productForm.productName ?? ''}
                  onChange={e => setProductForm({ ...productForm, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* SKU Code / Model Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  SKU Code / Model Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. SPARK-40PRO / Model Code"
                  value={productForm.skuCode ?? ''}
                  onChange={e => setProductForm({ ...productForm, skuCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category*
                </label>
                <select
                  value={productForm.category ?? ''}
                  onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500 text-slate-600"
                >
                  <option value="">Select</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* ROW/Rack */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ROW/Rack
                </label>
                <input
                  type="text"
                  placeholder="Row/Rack"
                  value={productForm.rowRack ?? ''}
                  onChange={e => setProductForm({ ...productForm, rowRack: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Brand*
                </label>
                <select
                  value={productForm.brand ?? ''}
                  onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500 text-slate-600"
                >
                  <option value="">Select</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Unit*
                </label>
                <select
                  value={productForm.unit ?? ''}
                  onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500 text-slate-600"
                >
                  <option value="">Select</option>
                  {units.map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Re Order */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Re order*
                </label>
                <input
                  type="text"
                  placeholder="Re Order"
                  value={productForm.reOrder ?? ''}
                  onChange={e => setProductForm({ ...productForm, reOrder: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Purchase Price *
                </label>
                <input
                  type="number"
                  placeholder="Purchase Price"
                  value={productForm.purchasePrice ?? ''}
                  onChange={e => setProductForm({ ...productForm, purchasePrice: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Selling Price *
                </label>
                <input
                  type="number"
                  placeholder="Selling price"
                  value={productForm.sellingPrice ?? ''}
                  onChange={e => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Qty */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Qty *
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  value={productForm.qty ?? ''}
                  onChange={e => setProductForm({ ...productForm, qty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Image Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Image
                </label>
                <div className="flex border border-slate-200 rounded-md overflow-hidden bg-white">
                  <input
                    type="file"
                    className="hidden"
                    id="product-image-file"
                  />
                  <label
                    htmlFor="product-image-file"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer border-r border-slate-200"
                  >
                    Choose File
                  </label>
                  <span className="px-3 py-2 text-xs text-slate-400 flex-1">
                    No file chosen
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">w 250 : H 200</span>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="bg-[#0284c7] hover:bg-sky-600 text-white font-bold text-xs px-6 py-2 rounded-md transition-colors"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingProduct(false);
                  setEditingId(null);
                }}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs px-6 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* PRODUCT LIST SUB TAB */}
          {activeSubTab === 'product-list' && (
            <div className="space-y-5">
              {/* Filter Top Card (Screenshot 1) */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                  <div className="lg:col-span-3">
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs text-slate-600 focus:outline-none focus:border-sky-500"
                    >
                      <option value="">All Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-3">
                    <select
                      value={filterBrand}
                      onChange={e => setFilterBrand(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs text-slate-600 focus:outline-none focus:border-sky-500"
                    >
                      <option value="">All Brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-4">
                    <input
                      type="text"
                      placeholder="search product name"
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs text-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="lg:col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {}}
                      className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition-colors"
                    >
                      Filter
                    </button>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-white border border-rose-300 text-rose-500 hover:bg-rose-50 text-xs font-semibold rounded-md transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Product Table Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-black text-slate-800">Product List</h2>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setProductForm({
                        productName: '',
                        category: '',
                        rowRack: '',
                        brand: '',
                        unit: '',
                        reOrder: '',
                        purchasePrice: '',
                        sellingPrice: '',
                        qty: '',
                        barcode: '',
                      });
                      setIsCreatingProduct(true);
                    }}
                    className="bg-[#0284c7] hover:bg-sky-600 text-white text-sm font-extrabold px-5 py-2.5 rounded-xl transition-colors shadow-2xs"
                  >
                    + Create Product
                  </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-sm text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-800 font-black uppercase text-xs tracking-wider">
                        <th className="py-3.5 px-3.5">SL</th>
                        <th className="py-3.5 px-3.5">PRODUCT NAME</th>
                        <th className="py-3.5 px-3">BARCODE</th>
                        {isUserOwner && (
                          <th className="py-3.5 px-3 text-right bg-amber-50/50 text-amber-900 font-black">
                            PURCHASE PRICE
                          </th>
                        )}
                        <th className="py-3.5 px-3 text-right">SELLING PRICE</th>
                        <th className="py-3.5 px-3 text-center">QTY</th>
                        <th className="py-3.5 px-3 text-right">NET AMT</th>
                        <th className="py-3.5 px-3">ROW/RACK</th>
                        <th className="py-3.5 px-3">DATE</th>
                        <th className="py-3.5 px-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.slice(0, entriesPerPage).map((prod) => (
                        <tr key={prod.id} className="hover:bg-sky-50/20 transition-colors">
                          <td className="py-3.5 px-3.5 text-slate-500 font-bold text-center text-xs">{prod.sl}</td>
                          <td className="py-3.5 px-3.5 max-w-[240px]">
                            <div className="font-extrabold text-slate-800 text-sm leading-snug">{prod.productName}</div>
                            {prod.skuCode && (
                              <div className="inline-block mt-1 text-[10px] font-extrabold font-mono bg-sky-50 text-[#0284c7] px-1.5 py-0.5 rounded border border-sky-200/60">
                                Model: {prod.skuCode}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 font-mono text-xs">{prod.barcode}</td>
                          {isUserOwner && (
                            <td className="py-3.5 px-3 text-right font-bold text-amber-900 bg-amber-50/20 text-sm">
                              ৳{prod.purchasePrice}
                            </td>
                          )}
                          <td className="py-3.5 px-3 text-right font-black text-[#0284c7] text-base">৳{prod.sellingPrice.toFixed(2)}</td>
                          <td className="py-3.5 px-3 text-center font-black text-slate-900 text-base">{prod.qty}</td>
                          <td className="py-3.5 px-3 text-right font-extrabold text-slate-800 text-sm">৳{prod.netAmt}</td>
                          <td className="py-3.5 px-3 text-slate-600 font-semibold text-xs">{prod.rowRack || '—'}</td>
                          <td className="py-3.5 px-3 text-slate-500 font-medium text-xs whitespace-nowrap">{prod.date}</td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditProduct(prod)}
                                className="p-2 bg-[#0284c7] hover:bg-sky-600 text-white rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 bg-[#f43f5e] hover:bg-rose-600 text-white rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY SUB TAB (Screenshot 2) */}
          {activeSubTab === 'category' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">All Category List Here</h2>
                <button
                  onClick={() => {
                    setModalType('category');
                    setEditingId(null);
                    setModalInputValue('');
                  }}
                  className="bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors"
                >
                  Create Category
                </button>
              </div>

              {/* Show entries & Search controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={e => setEntriesPerPage(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Search:</span>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={e => setFilterSearch(e.target.value)}
                    className="px-3 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-extrabold uppercase tracking-tight text-[11px]">
                      <th className="py-2.5 px-3 w-16">SL</th>
                      <th className="py-2.5 px-3">NAME</th>
                      <th className="py-2.5 px-3 text-right w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{cat.sl}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{cat.name}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setModalType('category');
                                setEditingId(cat.id);
                                setModalInputValue(cat.name);
                              }}
                              className="p-1.5 bg-[#0284c7] hover:bg-sky-600 text-white rounded"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setCategories(prev => prev.filter(c => c.id !== cat.id))}
                              className="p-1.5 bg-[#f43f5e] hover:bg-rose-600 text-white rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                <p>Showing 1 to {categories.length} of {categories.length} entries</p>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1 border border-slate-200 rounded text-slate-400 bg-slate-50">Previous</button>
                  <button className="px-3 py-1 bg-[#0284c7] text-white font-bold rounded">1</button>
                  <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">2</button>
                  <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Next &gt;</button>
                </div>
              </div>
            </div>
          )}

          {/* BRAND SUB TAB (Screenshot 5) */}
          {activeSubTab === 'brand' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">All Brand List Here</h2>
                <button
                  onClick={() => {
                    setModalType('brand');
                    setEditingId(null);
                    setModalInputValue('');
                  }}
                  className="bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors"
                >
                  Create
                </button>
              </div>

              {/* Show entries & Search controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={e => setEntriesPerPage(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Search:</span>
                  <input
                    type="text"
                    value={filterSearch ?? ''}
                    onChange={e => setFilterSearch(e.target.value)}
                    className="px-3 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Brand Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-extrabold uppercase tracking-tight text-[11px]">
                      <th className="py-2.5 px-3 w-16">SL</th>
                      <th className="py-2.5 px-3">NAME</th>
                      <th className="py-2.5 px-3 text-right w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {brands.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{b.sl}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{b.name}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setModalType('brand');
                                setEditingId(b.id);
                                setModalInputValue(b.name);
                              }}
                              className="p-1.5 bg-[#0284c7] hover:bg-sky-600 text-white rounded"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setBrands(prev => prev.filter(item => item.id !== b.id))}
                              className="p-1.5 bg-[#f43f5e] hover:bg-rose-600 text-white rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* UNITS SUB TAB (Screenshot 6) */}
          {activeSubTab === 'units' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">All Unit List Here</h2>
                <button
                  onClick={() => {
                    setModalType('unit');
                    setEditingId(null);
                    setModalInputValue('');
                  }}
                  className="bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors"
                >
                  Create Unit
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-extrabold uppercase tracking-tight text-[11px]">
                      <th className="py-2.5 px-3 w-16">SL</th>
                      <th className="py-2.5 px-3">NAME</th>
                      <th className="py-2.5 px-3 text-right w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {units.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{u.sl}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{u.name}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setModalType('unit');
                                setEditingId(u.id);
                                setModalInputValue(u.name);
                              }}
                              className="p-1.5 bg-[#0284c7] hover:bg-sky-600 text-white rounded"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setUnits(prev => prev.filter(item => item.id !== u.id))}
                              className="p-1.5 bg-[#f43f5e] hover:bg-rose-600 text-white rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT MODAL FOR CATEGORY, BRAND, UNIT */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 capitalize">
              {editingId ? 'Edit' : 'Create'} {modalType}
            </h3>
            <input
              type="text"
              placeholder={`Enter ${modalType} name`}
              value={modalInputValue}
              onChange={e => setModalInputValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-sky-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setModalType(null);
                  setEditingId(null);
                  setModalInputValue('');
                }}
                className="px-4 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-1.5 bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
