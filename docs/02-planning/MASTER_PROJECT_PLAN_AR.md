# الخطة الرئيسية الشاملة لمشروع «سعّرلي»

> **اتجاه العرض المستهدف:** `RTL`
>
> **الحالة:** **APPROVED — OWNER APPROVED**

## 1. ضبط الوثيقة والمصادر المرجعية

| البند | القيمة |
|---|---|
| معرّف الوثيقة | `DOC-PLAN-AR-001` |
| الإصدار | `1.0-approved` |
| التاريخ | 2026-11-07 |
| تاريخ الاعتماد | 2026-11-07 |
| المالك | مالك منتج «سعّرلي» |
| خط الأساس التنفيذي | `41a94003b9c921aec9ba1c9709a5cf5430d4bad7` |
| آخر Sprint مغلق | Sprint 06 — **CLOSED — OWNER APPROVED** بتاريخ 2026-11-05 |
| حالة الخطة | **APPROVED — OWNER APPROVED** |
| اللغة | العربية، مع إبقاء المعرّفات التقنية بالإنجليزية عند الحاجة |

### سجل الإصدارات

| الإصدار | التاريخ | الوصف |
|---|---|---|
| `0.1-draft` | 2026-11-07 | مسودة الخطة الرئيسية الشاملة للمراجعة. |
| `1.0-approved` | 2026-11-07 | اعتماد المالك للخطة ونطاق Sprint 07–11 والمخاطر والقرارات المفتوحة كما هي موثقة. |

> **إشعار الاعتماد:** اعتمد المالك هذه الخطة بتاريخ 2026-11-07 بوصفها خط التخطيط المعتمد لإنشاء SRS v2 وتسليم Sprint 07–11. لا يحسم الاعتماد القرارات المفتوحة، ولا يفوض النشر أو معالجة وثائق تجارية حقيقية قبل اجتياز بوابات الإنتاج والمراجعات المطلوبة.

### 1.1 ترتيب مصادر الحقيقة

1. خط الأساس التنفيذي المحدد أعلاه لما هو **IMPLEMENTED**.
2. [FUNCTIONAL_SCENARIO_AR.md](../01-product/scenarios/FUNCTIONAL_SCENARIO_AR.md) بالإصدار `1.0-approved` للسيناريوهات والقرارات `DEC-001` إلى `DEC-011`، ومعه [SA3ERLI_FUNCTIONAL_SCENARIO_AR_APPROVED.pdf](../01-product/scenarios/SA3ERLI_FUNCTIONAL_SCENARIO_AR_APPROVED.pdf) بالإصدار نفسه والمعتمد بتاريخ 2026-11-07.
3. [SA3ERLI_SRS_V2_AR.md](../01-product/requirements/SA3ERLI_SRS_V2_AR.md) بالإصدار `2.0-approved` والمعتمد بتاريخ 2026-11-07، ومعه [SA3ERLI_SRS_V2_AR_APPROVED.pdf](../01-product/requirements/SA3ERLI_SRS_V2_AR_APPROVED.pdf)؛ وهو خط أساس المتطلبات لـSprint 07–11.
4. تقارير وقوائم QA المغلقة في `docs/sprints/` و`tests/sprints/` بوصفها أدلة تاريخية لا يعاد تفسير نتائجها.
5. `Sa3erli_SRS_AR.pdf` بوصفه SRS تاريخياً بالإصدار v1.0 لا يعدل ضمن هذه الخطة.
6. الكود عند التعارض مع وصف قديم، على أن يسجل الفرق ولا يحول السلوك الجزئي إلى مكتمل.

التغيير المحلي غير المثبت في `tests/e2e/ui.spec.ts` مستبعد من الأدلة، ولا تحسم هذه الخطة التحقيق المستقل المرتبط به. أصبح SRS v2 ونسختا PDF المعتمدتان جزءاً من baseline التوثيق قبل Sprint 07؛ ولا يفوض ذلك التنفيذ أو النشر، ويبقى SRS v1.0 التاريخي بلا تعديل.

### 1.2 دلالات الحالة

| الحالة | معناها في هذه الخطة |
|---|---|
| `IMPLEMENTED` | مثبت في خط الأساس أو في Sprint مغلق. |
| `PARTIAL` | جزء منفذ وجزء آخر معتمد لكنه غير منفذ أو غير محسوم التحقق. |
| `PLANNED` | معتمد للتسليم في Sprint لاحق ولم ينفذ بعد. |
| `UNKNOWN` | يحتاج قرار مالك أو مراجعة قانونية/تشغيلية ولا يجوز افتراضه. |
| `DEFERRED` | بوابة إنتاج أو تحقق مؤجل عمداً إلى مرحلة محددة. |

## 2. رؤية المنتج والنطاق والاستبعادات

### 2.1 الرؤية

«سعّرلي» منصة عربية `RTL` لمقارنة أسعار أجهزة الموبايل بين محلات مدينة اللاذقية. تساعد الزائر على إيجاد عرض مناسب دون خلط العملات، وتؤسس مساراً موثوقاً لاعتماد أصحاب المحلات وإدارة المحل والعروض عبر Backend موثوق.

### 2.2 النطاق المعتمد

- **الجغرافيا:** مدينة اللاذقية في الإصدار الأول.
- **الفئة:** أجهزة الموبايل فقط.
- **المستخدمون:** زائر، مستخدم مسجل، مقدم طلب موثق البريد، تاجر معتمد، تاجر معلّق، وأدمن.
- **العملات:** `USD` و`SYP` مع منع المقارنة الرقمية العابرة للعملات.
- **مصدر الأسعار الحالي:** بيانات ثابتة وعروض `liveOffers` عامة؛ ملكية CRUD التاجر الكاملة مخططة في Sprint 09.

### 2.3 خارج النطاق الحالي

- البيع والدفع والتوصيل داخل المنصة.
- تطبيق Native أو دعم مدن وفئات منتجات إضافية.
- تحقق حكومي آلي من السجل التجاري.
- اختيار مزود Object Storage أو استضافة أو نطاق أو backup نهائي قبل قرار المالك.
- لوحة الأدمن وبوابة التاجر بوصفهما منجزتين؛ كلاهما عمل لاحق.

## 3. خط الأساس المنفذ حتى Sprint 06

### 3.1 الواجهة العامة — `IMPLEMENTED/PARTIAL`

- Next.js App Router بتصدير ثابت، وصفحات `/` و`/product?id=…` و`/shop?id=…` و`/compare` وصفحات المصادقة والحساب و`/add`.
- كتالوج ثابت يندمج في المتصفح مع `liveOffers`؛ عند الفشل تبقى البيانات الثابتة.
- بحث وفلاتر حالة/شركة/عملة وترتيب، مع تفعيل ترتيب السعر بعد اختيار عملة واحدة.
- أرخص سعر لكل حالة وعملة، عد محلات فريد، تاريخ تحديث، ووسم stale بعد سبعة أيام.
- صور ومواصفات ومقارنة جهازين، fallback للمنتجات الحية غير المعروفة، وWhatsApp.
- `RTL`، استجابة، أساسيات وصول وSEO و404. ترتيب حالة المنتج الحي المجهول ما زال **PARTIAL** ريثما ينتهي التحقيق المستقل.

### 3.2 المصادقة والحساب — `IMPLEMENTED`

- Firebase Authentication للبريد/كلمة المرور وGoogle، تحقق البريد، إعادة الإرسال، reset، استعادة الجلسة والخروج.
- `AuthProvider` وحماية `returnTo` من التحويل الخارجي، وصفحات `/login` و`/register` و`/forgot-password` و`/verify-email` و`/account`.
- غياب إعداد Firebase يعرض حالة غير متاحة آمنة ولا يكسر التصدير الثابت.

### 3.3 طلب اعتماد المحل — `IMPLEMENTED/PARTIAL`

- `/add` يفرض الدخول والبريد الموثق، ثم يعرض مسار طلب الاعتماد الحالي.
- Frontend يرسل multipart إلى Backend باستخدام Firebase ID token ويستعيد الحالة عبر API.
- تحقق JPEG/PNG/WebP بالتوقيع الحقيقي وحجم 1–700 KiB شامل، وWhatsApp سوري.
- نموذج البيانات الحالي لا يجمع بعد كل حقول `DEC-004`؛ لذلك اكتمال العقد **PARTIAL**.
- الحالات المنفذة: `pending` و`approved` و`rejected`. حالة `needs_changes` غير منفذة.

