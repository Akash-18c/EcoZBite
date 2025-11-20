import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);



  // Load user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (state.token && !state.user) {
          await loadUser();
        } else if (!state.token) {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, [state.token, state.user]);

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });

      const response = await axiosInstance.post('/auth/register', userData);

      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });

      toast.success('Registration successful! Please check your email for verification code.');

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';

      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    }
  };

  // Verify email function
  const verifyEmail = async (email, code) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await axiosInstance.post('/auth/verify-email', { email, code });

      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      toast.success('Email verified successfully! Welcome to EcoZBite! 🎉');

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    }
  };

  // Resend verification code
  const resendVerificationCode = async (email) => {
    try {
      await axiosInstance.post('/auth/resend-otp', { email });
      toast.success('Verification code sent! Please check your email.');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification code';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await axiosInstance.post('/auth/login', { email, password });

      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      toast.success(`Welcome back, ${user.name}! 👋`);

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });

      if (error.response?.data?.needsVerification) {
        return {
          success: false,
          error: errorMessage,
          needsVerification: true,
          email: error.response.data.email
        };
      }

      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
      toast.success('Password reset code sent to your email!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset code';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password function
  const resetPassword = async (email, code, newPassword) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        email: email.toLowerCase(),
        code: code, // Keep as is for numerical codes
        newPassword
      });

      toast.success('Password reset successful! You can now login with your new password.');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Load user function
  const loadUser = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });

      const response = await axiosInstance.get('/auth/me');

      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: response.data
      });

      return { success: true, data: response.data };
    } catch (error) {
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }

      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: error.response?.data?.message || 'Failed to load user'
      });

      return { success: false, error: error.response?.data?.message };
    }
  };

  // Logout function
  const logout = () => {
    // Clear all localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear any cached data
    sessionStorage.clear();
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
    toast.success('Logged out successfully!');
    
    // Immediate redirect without loading
    window.location.replace('/');
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    register,
    verifyEmail,
    resendVerificationCode,
    login,
    logout,
    forgotPassword,
    resetPassword,
    loadUser,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};