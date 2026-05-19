import { LoginForm } from '../components/LoginPage/LoginForm';
import styles from '../assets/LoginPage.module.css';
import { useLoginForm } from '../hooks/useLoginForm';

export function LoginPage() {
  const loginForm = useLoginForm();

  return (
    <div className={styles.login_container}>
      <div className={styles.login_card}>
        <div className={styles.login_logo}>
          <img src="/T-Bank-Logo.png" width={64} height={64} alt="Лого" />
        </div>
        <h1 className={styles.login_title}>Вход в систему</h1>
        <p className={styles.login_subtitle}>Управление идеями команды</p>

        <LoginForm
          email={loginForm.email}
          password={loginForm.password}
          loading={loginForm.loading}
          errorMessage={loginForm.errorMessage}
          onEmailChange={loginForm.handleEmailChange}
          onPasswordChange={loginForm.handlePasswordChange}
          onSubmit={loginForm.handleLogin}
        />
      </div>
    </div>
  );
}
