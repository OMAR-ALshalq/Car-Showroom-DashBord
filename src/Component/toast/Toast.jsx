import "./Toast.css";
import { createRoot } from "react-dom/client";
import ToastItem, { ConfirmToast } from "./ToastItem";

// ============================================
// مدير التوست
// ============================================
let container = null;
let root = null;
let toasts = [];

function getContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className = "custom-toast-container";
    document.body.appendChild(container);
    root = createRoot(container);
  }
  return root;
}

function renderToasts() {
  const r = getContainer();
  r.render(
    <>
      {toasts.map((t) =>
        t.isConfirm ? (
          <ConfirmToast
            key={t.id}
            message={t.message}
            title={t.title}
            onConfirm={t.onConfirm}
            onCancel={t.onCancel}
            onClose={() => removeToast(t.id)}
          />
        ) : (
          <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
        )
      )}
    </>
  );
}

function removeToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  renderToasts();
}

function addToast(type, message, title, duration = 3000) {
  toasts = [
    ...toasts,
    { id: Date.now() + Math.random(), type, message, title, duration }
  ];
  renderToasts();
}

function addConfirm(message, title, onConfirm, onCancel) {
  toasts = [
    ...toasts,
    {
      id: Date.now() + Math.random(),
      isConfirm: true,
      message,
      title,
      onConfirm,
      onCancel
    }
  ];
  renderToasts();
}

function addInfo(message, title, duration = 3000) {
  toasts = [
    ...toasts,
    { id: Date.now() + Math.random(), type: "info", message, title, duration }
  ];
  renderToasts();
}
// ============================================
// دوال التصدير
// ============================================
export const showSuccess = (message, title = "تم!") =>
  addToast("success", message, title);

export const showError = (message, title = "خطأ!") =>
  addToast("error", message, title, 4000);

export const showConfirm = (message, title, onConfirm, onCancel) =>
  addConfirm(message, title, onConfirm, onCancel);

export const showInfo = (message, title = "معلومة") =>
  addInfo(message, title, 4000);