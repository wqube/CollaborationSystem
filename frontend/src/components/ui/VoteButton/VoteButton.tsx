//Кнопка голосования Up/Down
import React from 'react';
import styles from './VoteButton.module.css';

export type VoteType = 'up' | 'down';

interface VoteButtonProps {
  type: VoteType;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  type,
  active = false,
  onClick,
  disabled = false,
  size = 'md',
}) => {
  return (
    <button
      className={`
        ${styles.voteBtn} 
        ${styles[size]} 
        ${active ? styles[`active-${type}`] : ''}
      `}
      onClick={onClick}
      disabled={disabled}
      aria-label={type === 'up' ? 'Голосовать за' : 'Голосовать против'}
    >
      {type === 'up' ? '+' : '−'}
    </button>
  );
};
