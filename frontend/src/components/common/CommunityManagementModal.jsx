import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/common/Loader';
import { Trash2, UserMinus, UserPlus, Settings, Shield, Users } from 'lucide-react';
import { updateCommunity, addModerator, removeModerator, deleteCommunity } from '../../redux/slice/community.slice';
import { getAllUsers } from '../../redux/slice/admin.slice';

const CommunityManagementModal = ({ isOpen, onClose, community }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.admin);
  const { loading } = useSelector(state => state.community);

  const [activeTab, setActiveTab] = useState('settings');
  const [formData, setFormData] = useState({
    description: '',
    rules: [],
    is_private: false
  });
  const [newRule, setNewRule] = useState({ title: '', description: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (community) {
      setFormData({
        description: community.description || '',
        rules: community.rules || [],
        is_private: community.is_private || false
      });
    }
  }, [community]);

  useEffect(() => {
    if (isOpen && activeTab === 'members') {
      dispatch(getAllUsers());
    }
  }, [isOpen, activeTab, dispatch]);

  const isCreator = community?.creator_id?._id === user?._id;
  const isModerator = community?.moderators?.some(mod =>
    typeof mod === 'string' ? mod === user?._id : mod._id === user?._id
  );

  const handleUpdateCommunity = async () => {
    try {
      await dispatch(updateCommunity({
        communityId: community._id,
        updateData: formData
      })).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update community:', error);
    }
  };

  const handleAddRule = () => {
    if (newRule.title && newRule.description) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, { ...newRule }]
      }));
      setNewRule({ title: '', description: '' });
    }
  };

  const handleRemoveRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleAddModerator = async () => {
    if (selectedUserId) {
      try {
        await dispatch(addModerator({
          communityId: community._id,
          userId: selectedUserId
        })).unwrap();
        setSelectedUserId('');
      } catch (error) {
        console.error('Failed to add moderator:', error);
      }
    }
  };

  const handleRemoveModerator = async (moderatorId) => {
    try {
      await dispatch(removeModerator({
        communityId: community._id,
        userId: moderatorId
      })).unwrap();
    } catch (error) {
      console.error('Failed to remove moderator:', error);
    }
  };

  const handleDeleteCommunity = async () => {
    try {
      await dispatch(deleteCommunity(community._id)).unwrap();
      onClose();
      // Redirect to communities page
      window.location.href = '/communities';
    } catch (error) {
      console.error('Failed to delete community:', error);
    }
  };

  if (!community) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Community: {community.title}
          </DialogTitle>
          <DialogDescription>
            Manage settings, members, and moderators for this community.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="moderators">Moderators</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Community description..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={formData.is_private}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="private">Private Community</Label>
                </div>

                <Button onClick={handleUpdateCommunity} disabled={loading}>
                  {loading ? <Loader /> : 'Update Settings'}
                </Button>
              </CardContent>
            </Card>

            {isCreator && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Deleting this community will permanently remove all posts, comments, and data associated with it.
                    </p>
                    {!showDeleteConfirm ? (
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Community
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-600">
                          Are you sure? This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={handleDeleteCommunity}
                            disabled={loading}
                          >
                            {loading ? <Loader /> : 'Yes, Delete Community'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-title">Rule Title</Label>
                    <Input
                      id="rule-title"
                      value={newRule.title}
                      onChange={(e) => setNewRule(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Rule title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="rule-description">Rule Description</Label>
                    <Input
                      id="rule-description"
                      value={newRule.description}
                      onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Rule description..."
                    />
                  </div>
                </div>
                <Button onClick={handleAddRule} variant="outline">
                  Add Rule
                </Button>

                <div className="space-y-2">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{rule.title}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRule(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={handleUpdateCommunity} disabled={loading}>
                  {loading ? <Loader /> : 'Update Rules'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Moderators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCreator && (
                  <div className="flex gap-2">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select user to add as moderator...</option>
                      {users?.filter(u => !community.moderators?.some(mod =>
                        (typeof mod === 'string' ? mod : mod._id) === u._id
                      )).map(user => (
                        <option key={user._id} value={user._id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                    <Button onClick={handleAddModerator} disabled={!selectedUserId || loading}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Current Moderators</h4>
                  {community.moderators?.map((moderator, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={moderator.avatar?.secure_url} />
                          <AvatarFallback>
                            {typeof moderator === 'string' ? moderator[0]?.toUpperCase() : moderator.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {typeof moderator === 'string' ? 'Moderator' : moderator.username}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Moderator
                          </Badge>
                        </div>
                      </div>
                      {isCreator && (typeof moderator === 'string' ? moderator : moderator._id) !== user._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveModerator(typeof moderator === 'string' ? moderator : moderator._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Members ({community.members_count})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {community.members?.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar?.secure_url} />
                          <AvatarFallback>
                            {typeof member === 'string' ? member[0]?.toUpperCase() : member.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {typeof member === 'string' ? 'Member' : member.username}
                          </p>
                          <p className="text-sm text-muted-foreground">Member</p>
                        </div>
                      </div>
                      {(isCreator || isModerator) && (typeof member === 'string' ? member : member._id) !== user._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityManagementModal;