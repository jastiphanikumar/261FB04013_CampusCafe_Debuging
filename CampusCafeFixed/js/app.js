/* CampusCafe — menu page logic (index.html) */
(function () {
  "use strict";

  const menuGrid    = document.getElementById("menu-grid");
  const cartList    = document.getElementById("cart-list");
  const cartCountEl = document.getElementById("cart-count");
  const subtotalEl  = document.getElementById("cart-subtotal");
  const cartMsg     = document.getElementById("cart-msg");
  const checkoutBtn = document.getElementById("checkout-btn");
  const searchInput = document.getElementById("search-input");
  const filterBtns  = document.querySelectorAll(".filter-btn");

  let activeCategory = "all";
  let searchTerm = "";
  let cart = loadCart();

  /* ---------- Menu rendering, filtering & search ---------- */
  function renderMenu() {
    const items = MENU_ITEMS.filter(item => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    if (items.length === 0) {
      menuGrid.innerHTML = '<p class="empty-state">No items match your search.</p>';
      return;
    }

    menuGrid.innerHTML = items.map(item => `
      <article class="menu-card">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
        <span class="tag">${escapeHtml(item.category)}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <p class="price">₹${formatMoney(item.price)}</p>
        <button class="btn btn-primary add-btn" data-id="${item.id}">Add to Cart</button>
      </article>
    `).join("");
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      filterBtns.forEach(b => b.classList.toggle("active", b === btn));
      renderMenu();
    });
  });

  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    renderMenu();
  });

  // Event delegation: works for cards that are re-rendered after every filter/search
  menuGrid.addEventListener("click", e => {
    const btn = e.target.closest(".add-btn");
    if (btn) addToCart(Number(btn.dataset.id));
  });

  /* ---------- Cart ---------- */
  function addToCart(id) {
    const item = MENU_ITEMS.find(i => i.id === id);
    if (!item) return;
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty += 1;                       // same item again => bump quantity
    } else {
      cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    }
    cartMsg.textContent = "";
    persistAndRender();
  }

  function changeQty(id, delta) {
    const line = cart.find(i => i.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter(i => i.id !== id);   // remove at 0
    persistAndRender();
  }

  cartList.addEventListener("click", e => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return;
    changeQty(Number(btn.dataset.id), btn.dataset.action === "inc" ? 1 : -1);
  });

  function persistAndRender() {
    saveCart(cart);
    renderCart();
  }

  function renderCart() {
    if (cart.length === 0) {
      cartList.innerHTML = '<li class="cart-empty">Your cart is empty. Add something tasty!</li>';
    } else {
      cartList.innerHTML = cart.map(line => `
        <li class="cart-item">
          <div class="info">
            <span class="name">${escapeHtml(line.name)}</span>
            <span class="unit">₹${formatMoney(line.price)} each</span>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" data-action="dec" data-id="${line.id}" aria-label="Decrease ${escapeHtml(line.name)}">&minus;</button>
            <span class="qty-value">${line.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${line.id}" aria-label="Increase ${escapeHtml(line.name)}">+</button>
          </div>
          <span class="line-total">₹${formatMoney(line.price * line.qty)}</span>
        </li>
      `).join("");
    }
    // Numeric math (price & qty are Numbers) — no string concatenation
    subtotalEl.textContent = formatMoney(cartSubtotal(cart));
    cartCountEl.textContent = cartCount(cart);
  }

  /* ---------- Checkout navigation ---------- */
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      cartMsg.textContent = "Your cart is empty. Please add at least one item before checking out.";
      return;
    }
    saveCart(cart);
    window.location.href = "pages/checkout.html";
  });

  /* ---------- Init ---------- */
  renderMenu();
  renderCart();
})();
