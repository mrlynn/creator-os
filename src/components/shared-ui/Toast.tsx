'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastMessage {
  id: number;
  message: string;
  severity: AlertColor;
}

interface ToastContextValue {
  toast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, severity: AlertColor = 'success') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, severity }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.map((t, i) => (
        <Snackbar
          key={t.id}
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ bottom: { xs: 16 + i * 60 } }}
        >
          <Alert severity={t.severity} variant="filled" sx={{ minWidth: 280 }}>
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
