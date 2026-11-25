/* CampusCafe — checkout page logic (pages/checkout.html) */
(function () {
  "use strict";

  const orderList     = document.getElementById("order-list");
  const subtotalEl    = document.getElementById("co-subtotal");
  const discountRow   = document.getElementById("discount-row");
  const discountEl    = document.getElementById("co-discount");
  const grandTotalEl  = document.getElementById("grand-total");
  const promoInput    = document.getElementById("promo-input");
  const promoBtn      = document.getElementById("apply-promo-btn");
  const promoMsg      = document.getElementById("promo-msg");
  const form          = document.getElementById("checkout-form");
  const nameInput     = document.getElementById("full-name");
  const rollInput     = document.getElementById("roll-number");
  const formMsg       = document.getElementById("form-msg");
  const checkoutView  = document.getElementById("checkout-view");
  const confirmView   = document.getElementById("confirmation-view");
  const confirmText   = document.getElementById("confirmation-text");
  const orderIdEl     = document.getElementById("order-id");

  let cart = loadCart();
  let discount = 0;           // always a Number; reset to 0 on any failed promo

  const round2 = n => Math.round(n * 100) / 100;

  function render() {
    if (cart.length === 0) {
      orderList.innerHTML = '<li class="cart-empty">Your cart is empty. <a href="../index.html">Go back to the menu</a>.</li>';
    } else {
      orderList.innerHTML = cart.map(line => `
        <li class="cart-item">
          <div class="info">
            <span class="name">${escapeHtml(line.name)}</span>
            <span class="unit">₹${formatMoney(line.price)} × ${line.qty}</span>
          </div>
          <span class="line-total">₹${formatMoney(line.price * line.qty)}</span>
        </li>
      `).join("");
    }

    const subtotal = cartSubtotal(cart);
    const grandTotal = Math.max(0, round2(subtotal - discount));

    subtotalEl.textContent = formatMoney(subtotal);
    discountEl.textContent = formatMoney(discount);
    discountRow.classList.toggle("hidden", discount <= 0);
    grandTotalEl.textContent = formatMoney(grandTotal);
  }

  /* ---------- Promo code ---------- */
  function applyPromo() {
    const code = promoInput.value.trim().toUpperCase();
    const subtotal = cartSubtotal(cart);

    promoMsg.className = "msg-error";
    discount = 0;                                  // reset first; set again only on success

    if (!code) {
      promoMsg.textContent = "Please enter a promo code.";
    } else if (code !== PROMO_CODE) {
      promoMsg.textContent = "Invalid promo code.";
    } else if (subtotal < PROMO_MIN_SUBTOTAL) {
      promoMsg.textContent = `STUDENT15 needs a subtotal of ₹${PROMO_MIN_SUBTOTAL} or more. Your subtotal is ₹${formatMoney(subtotal)}.`;
    } else {
      discount = round2(subtotal * PROMO_RATE);
      promoMsg.className = "msg-success";
      promoMsg.textContent = `Promo applied! You saved ₹${formatMoney(discount)} (15% off).`;
    }
    render();
  }

  promoBtn.addEventListener("click", applyPromo);
  promoInput.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); applyPromo(); }
  });

  /* ---------- Order confirmation ---------- */
  function generateOrderId() {
    const d = new Date();
    const pad = n => String(n).padStart(2, "0");
    const stamp = `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CC-${stamp}-${rand}`;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    formMsg.className = "msg-error";

    if (cart.length === 0) {
      formMsg.textContent = "Your cart is empty. Add items from the menu before confirming an order.";
      return;
    }
    const name = nameInput.value.trim();
    const roll = rollInput.value.trim();
    if (!name || !roll) {
      formMsg.textContent = "Please enter both your Full Name and Roll Number.";
      (!name ? nameInput : rollInput).focus();
      return;
    }

    const total = Math.max(0, round2(cartSubtotal(cart) - discount));
    const orderId = generateOrderId();

    clearCart();                                   // saved cart is removed after a valid order
    cart = [];
    discount = 0;

    orderIdEl.textContent = orderId;
    confirmText.textContent =
      `Thank you, ${name} (${roll})! Your order of ₹${formatMoney(total)} has been placed.`;
    checkoutView.classList.add("hidden");
    confirmView.classList.remove("hidden");
  });

  render();
})();
