import { useCallback } from 'react';

export const useAlert = () => {
  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const event = new CustomEvent('show-alert', { detail: { message, type } });
    window.dispatchEvent(event);
  }, []);

  return { showAlert };
};

