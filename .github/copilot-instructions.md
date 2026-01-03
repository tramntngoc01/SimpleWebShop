# Copilot Instructions for Tạp Hóa Đơn Giản

## Project Overview

This is a Vietnamese grocery store e-commerce website with:
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Supabase (PostgreSQL)
- **Language**: Vietnamese UI, English code

## Architecture

### Frontend Structure (`/frontend/src/`)
- `components/` - Reusable UI components (Header, Footer, ProductCard, Loading)
- `contexts/` - React Context for global state (AuthContext, CartContext)
- `pages/` - Page components including `/admin/` for admin dashboard
- `utils/` - API client (axios) and helper functions

### Backend Structure (`/backend/src/`)
- `config/database.js` - Supabase client configuration
- `middleware/auth.js` - JWT authentication & admin authorization
- `routes/` - Express route handlers (auth, products, cart, orders, admin)
- `index.js` - Express server entry point

### Database
- Uses Supabase PostgreSQL with tables: `users`, `categories`, `products`, `orders`, `order_items`, `cart_items`
- Schema defined in `/database/schema.sql`

## Code Conventions

### Frontend
- Use functional components with hooks
- State management via React Context (not Redux)
- API calls through `/utils/api.js` axios instance with JWT interceptors
- Styling: Tailwind CSS utility classes with custom components in `index.css`
- Vietnamese text for UI, English for code/comments

### Backend
- ES Modules (`import/export`)
- RESTful API design with Vietnamese error messages
- JWT authentication stored in localStorage
- Admin routes protected by `authMiddleware` + `adminMiddleware`

## Key Patterns

### Authentication Flow
```javascript
// Login stores token in localStorage
localStorage.setItem('token', token);
// API interceptor automatically adds Bearer token
config.headers.Authorization = `Bearer ${token}`;
```

### Protected Routes (Frontend)
```javascript
// Use useAuth hook to check authentication
const { user, isAdmin } = useAuth();
if (!user) return <Navigate to="/login" />;
```

### Admin API Routes (Backend)
```javascript
// All admin routes require both middlewares
router.get('/admin/users', authMiddleware, adminMiddleware, handler);
```

## Common Tasks

### Adding a New API Endpoint
1. Create route handler in `/backend/src/routes/`
2. Add route to `/backend/src/index.js`
3. Create corresponding API call in frontend

### Adding a New Page
1. Create page component in `/frontend/src/pages/`
2. Add route in `/frontend/src/App.jsx`
3. Add navigation link if needed

### Database Changes
1. Update `/database/schema.sql`
2. Run SQL in Supabase SQL Editor
3. Update corresponding API routes and frontend

## Environment Variables

### Backend (`.env`)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
JWT_SECRET=your_secret
PORT=3001
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3001/api
```

## Running the Project

```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend
npm run dev

# Or run separately
cd backend && npm run dev
cd frontend && npm run dev
```

## Demo Accounts
- Admin: `admin@taphoa.com` / `admin123`
- Customer: `khach@gmail.com` / `123456`
