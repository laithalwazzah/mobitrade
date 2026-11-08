# APPROVED — OWNER APPROVED

## Sprint 07 — خطة لوحة الأدمن ومراجعة طلبات المحلات

> **اتجاه العرض المستهدف:** `RTL`
> **نوع الوثيقة:** خط أساس تخطيط فقط؛ لا تفوض التنفيذ أو النشر
> **خط الأساس التنفيذي:** `5ac3339cc9b30fc05340e142c874f828f3218763`
> **الحالة:** **APPROVED — OWNER APPROVED**
> **حالة Sprint التنفيذية:** **CLOSED — OWNER APPROVED** بتاريخ 2026-11-08

## 1. ضبط الوثيقة ومصادر الحقيقة

| البند | القيمة |
|---|---|
| معرّف الوثيقة | `DOC-SPRINT-07-PLAN` |
| الإصدار | `1.0-approved` |
| الحالة | **APPROVED — OWNER APPROVED** |
| التاريخ | 2026-11-07 |
| تاريخ اعتماد المالك | 2026-11-07 |
| تاريخ إغلاق Sprint بموافقة المالك | 2026-11-08 |
| حالة Sprint التنفيذية | **CLOSED — OWNER APPROVED** |
| تاريخ قرارات التخطيط المعتمدة | 2026-11-07 |
| Sprint | 07 من 11 |
| المالك | مالك منتج «سعّرلي» |
| قائمة الاختبار | [SPRINT_07_TEST.md](../../tests/sprints/SPRINT_07_TEST.md) |

### 1.1 قرارات التخطيط المعتمدة بتاريخ 2026-11-07

اعتمد المالك routes الواجهة، وسجل aggregate المملوك للـBackend، وحد summary، وإسقاط list المصغر، وعرض الوثيقة داخل modal خاصة، وعقد pagination.

### 1.2 سجل الإصدارات وإشعار الاعتماد

| الإصدار | التاريخ | الوصف |
|---|---|---|
| `0.1-draft` | 2026-11-07 | مسودة تفصيلية لنطاق Sprint 07 وعقوده ومهامه واختباراته للمراجعة. |
| `1.0-approved` | 2026-11-07 | اعتماد المالك الكامل للخطة وتسلسل التنفيذ وحدود commits والfixtures وQA والاستبعادات. |
| إغلاق Sprint | 2026-11-08 | اكتملت 31/31 مهمة و42/42 اختباراً آلياً و12/12 حالة QA يدوية؛ أغلق المالك Sprint 07 صراحةً دون تفويض الإنتاج أو أعمال Sprint 08–10. |

> **إشعار الاعتماد والإغلاق:** اعتمد المالك هذه الخطة بتاريخ 2026-11-07 فوق baseline commit `5ac3339cc9b30fc05340e142c874f828f3218763`. تشمل الخطة 31 مهمة تنفيذ، و42 اختباراً آلياً، و12 حالة QA يدوية للمالك، بإجمالي 54 حالة. بعد اكتمال 31/31 مهمة و42 PASS آلية و12 PASS يدوية، أغلق المالك Sprint 07 صراحةً بتاريخ 2026-11-08. يبقى النشر الإنتاجي وFirebase الحي والوثائق التجارية الحقيقية غير مصرح بها.

ترتيب مصادر الحقيقة:

1. [SRS v2 المعتمد](../01-product/requirements/SA3ERLI_SRS_V2_AR.md)، ولا سيما `FR-ADM-001`–`FR-ADM-004` و`FR-ADM-006`.
2. [السيناريو الوظيفي المعتمد](../01-product/scenarios/FUNCTIONAL_SCENARIO_AR.md)، ولا سيما `SCN-ADM-001`–`SCN-ADM-004` و`DEC-006`–`DEC-008`.
3. [الخطة الرئيسية المعتمدة](../02-planning/MASTER_PROJECT_PLAN_AR.md)، القسم 13.1.
4. [تقرير Sprint 06](./SPRINT_06_REPORT.md)، [اختباراته](../../tests/sprints/SPRINT_06_TEST.md)، و[إعداد Backend](./SPRINT_06_BACKEND_SETUP.md).
5. التنفيذ وOpenAPI عند commit خط الأساس أعلاه.

