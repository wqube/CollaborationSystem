import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { useAppDispatcher } from '../shared/store/hooks';
import { setAuth } from '../shared/store/authSlice';
import { login } from '../shared/api/auth';

export function LoginPage() {
  const dispatch = useAppDispatcher();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      const responce = await login({ email, password });
      dispatch(setAuth({ token: responce.accessToken, user: responce.user }));
      navigate('/projects', { replace: true });
    } catch (error) {
      console.error('Ошибка авторизации', error);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src={`/public/T-bank-logo.png`} width={64} height={64} />
          </div>
          <h1 className="login-title">Вход в систему</h1>
          <p className="login-subtitle">Управление идеями команды</p>

          <form>
            <div className="form-group">
              <label>Email</label>
              <input type="email" />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input type="password" />
            </div>
            <Button onClick={() => handleLogin('test@test.local', 'password')}>
              Войти
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
