import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader } from '@/components/common/Loader';
import { Badge } from '@/components/ui/badge';
import { changeUserPassword } from '@/redux/slice/user.slice';
import {
  User,
  Mail,
  Phone,
  Globe,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';

const ProfileSettings = ({ user, onUpdate, onAvatarUpdate }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone?.toString() || '',
    gender: user?.gender || '',
    bio: user?.bio || '',
    social_links: {
      youtube: user?.social_links?.youtube || '',
      instagram: user?.social_links?.instagram || '',
      linkedin: user?.social_links?.linkedin || '',
      twitter: user?.social_links?.twitter || '',
      github: user?.social_links?.github || '',
      website: user?.social_links?.website || ''
    }
  });

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone?.toString() || '',
      gender: user?.gender || '',
      bio: user?.bio || '',
      social_links: {
        youtube: user?.social_links?.youtube || '',
        instagram: user?.social_links?.instagram || '',
        linkedin: user?.social_links?.linkedin || '',
        twitter: user?.social_links?.twitter || '',
        github: user?.social_links?.github || '',
        website: user?.social_links?.website || ''
      }
    });
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number starting with 6-9';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot be more than 500 characters';
    }

    // Validate social links
    Object.entries(formData.social_links).forEach(([platform, url]) => {
      if (url && url.trim()) {
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== 'https:') {
            newErrors[`social_${platform}`] = `${platform} link must start with https://`;
          }
          if (platform !== 'website' && !parsed.hostname.includes(`${platform}.com`)) {
            newErrors[`social_${platform}`] = `${platform} link must be a valid ${platform}.com domain`;
          }
        } catch (e) {
          newErrors[`social_${platform}`] = `Please enter a valid ${platform} URL`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await handleUpdate();
  };

  const handleUpdate = async () => {
    if (!validateProfileForm()) return;

    setLoading(true);
    setSuccess('');
    setErrors({});

    try {
      // Convert phone to number before sending
      const dataToSend = {
        ...formData,
        phone: parseInt(formData.phone.replace(/\D/g, ''), 10) // Extract only digits and convert to number
      };
      console.log('Sending profile update:', dataToSend);
      await onUpdate(dataToSend);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ general: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    setSuccess('');
    setErrors({});

    try {
      await dispatch(changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setErrors({ general: error.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ avatar: 'Please select a valid image file' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: 'Image size must be less than 5MB' });
      return;
    }

    setAvatarLoading(true);
    setErrors({});

    try {
      await onAvatarUpdate(file);
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setErrors({ avatar: error.message || 'Failed to update avatar' });
    } finally {
      setAvatarLoading(false);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSocialIcon = (platform) => {
    const icons = {
      youtube: Youtube,
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
      github: Github,
      website: Globe
    };
    return icons[platform] || Globe;
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-sm text-green-800">{success}</p>
        </motion.div>
      )}

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.avatar?.secure_url} alt={user?.username} />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {getInitials(user?.username || '')}
                </AvatarFallback>
              </Avatar>
              {avatarLoading && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <Loader size="sm" className="text-white" />
                    {/* <span className="text-white text-xs mt-1">Uploading...</span> */}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="mb-2"
              >
                {avatarLoading ? (
                  <>
                    {/* <Loader size="sm" className="mr-2" />
                    Uploading... */}
                    <Camera className="w-4 h-4 mr-2" />
                    Change Avatar
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Change Avatar
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-600">
                JPG, PNG or GIF. Max size 5MB.
              </p>
              {errors.avatar && (
                <p className="text-sm text-red-500 mt-1">{errors.avatar}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['male', 'female', 'other'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => handleInputChange('gender', gender)}
                      className={`p-2 text-sm border rounded-md capitalize transition-colors cursor-pointer ${
                        formData.gender === gender
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={`min-h-[100px] ${errors.bio ? 'border-red-500' : ''}`}
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{errors.bio && <span className="text-red-500">{errors.bio}</span>}</span>
                <span>{formData.bio.length}/500</span>
              </div>
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.social_links).map(([platform, url]) => {
              const Icon = getSocialIcon(platform);
              return (
                <div key={platform} className="space-y-2">
                  <Label htmlFor={platform} className="flex items-center gap-2 capitalize">
                    <Icon className="w-4 h-4" />
                    {platform}
                  </Label>
                  <Input
                    id={platform}
                    type="url"
                    placeholder={`https://${platform}.com/yourusername`}
                    value={url}
                    onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                    className={errors[`social_${platform}`] ? 'border-red-500' : ''}
                  />
                  {errors[`social_${platform}`] && (
                    <p className="text-sm text-red-500">{errors[`social_${platform}`]}</p>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            type="button"
            onClick={handleUpdate}
            className="bg-orange-500 hover:bg-orange-600 mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size="sm" className="mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Social Links
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className={`pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={`pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="outline"
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;