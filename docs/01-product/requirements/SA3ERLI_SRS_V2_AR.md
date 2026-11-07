# مواصفات متطلبات البرمجيات v2 لمنصة «سعّرلي»

> **اتجاه العرض المستهدف:** `RTL`
>
> **الحالة:** **APPROVED — OWNER APPROVED**

## 1. ضبط الوثيقة

| البند | القيمة |
|---|---|
| معرّف الوثيقة | `DOC-SRS-AR-002` |
| الإصدار | `2.0-approved` |
| الحالة | **APPROVED — OWNER APPROVED** |
| التاريخ | 2026-11-07 |
| تاريخ الاعتماد | 2026-11-07 |
| نسخة PDF المعتمدة | [SA3ERLI_SRS_V2_AR_APPROVED.pdf](./SA3ERLI_SRS_V2_AR_APPROVED.pdf) |
| المالك | مالك منتج «سعّرلي» |
| المراجعون | مالك المنتج، المراجع التقني، ومراجع قانوني/خصوصية قبل بيانات حقيقية |
| خط الأساس التنفيذي | `41a94003b9c921aec9ba1c9709a5cf5430d4bad7` |
| آخر Sprint مغلق | Sprint 06 — **CLOSED — OWNER APPROVED** بتاريخ 2026-11-05 |
| اللغة المرجعية | العربية؛ تبقى الأسماء والمسارات والحالات التقنية بالإنجليزية عند الحاجة |

### سجل الإصدارات

| الإصدار | التاريخ | الوصف |
|---|---|---|
| `2.0-draft` | 2026-11-07 | أول مسودة SRS v2 شاملة مبنية على السيناريو الوظيفي والخطة الرئيسية المعتمدين. |
| `2.0-approved` | 2026-11-07 | اعتماد المالك لـSRS v2 بعد مراجعة البنية والتتبع وذرية المتطلبات. |

> **إشعار الاعتماد:** اعتمد المالك SRS v2 بتاريخ 2026-11-07 مع بقاء خط الأساس التنفيذي `41a94003b9c921aec9ba1c9709a5cf5430d4bad7`. يشمل الاعتماد 37 متطلباً وظيفياً و21 متطلباً غير وظيفي و34 سيناريو متتبعاً. تبقى القرارات المفتوحة وبوابات الإنتاج مفتوحة، ولا يعني الاعتماد أنها منفذة أو محسومة. يجيز الاعتماد تخطيط Sprint 07 فقط؛ ولا يجيز النشر الإنتاجي أو معالجة وثائق تجارية حقيقية.

### أسبقية المصادر

1. التنفيذ المثبت في commit خط الأساس أعلاه عند إسناد `IMPLEMENTED`.
2. `docs/01-product/scenarios/FUNCTIONAL_SCENARIO_AR.md` بالإصدار `1.0-approved` وقرارات `DEC-001`–`DEC-011`.
3. `docs/02-planning/MASTER_PROJECT_PLAN_AR.md` بالإصدار `1.0-approved`.
4. تقارير واختبارات Sprint 01–06 المغلقة بوصفها أدلة تاريخية.
5. `Sa3erli_SRS_AR.pdf` بوصفه SRS v1.0 تاريخياً يبقى بلا تعديل.

التغيير المحلي غير المحسوم في `tests/e2e/ui.spec.ts` مستبعد من الدليل السلوكي. هذه المسودة لا تنشئ PDF ولا تفوض التنفيذ أو النشر أو استخدام وثائق تجارية حقيقية.

## 2. المقدمة

### 2.1 الغرض

تحدد الوثيقة المتطلبات القابلة للتتبع للنظام الكامل: الكتالوج العام، المقارنة، المصادقة، اعتماد التاجر، واجهتا الأدمن والتاجر، Backend، البيانات، التخزين، الأمن، الخصوصية، الاختبار والتشغيل.

### 2.2 نطاق المنتج

منصة عربية `RTL` لمقارنة أسعار الموبايلات بين محلات مدينة اللاذقية، مع منع خلط العملات، وإتاحة اعتماد أصحاب المحلات وإدارة المحل والعروض لاحقاً عبر Backend موثوق.

### 2.3 الجمهور المقصود

مالك المنتج، المطورون، QA، مراجع الأمن والخصوصية، المراجع القانوني، ومسؤولو التشغيل والإطلاق.

### 2.4 النطاق الجغرافي والفئة

- مدينة اللاذقية في الإصدار الأول.
- أجهزة الموبايل فقط.
- العملات المدعومة حالياً `USD` و`SYP` دون مقارنة رقمية بينهما.

### 2.5 خارج النطاق

- البيع والدفع والتوصيل داخل المنصة.
- تطبيق Native، ومدن أو فئات إضافية.
- تحقق حكومي آلي من السجلات.
- اختيار نهائي لمزود التخزين أو الاستضافة أو النطاق أو backup قبل موافقة المالك.

## 3. التعريفات والمصطلحات

| المصطلح | التعريف |
|---|---|
| الزائر | مستخدم يتصفح البيانات العامة دون حساب. |
| المستخدم المسجل | مستخدم له حساب Firebase Authentication. |
| مقدم الطلب الموثق | مستخدم مسجل وموثق البريد يقدم طلب اعتماد محل. |
| التاجر المعتمد | مستخدم اكتمل له Shop وصلاحية merchant الموثوقتان. هذا الدور التشغيلي مخطط. |
| التاجر المعلّق | تاجر معتمد مُنعت عنه عمليات merchant وفق حالة Shop الحالية. |
| الأدمن | مستخدم يحمل claim موثوقاً `admin: true`. |
| Shop | كيان المحل العام المرتبط بـ`ownerUid` بعد provisioning ناجح. |
| Offer | عرض سعر لجهاز لدى Shop بحالة وعملة وتاريخ تحديث. |
| Merchant application | دورة طلب اعتماد بيانات المحل والوثيقة التجارية. |
| Audit | سجل أفعال وقرارات حساسة مع الفاعل والتوقيت والتغيير. |
| Object Storage | تخزين ملفات خاص مطلوب قبل الإنتاج؛ مزوده غير محسوم. |
| stale price | عرض مضى على تحديثه أو تأكيده سبعة أيام تقويمية على الأقل. |
| provisioning | workflow ينسق Shop وAuth claim وAudit مع fail-closed/retry/reconciliation. |

## 4. نظرة النظام والسياق

- **Frontend:** Next.js App Router عربي بتصدير static؛ لا يعد بيئة موثوقة.
- **Backend:** NestJS تحت `/api/v1` للتحقق والتفويض والعمليات الحساسة.
- **الهوية:** Firebase Authentication يصدر ID tokens؛ Firebase Admin يتحقق منها في Backend.
- **البيانات:** Firestore للبيانات العامة وmetadata والأعمال والـAudit وفق قواعد الوصول.
- **الملفات:** Firestore `Bytes` تطويري فقط؛ Object Storage خاص مطلوب قبل الإنتاج.
- **المهام المجدولة:** حذف الوثائق والتنبيهات والصيانة لاحقاً بهوية خدمة محدودة.
- **WhatsApp:** تنقل خارجي إلى `wa.me` ولا يمثل بيعاً داخل النظام.
- **حدود الثقة:** المتصفح غير موثوق؛ Backend وخدماته المجدولة trusted actors؛ لا يقبل الدور أو الملكية من body دون تحقق.

## 5. الفاعلون ومصفوفة الصلاحيات

| الفاعل | قراءة | أفعال مسموحة | قيود |
|---|---|---|---|
| الزائر | الكتالوج والعروض العامة | بحث ومقارنة وWhatsApp | لا بيانات تجار خاصة. |
| المستخدم المسجل | العام وحسابه | إدارة جلسة الحساب | لا تقديم قبل توثيق البريد. |
| مستخدم غير موثق | العام وصفحات التحقق | تحقق/إعادة إرسال/خروج | لا `/add` business workflow. |
| مقدم طلب موثق | العام وطلبه عبر API | إنشاء طلب ومتابعة حالته | التعديل لاحقاً فقط عند `needs_changes`. |
| تاجر معتمد | العام وShop وعروضه | عمليات merchant بعد Sprint 08–09 | يلزم Shop active وملكية وصلاحية حالية. |
| تاجر معلّق | قراءة وفق السياسة | لا عمليات merchant | أثر العروض العامة قرار مفتوح. |
| الأدمن | الطلبات والوثائق اللازمة عبر API | مراجعة وقرار وتعليق وإذن reapplication | claim موثوق وAudit. |
| Backend service | حسب service identity | تحقق وعمليات أعمال وclaims | أقل صلاحية وredaction. |
| scheduled-job identity | targets المستحقة | حذف/صيانة idempotent | لا وصول عام زائد؛ Audit وتنبيه. |

## 6. المتطلبات الوظيفية

### 6.1 الكتالوج العام — `FR-PUB-*`

#### `FR-PUB-001` — التصفح العام

- **معرّف المتطلب:** `FR-PUB-001`
- **نص المتطلب:** يجب عرض الكتالوج والعروض العامة دون حساب، بدءاً من البيانات الثابتة ثم دمج البيانات الحية الصالحة.
- **الفاعل الأساسي:** الزائر.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 01–02.
- **المصدر:** `SCN-PUB-001`.
- **الشروط السابقة:** توفر النسخة الثابتة.
- **السلوك المتوقع:** تعرض الصفحة البيانات فوراً وتدمج `liveOffers` عند نجاح القراءة.
- **سلوك الفشل:** تبقى البيانات الثابتة وتظهر رسالة آمنة عند فشل live data.
- **قيود الأمن/الخصوصية:** لا تعرض applications/documents/Audit.
- **معايير القبول القابلة للاختبار:** يفتح `/` دون جلسة، ويستمر الكتالوج عند غياب Firebase أو فشل القراءة.

#### `FR-PUB-002` — البحث والفلاتر والترتيب

