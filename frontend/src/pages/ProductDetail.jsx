import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import { useCart } from '../contexts/CartContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  if (loading) return <Loading />;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg mb-4">Không tìm thấy sản phẩm</p>
        <Link to="/products" className="text-primary-600 hover:underline">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const displayPrice = hasDiscount ? product.sale_price : product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/products"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Quay lại
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image_url || 'https://via.placeholder.com/500?text=No+Image'}
            alt={product.name}
            className="w-full rounded-xl shadow-lg"
          />
          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-bold">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-gray-500 mb-2">
            {product.categories?.name || 'Chưa phân loại'}
          </p>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-3xl font-bold text-primary-600">
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-600">{product.description || 'Không có mô tả'}</p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-600">Đơn vị:</span>
            <span className="font-medium">{product.unit}</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-600">Tình trạng:</span>
            {product.stock_quantity > 0 ? (
              <span className="text-green-600 font-medium">
                Còn hàng ({product.stock_quantity} {product.unit})
              </span>
            ) : (
              <span className="text-red-600 font-medium">Hết hàng</span>
            )}
          </div>

          {product.stock_quantity > 0 && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-600">Số lượng:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus size={20} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(product.stock_quantity, Math.max(1, val)));
                    }}
                    className="w-16 text-center border-x py-2"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 text-lg py-3 px-8"
              >
                <ShoppingCart size={24} />
                Thêm vào giỏ hàng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
