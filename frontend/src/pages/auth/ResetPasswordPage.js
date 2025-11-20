import React, { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Key,
  ArrowLeft,
  Loader2,
  Shield,
  Sparkles,
  Heart,
  Eye,
  EyeOff,
  CheckCircle,
  Lock,
  RefreshCw
} from 'lucide-react';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, forgotPassword } = useAuth();

  // Get email from URL params if available
  const email = searchParams.get('email') || '';

  // Cooldown timer for resend button
  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Resend password reset code
  const handleResendCode = async () => {
    if (!email) {
      setError('Email address not found. Please try the forgot password process again.');
      return;
    }

    if (resendCooldown > 0) {
      setError(`Please wait ${resendCooldown} seconds before resending.`);
      return;
    }

    setResendLoading(true);
    try {
      const result = await forgotPassword(email);

      if (result.success) {
        toast.success('Password reset code sent! Please check your email.');
        setResendCooldown(30); // 30 second cooldown
        setError(''); // Clear any existing errors

        // Redirect to home page after successful resend
        setTimeout(() => {
          navigate('/');
        }, 2000); // 2 second delay to show the success message
      } else {
        setError(result.error || 'Failed to resend reset code');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setError('Failed to resend reset code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single character

    // Only allow numerical input for OTP
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value; // Keep as is, numerical only
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    let pasteData = e.clipboardData.getData('text').slice(0, 6);
    // Filter to only digits
    pasteData = pasteData.replace(/\D/g, '');
    const newCode = [...code];

    for (let i = 0; i < pasteData.length; i++) {
      if (i < 6) {
        newCode[i] = pasteData[i];
      }
    }

    setCode(newCode);
    if (pasteData.length < 6) {
      inputRefs.current[pasteData.length]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('Please enter the complete 6-digit numerical verification code');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!email) {
      setError('Email address not found. Please try the forgot password process again.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email, codeString, formData.newPassword);

      if (result.success) {
        toast.success('Password reset successful! You can now login with your new password.');
        navigate('/auth/login', {
          state: {
            message: 'Password reset successful! Please login with your new password.',
            email: email
          }
        });
      } else {
        setError(result.error || 'Password reset failed. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - EcoZBite</title>
        <meta name="description" content="Reset your EcoZBite password with the verification code sent to your email." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-teal-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8 relative z-10"
        >
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 transition-colors mb-8 group">
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 5
              }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl relative">
                <Lock className="w-10 h-10 text-white" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-3"
            >
              Reset Your Password
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-600 text-lg"
            >
              Enter the code from your email and create a new password
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Verification Code */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="text"
                      maxLength="1"
                      className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-colors"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Enter the 6-digit numerical code from your email
                </p>

                {/* Resend Code Button */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading || resendCooldown > 0}
                    className="inline-flex items-center px-4 py-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Code
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* New Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-gray-50/50 backdrop-blur-sm"
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-gray-50/50 backdrop-blur-sm"
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Resetting Password...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    Reset Password
                  </div>
                )}
              </motion.button>
            </form>

            {/* Back to Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link to="/auth/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Sign In
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-center"
          >
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <span className="text-sm font-bold text-gray-700">Secure</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <span className="text-sm font-bold text-gray-700">Fast</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700">Trusted</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
