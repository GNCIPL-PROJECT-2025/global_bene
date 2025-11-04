import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { joinCommunity, leaveCommunity, updateCommunityMembers } from '@/redux/slice/community.slice';
import { savePost, unsavePost } from '@/redux/slice/post.slice';
import { updateUserStats, updateSavedPosts } from '@/redux/slice/auth.slice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, MessageCircle, Share, Bookmark, Plus, Check, X, Copy, Twitter, Facebook } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onUpvote, onDownvote, onComment }) => {
  const dispatch = useDispatch();
  const { loading: communityLoading } = useSelector(state => state.community);
  const { communities } = useSelector(state => state.community);
  const { user } = useSelector(state => state.auth);
  const {
    _id,
    title,
    content,
    author,
    community,
    upvotes = [],
    downvotes = [],
    commentsCount = 0,
    createdAt,
    type = 'text',
    media
  } = post;

  // Get community data from Redux state instead of post's embedded data
  const communityId = typeof community === 'string' ? community : community._id;
  const communityData = communities.find(c => c._id === communityId);
  
  // Fallback to embedded community data if global data not available
  const effectiveCommunityData = communityData || (typeof community === 'object' ? community : null);
  
  const isJoined = user && effectiveCommunityData?.members?.some(member => 
    (typeof member === 'string' ? member : member._id.toString()) === user._id.toString()
  );

  const isSaved = user && user.savedPosts?.some(savedPost => 
    typeof savedPost === 'string' ? savedPost === _id : savedPost._id === _id
  );

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  const handleJoinToggle = async () => {
    if (!communityId || !user || communityLoading) return;

    // Store the previous state for error recovery
    const previousState = isJoined;

    // Optimistically update UI
    const updatedMembers = previousState
      ? effectiveCommunityData.members.filter(member => 
          (typeof member === 'string' ? member : member._id) !== user._id
        )
      : [...(effectiveCommunityData.members || []), user._id];

    // Update local communities state optimistically
    const updatedCommunity = {
      ...effectiveCommunityData,
      members: updatedMembers,
      memberCount: updatedMembers.length
    };

    // Dispatch optimistic update
    dispatch(updateCommunityMembers({ communityId, members: updatedMembers }));

    try {
      if (previousState) {
        await dispatch(leaveCommunity(communityId)).unwrap();
        dispatch(updateUserStats({ communities: (user.stats?.communities || 0) - 1 }));
      } else {
        await dispatch(joinCommunity(communityId)).unwrap();
        dispatch(updateUserStats({ communities: (user.stats?.communities || 0) + 1 }));
      }
    } catch (error) {
      // Revert optimistic update
      dispatch(updateCommunityMembers({ communityId, members: effectiveCommunityData.members }));
      console.error('Failed to toggle community membership:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (!user || isLoadingSave) return;

    setIsLoadingSave(true);

    // Optimistically update the UI by dispatching the action
    const currentSavedState = isSaved;
    const updatedSavedPosts = currentSavedState
      ? user.savedPosts.filter(savedPost => 
          (typeof savedPost === 'string' ? savedPost : savedPost._id) !== _id
        )
      : [...(user.savedPosts || []), _id];

    // Optimistically update Redux state
    dispatch(updateSavedPosts(updatedSavedPosts));

    try {
      if (currentSavedState) {
        await dispatch(unsavePost(_id)).unwrap();
      } else {
        await dispatch(savePost(_id)).unwrap();
      }
    } catch (error) {
      // Revert on error
      dispatch(updateSavedPosts(user.savedPosts || []));
      console.error('Failed to toggle save status:', error);
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${_id}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: content,
        url: postUrl,
      });
    } else {
      setIsShareModalOpen(true);
    }
  };

  const copyToClipboard = async () => {
    const postUrl = `${window.location.origin}/post/${_id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      alert('Link copied to clipboard!');
      setIsShareModalOpen(false);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareToTwitter = () => {
    const postUrl = `${window.location.origin}/post/${_id}`;
    const text = `Check out this post: ${title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
    window.open(twitterUrl, '_blank');
    setIsShareModalOpen(false);
  };

  const shareToFacebook = () => {
    const postUrl = `${window.location.origin}/post/${_id}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(facebookUrl, '_blank');
    setIsShareModalOpen(false);
  };

  const score = upvotes.length - downvotes.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="mb-4"
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                <AvatarImage src={effectiveCommunityData?.avatar?.secure_url || community?.avatar?.secure_url} />
                <AvatarFallback>{(effectiveCommunityData?.name || community?.name || 'C')[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium hover:text-orange-600 cursor-pointer transition-colors">
                g/{effectiveCommunityData?.name || community?.name}
              </span>
              <span>•</span>
              <span>Posted by</span>
              <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                <AvatarImage src={author?.avatar?.secure_url} />
                <AvatarFallback>{author?.fullName?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hover:text-orange-600 cursor-pointer transition-colors truncate">
                u/{author?.fullName}
              </span>
              <span>•</span>
              <span className="truncate">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>

            {/* Modern Join Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinToggle}
              disabled={communityLoading}
              className={`
                flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 self-start sm:self-auto
                ${isJoined 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' 
                  : 'bg-muted text-muted-foreground border border-border hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                }
                ${communityLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isJoined ? (
                <>
                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Joined</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Join</span>
                </>
              )}
            </motion.button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {/* Post content */}
            <div className="flex-1">
              <Link to={`/post/${_id}`}>
                <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 cursor-pointer">
                  {title}
                </h3>
              </Link>

              {type === 'text' && (
                <p className="text-gray-700 mb-3 line-clamp-3">
                  {content}
                </p>
              )}

              {type === 'image' && media?.secure_url && (
                <img
                  src={media.secure_url}
                  alt={title}
                  className="max-w-full h-auto rounded-lg mb-3"
                />
              )}

              {type === 'video' && media?.secure_url && (
                <video
                  src={media.secure_url}
                  controls
                  className="max-w-full h-auto rounded-lg mb-3"
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {type === 'link' && content && (
                <a
                  href={media?.secure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline mb-3 block"
                >
                  {content}
                </a>
              )}

              {/* Action buttons - Modern horizontal layout */}
              <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
                {/* Vote buttons - Modern design */}
                <div className="flex items-center bg-muted rounded-full p-1 mr-1 sm:mr-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onUpvote(_id)}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full hover:bg-orange-100 transition-all duration-200 group"
                  >
                    <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-orange-500 transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                      {upvotes.length}
                    </span>
                  </motion.button>

                  <div className="w-px h-3 sm:h-4 bg-border mx-1" /> 

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDownvote(_id)}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full hover:bg-blue-100 transition-all duration-200 group"
                  >
                    <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {downvotes.length}
                    </span>
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onComment(_id)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">{commentsCount}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleShare}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
                >
                  <Share className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium hidden sm:inline">Share</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSaveToggle}
                  disabled={isLoadingSave}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground ${isSaved ? 'text-blue-600' : ''} ${isLoadingSave ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span className="font-medium hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Post</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Copy className="h-5 w-5 text-gray-600" />
                <span>Copy Link</span>
              </button>
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Twitter className="h-5 w-5 text-blue-500" />
                <span>Share on Twitter</span>
              </button>
              <button
                onClick={shareToFacebook}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span>Share on Facebook</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;