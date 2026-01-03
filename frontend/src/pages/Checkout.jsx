import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, total, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shippingName: user?.full_name || '',
    shippingPhone: user?.phone || '',
    shippingAddress: user?.address || '',
    note: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (items.length === 0) {
      navigate('/cart');
    }
  }, [user, items, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shippingName || !formData.shippingPhone || !formData.shippingAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/orders', formData);
      toast.success('Đặt hàng thành công!');
      await fetchCart();
      navigate(`/orders/${response.data.order.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh toán</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <h2 className="font-bold text-lg mb-4">Thông tin giao hàng</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="shippingName"
                value={formData.shippingName}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="shippingPhone"
                value={formData.shippingPhone}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="0123 456 789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ giao hàng <span className="text-red-500">*</span>
              </label>
              <textarea
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                required
                className="input-field"
                rows={3}
                placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="input-field"
                rows={2}
                placeholder="Ghi chú cho đơn hàng (tùy chọn)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Đơn hàng của bạn</h2>

            <div className="space-y-3 max-h-60 overflow-auto">
              {items.map((item) => {
                const price = item.products.sale_price || item.products.price;
                return (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.products.image_url || 'https://via.placeholder.com/50'}
                      alt={item.products.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.products.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(price)} x {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            <hr className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-primary-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
