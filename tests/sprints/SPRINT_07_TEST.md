# APPROVED — OWNER APPROVED

## Sprint 07 — قائمة الاختبار الآلي وQA المالك

> **الحالة:** **APPROVED — OWNER APPROVED**
> **الإصدار:** `1.0-approved`
> **تاريخ اعتماد المالك:** 2026-11-07
> **الخطة:** [SPRINT_07_PLAN.md](../../docs/sprints/SPRINT_07_PLAN.md)
> **خط الأساس:** `5ac3339cc9b30fc05340e142c874f828f3218763`
> **تاريخ قرارات التخطيط المعتمدة:** 2026-11-07
> **سياسة الأمان:** Emulator وم mocks وdummy bytes فقط؛ يمنع Firebase الحي والوثائق التجارية الحقيقية.

## 0. سجل الإصدارات وإشعار الاعتماد

| الإصدار | التاريخ | الوصف |
|---|---|---|
| `0.1-draft` | 2026-11-07 | مسودة مصفوفة الاختبارات وQA المالك للمراجعة. |
| `1.0-approved` | 2026-11-07 | اعتماد المالك الكامل لمصفوفة الاختبار والfixtures وخطوات QA والاستبعادات. |

> **إشعار الاعتماد:** اعتمد المالك هذه القائمة بتاريخ 2026-11-07 فوق baseline commit `5ac3339cc9b30fc05340e142c874f828f3218763`. تضم 42 اختباراً آلياً و12 حالة QA يدوية للمالك، بإجمالي 54 حالة، وترتبط بخطة تضم 31 مهمة تنفيذ. اعتماد الوثيقة يجعل Sprint **READY FOR IMPLEMENTATION** فقط؛ ولا يجعله READY FOR QA أو CLOSED. لم يبدأ التنفيذ أو الاختبار، لذلك تبقى النتائج 0 PASS / 0 FAIL / 54 BLOCKED. يبقى النشر الإنتاجي وFirebase الحي والوثائق التجارية الحقيقية غير مصرح بها.

## 1. حقول النتيجة وقاعدة التنفيذ

كل حالة تسجل واحدة فقط: `PASS` أو `FAIL` أو `BLOCKED`. لا تعني كتابة الخطة أن الاختبار نُفذ. الأدلة المقبولة: command/exit code، response sanitized، assertion count، screenshot غير حساس، أو machine-readable artifact داخل مسار ignored.

| النتيجة | معناها |
|---|---|
| PASS | نُفذ الاختبار كما هو ووافق المتوقع مع دليل |
| FAIL | نُفذ وخالف المتوقع؛ يستمر المستقل ويبقى Sprint OPEN |
| BLOCKED | لم يمكن تنفيذه مع سبب محدد؛ لا يحول إلى PASS |

## 2. المتطلبات السابقة وتهيئة PowerShell

قبل QA التنفيذي لاحقاً:

```powershell
Set-Location 'C:\Users\LCT\Desktop\تجربة\my-site'
git status --short
node --version
npm --version
java -version
```

المتوقع: شجرة تنفيذ مفهومة، Node 20، Java 21+ لاختبارات Emulator، ولا process سابق على المنافذ المحددة في setup المستقبلي. لا تطبع `.env.local`؛ يسمح بأسماء المتغيرات فقط.

الأمر الواحد المطلوب بعد تنفيذ runner في Sprint 07 سيكون:

```powershell
npm run qa:sprint07
```

هذا الأمر **PLANNED وليس موجوداً عند إنشاء هذه المسودة**. يجب أن يبني Frontend/Backend، يشغل Auth/Firestore/Hosting أو static server محلياً، يزرع dummy fixtures، ينفذ الاختبارات المطلوبة، ثم يوقف كل شيء. يجب أن يرفض project غير `demo-*` أو hosts غير loopback.

## 3. مصفوفة الأدوار

| الدور | `/admin` | summary/list/detail/document/decision | المتوقع | التتبع |
|---|---|---|---|---|
| signed-out | لا محتوى إداري | لا request business-data | login مع `returnTo=/admin` آمن | `AT-001`, `MQ-001`, `FR-ADM-001` |
| unverified | لا محتوى إداري | 403 لو استُدعي Backend | verify-email ورسالة عربية | `AT-002`, `MQ-001`, `SCN-ADM-001` |
| verified normal owner | forbidden | 403 admin-required | لا bytes/metadata ولا redirect loop | `AT-003`, `MQ-002`, `NFR-SEC-001` |
| admin verified | مسموح | مسموح وفق العقد | dashboard كامل | `AT-004`, `MQ-003`–`011`, `DEC-006` |

