import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, saleRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/featured/sale')
        ]);
        setCategories(categoriesRes.data);
        setSaleProducts(saleRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Chào mừng đến với Tạp Hóa Đơn Giản
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Mua sắm tiện lợi, giao hàng nhanh chóng, giá cả phải chăng
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-lg font-bold hover:bg-primary-50 transition-colors"
            >
              Mua sắm ngay
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Danh mục sản phẩm</h2>
            <Link to="/categories" className="text-primary-600 hover:underline flex items-center">
              Xem tất cả <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="card p-4 text-center hover:border-primary-500 border-2 border-transparent transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={category.image_url || 'https://via.placeholder.com/100'}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-medium text-gray-800 text-sm">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sale Products Section */}
      {saleProducts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <TrendingDown className="text-red-500 mr-2" size={28} />
                <h2 className="text-2xl font-bold text-gray-800">Khuyến mãi hot</h2>
              </div>
              <Link to="/products" className="text-primary-600 hover:underline flex items-center">
                Xem tất cả <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">Giao hàng trong ngày với đơn hàng nội thành</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💯</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Đảm bảo chất lượng</h3>
              <p className="text-gray-600">Sản phẩm chính hãng, nguồn gốc rõ ràng</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Giá tốt nhất</h3>
              <p className="text-gray-600">Cam kết giá tốt, nhiều khuyến mãi hấp dẫn</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
