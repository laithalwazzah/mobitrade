<div dir="rtl">

# السيناريو الشامل من البداية إلى الإطلاق لمشروع «سعّرلي»

> **الإصدار:** `1.0-approved`
> **الحالة:** **APPROVED — OWNER APPROVED**
> **تاريخ الإعداد:** 2026-11-08
> **اللغة:** العربية
> **حالة المنتج:** منجز حتى Sprint 07، لكنه **غير جاهز للإنتاج**

## 1. ضبط الوثيقة

| البند | القيمة |
|---|---|
| معرّف الوثيقة | `DOC-SA3ERLI-END-TO-END-SCENARIO-AR` |
| العنوان | السيناريو الشامل من الزيارة العامة إلى الإطلاق |
| الإصدار | `1.0-approved` |
| الحالة | **APPROVED — OWNER APPROVED** |
| تاريخ الإعداد | 2026-11-08 |
| تاريخ الاعتماد | 2026-11-08 |
| الجمهور | مدير المشروع، المالك، المنتج، Frontend، Backend، QA، العمليات، والصيانة المستقبلية |
| حقل الاعتماد | **OWNER APPROVED** بتاريخ 2026-11-08 |
| نسخة PDF المعتمدة | [SA3ERLI_END_TO_END_PROJECT_SCENARIO_AR_APPROVED.pdf](./SA3ERLI_END_TO_END_PROJECT_SCENARIO_AR_APPROVED.pdf) |
| آخر Sprint مغلق | Sprint 07 — **CLOSED — OWNER APPROVED** بتاريخ 2026-11-08 |

### 1.1 مصادر الحقيقة

1. [السيناريو الوظيفي المعتمد v1.0](./FUNCTIONAL_SCENARIO_AR.md).
2. [SRS v2 المعتمد](../requirements/SA3ERLI_SRS_V2_AR.md).
3. [الخطة الرئيسية المعتمدة](../../02-planning/MASTER_PROJECT_PLAN_AR.md).
4. [خارطة الطريق](../../sprints/ROADMAP.md).
5. تقارير واختبارات Sprint 01–07، ولا سيما [تقرير Sprint 07](../../sprints/SPRINT_07_REPORT.md) و[قائمة اختبار Sprint 07](../../../tests/sprints/SPRINT_07_TEST.md).
6. حالة المستودع التنفيذية عند إغلاق Sprint 07.

ترتيب الترجيح هو: التنفيذ المثبت واختباراته، ثم الوثائق المعتمدة، ثم التقارير التاريخية. إذا اختلفت الأزمنة فلا يعاد تفسير المصدر الأقدم بصمت؛ يسجل الفرق صراحة.

### 1.2 سجل المراجعات

| الإصدار | التاريخ | الوصف |
|---|---|---|
| `1.0-draft` | 2026-11-08 | أول مسودة إدارية شاملة تربط الرحلة كاملة بالحالة الفعلية حتى إغلاق Sprint 07 والخطة حتى Sprint 11. |
| `1.0-draft` | 2026-11-08 | توضيحان معتمدان من المالك: توقيت حذف الوثيقة وفق `DEC-012` وسياسة حداثة السعر وفق `DEC-013`، مع إبقاء اعتمادهما في المصادر الأساسية بانتظار propagation مضبوط. |
| `1.0-approved` | 2026-11-08 | اعتماد المالك للسيناريو الشامل بعد اتساق `DEC-012` و`DEC-013` مع Functional Scenario 1.1 وSRS 2.1 وMaster Plan 1.1. |

### 1.3 مفتاح الحالات

| الحالة | معناها |
|---|---|
| `IMPLEMENTED` | منفذة ومثبتة بأدلة آلية و/أو QA مالك حسب نطاقها |
| `PARTIAL` | جزء عامل وجزء معتمد لم ينفذ، أو يلزم تحديث traceability معتمد |
| `PLANNED` | معتمدة في الخطة ولم تنفذ بعد |
| `UNKNOWN` | تحتاج قرار مالك أو قانون أو بنية تحتية |
| `DEFERRED` | مؤجلة عمدًا إلى بوابة أو Sprint لاحق |

### 1.4 سجل قرارات المشروع

| القرار | التعريف المختصر | الحوكمة |
|---|---|---|
| `DEC-001` | خطة التسليم الرسمية تتكون من 11 Sprint، مع الحفاظ على نتائج Sprints المغلقة وتوزيع العمل المتبقي على Sprint 07–11. | baseline معتمد 2026-11-07 |
| `DEC-002` | حالات طلب الاعتماد هي `pending`, `needs_changes`, `approved`, `rejected` وفق الانتقالات المعتمدة؛ المسودة المحلية ليست حالة Backend. | baseline معتمد 2026-11-07 |
| `DEC-003` | إعادة التقديم بعد الرفض لا تتم تلقائيًا؛ تتطلب إذن أدمن ودورة مرتبطة جديدة دون تعديل السجل المرفوض. | baseline معتمد 2026-11-07 |
| `DEC-004` | طلب الاعتماد يتضمن البيانات القانونية والتجارية والتواصل والوثيقة والإقرار المحددة، دون بيانات شخصية أو مصرفية غير لازمة. | baseline معتمد 2026-11-07 |
| `DEC-005` | لا تطلب صورة واجهة المحل في الاعتماد؛ يمكن إضافة صورة/شعار عام بعد الموافقة وبشكل منفصل عن الوثيقة الخاصة. | baseline معتمد 2026-11-07 |
| `DEC-006` | توزيع مسؤوليات Sprint 07–11 كما هو معتمد، دون إعادة تنفيذ العقود الأساسية المسلّمة سابقًا. | baseline معتمد 2026-11-07 |
| `DEC-007` | baseline السابق ربط حذف الوثيقة بعد 48 ساعة بقرار الحالة، وربط الوثيقة القديمة بـ`needs_changes`؛ يظل سجلًا تاريخيًا ويخضع الآن لتوضيح `DEC-012` قبل التنفيذ. | baseline معتمد 2026-11-07؛ timing منقح في `1.0-approved` |
| `DEC-008` | Firestore `Bytes` تطويري فقط؛ يلزم Object Storage خاص وآمن عبر Backend قبل الإنتاج، دون URL عام دائم. | baseline معتمد 2026-11-07 |
| `DEC-009` | يستطيع التاجر تعديل المنطقة والعنوان وWhatsApp السوري، مع confirmation وAudit لتغيير WhatsApp؛ التغييرات الحساسة تحتاج مراجعة إدارية. | baseline معتمد 2026-11-07 |
| `DEC-010` | baseline السابق عرّف stale بعد سبعة أيام مع بقاء العرض ظاهرًا وإتاحة update/reconfirm وعدم خلط العملات؛ تفصّل `DEC-013` مرجع العمر وسلوك الإشعار. | baseline معتمد 2026-11-07؛ منقح في `1.0-approved` |
| `DEC-011` | `hidden` إخفاء مؤقت قابل للعكس، و`deleted` Soft Delete نهائي للتاجر؛ الحالتان مستبعدتان من العرض العام والأرخص وتخضعان لـAudit. | baseline معتمد 2026-11-07 |
| `DEC-012` | لا يبدأ الحذف الفيزيائي للوثيقة إلا بعد تحقق شرطين: مشاهدة/تحقق الأدمن بنجاح، وتسجيل القرار النهائي (`approved` أو `rejected`). يبدأ عد 48 ساعة من الحدث اللاحق منهما، مع جدولة حتمية وretry وتنبيه وAudit. | **OWNER APPROVED — 2026-11-08**؛ منسق مع baselines المعتمدة الجديدة |
| `DEC-013` | يمكن تحديث السعر في أي وقت بلا cooldown. بعد أكثر من سبعة أيام من أحدث تأكيد/تحديث يبقى العرض منشورًا ويظهر تحذير السعر القديم وتاريخ آخر تأكيد؛ update/reconfirm يزيل التحذير ويعيد بدء العمر. | **OWNER APPROVED — 2026-11-08**؛ منسق مع baselines المعتمدة الجديدة |

> **إشعار الاتساق:** أُدرج `DEC-012` و`DEC-013` بصورة متسقة في Functional Scenario `1.1-approved` وSRS `2.1-approved` وMaster Plan `1.1-approved` وهذه الوثيقة `1.0-approved`. لا يعني الاعتماد تنفيذ القرارين أو اكتمال بوابات الإنتاج.

## 2. الملخص التنفيذي

