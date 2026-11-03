# Sprint 04 — Merchant Approval Report

Status: **READY FOR OWNER REVIEW**

## تغطية المتطلبات

- بوابة `/add` تحمي طلب الاعتماد: مسجل + بريد موثّق فقط.
- نموذج RTL متجاوب لبيانات المحل وصورة السجل، مع رسائل عربية وحالات loading/empty/error/pending/approved/rejected.
- `merchantApplications/{uid}` للبيانات، و`merchantDocuments/{uid}` للبايتات والبيانات الوصفية الآمنة.
- الصورة Firestore `Bytes` وليست Base64؛ JPEG/PNG/WebP فقط وبحد خام أقصى 700 KiB.
- دفعة `writeBatch` واحدة تنشئ المستندين. `getAfter()` في القواعد يمنع السجلات الجزئية، ومعرف UID الواحد يمنع التكرار.
- لا URL عام ولا تحميل للصور عند list الطلبات.
- المالك الموثق يقرأ مستنديه فقط؛ `admin: true` فقط يقرأ/list الجميع ويغير pending إلى approved/rejected.
- العميل لا يمنح نفسه حالة أو دوراً؛ لا localStorage للصلاحية.
- نشر الأسعار يبقى مخفياً، وقواعد `liveOffers` و`submissions` تتطلب اعتماداً فعلياً وبيانات محل مطابقة.
- إعفاء فهرسة `merchantDocuments.bytes` موثق في `firestore.indexes.json`.
- أزيلت كل أكواد وقواعد ومتغيرات ومتطلبات Firebase Storage.
- أضيف إعداد Emulator محلي ومشغّل آمن لمسار Windows العربي، مع tokens وهمية للمالك والأدمن دون Auth حي.
- أضيف وضع QA يدوي محلي محمي بعلم صريح وlocalhost، مع Auth/Firestore/Hosting Emulators وحسابات وحالات وملفات اصطناعية وأوامر reset/reseed. خارج loopback يُحجب Firebase ولا يوجد fallback حي.

## قرار واجهة الأدمن

لم توجد ملفات SRS أو خطة سبرنتات داخل المستودع وقت التنفيذ؛ الموجود تقارير Sprint 01–03 فقط. لذلك لم تُنفّذ واجهة أدمن دون دليل أنها ضمن Sprint 04. جهزت عقود البيانات وقواعد `admin: true` وحقول المراجعة لواجهة الإدارة اللاحقة، ويلزم تعيين سبرنت تأجيلها عند إضافة الخطة إلى المستودع.

## الملفات المتغيرة

- `components/auth/AddAuthGate.tsx`
- `components/merchant/MerchantApplicationPanel.tsx`
- `lib/firebaseMerchantAdapter.ts`, `lib/merchantApplication.ts`
- `firestore.rules`, `firestore.indexes.json`
- `firebase.json`, `tests/run-firestore-emulator.ps1`
- `lib/firebaseEmulatorMode.ts`, وتحديث تهيئة Firebase/Auth/Merchant adapters
- `tests/run-sprint04-qa.ps1`, `tests/sprint04-qa-session.ps1`, `tests/qa/sprint04-seed.ts`
- `tests/run-sprint04-auto-qa.ps1`, `playwright.sprint04-emulator.config.ts`, `tests/e2e/sprint04-emulator.spec.ts`
- `.gitignore` لتجاهل سجل Firestore Emulator المؤقت
- `package.json`
- `tests/sprint04.test.ts`, `tests/e2e/sprint04.spec.ts`, `tests/e2e/sprint03.spec.ts`, `tests/firestore-emulator.test.ts`
- `tests/sprints/SPRINT_04_TEST.md`
- `docs/sprints/SPRINT_04_FIREBASE_SETUP.md`, `docs/sprints/SPRINT_04_REPORT.md`

## نتائج الاختبارات

| الفحص | النتيجة |
|---|---|
| `npm run lint` | PASS — ESLint دون أخطاء |
| `npm test` | PASS — 41/41، ومنها حدود الحجم والتفويض والذرّية والخصوصية وحواجز وضع Emulator والتعافي المحلي |
| build مع `.env.local` | PASS — 12 مسار تطبيق ساكن، 14 صفحة مولدة |
| build بدون `.env.local` | PASS — 12 مسار تطبيق ساكن، 14 صفحة مولدة، واستُعيد الملف دون قراءة قيمه |
| Sprint 04 isolated E2E | PASS — 18/18 على mobile وdesktop |
| الانحدارات غير الحية | PASS — 88/88 على mobile وdesktop |
| `npm run test:rules` | PASS — 8/8 على Firestore Emulator؛ Java 21.0.13.0.2 وFirebase CLI 15.8.0 |
| `npm run qa:sprint04` | PASS — build + Auth/Firestore/Hosting + 6 حسابات وهمية + 3 حالات + ملفات JPEG/PNG/WebP + `/add` 200 + إيقاف نظيف |
| `npm run qa:sprint04:auto` | PASS — 10/10 حالات QA محلية على Auth/Firestore/Hosting Emulators في 44.1 ثانية |
| reset/reseed scenarios | PASS — نُفذت `duplicate`, `failure`, `privacy`, ثم `status` فعلياً داخل الجلسة المحلية |
| Firebase/Firestore الحقيقي | NOT RUN — محظور، ولم تحدث كتابة حية |
| QA المحلي المنفذ بالوكيل | PASS — 10/10، FAIL 0، BLOCKED 0؛ ليس توقيع مالك |