- **معرّف المتطلب:** `FR-PUB-002`
- **نص المتطلب:** يجب أن تعمل query والشركة والحالة والعملة والترتيب معاً، وأن يعيد مسح الفلاتر الحالة الافتراضية.
- **الفاعل الأساسي:** الزائر.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 01.
- **المصدر:** `SCN-PUB-002` و`DEC-010`.
- **الشروط السابقة:** كتالوج محمل.
- **السلوك المتوقع:** تستبعد المنتجات بلا عرض مطابق، ولا يفعل ترتيب السعر إلا بعد اختيار عملة.
- **سلوك الفشل:** تعرض حالة فارغة وإجراء reset دون كسر الصفحة.
- **قيود الأمن/الخصوصية:** يمنع خلط `USD` و`SYP` في المقارنة.
- **معايير القبول القابلة للاختبار:** توليفة البحث والفلاتر والترتيب تعطي نتائج حتمية، وreset يمسحها كلها.

#### `FR-PUB-003` — السعر والحالة والقدم

- **معرّف المتطلب:** `FR-PUB-003`
- **نص المتطلب:** يجب عرض العرض المختار وحالته وعملته وتاريخ تحديثه، ووسم stale بعد سبعة أيام.
- **الفاعل الأساسي:** الزائر.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 01؛ إدارة التأكيد Sprint 09.
- **المصدر:** `SCN-PUB-003` و`DEC-010`.
- **الشروط السابقة:** وجود عرض مطابق.
- **السلوك المتوقع:** يحسب الأرخص لكل condition/currency ويعد المحلات الفريدة.
- **سلوك الفشل:** التاريخ غير الصالح لا ينتج حساب قدم مضللاً.
- **قيود الأمن/الخصوصية:** لا مقارنة عابرة للعملة.
- **معايير القبول القابلة للاختبار:** حدود اليوم السابع UTC وحساب الأرخص والعملات تمر باختبارات حتمية.

#### `FR-PUB-004` — تفاصيل المنتج والمحل وWhatsApp

- **معرّف المتطلب:** `FR-PUB-004`
- **نص المتطلب:** يجب توفير صفحات المنتج والمحل عبر `?id=` وروابط WhatsApp للرقم المطبّع.
- **الفاعل الأساسي:** الزائر.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 01–02.
- **المصدر:** `SCN-PUB-004`.
- **الشروط السابقة:** معرف صالح أو بيانات متاحة.
- **السلوك المتوقع:** تعرض التفاصيل والمجموعات والعنوان والتاريخ وتفتح `wa.me` الصحيح.
- **سلوك الفشل:** تعرض not-found ودعوة للعودة دون crash.
- **قيود الأمن/الخصوصية:** تعرض رقم التواصل العام فقط؛ لا وثائق خاصة.
- **معايير القبول القابلة للاختبار:** كل الروابط الداخلية تستخدم query routes وروابط WhatsApp تطابق Shop.

#### `FR-PUB-005` — حالات الفشل والمعرف المجهول

- **معرّف المتطلب:** `FR-PUB-005`
- **نص المتطلب:** يجب ترتيب loading ثم product/not-found بعد اكتمال live loading دون 404 مبكر أو منتج static خاطئ.
- **الفاعل الأساسي:** الزائر.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** بوابة استقرار قبل Sprint 07 ثم Sprint 11 regression.
- **المصدر:** `SCN-PUB-005` وبوابة الخطة 13.0.
- **الشروط السابقة:** معرف غير موجود static وقد يصل live.
- **السلوك المتوقع:** loading أولاً؛ بعد completion يظهر المنتج أو not-found فقط.
- **سلوك الفشل:** فشل live ينتهي برسالة/fallback حتمية ولا يعرض منتجاً آخر.
- **قيود الأمن/الخصوصية:** `tests/e2e/ui.spec.ts` الحالي ليس دليلاً حتى حسم التحقيق.
- **معايير القبول القابلة للاختبار:** adapter حتمي يغطي static وunknown-loading وdelayed-success وlive-failure.

### 6.2 المقارنة — `FR-CMP-*`

#### `FR-CMP-001` — اختيار جهازين

- **معرّف المتطلب:** `FR-CMP-001`
- **نص المتطلب:** يجب أن يدير المستخدم جهازين فريدين كحد أقصى مع add/remove/replace/clear واستعادة آمنة.
- **الفاعل الأساسي:** الزائر.
- **الأولوية:** Should.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** سابق لـSprint 01؛ regression مستمر.
- **المصدر:** `SCN-CMP-001`.
- **الشروط السابقة:** كتالوج متاح.
- **السلوك المتوقع:** tray قابلة للفتح لا تحجب المحتوى وتختفي في `/compare`.
- **سلوك الفشل:** localStorage التالف يعاد إلى حالة آمنة.
- **قيود الأمن/الخصوصية:** لا تخزن بيانات شخصية.
- **معايير القبول القابلة للاختبار:** duplicate/max-two/corrupt/reload/mobile/desktop تمر.

#### `FR-CMP-002` — نتيجة المقارنة

- **معرّف المتطلب:** `FR-CMP-002`
- **نص المتطلب:** يجب مقارنة جهازين من أي شركة مع إبراز الفروق والمواصفات والصور والأسعار الحالية.
- **الفاعل الأساسي:** الزائر.
- **الأولوية:** Should.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** سابق لـSprint 01؛ regression مستمر.
- **المصدر:** `SCN-CMP-002`.
- **الشروط السابقة:** جهاز واحد أو اثنان مختاران.
- **السلوك المتوقع:** تعرض storage من Product وRAM variant عند توفره و«غير متوفر» للناقص.
- **سلوك الفشل:** المنتجات الحية المخصصة تستخدم fallback ولا تكسر الصفحة.
- **قيود الأمن/الخصوصية:** تفصل الأسعار حسب العملة.
- **معايير القبول القابلة للاختبار:** same/different brand، media/fallback/alt، واختلافات الأسعار تعمل على viewports المعتمدة.

### 6.3 المصادقة — `FR-AUTH-*`

#### `FR-AUTH-001` — التسجيل والتحقق

- **معرّف المتطلب:** `FR-AUTH-001`
- **نص المتطلب:** يجب دعم تسجيل البريد/كلمة المرور والتحقق وإعادة رسالة التحقق.
- **الفاعل الأساسي:** المستخدم المسجل.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 03.
- **المصدر:** `SCN-AUTH-001`.
- **الشروط السابقة:** Firebase Auth مهيأ أو تظهر unavailable.
- **السلوك المتوقع:** تحقق client آمن ورسائل عربية وانتقال لحالة unverified/verified.
- **سلوك الفشل:** تعرض codes آمنة دون raw provider error.
- **قيود الأمن/الخصوصية:** لا تسجل كلمة المرور أو تكشف وجود بريد.
- **معايير القبول القابلة للاختبار:** التسجيل والتحقق والإعادة وحالة missing config تمر بم mocks.

#### `FR-AUTH-002` — الدخول والجلسة والخروج

- **معرّف المتطلب:** `FR-AUTH-002`
- **نص المتطلب:** يجب دعم الدخول واستعادة الجلسة بلا flash مضلل والخروج مع تنظيف listener.
- **الفاعل الأساسي:** المستخدم المسجل.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 03.
- **المصدر:** `SCN-AUTH-002`.
- **الشروط السابقة:** حساب موجود.
- **السلوك المتوقع:** حالات loading/signed-out/unverified/verified صريحة.
- **سلوك الفشل:** تبقى الصفحة مستقرة برسالة آمنة.
- **قيود الأمن/الخصوصية:** لا token في UI/log.
- **معايير القبول القابلة للاختبار:** refresh/restart/logout/account guard تعمل دون تسرب.

#### `FR-AUTH-003` — استعادة كلمة المرور

- **معرّف المتطلب:** `FR-AUTH-003`
- **نص المتطلب:** يجب تقديم reset برسالة نجاح عامة للبريد المسجل وغير المسجل.
- **الفاعل الأساسي:** المستخدم.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 03.
- **المصدر:** `SCN-AUTH-003`.
- **الشروط السابقة:** بريد بصيغة صالحة.
- **السلوك المتوقع:** يرسل الطلب ويعرض نتيجة عامة.
- **سلوك الفشل:** خطأ آمن لا يكشف الحساب.
- **قيود الأمن/الخصوصية:** منع account enumeration.
- **معايير القبول القابلة للاختبار:** المساران يعطيان contract واجهة عاماً متطابقاً.

#### `FR-AUTH-004` — Google وتعارض المزود

- **معرّف المتطلب:** `FR-AUTH-004`
- **نص المتطلب:** يجب دعم Google مع نجاح/إلغاء/فشل وتعارض provider آمنة دون linking تلقائي.
- **الفاعل الأساسي:** المستخدم.
- **الأولوية:** Should.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 03.
- **المصدر:** `SCN-AUTH-004`.
- **الشروط السابقة:** provider مفعل.
- **السلوك المتوقع:** النجاح فقط عند جلسة صحيحة والتعارض يوجه لطريقة الدخول الحالية.
- **سلوك الفشل:** الإلغاء أو popup failure لا يصنع نجاحاً وهمياً.
- **قيود الأمن/الخصوصية:** لا ربط تلقائي غير موثوق.
- **معايير القبول القابلة للاختبار:** adapter mocks تغطي success/cancel/failure/collision.

#### `FR-AUTH-005` — حماية المسار وreturn path

- **معرّف المتطلب:** `FR-AUTH-005`
- **نص المتطلب:** يجب حماية routes وتقبل `returnTo` داخلياً نسبياً فقط.
- **الفاعل الأساسي:** المستخدم.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 03.
- **المصدر:** `SCN-AUTH-005`.
- **الشروط السابقة:** محاولة route محمي.
- **السلوك المتوقع:** توجيه حسب auth state ثم عودة داخلية آمنة.
- **سلوك الفشل:** external/invalid returnTo يعود إلى `/account` أو default آمن.
- **قيود الأمن/الخصوصية:** منع open redirect.
- **معايير القبول القابلة للاختبار:** sanitizer وdirect URL cases تمر.

### 6.4 اعتماد التاجر — `FR-MER-*`

#### `FR-MER-001` — بوابات `/add`