«سعّرلي» منصة عربية `RTL` لاكتشاف ومقارنة أسعار الهواتف المحمولة بين محلات اللاذقية. يستطيع الزائر البحث والتصفية وفتح المنتج أو المحل والمقارنة والتواصل عبر WhatsApp. يستطيع المستخدم إنشاء حساب والتحقق من بريده، ثم تقديم طلب اعتماد محل مع وثيقة سجل تجاري خاصة. يراجع الأدمن الطلب من لوحة محمية ويوافق أو يرفض مع تدقيق وتعارض متفائل.

حتى Sprint 07 أصبحت الرحلة العامة، المصادقة، طلب الاعتماد عبر Backend، وواجهة مراجعة الأدمن منفذة. لم تنفذ بعد عملية إنشاء Shop ومنح صلاحية التاجر بعد الموافقة، بوابة التاجر، CRUD العروض المملوكة، `needs_changes`، الحذف المجدول، أو التخزين الإنتاجي الخاص.

المشروع **ليس جاهزًا للإنتاج**. ما يزال يحتاج Sprint 08–11، Object Storage خاصًا، سياسة قانونية وخصوصية، staging، مراقبة ونسخًا احتياطيًا وتعافيًا، اختبارات هاتف وشبكة سورية، وموافقة إطلاق صريحة.

## 3. رؤية المنتج وحدوده

### 3.1 الرؤية

- تمكين الزائر من معرفة الأسعار الحالية ومصدرها وتاريخ تحديثها دون خلط USD وSYP.
- تمكين المحل المعتمد مستقبلًا من إدارة ملفه وعروضه ضمن ملكية موثوقة.
- تمكين الأدمن من اعتماد المحلات وحماية الوثائق واتخاذ قرارات قابلة للتدقيق.

### 3.2 داخل الحدود

- كتالوج هواتف فقط، مع بيانات static وlive merge.
- مقارنة جهازين، أسعار حسب العملة والحالة، واتصال WhatsApp خارجي.
- Firebase Authentication للهوية، NestJS Backend للأعمال الموثوقة، Firestore للبيانات الحالية.
- اعتماد المحل، المراجعة الإدارية، والتخطيط لإدارة Shop والعروض.

### 3.3 خارج الحدود أو غير المحسوم

- لا دفع إلكتروني، طلب شراء، شحن، مخزون لحظي، أو ضمان صفقة.
- لا لوحة تاجر أو CRUD عروض مملوكة حتى Sprint 09.
- لا وثائق تجارية حقيقية في Firestore `Bytes`.
- لا مزود استضافة أو domain أو Object Storage نهائي معتمد.
- لا استنتاج قانوني أو هوية/مصرف/عنوان منزل غير لازم.

### 3.4 حدود الثقة

المتصفح غير موثوق في الصلاحيات. Firebase Auth يثبت الهوية، والـBackend يتحقق من ID token والبريد والـclaims والملكية والحالة. Firestore Rules تمنع العميل من بيانات الطلبات والوثائق والتدقيق والملخص. العمليات المجدولة والبنية الإنتاجية ستكون جهات موثوقة منفصلة بعد اعتمادها.

## 4. الفاعلون والصلاحيات

| الفاعل | المسموح | الممنوع/المقيد | الحالة |
|---|---|---|---|
| الزائر | تصفح، بحث، تصفية، مقارنة، فتح المنتج/المحل، WhatsApp | طلب اعتماد أو إدارة محل/عرض | `IMPLEMENTED` |
| مستخدم مسجل | إدارة الجلسة والحساب وبدء مسار الاعتماد | أعمال التاجر أو الأدمن | `IMPLEMENTED` |
| بريد غير موثق | التحقق، إعادة إرسال التحقق، الخروج | `/add` وواجهات الأعمال | `IMPLEMENTED` |
| طالب اعتماد موثق | إرسال طلب واحد، رفع وثيقة، قراءة حالته | تعيين status أو قراءة وثيقة/طلب غيره | `IMPLEMENTED/PARTIAL` |
| تاجر معتمد | مستقبلاً إدارة Shop وعروضه فقط | منح نفسه claim أو إدارة Shop آخر | `PLANNED` |
| تاجر معلّق | الوصول المسموح للرسائل/التعافي حسب العقد | عمليات التاجر الحساسة | `PLANNED`؛ أثر العرض العام `UNKNOWN` |
| الأدمن | summary/list/detail/document/approve/reject حاليًا؛ قرارات إضافية لاحقًا | تجاوز Backend أو كشف الوثيقة للعامة | Sprint 07 `IMPLEMENTED` |
| Backend | التحقق، الأعمال الذرية، الإسقاطات المصغرة، Audit | الثقة في claims/IDs يرسلها العميل بلا تحقق | `IMPLEMENTED/PARTIAL` |
| Scheduler/Operations | حذف/تنبيه/مصالحة لاحقًا بهوية موثوقة | إصلاح production غير معتمد | `PLANNED` |
| مزودو البنية الخارجية | استضافة/تخزين/مراقبة وفق عقد لاحق | أي وصول خارج least privilege | `UNKNOWN/DEFERRED` |

## 5. نظرة شاملة على الرحلة من البداية إلى النهاية

1. يدخل الزائر الكتالوج فورًا من static data، ثم تدمج عروض `liveOffers` إن نجح التحميل.
2. يبحث ويصفي حسب العلامة والحالة والعملة، ويرتب دون مقارنة العملات ببعضها.
3. يفتح تفاصيل المنتج أو المحل، يقارن جهازين، أو ينتقل إلى WhatsApp.
4. يسجل بالبريد/كلمة المرور أو Google، ويوثق البريد، وتستعاد الجلسة بأمان.
5. يفتح `/add`; غير المسجل يذهب للدخول، وغير الموثق للتحقق، والموثق يرى طلب الاعتماد.
6. يرسل بيانات المحل ووثيقة JPEG/PNG/WebP من 1 بايت إلى 700 KiB عبر multipart إلى Backend.
7. ينشئ Backend application وdocument ذريًا، ويمنع التكرار والسجل الجزئي، ويتيح `GET .../me` للتعافي.
8. يفتح الأدمن `/admin`: ملخص عالمي، قائمة cursor، تفاصيل، وثيقة خاصة، ثم approve/reject بإصدار متوقع.
9. عند القرار تتغير application وsummary وAudit في معاملة واحدة. `needs_changes` وإعادة التقديم ما زالا مخططين.
10. بعد الموافقة، سيبدأ Sprint 08 provisioning fail-closed لإنشاء Shop واستكمال تفويض التاجر؛ هذه الخطوة غير منفذة.
11. في Sprint 09 يدير التاجر الملف والعروض: إنشاء، تحديث، تأكيد، إخفاء، إعادة تفعيل، وSoft Delete.
12. تنعكس العروض الصالحة في الكتالوج العام؛ hidden/deleted لا تظهر ولا تدخل الأرخص.
13. في Sprint 10 تنتقل الوثائق إلى Object Storage خاص، ويسجل النظام مشاهدة/تحقق الأدمن والقرار النهائي، ثم يحسب موعد الحذف بعد 48 ساعة من الحدث اللاحق ويشغله مع retry/alert/Audit وفق `DEC-012`.
14. في Sprint 11 تنفذ اختبارات staging والهاتف السوري والنسخة المنشورة وبوابات القانون والأمن، ثم يقرر المالك الإطلاق.

## 6. سيناريوهات الزائر العام

### 6.1 الصفحة الرئيسية والكتالوج — `IMPLEMENTED`

تظهر المنتجات والأسعار المحفوظة فورًا، ثم تدمج بيانات live إن توفرت. تعرض البطاقة السعر المختار، الحالة، العملة، تاريخ التحديث، stale badge، عدد المحلات الفريد، الصورة والشعار عند توفرهما، مع fallback مصقول.

### 6.2 البحث والتصفية والترتيب — `IMPLEMENTED`

تعمل query والعلامة والحالة والعملة والترتيب معًا. لا يظهر منتج بلا عرض مطابق. فرز السعر لا يتاح إلا بعد اختيار عملة واحدة. «مسح الفلاتر» يعيد الحالة الافتراضية.

### 6.3 المنتج والمحل وWhatsApp — `IMPLEMENTED`

المساران `/product?id=<id>` و`/shop?id=<id>` صالحان للـstatic export وللمعرفات الحية. تجمع صفحة المنتج حسب condition ثم currency، وتحسب الأرخص داخل المجموعة. تعرض صفحة المحل عروضه كافة. WhatsApp انتقال خارجي لا يمثل شراءً داخل المنصة.

