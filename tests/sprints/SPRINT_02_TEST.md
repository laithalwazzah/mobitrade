# Sprint 02 — Visual Quality, Accessibility, SEO, and Performance Manual QA

Sprint status: **CLOSED — OWNER APPROVED WITH ACCEPTED DEFERRED TEST**

Owner visual approval: **APPROVED on 2026-11-02**

This is the authoritative Windows PowerShell checklist. Run it from the repository root. Do not submit the `/add` form and do not run real Firestore tests.

## Prerequisites

- Node.js 20 and the existing dependencies are available.
- Port 4000 is free; leave port 3000 and any owner development server alone.
- Use the current static export in `out/`, rebuilt by the commands below.
- Browser zoom is 100%.

```powershell
npm run lint
npm test
npm run build
npx serve out -l 4000
```

Open `http://127.0.0.1:4000`. Reuse this server for every numbered test. Press `Ctrl+C` when finished.

Preparation status: **PASS (manual-QA execution on 2026-11-02)**

Evidence: `npm run lint` passed; `npm test` passed 24/24; `npm run build` generated 9/9 static routes. One `npx serve out -l 4000` process was reused for all ten checks. Browser zoom was 100% through Playwright’s default scale. Firebase requests were blocked and no form was submitted.

## Numbered tests

### 1. RTL 404 page and recovery

Status: **PASS**

1. Open `/a-route-that-does-not-exist`.
2. Confirm the response is the styled dark RTL 404 page, not a generic server page.
3. Confirm its heading and explanation are readable and the “العودة إلى الرئيسية” action returns to `/`.
4. Confirm the browser inspector shows a `noindex` robots meta value.

Expected: a professional Arabic 404, clear recovery action, and no indexing of the missing page.

Evidence: `/a-route-that-does-not-exist` returned HTTP 404 with `dir="rtl"`, the branded dark Arabic view, readable heading/explanation, and a single `noindex` robots value. The “العودة إلى الرئيسية” action navigated to `/`. Screenshot: `test-artifacts/sprint02-manual-qa-2026-11-02/01-404-desktop.png`.

### 2. Required responsive widths

Status: **PASS**

At each width `320`, `375`, `768`, `1024`, and `1280` pixels, review `/`, `/add`, `/product?id=p2`, `/shop?id=shop3`, and `/compare`.

Expected: header/footer, filters, cards, heroes, form, details, table/tray, and text remain readable; the page itself never scrolls horizontally. The comparison table may scroll inside its labelled table region.

Evidence: All 25 route/width combinations passed at 320, 375, 768, 1024, and 1280px, plus the expanded tray at every width. `documentElement.scrollWidth <= clientWidth` throughout; the comparison table stayed inside its labelled scroll region. Thirty screenshots use the `02-<width>-<state>.png` naming pattern in the Sprint 02 artifact folder.

### 3. Long Arabic and English content

Status: **PASS**

1. At 320px, type long Arabic/English text into the shop name, area, and address fields without submitting.
2. Search with a long mixed-language query on `/`.
3. Inspect product/shop headings and offer notes.

Expected: content wraps or stays within its control; nothing is clipped and the viewport does not widen.

Evidence: At 320px, long mixed Arabic/English shop name, area, and address values stayed within their controls; the long home search produced the expected empty state without widening the page; product/shop headings and offer content remained contained. Screenshots: `03-320-add-long-content.png`, `03-320-home-long-search.png`, `03-320-product-content.png`, and `03-320-shop-content.png`.

### 4. Skip link, landmarks, and headings

Status: **PASS**

1. Reload `/` and press `Tab` once.
2. Confirm “تخطَّ إلى المحتوى الرئيسي” becomes visible.
3. Press `Enter`; confirm focus/navigation moves to `#main-content`.
4. Inspect that the page has header/navigation, one main landmark, footer, and a logical heading hierarchy.

Expected: keyboard users can bypass repeated navigation and understand the page structure.

Evidence: The first `Tab` focused and revealed the skip link with a visible solid 3px outline. `Enter` reached `#main-content`. The page had one header, labelled main navigation, one main landmark, one footer, and heading levels `h1 → h2 → h2`. Screenshots: `04-skip-link-focused.png` and `04-main-content-landmarks.png`.

### 5. Keyboard, focus, tap targets, and no focus trap

Status: **PASS**

1. Use only `Tab`, `Shift+Tab`, `Enter`, `Space`, and arrow keys through the header, home filters, product card actions, comparison tray, add form, and comparison table.
2. Add one device to comparison, expand and close the tray, and continue tabbing beyond it.
3. Trigger empty form errors without submitting valid data.

Expected: every interactive item has an obvious focus indicator; controls work from the keyboard; tap controls are comfortably sized; focus can leave the tray; errors are associated with fields and the submission error area is announced.

