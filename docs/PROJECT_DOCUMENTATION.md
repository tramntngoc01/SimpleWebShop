# 📋 Tài Liệu Dự Án Chaa Nôm - Cửa Hàng Thái Lan

> **Version:** 1.0.0  
> **Cập nhật:** 03/01/2026  
> **Website:** https://chanoom-shop.vercel.app  
> **API:** https://taphoadongian-api.vercel.app

---

## 📌 Tổng Quan Dự Án

### Giới thiệu
**Chaa Nôm** là website thương mại điện tử bán sản phẩm Thái Lan, cho phép khách hàng xem sản phẩm, thêm vào giỏ hàng và đặt hàng online.

### Thông tin liên hệ
- **Địa chỉ:** 25D Thôn 7, Gia Hiệp, Lâm Đồng
- **Điện thoại:** 0975 794 143
- **Facebook:** https://www.facebook.com/profile.php?id=61576239952718

---

## 🛠 Công Nghệ Sử Dụng

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | JWT (JSON Web Token) |
| **Hosting** | Vercel (Frontend + Backend Serverless) |
| **Version Control** | Git, GitHub |

---

## 🎨 Branding & UI

### Màu sắc
| Tên | Hex Code | Sử dụng |
|-----|----------|---------|
| **Primary (Xanh lá đậm)** | `#2d6a4f` | Header, nút chính, accent |
| **Accent (Vàng cam)** | `#e9a319` | Highlight, sale badge |
| **Background** | `#ffffff` | Nền chính |
| **Text** | `#1f2937` | Văn bản chính |
| **Gray** | `#6b7280` | Văn bản phụ |

### Logo
- File: `/frontend/public/logo.png`
- Hình tròn với cô gái Thái Lan, màu xanh lá đậm

---

## 📁 Cấu Trúc Thư Mục

```
TapHoaDonGian/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js      # Supabase client config
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT auth & admin middleware
│   │   ├── routes/
│   │   │   ├── auth.js          # Đăng ký, đăng nhập
│   │   │   ├── products.js      # CRUD sản phẩm (public)
│   │   │   ├── categories.js    # CRUD danh mục (public)
│   │   │   ├── cart.js          # Giỏ hàng (authenticated)
│   │   │   ├── orders.js        # Đơn hàng (authenticated)
│   │   │   └── admin.js         # Quản trị (admin only)
│   │   └── index.js             # Express server entry
│   ├── vercel.json              # Vercel serverless config
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── logo.png             # Logo Chaa Nôm
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx       # Navigation header
│   │   │   ├── Footer.jsx       # Footer với thông tin liên hệ
│   │   │   ├── ProductCard.jsx  # Card hiển thị sản phẩm
│   │   │   └── Loading.jsx      # Loading spinner
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx  # Quản lý authentication state
│   │   │   └── CartContext.jsx  # Quản lý giỏ hàng state
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Trang chủ
│   │   │   ├── Products.jsx     # Danh sách sản phẩm
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Categories.jsx   # Danh mục
│   │   │   ├── Cart.jsx         # Giỏ hàng
│   │   │   ├── Checkout.jsx     # Thanh toán
│   │   │   ├── Orders.jsx       # Lịch sử đơn hàng
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── Login.jsx        # Đăng nhập
│   │   │   ├── Register.jsx     # Đăng ký
│   │   │   ├── Profile.jsx      # Thông tin tài khoản
│   │   │   └── admin/           # Trang quản trị
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminCategories.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       └── AdminUsers.jsx
│   │   ├── utils/
│   │   │   ├── api.js           # Axios instance với interceptors
│   │   │   └── helpers.js       # Utility functions
│   │   ├── App.jsx              # Routes config
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Tailwind + custom styles
│   ├── vercel.json
│   └── package.json
│
├── database/
│   └── schema.sql               # Database schema & sample data
│
├── .github/
│   └── copilot-instructions.md  # Hướng dẫn cho AI
│
└── docs/
    └── PROJECT_DOCUMENTATION.md # (file này)
```

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │  categories  │       │   products   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ name         │       │ name         │
│ password     │       │ description  │       │ description  │
│ full_name    │       │ image_url    │       │ price        │
│ phone        │       │ is_active    │       │ sale_price   │
│ address      │       │ created_at   │       │ image_url    │
│ role         │       └──────────────┘       │ category_id  │──→ categories
│ is_active    │                              │ stock_quantity│
│ created_at   │                              │ unit         │
│ updated_at   │                              │ is_active    │
└──────────────┘                              │ created_at   │
       │                                      │ updated_at   │
       │                                      └──────────────┘
       │                                             │
       ▼                                             ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    orders    │       │ order_items  │       │  cart_items  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ order_id (FK)│       │ id (PK)      │
