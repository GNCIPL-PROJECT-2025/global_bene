import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '@/Layouts/MainLayout';
import PostCard from '@/components/cards/PostCards';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/common/Loader';
import { Flame, Clock, TrendingUp, Star } from 'lucide-react';
import { fetchPosts, upvotePost, downvotePost } from '@/redux/slice/post.slice';
import { getAllCommunities } from '@/redux/slice/community.slice';

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, loading: postsLoading, error: postsError } = useSelector(state => state.post);
  const { communities, loading: communitiesLoading } = useSelector(state => state.community);
  const [sortBy, setSortBy] = useState('hot');

  useEffect(() => {
    // Fetch real posts from API
    const params = {
      sortBy: sortBy === 'hot' ? 'createdAt' : sortBy,
      page: 1,
      limit: 100
    };
    dispatch(fetchPosts(params));
  }, [dispatch, sortBy]);

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
              onClick={() => dispatch(fetchPosts({ sortBy, page: 1, limit: 100 }))}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Sort Tabs */}
        <Tabs value={sortBy} onValueChange={setSortBy} className="w-full">
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
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default LandingPage;