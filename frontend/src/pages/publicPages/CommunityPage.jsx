import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '@/Layouts/MainLayout';
import PostCard from '@/components/cards/PostCards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/common/Loader';
import {
  Users,
  Calendar,
  Crown,
  MessageSquare,
  Settings,
  Plus,
  UserPlus,
  UserMinus
} from 'lucide-react';
import {
  getCommunityById,
  joinCommunity,
  leaveCommunity
} from '../../redux/slice/community.slice';
import {
  fetchPosts,
  upvotePost,
  downvotePost
} from '../../redux/slice/post.slice';
import CommunityManagementModal from '../../components/common/CommunityManagementModal';

const CommunityPage = () => {
  const { communityName } = useParams();
  const dispatch = useDispatch();
  const { currentCommunity, loading, error } = useSelector(state => state.community);
  const { posts, loading: postsLoading } = useSelector(state => state.post);
  const { user } = useSelector(state => state.auth);

  const [isJoined, setIsJoined] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

  useEffect(() => {
    // Fetch community by name (backend supports both ID and name)
    if (communityName) {
      dispatch(getCommunityById(communityName));
    }
  }, [dispatch, communityName]);

  useEffect(() => {
    // Fetch posts when community is loaded
    if (currentCommunity?._id) {
      dispatch(fetchPosts({ communityId: currentCommunity._id, limit: 20 }));
    }
  }, [dispatch, currentCommunity?._id]);

  useEffect(() => {
    // Update local posts state when posts change
    setCommunityPosts(posts);
  }, [posts]);

  useEffect(() => {
    if (currentCommunity && user) {
      const joined = currentCommunity.members?.some(member =>
        typeof member === 'string' ? member === user._id : member._id === user._id
      );
      setIsJoined(joined);
    }
  }, [currentCommunity, user]);

  const handleJoinLeave = async () => {
    if (!user) {
      console.log('Please login to join communities');
      return;
    }

    if (!currentCommunity) return;

    setLocalLoading(true);
    try {
      if (isJoined) {
        await dispatch(leaveCommunity(currentCommunity._id)).unwrap();
        setIsJoined(false);
      } else {
        await dispatch(joinCommunity(currentCommunity._id)).unwrap();
        setIsJoined(true);
      }
    } catch (error) {
      console.error('Failed to update community membership:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleUpvote = (postId) => {
    dispatch(upvotePost(postId));
  };

  const handleDownvote = (postId) => {
    dispatch(downvotePost(postId));
  };

  const handleComment = (postId) => {
    // Navigate to post detail page
    window.location.href = `/post/${postId}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  if (error || !currentCommunity) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Community Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The community you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/communities">
            <Button>Browse Communities</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const isModerator = currentCommunity.moderators?.some(mod =>
    typeof mod === 'string' ? mod === user?._id : mod._id === user?._id
  );
  const isCreator = currentCommunity.creator_id?._id === user?._id;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Community Header */}
        <div className="relative">
          {/* Banner */}
          {currentCommunity.banner?.secure_url && (
            <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500 relative overflow-hidden rounded-lg">
              <img
                src={currentCommunity.banner.secure_url}
                alt={`${currentCommunity.title} banner`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          )}

          {/* Community Info */}
          <div className="relative -mt-16 px-6">
            <Card className="bg-card/95 backdrop-blur-sm border-border">
              <CardContent className="pt-20 pb-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={currentCommunity.avatar?.secure_url} />
                    <AvatarFallback className="text-2xl font-bold">
                      {currentCommunity.title?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">
                          g/{currentCommunity.title}
                        </h1>
                        <p className="text-muted-foreground mb-4 max-w-2xl">
                          {currentCommunity.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{formatMemberCount(currentCommunity.members_count)} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Created {formatDate(currentCommunity.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleJoinLeave}
                          disabled={localLoading}
                          variant={isJoined ? "outline" : "default"}
                          className={
                            isJoined
                              ? "border-green-500 text-green-600 hover:bg-green-50"
                              : "bg-orange-500 hover:bg-orange-600"
                          }
                        >
                          {localLoading ? (
                            <Loader />
                          ) : isJoined ? (
                            <>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Leave
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Join
                            </>
                          )}
                        </Button>

                        {(isModerator || isCreator) && (
                           <Button
                             variant="outline"
                             onClick={() => setIsManagementModalOpen(true)}
                           >
                             <Settings className="h-4 w-4 mr-2" />
                             Manage
                           </Button>
                         )}
                      </div>
                    </div>

                    {/* Moderators */}
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mr-2">Moderators:</span>
                      <div className="flex gap-1">
                        {currentCommunity.moderators?.slice(0, 3).map((mod, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {typeof mod === 'string' ? mod : mod.username}
                          </Badge>
                        ))}
                        {currentCommunity.moderators?.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{currentCommunity.moderators.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Content */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              {isJoined && (
                <Link to="/create-post">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </Link>
              )}
            </div>

            {/* Posts */}
            {postsLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : communityPosts.length > 0 ? (
              <div className="space-y-4">
                {communityPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onUpvote={handleUpvote}
                    onDownvote={handleDownvote}
                    onComment={handleComment}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share something in this community!
                  </p>
                  {isJoined && (
                    <Link to="/create-post">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Post
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{currentCommunity.description}</p>
                </div>

                {currentCommunity.rules && currentCommunity.rules.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Rules</h4>
                    <div className="space-y-2">
                      {currentCommunity.rules.map((rule, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <h5 className="font-medium">{rule.title}</h5>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold">{formatMemberCount(currentCommunity.members_count)}</div>
                    <div className="text-sm text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatDate(currentCommunity.createdAt)}</div>
                    <div className="text-sm text-muted-foreground">Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Members ({currentCommunity.members_count})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentCommunity.members?.slice(0, 10).map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar?.secure_url} />
                        <AvatarFallback>
                          {typeof member === 'string' ? member[0]?.toUpperCase() : member.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {typeof member === 'string' ? 'User' : member.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {typeof member === 'string' ? 'Member' : 'Member'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {currentCommunity.members_count > 10 && (
                    <p className="text-center text-muted-foreground py-4">
                      And {currentCommunity.members_count - 10} more members...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Community Management Modal */}
        <CommunityManagementModal
          isOpen={isManagementModalOpen}
          onClose={() => setIsManagementModalOpen(false)}
          community={currentCommunity}
        />
      </div>
    </MainLayout>
  );
};

export default CommunityPage;