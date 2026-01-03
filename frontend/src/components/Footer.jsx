import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">🇹🇭 Chaa Nôm</h3>
            <p className="text-gray-400 text-sm">
              Cửa hàng Thái Lan - Sản phẩm nhập khẩu chính hãng,
              giao hàng nhanh chóng, giá cả phải chăng.
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
              <li>📍 25D Thôn 7, Gia Hiệp, Lâm Đồng</li>
              <li>📞 0975 794 143</li>
              <li>
                <a href="https://www.facebook.com/profile.php?id=61576239952718" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                  📘 Facebook Chaa Nôm
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2026 Chaa Nôm - Cửa hàng Thái Lan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
