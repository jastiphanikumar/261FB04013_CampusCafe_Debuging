# CampusCafe — Student Order Portal

A 2-page web app (HTML + CSS + vanilla JavaScript, no build step, no dependencies) where students browse a cafe menu, build a cart, apply a student promo code and confirm an order.

## Project structure

```
CampusCafeFixed/
├── index.html            # Menu page (filter, search, cart)
├── README.md
├── BUG_REPORT.md         # Step-by-step bug fix report
├── pages/
│   └── checkout.html     # Checkout page (promo code, order confirmation)
├── css/
│   ├── main.css          # Layout & components
│   └── theme.css         # Colours & decoration (uses url(../images/pattern.svg))
├── js/
│   ├── menuData.js       # Menu data + shared cart/storage helpers (load FIRST)
│   ├── app.js            # Logic for index.html
│   └── checkout.js       # Logic for pages/checkout.html
└── images/               # 10 menu-item SVGs + pattern.svg background
```

## How to run

**Option A – VS Code (recommended)**
1. Open the `CampusCafeFixed` folder in VS Code (`File > Open Folder…`).
2. Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.

**Option B – Local HTTP server (or double-click `index.html`)**
Run `python -m http.server 8000` (or `py -m http.server 8000` on Windows) inside `CampusCafeFixed` and open `http://localhost:8000` in your browser. Opening `index.html` directly via `file://` also works in Chrome/Edge.

## Part 1 — Bugs found & fixed

> A detailed step-by-step account (symptom, cause, fix, verification for each bug) is in **[BUG_REPORT.md](BUG_REPORT.md)**.

| # | Bug | Fix |
|---|-----|-----|
| 1 | `index.html` linked `styles/them.css` (wrong folder **and** typo) | Now `css/theme.css` |
| 2 | Stylesheet/script folders were inconsistent (`css/`, `styles/`, `scripts/`, `js/`) | Standardised to `css/`, `js/`, `images/`, `pages/` |
| 3 | `app.js` was loaded **before** `menuData.js`, so the menu data didn't exist yet when the script ran | Load order is now `menuData.js` → `app.js` |
| 4 | `pages/checkout.html` used root-relative paths that break from inside `/pages` | All its CSS, JS and links use `../` |
| 5 | CSS `url(...)` resolved relative to the wrong folder | `css/theme.css` uses `url("../images/pattern.svg")` (paths in CSS are relative to the CSS file) |
| 6 | Broken icons on menu cards | Every item has a matching SVG in `images/`; paths in `menuData.js` point to them |
| 7 | "Add to Cart" buttons did nothing (they were attached to cards before/after they existed) | Event delegation on `#menu-grid`, so buttons keep working after every re-render |
| 8 | Totals concatenated (`"20"+"20" = "2020"`) | Prices/quantities are real numbers; `loadCart()` also coerces stored values with `Number()` |
| 9 | Saved cart did not show on checkout | Both pages share one storage key (`campusCafeCart`) and the same `loadCart()` helper |
| 10 | Grand Total never displayed | `checkout.js` computes and renders it (subtotal − discount) |

## Part 2 — Features added

- **Filtering & search** — `All / Drinks / Snacks` buttons with active highlight; live, case-insensitive name search combined with the active category; "No items match" empty state.
- **Cart quantities** — adding the same item increments its quantity (no duplicate rows); `+` / `−` buttons (item removed at 0); header badge shows **total quantity**.
- **Empty-cart guard** — "Proceed to Checkout" shows a message and stays on the page if the cart is empty.
- **Promo code** — `STUDENT15` = 15% off the subtotal, only if subtotal ≥ ₹150. Code is trimmed and case-insensitive. Invalid code, empty code, or subtotal < ₹150 → clear error message and discount reset to `0`.
- **Order confirmation** — requires Full Name **and** Roll Number and a non-empty cart; on success shows a generated Order ID (e.g. `CC-261125-4821`), the final total, and clears the saved cart.
- **Extras** — HTML-escaping of rendered text, `try/catch` around `localStorage`, responsive layout.

## Testing performed

Served over a local HTTP server (`http://127.0.0.1:8000`) and verified with an automated headless Chrome DevTools test suite (**12/12 end-to-end check groups passing**):
- Zero 404s and zero console/runtime errors across `index.html` and `pages/checkout.html`
- All 10 menu SVGs (`complete && naturalWidth > 0`) and CSS `pattern.svg` background load properly
- Category filtering (`All` / `Drinks` / `Snacks`), active button highlight, case-insensitive search, and combined filter + search empty state
- `Masala Chai` added twice → 1 row, qty `2`, subtotal `40`, badge `2`; `+`/`−` controls update totals and remove the row at `0`
- Empty-cart checkout blocked with message in `#cart-msg`
- Cart persistence into `pages/checkout.html` and Grand Total display
- `STUDENT15` on `₹150` cart → `22.50` discount and `127.50` Grand Total; invalid/empty code or subtotal `< ₹150` shows an error and resets discount to `0`
- Blank Full Name, blank Roll Number, or empty cart blocked on order confirmation; valid submission displays `CC-YYMMDD-XXXX` Order ID and clears `localStorage`

## Reflection question

**Why couldn't pasting a single file into a standard chat window solve all of these bugs, while workspace-aware tools like GitHub Copilot or Antigravity can?**

The bugs are *relationships between files*, not mistakes inside one file. `index.html` references `css/main.css`, a mistyped `styles/them.css`, and two scripts whose load order matters; the real cause lives in `menuData.js`, `app.js`, `checkout.js`, `theme.css` and the image folder. A chat window that only sees `index.html` can't see whether those files exist, what is inside them, where the images are, what `checkout.html` loads, or how the cart is stored — so it can only guess. Fixing a path correctly also requires knowing the folder tree (and that `url()` in CSS is relative to the CSS file, while `<script src>` is relative to the HTML page). Workspace-aware tools index the whole project, follow references across files, edit several files consistently, and can run the app to verify the fix. A single pasted file gives none of that context, so fixes made without it are partial or incorrect.
