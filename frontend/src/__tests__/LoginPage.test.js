import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
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

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Create a wrapper component for testing
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form correctly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  test('shows error message on login failure', async () => {
    const mockError = {
      response: {
        data: { message: 'Invalid credentials' }
      }
    };

    mockedAxios.post.mockRejectedValueOnce(mockError);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
  });

  test('navigates to dashboard on successful login', async () => {
    const mockResponse = {
      data: {
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token'
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
  });

  test('shows loading state during login', async () => {
    const mockResponse = {
      data: {
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token'
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    // Check loading state
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/signing in/i);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('pre-fills email when redirected from registration', () => {
    // Mock URL search params
    delete window.location;
    window.location = {
      search: '?email=test@example.com&message=registration_success'
    };

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput.value).toBe('test@example.com');
  });
});