## 2. الهدف والنتيجة المتوقعة

إنشاء لوحة أدمن عربية محمية تستهلك Backend الموثوق فقط لمراجعة طلبات اعتماد المحلات. تشمل النتيجة shell إداري، ملخصاً عالمياً موثوقاً، قائمة مستقرة، تفاصيل، تنزيل/عرض الوثيقة الخاصة، وقراري الموافقة أو الرفض مع optimistic concurrency. تبقى الواجهة static-export-compatible ولا تقرأ Firestore مباشرة.

كان اعتماد الوثيقة وحده لا يعني تنفيذ Sprint أو اختباره أو إغلاقه. اكتملت لاحقاً أدلة التنفيذ والاختبار وQA وموافقة الإغلاق وفق القسم 13، وأصبحت حالة Sprint **CLOSED — OWNER APPROVED** بتاريخ 2026-11-08.

## 3. حدود النطاق

### 3.1 داخل النطاق

- route shell محمي وحالات الأدوار: signed-out، unverified، verified non-admin، وadmin.
- ملخص عالمي عبر endpoint Backend جديد وإلزامي وفق `FR-ADM-006`.
- list الحالية باستخدام `status`, `limit`, `pageToken` فقط.
- pagination مستقرة، filters، loading، empty، error، retry، refresh.
- detail JSON بلا document bytes.
- private document عبر Backend فقط مع attachment و`private, no-store`.
- approve/reject UI مع `expectedVersion` وسبب رفض إلزامي.
- conflict، not-pending، unauthorized، rate-limit، unavailable، recovery.
- RTL، responsive، keyboard، focus، live status، reduced motion وعدم overflow.
- OpenAPI، rate limits، correlation IDs، redaction، Emulator fixtures واختبارات غير حية.

### 3.2 استبعادات صريحة

لا يشمل Sprint 07: `needs_changes` (`FR-ADM-005`)، resubmission أو reapplication cycles، إنشاء Shop، merchant claims، suspension/reactivation، Merchant dashboard، Offer CRUD، ترحيل Object Storage، حذف الوثائق المجدول، نشر production، أو وثائق تجارية حقيقية. لا يغير Sprint حالات الطلب المدعومة حالياً: `pending | approved | rejected`.

## 4. الحالة التنفيذية عند الدخول

| المجال | الحالة | الموجود فعلياً | عمل Sprint 07 |
|---|---|---|---|
| Auth والجلسة | موجود | Firebase Auth و`AuthProvider` وحالات loading/signed-out/unverified/verified | Admin UX مبني على `/auth/me` والـBackend guard؛ لا صلاحية من UI وحده |
| Admin guards | موجود | Bearer token + verified-email + `admin: true` | إعادة استخدام واختبارات role matrix |
| Admin list | موجود Backend | `GET /api/v1/admin/merchant-applications` مع `status/limit/pageToken` | API client وUI وإسقاط response مصغر معتمد |
| Detail | موجود Backend | `GET .../:uid` بلا bytes | UI detail وتحليل defensive للعقد |
| Document | موجود Backend | `GET .../:uid/document`، attachment، `private, no-store` | modal متاحة بعد فعل صريح وBlob مؤقتة في الذاكرة مع lifecycle cleanup كامل |
| Decision | موجود Backend | `PATCH .../:uid/decision` pending-only، version، reason، Audit | dialogs وconflict/not-pending recovery؛ لا إعادة تنفيذ منطق القرار |
| Summary | غير موجود | list الحالية لا تعيد totals عالمية | endpoint جديد إلزامي وعقد OpenAPI واختبارات حتمية |
| Admin routes/UI | غير موجود | لا `/admin` في `app/` | shell، dashboard، detail route، navigation وحالات الوصول |
| Firestore rules | موجود | direct client access للـapplications/documents/audits مرفوض | إثبات عدم التوسيع؛ لا فتح client reads |
| التخزين | جزئي/تطويري | الوثيقة `Bytes` خاصة في Firestore | استعمال dummy bytes فقط؛ Object Storage يبقى Sprint 10 |

## 5. المعمارية والعقود المعتمدة للتخطيط

### 5.1 Routes الواجهة

