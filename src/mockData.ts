import { Product, Category, Brand, Unit, RecentSale, SellingListItem, DueListItem, MostSellingProduct, Customer, Manager, ReturnItem } from './types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', sl: 1, name: 'Mobile Parts & Accessories' },
  { id: '2', sl: 2, name: 'Back Part / Body Housing' },
  { id: '3', sl: 3, name: 'LCD Frame & Middle Part' },
  { id: '4', sl: 4, name: 'Charging Logic & Flex' },
  { id: '5', sl: 5, name: 'Power & Volume Ribbon' },
  { id: '6', sl: 6, name: 'Camera Glass & Lens' },
  { id: '7', sl: 7, name: 'Ear Speaker & Ringer Box' },
  { id: '8', sl: 8, name: 'Sim Tray' }
];

export const INITIAL_BRANDS: Brand[] = [
  { id: '1', sl: 1, name: 'Samsung' },
  { id: '2', sl: 2, name: 'iPhone / Apple' },
  { id: '3', sl: 3, name: 'Xiaomi / Redmi / Poco' },
  { id: '4', sl: 4, name: 'Vivo' },
  { id: '5', sl: 5, name: 'Oppo / Realme' },
  { id: '6', sl: 6, name: 'OnePlus' },
  { id: '7', sl: 7, name: 'Google Pixel' },
  { id: '8', sl: 8, name: 'Infinix / Tecno / itel' },
  { id: '9', sl: 9, name: 'Huawei / Honor' },
  { id: '10', sl: 10, name: 'Motorola' }
];

export const INITIAL_UNITS: Unit[] = [
  { id: '1', sl: 1, name: 'Pcs' },
  { id: '2', sl: 2, name: 'Original' },
  { id: '3', sl: 3, name: 'AAA' }
];

export const RECENT_SALES: RecentSale[] = [];
export const MOST_SELLING_PRODUCTS: MostSellingProduct[] = [];
export const SELLING_LIST: SellingListItem[] = [];
export const DUE_LIST: DueListItem[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_MANAGERS: Manager[] = [
  {
    id: '1',
    sl: 1,
    name: 'FixProBd Admin',
    phone: '01700000000',
    email: 'fixprobranch2@gmail.com',
    username: 'admin',
    password: '123',
    role: 'Super Admin',
    status: 'Active',
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
  },
];

export const INITIAL_RETURN_LIST: ReturnItem[] = [];
