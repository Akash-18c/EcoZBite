import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  RefreshCw,
  Sparkles,
  Heart
} from 'lucide-react';
import Logo from '../../components/Logo';

import { useAuth } from '../../context/AuthContext';

const EmailVerificationPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { verifyEmail, resendVerificationCode } = useAuth();
  const email = location.state?.email;


  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle individual code input changes
  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value.replace(/\D/g, ''); // Only allow numbers
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace to move to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
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
    const codeString = code.join('');
    if (codeString.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyEmail(email, codeString);

      if (result.success) {
        setIsSuccess(true);
        toast.success('Email verified successfully! Redirecting...');

        // Add delay for success animation
        setTimeout(() => {
          const redirectPath = result.data?.redirectTo || '/dashboard';
          navigate(redirectPath);
        }, 2000);
      } else {
        toast.error(result.error || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email address not found. Please try registering again.');
      return;
    }

    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before resending.`);
      return;
    }

    setResendLoading(true);
    try {
      const result = await resendVerificationCode(email);

      if (result.success) {
        toast.success('Verification code sent! Please check your email.');
        setResendCooldown(30);
      } else {
        toast.error(result.error || 'Failed to resend verification code');
      }
    } catch (error) {
      toast.error('Failed to resend verification code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verify Email - EcoZBite</title>
        <meta name="description" content="Verify your email address to complete your EcoZBite account registration." />
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
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="text-center">
                <Link to="/" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 transition-colors mb-8 group">
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Link>

                <div className="flex justify-center mb-6">
                  <Logo size="large" showText={true} />
                </div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-3"
                >
                  Verify Your Email
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-gray-600 text-lg"
                >
                  We've sent a 6-digit code to{' '}
                  <span className="font-semibold text-emerald-600">{email}</span>
                </motion.p>
              </div>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Code Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="space-y-4"
                  >
                    <label className="block text-sm font-semibold text-gray-700 text-center">
                      Enter Verification Code
                    </label>
                    <div className="flex justify-center space-x-3">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-colors"
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 text-center flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Code expires in 10 minutes
                    </p>
                  </motion.div>

                  {/* Verify Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    type="submit"
                    disabled={loading || code.some((d) => d === '')}
                    className="group relative w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Verify Email
                      </div>
                    )}
                  </motion.button>
                </form>

                {/* Resend Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mt-8 pt-6 border-t border-gray-200"
                >
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      Didn't receive the code?
                    </p>
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

                {/* Back to Registration */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mt-6 text-center"
                >
                  <button
                    type="button"
                    onClick={() => navigate('/auth/register')}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Registration
                  </button>
                </motion.div>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
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
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-3"
              >
                Email Verified!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-gray-600 mb-6"
              >
                Welcome to EcoZBite! Redirecting you to login...
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="animate-pulse"
              >
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default EmailVerificationPage;