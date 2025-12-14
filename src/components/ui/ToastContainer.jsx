import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Check, AlertCircle, Info, X } from 'lucide-react';

const ToastItem = ({ toast }) => {
  const { removeToast } = useToast();
  const { id, message, type } = toast;

  let icon;
  let bgColor;
  let borderColor;
  let textColor;

  switch (type) {
    case 'success':
      icon = <Check size={20} />;
      bgColor = 'rgba(34, 197, 94, 0.1)';
      borderColor = 'rgba(34, 197, 94, 0.5)';
      textColor = '#86efac'; // green-300
      break;
    case 'error':
      icon = <AlertCircle size={20} />;
      bgColor = 'rgba(239, 68, 68, 0.1)';
      borderColor = 'rgba(239, 68, 68, 0.5)';
      textColor = '#fca5a5'; // red-300
      break;
    default:
      icon = <Info size={20} />;
      bgColor = 'rgba(59, 130, 246, 0.1)';
      borderColor = 'rgba(59, 130, 246, 0.5)';
      textColor = '#93c5fd'; // blue-300
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: '#1f2023', // Dark background matching the app
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        color: textColor,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        minWidth: '300px',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
        marginBottom: '10px',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', flex: 1 }}>{message}</p>
      <button
        onClick={() => removeToast(id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          opacity: 0.7,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none', // Allow clicks to pass through the container area
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