## 4. مصفوفة الاختبارات الآلية

### 4.1 Unit وFrontend state

| ID | الاختبار | المتوقع | التتبع | النتيجة | الدليل |
|---|---|---|---|---|---|
| `AT-001` | signed-out admin gate | لا flash؛ returnTo داخلي | `FR-ADM-001`, `SCN-AUTH-005` | BLOCKED | لم ينفذ بعد |
| `AT-002` | unverified admin gate | verify state؛ لا admin calls | `FR-ADM-001`, `SCN-ADM-001` | BLOCKED | لم ينفذ بعد |
| `AT-003` | verified non-admin | forbidden آمن بعد `/auth/me` | `FR-ADM-001`, `NFR-SEC-001` | BLOCKED | لم ينفذ بعد |
| `AT-004` | verified admin | يسمح بالshell فقط بعد claim موثوق | `FR-ADM-001`, `DEC-006` | BLOCKED | لم ينفذ بعد |
| `AT-005` | DTO parsers | ترفض malformed/extra bytes fields | `FR-ADM-002`–`004`, `NFR-PRV-001` | BLOCKED | لم ينفذ بعد |
| `AT-006` | summary/list independent state | فشل أحدهما لا يمحو الآخر | `FR-ADM-006`, `FR-OPS-001` | BLOCKED | لم ينفذ بعد |
| `AT-007` | filter/token reducer | filter reset token؛ token opaque | `FR-ADM-002`, `SCN-ADM-002` | BLOCKED | لم ينفذ بعد |
| `AT-008` | decision reducer | reject يتطلب reason؛ approve لا يرسله؛ double-submit ممنوع | `FR-ADM-004`, `SCN-ADM-004` | BLOCKED | لم ينفذ بعد |

### 4.2 Backend unit/integration/API contract

| ID | الاختبار | المتوقع | التتبع | النتيجة | الدليل |
|---|---|---|---|---|---|
| `AT-009` | summary invariants | non-negative؛ total=sum؛ version/date صالحان | `FR-ADM-006`, `NFR-REL-001` | BLOCKED | لم ينفذ بعد |
| `AT-010` | summary authorization | missing/invalid 401، unverified/non-admin 403، admin 200 | `FR-ADM-001`, `FR-ADM-006` | BLOCKED | لم ينفذ بعد |
| `AT-011` | summary contract | schema محدد بلا PII/bytes | `FR-ADM-006`, `NFR-PRV-001` | BLOCKED | لم ينفذ بعد |
| `AT-012` | summary unavailable | missing/corrupt/inconsistent aggregate يعطي safe 503 `admin/summary-unavailable` + correlationId ولا zero مضلل | `FR-ADM-006`, `FR-OPS-002` | BLOCKED | لم ينفذ بعد |
| `AT-013` | summary rate limit | 30 طلباً/60 ثانية ثم 429 envelope | `FR-ADM-006`, `NFR-OPS-001` | BLOCKED | لم ينفذ بعد |
| `AT-014` | list query contract | فقط status/limit/pageToken؛ limit 1–50/default20 | `FR-ADM-002`, `SCN-ADM-002` | BLOCKED | لم ينفذ بعد |
| `AT-015` | stable pagination | لا duplicate/skip في fixtures الثابتة؛ token invalid آمن | `FR-ADM-002`, `NFR-REL-001` | BLOCKED | لم ينفذ بعد |
| `AT-016` | list minimization | فقط ownerId/shop.name/shop.area/status/submittedAt/version؛ كل الحقول المحظورة غائبة | `FR-ADM-002`, `NFR-PRV-001` | BLOCKED | لم ينفذ بعد |
| `AT-017` | detail contract | metadata اللازمة فقط؛ لا bytes | `FR-ADM-003`, `SCN-ADM-003` | BLOCKED | لم ينفذ بعد |
| `AT-018` | document contract | image bytes صحيحة؛ attachment؛ private/no-store/nosniff | `FR-ADM-003`, `DEC-007`, `DEC-008` | BLOCKED | لم ينفذ بعد |
| `AT-019` | approve/reject | reject بلا reason مرفوض؛ approve UI لا ترسل reason؛ لا rejection reason محفوظ أو مكشوف للموافقة؛ Audit واحد | `FR-ADM-004`, `SCN-ADM-004` | BLOCKED | لم ينفذ بعد |
| `AT-020` | concurrency | wrong expectedVersion 409؛ لا قرار/Audit إضافي | `FR-ADM-004`, `NFR-REL-001` | BLOCKED | لم ينفذ بعد |
| `AT-021` | OpenAPI | summary موثق؛ list params الدقيقة؛ schemas/errors/rate limits | `FR-ADM-002`, `FR-ADM-006`, `NFR-MNT-001` | BLOCKED | لم ينفذ بعد |
| `AT-022` | correlation/redaction | ID في headers/envelope؛ لا token/PII/bytes/log leakage | `NFR-SEC-002`, `NFR-OPS-001` | BLOCKED | لم ينفذ بعد |

