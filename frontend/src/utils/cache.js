import { useState, useEffect, useRef, useCallback } from 'react';
import api from './api';

// Simple cache store
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

const getCached = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Custom hook for data fetching with caching
 * Implements stale-while-revalidate pattern
 */
export const useCachedFetch = (url, options = {}) => {
  const { 
    enabled = true, 
    cacheTime = CACHE_TTL,
    staleTime = 30 * 1000, // Data is fresh for 30 seconds
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(() => getCached(url));
  const [loading, setLoading] = useState(!getCached(url));
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled || fetchingRef.current) return;

    const cached = cache.get(url);
    const isFresh = cached && (Date.now() - cached.timestamp < staleTime);

    // If data is fresh, don't refetch
    if (isFresh) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // If we have stale data, show it while revalidating
    if (cached) {
      setData(cached.data);
      setLoading(false);
    } else if (showLoading) {
      setLoading(true);
    }

    fetchingRef.current = true;

    try {
      const response = await api.get(url);
      const newData = response.data;
      
      setCache(url, newData);
      setData(newData);
      setError(null);
      onSuccess?.(newData);
    } catch (err) {
      setError(err);
      onError?.(err);
      // Keep showing cached data on error
      if (!cached) {
        console.error('Fetch error:', err);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [url, enabled, staleTime, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    cache.delete(url);
    return fetchData(true);
  }, [url, fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Prefetch data and store in cache
 */
export const prefetch = async (url) => {
  try {
    const response = await api.get(url);
    setCache(url, response.data);
    return response.data;
  } catch (error) {
    console.error('Prefetch error:', error);
    return null;
  }
};

/**
 * Invalidate cache for specific URL or pattern
 */
export const invalidateCache = (urlPattern) => {
  if (typeof urlPattern === 'string') {
    cache.delete(urlPattern);
  } else {
    // If regex, delete all matching
    for (const key of cache.keys()) {
      if (urlPattern.test(key)) {
        cache.delete(key);
      }
    }
  }
};

/**
 * Clear all cache
 */
export const clearCache = () => {
  cache.clear();
};

export default { useCachedFetch, prefetch, invalidateCache, clearCache };