- **معرّف المتطلب:** `FR-MER-001`
- **نص المتطلب:** يجب أن يوجه `/add` signed-out إلى login، وunverified إلى verify، وverified إلى workflow الاعتماد.
- **الفاعل الأساسي:** مقدم الطلب.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 03–06.
- **المصدر:** `SCN-MER-001`.
- **الشروط السابقة:** اكتمال استعادة auth state.
- **السلوك المتوقع:** لا يعرض workflow قبل استقرار الجلسة.
- **سلوك الفشل:** missing config يعرض unavailable/retry.
- **قيود الأمن/الخصوصية:** publishing form القديم غير متاح عبر route.
- **معايير القبول القابلة للاختبار:** الحالات الثلاث وreturn path تمر E2E معزولاً.

#### `FR-MER-002` — بيانات الطلب والإقرار

- **معرّف المتطلب:** `FR-MER-002`
- **نص المتطلب:** يجب جمع الاسم القانوني، الاسم التجاري، رقم السجل، المنطقة، العنوان، WhatsApp السوري، الوثيقة وإقرار الدقة؛ لا صورة واجهة.
- **الفاعل الأساسي:** مقدم الطلب الموثق.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** Sprint 08 لاستكمال العقد.
- **المصدر:** `SCN-MER-002` و`DEC-004` و`DEC-005`.
- **الشروط السابقة:** verified email وعدم وجود دورة مانعة.
- **السلوك المتوقع:** normalize/validate مع uid/email/status/timestamps/version خادمية.
- **سلوك الفشل:** أخطاء عربية تحفظ المدخلات غير الحساسة.
- **قيود الأمن/الخصوصية:** لا هوية/منزل/مصرف أو بيانات غير لازمة.
- **معايير القبول القابلة للاختبار:** كل حقل مطلوب وحدوده والغياب والرفض مغطاة.

#### `FR-MER-003` — تحقق الملف

- **معرّف المتطلب:** `FR-MER-003`
- **نص المتطلب:** يجب قبول توقيع JPEG/PNG/WebP حقيقي وحجم 1–700 KiB شامل فقط.
- **الفاعل الأساسي:** مقدم الطلب.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 04 و06.
- **المصدر:** `SCN-MER-003` و`DEC-007` و`DEC-008`.
- **الشروط السابقة:** ملف محدد.
- **السلوك المتوقع:** يتحقق Backend من bytes لا MIME/extension وحدهما.
- **سلوك الفشل:** 0 أو 700 KiB+1 أو signature غير صالح يعيد خطأ عربي ثابتاً.
- **قيود الأمن/الخصوصية:** الملف خاص ولا public URL.
- **معايير القبول القابلة للاختبار:** exact boundaries والتوقيعات المزيفة مغطاة API/Emulator.

#### `FR-MER-004` — الإنشاء الذري

- **معرّف المتطلب:** `FR-MER-004`
- **نص المتطلب:** يجب إرسال multipart عبر API وإنشاء application/document معاً ورفض duplicate/partial record.
- **الفاعل الأساسي:** مقدم الطلب.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 06.
- **المصدر:** `SCN-MER-004` و`DEC-008`.
- **الشروط السابقة:** token صالح وبريد موثق وpayload صالح.
- **السلوك المتوقع:** batch واحد ينشئ metadata وBytes الخاصة بحالة `pending`، ويمنع duplicate إنشاء سجل ثانٍ.
- **سلوك الفشل:** لا يبقى أي سجل منفرد. بعد نتيجة client غير مؤكدة، يستعيد المستخدم الحالة عبر `GET /api/v1/merchant-applications/me`؛ وقد تعيد محاولة create المتكررة duplicate conflict الموثق، ولا يفترض العقد idempotency key غير مثبت.
- **قيود الأمن/الخصوصية:** ID من actor؛ لا client status؛ لا bytes في logs/JSON.
- **معايير القبول القابلة للاختبار:** يثبت atomicity verifier إنشاء الوثيقتين أو عدمهما، وتثبت اختبارات duplicate عدم إنشاء سجل ثانٍ، وتثبت حالة الاستجابة غير المؤكدة إمكانية الاستعادة عبر owner status ثم قبول duplicate conflict الموثق دون ادعاء create idempotent.

#### `FR-MER-005` — استعادة الحالة الحالية

- **معرّف المتطلب:** `FR-MER-005`
- **نص المتطلب:** يجب أن يستعيد المالك حالة طلبه الحالية عبر API ويعرض pending/approved/rejected بأمان.
- **الفاعل الأساسي:** مقدم الطلب.
- **الأولوية:** Must.
- **الحالة الحالية:** IMPLEMENTED.
- **Sprint المالك:** Sprint 04 و06.
- **المصدر:** `SCN-MER-005`.
- **الشروط السابقة:** جلسة verified.
- **السلوك المتوقع:** تعرض الحالة وسبب الرفض المسموح دون document bytes.
- **سلوك الفشل:** unavailable/retry ولا ادعاء حالة.
- **قيود الأمن/الخصوصية:** المالك يرى سجله فقط عبر Backend.
- **معايير القبول القابلة للاختبار:** reload والحالات والـJSON redaction تمر.

#### `FR-MER-006` — `needs_changes`

- **معرّف المتطلب:** `FR-MER-006`
- **نص المتطلب:** يجب أن تسمح `needs_changes` بتعديل الحقول المطلوبة ورفع وثيقة جديدة ثم إعادة الحالة إلى `pending`.
- **الفاعل الأساسي:** مقدم الطلب الموثق.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 08.
- **المصدر:** `SCN-MER-006` و`DEC-002` و`DEC-007`.
- **الشروط السابقة:** قرار أدمن `needs_changes` على دورة حالية.
- **السلوك المتوقع:** تعديل محدود، وثيقة جديدة، transition ذري وAudit.
- **سلوك الفشل:** يبقى fail-closed ولا تضيع الدورة أو الوثيقة السابقة قبل جدولة حذفها.
- **قيود الأمن/الخصوصية:** حذف الوثيقة القديمة بعد 48 ساعة؛ لا تعديل pending.
- **معايير القبول القابلة للاختبار:** state/authz/duplicate/file/retry integrated tests تمر.

#### `FR-MER-007` — الرفض وإعادة التقديم

- **معرّف المتطلب:** `FR-MER-007`
- **نص المتطلب:** يجب عرض الرفض وسببه، ومنع reapplication التلقائية والسماح بدورة مرتبطة فقط بإذن أدمن.
- **الفاعل الأساسي:** مقدم الطلب والأدمن.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** Sprint 08.
- **المصدر:** `SCN-MER-007` و`DEC-003` و`DEC-007`.
- **الشروط السابقة:** دورة `rejected`.
- **السلوك المتوقع:** يحفظ التاريخ، يسجل الإذن، وينشئ دورة ووثيقة جديدتين.
- **سلوك الفشل:** لا overwrite ولا دورة غير مرتبطة أو غير مأذونة.
- **قيود الأمن/الخصوصية:** الإذن server/admin-only وAudit.
- **معايير القبول القابلة للاختبار:** unauthorized/duplicate/link/history tests تمر.

### 6.5 الأدمن — `FR-ADM-*`

#### `FR-ADM-001` — دخول لوحة الأدمن

- **معرّف المتطلب:** `FR-ADM-001`
- **نص المتطلب:** يجب توفير Admin UI محمية بـ`admin: true` وتمنع بقية الأدوار.
- **الفاعل الأساسي:** الأدمن.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** Sprint 07.
- **المصدر:** `SCN-ADM-001` و`DEC-006`.
- **الشروط السابقة:** جلسة وتوكن وclaim صالحان.
- **السلوك المتوقع:** route/layout وحالات loading/forbidden/error واضحة.
- **سلوك الفشل:** 401/403 آمنان دون محتوى إداري.
- **قيود الأمن/الخصوصية:** لا يعتمد UI وحده؛ Backend guard إلزامي.
- **معايير القبول القابلة للاختبار:** signed-out/normal/unverified/admin direct URL تمر.

#### `FR-ADM-002` — قائمة طلبات الأدمن

- **معرّف المتطلب:** `FR-ADM-002`
- **نص المتطلب:** يجب عرض قائمة طلبات الأدمن باستخدام `status` و`limit` و`pageToken` مع pagination مستقرة، دون اشتقاق totals عالمية من list API الحالية.
- **الفاعل الأساسي:** الأدمن.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** Sprint 07.
- **المصدر:** `SCN-ADM-002` و`DEC-006` والخطة 13.1.
- **الشروط السابقة:** admin authorized.
- **السلوك المتوقع:** تعرض القائمة loading/empty/error/retry، وتستخدم continuation token دون تكرار أو تخطي ضمن العقد المستقر.
- **سلوك الفشل:** invalid filter أو token أو فشل الشبكة يعرض خطأ آمناً وإجراء retry دون totals مضللة.
- **قيود الأمن/الخصوصية:** admin-only؛ لا bytes أو PII زائد؛ rate limit وOpenAPI للعقد الحالي.
- **معايير القبول القابلة للاختبار:** `status/limit/pageToken` وحدود `limit` وpagination مستقرة وحالات الواجهة تمر؛ لا يظهر global count مشتق من الصفحة الحالية.

#### `FR-ADM-003` — التفاصيل والوثيقة

- **معرّف المتطلب:** `FR-ADM-003`
- **نص المتطلب:** يجب أن يرى الأدمن التفاصيل وينزل الوثيقة الخاصة عبر Backend فقط.
- **الفاعل الأساسي:** الأدمن.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** Sprint 07؛ التخزين Sprint 10.
- **المصدر:** `SCN-ADM-003` و`DEC-007` و`DEC-008`.
- **الشروط السابقة:** admin authorized وطلب موجود.
- **السلوك المتوقع:** detail JSON بلا bytes؛ download attachment خاص.
- **سلوك الفشل:** 404/403/storage error آمنة مع retry.
- **قيود الأمن/الخصوصية:** `Cache-Control: private, no-store` ولا public URL.
- **معايير القبول القابلة للاختبار:** owner/anonymous denied، admin allowed، headers/redaction صحيحة.

