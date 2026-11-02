# Sprint 01 — Catalog and Price Experience Manual QA

Final sprint status: **CLOSED — OWNER APPROVED**

Owner visual approval: **APPROVED on 2026-11-02**

This is the authoritative Windows PowerShell checklist. Do not use real shop submissions or run Firestore write tests.

## Prerequisites

- Node.js 20 and the existing project dependencies are available.
- Run commands from the repository root.
- Port 4000 is free. Do not stop or reuse a development server on port 3000.
- `.env.local` may remain present; the checklist blocks no data manually, but it does not submit forms or write to Firebase.
- Build the current static export before serving it.

```powershell
npm run lint
npm test
npm run build
npx serve out -l 4000
```

Open `http://127.0.0.1:4000` in a browser. When finished, press `Ctrl+C` in the PowerShell window running `serve`.

Execution result (2026-11-02): **PASS**

- Node.js: `v20.20.0`
- `npm run lint`: PASS
- `npm test`: PASS — 24 passed, 0 failed
- `npm run build`: PASS — 8/8 static pages generated
- `npx serve out -l 4000`: PASS — one server reused for all numbered manual checks

## Numbered tests

### 1. Default catalog and newest sorting

Status: **PASS**

1. Open `/` at desktop width.
2. Confirm both saved products appear.
3. Confirm “الأحدث أولاً” is selected.
4. Confirm every card shows “آخر تحديث” and a date.
5. Confirm the page remains RTL and no content is clipped horizontally.

Expected: products are ordered by the displayed offer’s newest valid date first; invalid dates, if present in future data, appear last.

Evidence: Desktop 1280×800 showed exactly two cards in order `p2,p3`, sorting value `newest`, two visible update-date labels, `dir="rtl"`, and no horizontal overflow. Screenshot: `test-artifacts/sprint01-manual-01-desktop-default.png`.

### 2. Product-name sorting

Status: **PASS**

1. Choose “اسم المنتج” from “ترتيب المنتجات”.
2. Review the visible card order.

Expected: cards are ordered consistently by product name, storage, and brand.

Evidence: Selecting “اسم المنتج” produced `p2,p3`: Galaxy A32 followed by iPhone 11.

### 3. Currency filter and price sorting guard

Status: **PASS**

1. With currency “الكل”, open the sorting list.
2. Confirm “السعر الأقل” is disabled and the explanatory hint is visible.
3. Select USD.
4. Confirm “السعر الأقل” becomes available, then select it.
5. Select SYP.

Expected: price sorting is available only for USD or SYP. USD and SYP are never compared. Products without an offer in the chosen currency disappear.

Evidence: With all currencies, the price option had the disabled attribute and the explanatory hint was visible. USD enabled price sorting and ordered `p2,p3`; SYP showed zero matching static products and the empty state.

Owner decision: Empty SYP results are expected because the current static catalog contains USD offers only. Live SYP offers will appear through the existing catalog merge.

### 4. Combined filters

Status: **PASS**

1. Search for `Galaxy`.
2. Select brand `Samsung`.
3. Select condition `جديد`.
4. Select currency `USD`.
5. Select sorting `السعر الأقل`.

Expected: only the matching Galaxy A32 card appears, showing its matching USD/new price and matching unique-shop count.

Evidence: Galaxy + Samsung + جديد + USD + lowest price showed only `p2`, `$230`, and `1 محل`. Screenshot: `test-artifacts/sprint01-manual-04-desktop-combined.png`.

### 5. Condition-specific displayed offer

Status: **PASS**

1. Clear the search and set brand to “الكل”.
2. Select `مستعمل` with USD.
3. Switch to `جديد` while keeping USD.

Expected: used shows only products with matching used USD offers; new shows only matching new USD offers. Each card’s price, condition badge, date, and shop count belong to the selected filter combination.

Evidence: Used USD showed only `p3` with `$250`, used badge, `2026-10-28`, and one shop. New USD showed only `p2` with `$230`, `2026-10-28`, and one shop.

### 6. Empty state and reset action

Status: **PASS**

1. Enter a search that cannot match, such as `NO MATCH TEST`.
2. Confirm the empty-results panel is visible.
3. Click “مسح الفلاتر وعرض الكل”.

Expected: the query, brand, condition, currency, and sorting reset; all products return and sorting is “الأحدث أولاً”.

Evidence: `NO MATCH TEST` displayed the empty-results panel. Its reset action cleared all filters, selected newest sorting, and restored two cards. Screenshot: `test-artifacts/sprint01-manual-06-desktop-empty.png`.

### 7. Main reset button

Status: **PASS**

1. Set a search, brand, condition, USD currency, and price sorting.
2. Click “مسح الفلاتر”.

Expected: all five controls reset, all products return, and price sorting becomes disabled again.

Evidence: After setting query, Samsung, جديد, USD, and price sorting, the main reset cleared all five controls, restored two cards, selected newest, and disabled price sorting.

### 8. Stale-price boundary

Status: **PASS**

1. Temporarily test with an offer dated exactly seven UTC calendar days before the current date, or run the automated Sprint test below.
2. Compare with an offer dated six days before the current date.

```powershell
npx playwright test tests/e2e/sprint01.spec.ts
```

Expected: exactly seven days shows “سعر قديم”; six days does not. Invalid dates do not show the stale badge or crash the page.

Evidence: With browser time fixed to `2026-11-04T12:00:00Z`, offers dated `2026-10-28` showed “سعر قديم”; at `2026-11-03T12:00:00Z` they did not. The first immediate probe sampled before client hydration; the same test was rerun with an explicit visible-state wait and passed. The exact automated command passed 8/8; the prerequisite unit suite passed its invalid-date coverage.

### 9. Mobile layout

Status: **PASS**

1. Use a 375×812 viewport.
2. Repeat tests 3, 4, and 6.
3. Scroll through the filters and cards.

Expected: controls wrap cleanly, buttons remain usable, the comparison tray still works, and there is no page-level horizontal overflow.

Evidence: At 375×812, tests 3, 4, and 6 passed again; controls remained usable, the collapsed comparison tray appeared after adding one product, and the document had no horizontal overflow. Screenshot: `test-artifacts/sprint01-manual-09-mobile.png`.

Release-level physical-phone testing is deferred to **Sprint 09**. The deferred device/network check is not a Sprint 01 blocker; automated mobile viewport QA passed.

### 10. Regression smoke test

Status: **PASS**

1. Open one product page, one shop page, `/compare`, and `/add` without submitting.
2. Verify device images, logos, links, comparison controls, RTL, and prices.

Expected: existing routes and features behave as before; no Firebase write is made.

Evidence: `/product?id=p2`, `/shop?id=shop3`, `/compare`, and `/add` loaded without submission. Local device images/logos, internal links, `$230`/`$250` prices, two comparison remove controls, and RTL were verified. Screenshots: `test-artifacts/sprint01-manual-10-compare.png` and `test-artifacts/sprint01-manual-10-add.png`.

## Automated non-live regression command

```powershell
npx playwright test tests/e2e/ui.spec.ts tests/e2e/compare.spec.ts tests/e2e/media.spec.ts tests/e2e/sprint01.spec.ts
```

Automated non-live regression result: **PASS — 36 passed, 0 failed**

Overall manual result: **PASS — 10 passed, 0 failed, 0 blocked/not run**

Owner review result: **APPROVED on 2026-11-02**

Final sprint status: **CLOSED — OWNER APPROVED**
