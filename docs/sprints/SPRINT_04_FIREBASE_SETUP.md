# إعداد Firebase — Sprint 04

لا تستخدم Firebase Storage أو أي خدمة ملفات خارجية في هذا السبرنت. التخزين الحالي مؤقت داخل Firestore.

## QA يدوي محلي بلا Firebase حي

شغّل من جذر المشروع:

```powershell
npm run qa:sprint04
```

هذا هو أمر جلسة QA الكامل: يضبط إعدادات demo داخل العملية فقط، يبني static export، يشغّل Auth وFirestore وHosting Emulators على `127.0.0.1:9099` و`127.0.0.1:8080` و`127.0.0.1:4000`، يبذر fixtures، ثم ينتظر Enter قبل الإيقاف النظيف. لا يقرأ إعدادات المشروع الحي ولا يكتب إليه. يستخدم المشروع المحجوز `demo-sa3erli-sprint04`، لذلك تمنع Firebase CLI أي خدمة غير محاكية.

الحماية مزدوجة: يلزم العلم الصريح `NEXT_PUBLIC_FIREBASE_EMULATOR_MODE=1` وقت البناء، ويلزم أن يكون `window.location.hostname` هو `localhost` أو loopback. إذا نُقلت هذه النسخة إلى مضيف آخر تكون الوجهة `blocked` ولا تهيئ Firebase الحي. عناوين Auth/Firestore ثابتة في الكود على loopback ولا يوجد fallback حي.

الحسابات، كلمة المرور الوهمية، ملفات JPEG/PNG/WebP الاصطناعية، وأوامر reset/reseed موثقة بالتفصيل في `tests/sprints/SPRINT_04_TEST.md`. بعد التشغيل يمكن إعادة السيناريو من نافذة ثانية:

```powershell
npm run qa:sprint04:reseed -- status
npm run qa:sprint04:reseed -- duplicate
npm run qa:sprint04:reseed -- failure
npm run qa:sprint04:reseed -- privacy
```

`npm run qa:sprint04:reset` يمسح Auth وFirestore Emulator فقط. لا تشغّل أوامر reseed دون جلسة المحاكيات المحلية.

لإعادة الحالات العشر آلياً مع فحص UI وحالة Emulator وحفظ الأدلة:

```powershell
npm run qa:sprint04:auto
```

يحفظ الأمر JSON والصور تحت `test-artifacts/sprint04-qa/` ثم يوقف الخدمات تلقائياً. لا يستخدم هذا الأمر المشروع الحي.

## خطوات يدوية قبل بيئة الإنتاج اللاحقة

1. راجع ثم انشر `firestore.rules` من **Firestore Database > Rules**. لم ينشر Codex أي قواعد.
2. طبّق إعفاء الفهرسة الموجود في `firestore.indexes.json` لحقل `merchantDocuments.bytes` من إعدادات فهارس Firestore أو عبر مسار النشر المعتمد لاحقاً.
3. أبقِ Email/Password أو Google مفعّلين، وتأكد أن بريد المالك موثّق؛ القواعد تتطلب `email_verified == true`.
4. امنح `admin: true` من بيئة خادم موثوقة فقط باستخدام Admin SDK/custom claims، ثم أعد تسجيل دخول الأدمن لتحديث token. لا توجد واجهة عميل تمنح هذا الادعاء.
5. لا تضف متغير Storage إلى `.env.local`؛ المتغيرات المطلوبة هي متغيرات Firebase العامة الموجودة في `.env.example` فقط.

## عقد البيانات المؤقت

- `merchantApplications/{uid}`: `ownerId`, و`shop`, و`status: pending`, و`submittedAt`.
- `merchantDocuments/{uid}`: `bytes` من نوع Firestore Bytes، و`fileName`, و`contentType`, و`size`, و`createdAt`.
- يُنشأ المستندان معاً باستخدام `writeBatch`. تستخدم القواعد `getAfter()` لرفض المستند المنفرد أو غير المتطابق.
- أنواع الصور المقبولة: JPEG وPNG وWebP فقط، من 1 byte إلى 700 KiB (716800 bytes).
- لا يوجد URL عام، ولا Base64، ولا تُحمّل الصورة عند قراءة قائمة الطلبات لأنها في collection منفصلة.
- المالك المسجل والموثق ينشئ ويقرأ مستنديه فقط. الأدمن صاحب `admin: true` يستطيع قراءة/list الطلبات والوثائق وتغيير الحالة من pending إلى approved/rejected.
- لا يستطيع العميل تعديل أو حذف الوثيقة، ولا تعيين approved/rejected.
- `liveOffers` و`submissions` لا تقبلان الكتابة إلا من مستخدم موثّق يملك طلباً approved وبيانات محل مطابقة.

## TODO للإنتاج

التخزين داخل مستند Firestore حل مؤقت للاختبار. قبل الإنتاج تُنقل الوثائق إلى خدمة object storage آمنة مع وصول خاص ومسح محتوى وسياسة احتفاظ. لم يُختَر أو يُدمج أي مزود في Sprint 04.