### 6.4 المقارنة — `IMPLEMENTED`

يختار المستخدم جهازين فريدين كحد أقصى، مع حفظ دفاعي في localStorage، tray قابلة للفتح والإغلاق، وصفحة `/compare`. تعرض المواصفات والصور والأسعار الحالية دون خلط العملات. المنتج الحي غير المعروف في registry يعرض «غير متوفر» للمواصفات/الصورة بدل الانهيار.

### 6.5 حالات التحميل والفشل وعدم الوجود — `PARTIAL`

التنفيذ الحالي يثبت ترتيب loading ثم live success أو not-found، مع fallback آمن عند الفشل واختبار حتمي. لكن السيناريو المعتمد `SCN-PUB-005` ما يزال مصنفًا `PARTIAL` في baseline الوثائقي؛ يلزم تحديث traceability معتمد لاحقًا بدل تغيير التصنيف هنا.

### 6.6 الوصول والاستجابة — `IMPLEMENTED/PARTIAL`

توجد `RTL`, skip link، focus مرئي، reduced motion، tap targets وحماية overflow على 320/375/768/1024/1280. يبقى اختبار assistive technology الحقيقي والهاتف/الشبكة السورية والنسخة المنشورة مؤجلًا للإطلاق.

## 7. دورة الحساب والمصادقة

| المرحلة | السلوك | الفشل الآمن | الحالة |
|---|---|---|---|
| التسجيل | بريد/كلمة مرور وتأكيد كلمة المرور | رسائل عربية من codes ثابتة | `IMPLEMENTED` |
| توثيق البريد | إرسال وإعادة إرسال ثم refresh للحالة | لا وصول لمسار التاجر قبل التوثيق | `IMPLEMENTED` |
| الدخول | بريد/كلمة مرور أو Google | لا fake success عند cancel/failure | `IMPLEMENTED` |
| تعارض المزود | إرشاد للطريقة الموجودة دون ربط تلقائي | لا duplicate identity متعمد | `IMPLEMENTED` |
| استعادة كلمة المرور | رسالة نجاح عامة للبريد المسجل وغير المسجل | لا كشف لوجود الحساب | `IMPLEMENTED` |
| الجلسة | listener منظف وحالة loading تمنع flash | unavailable آمن عند غياب config | `IMPLEMENTED` |
| `returnTo` | مسار داخلي نسبي فقط | الخارجي يرفض ويعود إلى `/account` | `IMPLEMENTED` |
| الخروج | إنهاء الجلسة وحماية الحساب/الأدمن | مسح state الحساس | `IMPLEMENTED` |
| حذف الحساب | السياسة والآثار غير معتمدة | لا تنفيذ قبل قرار قانوني | `UNKNOWN` |

## 8. دورة طلب اعتماد التاجر

### 8.1 الأهلية والبيانات

يشترط مستخدمًا مسجلًا وموثق البريد. القرار `DEC-004` يطلب الاسم القانوني، الاسم التجاري، رقم السجل، المنطقة، العنوان، WhatsApp سوريًا، الوثيقة، وإقرار الصحة. النموذج الحالي لا يجمع كل هذه الحقول؛ لذلك اكتمال بيانات الطلب `PARTIAL`. لا تطلب صورة واجهة المحل (`DEC-005`).

### 8.2 الوثيقة

يقبل Backend توقيع JPEG/PNG/WebP حقيقيًا، من 1 بايت حتى 700 KiB بالضبط. لا يثق بالامتداد أو MIME وحدهما. metadata منفصلة عن bytes، ولا URL عام.

### 8.3 الإنشاء والتعافي

- `POST /api/v1/merchant-applications` لمستخدم موثق وبـmultipart.
- application وdocument ينشآن ذريًا مع تحديث summary الحالي.
- duplicate أو partial record يفشل مغلقًا.
- العملية ليست موصوفة كـidempotent عامة؛ بعد نتيجة شبكة غير مؤكدة يستخدم العميل `GET /api/v1/merchant-applications/me`. إعادة POST قد تعيد duplicate conflict.
- direct Firestore access مرفوض لكل العملاء.

### 8.4 الحالات

- `pending`, `approved`, `rejected`: `IMPLEMENTED`.
- `needs_changes`, تعديل الطلب المرتبط وإعادة الإرسال: `PLANNED` Sprint 08.
- إعادة التقديم بعد الرفض تحتاج إذن أدمن وربط دورة جديدة وفق `DEC-003`; تفاصيل cycle النهائية ما تزال مفتوحة.

## 9. دورة مراجعة الأدمن — Sprint 07

جميع البنود الآتية `IMPLEMENTED` ومغلقة بموافقة المالك:

1. `/admin` و`/admin/application?id=<uid>` محميان للحالات signed-out/unverified/non-admin/admin دون privileged flash.
2. `GET /api/v1/admin/merchant-applications/summary` يعيد `total/pending/approved/rejected/version/updatedAt` فقط، بمعدل 30 طلبًا/60 ثانية.
3. `merchantApplicationSummaries/global` Backend-owned، و`total = pending + approved + rejected` والأعداد صحيحة وغير سالبة.
4. القائمة تستخدم `status`, `limit`, `pageToken` فقط؛ default 20 والنطاق 1–50. الإسقاط: `ownerId`, `shop.name`, `shop.area`, `status`, `submittedAt`, `version`.
5. detail يعرض حقول المراجعة المصرح بها بلا bytes. الوثيقة تُجلب بفعل صريح فقط عبر Backend، كـattachment مع `private, no-store, max-age=0`, `no-cache`, `nosniff`.
6. Blob تبقى في الذاكرة، وObject URL تُلغى عند close/change/logout/unmount/401/403.
7. approve لا يرسل reason. reject يتطلب reason. كلاهما pending-only وبـ`expectedVersion`; التعارض يعيد 409 ثم refetch.
8. application وsummary وAudit تتغير ذريًا عند القرار، ولا يبقى `rejectionReason` بعد الموافقة.
9. الغياب/الفساد/عدم الاتساق في summary يعطي 503 `admin/summary-unavailable` ولا يعرض صفرًا مضللًا؛ list تبقى مستقلة.
10. verifier يعيد الحساب دون PII. الإصلاح الآلي محصور في `demo-*` وloopback؛ **لا توجد أداة إصلاح production مصرح بها**.

### 9.1 امتداد الحذف المخطط

الجلب الخاص المنفذ في Sprint 07 لا يسجل بعد حدث verified view ولا يبدأ حذفًا. وفق `DEC-012` يلزم لاحقًا إثبات نجاح عرض/تحقق الأدمن، وربطه بقرار نهائي `approved` أو `rejected`، والإبقاء على الوثيقة متاحة للأدمن المخول حتى اكتمال الشرطين. هذه الإضافة `PLANNED` ولا تغير إغلاق Sprint 07.

## 10. Provisioning بعد الموافقة

هذا المسار `PLANNED` في Sprint 08:

1. يصبح التطبيق `approved`، لكن ذلك وحده لا يسمح بعمليات التاجر.
2. ينشئ Backend سجل Shop وملكية موثوقة، ثم يدير merchant authorization/claim.
3. Firebase Auth claims وFirestore لا يشتركان في transaction واحدة؛ لذلك يستخدم workflow idempotent بحالة provisioning fail-closed.
4. عند فشل أي خطوة: retry آمن، compensation عند الحاجة، reconciliation، وAudit.
5. stale claim وحده لا يكفي؛ Backend يتحقق من Shop الحالي و`ownerUid` وحالة suspension.
6. تبقى عمليات التاجر ممنوعة حتى اكتمال كل الحالات وعدم وجود provisioning record غير محلول.

## 11. إدارة المحل

| القدرة | القاعدة | الحالة |
|---|---|---|
| إنشاء Shop وربطه | Backend فقط بعد الموافقة، مع ملكية موثوقة | `PLANNED` Sprint 08 |
| الملف العام | الاسم/المنطقة/العنوان/WhatsApp وصورة/شعار اختياري لاحقًا | `PLANNED` Sprint 09 |
| تغيير المنطقة/العنوان | للتاجر المالك مع validation وAudit | `PLANNED` |
| تغيير WhatsApp | مباشر للتاجر بعد confirmation واضح؛ القديم يبقى عند الإلغاء؛ Audit للقديم والجديد | `PLANNED` وفق `DEC-009` |
| تغيير الاسم/رقم السجل/المالك | مراجعة إدارية؛ `ownerUid` غير قابل للتعديل من العميل | `PLANNED` |
| التعليق/إعادة التفعيل | قرار أدمن، fail-closed، session refresh وAudit | `PLANNED` Sprint 08 |
| أثر التعليق على العروض العامة | لم يعتمد نهائيًا | `UNKNOWN` |

