import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/common/Loader';
import { Mail, Phone, ArrowLeft, RotateCcw } from 'lucide-react';
import { verifyOtp } from '@/api/auth.api';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { method, contact, purpose } = location.state || {};

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear errors when user types
    if (errors.otp) {
      setErrors({});
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('').slice(0, 6);

    const newOtp = [...otp];
    pasteArray.forEach((digit, index) => {
      if (index < 6 && /^\d$/.test(digit)) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextIndex = pasteArray.length < 6 ? pasteArray.length : 5;
    inputRefs.current[nextIndex]?.focus();
  };

  const validateForm = () => {
    const otpString = otp.join('');
    const newErrors = {};

    if (otpString.length !== 6) {
      newErrors.otp = 'Please enter the complete 6-digit code';
    } else if (!/^\d{6}$/.test(otpString)) {
      newErrors.otp = 'Please enter only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const otpString = otp.join('');
      await verifyOtp({ email: contact, otp: otpString });

      // On success, redirect based on purpose
      if (purpose === 'reset-password') {
        navigate('/reset-password', { state: { token: 'verified-token' } });
      } else {
        navigate('/');
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Invalid verification code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);

    try {
      // Make API call to resend OTP
      await sendOtp({ email: contact });
      setResendTimer(30);
      setErrors({});
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Failed to resend code. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  if (!method || !contact) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Invalid access. Please request a new verification code.</p>
              <Link
                to="/request-otp"
                className="text-orange-600 hover:text-orange-700 transition-colors"
              >
                Request new code
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4"
            >
              {method === 'email' ? (
                <Mail className="h-6 w-6 text-white" />
              ) : (
                <Phone className="h-6 w-6 text-white" />
              )}
            </motion.div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Enter verification code</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              We sent a 6-digit code to {method === 'email' ? 'your email' : 'your phone'}
              <br />
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {method === 'email' ? contact : `+91 ${contact}`}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.otp
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-orange-500'
                    }`}
                  />
                ))}
              </div>

              {errors.otp && (
                <p className="text-sm text-red-500 text-center">{errors.otp}</p>
              )}

              {errors.general && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.general}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader size="sm" />
                    Verifying...
                  </div>
                ) : (
                  'Verify code'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Didn't receive the code? </span>
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0 || resendLoading}
                  className={`text-sm font-medium transition-colors ${
                    resendTimer > 0 || resendLoading
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'text-orange-600 hover:text-orange-700 cursor-pointer'
                  }`}
                >
                  {resendLoading ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader size="sm" />
                      Sending...
                    </span>
                  ) : resendTimer > 0 ? (
                    `Resend in ${resendTimer}s`
                  ) : (
                    'Resend code'
                  )}
                </button>
              </div>

              <Link
                to="/request-otp"
                className="text-sm text-orange-600 hover:text-orange-700 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Try different {method === 'email' ? 'phone' : 'email'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;