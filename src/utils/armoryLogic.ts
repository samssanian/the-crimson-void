import {
  ARMORY_PRODUCTS,
  ArmoryProduct,
  ArmoryProductCategory,
  SAMS_FIGURE_PRODUCT_ID,
} from '../data/armoryData';

export type CartMap = Record<string, number>;

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingCustomer {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderLineItem {
  productId: string;
  name: string;
  category: ArmoryProductCategory;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ArmoryOrder {
  id: string;
  items: OrderLineItem[];
  customer: ShippingCustomer;
  promoCode: string | null;
  discountAmount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentLast4: string;
  status: OrderStatus;
  timestamp: string;
  isLegendPurchase: boolean;
  isNew?: boolean;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  appliedPromo: string | null;
  shipping: number;
  freeShippingEligible: boolean;
  tax: number;
  total: number;
  isWhaleMode: boolean;
}

export interface ShippingValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ShippingCustomer, string>>;
}

export interface PaymentValidationResult {
  valid: boolean;
  errors: {
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
  };
}

export interface OrderAnalytics {
  totalRevenue: number;
  totalOrders: number;
  newOrdersCount: number;
  bestSellerProduct: ArmoryProduct | null;
  bestSellerUnits: number;
  categorySales: Record<ArmoryProductCategory, number>;
}

export const PROMO_CODES: Record<string, { rate: number; label: string; isSecret: boolean }> = {
  CRIMSON10: { rate: 0.1, label: '10% OFF VOID DISPATCH', isSecret: false },
  SAMSLEGEND: { rate: 0.5, label: '50% OFF GUARDIAN SECRET', isSecret: true },
};

export const FREE_SHIPPING_THRESHOLD = 150;
export const FLAT_SHIPPING_RATE = 9.99;
export const TAX_RATE = 0.08;
export const WHALE_MODE_THRESHOLD = 500;
export const HOARDER_QUANTITY_THRESHOLD = 10;

export function roundCurrency(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function normalizePromoCode(raw: string): string | null {
  const code = raw.trim().toUpperCase();
  return PROMO_CODES[code] ? code : null;
}

export function calculateCartTotals(
  cart: CartMap,
  products: ArmoryProduct[] = ARMORY_PRODUCTS,
  promoInput = ''
): CartTotals {
  const productMap = new Map(products.map((p) => [p.id, p]));
  let itemCount = 0;
  let subtotalRaw = 0;

  for (const [productId, qty] of Object.entries(cart)) {
    const product = productMap.get(productId);
    if (!product || qty <= 0) continue;
    itemCount += qty;
    subtotalRaw += product.price * qty;
  }

  const subtotal = roundCurrency(subtotalRaw);
  const appliedPromo = normalizePromoCode(promoInput);
  const discountRate = appliedPromo ? PROMO_CODES[appliedPromo].rate : 0;
  const discountAmount = roundCurrency(subtotal * discountRate);
  const discountedSubtotal = roundCurrency(Math.max(0, subtotal - discountAmount));

  const freeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = subtotal === 0 ? 0 : freeShippingEligible ? 0 : FLAT_SHIPPING_RATE;
  const tax = roundCurrency(discountedSubtotal * TAX_RATE);
  const total = roundCurrency(discountedSubtotal + shipping + tax);

  return {
    itemCount,
    subtotal,
    discountRate,
    discountAmount,
    appliedPromo,
    shipping,
    freeShippingEligible,
    tax,
    total,
    isWhaleMode: subtotal >= WHALE_MODE_THRESHOLD,
  };
}

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatCardExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validateShippingForm(customer: ShippingCustomer): ShippingValidationResult {
  const errors: ShippingValidationResult['errors'] = {};
  if (customer.fullName.trim().length < 2) {
    errors.fullName = 'Enter your full warrior name.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
    errors.email = 'Enter a valid frequency email.';
  }
  if (customer.address.trim().length < 5) {
    errors.address = 'Enter a complete street address.';
  }
  if (customer.city.trim().length < 2) {
    errors.city = 'Enter your city.';
  }
  if (customer.postalCode.trim().length < 3) {
    errors.postalCode = 'Enter a valid postal/ZIP code.';
  }
  if (customer.country.trim().length < 2) {
    errors.country = 'Select a destination realm/country.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validatePaymentForm(
  cardNumber: string,
  expiry: string,
  cvv: string
): PaymentValidationResult {
  const errors: PaymentValidationResult['errors'] = {};
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length !== 16) {
    errors.cardNumber = 'Enter a valid 16-digit demo card number.';
  }

  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
  if (!expiryMatch) {
    errors.expiry = 'Use MM/YY format.';
  } else {
    const month = Number(expiryMatch[1]);
    if (month < 1 || month > 12) {
      errors.expiry = 'Invalid expiry month (01–12).';
    }
  }

  if (!/^\d{3,4}$/.test(cvv.trim())) {
    errors.cvv = 'Enter a 3 or 4 digit CVV.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function createOrderFromCheckout(params: {
  cart: CartMap;
  customer: ShippingCustomer;
  promoCode: string;
  cardNumber: string;
  products?: ArmoryProduct[];
  now?: Date;
  randomCode?: number;
}): ArmoryOrder {
  const products = params.products ?? ARMORY_PRODUCTS;
  const now = params.now ?? new Date();
  const productMap = new Map(products.map((p) => [p.id, p]));
  const items: OrderLineItem[] = [];

  for (const [productId, quantity] of Object.entries(params.cart)) {
    const product = productMap.get(productId);
    if (!product || quantity <= 0) continue;
    items.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      unitPrice: product.price,
      quantity,
      lineTotal: roundCurrency(product.price * quantity),
    });
  }

  const totals = calculateCartTotals(params.cart, products, params.promoCode);
  const rand4 =
    params.randomCode !== undefined
      ? String(params.randomCode).padStart(4, '0').slice(0, 4)
      : String(Math.floor(1000 + Math.random() * 9000));
  const digits = params.cardNumber.replace(/\D/g, '');
  const paymentLast4 = digits.slice(-4) || '4242';
  const isLegendPurchase = items.some((item) => item.productId === SAMS_FIGURE_PRODUCT_ID);

  return {
    id: `CV-${now.getFullYear()}-${rand4}`,
    items,
    customer: {
      fullName: params.customer.fullName.trim(),
      email: params.customer.email.trim(),
      address: params.customer.address.trim(),
      city: params.customer.city.trim(),
      postalCode: params.customer.postalCode.trim(),
      country: params.customer.country.trim(),
    },
    promoCode: totals.appliedPromo,
    discountAmount: totals.discountAmount,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    paymentLast4,
    status: 'pending',
    timestamp: now.toISOString(),
    isLegendPurchase,
    isNew: true,
  };
}