## 12. دورة العرض/الإعلان

### 12.1 الإنشاء والقائمة والملكية — `PLANNED`

يعرض التاجر عروض محله فقط، وينشئ عرضًا أو مجموعة عروض بعد validation. يشتق Backend `shopId/ownerUid` من الهوية الموثوقة لا من payload. سياسة atomicity للـmulti-create والتعامل مع partial failure وعقد API النهائي ما تزال تحتاج تصميمًا معتمدًا، ولا يخترع هذا المستند route أو schema.

### 12.2 التحديث والسعر القديم — `PARTIAL`

تعرض الواجهة الحالية تاريخ السعر وتحذيرًا عامًا للسعر القديم، لكن دورة التاجر الكاملة وفق `DEC-013` **مخططة وغير منفذة**. يستطيع التاجر مستقبلًا تحديث السعر في أي وقت؛ لا توجد مهلة انتظار أو cooldown مدتها سبعة أيام. يقيس النظام عمر السعر منذ إنشائه/تأكيده الأول، ثم منذ أحدث تحديث أو إعادة تأكيد صريحة للسعر.

إذا مر أكثر من سبعة أيام، يبقى العرض `active` ومنشورًا ومرئيًا، ولا يخفى أو يحذف أو يعلّق أو يحجب تلقائيًا. يرى الزائر إشعارًا عربيًا واضحًا مثل: **«هذا السعر قديم — آخر تحديث: YYYY-MM-DD»**، ويعرض التاريخ المفاهيمي لأحدث تأكيد/تحديث للسعر. يؤدي update أو reconfirm إلى إزالة التحذير وإعادة بدء فترة الحداثة. لا تقارن USD وSYP.

لا يعتمد هذا المستند اسم حقل قاعدة بيانات نهائيًا؛ يستخدم فقط مفهوم **«الطابع الزمني لأحدث تأكيد للسعر»**. يلزم في Sprint 09 اعتماد عقد البيانات والـAPI والاختبارات قبل وصف هذه السياسة بأنها منفذة.

### 12.3 الإخفاء والحذف — `PLANNED`

- `active → hidden → active`: إخفاء مؤقت قابل للعكس.
- `active|hidden → deleted`: Soft Delete نهائي للتاجر بعد confirmation.
- hidden/deleted لا تظهر في الكتالوج أو المقارنة أو الأرخص.
- الحذف الفيزيائي ومدة الاحتفاظ `UNKNOWN` حتى Sprint 10.
- كل فعل ownership-checked ومسجل في Audit.

### 12.4 المزامنة العامة — `PLANNED/PARTIAL`

المزج العام الحالي لـstatic و`liveOffers` منفذ، لكن نقل عروض التاجر إلى schema نهائي ومزامنتها مع الكتالوج وmigration من النموذج الحالي قرار مفتوح.

## 13. دورة خصوصية وثيقة السجل التجاري

1. **Upload:** multipart إلى Backend بعد التحقق من الهوية والتوقيع والحجم.
2. **Storage الحالي:** Firestore `Bytes` خاص للتطوير/Emulator فقط؛ ممنوع للوثائق الحقيقية.
3. **Admin access:** detail JSON بلا bytes، وجلب صريح admin-only مع no-store.
4. **Verified view:** يسجل النظام مفاهيميًا نجاح مشاهدة/تحقق الأدمن للوثيقة؛ مجرد فتح endpoint أو بدء الطلب لا يحقق الشرط.
5. **Final decision:** يسجل Backend القرار النهائي للطلب. تظل الوثيقة متاحة للأدمن المخول حتى اكتمال المشاهدة/التحقق والقرار النهائي معًا.
6. **Deletion due:** وفق `DEC-012` يبدأ عد 48 ساعة من الحدث اللاحق: `deletionDueAt = max(documentVerifiedViewedAt, finalReviewedAt) + 48 hours`. الأسماء هنا مفاهيمية وليست schema معتمدًا.
7. **Scheduler:** job موثوق وحتمي يحذف bytes عند الاستحقاق، يعيد المحاولة، ينبه عند الفشل، ويسجل دليل Audit؛ كله `PLANNED`.
8. **Retention:** الاحتفاظ بالـmetadata غير الوثائقية وAudit بعد حذف bytes ما يزال سياسة قانونية/تشغيلية غير محسومة.
9. **Production:** Object Storage خاص عبر Backend قبل أي وثيقة حقيقية؛ المزود `UNKNOWN`.

هذه الدورة **PLANNED** وغير منفذة. `DEC-012` يحسم trigger ومتسق مع السيناريو الوظيفي وSRS والخطة الرئيسية المعتمدة في 2026-11-08.

## 14. جداول انتقال الحالات

### 14.1 الحساب

| الحالية | المحفز | الفاعل | الشرط | التالية | الفشل | Audit | الحالة |
|---|---|---|---|---|---|---|---|
| signed-out | تسجيل | مستخدم | بيانات صالحة | unverified | رسالة عربية آمنة | Auth provider | `IMPLEMENTED` |
| unverified | توثيق البريد | مستخدم/Auth | رابط صالح | verified | إعادة إرسال/انتظار | Auth provider | `IMPLEMENTED` |
| verified | logout | مستخدم | جلسة قائمة | signed-out | تنظيف state | Auth provider | `IMPLEMENTED` |
| أي حساب | حذف الحساب | مستخدم/عمليات | سياسة غير معتمدة | غير محدد | fail closed | مطلوب | `UNKNOWN` |

### 14.2 طلب التاجر

| الحالية | المحفز | الفاعل | الشرط | التالية | الفشل | Audit | الحالة |
|---|---|---|---|---|---|---|---|
| لا طلب | submit | مستخدم موثق | form/file صالحان ولا duplicate | pending | 400/409/413 بلا partial | created metadata | `IMPLEMENTED` |
| pending | approve | أدمن | version مطابق | approved | 409/refetch | إلزامي | `IMPLEMENTED` |
| pending | reject | أدمن | version وreason | rejected | 400/409 | إلزامي | `IMPLEMENTED` |
| pending | needs_changes | أدمن | reason + requested fields | needs_changes | fail closed | إلزامي | `PLANNED` |
| needs_changes | resubmit | المالك | document جديد وربط cycle | pending | لا overwrite جزئي | إلزامي | `PLANNED` |
| rejected | authorize reapply | أدمن | إذن صريح | دورة جديدة | يبقى المرفوض immutable | إلزامي | `PLANNED/OPEN MODEL` |

### 14.3 Provisioning

| الحالية | المحفز | الفاعل | الشرط | التالية | الفشل | Audit | الحالة |
|---|---|---|---|---|---|---|---|
| not_started | application approved | Backend | قرار موثوق | provisioning | merchant denied | نعم | `PLANNED` |
| provisioning | Shop + authz complete | Backend | ownership/status verified | ready | retry/reconcile | نعم | `PLANNED` |
| provisioning | خطوة تفشل | Backend/ops | failure recorded | blocked/retrying | compensation؛ لا صلاحية | نعم | `PLANNED` |
| blocked | reconciliation | Ops | كل الأنظمة متطابقة | ready أو failed | alert/escalation | نعم | `PLANNED` |

### 14.4 Shop

| الحالية | المحفز | الفاعل | الشرط | التالية | الفشل | Audit | الحالة |
|---|---|---|---|---|---|---|---|
| provisioning | اكتمال الربط | Backend | owner + authorization | active | fail closed | نعم | `PLANNED` |
| active | suspend | أدمن | سبب/صلاحية | suspended | منع عمليات التاجر | نعم | `PLANNED` |
| suspended | reactivate | أدمن | تحقق الحالة | active | يبقى معلقًا | نعم | `PLANNED` |

### 14.5 العرض

