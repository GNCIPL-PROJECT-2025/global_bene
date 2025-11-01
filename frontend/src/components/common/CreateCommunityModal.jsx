import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { createCommunity, clearError } from '@/redux/slice/community.slice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

const categories = [
  'Technology',
  'Gaming',
  'Science',
  'Art & Design',
  'Health & Fitness',
  'Food & Cooking',
  'Travel',
  'Sports',
  'Music',
  'Movies & TV',
  'Books',
  'Politics',
  'Business',
  'Education',
  'Other'
];

const CreateCommunityModal = ({ isOpen, onClose, onCreate }) => {
  const dispatch = useDispatch();
  const { createLoading, createError } = useSelector(state => state.community);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: '',
    isPrivate: false,
    allowImages: true,
    allowVideos: true
  });

  const [errors, setErrors] = useState({});
  const [bannerPreview, setBannerPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      newErrors.name = 'Community name can only contain letters, numbers, and underscores';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    } else if (formData.name.length > 21) {
      newErrors.name = 'Community name must be less than 21 characters';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.length > 100) {
      newErrors.displayName = 'Display name must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (type, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'banner') {
          setBannerPreview(e.target.result);
        } else {
          setAvatarPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clear any previous errors
    dispatch(clearError());

    // Prepare community data as FormData to include files
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);

    // Add avatar file if selected
    if (avatarPreview && document.getElementById('avatar-upload').files[0]) {
      formDataToSend.append('avatar', document.getElementById('avatar-upload').files[0]);
    }

    // Add banner file if selected
    if (bannerPreview && document.getElementById('banner-upload').files[0]) {
      formDataToSend.append('banner', document.getElementById('banner-upload').files[0]);
    }

    try {
      const resultAction = await dispatch(createCommunity(formDataToSend));
      if (createCommunity.fulfilled.match(resultAction)) {
        // Success - call onCreate callback if provided and close modal
        if (onCreate) {
          onCreate(resultAction.payload);
        }
        handleClose();
      }
    } catch (error) {
      // Error is handled by Redux
      console.error('Failed to create community:', error);
    }
  };

  const handleClose = () => {
    if (!createLoading) {
      onClose();
      // Reset form when closing
      setFormData({
        name: '',
        displayName: '',
        description: '',
        category: '',
        isPrivate: false,
        allowImages: true,
        allowVideos: true
      });
      setBannerPreview(null);
      setAvatarPreview(null);
      setErrors({});
      // Clear Redux errors
      dispatch(clearError());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold">Create a Community</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={createLoading}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              {/* Community Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Community Name *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    r/
                  </span>
                  <Input
                    id="name"
                    placeholder="your-community-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-8 ${errors.name ? 'border-red-500' : ''}`}
                    disabled={createLoading}
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Community names cannot be changed later. Use only letters, numbers, and underscores.
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-semibold">
                  Display Name *
                </Label>
                <Input
                  id="displayName"
                  placeholder="Your Community Display Name"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={errors.displayName ? 'border-red-500' : ''}
                  disabled={createLoading}
                />
                {errors.displayName && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.displayName}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell people what your community is about..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`min-h-20 ${errors.description ? 'border-red-500' : ''}`}
                  disabled={createLoading}
                />
                <div className="flex justify-between items-center">
                  {errors.description && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.description}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formData.description.length}/500
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={createLoading}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.category}
                  </div>
                )}
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Community Images</Label>

                {/* Avatar */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Avatar (optional)</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('avatar', e.target.files[0])}
                        className="hidden"
                        id="avatar-upload"
                        disabled={createLoading}
                      />
                      <label htmlFor="avatar-upload">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Avatar
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Banner */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Banner (optional)</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('banner', e.target.files[0])}
                        className="hidden"
                        id="banner-upload"
                        disabled={createLoading}
                      />
                      <label htmlFor="banner-upload">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Banner
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Settings */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Community Settings</Label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Private Community</Label>
                      <p className="text-xs text-muted-foreground">
                        Only approved users can join and view posts
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                      className="rounded"
                      disabled={createLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Allow Images</Label>
                      <p className="text-xs text-muted-foreground">
                        Members can post images in this community
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.allowImages}
                      onChange={(e) => handleInputChange('allowImages', e.target.checked)}
                      className="rounded"
                      disabled={createLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Allow Videos</Label>
                      <p className="text-xs text-muted-foreground">
                        Members can post videos in this community
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.allowVideos}
                      onChange={(e) => handleInputChange('allowVideos', e.target.checked)}
                      className="rounded"
                      disabled={createLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                {createError && (
                  <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {createError}
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={createLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {createLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Community
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateCommunityModal;
