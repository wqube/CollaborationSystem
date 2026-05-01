import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';
import { userAppSelector } from '../../shared/store/hooks';

export function Header() {
  const navigate = useNavigate();
  const user = userAppSelector((state) => state.auth.user);

  const getInitials = (name: string): string => {
    return name
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = user?.displayName || 'Гость';
  const userInitials = user ? getInitials(user.displayName) : 'Г';

  return (
    <header className={styles.app_header}>
      <div className={styles.logo} onClick={() => navigate('/projects')}>
        <img src={`/public/T-bank-logo.png`} width={36} height={36} />
        <span>Система совместной работы</span>
      </div>
      <div className={styles.user}>
        <span
          className={styles.text_small}
          onClick={() => navigate('/profile')}
        >
          {userName}
        </span>
        <span className={styles.text_small} onClick={() => navigate('/drafts')}>
          Черновики
        </span>
        <div
          className={styles.user_avatar}
          onClick={() => navigate('/profile')}
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
