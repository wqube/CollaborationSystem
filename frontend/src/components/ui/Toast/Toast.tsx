import { useEffect } from 'react';
import styles from './Toast.module.css';

export type ToastVariant = 'error' | 'success' | 'info';

interface ToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  autoCloseMs?: number;
}

const variantTitles: Record<ToastVariant, string> = {
  error: 'Ошибка',
  success: 'Готово',
  info: 'Информация',
};

export function Toast({
  open,
  message,
  variant = 'info',
  onClose,
  autoCloseMs = 5000,
}: ToastProps) {
  useEffect(() => {
    if (!open || autoCloseMs <= 0) return;

    const timeoutId = window.setTimeout(onClose, autoCloseMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoCloseMs, onClose, open]);

  if (!open) return null;

  return (
    <div
      className={`${styles.toast} ${styles[variant]}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={styles.content}>
        <strong className={styles.title}>{variantTitles[variant]}</strong>
        <span className={styles.message}>{message}</span>
      </div>

      <button
        className={styles.close}
        type="button"
        aria-label="Закрыть уведомление"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}