ملاحظة تشغيل صادقة: محاولة انحدار أولية بعد smoke استخدمت `out/` المبني لوضع Emulator بعدما كانت المحاكيات قد توقفت، فكانت النتيجة 73/88 مع 15 فشلاً بسبب رفض اتصالات loopback. أُعيد بناء `out/` بلا `.env.local` ثم أُعيدت المجموعة نفسها كاملة ونجحت 88/88؛ لم يتطلب ذلك تغيير سلوك التطبيق ولم يحدث اتصال Firebase حي.

## مخاطر وقيود

- تحقق المتصفح والقواعد من MIME والحجم، لكن فحص magic bytes أو malware يحتاج backend موثوقاً ولا يناسب static export.
- Firestore document storage مؤقت؛ قبل الإنتاج يجب نقله إلى object storage آمن. لم يُختر مزود.
- لا يمكن للمالك إعادة تقديم طلب rejected لأن وثيقة UID الواحدة تمنع التكرار؛ إعادة الفتح قرار إداري لاحق.
- واجهة الأدمن غير منفذة لغياب SRS/خطة السبرنتات من المستودع.
- `tests/firestore-rest.test.ts` خاص بالعقد المنشور القديم وغير مشغّل؛ عقد Sprint 04 اختُبر محلياً عبر Emulator دون أي اتصال حي.

## عيوب اكتُشفت وأُصلحت أثناء QA

- كان سيناريو فشل القراءة المحلي يعيد الخطأ في كل محاولة، لذلك لم يثبت زر Retry التعافي. أصبح يفشل مرة واحدة فقط ثم يشترك فعلياً في Firestore Emulator عند إعادة المحاولة.
- لم يكن هناك سيناريو محلي مستقل لفشل تجهيز الصورة أو نافذة كافية لمشاهدة submit disabled مع commit سريع. أضيفا `document-failure` و`slow-submit`، وكلاهما محصوران خلف علم Emulator وlocalhost.
- تعذر تشغيل reseed من Playwright عبر `npm.cmd` بسبب `spawnSync EINVAL` على Windows؛ استُبدل باستدعاء Node/tsx المباشر. هذا خلل في مشغل QA وليس في سلوك المستخدم.

## أدلة QA المحلية

- الدليل الآلي: `test-artifacts/sprint04-qa/qa-results.json`، وفيه مشروع `demo-sa3erli-sprint04`, و`liveFirebaseUsed: false`, و10 نتائج passed مع تفاصيل حالة Firestore.
- الصور: `test-artifacts/sprint04-qa/screenshots/`، وعددها 16 صورة للحواجز والأخطاء والحدود والحالات والاستجابة.
- النتائج تخص Emulator محلياً فقط ولا تمثل موافقة المالك.

## دليل Emulator

نجحت ثماني حالات مستقلة: إنشاء ذري وقراءة المالك الموثق، رفض غير الموثق والمجهول، عزل المالك الآخر، list/read واعتماد/رفض الأدمن، منع العميل من تعيين القرار أو التعديل أو الحذف، منع التكرار والسجلات الجزئية، قبول 700 KiB ورفض 700 KiB + 1 byte، ورفض metadata غير المتطابقة والنشر غير المصرح. بقيت بايتات الصورة في `merchantDocuments` ولم تظهر في بيانات `merchantApplications`.

كما نجح workflow اليدوي المحلي طرفاً لطرف باستخدام مشروع demo فقط. تحقق الاختبار من تشغيل المحاكيات الثلاثة، إنشاء الحسابات الستة وادعاء `admin: true`، بذر pending/approved/rejected، إعادة بذر سيناريوهات التكرار والفشل والخصوصية والحالات، استجابة `/add`، ثم تحرير المنافذ. اختبارات الوحدة تثبت أن العلم وحده غير كافٍ: المضيف غير المحلي ينتج `blocked`، وأن جميع endpoints المستخدمة في وضع QA هي loopback بلا `https://` أو fallback حي.

## حالة إعداد Firebase التي أبلغ عنها المالك

أبلغ المالك أن `firestore.rules` وإعفاء فهرسة `merchantDocuments.bytes` المراجعين نُشرا إلى مشروع `mobitrade-35ee9`. سُجلت هذه المعلومة كما وردت فقط؛ لم ينفذ الوكيل أي اتصال أو قراءة أو كتابة أو تحقق حي. يبقى تعيين `admin: true` من بيئة خادم موثوقة وفحص المالك البصري قبل الإغلاق. التفاصيل في `SPRINT_04_FIREBASE_SETUP.md`.