| Route | الغرض | ملاحظة static export |
|---|---|---|
| `/admin` | shell + summary + filters + paginated list | صفحة ثابتة مع Client Component؛ لا server runtime |
| `/admin/application?id=<uid>` | detail + document + approve/reject | query route بدل dynamic segment |
| `/login?returnTo=%2Fadmin` | دخول signed-out | يستخدم `sanitizeReturnPath` الحالي |
| `/verify-email?returnTo=%2Fadmin` | توثيق unverified | العودة داخلية فقط |

لا يوجد route عام لاختيار fixtures أو تجاوز authorization. يظهر رابط الإدارة في header/account بعد تحقق موثوق فقط، ولا يعد إخفاؤه إجراء أمنياً.

### 5.2 تدفق التفويض

1. `AuthProvider` يعرض loading بلا flash لمحتوى الأدمن.
2. signed-out ينتقل إلى login مع `returnTo` داخلي آمن.
3. unverified ينتقل إلى verify-email.
4. verified user يحصل على ID token ويستدعي `GET /api/v1/auth/me`.
5. `claims.admin !== true` ينتج forbidden عربي ولا يبدأ أي طلب business-data.
6. admin يستدعي endpoints؛ كل endpoint يعيد التحقق server-side. stale UI أو claim لا يمنح صلاحية بذاته.
7. 401/403 بعد فتح الصفحة يمسح البيانات الإدارية من state ويعرض recovery آمن.

### 5.3 عقد الملخص العالمي الإلزامي

**Route جديد:** `GET /api/v1/admin/merchant-applications/summary`

- يسجل الـcontroller هذا المسار الثابت قبل `GET :uid` حتى لا يُفسر `summary` بوصفه uid.
- guards: `FirebaseAuthGuard`, `VerifiedEmailGuard`, `AdminGuard`.
- read-only، بلا query parameters.
- rate limit معتمد: 30 طلباً لكل 60 ثانية ضمن آلية throttling الحالية.
- response `200`:

```json
{
  "summary": {
    "total": 12,
    "pending": 5,
    "approved": 4,
    "rejected": 3,
    "version": 8,
    "updatedAt": "2026-11-07T12:00:00.000Z"
  }
}
```

**دلالات العد:** كل document حالي صالح في `merchantApplications/{uid}` يمثل طلباً واحداً. `total = pending + approved + rejected`. الأعداد أعداد صحيحة غير سالبة، عالمية لكل المجموعة وغير متأثرة بـ`status`, `limit` أو `pageToken`. لا يحوي الرد uid أو shop أو email أو document metadata/bytes.

**نموذج الاتساق المعتمد:** سجل Backend-owned واحد `merchantApplicationSummaries/global` بالحقول السابقة. تحدثه create transaction ذرياً مع application/document، وتحدثه decision transaction ذرياً مع application/Audit. يجب أن تكون counts أعداداً صحيحة غير سالبة وأن يبقى `total = pending + approved + rejected`. يمنع تفعيل endpoint قبل initialization/reconciliation موثوقين.

يضاف verifier حتمي read-only يعيد حساب counts من `merchantApplications` ويبلغ التطابق أو drift دون طباعة PII. يسمح repair تلقائي للـaggregate في demo Emulator وعلى loopback فقط. لا يصرح Sprint 07 بأي إصلاح live/production؛ يحتاج ذلك لاحقاً إجراءً تشغيلياً معتمداً ومستقلاً. يجب أن تبقى ذرية Sprint 06 لإنشاء application/document وقرار application/Audit تحت regression بعد إدخال aggregate.

إذا كان السجل مفقوداً أو فاسداً أو غير متسق، يفشل الملخص مغلقاً؛ لا تعرض الواجهة صفراً مضللاً ولا تشتق counts من الصفحة. فشل summary مستقل عن list: يبقى نجاح القائمة معروضاً مع خطأ summary وإجراء retry خاص بها.

**الأخطاء:** envelope القياسي مع `correlationId`: 401 token، 403 unverified/admin-required، 429 `rate_limit/exceeded`، و503 `admin/summary-unavailable` عند غياب/فساد/عدم اتساق aggregate أو فشل القراءة. لا stack أو PII أو bytes. يوثق OpenAPI schema والأمثلة والحالات والـrate limit.

### 5.4 العقود الموجودة التي تستهلكها الواجهة