Evidence: Keyboard-only input selected the used filter, added a product, opened the tray, and tabbed out of it. Checked header/filter/tray targets were at least 44px high. Empty submission produced at least five `aria-invalid` controls, each with valid `aria-describedby` targets; the source retains `role="alert"` for submission failures. The comparison region accepted keyboard focus. Screenshots: the four `05-*.png` files.

### 6. Reduced motion

Status: **PASS**

Enable the operating system/browser “Reduce motion” preference, reload `/`, and interact with filters and the comparison tray.

Expected: decorative entrance animation is disabled and transitions are effectively removed without hiding content or breaking interaction.

Evidence: With `prefers-reduced-motion: reduce`, decorative elements computed `animation-name: none` and transitions computed `0.01ms`; condition filtering and the comparison tray remained usable. Screenshots: `06-reduced-motion-filter.png` and `06-reduced-motion-tray.png`.

### 7. Images and layout stability

Status: **PASS**

1. Throttle/reload `/`, `/product?id=p2`, and `/compare` with two saved devices.
2. Observe card/detail/comparison image boxes while images load.
3. Inspect the device image proportions.

Expected: stable reserved image dimensions, no visible jump, and `object-fit: contain` prevents distortion.

Evidence: A device asset delayed by 600ms kept identical media bounds before/after loading. Home/detail/comparison images loaded with non-empty Arabic alt text and `object-fit: contain`; an intentionally unavailable image displayed the polished fallback without overflow. Screenshots: the four `07-*.png` files.

### 8. Metadata and robots

Status: **PASS**

Review page titles/descriptions for `/`, `/add`, `/product?id=p2`, `/shop?id=shop3`, and `/compare`; inspect Open Graph title/description/site name/locale/type; open `/robots.txt`.

Expected: relevant Arabic metadata, `robots.txt` allows crawling, no invented domain, and no canonical or sitemap until a site URL is configured.

Evidence: All five routes had their expected Arabic title and non-empty description plus Open Graph title, description, site name `سعّرلي`, locale `ar_SY`, and type `website`. No canonical or `og:url` was present. `/robots.txt` returned 200 and allowed `/`; `/sitemap.xml` returned 404 as expected without a configured site URL. Screenshot: `08-robots-txt.png`.

### 9. Invalid IDs and internal links

Status: **PASS**

1. Open `/product?id=not-real` and `/shop?id=not-real`.
2. Confirm each shows a friendly not-found state with a home link after live loading finishes.
3. Inspect/click internal product and shop links across home, product, shop, compare, and success-related UI without submitting.

Expected: all product/shop links use `/product?id=...` or `/shop?id=...`; no legacy `/product/<id>` or `/shop/<id>` link exists; valid links do not lead to 404.

Evidence: Invalid product/shop IDs showed their friendly states and home links. Five unique browser-visible internal links resolved below HTTP 400. Every product/shop href used `?id=`; source inspection found the same query form in the success-screen link and no legacy path link. Representative home → product → shop keyboard/click navigation reached `p2` and `shop3`. Screenshots: the three `09-*.png` files.

### 10. Sprint 01 and feature regression

Status: **OWNER-ACCEPTED DEFERRED**

1. Repeat the Sprint 01 search + brand + condition + currency + sorting combination and reset it.
2. Verify stale badge and empty state behavior.
3. Add/remove/replace/clear comparison devices and open `/compare`.
4. Check local device images, brand logos, and custom-product fallback.
5. Inspect `/add` without submitting.

Expected: catalog behavior, currency separation, comparison, media, routes, and form behavior remain unchanged.

Evidence: Executable steps passed: combined search/brand/condition/USD/price sorting, reset, stale badges, empty state, add/remove/clear/open comparison, local device images, brand logos, and `/add` inspection. Six `10-*.png` screenshots record these states. The UI **replace** action and a true **custom live-product fallback** could not be executed because the static catalog contains exactly two products and producing a third requires the prohibited real Firebase/submission path. The owner explicitly accepted the 24 passing unit tests for pure replacement/unknown-product behavior and the passing browser unavailable-image fallback from test 7 as sufficient Sprint 02 evidence. The real custom-live-product branch is deferred to **Sprint 07**, with final release verification in **Sprint 09**. This result remains deferred and is not converted to PASS.

## Completion record

| Result | Total |
|---|---:|
| PASS | 9 |
| FAIL | 0 |
| OWNER-ACCEPTED DEFERRED | 1 |

Manual QA owner/reviewer: Automated browser QA by Codex; visual results approved by the owner.

Date: 2026-11-02

Final status: **CLOSED — OWNER APPROVED WITH ACCEPTED DEFERRED TEST**. Truthful totals remain 9 PASS, 0 FAIL, and 1 OWNER-ACCEPTED DEFERRED. The custom-live-product branch moves to Sprint 07 and receives final release verification in Sprint 09.
