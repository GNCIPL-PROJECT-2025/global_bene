import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader } from '@/components/common/Loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Users, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { getAllCommunitiesForAdmin, adminDeleteCommunity } from '../../redux/slice/admin.slice';
import { formatDistanceToNow } from 'date-fns';

const CommunityManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { communities, loading, error } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllCommunitiesForAdmin({ page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  const filteredCommunities = communities.filter(community =>
    community.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.creator_id?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCommunity = (community) => {
    setSelectedCommunity(community);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCommunity) {
      dispatch(adminDeleteCommunity(selectedCommunity._id));
      setIsDeleteDialogOpen(false);
      setSelectedCommunity(null);
    }
  };

  const handleViewCommunity = (communityName) => {
    navigate(`/r/${communityName}`);
  };

  if (loading && communities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Community Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage all communities on the platform
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search communities by name, title, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Communities Table */}
          <Card>
            <CardHeader>
              <CardTitle>Communities ({filteredCommunities.length})</CardTitle>
              <CardDescription>
                All communities on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {filteredCommunities.map((community) => (
                  <motion.div
                    key={community._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={community.avatar} alt={community.name} />
                        <AvatarFallback>
                          {community.name?.charAt(0).toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {community.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          r/{community.name} • Created by {community.creator_id?.username} • {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {community.members_count || 0} members
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 relative z-50">
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {community.members_count || 0}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom">
                          <DropdownMenuItem onClick={() => handleViewCommunity(community.name)}>
                            View Community
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCommunity(community)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Community
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredCommunities.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm ? 'No communities found matching your search.' : 'No communities found.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Community</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{selectedCommunity?.title}"? This will also delete all posts in this community. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityManagement;