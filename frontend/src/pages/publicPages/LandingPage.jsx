import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '@/Layouts/MainLayout';
import PostCard from '@/components/cards/PostCards';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/common/Loader';
import { Flame, Clock, TrendingUp, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPosts, upvotePost, downvotePost } from '@/redux/slice/post.slice';
import { getAllCommunities } from '@/redux/slice/community.slice';

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, loading: postsLoading, error: postsError, pagination } = useSelector(state => state.post);
  const { communities, loading: communitiesLoading } = useSelector(state => state.community);
  const [sortBy, setSortBy] = useState('hot');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fetch real posts from API
    const params = { 
      sortBy: sortBy === 'hot' ? 'createdAt' : sortBy,
      page: currentPage,
      limit: 10
    };
    dispatch(fetchPosts(params));
  }, [dispatch, sortBy, currentPage]);

  useEffect(() => {
    // Fetch communities
    dispatch(getAllCommunities());
  }, [dispatch]);

  const handleUpvote = async (postId) => {
    try {
      await dispatch(upvotePost(postId));
    } catch (error) {
      console.error('Failed to upvote post:', error);
    }
  };

  const handleDownvote = async (postId) => {
    try {
      await dispatch(downvotePost(postId));
    } catch (error) {
      console.error('Failed to downvote post:', error);
    }
  };

  const handleComment = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleJoinCommunity = (communityName, isJoining) => {
    // Handle join/leave community logic
    console.log(`${isJoining ? 'Joining' : 'Leaving'} community:`, communityName);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  if (postsLoading || communitiesLoading) {
    return (
      <MainLayout communities={communities || []}>
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout communities={communities || []}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-4 sm:p-6 text-primary-foreground"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to Global Bene</h1>
          <p className="text-sm sm:text-base text-primary-foreground/80 mb-4">
            Discover amazing communities, share your thoughts, and connect with people worldwide.
          </p>
          <Button asChild className="bg-white text-primary hover:bg-white/90 text-sm sm:text-base shadow-lg">
            <Link to="/communities">
              Explore Communities
            </Link>
          </Button>
        </motion.div>

        {/* Error Message */}
        {postsError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p>Failed to load posts: {postsError}</p>
            <Button 
              variant="outline" 
              onClick={() => dispatch(fetchPosts({ sortBy, page: currentPage, limit: 10 }))}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Sort Tabs */}
        <Tabs value={sortBy} onValueChange={handleSortChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hot" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Hot
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              New
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Top
            </TabsTrigger>
          </TabsList>

          <TabsContent value={sortBy} className="mt-6">
            <div className="space-y-4">
              {posts && posts.length > 0 ? posts.filter(post => post && post._id).map((post, index) => (
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
                    onJoinCommunity={handleJoinCommunity}
                  />
                </motion.div>
              )) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No posts found.</p>
                  <Button asChild>
                    <Link to="/create-post">Create the first post</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({pagination.totalPosts} posts)
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default LandingPage;