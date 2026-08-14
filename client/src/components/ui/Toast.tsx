import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX, FiXCircle } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { motionTokens, springs } from "@/lib/animations/tokens";
import { ToastContext, type ToastInput, type ToastRecord, type ToastTone } from "./toast-context";

const toneConfig: Record<ToastTone, { icon: typeof FiInfo; className: string }> = {
  success: { icon: FiCheckCircle, className: "text-success" },
  danger: { icon: FiXCircle, className: "text-danger" },
  warning: { icon: FiAlertTriangle, className: "text-warning" },
  info: { icon: FiInfo, className: "text-info" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, tone = "info", duration = 5000 }: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, title, description, tone, duration }]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
          role="region"
          aria-label="Notifications"
        >
          <AnimatePresence mode="sync">
            {toasts.map((t) => {
              const { icon: Icon, className } = toneConfig[t.tone];
              return (
                <motion.div
                  key={t.id}
                  layout
                  role="status"
                  initial={{
                    opacity: 0,
                    x: motionTokens.distance.xl,
                    scale: motionTokens.scale.subtle,
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: motionTokens.distance.xl,
                    scale: motionTokens.scale.subtle,
                  }}
                  transition={springs.snappy}
                  className="pointer-events-auto flex items-start gap-3 rounded-xl border border-base-700 bg-base-800 p-4 shadow-2xl"
                >
                  <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", className)} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-50">{t.title}</p>
                    {t.description && <p className="mt-0.5 text-sm text-base-300">{t.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss notification"
                    className="rounded-md p-0.5 text-base-400 transition-colors hover:bg-base-700 hover:text-base-100"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
