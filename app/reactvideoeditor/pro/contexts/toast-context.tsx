'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

interface ToastContextType {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => {
    id: string;
    dismiss: () => void;
    update: (updatedProps: Partial<Toast>) => void;
  };
  dismiss: (toastId?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({ toasts: [] });

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = (++toastCount).toString();
    const newToast: Toast = {
      id,
      ...props,
    };

    setState((prevState) => ({
      toasts: [...prevState.toasts, newToast],
    }));

    // Auto-dismiss toast after duration
    const duration = props.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setState((prevState) => ({
          toasts: prevState.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return {
      id,
      dismiss: () => {
        setState((prevState) => ({
          toasts: prevState.toasts.filter((t) => t.id !== id),
        }));
      },
      update: (updatedProps: Partial<Toast>) => {
        setState((prevState) => ({
          toasts: prevState.toasts.map((t) =>
            t.id === id ? { ...t, ...updatedProps } : t
          ),
        }));
      },
    };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    setState((prevState) => ({
      toasts: toastId
        ? prevState.toasts.filter((t) => t.id !== toastId)
        : [],
    }));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

