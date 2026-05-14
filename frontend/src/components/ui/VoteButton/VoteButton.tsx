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

  const activeClass = active
    ? type === 'up'
      ? 'active-up'
      : 'active-down'
    : '';

  return (
    <button
      type="button"
      className={`${styles.voteBtn} ${styles[size]} ${activeClass ? styles[activeClass] : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={type === 'up' ? 'Голосовать за' : 'Голосовать против'}
    >
      {type === 'up' ? '+' : '−'}
    </button>
  );
};
