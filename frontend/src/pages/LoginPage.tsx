import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { useAppDispatcher } from '../shared/store/hooks';
import { setAuth } from '../shared/store/authSlice';
import { login } from '../shared/api/auth';
import { useState } from 'react';
import styles from '../assets/LoginPage.module.css';

export function LoginPage() {
  const dispatch = useAppDispatcher();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const responce = await login({ email, password });

      dispatch(setAuth({ token: responce.accessToken, user: responce.user }));
      navigate('/projects', { replace: true });
    } catch (error) {
      console.error('Ошибка авторизации', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.login_container}>
        <div className={styles.login_card}>
          <div className={styles.login_logo}>
            <img src={`/public/T-bank-logo.png`} width={64} height={64} />
          </div>
          <h1 className={styles.login_title}>Вход в систему</h1>
          <p className={styles.login_subtitle}>Управление идеями команды</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
