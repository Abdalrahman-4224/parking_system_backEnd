# توثيق واجهة برمجة التطبيقات لنظام المواقف

## جدول المحتويات
- [نظرة عامة](#نظرة-عامة)
- [الرابط الأساسي](#الرابط-الأساسي)
- [المصادقة](#المصادقة)
- [صيغة الاستجابة](#صيغة-الاستجابة)
- [رموز الأخطاء](#رموز-الأخطاء)
- [نقاط النهاية](#نقاط-النهاية)
  - [المصادقة](#نقاط-نهاية-المصادقة)
  - [مواقع المواقف](#نقاط-نهاية-مواقع-المواقف)
  - [أماكن الوقوف](#نقاط-نهاية-أماكن-الوقوف)
  - [الحجوزات](#نقاط-نهاية-الحجوزات)

---

## نظرة عامة

واجهة برمجة تطبيقات RESTful لإدارة نظام المواقف مع مصادقة المستخدمين، وتتبع توفر أماكن الوقوف، وإدارة الحجوزات.

**الإصدار:** 1.0.0
**الرابط الأساسي:** `http://localhost:3000/api/v1`

---

## الرابط الأساسي

```
http://localhost:3000/api/v1
```

جميع نقاط النهاية تبدأ بالبادئة `/api/v1`

---

## المصادقة

تستخدم واجهة برمجة التطبيقات هذه JWT (رمز الويب JSON) للمصادقة.

### كيفية المصادقة

1. سجل أو سجل الدخول لتلقي رمز JWT
2. قم بتضمين الرمز في رأس `Authorization` للمسارات المحمية:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### انتهاء صلاحية الرمز

تنتهي صلاحية الرموز بعد **7 أيام** افتراضياً.

---

## صيغة الاستجابة

### استجابة النجاح

```json
{
  "success": true,
  "message": "العملية نجحت",
  "data": {
    // بيانات الاستجابة هنا
  }
}
```

### استجابة الخطأ

```json
{
  "success": false,
  "message": "رسالة الخطأ",
  "errors": [
    {
      "field": "اسم الحقل",
      "message": "تفاصيل الخطأ"
    }
  ]
}
```

---

## رموز الأخطاء

| رمز الحالة | الوصف |
|-------------|--------|
| 200 | نجح |
| 201 | تم الإنشاء |
| 400 | طلب خاطئ (خطأ في التحقق) |
| 401 | غير مصرح (رمز مفقود أو غير صالح) |
| 403 | ممنوع (الحساب معطل) |
| 404 | غير موجود |
| 500 | خطأ في الخادم الداخلي |

---

## نقاط النهاية

### فحص الصحة

التحقق من تشغيل خادم الواجهة البرمجية.

**نقطة النهاية:** `GET /health`

**المصادقة:** غير مطلوبة

**الاستجابة:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-26T10:30:00.000Z"
}
```

---

## نقاط نهاية المصادقة

### 1. تسجيل مستخدم

إنشاء حساب مستخدم جديد.

**نقطة النهاية:** `POST /auth/register`

**المصادقة:** غير مطلوبة

**نص الطلب:**
```json
{
  "username": "john_doe",
  "phoneNumber": "+1234567890",
  "password": "password123"
}
```

**قواعد التحقق:**
- `username`: من 3-50 حرف، مطلوب
- `phoneNumber`: صيغة هاتف صالحة، مطلوب، فريد
- `password`: 6 أحرف على الأقل، مطلوب

**استجابة النجاح (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "createdAt": "2025-12-26T10:30:00.000Z",
      "updatedAt": "2025-12-26T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**استجابة الخطأ (400):**
```json
{
  "success": false,
  "message": "Phone number already registered"
}
```

---

### 2. تسجيل الدخول

المصادقة والحصول على رمز JWT.

**نقطة النهاية:** `POST /auth/login`

**المصادقة:** غير مطلوبة

**نص الطلب:**
```json
{
  "phoneNumber": "+1234567890",
  "password": "password123"
}
```

**استجابة النجاح (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "createdAt": "2025-12-26T10:30:00.000Z",
      "updatedAt": "2025-12-26T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**استجابات الخطأ:**

بيانات اعتماد غير صالحة (401):
```json
{
  "success": false,
  "message": "Invalid phone number or password"
}
```

الحساب معطل (403):
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

---

### 3. الحصول على ملف المستخدم الشخصي

الحصول على معلومات ملف المستخدم المصادق عليه.

**نقطة النهاية:** `GET /auth/profile`

**المصادقة:** مطلوبة

**الرؤوس:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**استجابة النجاح (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "createdAt": "2025-12-26T10:30:00.000Z",
      "updatedAt": "2025-12-26T10:30:00.000Z"
    }
  }
}
```

**استجابة الخطأ (401):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

## نقاط نهاية مواقع المواقف

### 1. الحصول على جميع مواقع المواقف

استرداد قائمة بجميع مواقع المواقف النشطة مع معلومات التوفر.

**نقطة النهاية:** `GET /locations`

**المصادقة:** غير مطلوبة

**استجابة النجاح (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "موقف وسط المدينة",
      "address": "شارع الرئيسي 123",
      "city": "نيويورك",
      "latitude": "40.71280000",
      "longitude": "-74.00600000",
      "totalSpots": 50,
      "isActive": true,
      "createdAt": "2025-12-26T10:00:00.000Z",
      "updatedAt": "2025-12-26T10:00:00.000Z",
      "availableSpots": 45,
      "occupiedSpots": 5,
      "spots": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "spotNumber": "A-101",
          "status": "available",
          "hourlyRate": "5.00"
        }
      ]
    }
  ]
}
```

---

### 2. الحصول على موقع بواسطة المعرف

الحصول على معلومات مفصلة حول موقع موقف محدد.

**نقطة النهاية:** `GET /locations/:id`

**المصادقة:** غير مطلوبة

**معاملات الرابط:**
- `id` (UUID): معرف موقع الموقف

**مثال:** `GET /locations/550e8400-e29b-41d4-a716-446655440001`

**استجابة النجاح (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "موقف وسط المدينة",
    "address": "شارع الرئيسي 123",
    "city": "نيويورك",
    "latitude": "40.71280000",
    "longitude": "-74.00600000",
    "totalSpots": 50,
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z",
    "availableSpots": 45,
    "occupiedSpots": 5,
    "spots": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "spotNumber": "A-101",
        "locationId": "550e8400-e29b-41d4-a716-446655440001",
        "status": "available",
        "hourlyRate": "5.00",
        "isActive": true,
        "createdAt": "2025-12-26T10:00:00.000Z",
        "updatedAt": "2025-12-26T10:00:00.000Z"
      }
    ]
  }
}
```

**استجابة الخطأ (404):**
```json
{
  "success": false,
  "message": "Parking location not found"
}
```

---

### 3. إنشاء موقع موقف

إنشاء موقع موقف جديد (وظيفة المسؤول).

**نقطة النهاية:** `POST /locations`

**المصادقة:** مطلوبة

**الرؤوس:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**نص الطلب:**
```json
{
  "name": "موقف وسط المدينة",
  "address": "شارع الرئيسي 123",
  "city": "نيويورك",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "totalSpots": 50
}
```

**وصف الحقول:**
- `name`: اسم الموقع (مطلوب)
- `address`: العنوان الكامل للشارع (مطلوب)
- `city`: اسم المدينة (مطلوب)
- `latitude`: خط العرض GPS (اختياري)
- `longitude`: خط الطول GPS (اختياري)
- `totalSpots`: إجمالي عدد الأماكن (مطلوب)

**استجابة النجاح (201):**
```json
{
  "success": true,
  "message": "Parking location created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "موقف وسط المدينة",
    "address": "شارع الرئيسي 123",
    "city": "نيويورك",
    "latitude": "40.71280000",
    "longitude": "-74.00600000",
    "totalSpots": 50,
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

---

## نقاط نهاية أماكن الوقوف

### 1. الحصول على الأماكن المتاحة حسب الموقع

الحصول على جميع أماكن الوقوف المتاحة في موقع محدد.

**نقطة النهاية:** `GET /spots/location/:locationId/available`

**المصادقة:** غير مطلوبة

**معاملات الرابط:**
- `locationId` (UUID): معرف موقع الموقف

**مثال:** `GET /spots/location/550e8400-e29b-41d4-a716-446655440001/available`

**استجابة النجاح (200):**
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "spotNumber": "A-101",
      "locationId": "550e8400-e29b-41d4-a716-446655440001",
      "status": "available",
      "hourlyRate": "5.00",
      "isActive": true,
      "createdAt": "2025-12-26T10:00:00.000Z",
      "updatedAt": "2025-12-26T10:00:00.000Z"
    }
  ]
}
```

**استجابة الخطأ (404):**
```json
{
  "success": false,
  "message": "Parking location not found"
}
```

---

### 2. الحصول على مكان بواسطة الرقم

الحصول على تفاصيل مكان وقوف محدد بواسطة رقمه وموقعه.

**نقطة النهاية:** `GET /spots/location/:locationId/spot/:spotNumber`

**المصادقة:** غير مطلوبة

**معاملات الرابط:**
- `locationId` (UUID): معرف موقع الموقف
- `spotNumber` (نص): رقم المكان (مثل "A-101")

**مثال:** `GET /spots/location/550e8400-e29b-41d4-a716-446655440001/spot/A-101`

**استجابة النجاح (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "spotNumber": "A-101",
    "locationId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "available",
    "hourlyRate": "5.00",
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z",
    "location": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "موقف وسط المدينة",
      "address": "شارع الرئيسي 123"
    }
  }
}
```

**استجابة الخطأ (404):**
```json
{
  "success": false,
  "message": "Parking spot not found"
}
```

---

### 3. إنشاء مكان وقوف

إضافة مكان وقوف جديد إلى موقع.

**نقطة النهاية:** `POST /spots`

**المصادقة:** مطلوبة

**الرؤوس:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**نص الطلب:**
```json
{
  "spotNumber": "A-101",
  "locationId": "550e8400-e29b-41d4-a716-446655440001",
  "hourlyRate": 5.00
}
```

**وصف الحقول:**
- `spotNumber`: معرف مكان فريد داخل الموقع (مطلوب)
- `locationId`: UUID للموقع الرئيسي (مطلوب)
- `hourlyRate`: السعر بالساعة للوقوف (اختياري، افتراضي: 5.00)

**استجابة النجاح (201):**
```json
{
  "success": true,
  "message": "Parking spot created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "spotNumber": "A-101",
    "locationId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "available",
    "hourlyRate": "5.00",
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**استجابة الخطأ (404):**
```json
{
  "success": false,
  "message": "Parking location not found"
}
```

---

### 4. تحديث حالة المكان

تحديث حالة مكان الوقوف (مثل وضع علامة صيانة).

**نقطة النهاية:** `PATCH /spots/:id/status`

**المصادقة:** مطلوبة

**الرؤوس:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**معاملات الرابط:**
- `id` (UUID): معرف مكان الوقوف

**نص الطلب:**
```json
{
  "status": "maintenance"
}
```

**قيم الحالة الصالحة:**
- `available` (متاح)
- `occupied` (مشغول)
- `reserved` (محجوز)
- `maintenance` (صيانة)

**استجابة النجاح (200):**
```json
{
  "success": true,
  "message": "Spot status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "spotNumber": "A-101",
    "locationId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "maintenance",
    "hourlyRate": "5.00",
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T11:00:00.000Z"
  }
}
```

---

## نقاط نهاية الحجوزات

### 1. إنشاء حجز

إنشاء حجز موقف جديد.

**نقطة النهاية:** `POST /bookings`

**المصادقة:** مطلوبة

**الرؤوس:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**نص الطلب:**
```json
{
  "spotNumber": "A-101",
  "locationId": "550e8400-e29b-41d4-a716-446655440001",
  "durationHours": 2,
  "paymentMethod": "card",
  "vehicleNumber": "ABC-1234"
}
```

**وصف الحقول:**
- `spotNumber`: رقم المكان للحجز (مطلوب)
- `locationId`: UUID للموقع (مطلوب)
- `durationHours`: المدة بالساعات (0.5 - 24) (مطلوب)
- `paymentMethod`: "card" (بطاقة) أو "cash" (نقد) (مطلوب)
- `vehicleNumber`: لوحة المركبة (اختياري، 20 حرف كحد أقصى)

**استجابة النجاح (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "spotId": "550e8400-e29b-41d4-a716-446655440002",
    "startTime": "2025-12-26T12:00:00.000Z",
    "endTime": "2025-12-26T14:00:00.000Z",
    "durationHours": "2.00",
    "totalAmount": "10.00",
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "bookingStatus": "active",
    "vehicleNumber": "ABC-1234",
    "createdAt": "2025-12-26T12:00:00.000Z",
    "updatedAt": "2025-12-26T12:00:00.000Z",
    "spot": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "spotNumber": "A-101",
      "status": "occupied",
      "hourlyRate": "5.00",
      "location": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "موقف وسط المدينة",
        "address": "شارع الرئيسي 123",
        "city": "نيويورك"
      }
    }
  }
}
```

**استجابات الخطأ:**

المكان غير موجود (404):
```json
{
  "success": false,
  "message": "Parking spot not found"
}
```

المكان غير متاح (400):
```json
{
  "success": false,
  "message": "Parking spot is currently occupied"
}
```

---

### 2. الحصول على حجوزات المستخدم

الحصول على جميع الحجوزات للمستخدم المصادق عليه.

**نقطة النهاية:** `GET /bookings`

**المصادقة:** مطلوبة

**الرؤوس:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**معاملات الاستعلام (اختياري):**
- `status`: تصفية حسب حالة الحجز (`active`, `completed`, `cancelled`, `expired`)

**مثال:** `GET /bookings?status=active`

**استجابة النجاح (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "spotId": "550e8400-e29b-41d4-a716-446655440002",
      "startTime": "2025-12-26T12:00:00.000Z",
      "endTime": "2025-12-26T14:00:00.000Z",
      "durationHours": "2.00",
      "totalAmount": "10.00",
      "paymentMethod": "card",
      "paymentStatus": "pending",
      "bookingStatus": "active",
      "vehicleNumber": "ABC-1234",
      "createdAt": "2025-12-26T12:00:00.000Z",
      "updatedAt": "2025-12-26T12:00:00.000Z",
      "spot": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "spotNumber": "A-101",
        "status": "occupied",
        "hourlyRate": "5.00",
        "location": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "موقف وسط المدينة",
          "address": "شارع الرئيسي 123",
          "city": "نيويورك"
        }
      }
    }
  ]
}
```

---

### 3. الحصول على حجز بواسطة المعرف

الحصول على تفاصيل حجز محدد.

**نقطة النهاية:** `GET /bookings/:id`

**المصادقة:** مطلوبة

**الرؤوس:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**معاملات الرابط:**
- `id` (UUID): معرف الحجز

**مثال:** `GET /bookings/550e8400-e29b-41d4-a716-446655440003`

**استجابة النجاح (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "spotId": "550e8400-e29b-41d4-a716-446655440002",
    "startTime": "2025-12-26T12:00:00.000Z",
    "endTime": "2025-12-26T14:00:00.000Z",
    "durationHours": "2.00",
    "totalAmount": "10.00",
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "bookingStatus": "active",
    "vehicleNumber": "ABC-1234",
    "createdAt": "2025-12-26T12:00:00.000Z",
    "updatedAt": "2025-12-26T12:00:00.000Z",
    "spot": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "spotNumber": "A-101",
      "location": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "موقف وسط المدينة",
        "address": "شارع الرئيسي 123",
        "city": "نيويورك"
      }
    }
  }
}
```

**استجابة الخطأ (404):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

---

### 4. إكمال الحجز

وضع علامة على الحجز كمكتمل عندما يغادر المستخدم مكان الوقوف.

**نقطة النهاية:** `PATCH /bookings/:id/complete`

**المصادقة:** مطلوبة

**الرؤوس:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**معاملات الرابط:**
- `id` (UUID): معرف الحجز

**مثال:** `PATCH /bookings/550e8400-e29b-41d4-a716-446655440003/complete`

**استجابة النجاح (200):**
```json
{
  "success": true,
  "message": "Booking completed successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "spotId": "550e8400-e29b-41d4-a716-446655440002",
    "startTime": "2025-12-26T12:00:00.000Z",
    "endTime": "2025-12-26T14:00:00.000Z",
    "durationHours": "2.00",
    "totalAmount": "10.00",
    "paymentMethod": "card",
    "paymentStatus": "completed",
    "bookingStatus": "completed",
    "vehicleNumber": "ABC-1234",
    "createdAt": "2025-12-26T12:00:00.000Z",
    "updatedAt": "2025-12-26T14:00:00.000Z"
  }
}
```

**استجابات الخطأ:**

الحجز غير موجود (404):
```json
{
  "success": false,
  "message": "Booking not found"
}
```

مكتمل بالفعل (400):
```json
{
  "success": false,
  "message": "Booking is already completed"
}
```

---

### 5. إلغاء الحجز

إلغاء حجز نشط.

**نقطة النهاية:** `PATCH /bookings/:id/cancel`

**المصادقة:** مطلوبة

**الرؤوس:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**معاملات الرابط:**
- `id` (UUID): معرف الحجز

**مثال:** `PATCH /bookings/550e8400-e29b-41d4-a716-446655440003/cancel`

**استجابة النجاح (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "spotId": "550e8400-e29b-41d4-a716-446655440002",
    "startTime": "2025-12-26T12:00:00.000Z",
    "endTime": "2025-12-26T14:00:00.000Z",
    "durationHours": "2.00",
    "totalAmount": "10.00",
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "bookingStatus": "cancelled",
    "vehicleNumber": "ABC-1234",
    "createdAt": "2025-12-26T12:00:00.000Z",
    "updatedAt": "2025-12-26T13:00:00.000Z"
  }
}
```

