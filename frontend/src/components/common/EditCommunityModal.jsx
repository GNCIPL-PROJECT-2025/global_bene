import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { updateCommunity, clearError } from '@/redux/slice/community.slice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

const EditCommunityModal = ({ isOpen, onClose, community }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.community);

  const [formData, setFormData] = useState({
    description: '',
    isPrivate: false,
    rules: []
  });

  const [errors, setErrors] = useState({});
  const [bannerPreview, setBannerPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [currentRule, setCurrentRule] = useState({ title: '', description: '' });

  useEffect(() => {
    if (community) {
      setFormData({
        description: community.description || '',
        isPrivate: community.is_private || false,
        rules: community.rules || []
      });
      setBannerPreview(community.banner?.secure_url || null);
      setAvatarPreview(community.avatar?.secure_url || null);
    }
  }, [community]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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

  const handleAddRule = () => {
    if (currentRule.title.trim() && currentRule.description.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, { ...currentRule }]
      }));
      setCurrentRule({ title: '', description: '' });
    }
  };

  const handleRemoveRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clear any previous errors
    dispatch(clearError());

    const updateData = {
      description: formData.description,
      rules: formData.rules,
      is_private: formData.isPrivate
    };

    // Add avatar file if selected
    if (avatarPreview && document.getElementById('avatar-upload').files[0]) {
      updateData.avatar = document.getElementById('avatar-upload').files[0];
    }

    // Add banner file if selected
    if (bannerPreview && document.getElementById('banner-upload').files[0]) {
      updateData.banner = document.getElementById('banner-upload').files[0];
    }

    try {
      const resultAction = await dispatch(updateCommunity({
        communityId: community._id,
        updateData
      }));
      if (updateCommunity.fulfilled.match(resultAction)) {
        handleClose();
      }
    } catch (error) {
      // Error is handled by Redux
      console.error('Failed to update community:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form when closing
      setFormData({
        description: '',
        isPrivate: false,
        rules: []
      });
      setBannerPreview(null);
      setAvatarPreview(null);
      setErrors({});
      setCurrentRule({ title: '', description: '' });
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
                <h2 className="text-2xl font-bold">Edit Community</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={loading}
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
                    disabled={loading}
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

                {/* Community Rules */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Community Rules</Label>

                  {/* Add Rule Form */}
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="rule-title" className="text-xs text-muted-foreground">Rule Title</Label>
                      <Input
                        id="rule-title"
                        placeholder="e.g., Be Respectful"
                        value={currentRule.title}
                        onChange={(e) => setCurrentRule(prev => ({ ...prev, title: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-description" className="text-xs text-muted-foreground">Rule Description</Label>
                      <Textarea
                        id="rule-description"
                        placeholder="Explain what this rule means and why it's important..."
                        value={currentRule.description}
                        onChange={(e) => setCurrentRule(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-16"
                        disabled={loading}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRule}
                      disabled={!currentRule.title.trim() || !currentRule.description.trim() || loading}
                    >
                      Add Rule
                    </Button>
                  </div>

                  {/* Rules List */}
                  {formData.rules.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Current Rules:</Label>
                      {formData.rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                          <div className="shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{rule.title}</h4>
                            <p className="text-xs text-muted-foreground">{rule.description}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRule(index)}
                            disabled={loading}
                            className="shrink-0 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
                        disabled={loading}
                      />
                    </div>
                  </div>
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
                          disabled={loading}
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
                          disabled={loading}
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

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  {error && (
                    <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Update Community
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

export default EditCommunityModal;