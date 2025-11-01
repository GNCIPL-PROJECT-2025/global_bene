import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/common/Loader';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import { sendOtp } from '@/api/auth.api';

const RequestOtp = () => {
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    setContact('');
    setErrors({});
  };

  const handleChange = (e) => {
    setContact(e.target.value);
    if (errors.contact) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!contact.trim()) {
      newErrors.contact = method === 'email' ? 'Email is required' : 'Phone number is required';
    } else if (method === 'email' && !/\S+@\S+\.\S+/.test(contact)) {
      newErrors.contact = 'Please enter a valid email';
    } else if (method === 'phone' && !/^[1-9]\d{9}$/.test(contact.replace(/\s+/g, ''))) {
      newErrors.contact = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real app, make API call to request OTP
      console.log('OTP requested for:', { method, contact });

      // Navigate to verify OTP page with the contact info
      navigate('/verify-otp', {
        state: {
          method,
          contact: contact.trim(),
          purpose: 'verification' // or 'reset-password' based on context
        }
      });
    } catch (error) {
      setErrors({ general: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

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
              <span className="text-white font-bold text-xl">G</span>
            </motion.div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Verify your account</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Choose how you'd like to receive your verification code
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Method Selection */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleMethodChange('email')}
                  className={`p-4 border rounded-lg transition-all ${
                    method === 'email'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Mail className={`h-5 w-5 mx-auto mb-2 ${method === 'email' ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`} />
                  <div className={`text-sm font-medium ${method === 'email' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Email
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleMethodChange('phone')}
                  className={`p-4 border rounded-lg transition-all ${
                    method === 'phone'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Phone className={`h-5 w-5 mx-auto mb-2 ${method === 'phone' ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`} />
                  <div className={`text-sm font-medium ${method === 'phone' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Phone
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  {method === 'email' ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  )}
                  <Input
                    id="contact"
                    name="contact"
                    type={method === 'email' ? 'email' : 'tel'}
                    placeholder={method === 'email' ? 'Enter your email' : 'Enter your phone number'}
                    value={contact}
                    onChange={handleChange}
                    className={`pl-10 h-11 ${errors.contact ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-orange-500'}`}
                  />
                </div>
                {errors.contact && (
                  <p className="text-sm text-red-500">{errors.contact}</p>
                )}
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
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
                    Sending code...
                  </div>
                ) : (
                  'Send verification code'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-orange-600 hover:text-orange-700 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RequestOtp;