import test from 'node:test';
import assert from 'node:assert/strict';
import { ARMORY_PRODUCTS, SAMS_FIGURE_PRODUCT_ID } from '../data/armoryData';
import {
  INITIAL_SEED_ORDERS,
  calculateCartTotals,
  computeOrderAnalytics,
  createOrderFromCheckout,
  formatCardNumber,
  validatePaymentForm,
  validateShippingForm,
} from './armoryLogic';

test('calculateCartTotals handles shipping threshold, 8% tax, CRIMSON10, SAMSLEGEND, and Whale Mode', () => {
  // Under $150 -> charges $9.99 shipping
  const smallTotals = calculateCartTotals({ 'col-metal-keychain-set': 1 }, ARMORY_PRODUCTS, '');
  assert.equal(smallTotals.itemCount, 1);
  assert.equal(smallTotals.subtotal, 29.99);
  assert.equal(smallTotals.shipping, 9.99);
  assert.equal(smallTotals.tax, 2.4);
  assert.equal(smallTotals.total, 42.38);
  assert.equal(smallTotals.isWhaleMode, false);

  // CRIMSON10 -> 10% discount + free shipping over $150
  const promoTotals = calculateCartTotals(
    { 'wep-crimson-fang-katana': 1 },
    ARMORY_PRODUCTS,
    'crimson10'
  );
  assert.equal(promoTotals.appliedPromo, 'CRIMSON10');
  assert.equal(promoTotals.discountAmount, 20.0);
  assert.equal(promoTotals.shipping, 0);
  assert.equal(promoTotals.tax, 14.4);
  assert.equal(promoTotals.total, 194.39);

  // SAMSLEGEND -> 50% off + Whale Mode >= $500
  const whaleTotals = calculateCartTotals(
    { 'cos-void-council-armor': 2 },
    ARMORY_PRODUCTS,
    'SAMSLEGEND'
  );
  assert.equal(whaleTotals.appliedPromo, 'SAMSLEGEND');
  assert.equal(whaleTotals.isWhaleMode, true);
  assert.equal(whaleTotals.discountAmount, 329.99);
});

test('validateShippingForm and validatePaymentForm enforce required fields and format card numbers', () => {
  assert.equal(formatCardNumber('4242424242424242'), '4242 4242 4242 4242');

  const badShipping = validateShippingForm({
    fullName: 'A',
    email: 'nope',
    address: '12',
    city: '',
    postalCode: '1',
    country: '',
  });
  assert.equal(badShipping.valid, false);
  assert.ok(badShipping.errors.fullName && badShipping.errors.email && badShipping.errors.address);

  const goodShipping = validateShippingForm({
    fullName: 'Ren Kurosaki',
    email: 'ren@neo-kyoto.jp',
    address: '88 Crimson Tower Blvd',
    city: 'Neo-Kyoto',
    postalCode: '100-0001',
    country: 'Japan',
  });
  assert.equal(goodShipping.valid, true);

  assert.equal(validatePaymentForm('1234', '99/28', '12').valid, false);
  assert.equal(validatePaymentForm('4242 4242 4242 4242', '12/28', '424').valid, true);
});

test('createOrderFromCheckout flags Legend Purchase for Sams figure and computeOrderAnalytics summarizes revenue', () => {
  const order = createOrderFromCheckout({
    cart: { [SAMS_FIGURE_PRODUCT_ID]: 1, 'col-enamel-pin-collection': 2 },
    customer: {
      fullName: 'Akane Hoshino',
      email: 'akane@crimson-lily.org',
      address: '9 Sakura Plaza',
      city: 'Neo-Kyoto',
      postalCode: '102-0001',
      country: 'Japan',
    },
    promoCode: 'CRIMSON10',
    cardNumber: '4242 4242 4242 9911',
    now: new Date('2026-11-18T03:00:00.000Z'),
    randomCode: 7777,
  });

  assert.equal(order.id, 'CV-2026-7777');
  assert.equal(order.isLegendPurchase, true);
  assert.equal(order.paymentLast4, '9911');
  assert.equal(order.status, 'pending');

  const analytics = computeOrderAnalytics([order, ...INITIAL_SEED_ORDERS], ARMORY_PRODUCTS);
  assert.equal(analytics.totalOrders, 3);
  assert.equal(analytics.bestSellerProduct?.id, SAMS_FIGURE_PRODUCT_ID);
  assert.equal(analytics.bestSellerUnits, 2);
  assert.ok(analytics.totalRevenue > 700);
});
