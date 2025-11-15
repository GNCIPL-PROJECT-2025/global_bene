import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { joinCommunity, leaveCommunity, updateCommunityMembers } from '@/redux/slice/community.slice';
import { savePost, unsavePost } from '@/redux/slice/post.slice';
import { updateUserStats, updateSavedPosts } from '@/redux/slice/auth.slice';
import { followUser, unfollowUser } from '@/redux/slice/user.slice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, MessageCircle, Share, Bookmark, Plus, Check, X, Copy, Twitter, Facebook, UserPlus, Edit3, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onUpvote, onDownvote, onComment }) => {
  const dispatch = useDispatch();
  const { loading: communityLoading } = useSelector(state => state.community);
  const { communities } = useSelector(state => state.community);
  const { user } = useSelector(state => state.auth);
  const {
    _id,
    title,
    body,
    author,
    community_id: community,
    upvotes = [],
    downvotes = [],
    num_comments = 0,
    createdAt,
    type = 'text',
    media,
    url,
    score = 0
  } = post;

  // Get community data from Redux state instead of post's embedded data
  const communityId = typeof community === 'string' ? community : community?._id;
  const communityData = communityId ? communities.find(c => c._id === communityId) : null;

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
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editBody, setEditBody] = useState(body);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if current user is following the post author
  useEffect(() => {
    if (user && author && user._id !== author._id) {
      setIsFollowingAuthor(user.following?.includes(author._id) || false);
    } else {
      setIsFollowingAuthor(false);
    }
  }, [user, author]);

  // Check user's vote status
  useEffect(() => {
    if (user && user._id) {
      const userId = user._id;
      if (upvotes.some(upvote => (typeof upvote === 'string' ? upvote : upvote._id || upvote) === userId)) {
        setUserVote('up');
      } else if (downvotes.some(downvote => (typeof downvote === 'string' ? downvote : downvote._id || downvote) === userId)) {
        setUserVote('down');
      } else {
        setUserVote(null);
      }
    } else {
      setUserVote(null);
    }
  }, [user, upvotes, downvotes]);

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
      members_count: updatedMembers.length
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
        text: type === 'link' ? url : body,
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

  const handleFollowToggle = async () => {
    if (!user || !author || user._id === author._id || isLoadingFollow) return;

    setIsLoadingFollow(true);
    try {
      if (isFollowingAuthor) {
        await dispatch(unfollowUser(author._id)).unwrap();
        setIsFollowingAuthor(false);
      } else {
        await dispatch(followUser(author._id)).unwrap();
        setIsFollowingAuthor(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow status:', error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleEditPost = async () => {
    if (!user || author._id !== user._id) return;

    try {
      await dispatch(updatePost({ postId: _id, updateData: { title: editTitle, body: editBody } })).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit post:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!user || author._id !== user._id) return;

    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true);
      try {
        await dispatch(deletePost(_id)).unwrap();
        // Post will be removed from the list by the slice
      } catch (error) {
        console.error('Failed to delete post:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

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
              {effectiveCommunityData ? (
                <>
                  <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                    <AvatarImage src={effectiveCommunityData?.avatar?.secure_url || community?.avatar?.secure_url} />
                    <AvatarFallback>{(effectiveCommunityData?.name || community?.title || 'C')[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Link
                    to={`/r/${effectiveCommunityData?.title || community?.title}`}
                    className="font-medium hover:text-orange-600 cursor-pointer transition-colors"
                  >
                    g/{effectiveCommunityData?.title || community?.title}
                  </Link>
                  <span>•</span>
                </>
              ) : (
                <Badge variant="outline" className="text-xs mr-1">
                  General
                </Badge>
              )}
              <span>Posted by</span>
              <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                <AvatarImage src={author?.avatar?.secure_url} />
                <AvatarFallback>{author?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <Link
                to={`/u/${author?.username}`}
                className="hover:text-orange-600 cursor-pointer transition-colors truncate"
              >
                u/{author?.username}
              </Link>
              <span>•</span>
              <span className="truncate">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>

            {/* Modern Join Button - Only show if there's a community */}
            {effectiveCommunityData && (
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
            )}
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
                  {body}
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

              {type === 'link' && url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline mb-3 block"
                >
                  {url}
                </a>
              )}

              {/* Edit Form */}
              {isEditing && user && author && user._id === author._id && (
                <div className="mb-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Post title"
                    />
                    {type === 'text' && (
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Post content"
                      />
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleEditPost}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons - Modern horizontal layout */}
              <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
                {/* Vote buttons - Modern design */}
                <div className="flex items-center bg-muted rounded-full p-1 mr-1 sm:mr-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onUpvote(_id)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full transition-all duration-200 group ${
                      userVote === 'up'
                        ? 'bg-orange-100 text-orange-600'
                        : 'hover:bg-orange-100'
                    }`}
                  >
                    <ArrowUp className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${
                      userVote === 'up'
                        ? 'text-orange-600'
                        : 'text-gray-500 group-hover:text-orange-500'
                    }`} />
                  </motion.button>

                  <span className="px-2 py-1 text-xs sm:text-sm font-medium min-w-6 text-center text-foreground">
                    {score}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDownvote(_id)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full transition-all duration-200 group ${
                      userVote === 'down'
                        ? 'bg-blue-100 text-blue-600'
                        : 'hover:bg-blue-100'
                    }`}
                  >
                    <ArrowDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${
                      userVote === 'down'
                        ? 'text-blue-600'
                        : 'text-gray-500 group-hover:text-blue-500'
                    }`} />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onComment(_id)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">{num_comments}</span>
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

                {/* Follow Author Button - Only show if not the current user */}
                {user && author && user._id !== author._id && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleFollowToggle}
                    disabled={isLoadingFollow}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground ${isFollowingAuthor ? 'text-blue-600' : ''} ${isLoadingFollow ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <UserPlus className={`h-3 w-3 sm:h-4 sm:w-4 ${isFollowingAuthor ? 'fill-current' : ''}`} />
                    <span className="font-medium hidden sm:inline">{isFollowingAuthor ? 'Following' : 'Follow'}</span>
                  </motion.button>
                )}

                {/* Edit/Delete buttons - Only show for post author */}
                {user && author && user._id === author._id && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium hidden sm:inline">Edit</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-muted-foreground ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </motion.button>
                  </>
                )}
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