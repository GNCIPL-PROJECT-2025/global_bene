import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '@/Layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { createPost, clearPostError } from '../../redux/slice/post.slice';
import { getAllCommunities } from '../../api/community.api';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { loading, error } = useSelector(state => state.post);

  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [postType, setPostType] = useState('text');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch communities on component mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await getAllCommunities();
        setCommunities(response.communities || response || []);
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      } finally {
        setCommunitiesLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPostError());
    };
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 300) {
      newErrors.title = 'Title must be less than 300 characters';
    }

    if (postType === 'text' && !content.trim()) {
      newErrors.content = 'Post content is required';
    } else if (postType === 'text' && content.length > 40000) {
      newErrors.content = 'Post content must be less than 40,000 characters';
    }

    if (postType === 'link' && !url.trim()) {
      newErrors.url = 'URL is required';
    } else if (postType === 'link' && url.trim()) {
      try {
        new URL(url);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    if (postType === 'image' && !imageFile) {
      newErrors.image = 'Please select an image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (file) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (selectedCommunity && selectedCommunity !== 'none') {
        formData.append('communityId', selectedCommunity);
      }
      formData.append('type', postType);

      // Add content based on post type
      if (postType === 'text') {
        formData.append('body', content.trim());
      } else if (postType === 'link') {
        formData.append('url', url.trim());
      } else if (postType === 'image' && imageFile) {
        formData.append('media', imageFile);
      }

      await dispatch(createPost(formData)).unwrap();

      // Redirect to home or community page
      navigate('/');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <MainLayout communities={communities}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create a Post</h1>
            <p className="text-muted-foreground">Share your thoughts with the community</p>
          </div>
        </motion.div>

        {/* Post Creation Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Community Selection */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Choose a community (optional)</Label>
                <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                  <SelectTrigger className={errors.community ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a community (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No community (general post)</SelectItem>
                    {communitiesLoading ? (
                      <div className="p-2 text-sm text-muted-foreground">Loading communities...</div>
                    ) : communities.length > 0 ? (
                      communities.map(community => (
                        <SelectItem key={community._id} value={community._id}>
                          g/{community.title}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No communities available</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.community && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.community}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  You can post to a specific community or create a general post visible to all users.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Post Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={postType} onValueChange={setPostType} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Link
                  </TabsTrigger>
                </TabsList>

                {/* Title - Common to all post types */}
                <div className="mt-6 space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Give your post a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
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
                      {title.length}/300
                    </span>
                  </div>
                </div>

                {/* Text Post Content */}
                <TabsContent value="text" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-semibold">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="What's on your mind? Share your thoughts..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={`min-h-32 ${errors.content ? 'border-red-500' : ''}`}
                      maxLength={40000}
                    />
                    <div className="flex justify-between items-center">
                      {errors.content && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.content}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {content.length}/40,000
                      </span>
                    </div>
                  </div>
                </TabsContent>

                {/* Image Post Content */}
                <TabsContent value="image" className="mt-4">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Upload Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <div className="relative max-w-md mx-auto">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-auto rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            Image uploaded successfully
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0])}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload">
                            <div className="cursor-pointer">
                              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground mb-2">
                                Click to upload an image
                              </p>
                              <Button type="button" variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Choose File
                              </Button>
                            </div>
                          </label>
                          {errors.image && (
                            <div className="flex items-center justify-center gap-1 text-red-500 text-sm mt-2">
                              <AlertCircle className="h-4 w-4" />
                              {errors.image}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, GIF. Max size: 10MB
                    </p>
                  </div>
                </TabsContent>

                {/* Link Post Content */}
                <TabsContent value="link" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-semibold">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className={errors.url ? 'border-red-500' : ''}
                    />
                    {errors.url && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.url}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {title && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar?.secure_url} />
                      <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span className="font-medium">u/{user?.username}</span>
                        {selectedCommunity && selectedCommunity !== 'none' && (
                          <>
                            <span>in</span>
                            <Badge variant="secondary" className="text-xs">
                              g/{communities.find(c => c._id === selectedCommunity)?.title || selectedCommunity}
                            </Badge>
                          </>
                        )}
                        {(!selectedCommunity || selectedCommunity === 'none') && (
                          <Badge variant="outline" className="text-xs">
                            General Post
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{title}</h3>

                      {postType === 'text' && content && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
                      )}

                      {postType === 'image' && imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Post preview"
                            className="max-w-md h-auto rounded-lg"
                          />
                        </div>
                      )}

                      {postType === 'link' && url && (
                        <div className="mt-2 p-3 bg-card rounded border">
                          <Link className="text-blue-600 hover:underline text-sm break-all">
                            {url}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </MainLayout>
  );
};

export default CreatePostPage;