import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">🛒 Tạp Hóa Đơn Giản</h3>
            <p className="text-gray-400 text-sm">
              Cửa hàng tạp hóa online tiện lợi, giao hàng nhanh chóng, 
              giá cả phải chăng.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên kết</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white">Trang chủ</Link></li>
              <li><Link to="/products" className="hover:text-white">Sản phẩm</Link></li>
              <li><Link to="/categories" className="hover:text-white">Danh mục</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-white">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📍 123 Đường ABC, Quận 1, TP.HCM</li>
              <li>📞 0123 456 789</li>
              <li>✉️ contact@taphoadongian.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 Tạp Hóa Đơn Giản. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