### 4.3 Emulator، Rules، integrated E2E

| ID | الاختبار | المتوقع | التتبع | النتيجة | الدليل |
|---|---|---|---|---|---|
| `AT-023` | deterministic fixtures | known counts لكل status وaggregate مطابق | `FR-ADM-006`, `NFR-MNT-003` | BLOCKED | لم ينفذ بعد |
| `AT-024` | atomic aggregate create | create يزيد total/pending في transaction نفسها | `FR-ADM-006`, `NFR-REL-001` | BLOCKED | لم ينفذ بعد |
| `AT-025` | atomic aggregate decision | pending-- وtarget++ مع application/Audit | `FR-ADM-004`, `FR-ADM-006` | BLOCKED | لم ينفذ بعد |
| `AT-026` | injected failures | لا partial app/summary/decision/audit | `NFR-REL-001`, `SCN-OPS-001` | BLOCKED | لم ينفذ بعد |
| `AT-027` | direct-client rules | كل roles مرفوضة للapplications/documents/audits/summary | `NFR-SEC-001`, `NFR-PRV-001` | BLOCKED | لم ينفذ بعد |
| `AT-028` | integrated admin flow | role→summary→list→detail→document→decision→refresh | `SCN-ADM-001`–`004` | BLOCKED | لم ينفذ بعد |

### 4.4 Playwright، accessibility، regression، build

| ID | الاختبار | المتوقع | التتبع | النتيجة | الدليل |
|---|---|---|---|---|---|
| `AT-029` | route/state UI | loading/empty/error/forbidden/conflict/rate/retry/refresh | `FR-OPS-001`, `FR-ADM-001`–`006` | BLOCKED | لم ينفذ بعد |
| `AT-030` | responsive/a11y | 320/375/768/1024/1280، RTL، keyboard/focus/no overflow | `NFR-ACC-001`–`003` | BLOCKED | لم ينفذ بعد |
| `AT-031` | regression | Sprint 01–06 + comparison/media/catalog-loading لا تتراجع | `NFR-MNT-003`, `SCN-OPS-001` | BLOCKED | لم ينفذ بعد |
| `AT-032` | build/isolation | lint/unit/backend/rules/build مع وبدون env؛ no live Firebase | `NFR-MNT-002`, `NFR-OPS-002` | BLOCKED | لم ينفذ بعد |
| `AT-033` | aggregate drift verifier | يعيد حساب counts ويبلغ match/drift بلا PII ولا mutation | `FR-ADM-006`, `NFR-OPS-001` | BLOCKED | لم ينفذ بعد |
| `AT-034` | Emulator-only repair guard | يصلح drift في demo/loopback فقط ويرفض live/non-loopback قبل أي mutation | `NFR-OPS-002`, `NFR-SEC-001` | BLOCKED | لم ينفذ بعد |
| `AT-035` | summary/list failure independence | فشل summary لا يمحو list ناجحة والعكس؛ retry مستقل | `FR-ADM-006`, `FR-OPS-001` | BLOCKED | لم ينفذ بعد |
| `AT-036` | Sprint 06 create atomicity regression | application/document/aggregate كلها تنجح أو لا شيء | `NFR-REL-001`, `SCN-OPS-001` | BLOCKED | لم ينفذ بعد |
| `AT-037` | Sprint 06 decision atomicity regression | application/Audit/aggregate كلها تنجح أو لا تغيير | `FR-ADM-004`, `NFR-REL-001` | BLOCKED | لم ينفذ بعد |
| `AT-038` | Blob cleanup on modal close | revoke URL وتفريغ Blob عند الإغلاق | `FR-ADM-003`, `NFR-PRV-001` | BLOCKED | لم ينفذ بعد |
| `AT-039` | Blob cleanup on owner/application change | revoke قبل عرض/طلب وثيقة أخرى | `FR-ADM-003`, `NFR-PRV-001` | BLOCKED | لم ينفذ بعد |
| `AT-040` | Blob cleanup on logout | revoke وتفريغ admin state فور logout | `FR-ADM-001`, `NFR-SEC-001` | BLOCKED | لم ينفذ بعد |
| `AT-041` | Blob cleanup on component unmount | cleanup يعمل عند navigation/unmount | `FR-ADM-003`, `NFR-MNT-003` | BLOCKED | لم ينفذ بعد |
| `AT-042` | Blob cleanup on 401/403 | revoke وتفريغ Blob ولا prefetch/cache/storage | `FR-ADM-001`, `NFR-PRV-001` | BLOCKED | لم ينفذ بعد |

