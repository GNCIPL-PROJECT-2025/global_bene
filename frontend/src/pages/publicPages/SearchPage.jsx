import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { performSearch, clearSearchResults, setSearchType } from '@/redux/slice/search.slice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, FileText, Building, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostCard from '@/components/cards/PostCards';

const SearchPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { results, loading, error, query, type } = useSelector(state => state.search);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(type || 'all');

  useEffect(() => {
    const q = searchParams.get('q');
    const t = searchParams.get('type') || 'all';

    if (q && q.trim()) {
      setSearchQuery(q);
      dispatch(performSearch({ q, type: t }));
    } else {
      dispatch(clearSearchResults());
    }
  }, [searchParams, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (activeTab !== 'all') {
        params.set('type', activeTab);
      }
      setSearchParams(params);
    }
  };

  const handleTabChange = (newType) => {
    setActiveTab(newType);
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (newType !== 'all') {
        params.set('type', newType);
      }
      setSearchParams(params);
    }
  };

  const renderUserCard = (user) => (
    <motion.div
      key={user._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar?.secure_url} />
          <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{user.username}</h3>
            <Badge variant="secondary" className="text-xs">
              u/{user.username}
            </Badge>
          </div>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{user.num_followers || 0} followers</span>
            <span>{user.num_following || 0} following</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/u/${user.username}`)}
        >
          View Profile
        </Button>
      </div>
    </motion.div>
  );

  const renderCommunityCard = (community) => (
    <motion.div
      key={community._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/r/${community.name}`)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={community.avatar?.secure_url} />
          <AvatarFallback>{community.title?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{community.title}</h3>
            <Badge variant="secondary" className="text-xs">
              g/{community.name}
            </Badge>
          </div>
          {community.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {community.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{community.members_count || 0} members</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Search</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search communities, posts, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </form>

          {/* Search Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="communities" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Communities
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            {/* Search Results */}
            <div className="mt-6">
              {query && (
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    Search results for "{query}"
                    {type !== 'all' && ` in ${type}`}
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Searching...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => dispatch(clearSearchResults())}>
                    Try Again
                  </Button>
                </div>
              )}

              {!loading && !error && (
                <>
                  {/* All Results Tab */}
                  <TabsContent value="all" className="space-y-6">
                    {results.posts.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Posts ({results.posts.length})
                        </h2>
                        <div className="space-y-4">
                          {results.posts.slice(0, 5).map((post) => (
                            <PostCard key={post._id} post={post} />
                          ))}
                        </div>
                        {results.posts.length > 5 && (
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleTabChange('posts')}
                          >
                            View all {results.posts.length} posts
                          </Button>
                        )}
                      </div>
                    )}

                    {results.communities.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Communities ({results.communities.length})
                        </h2>
                        <div className="space-y-3">
                          {results.communities.slice(0, 5).map(renderCommunityCard)}
                        </div>
                        {results.communities.length > 5 && (
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleTabChange('communities')}
                          >
                            View all {results.communities.length} communities
                          </Button>
                        )}
                      </div>
                    )}

                    {results.users.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Users ({results.users.length})
                        </h2>
                        <div className="space-y-3">
                          {results.users.slice(0, 5).map(renderUserCard)}
                        </div>
                        {results.users.length > 5 && (
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleTabChange('users')}
                          >
                            View all {results.users.length} users
                          </Button>
                        )}
                      </div>
                    )}

                    {results.posts.length === 0 && results.communities.length === 0 && results.users.length === 0 && query && (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No results found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search terms or check for typos.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Posts Tab */}
                  <TabsContent value="posts" className="space-y-4">
                    {results.posts.length > 0 ? (
                      results.posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                        <p className="text-muted-foreground">
                          No posts match your search criteria.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Communities Tab */}
                  <TabsContent value="communities" className="space-y-3">
                    {results.communities.length > 0 ? (
                      results.communities.map(renderCommunityCard)
                    ) : (
                      <div className="text-center py-12">
                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No communities found</h3>
                        <p className="text-muted-foreground">
                          No communities match your search criteria.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Users Tab */}
                  <TabsContent value="users" className="space-y-3">
                    {results.users.length > 0 ? (
                      results.users.map(renderUserCard)
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No users found</h3>
                        <p className="text-muted-foreground">
                          No users match your search criteria.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;