| الحالية | المحفز | الفاعل | الشرط | التالية | الفشل | Audit | الحالة |
|---|---|---|---|---|---|---|---|
| لا عرض | create | تاجر | Shop active وملكية | active | validation/duplicate | نعم | `PLANNED` |
| active fresh | أكثر من 7 أيام منذ أحدث تأكيد/تحديث | نظام مشتق | وقت موثوق | active stale | يبقى منشورًا مع «هذا السعر قديم» والتاريخ | ليس انتقال تخزين بالضرورة | `PLANNED` وفق `DEC-013` |
| active fresh/stale | update/reconfirm في أي وقت | تاجر | ownership/version | active fresh ودورة عمر جديدة | 409/refetch؛ لا cooldown | نعم | `PLANNED` وفق `DEC-013` |
| active | hide | تاجر | ownership | hidden | لا نشر | نعم | `PLANNED` |
| hidden | reactivate | تاجر | ownership وShop صالح | active | fail closed | نعم | `PLANNED` |
| active/hidden | delete | تاجر | confirmation | deleted | لا استعادة للتاجر | نعم | `PLANNED` |

### 14.6 الاحتفاظ بالوثيقة

| الحالية | المحفز | الفاعل | الشرط | التالية | الفشل | Audit | الحالة |
|---|---|---|---|---|---|---|---|
| retained_private | pending | Backend | طلب مفتوح | retained_private | admin-only | access محدود | `IMPLEMENTED` تطويريًا |
| retained_private | verified admin view | Backend | فك/عرض ناجح للأدمن المخول | retained_private + view_verified | تبقى متاحة؛ لا يبدأ الحذف منفردًا | نعم | `PLANNED` |
| retained_private | final decision | Backend | قرار نهائي مسجل | retained_private + final_reviewed | تبقى متاحة إن لم يكتمل verified view | نعم | `PLANNED` |
| retained_private + الشرطان | اكتمال الحدث الثاني | Backend | verified view وfinal decision موجودان | deletion_due بعد 48h من الحدث اللاحق | fail closed + alert عند فشل الجدولة | نعم | `PLANNED` وفق `DEC-012` |
| deletion_due | scheduler delete | Job | هوية موثوقة | bytes_deleted | retry/dead-letter/alert | نعم | `PLANNED` |

## 15. الأخطاء والتعافي

| الحالة | مثال | الاستجابة والتعافي |
|---|---|---|
| Validation/400 | حقول أو filter أو file signature | رسالة عربية محددة؛ حفظ المدخلات المناسبة |
| 401 | token غائب/منتهي | تنظيف البيانات الحساسة، إعادة الدخول، لا privileged flash |
| 403 | بريد غير موثق/ليس أدمن/ملكية مرفوضة | شاشة forbidden/verify آمنة؛ لا كشف بيانات |
| 404 | id أو document غير موجود | not-found مصقول بعد اكتمال التحميل |
| 409 | duplicate/version/not-pending | status lookup أو refetch؛ لا قرار أو سجل ثانٍ |
| 413 | أكبر من 700 KiB | `merchant/document-too-large` ورسالة عربية وcorrelation ID |
| 429 | rate limit | انتظار ثم retry؛ envelope آمن |
| 503 | summary مفقود/فاسد/غير متسق | `admin/summary-unavailable`; لا zero مضلل؛ list مستقلة |
| انقطاع شبكة | submit غير مؤكد | `GET .../me` قبل إعادة create؛ duplicate conflict محتمل ومقبول |
| فشل transaction | create/decision | rollback كامل بلا partial application/document/summary/Audit |
| drift | aggregate لا يطابق applications | verifier يبلغ؛ repair محلي Emulator فقط؛ production procedure غير معتمد |

حيث يدعم Backend الخطأ، يحمل envelope `correlationId` دون stack أو token أو bytes أو PII زائد.

## 16. نموذج الأمن والخصوصية والثقة

- Firebase Auth للهوية، والـBackend يتحقق من ID token؛ client Firebase config ليس server credential.
- `VerifiedEmailGuard`, `AdminGuard` وحراس merchant/ownership المخططة تطبق server-side.
- claim قديم لا يكفي مستقبلًا؛ يلزم Shop ownership وsuspension status حاليان.
- Rules تمنع direct-client للـapplications/documents/audits/summary، مع الحفاظ على صلاحيات الكتالوج المعتمدة.
- list projection أقل بيانات من detail؛ document bytes لا تدخل JSON.
- logs/errors تخضع للredaction، والوثائق private/no-store.
- CORS allowlist، HTTPS، ADC/service identity، secrets منفصلة لكل environment قبل production.
- المراجعة القانونية والخصوصية والretention شرط إطلاق لا يعتبر منجزًا.

## 17. نموذج البيانات والتخزين المفاهيمي

| المفهوم | الغرض | الواقع/الخطة |
|---|---|---|
| `data/products.ts` والكتالوج | fallback static للمنتجات والمحلات والعروض | `IMPLEMENTED` |
| `liveOffers` | عروض حية عامة تدمج في المتصفح | `IMPLEMENTED`؛ migration مستقبلي مفتوح |
| `submissions` | سجل إرسال تاريخي | موجود؛ ليس مسار merchant API الجديد |
| `merchantApplications/{uid}` | metadata والحالة الحالية | `IMPLEMENTED` |
| `merchantDocuments/{uid}` | bytes خاصة مؤقتة | `IMPLEMENTED/DEVELOPMENT-ONLY` |
| `merchantApplicationAudits` | قرارات المراجعة | `IMPLEMENTED` أساسيًا |
| `merchantApplicationSummaries/global` | counts عالمية موثوقة | `IMPLEMENTED` Sprint 07 |
| Shop | ملكية وحالة وملف عام | `PLANNED`؛ schema نهائي غير مخترع |
| Offers مملوكة | CRUD/status/version | `PLANNED`؛ schema/migration مفتوحان |
| Provisioning/Reconciliation | اتساق Shop والclaims | `PLANNED` |
| Notifications | تنبيه التاجر/العمليات | `PLANNED/UNKNOWN CHANNEL` |
| دورة حذف الوثيقة | أحداث verified view والقرار النهائي وموعد الاستحقاق والنتيجة | `PLANNED` وفق `DEC-012`؛ المصطلحات مفاهيمية ولا تعتمد schema نهائيًا |
| حداثة السعر | أحدث تأكيد/تحديث للسعر وعمر مشتق | `PLANNED` وفق `DEC-013`؛ اسم الحقل النهائي غير معتمد |
| Object Storage | وثائق production الخاصة | `DEFERRED` Sprint 10؛ provider مفتوح |

## 18. تغطية Frontend

### 18.1 المسارات الحالية المنفذة

`/`, `/product?id=`, `/shop?id=`, `/compare`, `/add`, `/login`, `/register`, `/forgot-password`, `/verify-email`, `/account`, `/admin`, `/admin/application?id=`, و404.

### 18.2 الشاشات المخططة

- Sprint 08: states لـ`needs_changes`, provisioning, suspension/notifications حسب العقود.
- Sprint 09: Merchant dashboard، Shop profile، offer list/create/edit/hide/reactivate/delete/reconfirm.
- Sprint 10–11: واجهات الخصوصية والسياسات والإنتاج حسب القرارات المعتمدة.

### 18.3 قواعد الواجهة

- حالات loading/empty/error/success/forbidden/conflict/retry مستقلة وآمنة.
- `RTL` وعربية، keyboard/focus، 200% zoom، reduced motion، no overflow على viewports الخمسة.
- static export: المعرفات runtime عبر query (`?id=`) لا dynamic paths غير قابلة للتصدير.
- canonical/sitemap ينتظران domain معتمدًا.

## 19. تغطية Backend

### 19.1 APIs الحالية حتى Sprint 07

- `GET /api/v1/health/live`, `GET /api/v1/health/ready`.
- `GET /api/v1/auth/me`.
- `POST /api/v1/merchant-applications`, `GET /api/v1/merchant-applications/me`.
- `GET /api/v1/admin/merchant-applications/summary`.
- `GET /api/v1/admin/merchant-applications?status&limit&pageToken`.
- `GET /api/v1/admin/merchant-applications/:uid`.
- `GET /api/v1/admin/merchant-applications/:uid/document`.
- `PATCH /api/v1/admin/merchant-applications/:uid/decision`.

### 19.2 ما تثبته العقود الحالية

Bearer auth، verified/admin guards، DTO validation، correlation IDs، error envelope، Helmet/CORS/rate/body limits، redaction، pagination cursor، transactions، OpenAPI، graceful shutdown، upload signatures/size، private document delivery، optimistic concurrency، Audit، summary invariant.

### 19.3 APIs المستقبلية

`needs_changes`, resubmission/reapplication, provisioning, Shop, merchant role/session refresh, offers, notifications, document jobs. هذه مفاهيم `PLANNED` وليست routes نهائية؛ لا يثبت اسم route أو schema حتى اعتماده.

