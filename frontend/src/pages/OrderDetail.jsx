import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusText, getStatusColor } from '../utils/helpers';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Không tìm thấy đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Đã hủy đơn hàng');
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể hủy đơn hàng');
    }
  };

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        <Link to="/orders" className="text-primary-600 hover:underline mt-4 inline-block">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const statusSteps = ['pending', 'confirmed', 'shipping', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/orders"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Quay lại
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Đơn hàng #{order.order_number}</h1>
                <p className="text-gray-600">Ngày đặt: {formatDate(order.created_at)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            {/* Status Timeline */}
            {order.status !== 'cancelled' && (
              <div className="flex items-center justify-between mt-6">
                {statusSteps.map((step, index) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}
                    `}>
                      {index + 1}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {order.status !== 'cancelled' && (
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Chờ xác nhận</span>
                <span>Đã xác nhận</span>
                <span>Đang giao</span>
                <span>Đã giao</span>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Sản phẩm đã đặt</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <Package size={40} className="text-gray-300" />
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.product_price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 space-y-6 sticky top-24">
            {/* Shipping Info */}
            <div>
              <h3 className="font-bold mb-3">Thông tin giao hàng</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-600">Người nhận:</span> {order.shipping_name}</p>
                <p><span className="text-gray-600">SĐT:</span> {order.shipping_phone}</p>
                <p><span className="text-gray-600">Địa chỉ:</span> {order.shipping_address}</p>
                {order.note && (
                  <p><span className="text-gray-600">Ghi chú:</span> {order.note}</p>
                )}
              </div>
            </div>

            <hr />

            {/* Payment Summary */}
            <div>
              <h3 className="font-bold mb-3">Tổng thanh toán</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-primary-600">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            {/* Cancel Button */}
            {order.status === 'pending' && (
              <button
                onClick={handleCancelOrder}
                className="btn-danger w-full"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
