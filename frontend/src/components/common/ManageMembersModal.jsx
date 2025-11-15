import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Search, 
  Trash2, 
  Crown, 
  Shield, 
  Star,
  AlertCircle,
  Loader
} from 'lucide-react';
import { 
  removeMemberFromCommunity, 
  promoteToModerator, 
  demoteFromModerator 
} from '@/api/community.api';

const ManageMembersModal = ({ 
  isOpen, 
  onClose, 
  community, 
  isCreator,
  onMembersUpdate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!community?.members) return [];
    
    return community.members.filter(member => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        member.username?.toLowerCase().includes(searchTerm) ||
        member.email?.toLowerCase().includes(searchTerm)
      );
    });
  }, [community?.members, searchQuery]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isModerator = (memberId) => {
    return community?.moderators?.some(mod => mod._id === memberId);
  };

  const isCreatorMember = (memberId) => {
    return community?.creator_id?._id === memberId;
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the community?')) {
      return;
    }

    setActionInProgress(memberId);
    setError('');
    setSuccessMessage('');

    try {
      const updatedCommunity = await removeMemberFromCommunity(community._id, memberId);
      setSuccessMessage('Member removed successfully!');
      
      // Call the callback to update parent component
      if (onMembersUpdate) {
        onMembersUpdate(updatedCommunity);
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMsg = err?.message || 'Failed to remove member';
      setError(errorMsg);
      console.error('Error removing member:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePromoteToModerator = async (memberId) => {
    if (!window.confirm('Promote this member to moderator?')) {
      return;
    }

    setActionInProgress(`promote-${memberId}`);
    setError('');
    setSuccessMessage('');

    try {
      const updatedCommunity = await promoteToModerator(community._id, memberId);
      setSuccessMessage('Member promoted to moderator successfully!');
      
      if (onMembersUpdate) {
        onMembersUpdate(updatedCommunity);
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMsg = err?.message || 'Failed to promote member';
      setError(errorMsg);
      console.error('Error promoting member:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDemoteFromModerator = async (memberId) => {
    if (!window.confirm('Demote this moderator to member?')) {
      return;
    }

    setActionInProgress(`demote-${memberId}`);
    setError('');
    setSuccessMessage('');

    try {
      const updatedCommunity = await demoteFromModerator(community._id, memberId);
      setSuccessMessage('Moderator demoted to member successfully!');
      
      if (onMembersUpdate) {
        onMembersUpdate(updatedCommunity);
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMsg = err?.message || 'Failed to demote moderator';
      setError(errorMsg);
      console.error('Error demoting moderator:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setError('');
    setSuccessMessage('');
    setActionInProgress(null);
    onClose();
  };

  if (!community) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">Manage Members</h2>
                  <p className="text-sm text-muted-foreground">
                    {community.members_count} members in community
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Search Bar */}
                <div className="p-6 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Messages */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="text-sm text-green-600">{successMessage}</p>
                  </motion.div>
                )}

                {/* Members List */}
                <div className="p-6 space-y-3">
                  {filteredMembers.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.05 }}
                      className="space-y-3"
                    >
                      {filteredMembers.map((member) => {
                        const isMod = isModerator(member._id);
                        const isCreatorMem = isCreatorMember(member._id);

                        return (
                          <motion.div
                            key={member._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="w-10 h-10 shrink-0">
                                <AvatarImage src={member.avatar?.secure_url} />
                                <AvatarFallback>
                                  {getInitials(member.username)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {member.username || 'Unknown User'}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {member.email}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isCreatorMem && (
                                  <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Creator
                                  </Badge>
                                )}
                                {isMod && !isCreatorMem && (
                                  <Badge variant="secondary">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Moderator
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {isCreator && !isCreatorMem && (
                              <div className="flex items-center gap-2 ml-4 shrink-0">
                                {isMod ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDemoteFromModerator(member._id)}
                                    disabled={actionInProgress === `demote-${member._id}`}
                                    title="Demote from Moderator"
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  >
                                    {actionInProgress === `demote-${member._id}` ? (
                                      <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Star className="h-4 w-4" />
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePromoteToModerator(member._id)}
                                    disabled={actionInProgress === `promote-${member._id}`}
                                    title="Promote to Moderator"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    {actionInProgress === `promote-${member._id}` ? (
                                      <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Star className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member._id)}
                                  disabled={actionInProgress === member._id}
                                  title="Remove Member"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  {actionInProgress === member._id ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No members found matching your search' : 'No members in this community'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t bg-muted/50 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ManageMembersModal;
