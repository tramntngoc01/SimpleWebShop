import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

// Simple cache for products
const cache = new Map();
const CACHE_TTL = 60 * 1000;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const abortControllerRef = useRef(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
  });

  // Fetch categories with caching
  useEffect(() => {
    const fetchCategories = async () => {
      const cacheKey = 'categories';
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL * 5) {
        setCategories(cached.data);
        return;
      }

      try {
        const response = await api.get('/categories');
        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with caching and abort controller
  useEffect(() => {
    const fetchProducts = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('page', filters.page);
      params.append('limit', 12);

      const cacheKey = `products:${params.toString()}`;
      const cached = cache.get(cacheKey);

      // Show cached data immediately
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setProducts(cached.data.products);
        setPagination(cached.data.pagination);
        setLoading(false);
        setSearchParams(params);
        return;
      }

      // Show stale data while fetching
      if (cached) {
        setProducts(cached.data.products);
        setPagination(cached.data.pagination);
      } else {
        setLoading(true);
      }

      try {
        const response = await api.get(`/products?${params.toString()}`, {
          signal: abortControllerRef.current.signal
        });
        
        const responseData = response.data;
        cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
        setProducts(responseData.products);
        setPagination(responseData.pagination);
        setSearchParams(params);
      } catch (error) {
        if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
          console.error('Failed to fetch products:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Sản phẩm</h1>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden btn-secondary flex items-center justify-center"
        >
          <Filter size={20} className="mr-2" />
          Bộ lọc
        </button>

        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
          }}
          className="input-field md:w-48"
        >
          <option value="created_at-desc">Mới nhất</option>
          <option value="created_at-asc">Cũ nhất</option>
          <option value="price-asc">Giá thấp - cao</option>
          <option value="price-desc">Giá cao - thấp</option>
          <option value="name-asc">Tên A-Z</option>
          <option value="name-desc">Tên Z-A</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`
          ${showFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : 'hidden'}
          md:block md:static md:w-56 md:shrink-0
        `}>
          <div className="flex items-center justify-between md:hidden mb-4">
            <h2 className="font-bold text-lg">Bộ lọc</h2>
            <button onClick={() => setShowFilters(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-medium mb-3">Danh mục</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                <label className="flex items-center cursor-pointer hover:text-primary-600">
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => handleFilterChange('category', '')}
                    className="mr-2 accent-primary-600"
                  />
                  Tất cả
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center cursor-pointer hover:text-primary-600">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === cat.id}
                      onChange={() => handleFilterChange('category', cat.id)}
                      className="mr-2 accent-primary-600"
                    />
                    <span className="truncate">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="font-medium mb-3">Khoảng giá</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-red-600 text-sm hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}

            <button
              onClick={() => setShowFilters(false)}
              className="md:hidden btn-primary w-full"
            >
              Áp dụng
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Hiển thị {products.length} / {pagination.total} sản phẩm
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-1 flex-wrap">
                  {/* Nút Previous */}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 rounded-lg bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                  >
                    ‹
                  </button>
                  
                  {/* Hiển thị tối đa 5 trang */}
                  {(() => {
                    const currentPage = pagination.page;
                    const totalPages = pagination.totalPages;
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, startPage + 4);
                    
                    if (endPage - startPage < 4) {
                      startPage = Math.max(1, endPage - 4);
                    }
                    
                    const pages = [];
                    
                    if (startPage > 1) {
                      pages.push(
                        <button key={1} onClick={() => setFilters(prev => ({ ...prev, page: 1 }))} className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">1</button>
                      );
                      if (startPage > 2) {
                        pages.push(<span key="start-ellipsis" className="px-2">...</span>);
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setFilters(prev => ({ ...prev, page: i }))}
                          className={`px-3 py-2 rounded-lg ${i === currentPage ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(<span key="end-ellipsis" className="px-2">...</span>);
                      }
                      pages.push(
                        <button key={totalPages} onClick={() => setFilters(prev => ({ ...prev, page: totalPages }))} className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">{totalPages}</button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  {/* Nút Next */}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 rounded-lg bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
