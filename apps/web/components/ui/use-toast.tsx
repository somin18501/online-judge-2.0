'use client';

import * as React from 'react';
import type { ToastProps } from './toast';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = Omit<ToastProps, 'title' | 'description'> & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

type ToastState = { toasts: ToasterToast[] };

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string };

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function reducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case 'DISMISS_TOAST':
      return {
        toasts: state.toasts.map((t) =>
          action.toastId === undefined || t.id === action.toastId ? { ...t, open: false } : t,
        ),
      };
    case 'REMOVE_TOAST':
      return {
        toasts:
          action.toastId === undefined
            ? []
            : state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

function dispatch(action: Action): void {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

let toastCount = 0;
function genId(): string {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return String(toastCount);
}

export interface ToastInput {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastProps['variant'];
  duration?: number;
}

export function toast(input: ToastInput): { id: string; dismiss: () => void } {
  const id = genId();
  const duration = input.duration ?? TOAST_REMOVE_DELAY;
  dispatch({
    type: 'ADD_TOAST',
    toast: {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant,
      open: true,
      onOpenChange: (open) => {
        if (!open) dispatch({ type: 'REMOVE_TOAST', toastId: id });
      },
    },
  });
  setTimeout(() => dispatch({ type: 'REMOVE_TOAST', toastId: id }), duration);
  return { id, dismiss: () => dispatch({ type: 'DISMISS_TOAST', toastId: id }) };
}

export function useToast(): { toasts: ToasterToast[]; toast: typeof toast } {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return { toasts: state.toasts, toast };
}