### 3.4 Backend وبيانات الأعمال — `IMPLEMENTED`

- NestJS API بإصدار `/api/v1`، health/readiness، OpenAPI، Helmet، CORS allowlist، rate/request limits، correlation IDs، redaction، error envelope وإغلاق منظم.
- Firebase Admin يتحقق من ID token، مع guards للبريد الموثق و`admin: true`.
- APIs إنشاء الطلب وحالة المالك، وقائمة/تفاصيل/وثيقة/قرار الأدمن.
- metadata في `merchantApplications/{uid}` وbytes خاصة في `merchantDocuments/{uid}`، وإنشاء ذري يمنع السجل الجزئي.
- قرارات `approve/reject` pending-only مع optimistic concurrency وسبب رفض وAudit أساسي.
- قواعد العميل تمنع القراءة/الكتابة المباشرة لبيانات طلبات التجار، مع بقاء صلاحيات الكتالوج والعروض الحالية كما راجعها Sprint 06.

### 3.5 غير المنفذ بعد

- Admin UI، `needs_changes` وإعادة الإرسال، إنشاء Shop وmerchant claim، وإعادة التقديم المرتبطة.
- Merchant dashboard وملكية CRUD للعروض والإخفاء/الإعادة/Soft Delete والتأكيد الدوري.
- Object Storage الخاص، حذف الوثيقة بعد 48 ساعة، scheduled jobs الإنتاجية، والاستضافة/النطاق/backup/DR.
- اختبار نسخة منشورة أو هاتف سوري على بيانات موبايل، واعتماد قانوني وسياسات خصوصية/شروط نهائية.

## 4. المعمارية الهدفية الكاملة

### 4.1 Next.js Frontend

- يبقى تطبيقاً عربياً `RTL` بتصدير ثابت؛ كل البيانات الديناميكية تأتي من APIs أو القراءات العامة المسموحة.
- لا يثق Backend بأي دور أو `uid` أو قرار أو ملكية يرسلها العميل دون اشتقاقها من التوكن والبيانات الموثوقة.
- `CatalogProvider` مسؤول عن دمج الكتالوج العام، و`AuthProvider` عن حالة الجلسة، وتضاف واجهات الأدمن والتاجر كعملاء لـAPI لا كعملاء مباشرِين لبيانات الأعمال الخاصة.

### 4.2 NestJS Backend

- يبقى الحد الموثوق تحت `/api/v1`، ويطبق التحقق والتفويض والتحقق من DTO والملفات والتزامن والـAudit.
- تتوسع modules الحالية تدريجياً لطلبات الاعتماد، المحلات، claims، العروض، notifications والمهام المجدولة.
- يمنع أي business mutation حساسة من المسار المباشر للمتصفح إلى Firestore.

### 4.3 Firebase Authentication

- يبقى مزود الهوية. يتحقق Backend من Firebase ID token عبر Admin SDK/ADC.
- claims مثل `admin: true` وmerchant claim لا يمنحها العميل؛ تحديث merchant claim مخطط كعملية Backend موثوقة في Sprint 08 مع refresh للجلسة.

### 4.4 Firestore

- يخزن metadata وحالات الأعمال والملكية والـAudit والإشعارات اللازمة.
- تبقى القراءات العامة محصورة في البيانات المقصودة للنشر، وتمنع قواعد العميل الوصول إلى الأعمال الخاصة.
- تستخدم transactions/batches عند الحاجة لمنع الحالة الجزئية والتعارض.

### 4.5 Private Object Storage قبل الإنتاج

- Firestore `Bytes` حل تطوير فقط ويحظر للوثائق التجارية الحقيقية.
- قبل الإنتاج، يرفع Backend الوثيقة إلى Object Storage خاص ويقدم تنزيلها المصرح دون رابط عام دائم، بينما يحتفظ Firestore بالـmetadata.
- المزود والبنية ومفاتيح التشفير وسياسة backup قرارات مفتوحة؛ لا تعتمد هذه الخطة مزوداً بعينه.

### 4.6 المهام المجدولة

- حذف الوثائق بعد 48 ساعة من trigger المعتمد، retries وتنبيه عند الفشل.
- صيانة retention والتنبيهات أو فحوص الاتساق التي تعتمد لاحقاً.
- تعمل بهوية خدمة موثوقة وبصلاحية أقل ما يمكن، مع idempotency وAudit/metrics.

### 4.7 حدود النشر والتشغيل

- Frontend مستضاف كمخرجات ثابتة، وBackend خدمة مستقلة HTTPS، وFirebase Auth/Firestore خدمات مُدارة.
- staging وproduction منفصلان في الإعدادات والبيانات والـallowlists والهوية.
- لا يثبت host أو domain أو provider في الوثيقة قبل قرار المالك والتحقق التشغيلي.

## 5. مسارات عمل الواجهة الأمامية

### 5.1 الكتالوج العام

- الحفاظ على الدمج static/live، وfallback الآمن، والروابط `?id=` والصور المحلية والمواصفات.
- توثيق وحسم ترتيب loading/not-found للمعرف الحي المجهول دون اعتماد التغيير المحلي المستبعد. يلزم قبل Sprint 07 adapter حتمي لـ`CatalogProvider`/الاختبار يغطي: وجود منتج static، ومعرف live مجهول أثناء التحميل، ونجاح live متأخر، وفشل live. الترتيب المقبول هو loading أولاً، وعدم عرض 404 أثناء التحميل، ثم المنتج أو not-found بعد اكتمال التحميل فقط، ومنع عرض منتج static غير صحيح.

### 5.2 البحث والفلاتر والترتيب والعملات والقدم

- تعمل المعايير معاً وتستبعد المنتجات بلا عرض مطابق.
- لا يفعّل ترتيب السعر إلا مع عملة واحدة، ولا تقارن `USD` و`SYP`.
- تعرض البطاقات تاريخ العرض المختار وتحذير stale عند سبعة أيام تقويمية على الأقل.

### 5.3 المنتج والمحل والمقارنة وWhatsApp

- صفحات query-string قابلة للتصدير الثابت، حالات loading/empty/error/not-found، ومجموعات حالة/عملة.
- مقارنة جهازين فريدين مع مواصفات وصور/fallback وأسعار أدنى منفصلة بالعملة.
- روابط WhatsApp تستخدم الرقم السوري المطبّع ولا تعني بيعاً داخل المنصة.

### 5.4 المصادقة والحساب

- الحفاظ على التسجيل/الدخول/الخروج/reset/verification/Google واستعادة الجلسة.
- رسائل عربية آمنة، return path داخلي فقط، وحالة واضحة عند غياب الإعداد.
- إضافة انعكاس claim/session refresh في Sprint 08 دون كسر تدفقات Sprint 03.

### 5.5 طلب اعتماد التاجر

- استكمال حقول `DEC-004` والإقرار، دون صورة واجهة محل.
- دعم `needs_changes` وتعديل مسموح وإعادة إرسال، وإعادة تقديم مرتبطة بعد رفض بإذن أدمن فقط.
- الحفاظ على رفع خاص، حالات انتظار/فشل/retry، ومنع التكرار والسجل الجزئي.

### 5.6 لوحة الأدمن

- **PLANNED Sprint 07:** layout محمي، summary، قائمة، status filter، pagination، تفاصيل، تنزيل خاص، approve/reject، conflict/retry، empty/loading/error/forbidden.
- لا تنفذ منطق أعمال في الواجهة ولا تقرأ مجموعات التاجر مباشرة.

### 5.7 بوابة التاجر

- **PLANNED Sprint 09:** ملخص المحل والعروض، ملف المحل، إنشاء/تعديل/إخفاء/إعادة/Soft Delete، وتأكيد السعر.
- تحترم `approved/suspended` والملكية وتظهر feedback وتعارضات النسخة بوضوح.

### 5.8 ملف المحل وإدارة العروض

- تعديل المنطقة والعنوان مباشرة، وتغيير WhatsApp السوري مع confirmation وAudit.
- تغييرات الاسم/السجل/المالك تحتاج مراجعة إدارية؛ `ownerUid` غير قابل للتحرير.
- العروض hidden/deleted لا تظهر للعامة ولا تدخل حساب الأرخص.

### 5.9 الجودة الشاملة للواجهة

