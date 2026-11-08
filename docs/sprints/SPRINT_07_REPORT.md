# Sprint 07 — تقرير لوحة الأدمن

الحالة: **CLOSED — OWNER APPROVED**.

التاريخ: 2026-11-08. تاريخ موافقة المالك والإغلاق: 2026-11-08. الفرع: `sprint/07-admin-dashboard`. خط الأساس: `2ce99ae62e5c2a57e0cf922d5131820da0dcd558` على `main` المتزامن مع `origin/main` عند بدء العمل.

## التغطية المنفذة

- اكتملت مهام الخطة المعتمدة 31/31 دون نقل أعمال Sprint 08–10.
- أضيفت routes ثابتة `/admin` و`/admin/application?id=<uid>` مع بوابة signed-out/unverified/non-admin/admin بلا flash لمحتوى مميز.
- أضيف عقد Frontend typed ودفاعي، وحالات summary/list مستقلة، pagination بـ`status/limit/pageToken`، detail، قرارات versioned، وحوار وثيقة خاص في الذاكرة مع تنظيف lifecycles المعتمدة.
- أضيف `GET /api/v1/admin/merchant-applications/summary` قبل `:uid` مع الحراس الثلاثة وحد 30/60 وعقد OpenAPI آمن.
- أصبح `merchantApplicationSummaries/global` Backend-owned؛ create وdecision يحدثانه transactionally مع سجلات الأعمال. الغياب/الفساد/عدم الاتساق ينتج 503 `admin/summary-unavailable` ولا يعيد صفراً مضللاً.
- صُغرت القائمة إلى الحقول الستة المعتمدة، وبقي detail بلا bytes، والتنزيل admin-only وprivate/no-store attachment.
- أضيف seed حتمي 3/2/2، verifier read-only للانحراف، وإصلاح محصور في `demo-*` وloopback فقط. قواعد Firestore ترفض الوصول المباشر للملخص كما ترفض بيانات الأعمال الأخرى.

## نتائج AT وMQ

| المجموعة | PASS | FAIL | BLOCKED |
|---|---:|---:|---:|
| `AT-001`–`AT-042` | 42 | 0 | 0 |
| `MQ-001`–`MQ-012` | 12 | 0 | 0 |
| الإجمالي | 54 | 0 | 0 |

أكمل المالك الحالات اليدوية الاثنتي عشرة بنجاح، وأصدر موافقة الإغلاق الصريحة بتاريخ 2026-11-08. كانت `MQ-004` و`MQ-007` آخر حالتين، واعتمد المالك نتيجتي إعادة اختبارهما كما هو موثق أدناه.

## حاجزا QA وإصلاحهما المحدود

- **Pagination:** كانت fixtures سبعة لكن UI تعرض 10 و20 و50 فقط، لذلك لم يمكن إنشاء صفحة ثانية. أضيف الخيار 5 دون تغيير default Backend (20) أو النطاق 1–50 أو query parameters. الاختبار المتكامل أثبت الصفحة الأولى 5 owner IDs فريدة، والثانية السجلين المتبقيين، وعدم overlap، والعودة إلى نفس الخمسة وبنفس الترتيب، ومسح cursor/history عند تغيير status أو limit.
- **معاينة الوثيقة:** كان seed الـWebP مجرد RIFF/WEBP header بطول 12 بايت، صحيح signature لكنه غير قابل للفك. استُبدل بـWebP وهمي ثابت صالح 1×1 مخزن كـFirestore Bytes، ومُيز اسم fixture بنوعه كي يكون اختياره حتمياً. أثبت Chromium أن الصورة `complete` وبأبعاد طبيعية 1×1، مع `image/webp` وattachment filename آمن و`private, no-store, max-age=0`, و`no-cache`, و`nosniff`.

لم يتغير Backend contract أو قواعد Firebase أو تنظيف Blob/Object URL المعتمد.

### دليل إعادة اختبار المالك

- **`MQ-004`: PASS.** ظهرت خيارات 5 و10 و20 و50. مع 7 fixtures وlimit 5 عرضت الصفحة الأولى 5 سجلات فريدة، وعرض Next السجلين المتبقيين، وأعاد Previous السجلات الخمسة الأصلية وبالترتيب نفسه، دون تكرار أو حذف أو تغير ترتيب أو فشل تنقل.
- **`MQ-007`: PASS.** لم تُجلب الوثيقة تلقائياً، وجُلبت فقط بعد الضغط على «عرض الوثيقة». عاد طلب الوثيقة وBlob بالحالة 200، وفُك WebP الصالح وظهر بلا مؤشر صورة مكسورة. طابقت الرؤوس `Content-Type: image/webp` و`Content-Disposition: attachment; filename="commercial-record.webp"` و`Cache-Control: private, no-store, max-age=0`.
- بقيت أدلة modal lifecycle والتنظيف والـ401/403 من QA السابق والاختبارات الآلية PASS، وأكد المالك اكتمال جميع `MQ-001`–`MQ-012` بنتيجة 12/12.

