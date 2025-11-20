import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Test component to access auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, register } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register({ name: 'Test', email: 'test@example.com', password: 'password' })}>Register</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Clear all mocks
    jest.clearAllMocks();
  });

  test('renders with initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  test('login function calls API and updates state on success', async () => {
    const mockResponse = {
      data: {
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token'
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
    });

    // Check if localStorage was set
    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
  });

  test('login function handles error correctly', async () => {
    const mockError = {
      response: {
        data: { message: 'Invalid credentials' }
      }
    };

    mockedAxios.post.mockRejectedValueOnce(mockError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
    });

    // Check that localStorage was not set
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  test('register function calls API and handles success', async () => {
    const mockResponse = {
      data: { message: 'Registration successful' }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const registerButton = screen.getByText('Register');
    registerButton.click();

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/register', {
        name: 'Test',
        email: 'test@example.com',
        password: 'password'
      });
    });
  });
});