- الحفاظ على `RTL` و320/375/768/1024/1280، tap targets، keyboard/focus، reduced motion، semantic landmarks وARIA عند الحاجة.
- منع overflow/clipping/layout shift وتشوه الصور، وتوفير loading/empty/error/recovery لكل تدفق.
- metadata عربية؛ canonical/sitemap ينتظران domain صحيحاً في Sprint 11.

## 6. مسارات عمل Backend

### 6.1 المصادقة وحراس التفويض

- Firebase bearer guard، verified-email guard، admin guard، ثم merchant/ownership/suspension guards مخططة.
- اشتقاق actor من التوكن الموثق لا من body، والتحقق المستمر من حالة Shop للعمليات الحساسة.

### 6.2 APIs طلب الاعتماد

- الحفاظ على create/me الموثوقين، وتوسيع DTO للحقول المطلوبة دون كسر migration.
- منع duplicate/partial records وتوفير version/ETag أو عقد optimistic concurrency معتمد.

### 6.3 APIs مراجعة الأدمن

- القائمة بالـ`status/limit/pageToken` والتفاصيل والوثيقة وقرار approve/reject موجودة.
- يضاف `needs_changes`، وإذن reapplication، وعمليات suspension/reactivation في Sprint 08 بعقود موثقة.

### 6.4 `needs_changes` وإعادة الإرسال

- قرار الأدمن يحدد سبباً وحقولاً مطلوبة، يثبت transition وAudit، ويبدأ عد حذف الوثيقة القديمة.
- يسمح للمالك بتعديل الدورة المسموحة فقط ورفع وثيقة جديدة ثم يعيدها إلى `pending` ذرياً.

### 6.5 إنشاء Shop وmerchant claim

- لا يمكن لـFirebase Auth custom claims وFirestore المشاركة في transaction واحدة. لذلك يدخل الاعتماد حالة provisioning موثوقة ومغلقة افتراضياً، وتبقى عمليات التاجر ممنوعة حتى يتحقق Backend من اكتمال Shop وربط `ownerUid` وصلاحية merchant معاً.
- ينفذ Backend workflow idempotent لإنشاء Shop ومنح claim وكتابة Audit، مع retry وcompensation وreconciliation لكل خطوة. لا يعد stale claim وحده تفويضاً؛ يتحقق Backend في كل عملية تاجر من ملكية Shop الحالية وحالة التعليق.
- يسجل provisioning غير المكتمل بوضوح ويعاد إصلاحه أو تعويضه. يجب اختبار الفشل بعد كل خطوة بين Firestore وAuth وAudit، بدلاً من الادعاء بذرية مستحيلة عبر الخدمتين.

### 6.6 إدارة المحل

- APIs قراءة/تعديل محكومة بالملكية والحالة؛ WhatsApp normalization وconfirmation token/intent حسب التصميم النهائي.
- الاسم/السجل/المالك لا تتغير بمسار merchant المباشر.

### 6.7 ملكية العروض وCRUD

- كل عرض مستقبلي يرتبط بـ`shopId` وملكية مشتقة من Shop؛ لا يقبل owner id من العميل كسلطة.
- create/update/get/list بعقود strict وحماية currency/condition/product identity والتزامن.

### 6.8 hide/reactivate/Soft Delete

- انتقالات صريحة، pending conflicts آمنة، Audit لكل فعل، واستبعاد فوري من القراءة العامة.
- لا يعاد نشر `deleted` من بوابة التاجر؛ مدة الحذف الفيزيائي قرار Sprint 10.

### 6.9 دورة السبعة أيام

- edit أو reconfirm للسعر نفسه يحدث `updatedAt` الموثوق ويعيد دورة 7 أيام.
- stale لا يحذف العرض ولا يخلط العملات؛ notifications اختيارية وفق القناة المعتمدة.

### 6.10 الإشعارات

- إشعارات داخلية للحالة و`needs_changes` والقرار والتعليق والسعر القديم إذا اعتمدت القناة.
- القناة والاحتفاظ والتسليم قرارات مفتوحة؛ لا يفترض بريد/SMS/Push.

### 6.11 Audit

- actor، action، target، timestamp، correlationId، transition/version، والقيم الحساسة المختصرة أو المردودة حسب السياسة.
- يحظر تخزين tokens أو bytes أو بيانات غير لازمة، ويحدد retention بعد مراجعة قانونية.

### 6.12 حذف الوثيقة المجدول

- triggers: `approved/rejected` للوثيقة الحالية و`needs_changes` للوثيقة القديمة؛ موعد بعد 48 ساعة.
- job idempotent، يسجل النجاح والفشل، يعيد المحاولة وفق سياسة لاحقة وينبه الأدمن دون تمديد خفي.

### 6.13 الضوابط العرضية

- DTO validation، file signature/size، pagination مستقرة، optimistic concurrency، transactions/batches، correlation IDs، redaction، endpoint rate limits وOpenAPI متزامن مع التنفيذ.
- error envelopes عربية آمنة ولا تكشف stack أو provider internals أو وجود حساب غير مصرح بكشفه.

## 7. معمارية البيانات

### 7.1 البيانات والمجموعات الحالية

| المصدر/المجموعة | الحالة | الغرض والحدود |
|---|---|---|
| `data/products.ts` و`data/catalog.ts` | `IMPLEMENTED` | كتالوج ومحلات/عروض أساسية ضمن البناء. |
| `liveOffers` | `IMPLEMENTED` | عروض حية عامة القراءة؛ عقد الكتابة الحالي سابق لبوابة التاجر الجديدة ويعاد تصميم ملكيته في Sprint 09. |
| `submissions` | `IMPLEMENTED/LEGACY` | سجل إرسال تاريخي لمسار الأسعار السابق؛ لا يستخدم كسلطة لاعتماد التاجر. |
| `merchantApplications/{uid}` | `IMPLEMENTED` | metadata وحالة دورة الطلب الحالية في عقد Sprint 06. |
| `merchantDocuments/{uid}` | `IMPLEMENTED/DEVELOPMENT-ONLY` | `Bytes` خاصة مؤقتة وmetadata ملف؛ ممنوعة للوثائق الحقيقية في الإنتاج. |
| `merchantApplicationAudits` | `IMPLEMENTED` | Audit أساسي لقرارات Sprint 06. |
| Firebase Auth users/claims | `IMPLEMENTED/PARTIAL` | الهوية وadmin claim مستخدمان؛ merchant claim مخطط. |

### 7.2 كيانات مخططة — الأسماء النهائية غير مجمدة

| الكيان | الملكية/المفتاح المقترح مفاهيمياً | الحالة |
|---|---|---|
| Application cycle/link | applicant `uid` مع cycle id وprevious id | `PLANNED` Sprint 08؛ يلزم قرار نموذج. |
| Shop | `shopId` و`ownerUid` ثابت | `PLANNED` Sprint 08. |
| Merchant offer | `offerId` و`shopId` وproduct identity | `PLANNED` Sprint 09. |
| Notification | recipient `uid` وtype/read state | `PLANNED` Sprint 08؛ القناة/الاحتفاظ مفتوحان. |
| Expanded audit | actor/target/action/correlation/version | `PLANNED` Sprint 08–10. |
| Document metadata | application cycle/storage key/deletion due/status | `PLANNED` Sprint 10 مع Object Storage. |
| Scheduled-job record/dead letter | job id/target/due/attempt/status | `PLANNED` Sprint 10؛ التصميم مفتوح. |

### 7.3 حقول الملكية والثقة

- `ownerUid` على Shop يكتبه Backend ولا يعدله التاجر.
- ملكية العرض تستنتج من `shopId → ownerUid`، ولا تعتمد على `uid` مرسل في body.
- application actor من ID token؛ admin actor من claim موثوق.
- scheduled jobs تستخدم service identity موثوقة ومحدودة.

### 7.4 انتقالات الحالة

- Application: `pending → approved`، `pending → needs_changes → pending`، `pending → rejected`.
- Reapplication بعد `rejected`: دورة جديدة مرتبطة، بعد إذن أدمن، دون تعديل التاريخ المرفوض.
- Shop: `active ↔ suspended`؛ الأثر النهائي على العروض قرار مفتوح.
- Offer: `active ↔ hidden` و`active/hidden → deleted`؛ `deleted` نهائي للتاجر.
- Document: available → deletion scheduled → deleted، مع failed/retry state تشغيلي.

### 7.5 الفهارس