│ user_id (FK) │       │ product_id   │       │ user_id (FK) │──→ users
│ order_number │       │ product_name │       │ product_id   │──→ products
│ status       │       │ product_price│       │ quantity     │
│ total_amount │       │ quantity     │       │ created_at   │
│ shipping_*   │       │ subtotal     │       └──────────────┘
│ note         │       └──────────────┘
│ created_at   │
│ updated_at   │
└──────────────┘
```

### Chi tiết các bảng

#### 1. Users (Người dùng)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,           -- bcrypt hash
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'customer',      -- 'customer' | 'admin'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Categories (Danh mục)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Products (Sản phẩm)
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    sale_price DECIMAL(12, 2),                -- NULL nếu không giảm giá
    image_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    stock_quantity INTEGER DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'cái',           -- đơn vị: gói, lon, chai, kg...
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Orders (Đơn hàng)
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Format: DH + YYMMDD + random
    status VARCHAR(50) DEFAULT 'pending',     -- pending|confirmed|shipping|delivered|cancelled
    total_amount DECIMAL(12, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_name VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Order Items (Chi tiết đơn hàng)
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,       -- Lưu lại tên để giữ lịch sử
    product_price DECIMAL(12, 2) NOT NULL,    -- Giá tại thời điểm mua
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);
```

#### 6. Cart Items (Giỏ hàng)
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)               -- Mỗi user chỉ có 1 record/product
);
```

### Indexes
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_user ON cart_items(user_id);
```

---

## 🔌 API Documentation

### Base URL
- **Production:** `https://taphoadongian-api.vercel.app/api`
- **Development:** `http://localhost:3001/api`

### Authentication
API sử dụng JWT Bearer Token:
```
Authorization: Bearer <token>
```

Token có hiệu lực **7 ngày** sau khi đăng nhập.

---

### 🔐 Auth APIs

#### POST /api/auth/register
Đăng ký tài khoản mới.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "address": "123 Đường ABC, TP.HCM"
}
```

**Response:** `201 Created`
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "customer"
  },
  "token": "jwt_token_here"
}
```

---

#### POST /api/auth/login
Đăng nhập.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "customer"
  },
  "token": "jwt_token_here"
}
```

---

#### GET /api/auth/me
Lấy thông tin user hiện tại. **[Requires Auth]**

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789",
  "address": "123 Đường ABC",
  "role": "customer"
}
```

---

#### PUT /api/auth/profile
Cập nhật thông tin cá nhân. **[Requires Auth]**

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321",
  "address": "456 Đường XYZ"
}
```

---

#### PUT /api/auth/change-password
Đổi mật khẩu. **[Requires Auth]**

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

### 📦 Products APIs

#### GET /api/products
Lấy danh sách sản phẩm với phân trang và lọc.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Trang hiện tại |
| limit | number | 12 | Số sản phẩm/trang |
| category | uuid | - | Lọc theo category_id |
| search | string | - | Tìm kiếm theo tên |
| minPrice | number | - | Giá tối thiểu |
| maxPrice | number | - | Giá tối đa |
| sortBy | string | created_at | Sắp xếp theo field |
| sortOrder | string | desc | asc/desc |

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Mì Hảo Hảo",
      "description": "...",
      "price": 5000,
      "sale_price": 4500,
      "image_url": "https://...",
      "category_id": "uuid",
      "stock_quantity": 100,
      "unit": "gói",
      "categories": { "name": "Thực phẩm khô" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5
  }
}
```

---

#### GET /api/products/:id
Lấy chi tiết sản phẩm.

---

#### GET /api/products/featured/sale
Lấy sản phẩm đang giảm giá (có sale_price).

---

#### GET /api/products/category/:categoryId
Lấy sản phẩm theo danh mục.

---

### 📂 Categories APIs

#### GET /api/categories
Lấy tất cả danh mục.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Thực phẩm khô",
    "description": "Mì, gạo, bún...",
    "image_url": "https://..."
  }
]
```

---

#### GET /api/categories/:id
Lấy chi tiết danh mục.

---

### 🛒 Cart APIs **[Requires Auth]**

#### GET /api/cart
Lấy giỏ hàng của user.

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "uuid",
      "quantity": 2,
      "product_id": "uuid",
      "products": {
        "id": "uuid",
        "name": "Mì Hảo Hảo",
        "price": 5000,
        "sale_price": 4500,
        "image_url": "...",
        "stock_quantity": 100,
        "unit": "gói"
      }
    }
  ],
  "total": 9000
}
```

---

#### POST /api/cart/add
Thêm sản phẩm vào giỏ.

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

---

#### PUT /api/cart/:id
Cập nhật số lượng.

**Request Body:**
```json
{
  "quantity": 3
}
```

---

#### DELETE /api/cart/:id
Xóa sản phẩm khỏi giỏ.

---

#### DELETE /api/cart
Xóa toàn bộ giỏ hàng.

---

### 📋 Orders APIs **[Requires Auth]**

#### GET /api/orders
Lấy danh sách đơn hàng của user.