| العملية | العقد الموجود | قيود Sprint 07 |
|---|---|---|
| list | `GET /api/v1/admin/merchant-applications?status=&limit=&pageToken=` | status اختياري من الثلاث، limit 1–50 default 20، token opaque؛ لا `page/pageSize` ولا totals؛ response المصغر فقط |
| detail | `GET /api/v1/admin/merchant-applications/:uid` | metadata فقط؛ parsing defensive؛ 404 آمن |
| document | `GET /api/v1/admin/merchant-applications/:uid/document` | Blob منفصل؛ image signatures المعتمدة؛ attachment + no-store؛ revoke object URL |
| decision | `PATCH /api/v1/admin/merchant-applications/:uid/decision` | reject يرسل reason إلزامياً؛ approve UI لا ترسل reason؛ لا rejectionReason محفوظ أو مكشوف للموافقة؛ refetch على 409 |
| identity | `GET /api/v1/auth/me` | safe identity + `claims.admin`; لا token في response/log |

القائمة تعرض هذه الحقول فقط: `ownerId`, `shop.name`, `shop.area`, `status`, `submittedAt`, `version`. يمنع ظهور address، WhatsApp، rejection reason، reviewedAt، reviewerId، document metadata أو document bytes. حقول المراجعة اللازمة تظهر فقط في detail المصرح. يتطلب ذلك contract test يحمي من توسيع list response مستقبلاً.

### 5.5 الواجهة والحالة

- API adapter typed مشترك يحصل على fresh ID token، timeout محدود، error-code mapping عربي، وAbortController cleanup.
- summary وlist حالتان مستقلتان؛ فشل أحدهما لا يمحو نجاح الآخر.
- filter change يلغي الصفحة الحالية ويبدأ من دون pageToken؛ next token opaque ولا يخزن كصلاحية.
- refresh يعيد summary وصفحة القائمة الحالية وفق سياسة موثقة، ويمنع duplicate in-flight requests.
- الوثيقة لا تجلب تلقائياً ولا عبر prefetch؛ فعل مستخدم صريح يفتح modal متاحة ثم fetch مصادقاً عبر Backend.
- تحفظ Blob في الذاكرة فقط؛ يمنع public URL الدائم و`localStorage` و`IndexedDB` وCache API.
- يُلغى Object URL عند إغلاق modal، أو تغير owner/application، أو logout، أو unmount، أو 401/403، مع تفريغ Blob من state.
- decision dialog يثبت uid/name/decision، يعطل submit أثناء الطلب، ويمنع double action.
- reject يتطلب reason؛ approve UI لا تضيف reason إلى payload، ويثبت الاختبار عدم حفظ أو كشف rejection reason للموافقة دون تحويل رفض approval reason إلى عقد مطلوب غير مثبت.
- success يحدث detail/list/summary من رد موثوق أو refetch؛ 409/not-pending يجبران refetch قبل قرار آخر.
- status/error messages تستخدم `aria-live`/`role=alert` عند الحاجة مع focus management دون trap.

## 6. Backlog التنفيذ القابل للمراجعة

