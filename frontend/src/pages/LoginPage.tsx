import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    navigate('/projects');
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

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input type="password" />
            </div>
            <Button type="submit" variant="primary" size="md" fullWidth>
              Войти
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
