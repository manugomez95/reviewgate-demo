import {test} from 'node:test';
import assert from 'node:assert/strict';
import {quoteCart} from './checkout.js';
const catalog = {book: {priceCents: 2500, stock: 3}, pen: {priceCents: 1, stock: 10}};
test('duplicate SKUs are aggregated before stock validation', () => {
  assert.throws(() => quoteCart([{sku:'book',quantity:2},{sku:'book',quantity:2}],catalog), /stock/);
  assert.deepEqual(quoteCart([{sku:'book',quantity:1},{sku:'book',quantity:2}],catalog).items,
    [{sku:'book',quantity:3,amountCents:7500}]);
});
test('discount can remove free shipping even when subtotal qualified', () => {
  const lines = [{sku:'book',quantity:2}];
  assert.equal(quoteCart(lines,catalog).totalCents,5000);
  assert.deepEqual(quoteCart(lines,catalog,{discountBps:1000}), {
    items:[{sku:'book',quantity:2,amountCents:5000}], subtotalCents:5000,
    discountCents:500,shippingCents:499,totalCents:4999,
  });
});
test('round once on aggregate, not per unit', () => {
  const q=quoteCart([{sku:'pen',quantity:3}],catalog,{discountBps:5000});
  assert.equal(q.discountCents,2);assert.equal(q.totalCents,500);
});
test('empty cart is zero; fully discounted nonempty cart still pays shipping', () => {
  assert.equal(quoteCart([],catalog).totalCents,0);
  assert.equal(quoteCart([{sku:'book',quantity:1}],catalog,{discountBps:10000}).totalCents,499);
});
test('quoting does not reserve stock or mutate input; repeated quotes match', () => {
  const lines=Object.freeze([Object.freeze({sku:'book',quantity:3})]);
  const stock=Object.freeze({book:Object.freeze({priceCents:2500,stock:3})});
  assert.deepEqual(quoteCart(lines,stock),quoteCart(lines,stock));
  assert.equal(stock.book.stock,3);
});
test('invalid quantities and discounts fail', () => {
  for(const quantity of [0,-1,1.5,NaN,Infinity])assert.throws(()=>quoteCart([{sku:'book',quantity}],catalog));
  for(const discountBps of [-1,10001,0.5])assert.throws(()=>quoteCart([],catalog,{discountBps}));
  assert.throws(()=>quoteCart([{sku:'toString',quantity:1}],catalog),/Unknown/);
});
test('unsafe money operations fail instead of silently losing cents', () => {
  assert.throws(()=>quoteCart([{sku:'x',quantity:2}],{x:{priceCents:Number.MAX_SAFE_INTEGER,stock:2}}),/overflow/);
});
