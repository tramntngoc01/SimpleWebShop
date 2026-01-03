import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Package, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-primary-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Chaa Nôm" className="h-10 w-10 rounded-full" />
            <span className="font-bold text-xl hidden sm:block">Chaa Nôm</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-primary-200 transition-colors">
              Trang chủ
            </Link>
            <Link to="/products" className="hover:text-primary-200 transition-colors">
              Sản phẩm
            </Link>
            <Link to="/categories" className="hover:text-primary-200 transition-colors">
              Danh mục
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative hover:text-primary-200 transition-colors">
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 hover:text-primary-200 transition-colors"
                >
                  <User size={24} />
                  <span className="hidden sm:block">{user.full_name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-gray-800">
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package size={18} className="mr-2" />
                      Đơn hàng của tôi
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={18} className="mr-2" />
                      Tài khoản
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings size={18} className="mr-2" />
                        Quản trị
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      <LogOut size={18} className="mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="hover:text-primary-200 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-primary-500">
            <Link
              to="/"
              className="block py-2 hover:text-primary-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/products"
              className="block py-2 hover:text-primary-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Sản phẩm
            </Link>
            <Link
              to="/categories"
              className="block py-2 hover:text-primary-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Danh mục
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