## نتائج الأوامر

| الأمر | النتيجة |
|---|---|
| `npm run lint` | PASS |
| `npm test` | PASS — 58/58 |
| `npm --prefix backend run lint` | PASS |
| `npm --prefix backend test` | PASS — 33/33 |
| `npm --prefix backend run build` | PASS |
| `npm run test:rules` | PASS — 4/4 |
| `npm --prefix backend run test:emulator` | PASS — 4/4 |
| `npm run build` مع `.env.local` | PASS — 14 routes ثابتة، ومنها admin routes |
| `npm run build` دون `.env.local` | PASS — الملف أعيد في `finally` دون قراءة قيمه |
| `npm run test:e2e` | PASS — 110/110 غير حية |
| `npm run test:sprint06:integrated` | PASS — 2/2، مع verifier ذرية 3/3 |
| `npm run test:sprint07:integrated` | PASS — 2/2، mobile وdesktop |

أول محاولة للانحدار العام كشفت أن `sprint07-emulator.spec.ts` لم يكن مستبعداً من config الافتراضي، ففشل دون محاكيات. عُزل الملف إلى `playwright.sprint07.config.ts` وأعيد suite كاملاً بنجاح 110/110. هذا إصلاح test-runner وليس إضعافاً للاختبار.

## أدلة الأمان والخصوصية والذرّية

- Backend tests أثبتت الحراس، invariants، 503 الآمن، 30/60، minimization، OpenAPI، correlation/redaction، optimistic concurrency، وعدم بقاء rejection reason بعد الموافقة.
- Emulator E2E أثبت create/application/document/aggregate وdecision/application/Audit/aggregate داخل معاملات فعلية، مع بقاء سلوك Sprint 06.
- Rules tests أثبتت رفض direct-client لكل الأدوار على applications/documents/audits/summary مع بقاء catalog/liveOffers دون توسيع.
- verifier كشف drift حتمياً، رفضه، أصلحه داخل demo/loopback فقط، ثم تحقق من 7 = 3 + 2 + 2. runner يرفض المشروع الحقيقي أو host غير loopback قبل mutation.
- JSON parsers ترفض bytes والحقول الإضافية؛ Blob لا يُجلب مسبقاً ولا يحفظ في localStorage/IndexedDB/Cache API، وتُلغى Object URLs في lifecycles المعتمدة.
- لا حسابات أو وثائق أو أرقام حقيقية، ولا اتصال أو كتابة إلى Firebase حي، ولا deployment.

## الملفات والنطاق

- Frontend: `app/admin/**`, `components/admin/**`, `lib/adminApi.ts`, وإعداد Playwright المعزول.
- Backend: merchant controller/service/repository/types، aggregate transaction، scripts seed/verifier/runner، واختبارات unit/integration/emulator.
- Data/rules: `firestore.rules` فقط لإضافة deny صريح للـsummary؛ لا تغيير schema أو صلاحيات catalog/liveOffers.
- Tests/scripts: Sprint 07 unit/E2E/integrated، وتحديثات regression الضرورية لـSprint 06.
- Docs: هذا التقرير، [إعداد QA](SPRINT_07_SETUP.md)، وتحديث [قائمة الاختبار](../../tests/sprints/SPRINT_07_TEST.md).

## إغلاق QA اليدوي

أغلق المالك الحالتين المتبقيتين أعلاه بتاريخ 2026-11-08. النتيجة اليدوية النهائية: 12 PASS / 0 FAIL / 0 BLOCKED. توقفت بيئة QA نظيفاً، وتأكد خلو المنافذ 4000 و4100 و4400 و4500 و8080 و9099 و9150، ولم يُستخدم Firebase حي.

## المخاطر والقيود المتبقية

- initialization/reconciliation للإنتاج يحتاج إجراءً تشغيلياً معتمداً لاحقاً؛ Sprint 07 لا يوفر production repair.
- Firestore Bytes للتطوير فقط؛ الوثائق التجارية الحقيقية وObject Storage والنشر الإنتاجي خارج النطاق.
- `needs_changes`, reapplication, Shop/claim provisioning, suspension، Merchant dashboard، Offer CRUD، والحذف المجدول تبقى في Sprint 08–10.
- تبقى البوابات القانونية والخصوصية والبنية التحتية والإنتاج غير محسومة؛ إغلاق Sprint 07 لا يعني جاهزية المشروع للإنتاج.

لا blocker مفتوحاً في Sprint 07. الحالة النهائية: **CLOSED — OWNER APPROVED** بتاريخ 2026-11-08، مع 31/31 مهمة و54 PASS / 0 FAIL / 0 BLOCKED.
