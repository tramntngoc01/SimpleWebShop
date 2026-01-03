import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusText, getStatusColor } from '../utils/helpers';
import Loading from '../components/Loading';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/orders?page=${page}&limit=10`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có đơn hàng</h2>
        <p className="text-gray-600 mb-6">Hãy đặt hàng đầu tiên của bạn</p>
        <Link to="/products" className="btn-primary">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Đơn hàng của tôi</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg">{order.order_number}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Ngày đặt: {formatDate(order.created_at)}
                </p>
                <p className="text-gray-600 text-sm">
                  Địa chỉ: {order.shipping_address}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tổng tiền</p>
                  <p className="font-bold text-lg text-primary-600">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="btn-secondary flex items-center"
                >
                  <Eye size={18} className="mr-1" />
                  Chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchOrders(page)}
              className={`px-4 py-2 rounded-lg ${
                page === pagination.page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