**إجمالي automated cases المخططة:** 42.

## 5. إثباتات الخصوصية الإلزامية

### 5.1 JSON بلا document bytes

يجب على `AT-011`, `AT-016`, `AT-017`, و`AT-022` تحليل JSON فعلياً وبصورة recursive ورفض أي key/value يمثل `bytes`, Base64، Blob، buffer serialization، file body، token أو raw provider error. لا يكفي فحص UI text.

### 5.2 Document خاص وغير قابل للتخزين المؤقت

يجب على `AT-018` و`AT-038`–`AT-042` إثبات:

- admin فقط يحصل على 200؛ بقية الأدوار 401/403.
- `Content-Disposition: attachment` مع filename آمن.
- `Cache-Control` يحتوي `private` و`no-store` و`max-age=0`.
- `Pragma: no-cache` و`X-Content-Type-Options: nosniff`.
- `Content-Type` واحد من JPEG/PNG/WebP وbody يطابق dummy signature/size.
- لا public URL، ولا localStorage/IndexedDB/Cache API، ولا automatic prefetch.
- إلغاء Object URL وتفريغ Blob عند modal close، owner/application change، logout، unmount، و401/403 كلٌ باختبار صريح.

## 6. Fixtures الحتمية

تستخدم demo project وloopback فقط، بأسماء `TEST` ونطاقات `.example.test` دون كلمات مرور في الوثيقة. الحد الأدنى:

- signed-out browser.
- unverified user.
- verified normal owner بلا admin claim.
- verified admin يحمل `admin: true` من seed موثوق Emulator-only.
- 7 طلبات على الأقل موزعة حتمياً: 3 pending، 2 approved، 2 rejected؛ بعضها له document dummy JPEG/PNG/WebP.
- pending fixture بإصدار معروف للنجاح، وآخر لتعارض version، وحالة document missing/failure.
- aggregate متوقع: total 7، pending 3، approved 2، rejected 2، مع version/date حتميين حيث يسمح العقد، وfixture drift منفصلة.

reset/reseed يجب أن يكون idempotent محلياً، وألا يقبل project حقيقياً أو hosts غير loopback. verifier read-only في كل البيئات المحلية؛ repair تلقائي demo/loopback فقط ولا يوجد repair live/production في Sprint 07. لا تُستخدم أرقام أو وثائق أو بريد شخصي حقيقي.

## 7. قائمة QA المالك

