import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>{currentYear} Система совместной работы. Все права защищены.</p>
      </div>
    </footer>
  );
}