- الفهرس الحالي لقائمة طلبات الأدمن يدعم status/time pagination، مع exemption لحقل bytes الحالي.
- فهارس Shop/offer/notification/audit تحدد من queries النهائية وتختبر في Emulator قبل النشر.
- لا تنشأ فهارس تجمع PII غير لازمة، ولا يعتمد query إنتاجي قبل نشر فهرسه والتحقق منه.

### 7.6 العمليات الذرية والتزامن

- application/document ينشآن معاً في batch؛ decision/audit/version تحدث معاً.
- Shop/claim لا يمكن جعلهما transaction واحدة عبر Auth وFirestore؛ يستخدمان provisioning fail-closed وworkflow idempotent مع retry وcompensation وreconciliation وAudit. لا يسمح بعمليات merchant قبل تحقق Backend من Shop والملكية والحالة والصلاحية معاً، وتختبر نقطة فشل بعد كل خطوة.
- offer mutations تستخدم version/precondition لمنع lost update عند اعتماد العقد.

### 7.7 الاحتفاظ بالـmetadata

- bytes تحذف وفق 48 ساعة بعد trigger؛ metadata/Audit المحدودان قد يبقيان حسب سياسة قانونية لم تعتمد مدتها.
- مدة Soft Delete والحساب والإشعارات والـAudit مفتوحة ولا تفترضها هذه الخطة.

### 7.8 ترحيل Firestore Bytes

1. اعتماد provider وthreat model وسياسة access/retention/backup.
2. إضافة Backend abstraction وprivate keys/paths دون public URL.
3. ترحيل fixtures فقط أولاً والتحقق من authorization/deletion.
4. منع writes الجديدة إلى Bytes، ثم ترحيل البيانات المؤهلة إن وجدت.
5. حذف bytes القديمة بعد verify ومراجعة audit؛ تحديث rules/index exemption لاحقاً.

## 8. الأدوار والصلاحيات

| الدور | القراءة | الكتابة/الأفعال |
|---|---|---|
| الزائر | الكتالوج والعروض العامة | بحث/فلترة/مقارنة محلية فقط. |
| المستخدم المسجل | العام وحسابه | تدفقات الحساب؛ لا طلب اعتماد قبل توثيق البريد. |
| مقدم طلب موثق | العام وطلبه عبر API | إنشاء طلب واحد ومتابعته؛ التعديل فقط عند `needs_changes` لاحقاً. |
| التاجر المعتمد | العام وحسابه/محله/عروضه | بعد Sprint 08–09 يدير محله وعروضه ضمن الملكية. |
| التاجر المعلّق | قراءة مسموحة وفق السياسة | تمنع الكتابة الحساسة فوراً؛ أثر العرض العام قرار مفتوح. |
| الأدمن | الطلبات والوثائق الخاصة اللازمة عبر API | قرارات ومراجعة وتعليق وإذن reapplication ضمن guards وAudit. |
| Backend | حسب service identity | السلطة الموثوقة للعقود والـclaims والملكية والعمليات الذرية. |
| scheduled jobs | targets المستحقة فقط | حذف/صيانة محددة idempotently مع Audit وتنبيه. |

لا تمنح واجهة العميل أي claim، ولا تتجاوز Backend للوصول إلى بيانات الأعمال الخاصة.

## 9. الأمن والخصوصية

### 9.1 حدود الثقة والهوية

- المتصفح غير موثوق؛ Firebase Auth يثبت الهوية، وBackend يتحقق من ID token وemail verification وclaims.
- ADC/service identity فقط في الإنتاج؛ يمنع استخدام `NEXT_PUBLIC_*` كاعتماد خادم أو حفظ ملف JSON لمفتاح حساب خدمة في Git.

### 9.2 التفويض والوصول المباشر

- owner/admin/merchant guards على Backend، وفحص ownership/status عند كل mutation.
- قواعد Firestore تمنع direct client access إلى applications/documents/audits، ولا توسع صلاحيات catalog/live offers دون مراجعة مستقلة.

### 9.3 الشبكة والمدخلات والملفات

- CORS allowlist محددة لكل بيئة، HTTPS في staging/production، body/upload/rate limits.
- DTO strict normalization، Syrian WhatsApp، file signatures لا MIME/extension فقط، وحد 1–700 KiB.
- لا public URL للوثيقة ولا bytes في list/detail JSON؛ التنزيل الإداري `no-store`.

### 9.4 السجلات والخصوصية

- redaction للتوكن والبريد/الهاتف/الوثائق والـbytes حسب الحاجة؛ correlation ID بديل للتشخيص الآمن.
- Audit للأفعال الحساسة دون تخزين السر أو الملف نفسه.
- أقل جمع ممكن: لا هوية شخصية/منزل/مصرف؛ لا صورة واجهة في طلب الاعتماد.

### 9.5 حذف الوثائق والمراجعة القانونية

- حذف bytes نهائياً بعد 48 ساعة من `approved/rejected`، والوثيقة القديمة بعد `needs_changes`، مع alert/retry عند الفشل.
- المدة والسياسة معتمدتان وظيفياً لكن التنفيذ والمراجعة القانونية بوابتان قبل بيانات حقيقية.
- سياسة حذف الحساب والـmetadata/Audit وSoft Delete لا تزال مفتوحة.

### 9.6 فصل الأسرار والبيئات

- local/emulator يستخدم demo project وfixtures وهمية فقط.
- staging وproduction يستخدمان مشاريع/credentials/allowlists منفصلة، مع secret manager يختار لاحقاً.
- لا أسرار في Git أو logs أو screenshots أو docs.

## 10. استراتيجية الاختبار وQA

| المستوى | النطاق |
|---|---|
| Unit | validation، normalization، state machines، authorization helpers، date/currency logic، redaction. |
| Integration | controller/service/repository والعقود والتزامن والفشل والتعافي. |
| Firestore Rules | direct-client allow/deny، الملكية، القراءات العامة وعدم توسيع الوصول. |
| Auth/Firestore Emulator | claims وهمية، transitions، atomicity، scheduled-job fixtures دون اتصال حي. |
| Integrated E2E | Frontend + Backend + emulators، session refresh، owner/admin/merchant flows. |
| Playwright regression | العام والمصادقة والمقارنة/media وSprint 01–06 وواجهات 07–11 غير الحية. |
| Owner manual QA | checklist مرقم وأدلة PASS/FAIL/BLOCKED قبل إغلاق كل Sprint. |
| Accessibility | keyboard-only، focus، semantics، alerts/status، reduced motion وscreen-reader review. |
| Responsive | 320، 375، 768، 1024، 1280 مع overflow/layout shift/long Arabic-English. |
| Physical Syrian test | هاتف فعلي وبيانات موبايل سورية دون VPN؛ `DEFERRED` إلى Sprint 11. |
| Production-like | staging/deployed HTTPS، CORS/domain/canonical/sitemap/object storage/jobs؛ `DEFERRED`. |
| Security/recovery | authz matrix، malicious upload، rate/body limits، replay/concurrency، backup/restore/rollback/incident drills. |

كل runner محلي يجب أن يثبت demo/loopback isolation ويوقف العمليات والمنافذ. لا تستخدم QA accounts أو وثائق حقيقية.

## 11. البيئات والتشغيل

### 11.1 Local development

- Frontend/Backend منفصلان مع `.env.local`/backend env غير الملتزمين، ولا اتصال حي ضمن الاختبارات الآلية.
- الأوامر الحالية تبقى مرجع Sprint المقابل؛ أي orchestration جديد يوثق ويختبر clean shutdown.

### 11.2 Emulator QA

- Firebase Auth وFirestore emulators بمشروع `demo-*` وdummy users/data.
- seed/reset/reseed deterministic، مع منع host/project غير loopback في scripts.

### 11.3 Staging

- **PLANNED:** مشروع وبيانات غير إنتاجية، Backend HTTPS، static Frontend، private storage، exact CORS وsynthetic documents فقط.
- لا تعتمد بيئة staging أو مزودها بعد.

### 11.4 Production

- **DEFERRED:** لا production قبل اجتياز جميع بوابات القسم 19 وموافقة نشر صريحة.
- لا توجد مطالبة بأن deployment اختُبر حتى الآن.

### 11.5 Hosting والنطاق وCORS

- Frontend static hosting وBackend managed runtime محتملان لكن provider/domain مفتوحان.
- CORS allowlist exact origins، ولا wildcard مع credentials. canonical/sitemap بعد domain صحيح فقط.

### 11.6 Observability

