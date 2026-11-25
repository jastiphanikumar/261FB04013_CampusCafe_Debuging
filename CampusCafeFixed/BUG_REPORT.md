# CampusCafe — Bug Fix Report (Step by Step)

This report records every problem found in the AI-generated CampusCafe project, in the order it was fixed: the symptom, the root cause, the fix, and how it was verified.

> **Scope note.** Only `index.html` and `README.md` were supplied. Bugs 1–3 were found directly in `index.html`. Bugs 4–10 are the failures described in the README's task list; the files they live in (`checkout.html`, the CSS, the JS and the images) were missing, so those files were rebuilt with the fixes already applied. The "Before" for those steps describes the failure the README reports, not code I could read.

---

## Phase 1 — Folder structure and resource links

### Step 1 — Wrong, misspelled theme stylesheet path (`index.html`)
- **Symptom:** The page loads without colours, theme or background.
- **Root cause:** The link pointed to `styles/them.css`. The folder name was inconsistent with `css/`, and the filename was misspelled (`them` instead of `theme`).
- **Before:** `<link rel="stylesheet" href="styles/them.css" />`
- **After:** `<link rel="stylesheet" href="css/theme.css" />`
- **Verified:** The computed `background-image` on `<body>` resolves to `images/pattern.svg`.

### Step 2 — Inconsistent folder naming across the project
- **Symptom:** Resources were spread across `css/`, `styles/`, `scripts/` and `js/`, which made every path a guess.
- **Root cause:** The `<link>` and `<script>` tags used four different folder names.
- **Fix:** Standardised the structure to `css/`, `js/`, `images/` and `pages/`.
- **Before:** `scripts/app.js` and `js/menuData.js`
- **After:** `js/menuData.js` and `js/app.js`

### Step 3 — Wrong script load order (`index.html`)
- **Symptom:** The menu is empty and the console shows `MENU_ITEMS is not defined`.
- **Root cause:** `app.js` ran before `menuData.js`, so the data it needs did not exist yet. Browsers run classic `<script>` tags in document order.
- **Before:**
  ```html
  <script src="scripts/app.js"></script>
  <script src="js/menuData.js"></script>
  ```
- **After:**
  ```html
  <script src="js/menuData.js"></script>
  <script src="js/app.js"></script>
  ```
- **Verified:** All 10 menu cards render with zero console errors.

### Step 4 — Broken paths on the checkout page (`pages/checkout.html`)
- **Symptom:** The checkout page is unstyled, and the scripts and the "back" link fail.
- **Root cause:** `checkout.html` is in `/pages`, so `css/main.css` resolves to `pages/css/main.css`, which does not exist.
- **Fix:** Every CSS, JS and link path on that page now starts with `../` (for example `../css/main.css`, `../js/checkout.js`, `../index.html`). The load order is `../js/menuData.js` then `../js/checkout.js`.
- **Verified:** Zero 404 requests on both pages. Navigating between the two pages works in both directions.

### Step 5 — CSS `url(...)` resolved from the wrong folder
- **Symptom:** The background image is missing even when the CSS file loads.
- **Root cause:** A path inside a CSS file is relative to **the CSS file**, not to the HTML page. `url("images/pattern.svg")` inside `css/theme.css` looks in `css/images/`.
- **Fix:** `background-image: url("../images/pattern.svg");` in `css/theme.css`.
- **Verified:** The computed style on both `index.html` and `checkout.html` resolves to the real file.

### Step 6 — Broken icons on menu cards
- **Symptom:** Broken-image placeholders on the cards.
- **Root cause:** The image paths in the menu data did not point to existing files.
- **Fix:** Created one SVG per item in `images/` (`masala-chai.svg`, `filter-coffee.svg`, `cold-coffee.svg`, `lemon-iced-tea.svg`, `mango-lassi.svg`, `samosa.svg`, `veg-sandwich.svg`, `maggi.svg`, `vada-pav.svg`, `brownie.svg`). Each `image` field in `js/menuData.js` is relative to `index.html`, for example `images/samosa.svg`.
- **Verified:** All 10 `<img>` elements report `complete` and `naturalWidth > 0`.

---

## Phase 2 — JavaScript logic bugs

### Step 7 — "Add to Cart" buttons not working
- **Symptom:** Clicking "Add to Cart" does nothing, especially after filtering or searching.
- **Root cause:** Click handlers attached directly to buttons are lost when the menu is re-rendered with `innerHTML`.
- **Fix:** One delegated listener on `#menu-grid` uses `e.target.closest(".add-btn")`, so it works for every card however many times the grid is redrawn.
- **Verified:** Adding Choco Brownie while filtered to Snacks, then Mango Lassi while filtered to Drinks, gives 80 + 70 = 150.

### Step 8 — Totals concatenating instead of adding
- **Symptom:** Two items at ₹20 show a subtotal of `2020` instead of `40`.
- **Root cause:** Prices or quantities were strings, and `"20" + "20"` is `"2020"` in JavaScript.
- **Fix:**
  - Prices in `menuData.js` are stored as numbers.
  - `cartSubtotal()` uses `price * qty` inside `reduce()`.
  - `loadCart()` converts everything read from `localStorage` with `Number()` and drops invalid rows, so corrupt saved data cannot bring the bug back.
- **Verified:** Chai × 2 gives subtotal `40`. After `+` it is `60`.

