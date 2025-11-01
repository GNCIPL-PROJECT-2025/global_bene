import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '@/Layouts/MainLayout';
import PostCard from '@/components/cards/PostCards';
import CommentCard from '@/components/cards/CommentCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from '@/components/common/Loader';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchPostById, upvotePost, downvotePost } from '@/redux/slice/post.slice';
import {
  fetchCommentsForPost,
  fetchRepliesForComment,
  createComment,
  upvoteComment,
  downvoteComment
} from '@/redux/slice/comment.slice';
import { getAllCommunities } from '@/redux/slice/community.slice';

const PostDetailPage = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { currentPost, loading: postLoading, error: postError } = useSelector(state => state.post);
  const { commentsByPost, repliesByComment, loading: commentLoading, error: commentError } = useSelector(state => state.comment);
  const { communities, loading: communitiesLoading } = useSelector(state => state.community);
  const { user } = useSelector(state => state.auth);

  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
      dispatch(fetchCommentsForPost({ postId }));
    }
  }, [dispatch, postId]);

  useEffect(() => {
    dispatch(getAllCommunities());
  }, [dispatch]);

  // Scroll to comment if hash is present in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#comment-')) {
      const commentId = hash.replace('#comment-', '');
      const element = document.getElementById(`comment-${commentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a highlight effect
        element.classList.add('bg-primary/5', 'ring-2', 'ring-primary/20');
        setTimeout(() => {
          element.classList.remove('bg-primary/5', 'ring-2', 'ring-primary/20');
        }, 3000);
      }
    }
  }, [commentsByPost[postId]?.comments]); // Re-run when comments load

  const handleUpvotePost = async (id) => {
    try {
      await dispatch(upvotePost(id));
    } catch (error) {
      console.error('Failed to upvote post:', error);
    }
  };

  const handleDownvotePost = async (id) => {
    try {
      await dispatch(downvotePost(id));
    } catch (error) {
      console.error('Failed to downvote post:', error);
    }
  };

  const handleCommentPost = () => {
    // Not used here
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    try {
      const result = await dispatch(createComment({ postId, content: newComment })).unwrap();
      setNewComment('');
      // Update the post's comment count locally
      if (currentPost) {
        currentPost.commentsCount = (currentPost.commentsCount || 0) + 1;
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleUpvoteComment = async (commentId) => {
    try {
      await dispatch(upvoteComment(commentId));
    } catch (error) {
      console.error('Failed to upvote comment:', error);
    }
  };

  const handleDownvoteComment = async (commentId) => {
    try {
      await dispatch(downvoteComment(commentId));
    } catch (error) {
      console.error('Failed to downvote comment:', error);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    try {
      const result = await dispatch(createComment({ postId, content, parentCommentId })).unwrap();
      // Update the post's comment count locally for replies too
      if (currentPost) {
        currentPost.commentsCount = (currentPost.commentsCount || 0) + 1;
      }
    } catch (error) {
      console.error('Failed to reply to comment:', error);
    }
  };

  const comments = commentsByPost[postId]?.comments || [];

  if (postLoading || communitiesLoading) {
    return (
      <MainLayout communities={communities || []}>
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  if (postError || !currentPost) {
    return (
      <MainLayout communities={communities || []}>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Post not found or failed to load.</p>
          <Button asChild>
            <Link to="/">Go back</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout communities={communities || []}>
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to posts
          </Link>
        </Button>

        {/* Post */}
        <PostCard
          post={currentPost}
          onUpvote={handleUpvotePost}
          onDownvote={handleDownvotePost}
          onComment={handleCommentPost}
        />

        {/* Comments section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Comments ({currentPost.commentsCount || 0})</h2>

          {/* New comment form */}
          <div className="border rounded-lg p-4 space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={handleCreateComment} disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {commentLoading && comments.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  onUpvote={handleUpvoteComment}
                  onDownvote={handleDownvoteComment}
                  onReply={handleReply}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>

          {commentError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              <p>Failed to load comments: {commentError}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PostDetailPage;