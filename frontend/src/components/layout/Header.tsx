import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const userName = 'Фамилия Имя';
  const userInitials = 'ФИ';

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