### Step 9 — Saved cart not appearing on the checkout page
- **Symptom:** The checkout page shows an empty order.
- **Root cause:** The two pages did not read and write the cart with the same storage key and format.
- **Fix:** Both pages use the shared constant `CART_KEY = "campusCafeCart"` and the same `loadCart()` and `saveCart()` helpers from `menuData.js`.
- **Verified:** The 2-item cart from `index.html` is listed on `checkout.html`.

### Step 10 — Grand Total not displaying
- **Symptom:** The Grand Total is blank or `0` on the checkout page.
- **Root cause:** The total was never calculated or written to the page.
- **Fix:** `render()` in `js/checkout.js` computes `subtotal − discount` and writes it to `#grand-total`. The result is rounded to 2 decimals with `Math.round(n * 100) / 100`.
- **Verified:** Subtotal 150 shows a Grand Total of 150.

---

## Phase 3 — Missing features added

### Step 11 — Menu filtering and live search (`js/app.js`)
- **Added:** `All / Drinks / Snacks` buttons toggle the `active` class and re-render. The search box filters by name, case-insensitively, on every keystroke. Both filters are combined in one `filter()` call, and an empty-state message shows when nothing matches.
- **Verified:** Drinks gives 5 and Snacks gives 5. Searching "COFFEE" gives 2. Searching "COFFEE" while Snacks is active gives 0 and shows the empty message.

### Step 12 — Quantity controls and cart badge
- **Added:** Re-adding an item increments `qty` instead of creating a second row. `+` and `−` buttons change the quantity, and the row is removed when it reaches 0. The header badge shows the **total quantity** (the sum of `qty`), not the number of rows.
- **Verified:** Two Chai clicks give one row and a badge of 2. Three `−` clicks remove the row and the badge returns to 0.

### Step 13 — Empty-cart guard
- **Added:** "Proceed to Checkout" checks `cart.length`. If it is 0, it shows a message in `#cart-msg` and stays on the page. The message clears when an item is added.
- **Verified:** The URL stays on `index.html` and the message is displayed.

### Step 14 — Student promo code (`js/checkout.js`)
- **Rules implemented:** `STUDENT15` gives 15% off the subtotal, only when the subtotal is ₹150 or more. The code is trimmed and case-insensitive.
- **Errors:** An empty code, an invalid code, or a subtotal under ₹150 each show a clear message **and reset the discount to 0**. The discount is reset before every check, so a failed code can never keep an earlier discount.
- **Verified:**

  | Case | Result |
  |------|--------|
  | `WRONG` at ₹150 | "Invalid promo code", total stays 150 |
  | ` student15 ` at ₹150 | Discount 22.50, Grand Total 127.50 |
  | Invalid code after a valid one | Discount back to 0, total 150 |
  | `STUDENT15` at ₹25 | Error mentioning ₹150, total stays 25 |

### Step 15 — Order confirmation validation
- **Added:** The form blocks submission when the Full Name or Roll Number is blank (after trimming), or when the cart is empty. On success it generates an Order ID such as `CC-261125-4821`, shows a confirmation with the final total, and calls `clearCart()`.
- **Verified:** A blank form is blocked. A missing roll number is blocked. A valid submission shows the confirmation, and `localStorage` no longer contains the cart. Opening checkout with an empty cart and filling the form is also blocked.

---

## Phase 4 — Final verification

Verified by serving `CampusCafeFixed/` over a local HTTP server (`http://127.0.0.1:8000`) and running an automated headless Chrome DevTools test suite (**12/12 end-to-end check groups passing**):

- all 10 menu SVGs (`complete && naturalWidth > 0`) and CSS `pattern.svg` background load with zero 404s and zero console/runtime errors across both pages
- filtering (`All` / `Drinks` / `Snacks`), active button state, case-insensitive search, and combined filter + search empty state
- adding items, merging duplicate items (`Masala Chai` ×2 → 1 row, qty 2, subtotal ₹40, badge 2), `+` / `−` buttons, and row removal at 0
- empty-cart checkout blocking (`#cart-msg` displayed, stays on `index.html`)
- cart persistence into `pages/checkout.html` and Grand Total display (`₹150`)
- `STUDENT15` promo code: `127.50` on `₹150` cart, whitespace/case tolerance, error + discount reset to `0` on invalid/empty code or subtotal `< ₹150`
- form validation (blank name/roll or empty cart blocked), generated Order ID (`CC-YYMMDD-XXXX`), and `localStorage` cart clearing after order confirmation

---

## Summary table

| Step | File(s) | Category |
|------|---------|----------|
| 1 | `index.html`, `css/theme.css` | Misspelled / wrong stylesheet path |
| 2 | project structure | Inconsistent folders |
| 3 | `index.html` | Script load order |
| 4 | `pages/checkout.html` | Relative paths (`../`) |
| 5 | `css/theme.css` | CSS `url()` base path |
| 6 | `images/`, `js/menuData.js` | Broken icons |
| 7 | `js/app.js` | Add to Cart not working |
| 8 | `js/menuData.js`, `js/app.js` | String concatenation in totals |
| 9 | `js/menuData.js`, both pages | Cart not shared with checkout |
| 10 | `js/checkout.js` | Grand Total missing |
| 11–13 | `js/app.js` | Filtering, search, quantity, empty-cart check |
| 14–15 | `js/checkout.js` | Promo code, order confirmation |
