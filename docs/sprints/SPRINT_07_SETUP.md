# Sprint 07 — إعداد QA المحلي للوحة الأدمن

الحالة: **CLOSED — OWNER APPROVED** بتاريخ 2026-11-08. يحتفظ هذا الملف بإجراءات QA المحلية القابلة لإعادة التشغيل؛ لا يفوض تشغيل Firebase حي أو بيانات حقيقية.

## التشغيل من PowerShell

من جذر المشروع:

```powershell
npm run qa:sprint07
```

يبني الأمر Frontend وBackend، ثم يشغل Auth وFirestore على loopback لمشروع `demo-sa3erli-sprint05` فقط، ويزرع حسابات وطلبات ووثائق صورية وهمية، ويشغل الواجهة على `http://127.0.0.1:4000` والـAPI على `http://127.0.0.1:4100`. اضغط Enter في نافذة الأمر لإيقاف كل العمليات.

لا يقبل runner مشروعاً لا يبدأ بـ`demo-` أو Auth/Firestore hosts خارج loopback، ولا يحتوي fallback إلى Firebase حي. البيانات الوهمية فقط؛ يمنع استخدام وثيقة تجارية أو بريد أو رقم حقيقي.

## أوامر reset والتحقق

أثناء عمل المحاكيات، من نافذة PowerShell ثانية:

```powershell
npm --prefix backend run seed:sprint07
npm --prefix backend run verify:sprint07:summary
```

الـseed idempotent وينشئ 3 pending و2 approved و2 rejected مع JPEG/PNG/WebP وهمية وaggregate مطابق. verifier يعيد حساب الأعداد من `merchantApplications` ويقرأ aggregate دون تعديل أو طباعة PII.

لفحص الانحراف والإصلاح المحلي فقط:

```powershell
npm --prefix backend run seed:sprint07 -- drift
npm --prefix backend run verify:sprint07:summary
npm --prefix backend run repair:sprint07:summary
npm --prefix backend run verify:sprint07:summary
```

يخرج verifier بحالة غير ناجحة عند الانحراف. الإصلاح التلقائي محصور برمجياً في مشروع `demo-*` مع Auth وFirestore على loopback؛ لا توجد آلية إصلاح production في Sprint 07.

للتشغيل الآلي المتكامل:

```powershell
npm run test:sprint07:integrated
```

## المسارات المحلية

- لوحة الأدمن: `http://127.0.0.1:4000/admin`
- تفاصيل الطلب: `http://127.0.0.1:4000/admin/application?id=<uid>`
- Backend: `http://127.0.0.1:4100/api/v1`
- OpenAPI: `http://127.0.0.1:4100/api/v1/docs`
- OpenAPI JSON: `http://127.0.0.1:4100/api/v1/docs-json`

## عقود مهمة للـQA

- الملخص من `GET /api/v1/admin/merchant-applications/summary`، بحد 30 طلباً خلال 60 ثانية، ولا يعيد صفراً مضللاً عند غياب/فساد aggregate.
- القائمة تستخدم `status`, `limit`, `pageToken` فقط؛ `limit` افتراضياً 20 ونطاقه 1–50.
- JSON القائمة مصغر إلى `ownerId`, `shop.name`, `shop.area`, `status`, `submittedAt`, `version`، ولا يحتوي bytes أو بيانات المراجعة التفصيلية.
- الوثيقة لا تُطلب إلا بفعل صريح، وتصل كـattachment خاص مع `private, no-store, max-age=0`, و`no-cache`, و`nosniff`.
- قرار الرفض يحتاج سبباً؛ قرار الموافقة لا يرسل سبباً ولا يبقي `rejectionReason`.
- حالات MQ-001 إلى MQ-012 وخطواتها موجودة في [SPRINT_07_TEST.md](../../tests/sprints/SPRINT_07_TEST.md).

## ما لا يفعله هذا التشغيل

لا ينشر، ولا يصل إلى Firebase حي، ولا يصلح aggregate إنتاجياً، ولا ينفذ `needs_changes` أو Shop/merchant claims أو Merchant dashboard أو Offer CRUD أو Object Storage. تبقى Firestore Bytes للتطوير المحلي فقط.
