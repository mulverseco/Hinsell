import { useDispatch, useSelector } from 'react-redux';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useEffect } from 'react';
import { useGetUserQuery, useLoginMutation } from '@/core/services/api';
import { RootState } from '@/core/store';
import { hydrateAuth, logout, setToken, setUser } from '@/core/store/auth-slice';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Main: undefined;
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { token, user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [loginMutation, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useGetUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    const loadAuthState = async () => {
      const authState = await EncryptedStorage.getItem('auth');
      if (authState) {
        dispatch(hydrateAuth(JSON.parse(authState)));
      }
    };
    loadAuthState();
  }, [dispatch]);

  useEffect(() => {
    if (token && userData) {
      if (userData) {
        dispatch(setUser(userData));
      }
    }
  }, [token, userData, dispatch]);

  const login = async (username: string, password: string) => {
    try {
      const loginResponse = await loginMutation({ username: username.trim(), password: password.trim() }).unwrap();
      dispatch(setToken(loginResponse.access));
      if (userData) {
        dispatch(setUser(userData));
      }
      navigation.navigate('Main');
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const logoutUser = async () => {
    dispatch(logout());
    await EncryptedStorage.removeItem('auth');
  };

  return {
    token,
    user,
    isAuthenticated,
    isAuthLoading: isLoginLoading || isUserLoading,
    authError: loginError || (isUserError ? 'Failed to fetch user data' : null),
    login,
    logout: logoutUser,
  };
};