- structured logs redacted، correlation IDs، health/readiness، metrics/alerts للخطأ والكمون والحذف الفاشل والتعارض.
- provider، retention، dashboards وSLOs قرارات Sprint 10–11.

### 11.7 Backup وrollback وDR

- يلزم inventory وRPO/RTO وencrypted backup وrestore drill ونسخ قواعد/فهارس/config وتوافق schema.
- لا تعتمد مدة أو provider. rollback يشمل Frontend/Backend/rules/indexes/migrations مع backward compatibility.

### 11.8 الحوادث

- runbook للتصنيف والعزل والتواصل وحفظ الأدلة والتعافي والمراجعة اللاحقة.
- حوادث الوثائق الخاصة أو توسيع الصلاحيات أولوية عالية وتتطلب owner/legal escalation وفق سياسة ستعتمد.

## 12. مخرجات التوثيق

| المخرج | الحالة/الموعد |
|---|---|
| Functional Scenario MD | [FUNCTIONAL_SCENARIO_AR.md](../01-product/scenarios/FUNCTIONAL_SCENARIO_AR.md) معتمد بالإصدار `1.0-approved`. |
| Functional Scenario PDF | [SA3ERLI_FUNCTIONAL_SCENARIO_AR_APPROVED.pdf](../01-product/scenarios/SA3ERLI_FUNCTIONAL_SCENARIO_AR_APPROVED.pdf) مكتمل ومودع ومعتمد بالإصدار `1.0-approved` بتاريخ 2026-11-07. |
| SRS v1.0 التاريخي | محفوظ بلا تعديل. |
| SRS v2 MD | [SA3ERLI_SRS_V2_AR.md](../01-product/requirements/SA3ERLI_SRS_V2_AR.md) معتمد بالإصدار `2.0-approved` ويشكل خط أساس متطلبات Sprint 07–11. |
| SRS v2 PDF | [SA3ERLI_SRS_V2_AR_APPROVED.pdf](../01-product/requirements/SA3ERLI_SRS_V2_AR_APPROVED.pdf) مكتمل ومودع ومعتمد بتاريخ 2026-11-07؛ يعاد إصداره في Sprint 11 فقط إذا غيّرت تحديثات المتطلبات المعتمدة محتواه. |
| الخطة الرئيسية | هذه الوثيقة؛ `APPROVED — OWNER APPROVED` بالإصدار `1.0-approved`. |
| OpenAPI | موجود للعقود الحالية؛ يحدث مع كل endpoint جديد. |
| Architecture documentation | `PLANNED` مع context/container/deployment/trust-boundary views. |
| Data model | `PLANNED` مع entities/states/indexes/retention/migration. |
| Security/privacy | `PLANNED` مع threat model، access matrix، retention وlegal decisions. |
| Sprint tests/reports | مستمرة لكل Sprint وتحفظ نتائج السبرنتات المغلقة تاريخياً، وتحدث traceability وحالة تنفيذ متطلبات SRS v2 عند الحاجة. |
| Deployment/operations runbooks | `PLANNED` Sprint 10–11 للdeploy/rollback/backup/restore/incident/jobs. |

### 12.1 دورة حياة المتطلبات والتتبع

1. اعتمد المالك هذه الخطة الرئيسية بتاريخ 2026-11-07.
2. أُنشئ SRS v2 من السيناريو الوظيفي والخطة المعتمدين، وراجعه المالك واعتمده بتاريخ 2026-11-07 قبل Sprint 07.
3. أصبح SRS v2 المعتمد requirements baseline لـSprint 07–11، مع إبقاء SRS v1.0 التاريخي بلا تعديل.
4. يحدث كل Sprint traceability وحالة `IMPLEMENTED/PARTIAL/PLANNED/UNKNOWN` عندما يتغير التنفيذ أو يعتمد تغيير متطلب؛ لا تعاد كتابة الأدلة التاريخية.
5. يجري Sprint 11 reconciliation نهائياً بين SRS v2 والتنفيذ، ويحدث release status، ويعيد إصدار PDF فقط إذا تغيرت المتطلبات المعتمدة منذ آخر PDF.

## 13. خطة تسليم Sprint 07–11

### 13.0 بوابات الاستقرار قبل Sprint 07

- اعتماد هذه الخطة، ثم إنشاء واعتماد `SA3ERLI_SRS_V2_AR.md` بوصفه baseline المتطلبات لـSprint 07–11، وإيداع PDF السيناريو الوظيفي المعتمد في المستودع.
- حسم `tests/e2e/ui.spec.ts` بصورة مستقلة لتحديد أي من الحالات التالية مثبتة: عيب منتج يعرض not-found مبكراً أثناء live loading، أو عيب اختبار لأن حالة Firebase/loading لم تدخل أصلاً، أو اختبار غير حتمي لأن الانتقال أسرع من الرصد.
- إنشاء adapter حتمي لـ`CatalogProvider`/الاختبار يغطي static product موجوداً، وunknown live product أثناء loading، وdelayed live success، وlive failure. يجب إثبات loading أولاً، وعدم premature 404، ثم product أو not-found بعد completion فقط، وعدم عرض static product خاطئ.
- بعد التحقيق، إما يسترجع `tests/e2e/ui.spec.ts` إلى السلوك التاريخي أو يلتزم تغييره مع الدليل في change منفصل ومحدود. لا يبدأ Sprint 07 من working tree متسخ أو baseline غير مفسر.

### 13.1 Sprint 07 — لوحة الأدمن

- **الهدف:** تقديم واجهة أدمن محمية تستهلك APIs الموثوقة المسلمة في Sprint 06.
- **مهام Frontend:** route/layout محميان، summary موثوق، list، status filter، pagination، detail، private document viewer/download، approve/reject dialogs، conflict/loading/empty/error/forbidden/retry، responsive/a11y. تعرض summary حالات loading/error/empty مستقلة.
- **مهام Backend:** إضافة endpoint أدمن read-only صغير للـsummary يعيد counts معرفة بدقة؛ هذا هو الخيار المفضل في الخطة لأن list API الحالية تدعم `status/limit/pageToken` ولا تقدم totals عالمية موثوقة. إذا ألغى المالك endpoint صراحة، تزال global totals من النطاق ويسمى أي count ظاهر page-local بوضوح. لا يعاد تنفيذ APIs القرارات الأساسية.
- **البيانات/التخزين:** summary aggregation موثوقة ومتسقة مع تعريف counts المعتمد، دون bytes أو PII زائد؛ استخدام الفهرس الحالي للقائمة والتحقق من no-store وعدم تسرب bytes.
- **الأمن/الخصوصية:** admin authorization، rate limiting، أخطاء آمنة، عدم direct Firestore، منع caching للوثيقة، redaction وعدم كشف PII في summary/list أكثر من اللازم.
- **الاختبارات الآلية:** unit components، mocked API، integrated Emulator E2E، authorization، pagination، conflict، private document، summary counts حتمية وrate-limit/error contracts، responsive/a11y/regression.
- **QA اليدوي:** admin/normal/unverified/signed-out، summary/list/detail/decision، حالات summary loading/error/empty، keyboard، mobile/desktop، failure/retry، no token/bytes leak.
- **مخرجات التوثيق:** checklist/report، OpenAPI موثق لعقد summary وتعريف counts أو توثيق قرار page-local البديل، تحديث traceability/SRS v2 عند الحاجة، ودليل استخدام لوحة الأدمن.
- **التبعيات:** Sprint 06 baseline وadmin dummy claims وAPIs الحالية، اعتماد الخطة وSRS v2، إيداع PDF السيناريو، وإغلاق بوابة `ui.spec.ts` بbaseline نظيف ودليل مستقل.
- **الاستبعادات:** `needs_changes`، shop/merchant claim، reapplication، merchant dashboard، Object Storage.
- **معايير الدخول:** Sprint 06 مغلق، الخطة وSRS v2 معتمدان، PDF السيناريو مودع، بوابة الاستقرار 13.0 مغلقة وworking tree مفهوم، والعقود والفهرس وEmulator fixtures متاحة.
- **معايير الخروج:** كل واجهات الأدمن المطلوبة تعمل عبر API فقط؛ summary يستخدم endpoint موثوقاً موثقاً في OpenAPI ومختبراً حتمياً، أو تزال totals العالمية ويسمى count بأنه page-local بقرار موثق؛ الاختبارات غير الحية وOwner QA تمر، ولا توسع صلاحية، ويحدث traceability.
- **بوابات الإنتاج المؤجلة:** ADC/CORS/domain/deployed index/real document/production deployment.

