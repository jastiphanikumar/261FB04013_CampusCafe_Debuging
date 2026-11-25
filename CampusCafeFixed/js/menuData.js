/* CampusCafe — menu data + shared constants.
   Must be loaded BEFORE app.js / checkout.js (they depend on these globals). */

// Prices are plain NUMBERS (not strings) so totals add up instead of concatenating.
// Image paths are relative to index.html (the page that renders the menu cards).
const MENU_ITEMS = [
  { id: 1,  name: "Masala Chai",     category: "drinks", price: 20, image: "images/masala-chai.svg" },
  { id: 2,  name: "Filter Coffee",   category: "drinks", price: 30, image: "images/filter-coffee.svg" },
  { id: 3,  name: "Cold Coffee",     category: "drinks", price: 60, image: "images/cold-coffee.svg" },
  { id: 4,  name: "Lemon Iced Tea",  category: "drinks", price: 50, image: "images/lemon-iced-tea.svg" },
  { id: 5,  name: "Mango Lassi",     category: "drinks", price: 70, image: "images/mango-lassi.svg" },
  { id: 6,  name: "Veg Samosa",      category: "snacks", price: 25, image: "images/samosa.svg" },
  { id: 7,  name: "Veg Sandwich",    category: "snacks", price: 55, image: "images/veg-sandwich.svg" },
  { id: 8,  name: "Masala Maggi",    category: "snacks", price: 45, image: "images/maggi.svg" },
  { id: 9,  name: "Vada Pav",        category: "snacks", price: 30, image: "images/vada-pav.svg" },
  { id: 10, name: "Choco Brownie",   category: "snacks", price: 80, image: "images/brownie.svg" }
];

// Shared by index page and checkout page (same key => cart survives navigation)
const CART_KEY = "campusCafeCart";
const PROMO_CODE = "STUDENT15";
const PROMO_MIN_SUBTOTAL = 150;
const PROMO_RATE = 0.15;

// Cart storage helpers (localStorage can throw in private mode, so guard it)
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Coerce to numbers so old/corrupt data can never cause string concatenation
    return parsed
      .map(i => ({ id: Number(i.id), name: String(i.name), price: Number(i.price), qty: Number(i.qty) }))
      .filter(i => Number.isFinite(i.price) && Number.isFinite(i.qty) && i.qty > 0);
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
}

function clearCart() {
  try { localStorage.removeItem(CART_KEY); } catch (e) { /* ignore */ }
}

function cartSubtotal(cart) {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function cartCount(cart) {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

// Format money: whole numbers stay clean (₹150), fractions get 2 decimals (₹127.50)
function formatMoney(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
