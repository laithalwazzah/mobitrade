# إعداد Firebase Authentication — Sprint 03

هذه الخطوات يدوية في Firebase Console ولا تغيّر Firestore أو قواعده.

1. افتح مشروع Firebase ثم **Authentication > Get started**.
2. من **Sign-in method** فعّل **Email/Password** (الخيار الأول فقط، ولا حاجة إلى Email link).
3. فعّل **Google**، واختر بريد دعم المشروع ثم احفظ.
4. من **Settings > Authorized domains** تأكد من وجود `localhost` للاختبار المحلي. أضف نطاق النشر الحقيقي لاحقاً فقط بعد اختياره.
5. راجع قوالب رسائل **Email verification** و**Password reset**. لا تضع رابط إنتاج افتراضياً قبل النشر.
6. ضع أسماء المتغيرات التالية في `.env.local` محلياً بالقيم التي يعطيها إعداد Web App في Firebase:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
7. أعد تشغيل خادم التطوير بعد تغيير البيئة. لا ترفع `.env.local` ولا تنسخ قيمه إلى التوثيق.

بعد التفعيل، اختبر التسجيل، وصول رسالة التحقق، إعادة تعيين كلمة المرور، وGoogle بحساب اختبار يملكه صاحب المشروع. Sprint 03 لا ينشئ ملف مستخدم في Firestore ولا دور محل أو مدير.