| ID | الخطوات المختصرة | المتوقع | viewports/role | التتبع | النتيجة | الدليل |
|---|---|---|---|---|---|---|
| `MQ-001` | افتح `/admin` signed-out ثم unverified | login/verify بلا flash أو loop | 375،1280 | `FR-ADM-001` | BLOCKED | لم ينفذ بعد |
| `MQ-002` | verified normal يفتح routes مباشرة | forbidden عربي ولا بيانات | 375،1280 | `SCN-ADM-001` | BLOCKED | لم ينفذ بعد |
| `MQ-003` | admin يفتح dashboard | summary/list يظهران مستقلين | 320،1280 | `FR-ADM-006` | BLOCKED | لم ينفذ بعد |
| `MQ-004` | بدّل status/limit وتنقل next pages ثم refresh | ترتيب ثابت ولا totals page-local | 375،1024 | `FR-ADM-002` | BLOCKED | لم ينفذ بعد |
| `MQ-005` | fixture فارغ وفشل list/summary مستقل | empty/error/retry واضح؛ نجاح أحدهما لا يمحى | 375،1280 | `FR-OPS-001` | BLOCKED | لم ينفذ بعد |
| `MQ-006` | افتح detail ثم راقب JSON | metadata فقط، لا bytes | 375،1280 | `FR-ADM-003` | BLOCKED | لم ينفذ بعد |
| `MQ-007` | افتح modal الوثيقة بفعل صريح ثم اختبر lifecycles | private no-store؛ لا prefetch/storage؛ cleanup لكل close/change/logout/unmount/401/403 | 768،1280 | `DEC-007`, `DEC-008` | BLOCKED | لم ينفذ بعد |
| `MQ-008` | approve pending ثم refresh | status/version/summary/list تتحدث | 375،1280 | `FR-ADM-004` | BLOCKED | لم ينفذ بعد |
| `MQ-009` | reject بلا/مع reason | الأول مرفوض inline؛ الثاني ينجح | 375،1280 | `SCN-ADM-004` | BLOCKED | لم ينفذ بعد |
| `MQ-010` | افتح نسختين وقرر من الأولى ثم الثانية | الثانية 409، refetch، لا قرار ثانٍ | 1280 | `FR-ADM-004` | BLOCKED | لم ينفذ بعد |
| `MQ-011` | اختبر 401/403/429/unavailable ثم retry | errors آمنة وcorrelation، لا state حساس | 375،1280 | `NFR-SEC-002`, `NFR-OPS-001` | BLOCKED | لم ينفذ بعد |
| `MQ-012` | keyboard-only وreduced motion وzoom/overflow | focus مرئي، لا trap/clip/scroll أفقي | 320،375،768،1024،1280 | `NFR-ACC-001`–`003` | BLOCKED | لم ينفذ بعد |

**إجمالي QA اليدوي المخطط:** 12.
**إجمالي الحالات المخططة:** 54 = 42 آلية + 12 يدوية.

## 8. أوامر الفحص المقترحة بعد التنفيذ

هذه الأوامر موجودة حالياً ما عدا ما وُسم `PLANNED`:

```powershell
npm run lint
npm test
npm --prefix backend run lint
npm --prefix backend test
npm --prefix backend run build
npm run test:rules
npm run build
npm run test:e2e
```

أوامر يجب إضافتها في Sprint 07، ولا يجوز ادعاء وجودها الآن:

```powershell
npm run test:sprint07:integrated   # PLANNED
npm run qa:sprint07                # PLANNED
```

يجب إجراء build مع `.env.local` ثم بدونه عبر نقل مؤقت آمن وإعادة الملف في `finally` دون قراءة قيمه. تحفظ الأدلة في مسارات ignored، وتتوقف كل المنافذ بعد QA.

## 9. فحص الإغلاق والنتائج

| المجموعة | PASS | FAIL | BLOCKED | الحالة الحالية |
|---|---:|---:|---:|---|
| Automated | 0 | 0 | 42 | APPROVED PLAN — لم يبدأ التنفيذ |
| Owner manual QA | 0 | 0 | 12 | APPROVED PLAN — لم يبدأ التنفيذ |
| الإجمالي | 0 | 0 | 54 | **READY FOR IMPLEMENTATION — NOT READY FOR QA / NOT CLOSED** |

لا يغلق Sprint عند مرور automation فقط. الإغلاق يتطلب: كل executable case بنتيجة صادقة، owner manual QA، تقرير Sprint 07 يطابق الأدلة، reconciliation للتتبع، ثم عبارة موافقة مالك صريحة وتاريخ. قبل ذلك يمنع استخدام `CLOSED`.

## 10. سجل قرارات المالك وبنود المراجعة

- [x] routes `/admin` و`/admin/application?id=<uid>`.
- [x] aggregate Backend-owned وقواعد الاتساق/verifier/Emulator-only repair مع rate limit 30/60.
- [x] list projection بالحقول الستة فقط.
- [x] modal الوثيقة بفعل صريح وBlob memory-only وتنظيف lifecycles الخمسة.
- [x] pagination: default 20، range 1–50، و`status/limit/pageToken` فقط.
- [x] اعتماد 12 حالة QA وviewports الخمسة.
- [x] تأكيد بقاء `needs_changes` وبقية Sprint 08–10 خارج النطاق.
- [x] تأكيد حظر الوثائق الحقيقية وFirebase الحي في QA.