| Task ID | المجال | العمل | التبعيات | التتبع |
|---|---|---|---|---|
| `S07-GOV-001` | Governance | تثبيت scope/exclusions والعقود واعتماد هذه الخطة | baseline نظيف | `DEC-006`, `SCN-ADM-001`–`004` |
| `S07-GOV-002` | Governance | جرد API/OpenAPI الحالي وحماية العقود الموجودة من إعادة التنفيذ | Sprint 06 | `FR-ADM-002`–`004`, `NFR-MNT-001` |
| `S07-GOV-003` | Governance | تعريف traceability وevidence manifest ونتائج PASS/FAIL/BLOCKED | TEST plan | `SCN-OPS-001`, `NFR-MNT-003` |
| `S07-ARCH-001` | Architecture | تصميم `AdminApiAdapter` وDTO parsers وsafe errors | API base/Auth | `FR-ADM-001`–`FR-ADM-004`, `FR-ADM-006` |
| `S07-ARCH-002` | Architecture | تصميم Admin state/query model وإلغاء الطلبات والتنظيف | ARCH-001 | `FR-OPS-001`, `NFR-REL-001` |
| `S07-ARCH-003` | Architecture | تثبيت `/admin` و`/admin/application?id=` وsafe returnTo | static export | `FR-ADM-001`, `SCN-AUTH-005`, `NFR-MNT-002` |
| `S07-BE-001` | Backend | إضافة summary DTO/response schema دون PII | عقد 5.3 | `FR-ADM-006`, `NFR-PRV-001` |
| `S07-BE-002` | Backend | إضافة repository summary read + invariant validation | DATA-001 | `FR-ADM-006`, `NFR-REL-001` |
| `S07-BE-003` | Backend | إضافة endpoint/guards/rate limit/safe 503 | BE-001/002 | `FR-ADM-006`, `NFR-SEC-001` |
| `S07-BE-004` | Backend | تحديث OpenAPI للsummary ولschemas الفعلية الحالية | BE-003 | `NFR-MNT-001`, `SCN-OPS-001` |
| `S07-BE-005` | Backend | تدقيق/minimize list projection دون تغيير pagination | tests أولاً | `FR-ADM-002`, `NFR-PRV-001` |
| `S07-BE-006` | Backend | تثبيت error envelopes/correlation/redaction لكل admin endpoints | common filters | `NFR-SEC-002`, `NFR-OPS-001` |
| `S07-DATA-001` | Data | إضافة aggregate contract وتحديثه ذرياً مع create/decision | تصميم موثق | `FR-ADM-006`, `FR-ADM-004` |
| `S07-DATA-002` | Data | initialization/reconciliation قبل تفعيل endpoint مع fail-closed | DATA-001 | `FR-ADM-006`, `NFR-REL-001` |
| `S07-DATA-003` | Rules/index | إثبات client denial للسجل الجديد ومراجعة الحاجة للفهرس | rules الحالية | `NFR-SEC-001`, `NFR-PRV-001` |
| `S07-DATA-004` | Operations | verifier حتمي يعيد حساب counts ويبلغ drift بلا PII | DATA-001 | `FR-ADM-006`, `NFR-OPS-001` |
| `S07-DATA-005` | Operations | repair تلقائي Emulator-only مع رفض live/production | DATA-004 | `NFR-OPS-002`, `NFR-SEC-001` |
| `S07-FE-001` | Frontend | بناء admin auth gate للحالات الأربع | `/auth/me` | `FR-ADM-001`, `SCN-ADM-001` |
| `S07-FE-002` | Frontend | بناء shell/navigation/landmarks وحالات loading/forbidden | FE-001 | `NFR-ACC-001`–`003` |
| `S07-FE-003` | Frontend | summary cards بحالات مستقلة وretry/refresh | BE-003 | `FR-ADM-006`, `SCN-ADM-002` |
| `S07-FE-004` | Frontend | list/filter/limit/token pagination وحالة empty | adapter | `FR-ADM-002`, `SCN-ADM-002` |
| `S07-FE-005` | Frontend | detail route وdefensive rendering | list links | `FR-ADM-003`, `SCN-ADM-003` |
| `S07-FE-006` | Frontend | private document fetch/view/download وcleanup | FE-005 | `FR-ADM-003`, `DEC-007`, `DEC-008` |
| `S07-FE-007` | Frontend | approve/reject dialogs وexpectedVersion/conflict recovery | FE-005 | `FR-ADM-004`, `SCN-ADM-004` |
| `S07-SEC-001` | Security | authz matrix وdirect-client denial وno content flash | guards/rules | `FR-ADM-001`, `NFR-SEC-001` |
| `S07-SEC-002` | Privacy | JSON/blob/log/artifact leak scans وno-store assertions | endpoints/UI | `FR-ADM-003`, `NFR-SEC-002`, `NFR-PRV-001` |
| `S07-SEC-003` | Security | rate-limit/CORS/request-abort/unavailable recovery tests | config | `FR-OPS-002`, `NFR-OPS-001`–`002` |
| `S07-QA-001` | QA | unit/integration/contract/Emulator/rules suites | implementation | `NFR-MNT-003`, `SCN-OPS-001` |
| `S07-QA-002` | QA | Playwright/a11y/responsive/regressions/builds بلا live Firebase | fixtures | `NFR-ACC-001`–`003`, `NFR-MNT-002` |
| `S07-QA-003` | QA | انحدارات ذرية Sprint 06 لـapplication/document وdecision/Audit بعد aggregate | DATA-001 | `FR-ADM-004`, `NFR-REL-001` |
| `S07-DOC-001` | Documentation | OpenAPI، setup، report، checklist، traceability reconciliation | evidence | `NFR-MNT-001`, `DEC-006` |

