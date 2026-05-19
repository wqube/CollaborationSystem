import { Button } from '../ui/Button/Button';
import styles from '../../assets/LoginPage.module.css';

interface LoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  errorMessage: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function LoginForm({
  email,
  password,
  loading,
  errorMessage,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={loading}
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label>Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          disabled={loading}
          autoComplete="current-password"
        />
      </div>

      {errorMessage && (
        <p className={styles.login_error} role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={loading} fullWidth>
        {loading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
}
