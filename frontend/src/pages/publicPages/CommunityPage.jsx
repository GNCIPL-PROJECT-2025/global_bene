import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader } from '@/components/common/Loader';
import PostCard from '@/components/cards/PostCards';
import EditCommunityModal from '@/components/common/EditCommunityModal';
import ManageMembersModal from '@/components/common/ManageMembersModal';
import { getCommunityByName, joinCommunity, leaveCommunity } from '@/redux/slice/community.slice';
import { fetchPostsByCommunity } from '@/redux/slice/post.slice';
import {
  Users,
  Calendar,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  MessageSquare,
  FileText,
  MapPin,
  Globe,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Edit,
  Settings
} from 'lucide-react';

const CommunityPage = () => {
  const { communityName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentCommunity, loading, error } = useSelector((state) => state.community);
  const { communityPosts, communityPagination, loading: postsLoading } = useSelector((state) => state.post);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [updatedCommunity, setUpdatedCommunity] = useState(null);

  useEffect(() => {
    if (communityName) {
      dispatch(getCommunityByName(communityName));
    }
  }, [dispatch, communityName]);

  useEffect(() => {
    if (currentCommunity && currentCommunity._id) {
      dispatch(fetchPostsByCommunity({ 
        communityId: currentCommunity._id, 
        params: { limit: 10, page: currentPage } 
      }));
    }
  }, [dispatch, currentCommunity, currentPage]);

  useEffect(() => {
    if (currentCommunity && user) {
      setIsMember(currentCommunity.members.some(member => member._id === user._id));
      setIsCreator(currentCommunity.creator_id._id === user._id);
    }
  }, [currentCommunity, user]);

  const handleJoinCommunity = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await dispatch(joinCommunity(currentCommunity._id)).unwrap();
      setIsMember(true);
    } catch (error) {
      console.error('Failed to join community:', error);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await dispatch(leaveCommunity(currentCommunity._id)).unwrap();
      setIsMember(false);
    } catch (error) {
      console.error('Failed to leave community:', error);
    }
  };

  const handleMembersUpdate = (updatedCommunityData) => {
    setUpdatedCommunity(updatedCommunityData);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Use updatedCommunity for display if available, otherwise use currentCommunity
  const displayCommunity = updatedCommunity || currentCommunity;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-64">
          <Loader size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !displayCommunity) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-64">
          <Card className="shadow-lg border-0 max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold text-destructive mb-2">Community Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The community "{communityName}" doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/communities')}>
                Browse Communities
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Community Banner */}
        <div className="relative h-48 md:h-64 lg:h-80 rounded-lg overflow-hidden">
          {displayCommunity.banner?.secure_url ? (
            <img
              src={displayCommunity.banner.secure_url}
              alt={`${displayCommunity.title} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {displayCommunity.title}
                </h2>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <div className="flex items-end gap-4">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 border-4 border-white">
                <AvatarImage src={displayCommunity.avatar?.secure_url} alt={displayCommunity.title} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(displayCommunity.title)}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {displayCommunity.title}
                </h1>
                <p className="text-sm md:text-base opacity-90">
                  r/{displayCommunity.name} • {displayCommunity.members_count} members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  About Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {displayCommunity.description}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created {formatDate(displayCommunity.createdAt)}
                  </div>
                  {displayCommunity.is_private && (
                    <Badge variant="secondary">Private</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            {displayCommunity.rules && displayCommunity.rules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Community Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayCommunity.rules.map((rule, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{rule.title}</h4>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Posts</h2>
                {isAuthenticated && (
                  <Button onClick={() => navigate('/create-post')}>
                    Create Post
                  </Button>
                )}
              </div>
              
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader size="lg" />
                </div>
              ) : communityPosts && communityPosts.length > 0 ? (
                <div className="space-y-4">
                  {communityPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                    />
                  ))}
                  
                  {/* Load More Button */}
                  {communityPagination.currentPage < communityPagination.totalPages && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setCurrentPage(prev => prev + 1);
                        }}
                        disabled={postsLoading}
                      >
                        Load More Posts
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        This community doesn't have any posts yet. Be the first to create one!
                      </p>
                      {isAuthenticated && (
                        <Button onClick={() => navigate('/create-post')}>
                          Create First Post
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join/Leave Button */}
            <Card>
              <CardContent className="pt-6">
                {isAuthenticated ? (
                  isMember ? (
                    <Button
                      onClick={handleLeaveCommunity}
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Leave Community
                    </Button>
                  ) : (
                    <Button
                      onClick={handleJoinCommunity}
                      className="w-full"
                      disabled={loading}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Community
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Community
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Creator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Created By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={displayCommunity.creator_id.avatar?.secure_url} />
                    <AvatarFallback>
                      {getInitials(displayCommunity.creator_id.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{displayCommunity.creator_id.username || 'User'}</p>
                    <p className="text-sm text-muted-foreground">Community Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moderators */}
            {displayCommunity.moderators && displayCommunity.moderators.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Moderators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayCommunity.moderators.map((moderator) => (
                      <div key={moderator._id} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={moderator.avatar?.secure_url} />
                          <AvatarFallback className="text-xs">
                            {getInitials(moderator.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{moderator.username || 'User'}</p>
                          <p className="text-xs text-muted-foreground">Moderator</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Members</span>
                    <span className="text-sm font-medium">{displayCommunity.members_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Online</span>
                    <span className="text-sm font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">{formatDate(displayCommunity.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moderator Actions */}
            {isCreator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Community Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowEditModal(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Community
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowManageMembersModal(true)}>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Community Modal */}
      <EditCommunityModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        community={displayCommunity}
      />

      {/* Manage Members Modal */}
      <ManageMembersModal
        isOpen={showManageMembersModal}
        onClose={() => setShowManageMembersModal(false)}
        community={displayCommunity}
        isCreator={isCreator}
        onMembersUpdate={handleMembersUpdate}
      />
    </MainLayout>
  );
};

export default CommunityPage;