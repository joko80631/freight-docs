import * as React from 'react';

import type {
  ToastActionElement,
  ToastProps,
} from '@/components/ui/toast';

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type Toast = Omit<ToasterToast, 'id'>;

type ToastAction = {
  toast: Toast;
  update: (props: ToasterToast) => void;
  dismiss: () => void;
};

type ToastState = {
  toasts: ToasterToast[];
  toast: (props: Toast) => ToastAction;
  dismiss: (toastId?: string) => void;
};

export type { Toast, ToastAction, ToastState, ToasterToast }; 