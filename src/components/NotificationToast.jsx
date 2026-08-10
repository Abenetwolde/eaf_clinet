import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="toast-root" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      background: toast.type === 'success' ? '#0E2419' : toast.type === 'error' ? '#2A0E12' : '#0F1C2E',
      border: `1px solid ${toast.type === 'success' ? '#00E676' : toast.type === 'error' ? '#FF3B30' : '#60A5FA'}`,
      color: '#FFF',
      padding: '14px 20px',
      borderRadius: '14px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '420px',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {toast.type === 'success' && <CheckCircle2 color="#00E676" size={20} />}
      {toast.type === 'error' && <AlertCircle color="#FF3B30" size={20} />}
      {toast.type === 'info' && <Info color="#60A5FA" size={20} />}

      <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.4 }}>
        {toast.message}
      </div>

      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
