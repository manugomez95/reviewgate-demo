# ReviewGate demo

Repositorio de pruebas para ReviewGate. El carrito sirve para abrir una PR cuyo cambio se pueda explicar y evaluar con un examen.

Ejecuta `node --test` para comprobar los tests.

`quoteCart(lines, catalog, {discountBps})` añade presupuestos sin efectos secundarios:
agrupa SKUs antes de comprobar stock, calcula importes en céntimos, aplica el descuento
al subtotal con un único redondeo y evalúa el envío gratuito (50 €) después del descuento.
Envío estándar: 4,99 €. Un carrito vacío cuesta cero; uno no vacío con descuento del 100%
sigue pagando envío. Presupuestar no reserva inventario: confirmar una compra necesitaría
otra operación atómica. La API anterior `total` no se modifica.

La integración de ReviewGate y la protección de rama requieren configurar la GitHub App. Hasta entonces, este repositorio no bloquea merges mediante exámenes.
