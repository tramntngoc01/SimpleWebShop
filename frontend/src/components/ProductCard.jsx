import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const displayPrice = hasDiscount ? product.sale_price : product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.sale_price / product.price) * 100) 
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    await addToCart(product.id);
  };

  return (
    <Link to={`/products/${product.id}`} className="card group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">Hết hàng</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">
          {product.categories?.name || 'Chưa phân loại'}
        </p>
        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 h-12">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-600 font-bold">
              {formatCurrency(displayPrice)}
            </p>
            {hasDiscount && (
              <p className="text-gray-400 text-sm line-through">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>
          
          {product.stock_quantity > 0 && (
            <button
              onClick={handleAddToCart}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ShoppingCart size={20} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