## 20. دورة QA والقبول

| المستوى | الغرض | الواقع |
|---|---|---|
| Unit | pure logic، parsers، validation، state/date/currency | مستمر؛ Sprint 07: 58/58 root |
| Backend unit/integration | controllers/services/repositories/contracts | Sprint 07: 33/33 |
| Rules | allow/deny وعدم توسيع الوصول | Sprint 07: 4/4 |
| Emulator E2E | Auth/Firestore/transactions/claims وهمية | منفذ محليًا بلا Firebase حي |
| Integrated | Frontend + Backend + Emulators | Sprint 06 و07: 2/2 لكل منهما في التحقق الأخير |
| Playwright non-live | UI/a11y/responsive/regression | Sprint 07: 110/110 |
| Build | static export مع وبدون env محلي | PASS لكليهما في Sprint 07 |
| Owner QA | checklist صريح قبل الإغلاق | Sprint 07: 12/12 PASS؛ 54/54 إجماليًا |
| Production-only | هاتف سوري، mobile data، deployed/staging/security/SEO | `DEFERRED` Sprint 11 |

لا يغلق Sprint بالاختبارات الآلية وحدها؛ يلزم QA المالك، reconciliation، تقرير صادق، وموافقة إغلاق صريحة.

## 21. رحلة العمليات والجاهزية للإنتاج

| المجال | المطلوب | الحالة |
|---|---|---|
| Local/Emulator | `demo-*`, loopback, dummy data, clean shutdown | `IMPLEMENTED` |
| Staging | بيئة production-like منفصلة | `DEFERRED` |
| Hosting/domain/CORS | مزود وdomain وorigins دقيقة | `UNKNOWN` |
| Object Storage | خاص، مشفر، Backend-only، lifecycle | `PLANNED/UNKNOWN PROVIDER` |
| Scheduler | حساب 48h من الحدث اللاحق بين verified view والقرار النهائي، ثم retry/alert/dead-letter وAudit | `PLANNED` وفق `DEC-012` |
| Observability | logs/metrics/alerts/on-call/runbooks | `PARTIAL/PLANNED` |
| Backup/DR/rollback | سياسات وتجارب restore/rollback | `UNKNOWN/PLANNED` |
| SLO/RPO/RTO | أرقام يعتمدها المالك والبنية | `UNKNOWN` |
| قانون/خصوصية | retention، account deletion، الوثائق، terms/privacy | `UNKNOWN` |
| Release | full suite، هاتف سوري، deployed test، موافقة مالك | `DEFERRED` Sprint 11 |

## 22. رحلة Sprints

| Sprint | النتيجة | الحالة | تبعيات/بوابة الخروج |
|---|---|---|---|
| 01 | تجربة الكتالوج والأسعار والفلاتر والقدم | `CLOSED` | QA مالك مكتمل |
| 02 | جودة بصرية ووصول وSEO وأداء + hotfix العملة | `CLOSED` | فحوص production المؤجلة ما تزال لSprint 11 |
| 03 | Firebase Auth والجلسات وحماية `/add` | `CLOSED` | providers يجهزون يدويًا للبيئات |
| 04 | طلب اعتماد وخصوصية وقواعد/Emulator | `CLOSED` | Bytes تطويرية فقط |
| 05 | Backend موثوق وحراس وأمن وOpenAPI | `CLOSED` | لا merchant APIs حينها |
| 06 | Merchant APIs وهجرة Frontend وAdmin APIs | `CLOSED` | لا Admin UI حينها |
| 07 | Admin dashboard + summary + QA | **`CLOSED — OWNER APPROVED 2026-11-08`** | 31/31، AT 42/42، MQ 12/12 |
| 08 | `needs_changes`, cycles, provisioning, Shop/claim, suspension, notifications | `PLANNED` | fail-closed/reconciliation؛ قرارات cycle/suspension |
| 09 | Merchant dashboard وShop/offer ownership وCRUD وسياسة حداثة 7 أيام | `PLANNED` | عقد latest-confirmation وschema/migration/ownership غير منفذة |
| 10 | hardening، Object Storage، حذف 48h بعد الشرطين، retention، backup/recovery | `PLANNED` | provider/legal/infrastructure وstaging؛ تنفيذ `DEC-012` لم يبدأ |
| 11 | QA نهائي، هاتف سوري، deployed test، release | `PLANNED` | كل بوابات الإنتاج وموافقة إطلاق صريحة |

## 23. مصفوفة حالة التنفيذ الحالية

هذه المصفوفة مشتقة من التنفيذ وتقارير الإغلاق حتى Sprint 07، وليست تعديلًا لتصنيف السيناريو المعتمد. بعد توضيح أن سياسة `DEC-013` الكاملة ما تزال مخططة، يصبح التوزيع الحالي للقدرات الـ34: **IMPLEMENTED 18، PARTIAL 7، PLANNED 8، UNKNOWN 1**. يختلف ذلك عن تصنيف السيناريو الحالي **IMPLEMENTED 19، PARTIAL 6، PLANNED 8، UNKNOWN 1** في قدرة واحدة فقط: قدرة السعر/القدم العامة مصنفة `PARTIAL` هنا لأن الواجهة الحالية لا تنفذ lifecycle `DEC-013` الكامل، بينما يبقى السيناريو الأوسع `IMPLEMENTED` مع توثيق الامتداد المخطط.

