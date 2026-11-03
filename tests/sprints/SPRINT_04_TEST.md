# Sprint 04 — Merchant Approval Manual QA

Sprint status: **CLOSED — OWNER APPROVED**

Owner approval date: **2026-11-03**

هذه القائمة هي مرجع QA اليدوي الرسمي. استخدم Emulator وبيانات Sprint 04 الوهمية فقط. لا تستخدم Firebase الحقيقي ولا تنشر أسعاراً.

## التحضير

ثبّت Java 21، وتأكد أن المنفذين 4000 و8080 و9099 متاحة. من جذر المشروع نفّذ أمراً واحداً:

```powershell
npm run qa:sprint04
```

يبني الأمر نسخة static محلية بعلم Emulator صريح، ثم يشغّل Auth وFirestore وHosting Emulators لمشروع demo، ويعيد بذر البيانات، ويفتح الموقع على `http://127.0.0.1:4000`. اترك النافذة الأولى مفتوحة أثناء QA. عند الانتهاء اضغط Enter فيها؛ تتوقف كل المحاكيات والخادم تلقائياً.

لا تفتح النسخة على اسم جهاز أو عنوان شبكة. وضع QA لا يعمل إلا مع `NEXT_PUBLIC_FIREBASE_EMULATOR_MODE=1` ومع `localhost` أو عنوان loopback، وأي مضيف آخر يحجب Firebase بالكامل بدلاً من الرجوع إلى المشروع الحي.

### حسابات QA الوهمية

كلمة المرور لجميع الحسابات: `Sprint04-QA-Only!123`. هذه عناوين `.example.test` غير حقيقية:

| الحالة | البريد الوهمي |
|---|---|
| غير موثّق | `qa-unverified@sprint04.example.test` |
| طلب pending | `qa-pending@sprint04.example.test` |
| طلب approved | `qa-approved@sprint04.example.test` |
| طلب rejected | `qa-rejected@sprint04.example.test` |
| مالك ثانٍ بلا طلب | `qa-second-owner@sprint04.example.test` |
| admin claim | `qa-admin@sprint04.example.test` |

اختبر signed-out في نافذة خاصة قبل تسجيل الدخول. ملفات الرفع الاصطناعية الآمنة ينشئها الأمر في `test-artifacts/sprint04-qa/` بصيغ JPEG وPNG وWebP؛ ليست وثائق تجارية حقيقية ولا Base64.

### إعادة الضبط والسيناريوهات

نفّذ الأوامر التالية من نافذة PowerShell ثانية بينما أمر QA الرئيسي ما زال يعمل. كل reseed يمسح بيانات المحاكيات فقط ثم يعيد إنشاء الحسابات والسجلات:

```powershell
npm run qa:sprint04:reset
npm run qa:sprint04:reseed -- status
npm run qa:sprint04:reseed -- duplicate
npm run qa:sprint04:reseed -- failure
npm run qa:sprint04:reseed -- privacy
```

- `status`: سجّل بالتتابع بحسابات pending/approved/rejected.
- `duplicate`: سجّل بحساب pending وافتح `/add?qaScenario=duplicate` ثم حاول الإرسال؛ الكتابة الحقيقية إلى Emulator تصطدم بالسجل الموجود وتعرض رسالة آمنة.
- `failure`: سجّل بحساب second واستخدم `/add?qaScenario=read-failure` ثم `/add?qaScenario=write-failure` لفحص الخطأ وإعادة المحاولة دون سجل جزئي.
- `privacy`: قارن حساب pending بحساب second؛ الثاني لا يملك ولا يستطيع قراءة سجل الأول. صلاحيات admin والقراءة الشاملة مثبتة أيضاً في `npm run test:rules` لأن Sprint 04 لا يحتوي واجهة أدمن.

## دليل Emulator المنفذ — 2026-11-03

