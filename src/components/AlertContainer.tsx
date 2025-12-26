import { useState, useEffect, useCallback } from 'react';
import { Alert } from './Alert';

interface AlertMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const AlertContainer = () => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const showAlert = useCallback((message: string, type: AlertMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setAlerts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  useEffect(() => {
    // Expose showAlert globally for backward compatibility
    (window as any).showAlert = showAlert;

    // Listen for custom events
    const handleCustomAlert = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: AlertMessage['type'] }>;
      showAlert(customEvent.detail.message, customEvent.detail.type);
    };

    window.addEventListener('show-alert', handleCustomAlert);

    return () => {
      window.removeEventListener('show-alert', handleCustomAlert);
      delete (window as any).showAlert;
    };
  }, [showAlert]);

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 3000, maxWidth: '400px' }}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );
};

