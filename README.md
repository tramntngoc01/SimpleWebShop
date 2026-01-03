# 🛒 Tạp Hóa Đơn Giản

Website bán tạp hóa online đơn giản với đầy đủ tính năng cho cả khách hàng và quản trị viên.

## ✨ Tính năng

### Khách hàng
- 🔐 Đăng ký / Đăng nhập
- 🏠 Trang chủ với sản phẩm khuyến mãi
- 📦 Xem danh sách sản phẩm theo danh mục
- 🔍 Tìm kiếm và lọc sản phẩm
- 🛒 Giỏ hàng
- 📝 Đặt hàng
- 📋 Xem và hủy đơn hàng
- 👤 Quản lý tài khoản

### Quản trị viên
- 📊 Dashboard thống kê
- 👥 Quản lý người dùng
- 📦 Quản lý sản phẩm (thêm, sửa, xóa)
- 📥 Import sản phẩm từ Excel
- 🗂️ Quản lý danh mục
- 📋 Quản lý đơn hàng (cập nhật trạng thái)

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **Excel Import**: xlsx library

## 📁 Cấu trúc thư mục

```
TapHoaDonGian/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # React Context (Auth, Cart)
│   │   ├── pages/            # Page components
│   │   │   └── admin/        # Admin pages
│   │   └── utils/            # Utilities (api, helpers)
│   └── ...
├── backend/                  # Express Backend
│   ├── src/
│   │   ├── config/           # Database config
│   │   ├── middleware/       # Auth middleware
│   │   └── routes/           # API routes
│   └── ...
├── database/                 # SQL schema
│   └── schema.sql
└── README.md
```

## 🚀 Hướng dẫn cài đặt

### 1. Chuẩn bị Database (Supabase)

1. Tạo tài khoản tại [supabase.com](https://supabase.com)
2. Tạo project mới
3. Vào **SQL Editor** và chạy nội dung file `database/schema.sql`
4. Vào **Settings > API** để lấy:
   - Project URL
   - anon public key
   - service_role key

### 2. Cài đặt Backend

```bash
cd backend

# Copy file cấu hình
cp .env.example .env

# Sửa file .env với thông tin Supabase của bạn
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_ANON_KEY=eyJxxxxx
# SUPABASE_SERVICE_KEY=eyJxxxxx
# JWT_SECRET=your_secret_key

# Cài đặt dependencies
npm install

# Chạy server
npm run dev
```

### 3. Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### 4. Chạy cả Frontend và Backend

Từ thư mục gốc:

```bash
# Cài đặt dependencies gốc
npm install

# Chạy cả frontend và backend
npm run dev
```

## 🔑 Tài khoản demo

Sau khi chạy SQL schema, bạn sẽ có các tài khoản demo:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taphoa.com | admin123 |
| Khách | khach@gmail.com | 123456 |

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- `PUT /api/auth/me` - Cập nhật thông tin
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `GET /api/products/featured/sale` - Sản phẩm khuyến mãi

### Categories
- `GET /api/categories` - Danh sách danh mục

### Cart (Yêu cầu đăng nhập)
- `GET /api/cart` - Xem giỏ hàng
- `POST /api/cart/add` - Thêm vào giỏ
- `PUT /api/cart/update/:itemId` - Cập nhật số lượng
- `DELETE /api/cart/remove/:itemId` - Xóa khỏi giỏ

### Orders (Yêu cầu đăng nhập)
- `GET /api/orders` - Danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng

### Admin (Yêu cầu quyền Admin)
- `GET /api/admin/stats` - Thống kê
- `GET/POST/PUT/DELETE /api/admin/products` - CRUD sản phẩm
- `POST /api/admin/products/import` - Import từ Excel
- `GET /api/admin/products/import-template` - Tải template Excel
- `GET/POST/PUT/DELETE /api/admin/categories` - CRUD danh mục
- `GET/PUT /api/admin/orders` - Quản lý đơn hàng
- `GET/PUT /api/admin/users` - Quản lý users

## 📊 Template Import Excel

Để import sản phẩm từ Excel, file cần có các cột:

| Tên sản phẩm | Mô tả | Giá | Giá khuyến mãi | Danh mục | Số lượng | Đơn vị | Link ảnh |
|--------------|-------|-----|----------------|----------|----------|--------|----------|
| Mì Hảo Hảo | Mì tôm | 5000 | 4500 | Thực phẩm khô | 100 | gói | https://... |

## 📝 License

MIT License

## 👨‍💻 Tác giả

Được tạo bởi AI Assistant