| Capability ID | القدرة | Frontend | Backend | Data/Rules | Automated QA | Manual QA | الهدف | الحالة/ملاحظة |
|---|---|---|---|---|---|---|---|---|
| CAP-PUB-001 | الكتالوج والدمج | منفذ | fallback/live read | static+live | PASS | PASS | 01–02 | `IMPLEMENTED` |
| CAP-PUB-002 | البحث والفلاتر | منفذ | — | view model | PASS | PASS | 01 | `IMPLEMENTED` |
| CAP-PUB-003 | السعر/القدم | تاريخ وتحذير عام منفذان | عقد `DEC-013` لاحق | date/currency حاليان؛ schema نهائي غير معتمد | PASS للنطاق الحالي | PASS للنطاق الحالي | 01/09 | `PARTIAL`؛ سياسة `DEC-013` الكاملة `PLANNED` |
| CAP-PUB-004 | منتج/محل/WhatsApp | منفذ | قراءة عامة | offers/shops | PASS | PASS | 01–02 | `IMPLEMENTED` |
| CAP-PUB-005 | loading/not-found | منفذ حتميًا | fallback | static/live | PASS | PASS سابق | trace update | `PARTIAL` وثائقيًا |
| CAP-CMP-001 | اختيار جهازين | منفذ | — | localStorage دفاعي | PASS | PASS | سابق | `IMPLEMENTED` |
| CAP-CMP-002 | صفحة المقارنة/media | منفذ | — | specs/media | PASS | PASS | سابق | `IMPLEMENTED` |
| CAP-AUTH-001 | التسجيل/التوثيق | منفذ | token لاحق | Auth | PASS | PASS | 03 | `IMPLEMENTED` |
| CAP-AUTH-002 | login/session/logout | منفذ | verify token | Auth | PASS | PASS | 03 | `IMPLEMENTED` |
| CAP-AUTH-003 | reset عام | منفذ | — | Auth | PASS | PASS | 03 | `IMPLEMENTED` |
| CAP-AUTH-004 | Google/collision | منفذ | token verify | identity | PASS | PASS | 03 | `IMPLEMENTED` |
| CAP-AUTH-005 | guards/returnTo | منفذ | guards | session | PASS | PASS | 03 | `IMPLEMENTED` |
| CAP-MER-001 | بوابة `/add` | منفذ | verified guard | status | PASS | PASS | 03–06 | `IMPLEMENTED` |
| CAP-MER-002 | بيانات الطلب الكاملة | جزئي | DTO ناقص قرارات DEC-004 | metadata | جزئي | جزئي | 08 | `PARTIAL` |
| CAP-MER-003 | تحقق الوثيقة | منفذ | signatures/size | Bytes مؤقتة | PASS | PASS | 04–06/10 | `IMPLEMENTED` تطويريًا |
| CAP-MER-004 | create atomic/recovery | منفذ | منفذ | app+doc+summary | PASS | PASS | 06–07 | `IMPLEMENTED` |
| CAP-MER-005 | status owner | منفذ | GET me | application | PASS | PASS | 04–06 | `IMPLEMENTED` |
| CAP-MER-006 | needs_changes/resubmit | غير منفذ | غير منفذ | cycle | مخطط | غير منفذ | 08 | `PLANNED` |
| CAP-MER-007 | reapply بإذن | جزئي رفض/سبب | authorization غير منفذ | linked cycles | جزئي | جزئي | 08 | `PARTIAL` |
| CAP-ADM-001 | Admin gate/shell | منفذ | guards | — | PASS | PASS | 07 | `IMPLEMENTED` بعد baseline SRS |
| CAP-ADM-002 | summary/list | منفذ | منفذ | aggregate/index | PASS | PASS | 07 | `IMPLEMENTED` بعد baseline SRS |
| CAP-ADM-003 | detail/document | منفذ | الجلب منفذ؛ تسجيل verified view غير منفذ | private Bytes؛ lifecycle `DEC-012` مخطط | PASS للجلب الحالي | PASS للجلب الحالي | 07/10 | `IMPLEMENTED` تطويريًا؛ شرط `DEC-012` `PLANNED` |
| CAP-ADM-004 | approve/reject/conflict | منفذ | القرار منفذ؛ ربطه بموعد `DEC-012` غير منفذ | version/Audit/summary | PASS للعقد الحالي | PASS للعقد الحالي | 06–07/10 | `IMPLEMENTED` للقرار؛ lifecycle الحذف `PLANNED` |
| CAP-ADM-005 | needs_changes/delete job | غير منفذ | غير منفذ | lifecycle الشرطين والجدولة | مخطط | غير منفذ | 08/10 | `PLANNED` وفق `DEC-012` |
| CAP-SHP-001 | provisioning Shop/claim | غير منفذ | غير منفذ | Shop/workflow | مخطط | غير منفذ | 08 | `PLANNED` |
| CAP-SHP-002 | بوابة/ملف المحل | غير منفذ | غير منفذ | Shop/Audit | مخطط | غير منفذ | 09 | `PLANNED` |
| CAP-SHP-003 | suspension/reactivation | غير منفذ | غير منفذ | status/Audit | مخطط | غير منفذ | 08 | `PLANNED` |
| CAP-OFR-001 | list/create offers | غير منفذ | غير منفذ | schema/index | مخطط | غير منفذ | 09 | `PLANNED` |
| CAP-OFR-002 | edit/version | غير منفذ | غير منفذ | ownership/version | مخطط | غير منفذ | 09 | `PLANNED` |
| CAP-OFR-003 | hide/reactivate/delete | غير منفذ | غير منفذ | states/Audit | مخطط | غير منفذ | 09/10 | `PLANNED` |
| CAP-OFR-004 | stale/reconfirm | عرض تاريخ/stale عام موجود؛ رسالة وعقد `DEC-013` غير منفذين | update/reconfirm غير منفذين | latest-confirmation مفهوم فقط؛ لا schema نهائي | جزئي للنطاق القديم | جزئي للنطاق القديم | 01/09 | `PARTIAL` حاليًا؛ سياسة `DEC-013` `PLANNED` |
| CAP-PRV-001 | حذف الوثيقة | عرض الوثيقة الحالي منفذ | verified-view tracking/job غير منفذين | private storage مؤقت؛ due من الحدث اللاحق مخطط | جزئي | جزئي | 08/10 | `PARTIAL` حاليًا؛ `DEC-012` `PLANNED` |
| CAP-PRV-002 | حذف الحساب | غير محدد | غير محدد | retention مفتوح | غير محدد | غير محدد | 10 | `UNKNOWN` |
| CAP-OPS-001 | recovery/operations | UI وhealth جزئي | logging/correlation جزئي | jobs/alerts مفتوحة | جزئي | جزئي | 01–11 | `PARTIAL` |

## 24. مصفوفة التتبع الكاملة

**تصنيف السيناريو المعتمد محفوظ:** IMPLEMENTED 15، PARTIAL 10، PLANNED 8، UNKNOWN 1 = 34. عمود «الحالة الحالية» يعكس دليل Sprint 07 دون تعديل المصدر المعتمد.

| Scenario | FR | NFR/DEC | Sprint | التصنيف المعتمد | الحالة الحالية | المصدر |
|---|---|---|---|---|---|---|
| `SCN-PUB-001` | `FR-PUB-001` | `NFR-PERF-001`, `NFR-PERF-002` | 01–02 | IMPLEMENTED | IMPLEMENTED | [SRS](../requirements/SA3ERLI_SRS_V2_AR.md) |
| `SCN-PUB-002` | `FR-PUB-002` | `DEC-010`, `DEC-013` | 01/09 | IMPLEMENTED | IMPLEMENTED؛ سياسة الحداثة الجديدة PLANNED | [Scenario](./FUNCTIONAL_SCENARIO_AR.md) |
| `SCN-PUB-003` | `FR-PUB-003` | `DEC-010`, `DEC-013` | 01/09 | IMPLEMENTED | IMPLEMENTED/PARTIAL workflow؛ `DEC-013` PLANNED | [SRS](../requirements/SA3ERLI_SRS_V2_AR.md) |
| `SCN-PUB-004` | `FR-PUB-004` | `NFR-ACC-001`, `NFR-ACC-002`, `NFR-ACC-003`, `NFR-SEO-001` | 01–02 | IMPLEMENTED | IMPLEMENTED | [Scenario](./FUNCTIONAL_SCENARIO_AR.md) |
| `SCN-PUB-005` | `FR-PUB-005` | `NFR-MNT-002`, `NFR-MNT-003` | pre-07/11 | PARTIAL | PARTIAL؛ test seam منجز | [SRS](../requirements/SA3ERLI_SRS_V2_AR.md) |
| `SCN-CMP-001` | `FR-CMP-001` | `NFR-MNT-003` | سابق | IMPLEMENTED | IMPLEMENTED | [Scenario](./FUNCTIONAL_SCENARIO_AR.md) |
| `SCN-CMP-002` | `FR-CMP-002` | `NFR-ACC-003` | سابق | IMPLEMENTED | IMPLEMENTED | [SRS](../requirements/SA3ERLI_SRS_V2_AR.md) |
| `SCN-AUTH-001` | `FR-AUTH-001` | `NFR-SEC-001` | 03 | IMPLEMENTED | IMPLEMENTED | [Sprint 03](../../sprints/SPRINT_03_REPORT.md) |
| `SCN-AUTH-002` | `FR-AUTH-002` | `NFR-SEC-001` | 03 | IMPLEMENTED | IMPLEMENTED | [Sprint 03](../../sprints/SPRINT_03_REPORT.md) |
| `SCN-AUTH-003` | `FR-AUTH-003` | `NFR-PRV-001` | 03 | IMPLEMENTED | IMPLEMENTED | [Sprint 03](../../sprints/SPRINT_03_REPORT.md) |
| `SCN-AUTH-004` | `FR-AUTH-004` | `NFR-SEC-001` | 03 | IMPLEMENTED | IMPLEMENTED | [Sprint 03](../../sprints/SPRINT_03_REPORT.md) |
| `SCN-AUTH-005` | `FR-AUTH-005` | `NFR-SEC-001` | 03 | IMPLEMENTED | IMPLEMENTED | [Sprint 03](../../sprints/SPRINT_03_REPORT.md) |
| `SCN-MER-001` | `FR-MER-001` | `NFR-SEC-001` | 03–06 | IMPLEMENTED | IMPLEMENTED | [Sprint 06](../../sprints/SPRINT_06_REPORT.md) |
| `SCN-MER-002` | `FR-MER-002` | `DEC-004`, `DEC-005` | 08 | PARTIAL | PARTIAL | [Scenario](./FUNCTIONAL_SCENARIO_AR.md) |
| `SCN-MER-003` | `FR-MER-003` | `DEC-007`, `DEC-008` | 04–06/10 | IMPLEMENTED | IMPLEMENTED development-only | [Sprint 06](../../sprints/SPRINT_06_REPORT.md) |
| `SCN-MER-004` | `FR-MER-004` | `NFR-REL-001`, `DEC-008` | 06–07 | IMPLEMENTED | IMPLEMENTED | [Sprint 07](../../sprints/SPRINT_07_REPORT.md) |
| `SCN-MER-005` | `FR-MER-005` | `NFR-REL-001` | 04–06 | IMPLEMENTED | IMPLEMENTED | [Sprint 06](../../sprints/SPRINT_06_REPORT.md) |
| `SCN-MER-006` | `FR-MER-006` | `DEC-002`, `DEC-007` | 08 | PLANNED | PLANNED | [Master Plan](../../02-planning/MASTER_PROJECT_PLAN_AR.md) |
| `SCN-MER-007` | `FR-MER-007` | `DEC-003`, `DEC-007` | 08 | PARTIAL | PARTIAL | [Scenario](./FUNCTIONAL_SCENARIO_AR.md) |
| `SCN-ADM-001` | `FR-ADM-001` | `DEC-006`, `NFR-SEC-001` | 07 | PARTIAL | IMPLEMENTED | [Sprint 07](../../sprints/SPRINT_07_REPORT.md) |
| `SCN-ADM-002` | `FR-ADM-002`, `FR-ADM-006` | `DEC-006`, `NFR-PRV-001` | 07 | PARTIAL | IMPLEMENTED | [Sprint 07](../../sprints/SPRINT_07_REPORT.md) |
| `SCN-ADM-003` | `FR-ADM-003` | `DEC-006`, `DEC-007`, `DEC-008`, `DEC-012` | 07/10 | PARTIAL | IMPLEMENTED development-only؛ verified-view tracking PLANNED | [Sprint 07](../../sprints/SPRINT_07_REPORT.md) |
| `SCN-ADM-004` | `FR-ADM-004` | `DEC-006`, `DEC-012`, `NFR-REL-001` | 06–07/10 | PARTIAL | IMPLEMENTED؛ deletion linkage PLANNED | [Sprint 07](../../sprints/SPRINT_07_REPORT.md) |
| `SCN-ADM-005` | `FR-ADM-005`, `FR-PRV-001` | `DEC-002`, `DEC-007`, `DEC-008`, `DEC-012` | 08/10 | PLANNED | PLANNED | [Master Plan](../../02-planning/MASTER_PROJECT_PLAN_AR.md) |
| `SCN-SHP-001` | `FR-SHP-001` | `DEC-006`, `NFR-REL-001` | 08 | PLANNED | PLANNED | [Master Plan](../../02-planning/MASTER_PROJECT_PLAN_AR.md) |
| `SCN-SHP-002` | `FR-SHP-002` | `DEC-005`, `DEC-009` | 09 | PLANNED | PLANNED | [Scenario](./FUNCTIONAL_SCENARIO_AR.md) |
| `SCN-SHP-003` | `FR-SHP-003` | `DEC-006`, `NFR-SEC-001` | 08 | PLANNED | PLANNED | [Master Plan](../../02-planning/MASTER_PROJECT_PLAN_AR.md) |
| `SCN-OFR-001` | `FR-OFR-001`, `FR-OFR-005` | `NFR-REL-001` | 09 | PLANNED | PLANNED | [SRS](../requirements/SA3ERLI_SRS_V2_AR.md) |
| `SCN-OFR-002` | `FR-OFR-002` | `DEC-010`, `DEC-013`, `NFR-SEC-001` | 09 | PLANNED | PLANNED | [Scenario](./FUNCTIONAL_SCENARIO_AR.md) |
| `SCN-OFR-003` | `FR-OFR-003` | `DEC-011` | 09/10 | PLANNED | PLANNED | [Scenario](./FUNCTIONAL_SCENARIO_AR.md) |
| `SCN-OFR-004` | `FR-OFR-004` | `DEC-010`, `DEC-013` | 01/09 | PARTIAL | PARTIAL حاليًا؛ lifecycle الجديد PLANNED | [Scenario](./FUNCTIONAL_SCENARIO_AR.md) |
| `SCN-PRV-001` | `FR-PRV-001` | `DEC-007`, `DEC-008`, `DEC-012`, `NFR-PRV-001` | 08/10 | PARTIAL | PARTIAL حاليًا؛ trigger الجديد PLANNED | [SRS](../requirements/SA3ERLI_SRS_V2_AR.md) |
| `SCN-PRV-002` | `FR-PRV-002` | `NFR-PRV-002` | 10 | UNKNOWN | UNKNOWN | [SRS](../requirements/SA3ERLI_SRS_V2_AR.md) |
| `SCN-OPS-001` | `FR-OPS-001`, `FR-OPS-002` | `NFR-REL-002`, `NFR-REL-003`, `NFR-SEC-002`, `NFR-OPS-001`, `NFR-OPS-002`, `NFR-OPS-003`, `NFR-OPS-004`, `NFR-MNT-001`, `NFR-MNT-004`, `DEC-001`, `DEC-006` | 01–11 | PARTIAL | PARTIAL | [Master Plan](../../02-planning/MASTER_PROJECT_PLAN_AR.md) |