**استجابة الخطأ (400):**
```json
{
  "success": false,
  "message": "Cannot cancel a completed booking"
}
```

---

## نماذج البيانات

### المستخدم

```javascript
{
  id: UUID,
  username: نص (3-50 حرف),
  phoneNumber: نص (فريد),
  password: نص (مشفر),
  isActive: منطقي,
  createdAt: تاريخ ووقت,
  updatedAt: تاريخ ووقت
}
```

### موقع الموقف

```javascript
{
  id: UUID,
  name: نص (100 حرف),
  address: نص (255 حرف),
  city: نص (100 حرف),
  latitude: عشري(10,8),
  longitude: عشري(11,8),
  totalSpots: عدد صحيح,
  isActive: منطقي,
  createdAt: تاريخ ووقت,
  updatedAt: تاريخ ووقت
}
```

### مكان الوقوف

```javascript
{
  id: UUID,
  spotNumber: نص (20 حرف),
  locationId: UUID (مفتاح خارجي),
  status: تعداد ['available', 'occupied', 'reserved', 'maintenance'],
  hourlyRate: عشري(10,2),
  isActive: منطقي,
  createdAt: تاريخ ووقت,
  updatedAt: تاريخ ووقت
}
```

### الحجز

```javascript
{
  id: UUID,
  userId: UUID (مفتاح خارجي),
  spotId: UUID (مفتاح خارجي),
  startTime: تاريخ ووقت,
  endTime: تاريخ ووقت,
  durationHours: عشري(5,2),
  totalAmount: عشري(10,2),
  paymentMethod: تعداد ['card', 'cash'],
  paymentStatus: تعداد ['pending', 'completed', 'failed', 'refunded'],
  bookingStatus: تعداد ['active', 'completed', 'cancelled', 'expired'],
  vehicleNumber: نص (20 حرف، اختياري),
  createdAt: تاريخ ووقت,
  updatedAt: تاريخ ووقت
}
```