**إجمالي المهام:** 31 مهمة صغيرة قابلة للمراجعة.

## 7. ترتيب التنفيذ المقترح وحدود commits

1. **Contract tests first:** `S07-GOV-*`, `ARCH-*`؛ commit مقترح: `test: define sprint 07 admin contracts`.
2. **Summary data/backend:** `BE-001`–`004`, `DATA-001`–`005`؛ commit: `feat: add trusted admin application summary`.
3. **API privacy hardening:** `BE-005`–`006`, `SEC-002`؛ commit: `fix: minimize admin application responses`.
4. **Admin access shell:** `FE-001`–`002`, `SEC-001`؛ commit: `feat: add protected admin shell`.
5. **Summary/list UI:** `FE-003`–`004`؛ commit: `feat: add admin application overview`.
6. **Detail/document/decision:** `FE-005`–`007`؛ commit: `feat: add admin application review workflow`.
7. **QA/docs:** `SEC-003`, `QA-*`, `DOC-001`؛ يشمل drift/repair guards وانحدارات ذرية Sprint 06؛ commit: `test: verify sprint 07 admin workflow` ثم docs-only closure بعد موافقة المالك.

هذه حدود مقترحة لا تفوض commits في مهمة التخطيط الحالية. يجب أن يبقى كل commit قابلاً للاختبار والتراجع دون خلط scope Sprint 08.

## 8. التبعيات

- Sprint 06 مغلق وعقوده واختباراته سليمة.
- Firebase Auth emulator وFirestore emulator وdummy admin claim محلي.
- API base آمن وCORS loopback في QA.
- فهرس list الحالي منشور/متاح في البيئة المستهدفة لاحقاً؛ لا نشر في Sprint planning.
- بوابة catalog-loading أغلقت بالـcommit `6fd9b5620f05f8050812a49a1109e3f42d1fa354`.
- قرارات routes وaggregate ومعدل 30/60 وlist/modal/pagination معتمدة بتاريخ 2026-11-07؛ يبقى اعتماد الخطة الكاملة شرط دخول.

## 9. المخاطر والمعالجات

| Risk ID | الخطر | المعالجة | الحالة |
|---|---|---|---|
| `S07-RISK-001` | aggregate مفقود أو منجرف | atomic updates + verifier + reconcile + fail-closed؛ repair آلي Emulator-only | معالجة معتمدة بالتخطيط |
| `S07-RISK-002` | list response يعرض PII أكثر من اللازم | DTO projection + contract/leak tests | داخل Sprint |
| `S07-RISK-003` | stale decision بعد فتح detail | expectedVersion + 409 + refetch | العقد موجود؛ UI جديد |
| `S07-RISK-004` | document Blob يبقى في الذاكرة/cache | no-store + object URL cleanup + no persistence | داخل Sprint |
| `S07-RISK-005` | UI يخفي الرابط لكن Backend يسمح | guard tests لكل endpoint؛ UI ليس trust boundary | معالج بالعقد |
| `S07-RISK-006` | static export يتجه إلى dynamic routes | query route + build assertion | داخل Sprint |
| `S07-RISK-007` | fixtures أو harness تصل production | explicit emulator flag + demo project + loopback + artifact scan | داخل Sprint |
| `S07-RISK-008` | Firestore Bytes تستخدم لوثيقة حقيقية | dummy signatures فقط وتحذير UI/docs؛ بوابة Sprint 10 | blocker إنتاجي |

## 10. Rollback والتعافي

- Frontend admin routes مستقلة ويمكن إزالتها دون التأثير في public catalog أو `/add`.
- summary endpoint read-only؛ عند فشل aggregate تعرض 503 ولا تستخدم list كبديل مضلل.
- تغييرات aggregate في create/decision يجب أن تكون داخل transaction نفسها؛ فشل أي خطوة يلغي العملية كلها.
- verifier يبلغ drift دون إصلاح live. قبل أي repair إنتاجي يلزم إجراء تشغيلي لاحق معتمد؛ لا script إصلاح حي في Sprint 07.
- repair التلقائي يرفض أي project لا يبدأ بـ`demo-` وأي Auth/Firestore host غير loopback.
- rollback لا يعيد فتح direct Firestore access ولا يحذف Audits أو وثائق مستخدمين.
- conflict/unavailable في UI يحافظ على البيانات المعروضة كـstale visual state فقط مع منع القرار حتى refresh.