#### `FR-ADM-004` — approve/reject والتعارض

- **معرّف المتطلب:** `FR-ADM-004`
- **نص المتطلب:** يجب أن يقرر الأدمن approve/reject للـpending فقط مع version، وسبب رفض إلزامي وAudit واحد.
- **الفاعل الأساسي:** الأدمن.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** Backend Sprint 06؛ UI Sprint 07.
- **المصدر:** `SCN-ADM-004` و`DEC-006`.
- **الشروط السابقة:** طلب pending ونسخة متوقعة.
- **السلوك المتوقع:** decision/audit/version atomic داخل Firestore.
- **سلوك الفشل:** conflict/not-pending/reason missing آمنة ولا تكرر القرار.
- **قيود الأمن/الخصوصية:** admin-only وcorrelation/Audit دون bytes.
- **معايير القبول القابلة للاختبار:** concurrency/reason/audit/UI retry tests تمر.

#### `FR-ADM-005` — قرار `needs_changes`

- **معرّف المتطلب:** `FR-ADM-005`
- **نص المتطلب:** يجب تمكين الأدمن من قرار `needs_changes` بسبب إلزامي وحقول مطلوبة، مع state/version/Audit وربط إعادة إرسال المالك بالدورة نفسها.
- **الفاعل الأساسي:** الأدمن.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 08.
- **المصدر:** `SCN-ADM-005` و`DEC-002`.
- **الشروط السابقة:** طلب `pending` وversion متوقعة.
- **السلوك المتوقع:** يسجل reason والحقول المطلوبة وtransition/version/Audit، ويتيح للمالك resubmission مرتبطة بعد رفع وثيقة جديدة.
- **سلوك الفشل:** missing reason/fields أو version conflict أو not-pending يرفض بلا transition أو Audit نجاح.
- **قيود الأمن/الخصوصية:** admin-only؛ لا bytes في القرار أو Audit؛ لا تعديل owner أثناء pending إلا عبر المسار المسموح.
- **معايير القبول القابلة للاختبار:** reason/fields/version/pending-only/Audit/linkage وowner resubmission تمر باختبارات state وAPI وE2E. الحذف المجدول يختبر حصراً تحت `FR-PRV-001`.

#### `FR-ADM-006` — الملخص العالمي الموثوق

- **معرّف المتطلب:** `FR-ADM-006`
- **نص المتطلب:** يجب توفير Backend endpoint إداري read-only يعيد global counts معرفة بوضوح للوحة الأدمن.
- **الفاعل الأساسي:** الأدمن.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 07.
- **المصدر:** `SCN-ADM-002` و`DEC-006` والخطة المعتمدة 13.1.
- **الشروط السابقة:** admin token وclaim صالحان.
- **السلوك المتوقع:** يعيد counts عالمية وفق تعريف موثق في OpenAPI، وتعرض الواجهة loading/error/empty states مستقلة.
- **سلوك الفشل:** unauthorized/rate-limited/backend failure يعيد error envelope آمناً وcorrelation ID وإجراء retry مناسب دون أرقام قديمة مضللة.
- **قيود الأمن/الخصوصية:** admin authorization وrate limiting؛ لا document bytes أو PII زائد؛ لا اشتقاق totals من list page.
- **معايير القبول القابلة للاختبار:** Emulator fixtures حتمية تثبت counts والتفويض وOpenAPI وrate limit والأخطاء وحالات Frontend. إزالة global totals أو استبدالها بـpage-local يحتاج تغيير متطلبات معتمداً لاحقاً.

### 6.6 المحل والصلاحية — `FR-SHP-*`

#### `FR-SHP-001` — provisioning المحل والصلاحية

- **معرّف المتطلب:** `FR-SHP-001`
- **نص المتطلب:** يجب إنشاء Shop ومنح merchant claim عبر provisioning fail-closed قابل للتسوية.
- **الفاعل الأساسي:** Backend service.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 08.
- **المصدر:** `SCN-SHP-001` و`DEC-006`.
- **الشروط السابقة:** approve صالح.
- **السلوك المتوقع:** workflow idempotent مع retry/compensation/reconciliation/Audit.
- **سلوك الفشل:** تبقى عمليات merchant ممنوعة ولا يبقى provisioning غير محلول عند الإغلاق.
- **قيود الأمن/الخصوصية:** stale claim لا يكفي؛ Backend يفحص Shop/owner/suspension.
- **معايير القبول القابلة للاختبار:** حقن فشل بعد كل خطوة وإثبات reconciliation وعدم partial authorization.

#### `FR-SHP-002` — ملف المحل وWhatsApp

- **معرّف المتطلب:** `FR-SHP-002`
- **نص المتطلب:** يجب أن يدير التاجر المنطقة والعنوان وWhatsApp السوري، مع confirmation وAudit للرقم.
- **الفاعل الأساسي:** التاجر المعتمد.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 09.
- **المصدر:** `SCN-SHP-002` و`DEC-005` و`DEC-009`.
- **الشروط السابقة:** Shop active وملكية مؤكدة.
- **السلوك المتوقع:** تحديث مباشر للحقول المسموحة؛ الاسم/السجل/المالك بمراجعة إدارية.
- **سلوك الفشل:** يبقى الرقم القديم عند الإلغاء أو فشل التحقق.
- **قيود الأمن/الخصوصية:** `ownerUid` غير قابل للتحرير؛ Audit للقيم اللازمة فقط.
- **معايير القبول القابلة للاختبار:** ownership/normalization/confirmation/cancel/audit tests تمر.

#### `FR-SHP-003` — تعليق المحل

- **معرّف المتطلب:** `FR-SHP-003`
- **نص المتطلب:** يجب أن يعلق الأدمن Shop ويعيد تفعيله، وأن يمنع Backend عمليات merchant أثناء التعليق.
- **الفاعل الأساسي:** الأدمن.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 08؛ أثر العروض يحسم قبل Sprint 10.
- **المصدر:** `SCN-SHP-003` و`DEC-006` والقرار المفتوح الخاص بالتعليق.
- **الشروط السابقة:** Shop موجود.
- **السلوك المتوقع:** status/Audit/session refresh وفحص خادمي حالي.
- **سلوك الفشل:** stale token/claim لا يتجاوز التعليق.
- **قيود الأمن/الخصوصية:** admin-only؛ أثر العرض العام لا يفترض قبل القرار.
- **معايير القبول القابلة للاختبار:** active/suspended/reactivated وstale-session authz tests تمر.

### 6.7 العروض — `FR-OFR-*`

#### `FR-OFR-001` — قائمة عروض التاجر

- **معرّف المتطلب:** `FR-OFR-001`
- **نص المتطلب:** يجب أن يرى التاجر عروض Shop المملوك في قائمة ذات loading/empty/error/retry وpagination عند الحاجة.
- **الفاعل الأساسي:** التاجر المعتمد.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 09.
- **المصدر:** `SCN-OFR-001`.
- **الشروط السابقة:** provisioning مكتمل وShop active.
- **السلوك المتوقع:** يعيد Backend عروض Shop المملوك فقط بترتيب وpagination موثقين، وتعرض الواجهة الحالات كاملة.
- **سلوك الفشل:** failure أو invalid continuation يعرض خطأ آمناً وretry دون عرض عروض Shop آخر.
- **قيود الأمن/الخصوصية:** ownership وShop status يتحقق منهما Backend؛ لا cross-shop reads.
- **معايير القبول القابلة للاختبار:** owner/other-owner/suspended وloading/empty/error/retry/pagination تمر دون تسرب عروض.

#### `FR-OFR-002` — تعديل العرض

- **معرّف المتطلب:** `FR-OFR-002`
- **نص المتطلب:** يجب أن يعدل التاجر عرض Shop المملوك فقط مع concurrency control.
- **الفاعل الأساسي:** التاجر المعتمد.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 09.
- **المصدر:** `SCN-OFR-002` و`DEC-010` و`DEC-011`.
- **الشروط السابقة:** عرض غير deleted وShop active.
- **السلوك المتوقع:** version/precondition وتحديث `updatedAt` الموثوق.
- **سلوك الفشل:** 403 أو conflict آمن ولا lost update.
- **قيود الأمن/الخصوصية:** ownership من Shop؛ لا خلط عملات.
- **معايير القبول القابلة للاختبار:** owner/other-owner/suspended/conflict/currency tests تمر.

#### `FR-OFR-003` — hide/reactivate/Soft Delete

- **معرّف المتطلب:** `FR-OFR-003`
- **نص المتطلب:** يجب أن يخفي التاجر عرضه ويعيده، أو يحذفه Soft Delete نهائياً له بعد confirmation.
- **الفاعل الأساسي:** التاجر المعتمد.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 09؛ physical retention Sprint 10.
- **المصدر:** `SCN-OFR-003` و`DEC-011`.
- **الشروط السابقة:** ملكية وShop active وعرض غير deleted.
- **السلوك المتوقع:** hidden قابل للعكس؛ deleted غير قابل للتعديل/النشر ويستبعد من العام والأرخص.
- **سلوك الفشل:** transition غير صالح أو cross-shop مرفوض بلا تغيير.
- **قيود الأمن/الخصوصية:** Audit لكل فعل؛ مدة physical purge مفتوحة.
- **معايير القبول القابلة للاختبار:** transitions/public exclusion/audit/confirmation tests تمر.

#### `FR-OFR-004` — دورة السعر السباعية

- **معرّف المتطلب:** `FR-OFR-004`
- **نص المتطلب:** يجب أن يستطيع التاجر تعديل السعر أو تأكيده، ويعاد حساب stale بعد سبعة أيام من `updatedAt`.
- **الفاعل الأساسي:** التاجر المعتمد والزائر.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** عرض Sprint 01؛ إدارة Sprint 09.
- **المصدر:** `SCN-OFR-004` و`DEC-010`.
- **الشروط السابقة:** عرض active مملوك.
- **السلوك المتوقع:** edit/reconfirm يحدثان timestamp؛ stale يبقى ظاهراً بتحذير.
- **سلوك الفشل:** لا حذف تلقائي ولا مقارنة cross-currency.
- **قيود الأمن/الخصوصية:** timestamp خادمي وownership.
- **معايير القبول القابلة للاختبار:** day-7 UTC/edit/reconfirm/stale/public sorting tests تمر.

