import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Toast } from '../types';

interface NotificationToastProps {
  toast: Toast | null;
  onClose: () => void;
}

const toastStyles: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-[#0E2419]',
    border: 'border-[#00E676]',
    icon: <CheckCircle2 color="#00E676" size={20} />,
  },
  error: {
    bg: 'bg-[#2A0E12]',
    border: 'border-[#FF3B30]',
    icon: <AlertCircle color="#FF3B30" size={20} />,
  },
  info: {
    bg: 'bg-[#0F1C2E]',
    border: 'border-blue-400',
    icon: <Info color="#60A5FA" size={20} />,
  },
};

export default function NotificationToast({ toast, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const style = toast ? (toastStyles[toast.type] ?? toastStyles.info) : toastStyles.info;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, x: 80, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className={`fixed bottom-6 right-6 z-[1000] ${style.bg} border ${style.border}
            text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[420px]`}
        >
          {style.icon}
          <div className="flex-1 text-sm leading-snug">{toast.message}</div>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-text-muted cursor-pointer hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