## 11. معايير الدخول

- [x] Sprint 06 **CLOSED — OWNER APPROVED**.
- [x] السيناريو وSRS v2 والخطة الرئيسية معتمدة ومثبتة.
- [x] baseline commit يطابق `5ac3339...` والشجرة مفهومة.
- [x] تحقيق catalog-loading حُسم باختبار حتمي مستقل.
- [x] قرارات routes وaggregate/rate وlist/modal/pagination معتمدة بتاريخ 2026-11-07.
- [x] اعتماد المالك لهذه الخطة كاملة بوصفها baseline تنفيذ Sprint 07.
- [x] اعتماد fixtures والأدوار الوهمية الحتمية دون بيانات حقيقية.
- [ ] إنشاء branch تنفيذ منفصل وفق سياسة المالك إن لزم.

## 12. معايير الخروج وDefinition of Done

- جميع مهام النطاق مكتملة دون أي عنصر من Sprint 08–10.
- summary عالمي موثوق من endpoint الإلزامي؛ invariant مثبت تحت concurrency وEmulator.
- initialization/reconciliation يسبقان التفعيل؛ verifier يثبت عدم drift، وrepair الآلي محصور بالـEmulator.
- routes والحالات الأربع تعمل direct navigation ومن keyboard على viewports الخمسة.
- list/detail/document/decision تستخدم Backend فقط؛ لا Firestore client business access.
- bytes غائبة من JSON/logs/state persistence/artifacts، والdocument attachment خاص no-store.
- approve/reject pending-only وexpectedVersion/Audit تبقى صحيحة؛ reject يتطلب reason وapprove UI لا ترسله ولا ينتج rejection reason.
- انحدارات Sprint 06 تثبت بقاء application/document وdecision/Audit ذرية بعد aggregate.
- lint/unit/integration/contract/rules/emulator/E2E/regression/build مع وبدون env تمر وفق checklist.
- static export يخرج `/admin` و`/admin/application` دون server runtime.
- OpenAPI وsetup/report/checklist/traceability محدثة؛ لا secrets أو real documents.
- العمليات والمنافذ تتوقف cleanly.
- Owner manual QA موثق، ثم موافقة إغلاق صريحة. قبل ذلك الحالة ليست CLOSED.

## 13. قاعدة الإغلاق

اكتملت شروط الإغلاق الأربعة: (1) الدليل الآلي 42 PASS / 0 FAIL / 0 BLOCKED، (2) QA المالك 12 PASS / 0 FAIL / 0 BLOCKED، (3) reconciliation بين التقرير وقائمة الاختبارات ومصادر المتطلبات، و(4) موافقة إغلاق صريحة بتاريخ 2026-11-08. حالة Sprint 07 هي **CLOSED — OWNER APPROVED**. لا يغيّر ذلك الاستبعادات أو بوابات الإنتاج المفتوحة.

## 14. سجل موافقة المالك وبنود المراجعة المتبقية

- [x] routes المعتمدة: `/admin` و`/admin/application?id=<uid>`.
- [x] aggregate Backend-owned وقواعد الاتساق والتهيئة/verifier/Emulator-only repair، مع rate limit معتمد 30/60.
- [x] list projection المعتمدة بالحقول الستة فقط.
- [x] document modal المعتمدة بفعل صريح وBlob في الذاكرة وتنظيف كل lifecycles.
- [x] pagination المعتمدة: default 20، range 1–50، و`status/limit/pageToken` فقط.
- [x] اعتماد الخطة الكاملة وتسلسل التنفيذ وحدود commits.
- [x] اعتماد fixtures الحتمية و12 حالة QA يدوية وviewports الخمسة.
- [x] تأكيد استبعادات Sprint 08–10 وحظر الوثائق الحقيقية وFirebase الحي في QA، وأن أي تغيير لاحق يحتاج مراجعة مالك موثقة.

