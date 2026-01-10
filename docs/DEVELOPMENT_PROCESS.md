# Quy Trình Phát Triển - Tạp Hóa Đơn Giản

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Quy Trình Nhận Yêu Cầu](#quy-trình-nhận-yêu-cầu)
3. [Checklist Trước Khi Code](#checklist-trước-khi-code)
4. [Quy Tắc Code](#quy-tắc-code)
5. [Testing Checklist](#testing-checklist)
6. [Quy Trình Deploy](#quy-trình-deploy)
7. [Các Lỗi Thường Gặp](#các-lỗi-thường-gặp)

---

## Tổng Quan

Dự án này gồm:
- **Frontend**: React + Vite + Tailwind CSS (deploy trên Vercel)
- **Backend**: Node.js + Express + Supabase (deploy trên Vercel)
- **Database**: Supabase PostgreSQL

---

## Quy Trình Nhận Yêu Cầu

### Bước 1: Phân Tích Yêu Cầu
- [ ] Đọc kỹ yêu cầu, xác định rõ:
  - Đây là tính năng mới hay sửa bug?
  - Ảnh hưởng đến frontend, backend, hay cả hai?
  - Có cần thay đổi database schema không?

### Bước 2: Xác Định Các File Cần Sửa
- [ ] Liệt kê tất cả các file sẽ bị ảnh hưởng
- [ ] Đọc code hiện tại của các file đó trước khi sửa
- [ ] Tìm hiểu logic hiện tại để không phá vỡ

### Bước 3: Lập Kế Hoạch
- [ ] Viết ra các bước cần thực hiện
- [ ] Xác định thứ tự: Database → Backend → Frontend
- [ ] Dự đoán các edge cases và lỗi có thể xảy ra

---

## Checklist Trước Khi Code

### Database Changes
- [ ] Nếu thêm cột mới: Tạo file migration SQL
- [ ] Kiểm tra foreign key constraints
- [ ] Kiểm tra RLS policies (Supabase)
- [ ] **QUAN TRỌNG**: Chạy SQL migration TRƯỚC khi deploy code

### Backend Changes
- [ ] Parse query params thành số: `parseInt(page)`, `parseInt(limit)`
- [ ] Validate input data trước khi xử lý
- [ ] Kiểm tra response trả về đúng format
- [ ] Thêm error handling đầy đủ với message rõ ràng
- [ ] Verify kết quả sau khi thực hiện (delete/update)

### Frontend Changes
- [ ] Kiểm tra loading states
- [ ] Xử lý error states
- [ ] UI cập nhật ngay sau action (optimistic update)
- [ ] Fallback nếu action thất bại

---

## Quy Tắc Code

### 1. Query Parameters (Backend)
```javascript
// ❌ SAI - page và limit là string
const { page = 1, limit = 10 } = req.query;
const offset = (page - 1) * limit; // Bug: string concatenation!

// ✅ ĐÚNG - parse thành number
const pageNum = parseInt(page);
const limitNum = parseInt(limit);
const offset = (pageNum - 1) * limitNum;
```

### 2. Delete Operations (Backend)
```javascript
// ❌ SAI - không verify kết quả
const { error } = await supabase.from('table').delete().eq('id', id);
if (error) throw error;
res.json({ message: 'Đã xóa' }); // Có thể không xóa được nhưng vẫn báo thành công

// ✅ ĐÚNG - verify kết quả
const { data, error } = await supabase.from('table').delete().eq('id', id).select();
if (error) throw error;
if (!data || data.length === 0) {
  return res.status(500).json({ error: 'Không thể xóa' });
}
res.json({ message: 'Đã xóa', deleted: data[0] });
```

### 3. State Updates (Frontend)
```javascript
// ❌ SAI - chỉ update state, không handle failure
const handleDelete = async (id) => {
  await api.delete(`/items/${id}`);
  setItems(prev => prev.filter(item => item.id !== id));
};

// ✅ ĐÚNG - update state + handle failure
const handleDelete = async (id) => {
  try {
    await api.delete(`/items/${id}`);
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('Đã xóa');
  } catch (error) {
    toast.error(error.response?.data?.error || 'Lỗi');
    fetchItems(); // Sync lại với server
  }
};
```

### 4. Image Handling
```javascript
// ✅ Luôn có fallback cho hình ảnh
<img
  src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'}
  alt={product.name}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/300?text=No+Image';
  }}
  loading="lazy"
/>
```

---

## Testing Checklist

### Trước Khi Commit
- [ ] Code không có lỗi TypeScript/ESLint
- [ ] API endpoint hoạt động với các trường hợp:
  - Happy path (thành công)
  - Invalid input
  - Not found
  - Unauthorized
- [ ] Pagination hoạt động đúng (page 1, 2, 3...)
- [ ] CRUD operations verify được kết quả
- [ ] UI cập nhật đúng sau mỗi action

### Test Cases Cho Delete
- [ ] Xóa item không có dependencies → Thành công
- [ ] Xóa item có dependencies → Báo lỗi rõ ràng
- [ ] Xóa item không tồn tại → 404 Not Found
- [ ] Reload trang sau khi xóa → Item không còn

### Test Cases Cho Pagination
- [ ] Page 1: Hiển thị đúng số items (limit)
- [ ] Page 2: Hiển thị items tiếp theo, không trùng với page 1
- [ ] Tổng số pages đúng: Math.ceil(total / limit)

---

## Quy Trình Deploy

### Bước 1: Kiểm Tra Thay Đổi Database
```bash
# Nếu có thay đổi schema
# 1. Vào Supabase SQL Editor
# 2. Chạy migration script từ /database/migrations/
# 3. Verify bằng cách check schema trong Supabase Dashboard
```

### Bước 2: Commit & Push
```bash
# Kiểm tra các file thay đổi
git status

# Add và commit với message rõ ràng
git add .
git commit -m "type: description"
# Types: feat, fix, refactor, docs, style, test

# Push lên main
git push origin main
```

### Bước 3: Verify Deployment
- [ ] Đợi 1-2 phút cho Vercel build
- [ ] Mở website và test tính năng vừa thay đổi
- [ ] Check Console (F12) xem có lỗi không
- [ ] Check Network tab xem API response có đúng không

### Bước 4: Rollback Nếu Lỗi
```bash
# Xem history
git log --oneline -5

# Revert commit gần nhất
git revert HEAD
git push origin main
```

---

## Các Lỗi Thường Gặp

### 1. Pagination Trả Về Sai Số Items
**Nguyên nhân**: Query params là string, không parse thành number
**Fix**: 
```javascript
const pageNum = parseInt(page);
const limitNum = parseInt(limit);
```

### 2. Delete Không Hoạt Động (UI Ok, Reload Lại Còn)
**Nguyên nhân**: 
- Backend không verify kết quả delete
- Frontend update state trước khi confirm từ server
**Fix**:
- Backend: Thêm `.select()` và check `data.length > 0`
- Frontend: Chỉ update state khi API success, rollback khi fail

### 3. Hình Ảnh Không Hiển Thị
**Nguyên nhân**: URL ảnh bị lỗi hoặc null
**Fix**: Thêm `onError` handler và fallback image

### 4. Reload Page Bị Logout
**Nguyên nhân**: Check auth trước khi loading state hoàn tất
**Fix**: Kiểm tra `loading` trước khi redirect
```javascript
if (loading) return <Loading />;
if (!user) return <Navigate to="/login" />;
```

### 5. Foreign Key Constraint Khi Xóa
**Nguyên nhân**: Có data reference đến record cần xóa
**Fix**: 
- Kiểm tra trước khi xóa
- Hiển thị lỗi rõ ràng cho user
- Hoặc cascade delete nếu phù hợp

---

## Commit Message Convention

```
feat: Thêm tính năng mới
fix: Sửa lỗi
refactor: Tái cấu trúc code (không thay đổi behavior)
docs: Cập nhật documentation
style: Format code, thêm comments
test: Thêm/sửa tests
chore: Cập nhật dependencies, configs
```

---

## Liên Hệ Hỗ Trợ

Nếu gặp lỗi không thể fix:
1. Đọc lại document này
2. Check Vercel logs
3. Check Supabase logs
4. Search error message trên Google/Stack Overflow
