/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowRight, LogIn } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductView } from './components/ProductView';
import { SellingPosView } from './components/SellingPosView';
import { SellingListView } from './components/SellingListView';
import { DueListView } from './components/DueListView';
import { DuePaymentListView } from './components/DuePaymentListView';
import { ReOrderProductView } from './components/ReOrderProductView';
import { CustomerView } from './components/CustomerView';
import { ManagerView } from './components/ManagerView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import { CollectionBreakdownView } from './components/CollectionBreakdownView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginView } from './components/LoginView';

import {
  subscribeCollection,
  COLLECTIONS,
  syncCollection,
  seedInitialDataIfEmpty,
  wipeFirestoreDatabase,
} from './services/firestoreService';

import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_UNITS,
  SELLING_LIST,
  DUE_LIST,
  INITIAL_CUSTOMERS,
  INITIAL_MANAGERS,
  INITIAL_RETURN_LIST,
} from './mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productSubTab, setProductSubTab] = useState('product-list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authentication & Logged-In User State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('fixpro_logged_in') === 'true';
  });

  const [activeUser, setActiveUser] = useState<{
    name: string;
    role: string;
    email?: string;
    phone?: string;
    permissions?: string[];
  }>(() => {
    const saved = localStorage.getItem('fixpro_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      name: 'FixProBd Admin',
      role: 'Super Admin',
      email: 'admin@fixpro.com',
      phone: '01700000000',
      permissions: [
        'dashboard',
        'collection-breakdown',
        'selling',
        'selling-list',
        'due-list',
        'due-payment-list',
        'reorder-product',
        'customer',
        'product',
        'manager-create',
        'report',
        'settings',
      ],
    };
  });

  // Keep activeUser persisted in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fixpro_user', JSON.stringify(activeUser));
    } catch (e) {
      // ignore storage errors
    }
  }, [activeUser]);

  // Helper to load cached state from localStorage or fallback
  const getCachedState = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`fixpro_${key}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore JSON parse error
    }
    return fallback;
  };

  // Application Data States (Hybrid: Local Cache First + Realtime Firestore)
  const [products, setProductsState] = useState(() => getCachedState('products', INITIAL_PRODUCTS));
  const [categories, setCategoriesState] = useState(() => getCachedState('categories', INITIAL_CATEGORIES));
  const [brands, setBrandsState] = useState(() => getCachedState('brands', INITIAL_BRANDS));
  const [units, setUnitsState] = useState(() => getCachedState('units', INITIAL_UNITS));
  const [salesList, setSalesListState] = useState(() => getCachedState('sales', SELLING_LIST));
  const [dueList, setDueListState] = useState(() => getCachedState('dues', DUE_LIST));
  const [customers, setCustomersState] = useState(() => getCachedState('customers', INITIAL_CUSTOMERS));
  const [managers, setManagersState] = useState(() => getCachedState('managers', INITIAL_MANAGERS));
  const [returnList, setReturnListState] = useState(() => getCachedState('returns', INITIAL_RETURN_LIST));

  // Wrappers that update local state, localStorage, and fire-and-forget sync to Firestore
  const setProducts = (val: typeof INITIAL_PRODUCTS | ((prev: typeof INITIAL_PRODUCTS) => typeof INITIAL_PRODUCTS)) => {
    setProductsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('fixpro_products', JSON.stringify(next)); } catch {}
      syncCollection(COLLECTIONS.PRODUCTS, next);
      return next;
    });
  };

  const setCategories = (val: typeof INITIAL_CATEGORIES | ((prev: typeof INITIAL_CATEGORIES) => typeof INITIAL_CATEGORIES)) => {
    setCategoriesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('fixpro_categories', JSON.stringify(next)); } catch {}
      syncCollection(COLLECTIONS.CATEGORIES, next);
      return next;
    });
  };

  const setBrands = (val: typeof INITIAL_BRANDS | ((prev: typeof INITIAL_BRANDS) => typeof INITIAL_BRANDS)) => {
    setBrandsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('fixpro_brands', JSON.stringify(next)); } catch {}
      syncCollection(COLLECTIONS.BRANDS, next);
      return next;
    });
  };

  const setUnits = (val: typeof INITIAL_UNITS | ((prev: typeof INITIAL_UNITS) => typeof INITIAL_UNITS)) => {
    setUnitsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('fixpro_units', JSON.stringify(next)); } catch {}
      syncCollection(COLLECTIONS.UNITS, next);
      return next;
    });
  };

  const setSalesList = (val: typeof SELLING_LIST | ((prev: typeof SELLING_LIST) => typeof SELLING_LIST)) => {
    setSalesListState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('fixpro_sales', JSON.stringify(next)); } catch {}
      syncCollection(COLLECTIONS.SALES, next);
      return next;
    });
  };

  const setDueList = (val: typeof DUE_LIST | ((prev: typeof DUE_LIST) => typeof DUE_LIST)) => {
    setDueListState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('fixpro_dues', JSON.stringify(next)); } catch {}
      syncCollection(COLLECTIONS.DUES, next);
      return next;
    });
  };

  const setCustomers = (val: typeof INITIAL_CUSTOMERS | ((prev: typeof INITIAL_CUSTOMERS) => typeof INITIAL_CUSTOMERS)) => {
    setCustomersState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('fixpro_customers', JSON.stringify(next)); } catch {}
      syncCollection(COLLECTIONS.CUSTOMERS, next);
      return next;
    });
  };

  const setManagers = (val: typeof INITIAL_MANAGERS | ((prev: typeof INITIAL_MANAGERS) => typeof INITIAL_MANAGERS)) => {
    setManagersState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('fixpro_managers', JSON.stringify(next)); } catch {}
      syncCollection(COLLECTIONS.MANAGERS, next);
      return next;
    });
  };

  const setReturnList = (val: typeof INITIAL_RETURN_LIST | ((prev: typeof INITIAL_RETURN_LIST) => typeof INITIAL_RETURN_LIST)) => {
    setReturnListState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try { localStorage.setItem('fixpro_returns', JSON.stringify(next)); } catch {}
      syncCollection(COLLECTIONS.RETURNS, next);
      return next;
    });
  };

  // Real-time Firestore Sync Subscriptions
  useEffect(() => {
    // Check & Seed Initial Admin manager on database if first time
    seedInitialDataIfEmpty({
      managers: INITIAL_MANAGERS,
    });

    const unsubs = [
      subscribeCollection(COLLECTIONS.PRODUCTS, (data) => {
        setProductsState(data as any);
        try { localStorage.setItem('fixpro_products', JSON.stringify(data)); } catch {}
      }),
      subscribeCollection(COLLECTIONS.CATEGORIES, (data) => {
        setCategoriesState(data as any);
        try { localStorage.setItem('fixpro_categories', JSON.stringify(data)); } catch {}
      }),
      subscribeCollection(COLLECTIONS.BRANDS, (data) => {
        setBrandsState(data as any);
        try { localStorage.setItem('fixpro_brands', JSON.stringify(data)); } catch {}
      }),
      subscribeCollection(COLLECTIONS.UNITS, (data) => {
        setUnitsState(data as any);
        try { localStorage.setItem('fixpro_units', JSON.stringify(data)); } catch {}
      }),
      subscribeCollection(COLLECTIONS.SALES, (data) => {
        setSalesListState(data as any);
        try { localStorage.setItem('fixpro_sales', JSON.stringify(data)); } catch {}
      }),
      subscribeCollection(COLLECTIONS.DUES, (data) => {
        setDueListState(data as any);
        try { localStorage.setItem('fixpro_dues', JSON.stringify(data)); } catch {}
      }),
      subscribeCollection(COLLECTIONS.CUSTOMERS, (data) => {
        setCustomersState(data as any);
        try { localStorage.setItem('fixpro_customers', JSON.stringify(data)); } catch {}
      }),
      subscribeCollection(COLLECTIONS.MANAGERS, (data) => {
        if (data && data.length > 0) {
          setManagersState(data as any);
          try { localStorage.setItem('fixpro_managers', JSON.stringify(data)); } catch {}
        }
      }),
      subscribeCollection(COLLECTIONS.RETURNS, (data) => {
        setReturnListState(data as any);
        try { localStorage.setItem('fixpro_returns', JSON.stringify(data)); } catch {}
      }),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
    };
  }, []);

  // Access control helper
  const hasAccess = (permId: string) => {
    if (activeUser.role === 'Super Admin') return true;
    if (!activeUser.permissions || activeUser.permissions.length === 0) return true;
    return activeUser.permissions.includes(permId);
  };

  const handleLoginSuccess = (user: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    permissions?: string[];
  }) => {
    setActiveUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('fixpro_logged_in', 'true');
    localStorage.setItem('fixpro_user', JSON.stringify(user));

    // If user's permissions don't include default 'dashboard', route to first permitted tab
    if (user.permissions && user.permissions.length > 0 && !user.permissions.includes('dashboard')) {
      setActiveTab(user.permissions[0]);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('fixpro_logged_in');
    localStorage.removeItem('fixpro_user');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    if (tab === 'product') {
      setProductSubTab('product-list');
    }
  };

  const handleResetDatabase = async (options: {
    wipeSales?: boolean;
    wipeDues?: boolean;
    wipeProducts?: boolean;
    wipeCustomers?: boolean;
    wipeReturns?: boolean;
    wipeCategories?: boolean;
    wipeBrands?: boolean;
    wipeUnits?: boolean;
    wipeNonAdminManagers?: boolean;
  }) => {
    if (options.wipeProducts) {
      setProductsState([]);
      try { localStorage.setItem('fixpro_products', JSON.stringify([])); } catch {}
    }
    if (options.wipeSales) {
      setSalesListState([]);
      try { localStorage.setItem('fixpro_sales', JSON.stringify([])); } catch {}
    }
    if (options.wipeDues) {
      setDueListState([]);
      try { localStorage.setItem('fixpro_dues', JSON.stringify([])); } catch {}
    }
    if (options.wipeCustomers) {
      setCustomersState([]);
      try { localStorage.setItem('fixpro_customers', JSON.stringify([])); } catch {}
    }
    if (options.wipeReturns) {
      setReturnListState([]);
      try { localStorage.setItem('fixpro_returns', JSON.stringify([])); } catch {}
    }
    if (options.wipeCategories) {
      setCategoriesState([]);
      try { localStorage.setItem('fixpro_categories', JSON.stringify([])); } catch {}
    }
    if (options.wipeBrands) {
      setBrandsState([]);
      try { localStorage.setItem('fixpro_brands', JSON.stringify([])); } catch {}
    }
    if (options.wipeUnits) {
      setUnitsState([]);
      try { localStorage.setItem('fixpro_units', JSON.stringify([])); } catch {}
    }
    if (options.wipeNonAdminManagers) {
      setManagersState((prev) => {
        const next = prev.filter((m) => m.role === 'Super Admin');
        try { localStorage.setItem('fixpro_managers', JSON.stringify(next)); } catch {}
        return next;
      });
    }

    // Call firestore wipe service
    await wipeFirestoreDatabase(options);
  };

  if (!isLoggedIn) {
    return <LoginView managers={managers} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0f172a] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex flex-1 relative min-h-screen">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          userPermissions={activeUser.permissions}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
            activeView={activeTab}
            activeUser={activeUser}
            setActiveUser={setActiveUser}
            managers={managers}
            setManagers={setManagers}
            onLogout={handleLogout}
          />

          {/* Page Body View Router */}
          <main className="flex-1 pb-28 md:pb-8">
            {/* Permission Check Protection Fallback */}
            {(() => {
              // Map tab to permission key
              let requiredPerm = activeTab;
              if (['product-list', 'category', 'brand', 'units'].includes(activeTab)) {
                requiredPerm = 'product';
              } else if (activeTab.startsWith('report')) {
                requiredPerm = 'report';
              } else if (activeTab === 'collection-breakdown') {
                requiredPerm = 'collection-breakdown';
              }

              if (!hasAccess(requiredPerm)) {
                const firstAllowed = (activeUser.permissions && activeUser.permissions[0]) || 'selling';
                return (
                  <div className="p-6 max-w-lg mx-auto my-12 bg-white rounded-2xl border border-rose-200 shadow-sm text-center">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      You do not have permission to view the <span className="font-semibold text-slate-700">{activeTab}</span> module. Please contact the administrator.
                    </p>
                    <button
                      onClick={() => handleTabChange(firstAllowed)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0284c7] text-white text-sm font-bold rounded-xl hover:bg-sky-600 transition-colors shadow-sm"
                    >
                      <span>Go to Allowed View ({firstAllowed})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              }

              return (
                <>
                  {activeTab === 'dashboard' && (
                    <DashboardView
                      setActiveTab={handleTabChange}
                      products={products}
                      customers={customers}
                      salesList={salesList}
                      dueList={dueList}
                      userPermissions={activeUser.permissions}
                      isSuperAdmin={activeUser.role === 'Super Admin'}
                    />
                  )}

                  {activeTab === 'collection-breakdown' && (
                    <CollectionBreakdownView
                      setActiveTab={handleTabChange}
                      salesList={salesList}
                      dueList={dueList}
                      activeUser={activeUser}
                    />
                  )}

                  {(activeTab === 'product' || ['product-list', 'category', 'brand', 'units'].includes(activeTab)) && (
                    <ProductView
                      activeSubTab={productSubTab}
                      setActiveSubTab={setProductSubTab}
                      products={products}
                      setProducts={setProducts}
                      categories={categories}
                      setCategories={setCategories}
                      brands={brands}
                      setBrands={setBrands}
                      units={units}
                      setUnits={setUnits}
                      activeUser={activeUser}
                    />
                  )}

                  {activeTab === 'selling' && (
                    <SellingPosView
                      products={products}
                      customers={customers}
                      salesList={salesList}
                      dueList={dueList}
                      setProducts={setProducts}
                      setSalesList={setSalesList}
                      setDueList={setDueList}
                      setCustomers={setCustomers}
                      setActiveTab={handleTabChange}
                      activeUser={activeUser}
                    />
                  )}

                  {activeTab === 'selling-list' && (
                    <SellingListView
                      salesList={salesList}
                      setSalesList={setSalesList}
                      activeUser={activeUser}
                    />
                  )}

                  {activeTab === 'due-list' && (
                    <DueListView
                      dueList={dueList}
                      setDueList={setDueList}
                      salesList={salesList}
                      setSalesList={setSalesList}
                      customers={customers}
                      setCustomers={setCustomers}
                      products={products}
                      setProducts={setProducts}
                      activeUser={activeUser}
                    />
                  )}

                  {activeTab === 'due-payment-list' && (
                    <DuePaymentListView
                      salesList={salesList}
                      activeUser={activeUser}
                    />
                  )}

                  {activeTab === 'reorder-product' && (
                    <ReOrderProductView
                      products={products}
                      setProducts={setProducts}
                    />
                  )}

                  {activeTab === 'customer' && (
                    <CustomerView
                      customers={customers}
                      setCustomers={setCustomers}
                    />
                  )}

                  {activeTab === 'manager-create' && (
                    <ManagerView
                      managers={managers}
                      setManagers={setManagers}
                      activeUser={activeUser}
                      setActiveUser={setActiveUser}
                    />
                  )}

                  {(activeTab === 'report' || activeTab.startsWith('report-')) && (
                    <ReportView
                      salesList={salesList}
                      dueList={dueList}
                      products={products}
                      customers={customers}
                      returnList={returnList}
                      setReturnList={setReturnList}
                      activeUser={activeUser}
                      initialReportType={
                        activeTab === 'report-paid'
                          ? 'paid'
                          : activeTab === 'report-return'
                          ? 'return'
                          : activeTab === 'report-due'
                          ? 'due'
                          : activeTab === 'report-inventory'
                          ? 'inventory'
                          : 'sales'
                      }
                    />
                  )}

                  {activeTab === 'settings' && (
                    <SettingsView
                      onResetDatabase={handleResetDatabase}
                      activeUser={activeUser}
                      managers={managers}
                      setManagers={setManagers}
                      setActiveUser={setActiveUser}
                    />
                  )}
                </>
              );
            })()}
          </main>

          {/* Mobile Native App Bottom Navigation Bar */}
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            setMobileSidebarOpen={setMobileSidebarOpen}
            userPermissions={activeUser.permissions}
            dueCount={dueList.length}
          />
        </div>
      </div>
    </div>
  );
}