### 13.2 Sprint 08 — دورة الاعتماد والهوية التجارية

- **الهدف:** إكمال lifecycle الطلب وربط الموافقة بالمحل والصلاحية بصورة متسقة.
- **مهام Frontend:** `needs_changes` fields/reason، edit/resubmit، linked reapplication، status notifications، session/claim refresh، admin controls للإذن والتعليق/الإعادة.
- **مهام Backend:** transitions، linked cycles، shop creation، merchant claim، authorization reapplication، suspend/reactivate، notifications، expanded Audit وprovisioning workflow idempotent مع retry/compensation/reconciliation.
- **البيانات/التخزين:** model للدورات والروابط، Shop/ownerUid، provisioning fail-closed state، notification/audit، document deletion due metadata؛ وثيقة جديدة لكل resubmit/reapply، وسجل قابل للتسوية لكل workflow غير مكتمل.
- **الأمن/الخصوصية:** owner/admin separation، claim mutation server-only، منع عمليات merchant حتى تحقق Shop والصلاحية معاً، عدم الثقة بـstale claim وحده، وفحص Backend لملكية Shop وحالة suspension الحالية، مع document access محدود.
- **الاختبارات الآلية:** state machine، duplicate cycles، authz، claim/session refresh، حقن فشل بعد كل خطوة في Auth/Firestore/Audit، retry/compensation/reconciliation، fail-closed merchant operations، rules وintegrated E2E.
- **QA اليدوي:** pending/needs_changes/resubmit/approve/reject/reapply، ظهور claim، suspension، notifications، recovery.
- **مخرجات التوثيق:** lifecycle/API/data/claim/provisioning/Audit updates، traceability/SRS v2 status، وSprint checklist/report.
- **التبعيات:** Sprint 07 UI وSprint 06 APIs وSRS v2 baseline، وقرار نموذج cycle/notification/provisioning/reconciliation.
- **الاستبعادات:** offer CRUD الكامل، merchant dashboard الكامل، Object Storage production migration.
- **معايير الدخول:** لوحة الأدمن مستقرة، transitions والحقول المفتوحة معتمدة، وتصميم provisioning fail-closed وretry/compensation/reconciliation reviewed مع خطة فشل لكل خطوة.
- **معايير الخروج:** لا provisioning record غير محلول؛ تنجح reconciliation لكل حالات الفشل المختبرة، وتبقى عمليات merchant ممنوعة حتى تحقق Shop والملكية والصلاحية وحالة suspension الحالية. كل transition/claim/Shop/Audit قابل للاستعادة ومغطى، وOwner QA يمر؛ لا يدعي الخروج transaction ذرية مشتركة بين Auth وFirestore.
- **بوابات الإنتاج المؤجلة:** حذف bytes الفعلي الآلي وObject Storage والمراجعة القانونية والاتصال الحقيقي.

### 13.3 Sprint 09 — بوابة التاجر وإدارة العروض

- **الهدف:** تمكين التاجر المعتمد غير المعلّق من إدارة ملف محله وعروضه المملوكة.
- **مهام Frontend:** dashboard، shop profile، WhatsApp confirmation، offer list/create/update، hide/reactivate/Soft Delete، stale/reconfirm، loading/empty/error/conflict، mobile/a11y.
- **مهام Backend:** merchant/ownership/status guards، shop APIs، offer CRUD/transitions، normalization، concurrency، seven-day reconfirm وAudit.
- **البيانات/التخزين:** final Shop/offer schema، indexes، ownership، status/version/timestamps وsoft-delete metadata؛ migration آمنة من live offers تحدد لاحقاً.
- **الأمن/الخصوصية:** منع cross-shop access، منع client ownerUid، suspension enforcement، no cross-currency comparison، audit للبيانات الحساسة.
- **الاختبارات الآلية:** ownership/authz، CRUD، currency/condition، duplicate، conflicts، hide/reactivate/delete، stale boundaries، merged public reads وregressions.
- **QA اليدوي:** تاجران ومحلان، active/suspended، تعديل profile/WhatsApp، كامل دورة العرض، public visibility والأسعار.
- **مخرجات التوثيق:** Merchant API/OpenAPI، data migration، user guide وSprint checklist/report.
- **التبعيات:** Shop وmerchant claim من Sprint 08 وقرارات schema/migration/suspension impact.
- **الاستبعادات:** physical purge النهائي، production storage/hosting، release النهائي.
- **معايير الدخول:** merchant role وShop consistency مستقران، ownership model معتمد، test fixtures جاهزة.
- **معايير الخروج:** التاجر يدير ملكه فقط، الحالات العامة متسقة فوراً، price cycle صحيح، regressions وOwner QA تمر.
- **بوابات الإنتاج المؤجلة:** provider/retention/purge/deployed mobile-network test.

### 13.4 Sprint 10 — تقوية الأمن والخصوصية والبنية الإنتاجية

- **الهدف:** إزالة الحلول التطويرية واستكمال privacy/security/operations قبل release.
- **مهام Frontend:** account deletion UX بعد اعتماد السياسة، رسائل retention/deletion، recovery states، privacy links والموافقات المطلوبة.
- **مهام Backend:** account-deletion orchestration، scheduled document deletion/retry/alerts، storage abstraction، retention jobs، security hardening وoperational endpoints اللازمة.
- **البيانات/التخزين:** ترحيل Firestore Bytes إلى private Object Storage، metadata keys، lifecycle/retention، backups، restore validation وphysical purge policies.
- **الأمن/الخصوصية:** threat model، least privilege، secret rotation، dependency/config review، legal/privacy review، log retention وincident controls.
- **الاختبارات الآلية:** malicious files، storage authz، deletion at 48h، retry/idempotency، account effects، retention/purge، backup/restore، rules/API penetration-oriented cases.
- **QA اليدوي:** private access، deletion schedule/failure alert، account policy، recovery/rollback drills في بيئة غير حية.
- **مخرجات التوثيق:** security/privacy docs، storage migration، retention matrix، backup/restore/DR/incident runbooks، checklist/report.
- **التبعيات:** قرارات provider/legal/retention/account deletion/suspension/purge، ونتائج Sprint 08–09.
- **الاستبعادات:** production release نفسه؛ لا بيانات تجارية حقيقية قبل البوابات.
- **معايير الدخول:** مزود وبنية/قانون/retention معتمدة، staging آمن متاح، data inventory مكتمل.
- **معايير الخروج:** لا Firestore Bytes إنتاجية، حذف 48h آلي ومرصود، recovery مثبت، المخاطر الحرجة مغلقة أو مقبولة رسمياً.
- **بوابات الإنتاج المؤجلة:** domain النهائي، production credentials، الاختبارات الميدانية وموافقة release في Sprint 11.

### 13.5 Sprint 11 — QA النهائي والجاهزية والإطلاق

- **الهدف:** إثبات الجاهزية الشاملة والحصول على موافقة نشر صريحة.
- **مهام Frontend:** إزالة TEST/local-only config، polish نهائي، metadata/canonical/sitemap بعد domain، privacy/terms، إصلاحات QA فقط.
- **مهام Backend:** production config validation، final OpenAPI، observability/alerts، runbooks وإصلاحات release فقط.
- **البيانات/التخزين:** migration rehearsal/final checks، index readiness، backup/restore proof، cleanup fixtures وفق خطة آمنة.
- **الأمن/الخصوصية:** production access review، secrets/ADC/CORS/TLS، legal sign-off، incident contacts وrelease checklist.
- **الاختبارات الآلية:** full unit/integration/rules/emulator/E2E/regression/security/performance/builds، مع إثبات عدم اتصال live في suites المحلية.
- **QA اليدوي:** كل viewports، accessibility، هاتف سوري فعلي وبيانات موبايل دون VPN، deployed site، SEO، recovery، admin/merchant/public journeys.
- **مخرجات التوثيق:** final test/report، reconciliation نهائي لـSRS v2 مع التنفيذ وتحديث release status، وإعادة إصدار SRS v2 PDF فقط إذا تغيرت المتطلبات المعتمدة، مع architecture/data/security وdeployment/rollback/operations وrelease notes.
- **التبعيات:** SRS v2 baseline المعتمد وسجلات traceability المحدثة من Sprint 07–10، وإغلاق 07–10، وdomain/hosting/provider/terms/privacy/legal approval وstaging production-like.
- **الاستبعادات:** ميزات جديدة غير ضرورية للإطلاق؛ تؤجل إلى backlog بعد release.
- **معايير الدخول:** لا blocker مفتوح، جميع بوابات Sprint 10 مكتملة، بيئة نشر وتجارب rollback جاهزة.
- **معايير الخروج:** كل production gates في القسم 19 مثبتة، Owner approval للنشر، rollback/incident readiness، release موثق.
- **بوابات الإنتاج المؤجلة:** لا بوابة تؤجل بعد release؛ أي غير مكتملة تمنع النشر أو تحتاج قبول خطر صريحاً ومشروعاً.

