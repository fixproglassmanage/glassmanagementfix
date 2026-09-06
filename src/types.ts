export interface Product {
  id: string;
  sl: number;
  barcode: string;
  name?: string;
  productName?: string;
  skuCode?: string;
  rowRack?: string;
  reOrderLevel?: number;
  qty?: number;
  category: string;
  brand: string;
  unit: string;
  details?: string;
  purchasePrice: number;
  sellingPrice: number;
  openStock?: number;
  stock?: number;
  netAmt?: number;
  date?: string;
}

export interface Category {
  id: string;
  sl: number;
  name: string;
}

export interface Brand {
  id: string;
  sl: number;
  name: string;
}

export interface Unit {
  id: string;
  sl: number;
  name: string;
}

export interface RecentSale {
  id: string;
  invoiceNo: string;
  customerName: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Canceled';
}

export interface MostSellingProduct {
  id: string;
  name: string;
  category: string;
  soldCount: number;
  revenue: number;
}

export interface CartItem extends Product {
  cartQty: number;
  cartLass: number;
  customPrice?: number;
}

export interface SellingListItem {
  id: string;
  sl: number;
  date: string;
  customerName: string;
  customerPhone?: string;
  phone?: string;
  customerAddress?: string;
  productName: string;
  totalQty?: number;
  qty?: number;
  purchasePrice?: number;
  sellingPrice: number;
  lassAmount?: number;
  afterLassAmount?: number;
  afterLassPrice?: number;
  payAmount: number;
  dueAmount?: number;
  due?: number;
  paymentType?: 'Cash' | 'Due' | 'Partial' | 'Bank' | 'Bkash' | 'Nagad';
  paymentStatus?: string;
  soldBy?: string;
  salesPerson?: string;
  dueReceivedDate?: string;
  paidDate?: string;
  source?: string;
  items?: {
    id: string;
    name: string;
    qty: number;
    purchasePrice: number;
    sellingPrice: number;
    lassAmount: number;
    subTotal: number;
  }[];
}

export interface DueListItem {
  id: string;
  sl: number;
  date: string;
  shopName?: string;
  customerName: string;
  phone: string;
  address?: string;
  productName: string;
  qty?: number;
  sellingPrice: number;
  lassPrice?: number;
  afterLassPrice: number;
  payAmount: number;
  due: number;
  paymentStatus?: string;
  salesPerson?: string;
  lastPaymentDate?: string;
  note?: string;
  isJobEntry?: boolean;
  source?: string;
}

export interface Customer {
  id: string;
  sl: number;
  name: string;
  phone: string;
  address: string;
  image?: string;
  totalPurchase?: number;
  totalPurchases?: number;
  totalDue: number;
  lastPurchaseDate?: string;
}

export interface Manager {
  id: string;
  sl: number;
  name: string;
  phone: string;
  email: string;
  username: string;
  password?: string;
  role: 'Super Admin' | 'Branch Manager' | 'Sales Executive' | 'Accountant' | 'Inventory Officer';
  status: 'Active' | 'Inactive';
  permissions: string[];
}

export type PermissionKey =
  | 'dashboard'
  | 'collection-breakdown'
  | 'selling'
  | 'selling-list'
  | 'due-list'
  | 'due-payment-list'
  | 'reorder-product'
  | 'customer'
  | 'product'
  | 'manager-create'
  | 'report'
  | 'settings';

export interface PermissionItem {
  id: PermissionKey;
  label: string;
  banglaLabel?: string;
  category: 'General' | 'Sales & Billing' | 'Accounts & Dues' | 'Inventory & Catalog' | 'Management';
  description: string;
}

export const ALL_APP_PERMISSIONS: PermissionItem[] = [
  { id: 'dashboard', label: 'Dashboard', banglaLabel: 'Dashboard', category: 'General', description: 'Overview statistics, revenue counters & summaries' },
  { id: 'collection-breakdown', label: 'Collection Breakdown', banglaLabel: 'Collection Breakdown (POS vs Job)', category: 'Accounts & Dues', description: 'Separate analytics for POS Selling and Shop Job Entry collections' },
  { id: 'selling', label: 'Selling (POS)', banglaLabel: 'Selling / POS', category: 'Sales & Billing', description: 'Create sales invoices, scan barcode & checkout' },
  { id: 'selling-list', label: 'Selling List', banglaLabel: 'Selling List', category: 'Sales & Billing', description: 'View, filter & print invoice receipts' },
  { id: 'due-list', label: 'Due List', banglaLabel: 'Due List', category: 'Accounts & Dues', description: 'Manage customer due payments, return & ledger' },
  { id: 'due-payment-list', label: 'Due Payment Ledger', banglaLabel: 'Due Payment Ledger', category: 'Accounts & Dues', description: 'Historical collection log of received dues' },
  { id: 'customer', label: 'Customer List', banglaLabel: 'Customer Directory', category: 'General', description: 'Customer directory, balances & purchase history' },
  { id: 'product', label: 'Product List & Categories', banglaLabel: 'Product & Categories', category: 'Inventory & Catalog', description: 'Manage items, stock counts, categories & brands' },
  { id: 'reorder-product', label: 'Re-Order Product', banglaLabel: 'Re-Order Alerts', category: 'Inventory & Catalog', description: 'Low stock alerts and restock management' },
  { id: 'report', label: 'Reports & Accounts', banglaLabel: 'Reports & Accounts', category: 'Management', description: 'Sales, Paid, Return, Due & Inventory analytics' },
  { id: 'manager-create', label: 'Manager & Access Control', banglaLabel: 'Staff & Permissions', category: 'Management', description: 'Create staff accounts and customize individual access' },
  { id: 'settings', label: 'Shop Settings', banglaLabel: 'Shop Settings', category: 'Management', description: 'Store identity, print invoice & thermal configs' },
];

export interface ReturnItem {
  id: string;
  sl: number;
  soldDate: string;
  returnDate: string;
  invoiceNo?: string;
  customerName: string;
  customerPhone?: string;
  phone?: string;
  productName: string;
  qty: number;
  returnPrice?: number;
  refundAmount?: number;
  returnAmount?: number;
  deductedDue?: number;
  reason: string;
  processedBy?: string;
  salesPerson?: string;
}