**Query Parameters:**
- `page`: Trang (default: 1)
- `limit`: Số đơn/trang (default: 10)

---

#### GET /api/orders/:id
Lấy chi tiết đơn hàng (bao gồm order_items).

---

#### POST /api/orders
Tạo đơn hàng mới từ giỏ hàng.

**Request Body:**
```json
{
  "shippingName": "Nguyễn Văn A",
  "shippingPhone": "0123456789",
  "shippingAddress": "123 Đường ABC, TP.HCM",
  "note": "Giao giờ hành chính"
}
```

**Response:** `201 Created`
```json
{
  "message": "Đặt hàng thành công",
  "order": {
    "id": "uuid",
    "order_number": "DH260103ABC123",
    "status": "pending",
    "total_amount": 150000
  }
}
```

---

#### PUT /api/orders/:id/cancel
Hủy đơn hàng (chỉ khi status = pending).

---

### 👨‍💼 Admin APIs **[Requires Auth + Admin Role]**

#### Users Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | Lấy danh sách users |
| PUT | /api/admin/users/:id | Cập nhật user |
| PUT | /api/admin/users/:id/reset-password | Reset mật khẩu |

#### Categories Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/categories | Thêm danh mục |
| PUT | /api/admin/categories/:id | Cập nhật danh mục |
| DELETE | /api/admin/categories/:id | Xóa danh mục |

#### Products Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/products | Lấy tất cả sản phẩm (kể cả inactive) |
| POST | /api/admin/products | Thêm sản phẩm |
| PUT | /api/admin/products/:id | Cập nhật sản phẩm |
| DELETE | /api/admin/products/:id | Xóa sản phẩm |
| POST | /api/admin/products/import | Import từ Excel |
| GET | /api/admin/products/export | Export ra Excel |

#### Orders Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/orders | Lấy tất cả đơn hàng |
| PUT | /api/admin/orders/:id/status | Cập nhật trạng thái |

#### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard/stats | Thống kê tổng quan |

---

## 🔒 Bảo mật

### Authentication Flow
1. User đăng nhập → Server trả về JWT token
2. Frontend lưu token vào `localStorage`
3. Mỗi request gửi token trong header `Authorization: Bearer <token>`
4. Server verify token và extract user info

### Password Security
- Sử dụng **bcrypt** với salt rounds = 10
- Không lưu plain text password

### Protected Routes
- **Customer routes:** Yêu cầu JWT token hợp lệ
- **Admin routes:** Yêu cầu JWT token + role = 'admin'

---

## 🚀 Deployment

### Environment Variables

#### Backend (.env)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

#### Frontend (.env)
```env
VITE_API_URL=https://taphoadongian-api.vercel.app/api
```

### Deploy Commands
```bash
# Push to GitHub (auto-deploy on Vercel)
git add -A
git commit -m "Your message"
git push

# Local development
npm run dev          # Root: chạy cả frontend + backend
cd backend && npm run dev   # Chỉ backend
cd frontend && npm run dev  # Chỉ frontend
```

---

## 📊 Trạng thái đơn hàng

| Status | Tiếng Việt | Mô tả |
|--------|------------|-------|
| `pending` | Chờ xác nhận | Đơn mới tạo, chờ admin xác nhận |
| `confirmed` | Đã xác nhận | Admin đã xác nhận, chuẩn bị hàng |
| `shipping` | Đang giao | Đang vận chuyển |
| `delivered` | Đã giao | Giao hàng thành công |
| `cancelled` | Đã hủy | Đơn bị hủy |

---

## 🧪 Tài khoản Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taphoa.com | admin123 |
| Customer | khach@gmail.com | 123456 |

---

## 📝 Changelog

### v1.0.0 (03/01/2026)
- ✅ Initial release
- ✅ Rebrand từ "Tạp Hóa Đơn Giản" thành "Chaa Nôm"
- ✅ Cập nhật UI với màu xanh lá đậm + vàng cam
- ✅ Deploy lên Vercel (Frontend + Backend Serverless)
- ✅ Tích hợp Supabase PostgreSQL

---

## 🔮 Roadmap - Kế hoạch phát triển

### Phase 2 (Planned)
- [ ] Tích hợp thanh toán online (MoMo, VNPay)
- [ ] Notification đơn hàng qua email/SMS
- [ ] Đánh giá sản phẩm (reviews)
- [ ] Wishlist (sản phẩm yêu thích)

### Phase 3 (Future)
- [ ] App mobile (React Native)
- [ ] Chatbot hỗ trợ khách hàng
- [ ] Loyalty program (tích điểm)
- [ ] Multi-language support

---

## 📞 Hỗ trợ kỹ thuật

- **GitHub:** https://github.com/tramntngoc01/SimpleWebShop
- **Issues:** Tạo issue trên GitHub nếu gặp bug

---

*Tài liệu này được tạo bởi GitHub Copilot - Cập nhật lần cuối: 03/01/2026*