---

## حالات الاستخدام الشائعة

### حالة الاستخدام 1: تدفق تسجيل المستخدم والحجز

1. **تسجيل المستخدم**
   ```
   POST /auth/register
   ```

2. **تصفح المواقع**
   ```
   GET /locations
   ```

3. **عرض الأماكن المتاحة**
   ```
   GET /spots/location/{locationId}/available
   ```

4. **التحقق من مكان محدد**
   ```
   GET /spots/location/{locationId}/spot/A-101
   ```

5. **إنشاء حجز**
   ```
   POST /bookings
   Authorization: Bearer {token}
   ```

6. **عرض حجوزاتي**
   ```
   GET /bookings
   Authorization: Bearer {token}
   ```

7. **إكمال الحجز**
   ```
   PATCH /bookings/{id}/complete
   Authorization: Bearer {token}
   ```

---

### حالة الاستخدام 2: تدفق إعداد المسؤول

1. **إنشاء موقع**
   ```
   POST /locations
   Authorization: Bearer {admin_token}
   ```

2. **إضافة أماكن متعددة**
   ```
   POST /spots (كرر لكل مكان)
   Authorization: Bearer {admin_token}
   ```

3. **تحديث حالة المكان للصيانة**
   ```
   PATCH /spots/{id}/status
   Authorization: Bearer {admin_token}
   ```

---

## تحديد المعدل

حالياً، لم يتم تطبيق تحديد المعدل. يجب إضافة هذا في الإنتاج.

**موصى به:** 100 طلب لكل 15 دقيقة لكل عنوان IP.

---

## ملاحظات

- جميع الطوابع الزمنية بصيغة ISO 8601 (UTC)
- جميع القيم النقدية بصيغة عشرية بمنزلتين عشريتين
- UUIDs هي الإصدار 4 (عشوائي)
- كلمات المرور مشفرة باستخدام bcrypt مع 10 جولات ملح
- تستخدم واجهة برمجة التطبيقات معاملات قاعدة البيانات لعمليات الحجز لمنع حالات السباق

---

## الدعم

للمشاكل أو الأسئلة، يرجى الاتصال بفريق التطوير أو فتح مشكلة في مستودع المشروع.

**إصدار واجهة برمجة التطبيقات:** 1.0.0
**آخر تحديث:** 2025-12-26
