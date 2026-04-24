// Кнопки
import styles from './Button.module.css';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={`
        ${styles.btn} 
        ${styles[variant]} 
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ''}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
