import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../shared/api/auth';
import { setAuth } from '../shared/store/authSlice';
import { useAppDispatcher } from '../shared/store/hooks';

const getLoginErrorMessage = (error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;

  if (status === 401) {
    return 'Неверный email или пароль';
  }

  if (!status) {
    return 'Не удалось подключиться к серверу. Проверьте, что backend запущен';
  }

  return 'Не удалось войти. Попробуйте ещё раз';
};

export function useLoginForm() {
  const dispatch = useAppDispatcher();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setErrorMessage('');
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setErrorMessage('');
  }, []);

  const handleLogin = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        setLoading(true);
        setErrorMessage('');

        const response = await login({ email, password });

        dispatch(
          setAuth({
            token: response.accessToken,
            user: response.user,
          }),
        );
        navigate('/projects', { replace: true });
      } catch (error) {
        setErrorMessage(getLoginErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, email, navigate, password],
  );

  return {
    email,
    password,
    loading,
    errorMessage,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
  };
}
