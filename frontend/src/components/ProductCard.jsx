import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product, compact = false }) => {
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
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
          }}
          loading="lazy"
        />
        {hasDiscount && (
          <span className={`absolute top-1 left-1 bg-red-500 text-white px-1.5 py-0.5 rounded ${compact ? 'text-[10px]' : 'text-xs'}`}>
            -{discountPercent}%
          </span>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className={`text-white font-bold ${compact ? 'text-xs' : 'text-sm'}`}>Hết hàng</span>
          </div>
        )}
      </div>

      <div className={compact ? 'p-2' : 'p-3 md:p-4'}>
        <p className={`text-gray-500 mb-0.5 truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {product.categories?.name || 'Chưa phân loại'}
        </p>
        <h3 className={`font-medium text-gray-800 mb-1.5 line-clamp-2 ${compact ? 'text-xs min-h-[2rem]' : 'text-sm md:text-base min-h-[2.5rem] md:min-h-[3rem]'}`}>
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0">
            <p className={`text-primary-600 font-bold truncate ${compact ? 'text-xs' : 'text-sm md:text-base'}`}>
              {formatCurrency(displayPrice)}
            </p>
            {hasDiscount && (
              <p className={`text-gray-400 line-through truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {formatCurrency(product.price)}
              </p>
            )}
          </div>
          
          {product.stock_quantity > 0 && (
            <button
              onClick={handleAddToCart}
              className={`bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shrink-0 ${compact ? 'p-1.5' : 'p-2'}`}
            >
              <ShoppingCart size={compact ? 14 : 18} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