- **PASS — 8/8** باستخدام Java 21.0.13.0.2 وFirebase CLI 15.8.0 ومشروع demo محلي `demo-sa3erli-sprint04`.
- غُطيت: ملكية المالك، البريد الموثّق، صلاحية الأدمن، خصوصية `Bytes`، منع list للمالك، منع التكرار والسجلات الجزئية، اعتماد/رفض الأدمن، منع تعديل/حذف العميل، حد 700 KiB، ورفض القراءات/الكتابات غير المصرح بها.
- بدأ `npm run test:rules` Emulator على 8080 وأوقفه تلقائياً بنجاح. لم يُستخدم Firebase الحقيقي.
- ملاحظة Windows: يشغل السكربت القواعد عبر junction مؤقت ذي مسار ASCII لأن Firestore Emulator لا يفتح مسار المشروع العربي مباشرة، ثم يحذف الرابط في `finally`.
- **PASS — local QA smoke:** بنى `npm run qa:sprint04` التطبيق، شغّل Auth/Firestore/Hosting محلياً، أنشأ الحسابات الستة والحالات الثلاث والملفات الاصطناعية، استجاب `/add` برمز 200، ثم أوقف الخدمات تلقائياً.
- **PASS — agent-executed local QA (2026-11-03):** نفّذ `npm run qa:sprint04:auto` الحالات العشر أدناه على مشروع demo فقط. النتيجة 10/10 PASS في 44.1 ثانية. الدليل القابل للقراءة الآلية في `test-artifacts/sprint04-qa/qa-results.json` والصور في `test-artifacts/sprint04-qa/screenshots/`.
- أفاد المالك أنه نشر القواعد وإعفاء فهرسة `merchantDocuments.bytes` المراجعين إلى `mobitrade-35ee9`. هذه إفادة مسجلة فقط؛ لم يُجرَ أي اتصال حي للتحقق منها.

### 1. حماية الحساب

Status: **PASS — AGENT LOCAL QA**

Expected: غير المسجل ينتقل إلى login، وغير الموثق إلى verify-email، والمستخدم المسجل والموثق فقط يرى نموذج طلب الاعتماد.

Evidence: حسابات Auth Emulator الفعلية أعطت بالتتابع `/login?returnTo=%2Fadd` و`/verify-email?returnTo=%2Fadd` ونموذج الاعتماد. الصور `01-signed-out-gate-375.png`, `01-unverified-gate-375.png`, `01-verified-form-1280.png`.

### 2. النموذج والتحقق

Status: **PASS — AGENT LOCAL QA**

Expected: الاسم والمنطقة والعنوان والواتساب والصورة مطلوبة، والأخطاء عربية ومرتبطة بالحقول ولا تمسح القيم الصحيحة.

Evidence: ظهرت 4 حقول `aria-invalid` مع إبقاء الاسم المدخل ورسالة الصورة العربية. الصورة `02-required-errors-preserve-values-375.png`.

### 3. حدود وثيقة السجل التجاري

Status: **PASS — AGENT LOCAL QA**

Expected: يقبل JPEG/PNG/WebP أكبر من صفر وحتى 700 KiB بالضبط، ويرفض PDF والحجم 700 KiB + 1 byte. لا يظهر رابط عام ولا Base64.

Evidence: قُبلت الأنواع الثلاثة وجرى التحقق من `contentType` و`size` في `merchantDocuments`; قُبل WebP بحجم 716800 bytes ورُفض PDF و716801 bytes دون إنشاء مستندين. الصور `03-webp-exact-700k-accepted.png`, `03-over-700k-rejected-375.png`.

### 4. الحفظ الذري

Status: **PASS — AGENT LOCAL QA**

Expected: الزر يصبح disabled، وتُكتب `merchantApplications/{uid}` و`merchantDocuments/{uid}` معاً في دفعة واحدة أو لا تُكتب أي منهما. وثيقة الصورة تحتوي `Bytes` وبيانات آمنة فقط.

Evidence: الزر disabled ونص الإرسال ظاهر أثناء تأخير Emulator المحلي، ثم وُجد المستندان مع المفاتيح المسموحة فقط، وحقل الصورة `Bytes` بلا URL أو Base64. الصورة `04-atomic-pending-1280.png`.

