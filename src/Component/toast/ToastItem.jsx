import { useState, useEffect, useCallback } from "react";

// ============================================
// أيقونة التحذير
// ============================================
const warningIcon = (
  <svg
    viewBox="0 0 24 24"
    width="28"
    height="28"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

// ============================================
// ToastItem (نجاح / خطأ)
// ============================================
export default function ToastItem({ message, type, title, onClose, duration }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  }, [onClose]);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const icons = {
    success: (
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    ),
    error: (
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
    info: (
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    )
  };

  return (
    <div
      className={`custom-toast-overlay ${isClosing ? "overlay-closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`custom-toast custom-toast-${type} ${isClosing ? "toast-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="toast-icon">{icons[type]}</div>
        <div className="toast-body">
          <strong>{title}</strong>
          <p>{message}</p>
        </div>
        <button className="toast-close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
}

// ============================================
// ConfirmToast (تأكيد)
// ============================================
export function ConfirmToast({ message, title, onConfirm, onCancel, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm();
      onClose();
    }, 300);
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel?.();
      onClose();
    }, 300);
  };

  return (
    <div
      className={`custom-toast-overlay ${isClosing ? "overlay-closing" : ""}`}
      onClick={handleCancel}
    >
      <div
        className={`custom-toast custom-toast-warning ${isClosing ? "toast-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="toast-icon">{warningIcon}</div>
        <div className="toast-body">
          <strong>{title}</strong>
          <p>{message}</p>
          <div className="toast-buttons">
            <button
              className="toast-btn toast-btn-confirm"
              onClick={handleConfirm}
            >
              نعم
            </button>
            <button
              className="toast-btn toast-btn-cancel"
              onClick={handleCancel}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
