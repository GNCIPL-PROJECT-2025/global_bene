import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import CommunityCard from '@/components/cards/CommunityCard';
import CreateCommunityModal from '@/components/common/CreateCommunityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/common/Loader';
import { Search, Grid3X3, List, Plus, Filter, TrendingUp, Users, Calendar } from 'lucide-react';
import { getAllCommunities, joinCommunity, leaveCommunity } from '../../redux/slice/community.slice.js';

const categories = ['All', 'Technology', 'Gaming', 'Science', 'Art & Design', 'Health & Fitness', 'Food & Cooking', 'Travel'];

const ExploreCommunities = () => {
  const dispatch = useDispatch();
  const { communities, loading, error } = useSelector(state => state.community);
  const { user } = useSelector(state => state.auth);
  const [transformedCommunities, setTransformedCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [localJoinStates, setLocalJoinStates] = useState({}); // Track optimistic updates

  useEffect(() => {
    dispatch(getAllCommunities());
  }, [dispatch]);

  useEffect(() => {
    // Transform communities data for display
    const transformed = (communities || []).map(community => ({
      ...community,
      displayName: community.name.charAt(0).toUpperCase() + community.name.slice(1),
      category: 'General', // Since category not in model, set default
      postCount: 0, // Not in model, set to 0
      isJoined: localJoinStates[community._id] !== undefined 
        ? localJoinStates[community._id] 
        : (user && community?.members?.some(member => 
            typeof member === 'string' ? member === user._id : member._id === user._id
          )),
      moderators: community.moderators ? community.moderators.map(mod => mod.fullName) : []
    }));
    setTransformedCommunities(transformed);
  }, [communities, user, localJoinStates]);

  useEffect(() => {
    let filtered = transformedCommunities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(community => community.category === selectedCategory);
    }

    // Sort communities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.memberCount || 0) - (a.memberCount || 0);
        case 'new':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'alphabetical':
          return a.displayName.localeCompare(b.displayName);
        default:
          return 0;
      }
    });

    setFilteredCommunities(filtered);
  }, [transformedCommunities, searchTerm, selectedCategory, sortBy]);

  const handleJoinCommunity = async (communityId) => {
    if (!user) {
      console.log('Please login to join communities');
      return;
    }

    const currentState = localJoinStates[communityId] !== undefined 
      ? localJoinStates[communityId] 
      : transformedCommunities.find(c => c._id === communityId)?.isJoined || false;

    // Optimistic update
    setLocalJoinStates(prev => ({
      ...prev,
      [communityId]: !currentState
    }));

    try {
      if (currentState) {
        // Leaving community
        await dispatch(leaveCommunity(communityId)).unwrap();
        console.log('Left community successfully');
      } else {
        // Joining community
        await dispatch(joinCommunity(communityId)).unwrap();
        console.log('Joined community successfully');
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalJoinStates(prev => ({
        ...prev,
        [communityId]: currentState
      }));
      
      const errorMessage = error?.message || 'Failed to update community membership';
      console.error(errorMessage);
    }
  };

  const handleCreateCommunity = (newCommunity) => {
    // Community creation is handled by Redux in the modal
    console.log('Community created:', newCommunity);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <MainLayout communities={communities}>
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout communities={communities}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-linear-to-r from-primary to-primary/80 rounded-lg p-6 text-primary-foreground"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Explore Communities</h1>
              <p className="text-primary-foreground/80 mb-4">
                Discover communities that match your interests and connect with like-minded people.
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-lg p-6 shadow-sm border-border"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Popular
                  </div>
                </SelectItem>
                <SelectItem value="new">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    New
                  </div>
                </SelectItem>
                <SelectItem value="alphabetical">
                  <div className="flex items-center">
                    <List className="h-4 w-4 mr-2" />
                    Alphabetical
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredCommunities.length} communit{filteredCommunities.length !== 1 ? 'ies' : 'y'} found
          </p>
        </div>

        {/* Communities Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredCommunities.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredCommunities.map((community, index) => (
                <motion.div
                  key={community._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CommunityCard
                    community={community}
                    onJoin={handleJoinCommunity}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No communities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters, or create a new community.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Button>
            </div>
          )}
        </motion.div>

        {/* Create Community Modal */}
        <CreateCommunityModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCommunity}
        />
      </div>
    </MainLayout>
  );
};

export default ExploreCommunities;
