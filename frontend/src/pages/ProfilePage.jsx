import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/Layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader } from '@/components/common/Loader';
import ProfileSettings from '@/components/ProfileSettings';
import PostCard from '@/components/cards/PostCards';
import CommentCard from '@/components/cards/CommentCard';
import { fetchUserProfile, updateProfile, updateAvatar, followUser, unfollowUser, fetchUserFollowers, fetchUserFollowing } from '@/redux/slice/user.slice';
import { getUserPosts } from '@/api/post.api';
import { getUserComments } from '@/api/comment.api';
import { getUserProfileByUsername } from '@/api/user.api';
import { getAllCommunities } from '@/redux/slice/community.slice';
import {
  User,
  Settings,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Edit,
  Shield,
  Clock,
  UserPlus,
  UserMinus,
  Users
} from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();
  const { username } = useParams();
  const dispatch = useDispatch();

  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.user);
  const { communities } = useSelector((state) => state.community);

  const isOwnProfile = !username || username === currentUser?.username;

  // Mock communities data for sidebar
  const mockCommunities = [
    { _id: '1', name: 'technology', members_count: 1250, avatar: { secure_url: '' } },
    { _id: '2', name: 'photography', members_count: 890, avatar: { secure_url: '' } },
    { _id: '3', name: 'gaming', members_count: 2100, avatar: { secure_url: '' } },
    { _id: '4', name: 'science', members_count: 750, avatar: { secure_url: '' } },
    { _id: '5', name: 'art', members_count: 620, avatar: { secure_url: '' } }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      setProfileLoading(true);
      try {
        if (isOwnProfile) {
          // Fetch own profile
          const response = await dispatch(fetchUserProfile()).unwrap();
          setProfileUser(response.user || response);
        } else {
          // Fetch other user's profile
          const response = await getUserProfileByUsername(username);
          setProfileUser(response.user || response);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch, isAuthenticated, username, isOwnProfile]);

  useEffect(() => {
    // Fetch communities for sidebar
    dispatch(getAllCommunities());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === 'posts' && profileUser && userPosts.length === 0) {
      fetchUserPosts();
    } else if (activeTab === 'comments' && profileUser && userComments.length === 0) {
      fetchUserComments();
    }
  }, [activeTab, profileUser]);

  // Check if current user is following this profile user
  useEffect(() => {
    if (currentUser && currentUser._id && profileUser && profileUser._id && isAuthenticated && !isOwnProfile) {
      setIsFollowing(currentUser.following?.includes(profileUser._id) || false);
    } else {
      setIsFollowing(false); // Not following own profile or not authenticated
    }
  }, [currentUser, profileUser, isAuthenticated, isOwnProfile]);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSocialIcon = (platform) => {
    const icons = {
      youtube: Youtube,
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
      github: Github,
      website: Globe
    };
    return icons[platform] || Globe;
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      console.log('ProfilePage: Updating profile with data:', updatedData);
      const result = await dispatch(updateProfile(updatedData)).unwrap();
      console.log('ProfilePage: Profile update result:', result);
      
      // Manually refetch user profile to ensure we have the latest data with stats
      await dispatch(fetchUserProfile());
      
    } catch (error) {
      console.error('ProfilePage: Failed to update profile:', error);
      // Handle error (could show toast notification)
    }
  };

  const handleAvatarUpdate = async (avatarFile) => {
    try {
      setAvatarUploading(true);
      await dispatch(updateAvatar(avatarFile)).unwrap();
      
      // Manually refetch user profile to ensure we have the latest data with stats
      await dispatch(fetchUserProfile());
      
    } catch (error) {
      console.error('Failed to update avatar:', error);
      // Handle error (could show toast notification)
    } finally {
      setAvatarUploading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!profileUser?._id) return;

    try {
      setPostsLoading(true);
      const response = await getUserPosts(profileUser._id, { limit: 10 });
      setUserPosts(response.posts || []);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchUserComments = async () => {
    if (!profileUser?._id) return;

    try {
      setCommentsLoading(true);
      const response = await getUserComments(profileUser._id, { limit: 10 });
      setUserComments(response.comments || []);
    } catch (error) {
      console.error('Failed to fetch user comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileUser || !isAuthenticated || followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(profileUser._id)).unwrap();
        setIsFollowing(false);
      } else {
        await dispatch(followUser(profileUser._id)).unwrap();
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow status:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if ((loading || profileLoading) && !avatarUploading) {
    return (
      <MainLayout communities={communities || mockCommunities}>
        <div className="flex items-center justify-center min-h-64">
          <Loader size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout communities={communities || mockCommunities}>
        <div className="flex items-center justify-center min-h-64">
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Please log in to view profiles</p>
                <Button onClick={() => navigate('/login')}>Log In</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!profileUser) {
    return (
      <MainLayout communities={communities || mockCommunities}>
        <div className="flex items-center justify-center min-h-64">
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">User not found</p>
                <Button onClick={() => navigate('/')}>Go Home</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout communities={communities || mockCommunities}>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-card border-b border-border rounded-lg">
          <div className="px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row items-start md:items-center gap-6"
            >
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={profileUser.avatar?.secure_url} alt={profileUser.username} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {profileUser.username}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {profileUser.username}
                    </h1>
                    <p className="text-muted-foreground">@{profileUser.username.toLowerCase().replace(' ', '')}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {profileUser.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {profileUser.role}
                    </Badge>
                    {/* Follow Button - Only show if not viewing own profile */}
                    {!isOwnProfile && (
                      <Button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        className={isFollowing ? "border-blue-500 text-blue-600" : ""}
                      >
                        {followLoading ? (
                          <Loader size="sm" />
                        ) : isFollowing ? (
                          <>
                            <UserMinus className="w-3 h-3 mr-1" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(profileUser.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profileUser.gender}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{profileUser.stats?.posts || 0}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{profileUser.num_followers || 0}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{profileUser.num_following || 0}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{profileUser.stats?.communities || 0}</div>
                    <div className="text-sm text-muted-foreground">Communities</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-8 ${isOwnProfile ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Followers
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Following
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profileUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">+91 {profileUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{profileUser.gender}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(profileUser.social_links).map(([platform, url]) => {
                      if (!url) return null;
                      const Icon = getSocialIcon(platform);
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{platform}</span>
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Bio Section */}
                  {profileUser.bio && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Bio</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{profileUser.bio}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${profileUser.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm">
                        {profileUser.isVerified ? 'Verified Account' : 'Unverified Account'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Member since {formatDate(profileUser.createdAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onUpvote={() => {}}
                    onDownvote={() => {}}
                    onComment={() => {}}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Your posts will appear here once you start sharing content.</p>
                    <Button className="bg-primary hover:bg-primary/90">
                      Create Your First Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : userComments.length > 0 ? (
              <div className="space-y-4">
                {userComments.map((comment) => (
                  <CommentCard
                    key={comment._id}
                    comment={comment}
                    onUpvote={() => {}}
                    onDownvote={() => {}}
                    onReply={() => {}}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No comments yet</h3>
                    <p className="text-muted-foreground mb-4">Your comments will appear here once you start engaging with posts.</p>
                    <Button variant="outline">
                      Browse Communities
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Followers ({profileUser.num_followers || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {profileUser.num_followers > 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Followers list will be displayed here</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No followers yet</h3>
                    <p className="text-muted-foreground">When people follow {isOwnProfile ? 'you' : 'this user'}, they'll appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Following ({profileUser.num_following || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {profileUser.num_following > 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Following list will be displayed here</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Not following anyone yet</h3>
                    <p className="text-muted-foreground">When {isOwnProfile ? 'you follow' : 'this user follows'} people, they'll appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="settings" className="space-y-6">
              <ProfileSettings
                user={profileUser}
                onUpdate={handleProfileUpdate}
                onAvatarUpdate={handleAvatarUpdate}
              />
            </TabsContent>
          )}
        </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;