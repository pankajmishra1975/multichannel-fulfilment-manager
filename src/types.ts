export type OrderSource = 'amazon' | 'ebay' | 'shopify' | 'prestashop' | 'onbuy' | 'etsy' | 'temu' | 'tiktok';

export type OrderStatus = 'pending' | 'shipped' | 'cancelled';

export interface OrderItem {
  sku: string;
  title: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrRegion: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
}

export interface CarrierRate {
  id: string;
  carrierName: string;
  serviceName: string;
  amount: number;
  currency: string;
  deliveryDays: number;
  shippingType: 'buy_shipping' | 'shipping_v2';
}

export interface Order {
  id: string; // Amazon Order ID or eBay Order ID
  source: OrderSource;
  status: OrderStatus;
  buyerName: string;
  buyerEmail?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  orderDate: string;
  totalAmount: number;
  currency: string;
  selectedRate?: CarrierRate;
  trackingNumber?: string;
  labelUrl?: string; // Reference base64 or URL
  shippedAt?: string;
  weightOz?: number; // parcel weight
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  notes?: string;
  shippingDate?: string;
  carrier?: string;
  serviceClass?: string;
  labelPrinted?: boolean;
  channelConfirmed?: boolean;
  channelConfirmedAt?: string;
  dispatchedAt?: string;
  templateId?: string;
}

export interface ShippingCompanyTemplate {
  id: string;
  name: string;
  carrierName: string;
  serviceName: string;
  serviceCode: string;
  packageType: 'custom' | 'envelope' | 'box_small' | 'box_medium' | 'parcel';
  defaultWeightOz: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  channelAffinity?: OrderSource | 'all';
  paperSize: '4x6' | '8.5x11' | 'A4' | 'ZPL';
  trackingPrefix: string;
  isDefault?: boolean;
}

export interface ApiCredentials {
  amazonSellerId: string;
  amazonClientId: string;
  amazonClientSecret: string;
  amazonRefreshToken: string;
  ebayClientId: string;
  ebayClientSecret: string;
  ebayRefreshToken: string;
  isSandbox: boolean;

  // Prestashop
  prestashopStoreUrl?: string;
  prestashopApiKey?: string;

  // OnBuy
  onbuySellerKey?: string;
  onbuySellerSecret?: string;
  onbuyShopId?: string;

  // Etsy
  etsyShopName?: string;
  etsyClientId?: string;
  etsyClientSecret?: string;
  etsyRefreshToken?: string;

  // Temu
  temuSellerId?: string;
  temuAccessToken?: string;

  // TikTok
  tiktokShopId?: string;
  tiktokAppKey?: string;
  tiktokAppSecret?: string;
  tiktokRefreshToken?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  source: 'system' | 'amazon_api' | 'ebay_api' | 'shipping_api' | 'ai';
  message: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  alertDays: number[]; // e.g. [90, 60, 30] or [21, 14]
}

export interface Product {
  sku: string;
  name: string;
  description: string;
  weight?: number; // Weight in oz
  size?: string;   // e.g., "12x8x4"
  buyingPrice: number;
  sellingPrice: number;
  vatType: 'VAT' | 'Non VAT';
  commission?: number;
  shippingCost?: number;
  image?: string;
  images?: string[];
  stock: number;
  stockByWarehouse?: Record<string, number>;
  mappedSku?: string; // Channel product SKU mapping
  barcode?: string; // Physical barcode/UPC
  source?: 'amazon' | 'ebay' | 'all' | 'none';
  isBundle?: boolean;
  bundleComponents?: { sku: string; quantity: number }[];
  expiryDate?: string; // ISO Date string for expiry
  expiryAcknowledged?: boolean; // True if the close expiry warning has been acknowledged
  categoryId?: string;
  lastAcknowledgedDays?: number;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
}

export interface PurchaseOrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  receivedQuantity?: number;
}

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  notes?: string;
  totalAmount: number;
}

export interface VirtualPrinter {
  id: string;
  name: string;
  type: 'thermal' | 'laser' | 'inkjet';
  connection: 'virtual' | 'printnode' | 'ip_raw' | 'cloud_print';
  status: 'online' | 'offline';
  ipAddress?: string;
  port?: number;
  paperSize: '4x6' | '8.5x11' | 'A4' | 'ZPL';
  apiKey?: string;
  isDefault: boolean;
}

export interface RuleCondition {
  field: 'source' | 'sku' | 'weightOz' | 'destinationState' | 'destinationCountry' | 'totalAmount' | 'shippingDate';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
}

export interface RuleAction {
  type: 'assign_carrier' | 'assign_service' | 'add_tag' | 'add_note' | 'require_shipping_date' | 'set_weight';
  value: string;
}

export interface ShippingRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
}


