import { createContext } from "react";

export type ToastTone = "success" | "danger" | "warning" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** ms before auto-dismiss; pass 0 to require manual dismissal. */
  duration?: number;
}

export interface ToastRecord extends Required<Omit<ToastInput, "description">> {
  id: string;
  description?: string;
}

export interface ToastContextValue {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
