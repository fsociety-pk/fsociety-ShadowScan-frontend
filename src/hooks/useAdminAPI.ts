import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

export function useAdminAPI() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.error('Session expired. Authorization required.');
    navigate('/login');
  }, [navigate]);

  const call = useCallback(async <T>(
    apiMethod: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries) {
      try {
        const result = await apiMethod(...args);
        setLoading(false);
        return result;
      } catch (err: any) {
        // Handle 401 Unauthorized immediately
        if (err.response?.status === 401) {
          handleUnauthorized();
          setLoading(false);
          return null;
        }

        // Check if we should retry
        if (retryCount < maxRetries) {
          console.warn(`[useAdminAPI] Request failed, retrying... (${retryCount + 1}/${maxRetries})`);
          retryCount++;
          // Optional: Add a small delay between retries
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        // Final failure
        const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
        setError(errorMessage);
        message.error(errorMessage);
        setLoading(false);
        return null;
      }
    }
    
    setLoading(false);
    return null;
  }, [handleUnauthorized]);

  return {
    loading,
    error,
    call,
    setError,
    setLoading
  };
}