## 25. القرارات المفتوحة والمخاطر

| الموضوع | الوضع | الخطر إن لم يحسم |
|---|---|---|
| مزود Object Storage والتشفير/backup | `UNKNOWN` | منع الوثائق الحقيقية والإنتاج |
| hosting/domain/CORS/canonical | `UNKNOWN` | لا نشر أو SEO نهائي |
| حذف الحساب وآثاره | `UNKNOWN` | خصوصية وبيانات مترابطة غير محسومة |
| retention الفيزيائي للعروض المحذوفة | `UNKNOWN` | تراكم أو حذف غير مشروع |
| أثر suspension على العروض العامة | `UNKNOWN` | عرض غير مرغوب أو اختفاء غير متوقع |
| application cycles/resubmission | `OPEN` | ازدواج أو overwrite تاريخي |
| notifications والقناة/retention | `OPEN` | فوات تنبيه التاجر أو العمليات |
| offer schema/ownership/migration | `OPEN` | ازدواج `liveOffers` أو ملكية غير سليمة |
| حقول بحث الأدمن | `OPEN` | توسع PII أو أداء غير مخطط |
| تنفيذ scheduler/dead-letter ومقاييس التصعيد | `OPEN IMPLEMENTATION DETAIL` | وجوب الجدولة الحتمية وretry/alert/Audit محسوم في `DEC-012`، لكن آلية التشغيل والتصعيد التفصيلية غير معتمدة |
| metadata/Audit/log retention | `UNKNOWN/LEGAL` | احتفاظ زائد أو نقص في التدقيق |
| backup/restore/rollback/DR | `OPEN` | تعافٍ غير مثبت |
| SLO/RPO/RTO | `UNKNOWN` | توقعات تشغيلية غير قابلة للقياس |
| التحقق القانوني ومعالجة الوثائق | `UNKNOWN/LEGAL` | يمنع استخدام الوثائق الحقيقية |
| تنفيذ `DEC-012` | **APPROVED / PLANNED** | baseline متسق؛ يلزم Object Storage وscheduler والمراجعة القانونية واختبارات الحدثين قبل التنفيذ |
| تنفيذ `DEC-013` | **APPROVED / PLANNED** | baseline متسق؛ يلزم عقد بيانات مفاهيمي ثم تنفيذ Sprint 09 واختبار visibility بلا cooldown |

## 26. قائمة قبول المدير

- [x] راجعت رحلة المنتج من الزائر حتى الإطلاق.
- [x] راجعت صلاحيات كل فاعل والممنوعات.
- [x] راجعت دورة طلب التاجر وحقولها الناقصة.
- [x] راجعت دورة الأدمن المنفذة في Sprint 07.
- [x] راجعت ووافقت بتاريخ 2026-11-08 على `DEC-013`: التحديث في أي وقت، والسبعة أيام مقياس حداثة، والعرض stale يبقى ظاهرًا مع التاريخ.
- [x] راجعت ووافقت بتاريخ 2026-11-08 على `DEC-012`: الحذف بعد 48 ساعة من الحدث اللاحق بين verified view والقرار النهائي.
- [x] تحققت من اتساق `DEC-012` و`DEC-013` في السيناريو الوظيفي وSRS والخطة الرئيسية.
- [x] راجعت الفرق بين الواقع الحالي والخطط المستقبلية.
- [x] أقررت بقاء القرارات المفتوحة دون حسم ضمن هذه الوثيقة.
- [x] أقررت أن بوابات الإنتاج لم تكتمل وأن المشروع غير جاهز للإنتاج.
- [x] وافقت على الوثيقة وإصدار PDF عربي RTL معتمد.

> **إشعار ختامي:** هذه الوثيقة **APPROVED — OWNER APPROVED** بالإصدار `1.0-approved` بتاريخ 2026-11-08. لا تفوض تنفيذ Sprint 08 أو النشر أو Firebase الحي أو معالجة وثائق تجارية حقيقية، وتبقى القرارات والبنى وبوابات الإنتاج غير المحسومة مفتوحة.

</div>