#### `FR-OFR-005` — إنشاء عرض أو عدة عروض

- **معرّف المتطلب:** `FR-OFR-005`
- **نص المتطلب:** يجب أن ينشئ التاجر عرضاً واحداً أو عدة عروض بعد validation وتحقق الملكية الخادمي، وفق سياسة atomicity موثقة قبل تنفيذ multi-create.
- **الفاعل الأساسي:** التاجر المعتمد.
- **الأولوية:** Must.
- **الحالة الحالية:** PLANNED.
- **Sprint المالك:** Sprint 09.
- **المصدر:** `SCN-OFR-001`.
- **الشروط السابقة:** provisioning مكتمل وShop active ومملوك للفاعل.
- **السلوك المتوقع:** يتحقق Backend من المنتج والحالة والعملة والسعر، ويشتق `shopId`/الملكية من السياق الموثوق، ويطبق duplicate policy. يجب أن يحدد العقد قبل التنفيذ هل multi-create all-or-nothing أو يعيد نتائج item-level محددة؛ لا تجمد هذه الوثيقة route أو schema.
- **سلوك الفشل:** لا نجاح غامض أو records يتيمة؛ إن لم تكن العملية ذرية، يعيد العقد partial-failure results صريحة قابلة للتعافي ولا يعيد العناصر الناجحة سراً.
- **قيود الأمن/الخصوصية:** merchant/ownership/current-Shop guards وAudit؛ لا owner أو Shop authority من client ولا cross-shop write.
- **معايير القبول القابلة للاختبار:** single/multi/invalid/duplicate/unauthorized/suspended وحقن فشل عند كل نقطة يثبت سياسة atomicity/partial failure المعتمدة وAudit، دون افتراض route أو persistence schema نهائيين.

### 6.8 الخصوصية — `FR-PRV-*`

#### `FR-PRV-001` — حذف الوثيقة

- **معرّف المتطلب:** `FR-PRV-001`
- **نص المتطلب:** يجب حذف bytes بعد 48 ساعة من approved/rejected، والوثيقة القديمة بعد `needs_changes`.
- **الفاعل الأساسي:** scheduled-job identity.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** triggers Sprint 08؛ التنفيذ Sprint 10.
- **المصدر:** `SCN-PRV-001` و`DEC-007` و`DEC-008`.
- **الشروط السابقة:** trigger وdeletion due صالحان.
- **السلوك المتوقع:** حذف idempotent مع metadata/Audit المسموحين.
- **سلوك الفشل:** retry وalert وAudit؛ لا تجاهل صامت.
- **قيود الأمن/الخصوصية:** Object Storage خاص قبل الإنتاج ولا public URL.
- **معايير القبول القابلة للاختبار:** due boundary/success/retry/alert/no-access-after-delete tests تمر.

#### `FR-PRV-002` — حذف الحساب

- **معرّف المتطلب:** `FR-PRV-002`
- **نص المتطلب:** يجب تحديد سياسة حذف الحساب وآثارها قبل تنفيذها أو الإنتاج.
- **الفاعل الأساسي:** مالك الحساب/الإدارة بحسب السياسة المستقبلية.
- **الأولوية:** Must قبل الإنتاج.
- **الحالة الحالية:** UNKNOWN.
- **Sprint المالك:** Sprint 10 بعد قرار قانوني/مالك.
- **المصدر:** `SCN-PRV-002` والقرار المفتوح لحذف الحساب.
- **الشروط السابقة:** اعتماد policy وretention/legal basis.
- **السلوك المتوقع:** غير محدد حتى القرار؛ لا يفترض cascade أو retention.
- **سلوك الفشل:** يمنع التنفيذ إن بقي القرار مفتوحاً.
- **قيود الأمن/الخصوصية:** يوازن الحذف وAudit والالتزامات القانونية.
- **معايير القبول القابلة للاختبار:** policy traceability ومصفوفة أثر واختبارات تعتمد بعد القرار.

### 6.9 التشغيل — `FR-OPS-*`

#### `FR-OPS-001` — حالات الواجهة والتعافي الآمن

- **معرّف المتطلب:** `FR-OPS-001`
- **نص المتطلب:** يجب أن توفر التدفقات للمستخدم loading/empty/error/forbidden/conflict/retry وتعافياً آمناً مع status feedback قابل للوصول.
- **الفاعل الأساسي:** جميع المستخدمين.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** Sprint 01–06 حالياً؛ Sprint 07–11 للاستكمال.
- **المصدر:** `SCN-OPS-001` وبوابات الإنتاج.
- **الشروط السابقة:** أي صفحة أو طلب UI قابل للانتظار أو الفراغ أو الفشل أو التعارض.
- **السلوك المتوقع:** تظهر الحالة الصحيحة ورسالة عربية وإجراء retry/recovery مناسب دون فقد المدخلات الآمنة، ويعلن status/error للتقنيات المساعدة.
- **سلوك الفشل:** لا success وهمي أو 404 مبكر أو صفحة مكسورة؛ تبقى العملية الحساسة fail-closed.
- **قيود الأمن/الخصوصية:** لا stack/tokens/PII/bytes في UI error؛ لا كشف مورد غير مصرح.
- **معايير القبول القابلة للاختبار:** loading/empty/error/403/409/retry/recovery وkeyboard/screen-reader feedback تمر في التدفقات العامة والمحمية.

#### `FR-OPS-002` — المرونة التشغيلية والرصد

- **معرّف المتطلب:** `FR-OPS-002`
- **نص المتطلب:** يجب أن يوفر النظام health/readiness وstructured redacted logging وcorrelation IDs ورؤية فشل المهام وإغلاقاً نظيفاً وتعافياً تشغيلياً.
- **الفاعل الأساسي:** فريق التشغيل وBackend service وscheduled-job identity.
- **الأولوية:** Must.
- **الحالة الحالية:** PARTIAL.
- **Sprint المالك:** Sprint 05–06 للأساس؛ Sprint 08–11 للاستكمال والإنتاج.
- **المصدر:** `SCN-OPS-001` وبوابات الإنتاج.
- **الشروط السابقة:** Backend أو job أو stack محلي/staging قيد التشغيل.
- **السلوك المتوقع:** health/readiness صحيحتان، logs منظمة ومردودة، correlation end-to-end، job failure ظاهر، clean shutdown يحرر العمليات والمنافذ، وobservability/recovery يختبران في بيئة production-like حيث يلزم.
- **سلوك الفشل:** لا توقف صامت أو success كاذب؛ يسجل الفشل الآمن وينبه ويتيح retry/rollback وفق runbook المعتمد.
- **قيود الأمن/الخصوصية:** لا tokens/credentials/document bytes/PII زائد في logs أو alerts؛ service identities بأقل صلاحية.
- **معايير القبول القابلة للاختبار:** health/readiness/redaction/correlation/job-failure/clean-shutdown/port-cleanup وrecovery/observability في staging تمر بأدلة آلية ويدوية مناسبة.

**عدد المتطلبات الوظيفية:** 37 متطلباً فريداً: `IMPLEMENTED 15`، `PARTIAL 11`، `PLANNED 10`، `UNKNOWN 1`. هذا توزيع المتطلبات بعد التفكيك الذري، وليس تصنيف السيناريوهات الـ34.

## 7. متطلبات Frontend

- واجهة عربية `dir="rtl"` مع Cairo وهوية بصرية قائمة، دون تغيير قواعد الأسعار أو المقارنة.
- الصفحات العامة: `/` و`/product?id=` و`/shop?id=` و`/compare` و404؛ يمنع legacy path.
- صفحات المصادقة: `/login` و`/register` و`/forgot-password` و`/verify-email` و`/account`.
- `/add` محمي بحالات الجلسة ويستخدم Backend API فقط لطلب الاعتماد.
- Admin routes/components مخططة Sprint 07؛ Merchant dashboard مخطط Sprint 09، ولا يدعي SRS وجودهما الآن.
- viewports: 320 و375 و768 و1024 و1280 مع منع overflow/clipping/layout shift.
- keyboard/focus-visible/tap targets/labels/alerts/landmarks/reduced-motion/no focus trap.
- حالات loading/empty/error/forbidden/conflict/retry لكل تدفق مناسب.
- الصور المحلية أو fallback بأبعاد ثابتة وalt عربي دون hotlink.
- metadata عربية؛ canonical/sitemap ينتظران domain معتمداً ولا يخترعان origin.

## 8. متطلبات Backend وAPI

### 8.1 ضوابط عامة

- Firebase bearer guard، verified-email guard، admin guard الحاليون؛ merchant/ownership/current-Shop guards مخططون.
- DTO strict، normalization، error envelope آمن، correlation IDs، redaction، rate/request limits.
- pagination مستقرة، optimistic concurrency للقرارات، OpenAPI متزامن، health/live وreadiness.

### 8.2 Routes موجودة في خط الأساس

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- `GET /api/v1/auth/me`
- `POST /api/v1/merchant-applications`
- `GET /api/v1/merchant-applications/me`
- `GET /api/v1/admin/merchant-applications` مع `status/limit/pageToken`
- `GET /api/v1/admin/merchant-applications/:uid`
- `GET /api/v1/admin/merchant-applications/:uid/document`
- `PATCH /api/v1/admin/merchant-applications/:uid/decision`

### 8.3 قدرات API مخططة دون تجميد route

- Admin summary endpoint read-only مطلوب، مع global counts معرفة وadmin auth/OpenAPI/rate-limit/errors واختبارات Emulator؛ list الحالية لا توفر totals عالمية موثوقة. إزالته أو استبداله بأعداد page-local يحتاج تغيير متطلبات معتمداً لاحقاً.
- `needs_changes` وresubmit وauthorized reapplication.
- Shop provisioning وclaim/suspension/reactivation/reconciliation.
- Shop profile وoffer ownership/CRUD/status/reconfirmation.
- notifications وscheduled deletion/job status.

