import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser, checkUserFollowStatus } from '@/redux/slice/user.slice';
import { UserPlus, UserMinus, Loader } from 'lucide-react';

const FollowButton = ({ userId, size = 'default', variant = 'default' }) => {
  const dispatch = useDispatch();
  const { followStatus, loading } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId && currentUser && userId !== currentUser._id) {
      // Check follow status
      const status = followStatus[userId];
      if (status !== undefined) {
        setIsFollowing(status);
      } else {
        // Fetch follow status if not in state
        dispatch(checkUserFollowStatus(userId))
          .unwrap()
          .then((response) => {
            setIsFollowing(response.isFollowing);
          })
          .catch((error) => {
            console.error('Failed to check follow status:', error);
          });
      }
    }
  }, [userId, currentUser, followStatus, dispatch]);

  const handleFollowToggle = async () => {
    if (!userId || !currentUser || userId === currentUser._id) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(userId)).unwrap();
        setIsFollowing(false);
      } else {
        await dispatch(followUser(userId)).unwrap();
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for current user
  if (!currentUser || userId === currentUser._id) {
    return null;
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading || loading}
      size={size}
      variant={isFollowing ? 'outline' : variant}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;