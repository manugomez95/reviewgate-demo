/** Pure quote: all monetary values are integer cents; inventory is never reserved. */
export function quoteCart(lines, catalog, {discountBps = 0} = {}) {
  if (!Array.isArray(lines)) throw new TypeError('lines must be an array');
  if (!Number.isInteger(discountBps) || discountBps < 0 || discountBps > 10000) {
    throw new RangeError('discountBps must be between 0 and 10000');
  }
  const quantities = new Map();
  for (const {sku, quantity} of lines) {
    if (typeof sku !== 'string' || !sku || !Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new RangeError('Each line needs a SKU and a positive integer quantity');
    }
    const combined = (quantities.get(sku) ?? 0) + quantity;
    if (!Number.isSafeInteger(combined)) throw new RangeError('Quantity overflow');
    quantities.set(sku, combined);
  }
  const items = [...quantities].map(([sku, quantity]) => {
    if (!Object.hasOwn(catalog, sku)) throw new Error(`Unknown SKU: ${sku}`);
    const product = catalog[sku];
    if (!Number.isSafeInteger(product.priceCents) || product.priceCents < 0 ||
        !Number.isSafeInteger(product.stock) || product.stock < 0) throw new RangeError('Invalid catalog');
    if (quantity > product.stock) throw new Error(`Insufficient stock: ${sku}`);
    const amountCents = product.priceCents * quantity;
    if (!Number.isSafeInteger(amountCents)) throw new RangeError('Amount overflow');
    return {sku, quantity, amountCents};
  });
  const subtotalCents = items.reduce((sum, item) => sum + item.amountCents, 0);
  if (!Number.isSafeInteger(subtotalCents)) throw new RangeError('Subtotal overflow');
  // Discount is rounded once for the complete cart, half a cent upwards.
  const discountCents = Number((BigInt(subtotalCents) * BigInt(discountBps) + 5000n) / 10000n);
  const discountedCents = subtotalCents - discountCents;
  // Free shipping is evaluated AFTER discounts. Empty carts never pay shipping.
  const shippingCents = items.length === 0 || discountedCents >= 5000 ? 0 : 499;
  const totalCents = discountedCents + shippingCents;
  if (!Number.isSafeInteger(totalCents)) throw new RangeError('Total overflow');
  return {items, subtotalCents, discountCents, shippingCents, totalCents};
}
