# سعّرلي

موقع عربي لمقارنة أسعار الموبايلات بين محلات اللاذقية. يبدأ بالبيانات المحفوظة داخل المشروع، ثم يحمّل أحدث عروض المحلات من Firebase في المتصفح.

## التشغيل محلياً

```bash
npm run dev
```

ثم افتح `http://localhost:3000`.

## بناء النسخة الثابتة

```bash
npm run build
```

ينتج الموقع الثابت داخل مجلد `out/`، ويمكن تقديمه من أي استضافة تدعم ملفات HTML وCSS وJavaScript الثابتة.

## البيانات والأسعار

تبقى `data/products.ts` هي البيانات الأساسية التي تظهر عندما يكون Firebase غير متوفر. طلبات `/add` الناجحة تكتب عروضاً حية في مجموعة `liveOffers` وتظهر في الموقع دون إعادة بناء، مع الاحتفاظ بسجل لكل إرسال في مجموعة `submissions`.

## إعداد Firebase

انسخ `.env.example` إلى `.env.local` وأضف القيم المناسبة لهذه المتغيرات:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

إذا لم تكن إعدادات Firebase متوفرة، ينتقل نموذج إرسال الأسعار إلى WhatsApp تلقائياً.

يجب نشر محتوى `firestore.rules` يدوياً من تبويب Rules في Firebase Console قبل استخدام الكتابة والقراءة الحية.

## اختبارات المتصفح

بعد تشغيل `npm run build`، شغّل اختبارات Playwright على النسخة الثابتة بالأمر:

```bash
npm run test:e2e
```

تبدأ الاختبارات خادماً محلياً على المنفذ `4000` وتوقفه عند الانتهاء. اختبارات Firebase الحية تنشئ بيانات اختبار واضحة، لذلك يجب حذف معرّفاتها يدوياً من Firebase Console بعد الاختبار.
