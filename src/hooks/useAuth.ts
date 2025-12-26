import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useLoginMutation, useRegisterMutation } from '../store/api/authApi';
import { setCredentials, clearCredentials } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();

  const isAuthenticated = !!token && !!user;

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password }).unwrap();
      dispatch(setCredentials(result));
      navigate('/dashboard');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.error || error?.message || 'Login failed',
      };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const result = await registerMutation({ email, password }).unwrap();
      dispatch(setCredentials(result));
      navigate('/dashboard');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.error || error?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    dispatch(clearCredentials());
    navigate('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    isLoading: isLoggingIn || isRegistering,
  };
};