لا يعتمد اسم route مخطط قبل تصميمه واعتماده؛ توثق العقود عند التنفيذ.

## 9. متطلبات البيانات

### 9.1 مصادر ومجموعات حالية

| المصدر | الاستخدام | الحالة |
|---|---|---|
| `data/products.ts` و`data/catalog.ts` | static catalog/shops/offers | IMPLEMENTED |
| `liveOffers` | عروض حية عامة؛ ملكية التاجر الجديدة غير منفذة | IMPLEMENTED/LEGACY PATH |
| `submissions` | سجل مسار أسعار تاريخي | IMPLEMENTED/LEGACY |
| `merchantApplications/{uid}` | metadata وحالة الطلب الحالي | IMPLEMENTED |
| `merchantDocuments/{uid}` | Bytes خاصة تطويرية | IMPLEMENTED/DEVELOPMENT-ONLY |
| `merchantApplicationAudits` | Audit قرار أساسي | IMPLEMENTED |
| Firebase Auth users/claims | الهوية وadmin claim؛ merchant claim مخطط | PARTIAL |

### 9.2 كيانات مخططة

- application cycle/link مع previous cycle وإذن reapplication.
- Shop مع `shopId/ownerUid/status/version`.
- Offer مع `offerId/shopId/product identity/condition/currency/status/version/timestamps`.
- Notification، expanded Audit، document metadata/deletion due، scheduled-job/dead-letter record.
- الأسماء والاحتفاظ النهائيان غير مجمدين قبل التصميم والقرار القانوني.

### 9.3 الملكية والفهارس والذرية

- `ownerUid` يكتبه Backend ولا يحرره التاجر؛ ملكية offer تستنتج من Shop.
- indexes تستمد من queries وتختبر في Emulator قبل النشر؛ bytes field معفى حالياً من الفهرسة.
- application/document batch ذري؛ decision/audit/version transaction ذرية داخل Firestore.
- Auth claims وFirestore بلا transaction مشتركة؛ provisioning fail-closed مع idempotency/retry/compensation/reconciliation.
- version/precondition يمنع lost updates؛ migration من live offers يحتاج inventory/dry-run/rollback.

## 10. نماذج الحالة

### 10.1 Merchant application

- `pending → approved`
- `pending → rejected`
- `pending → needs_changes → pending` مخطط.
- `approved/rejected` يغلقان الدورة؛ لا تعديل pending.

### 10.2 Reapplication

بعد `rejected` يمنح الأدمن إذناً مسجلاً؛ تنشأ دورة جديدة مرتبطة ووثيقة جديدة دون تعديل التاريخ السابق.

### 10.3 Shop

`active ↔ suspended`. يمنع Backend عمليات merchant عند suspended؛ أثر العروض العامة قرار مفتوح.

### 10.4 Offer

`active ↔ hidden` و`active/hidden → deleted`. `deleted` نهائي للتاجر. stale حالة مشتقة من العمر وليست حذفاً.

### 10.5 Document deletion

`available → deletion scheduled → deleted`، مع `failed/retry required` تشغيلي وتنبيه/Audit.

### 10.6 Provisioning

`not_started → in_progress(fail-closed) → completed` أو `reconciliation_required → in_progress/completed`. لا merchant operations حتى completed والتحقق الحالي من Shop والملكية والتعليق.

## 11. متطلبات الملفات والتخزين

- توقيع JPEG/PNG/WebP حقيقي؛ لا ثقة بـMIME أو extension وحدهما.
- الحجم من 1 byte إلى 700 KiB بالضبط شاملاً؛ 0 و700 KiB+1 مرفوضان.
- الوثيقة للأدمن المخول عبر Backend فقط؛ لا bytes في JSON.
- التنزيل يستخدم `Cache-Control: private, no-store` ولا permanent public URL.
- Firestore Bytes تطويري فقط ومحظور للوثائق التجارية الحقيقية.
- Object Storage خاص مطلوب قبل الإنتاج؛ المزود مفتوح.
- حذف bytes بعد 48 ساعة من approved/rejected، والوثيقة القديمة بعد `needs_changes`.
- فشل الحذف ينتج retry وalert وAudit، ولا يسجل نجاحاً كاذباً.

## 12. متطلبات الأمن

- التحقق من Firebase ID token والبريد الموثق حيث يلزم.
- Backend وحده يدير claims؛ لا client-controlled role/status/owner.
- منع direct-client لبيانات applications/documents/audits.
- فحص ownership وShop الحالي وsuspension لكل merchant mutation.
- provisioning fail-closed؛ stale claim وحده غير كافٍ.
- CORS exact allowlists، وHTTPS في staging/production.
- أسرار/ADC/service identity منفصلة عن `NEXT_PUBLIC_*` ولا ملفات مفاتيح في Git.
- least privilege للBackend/jobs وقواعد Firestore/Object Storage.
- validation للDTO والملف والحجم والتوقيع والWhatsApp.
- redaction وAudit وlogging بلا token/password/bytes/PII زائد أو stack.
- لا وثائق حقيقية قبل legal approval وObject Storage migration.

## 13. متطلبات الخصوصية والاحتفاظ

- جمع الحد الأدنى: لا صورة هوية أو عنوان منزل أو معلومات مصرفية أو بيانات غير لازمة؛ لا صورة واجهة في طلب الاعتماد.
- bytes تحذف وفق سياسة 48 ساعة؛ metadata/Audit المحدودان وفق مدد قانونية مفتوحة.
- حذف الحساب وآثاره `UNKNOWN` حتى قرار قانوني/مالك.
- physical retention للـSoft Delete مفتوح.
- retention للإشعارات والسجلات والـAudit مفتوح؛ لا تفترض الوثيقة مدة.
- الوثيقة خاصة ولا تعرض في list/detail JSON أو رابط دائم.

## 14. المتطلبات غير الوظيفية

| المعرّف | المتطلب | الحالة | المصدر/الربط | معيار قبول قابل للاختبار |
|---|---|---|---|---|
| `NFR-PERF-001` | يجب أن يبدأ Frontend الثابت بالبيانات المحلية دون انتظار live data. | IMPLEMENTED | `SCN-PUB-001` | ظهور المحتوى static ثم merge دون layout shift جوهري. |
| `NFR-PERF-002` | يجب تحديد budgets للأداء والأصول قبل الإنتاج دون اختراع أرقام الآن. | DEFERRED | بوابة الإنتاج | قياسات staging موثقة وحدود يعتمدها المالك. |
| `NFR-REL-001` | يجب أن تفشل العمليات الحساسة بصورة مغلقة وتوفر تعافياً آمناً محدداً في عقد كل عملية. لا تكون retries idempotent إلا عندما يفرض عقد العملية المحددة idempotency ويثبتها؛ وإلا يستخدم التعافي status lookup أو conflict handling أو reconciliation أو آلية موثقة أخرى. | PARTIAL | `SCN-OPS-001` | يثبت failure injection عدم حدوث partial authorization/data، وتثبت اختبارات كل عملية آلية التعافي الموثقة لها دون افتراض idempotency عامة؛ وعند ادعاء idempotency يجب أن يثبتها عقد واختبارات العملية نفسها. |
| `NFR-REL-002` | يجب كشف health/live وreadiness وإغلاق Backend والعمليات المحلية cleanly. | IMPLEMENTED | `SCN-OPS-001` | endpoints صحيحة والمنافذ تتحرر بعد الإغلاق. |
| `NFR-REL-003` | افتراضات availability وSLO تبقى مفتوحة حتى اختيار البنية. | UNKNOWN | القرار المفتوح للبنية التشغيلية | اعتماد SLO/monitor قبل production approval. |
| `NFR-SEC-001` | يجب تطبيق defense-in-depth بين token/guards/rules/ownership/status. | PARTIAL | `DEC-006` وبوابات الأمن | authz matrix وdirect-client denial تمر. |
| `NFR-SEC-002` | يجب منع الأسرار والوثائق وPII الزائد من logs/errors/artifacts. | PARTIAL | `SCN-OPS-001` | redaction scans واختبارات error envelopes تمر. |
| `NFR-PRV-001` | يجب تطبيق minimization وprivate Backend access ومنع direct-client وJSON redaction، ثم private Object Storage وحذف الوثيقة القابل للتدقيق قبل الإنتاج. | PARTIAL | `DEC-007` و`DEC-008` | الأدلة الحالية تثبت minimization وBackend-only access وdirect-client denial وعدم bytes في JSON؛ وتبقى Object Storage واختبارات حذف 48 ساعة/retry/alert بوابات إنتاج مطلوبة. |
| `NFR-PRV-002` | يجب اعتماد retention/account-deletion قانونياً قبل الإنتاج. | UNKNOWN | القرار المفتوح للاحتفاظ وحذف الحساب | policy ومصفوفة retention معتمدان. |
| `NFR-ACC-001` | يجب دعم keyboard/focus/landmarks/labels/status/errors دون focus trap. | PARTIAL | `SCN-OPS-001` | Playwright keyboard وفحص يدوي/AT. |
| `NFR-ACC-002` | يجب احترام reduced motion والتباين وحجوم اللمس والقراءة. | PARTIAL | `SCN-OPS-001` | automated/manual accessibility regression. |
| `NFR-ACC-003` | يجب الحفاظ على RTL والعربية عند 320/375/768/1024/1280 دون overflow. | PARTIAL | `SCN-OPS-001` | screenshots/bounding boxes/no horizontal scroll. |
| `NFR-SEO-001` | يجب توفير metadata/robots، وإضافة canonical/sitemap بعد domain فقط. | PARTIAL | بوابة Sprint 11 | deployed metadata validation بعد اعتماد domain. |
| `NFR-OPS-001` | يجب توفير structured redacted logs وcorrelation IDs وalerts. | PARTIAL | `SCN-OPS-001` | correlation/redaction/alert tests. |
| `NFR-OPS-002` | يجب فصل local/emulator/staging/production ومنع suites المحلية من live Firebase. | PARTIAL | بوابات الإنتاج | demo/loopback guards وإثبات isolation. |
| `NFR-OPS-003` | يجب تصميم backup/restore/rollback/DR دون افتراض RPO/RTO رقمي. | PLANNED | القرار المفتوح للبنية التشغيلية | runbooks وrestore/rollback drills معتمدة. |
| `NFR-OPS-004` | يجب اختبار هاتف سوري وبيانات موبايل ونسخة deployed قبل release. | DEFERRED | بوابة الإنتاج في Sprint 11 | أدلة manual/deployed QA. |
| `NFR-MNT-001` | يجب إبقاء TypeScript strict والعقود typed وOpenAPI متزامناً. | PARTIAL | `SCN-OPS-001` وبوابة الإنتاج | lint/type/unit/contract checks تمر لكل change. |
| `NFR-MNT-002` | يجب الحفاظ على توافق Frontend مع static export ومساراته الديناميكية المعتمدة. | IMPLEMENTED | `SCN-OPS-001` | build static في QA المناسب يخرج الصفحات المطلوبة دون اعتماد server runtime للواجهة. |
| `NFR-MNT-003` | يجب أن تكون المنظومة قابلة للاختبار عبر adapters وpure logic وEmulators. | PARTIAL | بوابة `ui.spec.ts` وخطة QA | deterministic unit/integration/E2E دون live services. |
| `NFR-MNT-004` | لا تضاف dependency دون حاجة موثقة ومراجعة lockfile وأمن/ترخيص حيث ينطبق، ثم regression/build verification. | PARTIAL | `SCN-OPS-001` وبوابة الإنتاج | يسجل سبب الإضافة، ويراجع package/lockfile والتأثير الأمني/الترخيصي المناسب، وتمر الفحوص والبناء والانحدارات المتأثرة. |