export function computeOrderAnalytics(
  orders: ArmoryOrder[],
  products: ArmoryProduct[] = ARMORY_PRODUCTS
): OrderAnalytics {
  let totalRevenueRaw = 0;
  let newOrdersCount = 0;
  const unitCounts: Record<string, number> = {};
  const categorySales: Record<ArmoryProductCategory, number> = {
    'action-figures': 0,
    costumes: 0,
    weapons: 0,
    collectibles: 0,
  };

  for (const order of orders) {
    if (order.status !== 'cancelled') {
      totalRevenueRaw += order.total;
    }
    if (order.status === 'pending' || order.isNew) {
      newOrdersCount += 1;
    }
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        unitCounts[item.productId] = (unitCounts[item.productId] ?? 0) + item.quantity;
        categorySales[item.category] = roundCurrency(
          (categorySales[item.category] ?? 0) + item.lineTotal
        );
      }
    }
  }

  let bestSellerId: string | null = null;
  let bestSellerUnits = 0;
  for (const [id, count] of Object.entries(unitCounts)) {
    if (count > bestSellerUnits) {
      bestSellerUnits = count;
      bestSellerId = id;
    }
  }

  const bestSellerProduct = bestSellerId
    ? products.find((p) => p.id === bestSellerId) ?? null
    : null;

  return {
    totalRevenue: roundCurrency(totalRevenueRaw),
    totalOrders: orders.length,
    newOrdersCount,
    bestSellerProduct,
    bestSellerUnits,
    categorySales,
  };
}

export const INITIAL_SEED_ORDERS: ArmoryOrder[] = [
  {
    id: 'CV-2026-4821',
    items: [
      {
        productId: SAMS_FIGURE_PRODUCT_ID,
        name: 'SAMS SANIAN AHAMOD — "Crimson Blade" Limited Edition Figure',
        category: 'action-figures',
        unitPrice: 149.99,
        quantity: 1,
        lineTotal: 149.99,
      },
      {
        productId: 'col-metal-keychain-set',
        name: 'Crimson Void Metal Keychain Set',
        category: 'collectibles',
        unitPrice: 29.99,
        quantity: 1,
        lineTotal: 29.99,
      },
    ],
    customer: {
      fullName: 'Kai Takeda',
      email: 'kai@thunder-dojo.jp',
      address: '404 Storm Spire Ave',
      city: 'Neo-Kyoto',
      postalCode: '100-2187',
      country: 'Japan',
    },
    promoCode: 'CRIMSON10',
    discountAmount: 18.0,
    subtotal: 179.98,
    shipping: 0,
    tax: 12.96,
    total: 174.94,
    paymentLast4: '8842',
    status: 'pending',
    timestamp: '2026-11-18T02:10:00.000Z',
    isLegendPurchase: true,
    isNew: true,
  },
  {
    id: 'CV-2026-4790',
    items: [
      {
        productId: 'wep-crimson-fang-katana',
        name: '"Crimson Fang" LED Katana',
        category: 'weapons',
        unitPrice: 199.99,
        quantity: 1,
        lineTotal: 199.99,
      },
      {
        productId: 'cos-akane-kimono',
        name: 'Akane "Crimson Lily" Combat Kimono',
        category: 'costumes',
        unitPrice: 189.99,
        quantity: 1,
        lineTotal: 189.99,
      },
    ],
    customer: {
      fullName: 'Yuki Miyamoto',
      email: 'yuki@snowfall-clan.jp',
      address: '12 Glacier Gate Rd',
      city: 'Sapporo',
      postalCode: '060-0001',
      country: 'Japan',
    },
    promoCode: null,
    discountAmount: 0,
    subtotal: 389.98,
    shipping: 0,
    tax: 31.2,
    total: 421.18,
    paymentLast4: '3109',
    status: 'shipped',
    timestamp: '2026-11-17T19:40:00.000Z',
    isLegendPurchase: false,
    isNew: false,
  },
];
