import styles from './VoteButton.module.css';

export interface VoteButtonProps {
  type: 'up' | 'down';
  size?: 'sm' | 'lg';
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const VoteButton = ({
  type,
  size = 'sm',
  active = false,
  onClick,
  disabled = false,
  className = '',
}: VoteButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`${styles.voteBtn} ${styles[size]} ${active ? styles.active : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={
        type === 'up' ? 'Голос за предложение' : 'Голос против предложения'
      }
      aria-pressed={active}
    >
      {type === 'up' ? (
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      ) : (
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      )}
    </button>
  );
};
