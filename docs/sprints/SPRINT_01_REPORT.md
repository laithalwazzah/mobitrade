# Sprint 01 — Catalog and Price Experience Report

Sprint status: **CLOSED — OWNER APPROVED**

Approval date: **2026-11-02**

Owner visual review: **APPROVED**

Implementation commit: **`fac011a555536fdf1ccfce5bcfa857130739a219`**

## Manual QA execution — 2026-11-02

| Result type | Total |
|---|---:|
| Numbered checklist tests passed | 10 |
| Numbered checklist tests failed | 0 |
| Numbered checklist tests blocked/not run | 0 |
| Automated non-live regression tests passed | 36 |
| Automated non-live regression tests failed | 0 |

The existing `out/` export was rebuilt once, served on port 4000, and reused for all desktop 1280×800 and mobile 375×812 manual interactions. The server was stopped afterward.

## Requirement coverage

| Requirement | Result | Implementation |
|---|---|---|
| Newest, product-name, and lowest-price sorting | PASS | Pure sorting pipeline in `lib/catalogView.ts`; newest is the reset/default order. |
| All / USD / SYP currency filter | PASS | Currency controls are combined with every other filter. |
| Price sorting only after choosing one currency | PASS | The price option is disabled for “الكل”; returning to all currencies resets price sorting to newest. |
| Combined search, brand, condition, currency, and sorting | PASS | One pure filter-and-sort pipeline applies all criteria. |
| “مسح الفلاتر” | PASS | Both the main reset and empty-state reset restore all five controls. |
| Last update date on every card | PASS | The displayed offer’s `updatedAt` is shown below its price. |
| Seven-day stale badge | PASS | Strict UTC date-only helpers use an injectable `Date`; the seven-day boundary is inclusive. |
| Remove products without matching offers | PASS | A product enters the view only when `displayedOffer` finds a condition/currency match. |
| Improved empty results | PASS | Styled explanation plus “مسح الفلاتر وعرض الكل”. |
| Correct unique shops and currency-safe lowest price | PASS | Shop counts use matching offers and a `Set`; displayed prices never combine currencies. |
| Preserve static export and existing features | PASS | Static build, UI, comparison, and media suites pass. Firebase schemas and rules were untouched. |

## Changed files

- `lib/catalogView.ts` — typed filtering, offer selection, sorting, unique shop counting, and UTC freshness helpers.
- `components/ProductList.tsx` — new controls, combined pipeline, update date, stale badge, resets, and empty state.
- `components/Header.tsx`
- `components/AddPriceForm.tsx`
- `components/ProductPageContent.tsx`
- `components/ShopPageContent.tsx`
- `components/ComparePageContent.tsx`
- `components/CompareProvider.tsx` — internal links disable production prefetching so a plain static server does not request invalid RSC paths.
- `package.json` — includes Sprint 01 unit tests in `npm test`.
- `tests/sprint01.test.ts` — freshness, invalid date, currency separation, sorting, filtering, and shop-count coverage.
- `tests/e2e/sprint01.spec.ts` — combined controls, reset, stale badge, empty state, and responsive coverage.
- `tests/e2e/ui.spec.ts` — updated selectors/expected empty state and excludes intentionally generated console failures from unrelated assertions.
- `tests/e2e/media.spec.ts` — tolerates sub-pixel layout rounding while still detecting layout movement.
- `tests/sprints/SPRINT_01_TEST.md` — authoritative PowerShell/manual QA checklist.
- `docs/sprints/SPRINT_01_REPORT.md` — this report.

## Exact final test results

| Test | Result | Evidence |
|---|---|---|
| `npm run lint` | PASS | ESLint exited successfully with no errors. |
| `npm test` | PASS | 24 passed, 0 failed. |
| `npm run build` | PASS | Next.js 16.4.3 compiled, type-checked, and generated 8/8 static pages. Routes `/`, `/add`, `/compare`, `/product`, `/shop`, and `/_not-found` are static. |
| `tests/e2e/sprint01.spec.ts` | PASS | 8 passed: 4 mobile and 4 desktop. |
| `tests/e2e/ui.spec.ts` | PASS | 12 passed: 6 mobile and 6 desktop. |
| `tests/e2e/compare.spec.ts` + `tests/e2e/media.spec.ts` | PASS | 16 passed: 8 mobile and 8 desktop. |
| Requested non-live E2E total | PASS | 36 passed, 0 failed in the final individual suite runs. |
| Numbered manual checklist | PASS | 10 passed, 0 failed, 0 blocked/not run; desktop and mobile UI inspected with screenshots. |
| `npx playwright test tests/e2e/sprint01.spec.ts` | PASS | Exact checklist command: 8 passed, 0 failed. |
| Full checklist regression command | PASS | Exact command: 36 passed, 0 failed across mobile and desktop. |

The initial validation run exposed and then verified fixes for: product-name sorting using brand first, invalid static-export prefetch requests, ambiguous Playwright reset selectors, unsupported option-state assertions, and a sub-pixel media-height assertion.

## NOT RUN

- Real Firestore write tests — prohibited for this sprint.
- `tests/e2e/live.spec.ts` and `tests/firestore-rest.test.ts` — intentionally excluded because they can access or write real Firestore data.
- Firestore emulator suite — unrelated to this change and no rules/schema changed.
- Form submission/failure-path suites — not part of the requested catalog UI regression set and may exercise submission flows.
- Deployment, authentication changes, pushes, and Next.js feedback — not run. Local commits were created only during this owner-approved closure.
- Release-level physical-phone test — deferred to **Sprint 09**. Automated 375×812 mobile QA passed, so this is not a Sprint 01 blocker.

## Risks

- The static base catalog currently contains only USD offers. SYP correctly shows an empty state until merged live data includes SYP offers.
- Invalid offer dates are deliberately not marked stale and sort after valid dates. The raw invalid string is still displayed so bad source data remains visible for correction.
- Internal Next.js link prefetching is disabled because Next.js 16.4.3 generated prefetch URLs that a plain `serve out` host returned as 404. Navigation remains functional, but does not receive speculative prefetching.

## QA commands executed

```powershell
npm run lint
npm test
npm run build
npx serve out -l 4000
npx playwright test tests/e2e/sprint01.spec.ts
npx playwright test tests/e2e/ui.spec.ts tests/e2e/compare.spec.ts tests/e2e/media.spec.ts tests/e2e/sprint01.spec.ts
```

## Failures and blockers

- Final checklist failures: none.
- Final blockers: none.
- One first-pass stale-badge probe sampled before client hydration. The same test was rerun with an explicit visible-state wait and passed at both the seven-day and six-day boundaries; no implementation change was made.

## Closure decisions

1. Owner visual review was approved on 2026-11-02.
2. The physical-phone touch/network test is deferred to Sprint 09 and is not a Sprint 01 blocker.
3. Empty SYP results are expected because the static catalog currently has USD offers only; live SYP offers remain supported through the existing merge.
4. Temporary screenshots remain ignored under `test-artifacts/` and are not part of either commit.
5. There are no open Sprint 01 blockers or remaining Sprint 01 review items.

Final sprint status: **CLOSED — OWNER APPROVED**
