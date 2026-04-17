// Контейнер (карточка) с тенью и рамкой
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  onClick,
  clickable = false,
  padding = 'md',
}) => {
  return (
    <div
      className={`
        ${styles.card} 
        ${styles[`padding-${padding}`]}
        ${clickable ? styles.clickable : ''}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
