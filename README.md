# CampusCafe — Student Order Portal

CampusCafe is a 2-page student cafe ordering app built with **HTML, CSS and vanilla JavaScript** (no build step, no dependencies). Students browse a menu of drinks and snacks, build a cart, apply a student promo code and confirm an order.

The project started as an AI-generated app with broken paths, missing icons and calculation bugs. It has been debugged and completed. Every fix is documented in [BUG_REPORT.md](BUG_REPORT.md).

## Features

- **Menu** with 10 items, each with its own SVG icon
- **Category filters** (All / Drinks / Snacks) with an active-button highlight
- **Live search** by name (case-insensitive), combined with the active category
- **Cart** with `+` / `−` controls, merged duplicate rows, and a header badge showing total quantity
- **Empty-cart check** that blocks checkout and shows a message
- **Promo code** `STUDENT15`: 15% off when the subtotal is ₹150 or more
- **Checkout** with Grand Total, Full Name and Roll Number validation, a generated Order ID, and cart clearing after the order

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

**Option A: VS Code (recommended)**
1. Open the `CampusCafeFixed` folder in VS Code (`File > Open Folder…`).
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

**Option B: Local HTTP server**
Run `python -m http.server 8000` (or `py -m http.server 8000` on Windows) inside the folder, then open `http://localhost:8000`.

**Option C: Open the file directly**
Double-click `index.html`. This works in Chrome and Edge. Some Firefox or Safari setups block `localStorage` on `file://` pages, so use Option A or B there.

## Quick try-out

1. Add **Masala Chai** twice. You get one row with quantity 2, subtotal ₹40 and badge 2.
2. Add **Choco Brownie** and **Mango Lassi** so the subtotal reaches ₹150, then click **Proceed to Checkout**.
3. Enter `STUDENT15` and click **Apply**. The Grand Total becomes ₹127.50.
4. Enter a Full Name and Roll Number, then click **Confirm Order** to see the Order ID.

## Bugs found and fixed

| # | Bug | Fix |
|---|-----|-----|
| 1 | `index.html` linked `styles/them.css` (wrong folder and a typo) | Now `css/theme.css` |
| 2 | Stylesheet and script folders were inconsistent (`css/`, `styles/`, `scripts/`, `js/`) | Standardised to `css/`, `js/`, `images/`, `pages/` |
| 3 | `app.js` loaded before `menuData.js`, so the menu data did not exist yet | Load order is now `menuData.js` then `app.js` |
| 4 | `pages/checkout.html` used paths that break from inside `/pages` | All its CSS, JS and links use `../` |
| 5 | CSS `url(...)` resolved relative to the wrong folder | `theme.css` uses `url("../images/pattern.svg")` (CSS paths are relative to the CSS file) |
| 6 | Broken icons on menu cards | Every item has a matching SVG in `images/`, and `menuData.js` points to them |
| 7 | "Add to Cart" did nothing after the grid was re-rendered | Event delegation on `#menu-grid` |
| 8 | Totals concatenated (`"20" + "20"` = `"2020"`) | Prices and quantities are numbers, and `loadCart()` coerces stored values with `Number()` |
| 9 | Saved cart did not show on checkout | Both pages share one storage key (`campusCafeCart`) and the same `loadCart()` helper |
| 10 | Grand Total never displayed | `checkout.js` computes and renders subtotal minus discount |

See [BUG_REPORT.md](BUG_REPORT.md) for the symptom, root cause, fix and verification of each one.

## Testing

The app was served over a local HTTP server (`http://127.0.0.1:8000`) and checked with an automated headless Chrome test suite (**12 of 12 end-to-end check groups passing**):

- Zero 404s and zero console or runtime errors on `index.html` and `pages/checkout.html`
- All 10 menu SVGs and the CSS `pattern.svg` background load correctly
- Category filtering, active-button highlight, case-insensitive search, and the combined filter-plus-search empty state
- Masala Chai added twice gives 1 row, quantity 2, subtotal 40, badge 2. The `+` / `−` controls update totals and remove the row at 0
- Empty-cart checkout is blocked with a message in `#cart-msg`
- Cart persistence into checkout and Grand Total display
- `STUDENT15` on a ₹150 cart gives a 22.50 discount and a 127.50 Grand Total. An invalid or empty code, or a subtotal under ₹150, shows an error and resets the discount to 0
- A blank Full Name, blank Roll Number or empty cart is blocked on confirmation. A valid order shows a `CC-YYMMDD-XXXX` Order ID and clears the saved cart

## Reflection question

**Why couldn't pasting a single file into a standard chat window solve all of these bugs, while workspace-aware tools like GitHub Copilot or Antigravity can?**

The bugs are *relationships between files*, not mistakes inside one file. `index.html` references `css/main.css`, a mistyped `styles/them.css`, and two scripts whose load order matters. The real causes live in `menuData.js`, `app.js`, `checkout.js`, `theme.css` and the image folder. A chat window that only sees `index.html` cannot tell whether those files exist, what is inside them, where the images are, what `checkout.html` loads, or how the cart is stored, so it can only guess.

Fixing a path correctly also needs the folder tree, and the knowledge that `url()` in CSS is relative to the CSS file while `<script src>` is relative to the HTML page. Workspace-aware tools index the whole project, follow references across files, edit several files consistently, and can run the app to verify the fix. A single pasted file gives none of that context, so the fixes are partial or incorrect.

## Tech stack

HTML5, CSS3, vanilla JavaScript (ES6), `localStorage` for the cart. No frameworks, no build tools.
