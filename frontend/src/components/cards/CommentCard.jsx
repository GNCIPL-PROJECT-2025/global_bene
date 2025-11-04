import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  MoreHorizontal, 
  Heart,
  Share,
  Flag,
  Trash2,
  Edit3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchRepliesForComment } from '@/redux/slice/comment.slice';

const EMPTY_ARRAY = [];

const selectRepliesForComment = createSelector(
  [
    (state) => state.comment.repliesByComment,
    (state, commentId) => commentId
  ],
  (repliesByComment, commentId) => repliesByComment[commentId]?.replies || EMPTY_ARRAY
);

const selectLoadingRepliesForComment = createSelector(
  [
    (state) => state.comment.repliesByComment,
    (state, commentId) => commentId
  ],
  (repliesByComment, commentId) => repliesByComment[commentId]?.loading || false
);

const CommentCard = ({
  comment,
  onUpvote,
  onDownvote,
  onReply,
  depth = 0,
  maxDepth = 5
}) => {
  const dispatch = useDispatch();
  const {
    _id,
    content,
    author,
    upvotes = [],
    downvotes = [],
    repliesCount = 0,
    createdAt
  } = comment;

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [isLiked, setIsLiked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const actionsRef = React.useRef(null);

  const replies = useSelector(state => selectRepliesForComment(state, _id));
  const loadingReplies = useSelector(state => selectLoadingRepliesForComment(state, _id));
  const { user } = useSelector(state => state.auth);

  const score = upvotes.length - downvotes.length;
  const marginLeft = Math.min(depth * 20, 80); // Progressive indentation with max limit

  // Check if current user has liked this comment
  useEffect(() => {
    if (user && user._id) {
      setIsLiked(upvotes.includes(user._id));
    } else {
      setIsLiked(false);
    }
  }, [user, upvotes]);

  useEffect(() => {
    if (showReplies && replies.length === 0 && repliesCount > 0 && !loadingReplies) {
      dispatch(fetchRepliesForComment({ commentId: _id }));
    }
  }, [showReplies, replies.length, repliesCount, loadingReplies, dispatch, _id]);

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  const handleLike = async () => {
    if (!user) return;
    
    try {
      if (isLiked) {
        // Unlike: call downvote to remove the upvote
        await onDownvote(_id);
      } else {
        // Like: call upvote
        await onUpvote(_id);
      }
      // The useEffect will update isLiked based on the new upvotes array
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleShare = async () => {
    const postId = typeof comment.post === 'object' ? comment.post._id : comment.post;
    const shareUrl = `${window.location.origin}/post/${postId}#comment-${_id}`;
    
    // Create share data for Web Share API
    const shareData = {
      title: `Comment by ${author?.fullName || 'User'}`,
      text: `"${content.length > 100 ? content.substring(0, 100) + '...' : content}" - ${author?.fullName || 'User'}`,
      url: shareUrl
    };

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Optional: Show success feedback
        console.log('Comment shared successfully');
      } catch (error) {
        // User cancelled sharing or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fall back to clipboard
          await fallbackToClipboard(shareUrl);
        }
      }
    } else {
      // Fall back to clipboard for browsers that don't support Web Share API
      await fallbackToClipboard(shareUrl);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      await onReply(_id, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  const getDepthStyling = () => {
    if (depth === 0) return "bg-card border border-border/50";
    if (depth === 1) return "bg-muted/30 border-l-4 border-l-primary/40";
    return "bg-muted/20 border-l-2 border-l-muted-foreground/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: depth * 0.05,
        ease: [0.25, 0.25, 0, 1]
      }}
      id={`comment-${_id}`}
      style={{ marginLeft }}
      className={`group relative mb-2 ${depth > 0 ? 'ml-4' : ''}`}
    >
      <Card className={`comment-card ${getDepthStyling()} hover:shadow-md transition-all duration-300 overflow-hidden`}>
        <CardContent className="p-3">
          {/* Header with author info */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={author?.avatar?.secure_url} />
                  <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                    {author?.fullName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm truncate">
                    {author?.fullName}
                  </h4>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
                    @{author?.username || 'user'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* More options */}
            <div ref={actionsRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowActions(!showActions)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            </div>
          </div>

          {/* Comment content */}
          <div className="mb-2">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Voting and actions bar */}
          <div className="flex items-center justify-between">
            {/* Vote section */}
            <div className="flex items-center gap-1">
              <div className="flex items-center bg-muted/50 rounded-full p-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onUpvote(_id)}
                  className="comment-vote-button p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <ArrowUp className="h-3.5 w-3.5 text-muted-foreground group-hover:text-green-600 transition-colors" />
                </motion.button>
                
                <span className="px-2 py-0.5 text-xs font-medium min-w-6 text-center text-foreground">
                  {score}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDownvote(_id)}
                  className="comment-vote-button p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group"
                >
                  <ArrowDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-red-600 transition-colors" />
                </motion.button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <MessageCircle className="h-3 w-3" />
                  Reply
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                disabled={!user}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                  isLiked 
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Share className="h-3 w-3" />
                Share
              </motion.button>
            </div>
          </div>

          {/* Reply form */}
          {user && (
            <AnimatePresence>
              {showReplyForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.25, 0, 1] }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted/30 rounded-lg p-2 border border-border/50">
                    <Textarea
                      placeholder="Write a thoughtful reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="mb-2 min-h-16 resize-none border-none bg-background/50 focus:bg-background transition-colors text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowReplyForm(false)}
                        className="h-7 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleReply}
                        disabled={!replyContent.trim()}
                        className="bg-primary hover:bg-primary/90 h-7 px-3 text-xs"
                      >
                        Post Reply
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Replies section */}
          {repliesCount > 0 && (
            <div className="mt-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-2"
              >
                <motion.div
                  animate={{ rotate: showReplies ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle className="h-4 w-4" />
                </motion.div>
                {showReplies ? 'Hide' : 'Show'} {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
              </motion.button>

              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.25, 0, 1] }}
                    className="overflow-hidden space-y-2"
                  >
                    {loadingReplies ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                        <span className="ml-2 text-xs text-muted-foreground">Loading replies...</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {replies.map((reply, index) => (
                          <motion.div
                            key={reply._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CommentCard
                              comment={reply}
                              onUpvote={onUpvote}
                              onDownvote={onDownvote}
                              onReply={onReply}
                              depth={depth + 1}
                              maxDepth={maxDepth}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions dropdown */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute top-12 right-4 z-10 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]"
        >
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Flag className="h-3.5 w-3.5" />
            Report
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CommentCard;