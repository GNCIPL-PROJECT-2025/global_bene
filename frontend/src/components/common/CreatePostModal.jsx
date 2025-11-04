import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, Image as ImageIcon, Link, Type, AlertCircle, CheckCircle } from 'lucide-react';
import { createPost, clearPostError } from '../../redux/slice/post.slice';
import { getAllCommunities } from '../../api/community.api';

const postTypes = [
  { value: 'text', label: 'Text Post', icon: Type },
  { value: 'link', label: 'Link Post', icon: Link },
  { value: 'image', label: 'Image Post', icon: ImageIcon },
];

const CreatePostModal = ({ isOpen, onClose, communityId = null }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.post);
  const { user } = useSelector(state => state.auth);

  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    communityId: communityId || '',
    type: 'text',
    media: null
  });

  const [errors, setErrors] = useState({});
  const [mediaPreview, setMediaPreview] = useState(null);
  const [linkPreview, setLinkPreview] = useState('');

  // Fetch communities when modal opens
  useEffect(() => {
    const fetchCommunities = async () => {
      if (isOpen) {
        setCommunitiesLoading(true);
        try {
          const response = await getAllCommunities();
          setCommunities(response.communities || response || []);
        } catch (error) {
          console.error('Failed to fetch communities:', error);
        } finally {
          setCommunitiesLoading(false);
        }
      }
    };

    fetchCommunities();
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 300) {
      newErrors.title = 'Title must be less than 300 characters';
    }

    if (!formData.content.trim()) {
      if (formData.type === 'text') {
        newErrors.content = 'Content is required for text posts';
      } else if (formData.type === 'link') {
        newErrors.content = 'URL is required for link posts';
      }
    }

    if (formData.type === 'link' && formData.content.trim()) {
      try {
        new URL(formData.content);
      } catch {
        newErrors.content = 'Please enter a valid URL';
      }
    }

    if (!formData.communityId) {
      newErrors.communityId = 'Please select a community';
    }

    if (formData.type === 'image' && !formData.media) {
      newErrors.media = 'Please select an image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Handle type change
    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value,
        content: '',
        media: null
      }));
      setMediaPreview(null);
      setLinkPreview('');
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      setFormData(prev => ({ ...prev, media: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      if (errors.media) {
        setErrors(prev => ({ ...prev, media: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        communityId: formData.communityId,
        type: formData.type
      };

      // Handle media upload for image posts
      if (formData.type === 'image' && formData.media) {
        // For now, we'll assume media upload is handled separately
        // In a real app, you'd upload the image first and get the URL
        postData.media = {
          public_id: 'temp_id', // This would come from cloudinary upload
          secure_url: mediaPreview
        };
      }

      await dispatch(createPost(postData)).unwrap();

      // Reset form and close modal
      onClose();
    } catch (error) {
      // Error is handled by the slice
      console.error('Failed to create post:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
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
                <h2 className="text-2xl font-bold">Create a Post</h2>
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
                {/* Post Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Post Type</Label>
                  <div className="flex gap-2">
                    {postTypes.map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={formData.type === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('type', value)}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Community Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Community *</Label>
                  <Select
                    value={formData.communityId}
                    onValueChange={(value) => handleInputChange('communityId', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className={errors.communityId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communitiesLoading ? (
                        <div className="p-2 text-sm text-muted-foreground">Loading communities...</div>
                      ) : communities.length > 0 ? (
                        communities.map(community => (
                          <SelectItem key={community._id} value={community._id}>
                            g/{community.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">No communities available</div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.communityId && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.communityId}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter your post title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                    disabled={loading}
                    maxLength={300}
                  />
                  <div className="flex justify-between items-center">
                    {errors.title && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.title}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formData.title.length}/300
                    </span>
                  </div>
                </div>

                {/* Content based on type */}
                {formData.type === 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-semibold">
                      Content *
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Write your post content..."
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      className={`min-h-32 ${errors.content ? 'border-red-500' : ''}`}
                      disabled={loading}
                    />
                    {errors.content && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.content}
                      </div>
                    )}
                  </div>
                )}

                {formData.type === 'link' && (
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-semibold">
                      URL *
                    </Label>
                    <Input
                      id="content"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      className={errors.content ? 'border-red-500' : ''}
                      disabled={loading}
                    />
                    {errors.content && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.content}
                      </div>
                    )}
                  </div>
                )}

                {formData.type === 'image' && (
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Image *</Label>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                          {mediaPreview ? (
                            <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                            className="hidden"
                            id="image-upload"
                            disabled={loading}
                          />
                          <label htmlFor="image-upload">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                      {errors.media && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.media}
                        </div>
                      )}
                    </div>

                    {/* Optional Caption */}
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-sm font-semibold">
                        Caption (optional)
                      </Label>
                      <Textarea
                        id="content"
                        placeholder="Add a caption to your image..."
                        value={formData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        className="min-h-20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Post
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

export default CreatePostModal;