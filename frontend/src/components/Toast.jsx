import { useState, useEffect } from 'react';

let toastId = 0;
let globalSetToasts = null;

export function toast(message, type = 'success') {
  if (globalSetToasts) {
    const id = ++toastId;
    globalSetToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      globalSetToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { globalSetToasts = setToasts; return () => { globalSetToasts = null; }; }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✓' : '✗'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