## 14. مصفوفة الربط بين السيناريوهات والخطة

| Scenario ID | التصنيف الحالي | Sprint المالك | أثر Frontend | أثر Backend | أثر البيانات/التخزين | دليل/مستوى الاختبار |
|---|---|---|---|---|---|---|
| `SCN-PUB-001` | IMPLEMENTED | 01–02؛ regression 07–11 | كتالوج وfallback | لا API خاص حالياً | static + live merge | UI/E2E regression |
| `SCN-PUB-002` | IMPLEMENTED | 01 | فلاتر/ترتيب/reset | لا أثر حالي | view model فقط | Unit + Playwright |
| `SCN-PUB-003` | IMPLEMENTED | 01؛ امتداد 09 | بطاقة سعر/قدم | reconfirm لاحقاً | updatedAt/عملة/حالة | Unit boundaries + E2E |
| `SCN-PUB-004` | IMPLEMENTED | 01–02 | product/shop/WhatsApp | قراءة عامة | shops/offers | Playwright + link checks |
| `SCN-PUB-005` | PARTIAL | تحقيق مستقل ثم 11 | loading/empty/not-found | fallback آمن | static/live failure | targeted UI + regression مخطط |
| `SCN-CMP-001` | IMPLEMENTED | سابق/01–02 | selection/tray/storage | لا أثر | localStorage دفاعي | Unit + Playwright |
| `SCN-CMP-002` | IMPLEMENTED | سابق/01–02 | comparison/spec/media | لا أثر | catalog/spec registry | Unit coverage + Playwright |
| `SCN-AUTH-001` | IMPLEMENTED | 03 | register/verify | token guard لاحقاً | Firebase Auth | Mocked E2E + manual |
| `SCN-AUTH-002` | IMPLEMENTED | 03 | login/session/logout | token verification | Firebase Auth session | Unit + mocked E2E |
| `SCN-AUTH-003` | IMPLEMENTED | 03 | generic reset UX | لا كشف حساب | Firebase Auth | Mocked E2E + manual |
| `SCN-AUTH-004` | IMPLEMENTED | 03 | Google/collision UI | token verification | provider identity | Adapter unit + mocked E2E |
| `SCN-AUTH-005` | IMPLEMENTED | 03 | guards/returnTo | bearer guards | session state | Unit sanitizer + E2E |
| `SCN-MER-001` | IMPLEMENTED | 03–06 | `/add` gates | verified guard | auth/application status | Integrated E2E |
| `SCN-MER-002` | PARTIAL | 08 | complete form/consent | DTO expansion | application metadata | Validation unit + integrated E2E |
| `SCN-MER-003` | IMPLEMENTED | 04–06؛ migrate 10 | file picker/errors | signature/size | private Bytes مؤقتاً | Boundary + authz + Emulator |
| `SCN-MER-004` | IMPLEMENTED | 06 | multipart/retry | atomic create | application + document | API/Emulator/integrated E2E |
| `SCN-MER-005` | IMPLEMENTED | 04–06 | status screens | owner status API | current application | Mocked + integrated E2E |
| `SCN-MER-006` | PLANNED | 08 | edit/resubmit | state transition | cycle/new document | State/unit/API/E2E مخطط |
| `SCN-MER-007` | PARTIAL | 08 | rejected/reapply UX | admin authorization | linked cycles/Audit | Authz/concurrency/E2E مخطط |
| `SCN-ADM-001` | PARTIAL | 07 | protected Admin UI | admin guard موجود | لا direct access | Guard/UI/E2E مخطط |
| `SCN-ADM-002` | PARTIAL | 07 | list/filter/pagination | list API موجود | index/current apps | Contract + Playwright مخطط |
| `SCN-ADM-003` | PARTIAL | 07؛ storage 10 | detail/private viewer | detail/document APIs | bytes→Object Storage | no-store/authz/E2E مخطط |
| `SCN-ADM-004` | PARTIAL | 07 | decision/conflict UX | decision/Audit موجودان | version/audit | Existing API + UI E2E مخطط |
| `SCN-ADM-005` | PLANNED | 08 و10 | needs_changes/job status | transition + scheduler | due/retry/storage | State/job/privacy tests مخطط |
| `SCN-SHP-001` | PLANNED | 08 | refreshed role/state | Shop + claim workflow | Shop/ownerUid/Audit | Failure/atomic consistency E2E |
| `SCN-SHP-002` | PLANNED | 09 | merchant profile | shop update APIs | Shop metadata/Audit | Ownership/validation/E2E |
| `SCN-SHP-003` | PLANNED | 08؛ policy 10 | suspended states | suspend/reactivate guards | Shop status/Audit | Authz/session E2E مخطط |
| `SCN-OFR-001` | PLANNED | 09 | offer list/create | owned CRUD | offer/shop indexes | Unit/API/integrated E2E |
| `SCN-OFR-002` | PLANNED | 09 | edit/conflict | ownership/version | offer metadata | Cross-owner/concurrency tests |
| `SCN-OFR-003` | PLANNED | 09؛ purge 10 | hide/reactivate/delete | transitions/Audit | status/deletedAt | State/public exclusion E2E |
| `SCN-OFR-004` | PARTIAL | 09 | stale/reconfirm | trusted updatedAt | seven-day cycle | UTC boundary + integrated E2E |
| `SCN-PRV-001` | PARTIAL | 10 | deletion status/error | scheduled deletion | Object Storage/metadata | Job/authz/retry/retention tests |
| `SCN-PRV-002` | UNKNOWN | 10 | account deletion UX | orchestration غير محسوم | cross-entity retention | Legal decision + test plan لاحق |
| `SCN-OPS-001` | PARTIAL | 07–11 | loading/error/recovery | health/errors/ops | backup/rollback/alerts | Full regression + drills + field QA |

**تغطية المصفوفة:** 34 سيناريو فريداً؛ `IMPLEMENTED 15`، `PARTIAL 10`، `PLANNED 8`، `UNKNOWN 1`.

## 15. سجل التبعيات والمخاطر

| ID | النوع | الوصف | الأثر | المعالجة/المالك المقترح |
|---|---|---|---|---|
| `DEP-01` | تبعية | Sprint 07 يعتمد عقود Sprint 06 والفهرس وadmin fixtures. | لوحة غير قابلة للاختبار دونها | تثبيت contracts وcontract tests؛ المالك التقني. |
| `DEP-02` | تبعية | Sprint 09 يعتمد Shop وmerchant claim من Sprint 08. | لا ملكية آمنة للعروض | منع بدء CRUD قبل ownership model. |
| `DEP-03` | تبعية | بدء Sprint 07 يعتمد اعتماد الخطة وSRS v2 وإغلاق تحقيق `ui.spec.ts` وإيداع PDF السيناريو المعتمد. | baseline متطلبات أو اختبارات غير مستقر | منع بدء التنفيذ حتى اكتمال بوابة 13.0 وتوثيق الأدلة. |
| `RISK-01` | أمني | claim وShop عبر نظامين بلا transaction مشتركة. | صلاحية أو سجل جزئي | idempotent saga/compensation/reconciliation واختبارات فشل. |
| `RISK-02` | خصوصية | Firestore Bytes حل تطويري. | تعرض/تكلفة/سياسة غير مناسبة | حظر بيانات حقيقية والترحيل قبل الإنتاج. |
| `RISK-03` | قانوني | retention/account deletion/legal verification غير معتمدة. | منع الإنتاج أو مخالفة | مراجعة قانونية وقرارات مكتوبة Sprint 10. |
| `RISK-04` | بيانات | migration من live offers إلى ملكية التاجر غير محددة. | ازدواج أو فقد/استيلاء | inventory، mapping، dry run، rollback واختبار. |
| `RISK-05` | وصول | أثر suspension على العروض العامة غير محسوم. | عرض بيانات غير مرغوبة أو اختفاء مفاجئ | قرار مالك قبل Sprint 08 exit. |
| `RISK-06` | تشغيل | provider/domain/backup/DR/SLOs غير مختارة. | جاهزية نشر غير مثبتة | حسم Sprint 10–11 واختبارات restore/rollback. |
| `RISK-07` | تجربة | ترتيب unknown live product قيد التحقيق وقد يكون عيب منتج أو اختباراً لا يدخل loading أو انتقالاً أسرع من الرصد. | flash/نتيجة غير حتمية وbaseline متسخ | adapter حتمي وحالات loading/success/failure، ثم revert أو commit مستقل بالدليل قبل Sprint 07. |
| `RISK-08` | خصوصية | logs/Audit قد تجمع PII أكثر من اللازم مع التوسع. | تسرب واحتفاظ زائد | schema allowlists/redaction/retention review. |
| `RISK-09` | أمن | stale token بعد suspension/claim change. | كتابة غير مصرح بها | server-side Shop status check وsession refresh؛ لا claim وحده. |
| `RISK-10` | إطلاق | لم تختبر نسخة منشورة أو شبكة سورية فعلية. | فشل ميداني | بوابة Sprint 11 إلزامية. |