لا تعتمد الوثيقة أرقام SLA أو RPO أو RTO أو performance budget قبل قرار موثق.

**عدد المتطلبات غير الوظيفية:** 21 متطلباً فريداً: `IMPLEMENTED 3`، `PARTIAL 13`، `PLANNED 1`، `UNKNOWN 2`، `DEFERRED 2`.

## 15. متطلبات التحقق والأخطاء

| الحالة | العقد المطلوب |
|---|---|
| Validation | HTTP مناسب وcode ثابت ورسالة عربية آمنة و`correlationId`. |
| Missing/invalid auth | `401` دون raw token/provider detail. |
| Insufficient role/ownership | `403` دون كشف مورد غير مصرح. |
| Duplicate application | conflict ثابت دون إنشاء سجل جزئي. |
| Version conflict | `409` آمن يطلب refresh/retry واعياً. |
| Not pending | رفض القرار دون Audit قرار ناجح. |
| Reject بلا reason | validation failure؛ لا mutation. |
| File signature/size | رفض signature غير حقيقي و0 و700 KiB+1؛ قبول الحدين 1 و700 KiB. |
| Rate limit | `429` برسالة آمنة وheaders المعتمدة. |
| Storage/job failure | retry/alert/Audit ولا نجاح كاذب أو حذف metadata اللازم. |

لا يعرض أي خطأ stack trace أو secret أو token أو document bytes أو PII زائد، ولا يكشف reset وجود الحساب.

## 16. استراتيجية الاختبار والقبول

- **Unit:** pure logic، validation، state machines، date/currency، authz helpers وredaction.
- **Integration:** controller/service/repository، contracts، transactions، concurrency والفشل.
- **Rules:** allow/deny والعام مقابل الخاص والملكية.
- **Auth/Firestore Emulator:** dummy claims/users/data وjobs دون اتصال حي.
- **Integrated E2E:** Frontend + Backend + Emulators، owner/admin/merchant/session refresh.
- **Playwright:** regression للكتالوج والمقارنة/media/auth/forms/UI الجديدة.
- **Owner QA:** checklist مرقمة وPASS/FAIL/BLOCKED؛ لا Sprint مغلق بلا موافقة.
- **Responsive/a11y:** viewports الخمسة، keyboard/focus/reduced-motion/AT/overflow/layout stability.
- **Security/recovery:** malicious upload، authz، rate/body limits، replay/concurrency، failure injection، restore/rollback.
- **Staging/deployed:** HTTPS/CORS/domain/indexes/storage/jobs/SEO/observability.
- **ميداني:** هاتف فعلي وبيانات موبايل سورية دون VPN في Sprint 11.

## 17. متطلبات البيئات والنشر

- Local development بإعدادات غير ملتزمة؛ Emulator QA بمشروع `demo-*` وloopback وdummy fixtures.
- staging منفصل production-like ببيانات صناعية؛ production منفصل ولا يستخدم قبل الموافقة.
- hosting/domain/provider مفتوحة؛ CORS origins exact وHTTPS إلزامي خارج loopback.
- Backend يستخدم ADC/service identity لا client credentials.
- rules/indexes تخضع لمراجعة واختبارات Emulator ونشر مضبوط.
- Object Storage خاص قبل الإنتاج مع lifecycle/delete/least privilege.
- monitoring/logs/metrics/alerts وrunbooks للحذف والفشل والأمن.
- backup/restore/rollback/DR تختبر بعد اعتماد RPO/RTO والسياسات؛ لا أرقام مفترضة.
- release يحتاج كل بوابات القسم 21 وموافقة مالك صريحة.

## 18. حالة التنفيذ الحالية

### 18.1 منفذ حتى Sprint 06

الكتالوج والفلاتر والأسعار/القدم والصفحات والمقارنة/media، Firebase Auth، بوابات `/add`، رفع طلب multipart، حالات الطلب الحالية، NestJS security foundation، owner/admin APIs الحالية، التحقق من الملف، الإنشاء الذري، approve/reject/version/Audit، ومنع direct-client للبيانات الخاصة.

### 18.2 جزئي

ترتيب unknown live loading، حقول الطلب الكاملة، إعادة التقديم، Admin UI/summary، وثيقة private UI، decision UI، إدارة السعر السباعي، حذف الوثيقة، والتشغيل/التعافي الشامل.

### 18.3 مخطط Sprint 07–11

- Sprint 07: Admin dashboard وsummary contract الموثوق.
- Sprint 08: `needs_changes`/resubmit/reapplication/Shop/claim/provisioning/suspension/notifications/Audit.
- Sprint 09: Merchant dashboard وShop/offer ownership/CRUD/status/seven-day cycle.
- Sprint 10: security/privacy/account policy/document jobs/Object Storage/retention/backup/recovery.
- Sprint 11: reconciliation وfinal QA وdeployed/physical testing وrelease approval.

### 18.4 مجهول ومؤجل

حذف الحساب وقرارات retention/provider/domain/hosting/suspension impact والمخططات التشغيلية مجهولة. Object Storage، حذف 48 ساعة، staging/production، الاختبار الميداني والقانوني بوابات مؤجلة لا تعد منفذة.

## 19. مصفوفات التتبع

### 19.A السيناريو إلى المتطلبات

| Scenario ID | Requirement IDs | الحالة | Sprint المالك | Frontend | Backend/API | البيانات/التخزين | الدليل/الاختبار |
|---|---|---|---|---|---|---|---|
| `SCN-PUB-001` | `FR-PUB-001` | IMPLEMENTED | 01–02 | Home/CatalogProvider | live read fallback | static + liveOffers | UI/E2E regression |
| `SCN-PUB-002` | `FR-PUB-002` | IMPLEMENTED | 01 | Home filters | — | view model | Unit + Playwright |
| `SCN-PUB-003` | `FR-PUB-003` | IMPLEMENTED | 01/09 | ProductList | reconfirm مخطط | offer dates/currency | UTC unit + E2E |
| `SCN-PUB-004` | `FR-PUB-004` | IMPLEMENTED | 01–02 | product/shop | public read | shops/offers | links/WhatsApp E2E |
| `SCN-PUB-005` | `FR-PUB-005` | PARTIAL | pre-07/11 | loading/not-found | fallback | static/live | deterministic adapter مخطط |
| `SCN-CMP-001` | `FR-CMP-001` | IMPLEMENTED | regression | CompareProvider/tray | — | localStorage | Unit + Playwright |
| `SCN-CMP-002` | `FR-CMP-002` | IMPLEMENTED | regression | Compare page/media | — | specs/catalog | Coverage + Playwright |
| `SCN-AUTH-001` | `FR-AUTH-001` | IMPLEMENTED | 03 | register/verify | token لاحقاً | Firebase Auth | mocked E2E/manual |
| `SCN-AUTH-002` | `FR-AUTH-002` | IMPLEMENTED | 03 | AuthProvider/account | token verify | Auth session | Unit/E2E |
| `SCN-AUTH-003` | `FR-AUTH-003` | IMPLEMENTED | 03 | forgot-password | — | Auth | privacy E2E |
| `SCN-AUTH-004` | `FR-AUTH-004` | IMPLEMENTED | 03 | Google UI | token verify | provider identity | adapter/E2E |
| `SCN-AUTH-005` | `FR-AUTH-005` | IMPLEMENTED | 03 | route/returnTo | guards | session | sanitizer/E2E |
| `SCN-MER-001` | `FR-MER-001` | IMPLEMENTED | 03–06 | `/add` gate | verified guard | auth/status | integrated E2E |
| `SCN-MER-002` | `FR-MER-002` | PARTIAL | 08 | application form | DTO planned | application metadata | validation/E2E |
| `SCN-MER-003` | `FR-MER-003` | IMPLEMENTED | 04/06/10 | file UI | signature/size | Bytes→Object Storage | boundary/authz |
| `SCN-MER-004` | `FR-MER-004` | IMPLEMENTED | 06 | multipart/status recovery | atomic create/duplicate conflict | application/document | atomicity/duplicate/uncertain-result recovery |
| `SCN-MER-005` | `FR-MER-005` | IMPLEMENTED | 04/06 | status screens | owner GET | application | integrated E2E |
| `SCN-MER-006` | `FR-MER-006` | PLANNED | 08 | edit/resubmit | transition | cycle/new document | state/API/E2E planned |
| `SCN-MER-007` | `FR-MER-007` | PARTIAL | 08 | rejected/reapply | authorization | linked cycles/Audit | authz/E2E planned |
| `SCN-ADM-001` | `FR-ADM-001` | PARTIAL | 07 | Admin shell | admin guard موجود | — | guard/UI planned |
| `SCN-ADM-002` | `FR-ADM-002`, `FR-ADM-006` | PARTIAL | 07 | list + summary states | list موجود؛ summary endpoint مخطط | index/apps/counts | pagination + deterministic summary contract/E2E |
| `SCN-ADM-003` | `FR-ADM-003` | PARTIAL | 07/10 | detail/viewer | detail/document موجود | private storage | no-store/authz planned |
| `SCN-ADM-004` | `FR-ADM-004` | PARTIAL | 06/07 | decision UI | decision موجود | version/Audit | API موجود/UI planned |
| `SCN-ADM-005` | `FR-ADM-005`, `FR-PRV-001` | PLANNED | 08/10 | needs_changes + deletion state | decision + scheduled deletion | version/Audit/deletion due/storage | state/linkage + job/retry/alert tests |
| `SCN-SHP-001` | `FR-SHP-001` | PLANNED | 08 | refreshed role | provisioning | Shop/claim/Audit | failure/reconciliation planned |
| `SCN-SHP-002` | `FR-SHP-002` | PLANNED | 09 | merchant profile | Shop update | Shop/Audit | ownership/E2E planned |
| `SCN-SHP-003` | `FR-SHP-003` | PLANNED | 08/10 | suspended UX | status guards | Shop status/Audit | stale-session planned |
| `SCN-OFR-001` | `FR-OFR-001`, `FR-OFR-005` | PLANNED | 09 | offer list + create | owned list + create | offers/indexes/atomicity policy | pagination + multi-create/failure E2E |
| `SCN-OFR-002` | `FR-OFR-002` | PLANNED | 09 | edit/conflict | ownership/version | offer metadata | concurrency planned |
| `SCN-OFR-003` | `FR-OFR-003` | PLANNED | 09/10 | status actions | transitions/Audit | status/deletedAt | public exclusion planned |
| `SCN-OFR-004` | `FR-OFR-004` | PARTIAL | 01/09 | stale/reconfirm | trusted timestamp | 7-day cycle | UTC/integrated planned |
| `SCN-PRV-001` | `FR-PRV-001` | PARTIAL | 08/10 | deletion state | scheduled job | private storage | job/retry planned |
| `SCN-PRV-002` | `FR-PRV-002` | UNKNOWN | 10 | account UX | orchestration open | retention open | legal/test plan later |
| `SCN-OPS-001` | `FR-OPS-001`, `FR-OPS-002` | PARTIAL | 01–11 | accessible UI states/recovery | health/logging/correlation/shutdown | jobs/alerts/observability | UI recovery + operational/drill evidence |