### 5. منع التكرار والسجلات الجزئية

Status: **PASS — AGENT LOCAL QA**

Expected: وجود أي من وثيقتي UID يمنع طلباً ثانياً، ولا يمكن إنشاء application أو document منفرداً خارج الدفعة المتطابقة.

Evidence: الطلب المكرر رُفض برسالة آمنة، ومحاولتا إنشاء application-only وdocument-only رُفضتا فعلياً من Firestore Emulator ولم تتركا بيانات للمالك الثاني. الصورة `05-duplicate-rejected.png`.

### 6. الحالات الثلاث

Status: **PASS — AGENT LOCAL QA**

Expected: `pending / approved / rejected` تعرض واجهات واضحة، وسبب الرفض يظهر إن وجد، والقيم مصدرها Firestore وليست localStorage.

Evidence: عرضت الحسابات المزروعة الحالات الثلاث وسبب الرفض، وأعاد استعلام admin الفعلي القيم `approved/pending/rejected`. الصور `06-pending-375.png`, `06-approved-375.png`, `06-rejected-375.png`.

### 7. منع نشر الأسعار

Status: **PASS — AGENT LOCAL QA**

Expected: نموذج الأسعار غير موجود في جميع حالات Sprint 04، وقواعد `liveOffers` و`submissions` ترفض غير المستخدم الموثق صاحب الطلب `approved`.

Evidence: لم يظهر نموذج السعر في الحالات الثلاث، ورفض Firestore Emulator كتابة pending إلى `liveOffers` و`submissions`.

### 8. الخصوصية والتفويض

Status: **PASS — AGENT LOCAL QA**

Expected: المالك الموثق يقرأ وثيقتيه فقط ولا يستطيع list؛ مستخدم آخر أو مجهول لا يقرأهما؛ `admin: true` فقط يستطيع list/read الكل وتغيير pending إلى approved/rejected. العميل لا يستطيع تغيير الحالة أو الملف.

Evidence: قرأ المالك مستنديه، ورُفض list وقراءة المالك الثاني والمجهول وتعديل الحالة/الوثيقة. قرأ admin ثلاث applications وثلاث documents عبر claim حقيقي من Auth Emulator.

### 9. الفشل والتعافي

Status: **PASS — AGENT LOCAL QA**

Expected: فشل القراءة يعرض error+retry، وفشل تجهيز الصورة أو commit لا يمنح موافقة ولا يترك سجلاً جزئياً ولا يمسح الحقول.

Evidence: تعافى Retry من فشل القراءة، وحافظ فشلا تجهيز الصورة والكتابة على الحقول، ولم يوجد أي application/document للمالك الثاني. الصور `09-read-failure-375.png`, `09-document-failure-375.png`, `09-write-failure-375.png`.

### 10. RTL والوصول والاستجابة

Status: **PASS — AGENT LOCAL QA**

Expected: عند 375×812 و1280×800 لا يوجد overflow، وTab/focus/labels/status/alerts صالحة، ولا يوجد رابط عام للوثيقة.

Evidence: `dir=rtl`, خمسة labels، focus بلوحة المفاتيح، خمسة alerts، لا overflow عند العرضين ولا رابط وثيقة عام. الصور `10-accessibility-375.png`, `10-accessibility-1280.png`.

| النتيجة | العدد |
|---|---:|
| PASS — AGENT LOCAL QA | 10 |
| FAIL | 0 |
| BLOCKED | 0 |

أغلق المالك Sprint 04 بعد مراجعة التدفق الرئيسي والواجهة والسلوك يدوياً. النتيجة النهائية: Agent local QA ‏10/10 PASS، و0 FAIL، و0 BLOCKED، مع موافقة المالك بتاريخ 2026-11-03. التخزين الحالي للوثيقة كـFirestore `Bytes` مؤقت، ويبقى نقله إلى object storage خاص وآمن ضمن TODO الإنتاج، دون اختيار مزود في هذا السبرنت.