## 16. القرارات المفتوحة الموروثة

1. مزود Object Storage وبنية الوصول والتشفير والـbackup.
2. مدة الحذف الفيزيائي للعروض ذات Soft Delete.
3. سياسة حذف الحساب وآثارها على Shop/offers/applications/documents/Audit.
4. أثر تعليق المحل على العروض العامة.
5. عملية التحقق القانوني من السجل والجهة المسؤولة.
6. مدد الاحتفاظ بالـmetadata وAudit والإشعارات والسجلات.
7. الاستضافة والنطاق وCORS وobservability وbackup وDR وrollback.
8. حقول البحث الإداري وحدوده.
9. نموذج application cycles والربط بعد الرفض أو `needs_changes`.
10. scheduler/alerts/retry/dead-letter لحذف الوثائق.
11. قناة notifications ومدة الاحتفاظ.
12. منع الكتابة فور suspension وتزامن claims والحالة.
13. schema/migration النهائيان لعروض التاجر و`ownerUid/shopId`.
14. production domain وcanonical/sitemap.
15. المتطلبات القانونية/التنظيمية الإضافية للوثائق التجارية.

هذه القرارات تبقى `UNKNOWN/OPEN` حتى اعتماد المالك أو المراجعة المختصة؛ لا يحول وجودها في الخطة إلى قرار.

## 17. Definition of Ready

تعد قصة أو Sprint جاهزة عندما:

- ترتبط بسيناريو/قرار معتمد، ولها scope واستبعادات ومعايير قبول قابلة للاختبار.
- حسمت القرارات التي تمنع التصميم، وحددت التبعيات والمالك والمخاطر.
- عقد API/data/state/ownership والـmigration/rollback معروف بالقدر اللازم.
- threat/privacy/legal review محدد إن كانت القصة تمس وثائق أو PII أو claims.
- fixtures وهمية وEmulator isolation وخطة unit/integration/E2E/manual جاهزة.
- لا تعتمد على secret/domain/provider غير متاح، أو تسجل ذلك بوصفه blocker لا افتراضاً.
- يؤكد baseline عدم وجود تعارض مع Sprint مغلق أو تغيير محلي مستبعد.
- قبل Sprint 07–11، يكون `SA3ERLI_SRS_V2_AR.md` معتمداً ومربوطاً بالـtraceability، وتكون بوابة الاستقرار 13.0 مغلقة.

## 18. Definition of Done

تعد الزيادة منجزة عندما:

- تحقق المعايير دون توسيع النطاق، والكود strict ومراجع ومغطى.
- تمر lint/unit/integration/rules/emulator/E2E/regressions المطلوبة بلا اتصال حي غير مصرح.
- يثبت authz/ownership/failure/concurrency/privacy وclean shutdown/ports.
- تعمل `RTL` وkeyboard/a11y وحالات loading/empty/error/recovery وviewports المطلوبة.
- يحدث OpenAPI/data/security/setup/checklist/report ولا تعاد كتابة نتائج تاريخية.
- تحدث traceability وحالة متطلبات SRS v2 عند الحاجة، دون تعديل SRS v1.0 التاريخي.
- لا أسرار أو PII أو artifacts أو TEST config غير مقصود، وdiff/status مفهوم.
- Owner manual QA موثق؛ لا يغلق Sprint دون موافقة صريحة.
- للإنتاج فقط: تمر بوابات القسم 19 وخطة rollback/monitoring.

## 19. بوابات الجاهزية للإنتاج

- [ ] اكتمال Sprint 07–10 وإغلاق blockers وقبول المخاطر المتبقية.
- [ ] اعتماد SRS v2 قبل Sprint 07، واستمرار traceability خلال Sprint 07–10، وإجراء reconciliation نهائي وتحديث release status في Sprint 11.
- [ ] إيداع Functional Scenario PDF المعتمد في المستودع، وإعادة إصدار SRS v2 PDF فقط إذا تغيرت المتطلبات المعتمدة.
- [ ] مراجعة قانونية/خصوصية وسياسات account/document/metadata/Audit retention.
- [ ] private Object Storage عبر Backend وعدم وجود وثائق حقيقية في Firestore Bytes.
- [ ] حذف 48 ساعة آلي مع retry/alert/Audit واختبار failure recovery.
- [ ] provider/domain/HTTPS/ADC/secrets/CORS/rules/indexes مع مراجعة least privilege.
- [ ] staging production-like وتمرين backup/restore/rollback/DR/incident.
- [ ] إزالة TEST/local-only configuration والfixtures من artifacts الإنتاجية.
- [ ] full automated regression/security/performance/a11y pass.
- [ ] هاتف سوري فعلي وبيانات موبايل دون VPN، وdeployed-site E2E.
- [ ] metadata/canonical/sitemap/robots وprivacy/terms بعد domain واعتماد قانوني.
- [ ] observability/alerts/on-call ownership وrelease/rollback runbooks.
- [ ] موافقة مالك صريحة على النشر بعد مراجعة الأدلة.

## 20. قائمة مراجعة المالك

- [ ] اعتماد ترتيب مصادر الحقيقة وحدود الخطة.
- [x] بعد اعتماد الخطة: إنشاء واعتماد `SA3ERLI_SRS_V2_AR.md` قبل بدء Sprint 07، مع إبقاء SRS v1.0 التاريخي بلا تعديل.
- [x] إيداع `SA3ERLI_FUNCTIONAL_SCENARIO_AR_APPROVED.pdf` المعتمد في المستودع دون تغيير محتواه.
- [ ] إغلاق بوابة `tests/e2e/ui.spec.ts` بالتحقيق الحتمي وrevert أو commit مستقل موثق قبل Sprint 07.
- [ ] اعتماد الرؤية والنطاق والاستبعادات.
- [ ] تأكيد توصيف المنفذ/الجزئي/المخطط/المجهول حتى Sprint 06.
- [ ] اعتماد المعمارية الهدفية وحدود Frontend/Backend/Firebase/Object Storage/jobs.
- [ ] اعتماد توزيع Sprint 07–11 وحقول الدخول والخروج والاستبعادات.
- [ ] مراجعة مصفوفة السيناريوهات الـ34 وملكية كل Sprint.
- [ ] حسم قرارات Sprint 08 اللازمة: cycle model وsuspension وclaims/consistency.
- [ ] حسم قرارات Sprint 09 اللازمة: Shop/offer schema وmigration والملكية.
- [ ] جدولة مراجعة قانونية وقرارات retention/account deletion قبل Sprint 10 exit.
- [ ] اختيار البنية الإنتاجية دون افتراض provider/domain في هذه المسودة.
- [ ] اعتماد استراتيجية QA وبوابات الهاتف السوري والنسخة المنشورة.
- [ ] اعتماد دورة traceability لكل Sprint وreconciliation النهائي وإعادة إصدار SRS v2 PDF عند تغير المتطلبات المعتمدة فقط.

> اعتماد هذه الخطة لا يغلق أي قرار مفتوح ولا يفوض النشر أو التعامل مع وثائق تجارية حقيقية. حالة الوثيقة هي **APPROVED — OWNER APPROVED**، وتبقى بوابات التنفيذ والإنتاج خاضعة لشروطها وموافقاتها المنفصلة.