**التوزيع:** `IMPLEMENTED 15`، `PARTIAL 10`، `PLANNED 8`، `UNKNOWN 1`؛ الإجمالي 34.

**توزيع المتطلبات الوظيفية المرتبطة:** `IMPLEMENTED 15`، `PARTIAL 11`، `PLANNED 10`، `UNKNOWN 1`؛ الإجمالي 37. زيادة العدد ناتجة عن تفكيك السيناريو الواحد إلى متطلبات ذرية ولا تغير تصنيف السيناريو.

### 19.B المتطلبات إلى Sprint

| Sprint/مرحلة | المتطلبات |
|---|---|
| Sprint 01–02 | `FR-PUB-001`–`FR-PUB-005`، `FR-CMP-001`–`FR-CMP-002`، جزء `FR-OFR-004`، NFR accessibility/SEO الحالية |
| Sprint 03 | `FR-AUTH-001`–`FR-AUTH-005` وجزء `FR-MER-001` |
| Sprint 04–06 | `FR-MER-001`–`FR-MER-005`، أجزاء `FR-MER-007` و`FR-ADM-001`–`FR-ADM-004`، Backend NFRs الحالية |
| قبل Sprint 07 | حسم `FR-PUB-005`، اعتماد SRS v2 وbaseline نظيف |
| Sprint 07 | `FR-ADM-001`–`FR-ADM-004` و`FR-ADM-006` للsummary الموثوق |
| Sprint 08 | `FR-MER-002` و`FR-MER-006`–`FR-MER-007` و`FR-ADM-005` و`FR-SHP-001` و`FR-SHP-003` |
| Sprint 09 | `FR-SHP-002` و`FR-OFR-001`–`FR-OFR-005` |
| Sprint 10 | `FR-PRV-001`–`FR-PRV-002`، storage/security/privacy وNFR production hardening |
| Sprint 11 | استكمال `FR-OPS-001` و`FR-OPS-002`، reconciliation وجميع NFR deployment/field gates |

### 19.C المتطلبات إلى مستوى الاختبار

| المجموعة | Unit | Integration/API | Rules/Emulator | Playwright/E2E | Manual/production-like |
|---|---|---|---|---|---|
| `FR-PUB-*`, `FR-CMP-*` | view/date/currency/storage | live parsing | public rules | public/media/compare | responsive/a11y/deployed |
| `FR-AUTH-*` | adapters/validation/sanitizer | token guards | Auth Emulator | mocked/integrated auth | provider/session review |
| `FR-MER-*` | DTO/file/state | multipart/status/transitions | private denial/atomicity | `/add` workflows | owner application QA |
| `FR-ADM-*` | components/contracts/count definitions | list/summary/detail/decision/rate limit | admin fixtures + deterministic global counts | Admin UI states | private doc/decision/summary QA |
| `FR-SHP-*` | state/provisioning | claims/Shop/reconciliation | ownership/denial | role/session flows | failure/suspension QA |
| `FR-OFR-*` | validation/stale/transitions/duplicate policy | list/create/CRUD/concurrency/multi-create failure | ownership/public read | merchant/public UI | two-owner/partial-failure QA |
| `FR-PRV-*`, `FR-OPS-*` | retention/job/idempotency/UI states | storage/jobs/health/logging/correlation/errors | service auth | recovery/accessibility UI | clean shutdown/staging/restore/field |
| `NFR-*` | policy helpers | cross-cutting contracts | isolation/security | a11y/responsive/regression | dependency/lockfile review وstaging/deployed/security/DR |

## 20. القرارات المفتوحة والافتراضات

تبقى دون حسم:

1. مزود Object Storage وبنية الوصول والتشفير والbackup.
2. مدة الحذف الفيزيائي لعروض Soft Delete.
3. سياسة حذف الحساب وآثارها.
4. أثر suspension على العروض العامة.
5. عملية التحقق القانوني والجهة المسؤولة.
6. مدد metadata/Audit/notification/log retention.
7. hosting/domain/CORS/observability/backup/DR/rollback وSLO/RPO/RTO.
8. حقول وحدود بحث الأدمن.
9. نموذج application cycles والروابط.
10. scheduler/retry/alert/dead-letter لحذف الوثائق.
11. قناة notifications والاحتفاظ.
12. تزامن claims والحالة ومنع الكتابة فور التعليق.
13. offer schema/migration و`ownerUid/shopId` النهائيان.
14. canonical/sitemap بعد domain.
15. المتطلبات القانونية والتنظيمية الإضافية.

الافتراضات الوحيدة: Firebase Authentication مستمر، Frontend static، Backend trusted، ولا وثائق حقيقية قبل legal/storage gates. أي تغيير يحتاج قراراً وتحديث traceability.

## 21. بوابات الجاهزية للإنتاج

- [ ] مراجعة قانونية/خصوصية وسياسات retention/account deletion.
- [ ] private Object Storage وعدم Firestore Bytes حقيقية.
- [ ] حذف 48 ساعة آلي مع retry/alert/Audit.
- [ ] staging production-like منفصل.
- [ ] secrets/ADC/exact CORS/HTTPS/TLS وleast privilege.
- [ ] rules/indexes منشورة ومختبرة بلا توسيع وصول.
- [ ] backup/restore/rollback/DR drills وسياسات معتمدة.
- [ ] observability/alerts/incident ownership.
- [ ] full unit/integration/rules/emulator/E2E/regression/security/a11y/performance pass.
- [ ] هاتف سوري وبيانات موبايل دون VPN.
- [ ] deployed-site وSEO/domain tests.
- [ ] privacy/terms وlegal sign-off.
- [ ] reconciliation نهائي للـSRS والتنفيذ وrelease status.
- [ ] موافقة مالك صريحة على النشر.

## 22. قائمة مراجعة المالك

- [x] اعتماد purpose/scope/geography/category/exclusions.
- [x] اعتماد التعريفات والأدوار والصلاحيات.
- [x] مراجعة المتطلبات الوظيفية الـ37 الذرية وحالاتها وأولوياتها وربطها بالسيناريوهات الـ34.
- [x] مراجعة NFRs الـ21 دون افتراض SLA/RPO/RTO، بما فيها حوكمة dependencies مستقلة عن static export.
- [x] اعتماد فصل APIs الموجودة عن القدرات المخططة.
- [ ] اعتماد data/state/provisioning/storage models.
- [x] تأكيد توزيع Sprint 07–11 ومصفوفات traceability.
- [x] إبقاء القرارات المفتوحة دون حسم غير موثق.
- [ ] جدولة legal/privacy/infrastructure decisions قبل بواباتها.
- [ ] اعتماد استراتيجية الاختبار وproduction gates.
- [x] تأكيد أن SRS v1.0 تاريخي وغير معدل.
- [x] اعتماد هذه الوثيقة قبل بدء Sprint 07، ثم إصدار PDF في مهمة منفصلة فقط.

> هذه الوثيقة **APPROVED — OWNER APPROVED**. لا تحول المتطلبات المخططة أو المجهولة إلى تنفيذ قائم، ولا تفوض النشر أو معالجة وثائق تجارية حقيقية.
