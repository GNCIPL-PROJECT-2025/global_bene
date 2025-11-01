import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/Layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/common/Loader';
import PostCard from '@/components/cards/PostCards';
import { fetchSavedPosts } from '@/redux/slice/post.slice';
import { getAllCommunities } from '@/redux/slice/community.slice';
import { Bookmark } from 'lucide-react';

const SavedPostsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { savedPosts, loading, error, savedPostsPagination } = useSelector(state => state.post);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { communities } = useSelector(state => state.community);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchSavedPosts({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage, isAuthenticated, navigate]);

  useEffect(() => {
    // Fetch communities for sidebar
    dispatch(getAllCommunities());
  }, [dispatch]);

  const handleLoadMore = () => {
    if (currentPage < savedPostsPagination.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleUpvote = (postId) => {
    // Handle upvote logic - you might want to dispatch an upvote action
    console.log('Upvote post:', postId);
  };

  const handleDownvote = (postId) => {
    // Handle downvote logic - you might want to dispatch a downvote action
    console.log('Downvote post:', postId);
  };

  const handleComment = (postId) => {
    // Handle comment logic - navigate to post detail page
    console.log('Comment on post:', postId);
  };

  if (loading && savedPosts.length === 0) {
    return (
      <MainLayout communities={communities || []}>
        <div className="flex items-center justify-center min-h-64">
          <Loader size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout communities={communities || []}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card border-b border-border rounded-lg">
          <div className="px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Saved Posts
                </h1>
                <p className="text-muted-foreground">
                  Your collection of saved posts
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {savedPosts.length === 0 && !loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No saved posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Posts you save will appear here for easy access later.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">
                    Browse Communities
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {savedPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PostCard
                    post={post}
                    onUpvote={handleUpvote}
                    onDownvote={handleDownvote}
                    onComment={handleComment}
                  />
                </motion.div>
              ))}

              {/* Load More Button */}
              {currentPage < savedPostsPagination.totalPages && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                    className="px-8"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center text-sm text-muted-foreground pt-4">
                Showing {savedPosts.length} of {savedPostsPagination.totalPosts} saved posts
              </div>
            </>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">Failed to load saved posts: {error}</p>
                <Button
                  onClick={() => dispatch(fetchSavedPosts({ page: 1, limit: 10 }))}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default SavedPostsPage;