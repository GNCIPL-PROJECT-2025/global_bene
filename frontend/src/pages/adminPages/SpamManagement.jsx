import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/common/Loader';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Trash2, ArrowLeft } from 'lucide-react';
import { getSpamReports, resolveSpamReport, getFlaggedPosts, approveFlaggedPost, removeFlaggedPost } from '../../redux/slice/admin.slice';
import { formatDistanceToNow } from 'date-fns';

const SpamManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { spamReports, flaggedPosts, loading, error } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    if (activeTab === 'reports') {
      dispatch(getSpamReports());
    } else if (activeTab === 'posts') {
      dispatch(getFlaggedPosts());
    }
  }, [dispatch, activeTab]);

  const handleResolveReport = async (reportId, action) => {
    try {
      await dispatch(resolveSpamReport({ id: reportId, action })).unwrap();
      // Refresh the reports
      dispatch(getSpamReports());
    } catch (error) {
      console.error('Failed to resolve report:', error);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      await dispatch(approveFlaggedPost(postId)).unwrap();
      // Refresh the flagged posts
      dispatch(getFlaggedPosts());
    } catch (error) {
      console.error('Failed to approve post:', error);
    }
  };

  const handleRemovePost = async (postId) => {
    try {
      await dispatch(removeFlaggedPost(postId)).unwrap();
      // Refresh the flagged posts
      dispatch(getFlaggedPosts());
    } catch (error) {
      console.error('Failed to remove post:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
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
                Spam Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage spam reports and flagged content
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Spam Reports
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Flagged Posts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Spam Reports</CardTitle>
                  <CardDescription>
                    Review and resolve spam reports submitted by users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {spamReports && spamReports.length > 0 ? (
                    <div className="space-y-4">
                      {spamReports.map((report) => (
                        <div key={report._id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getSeverityColor(report.severity)}>
                                  {report.severity} severity
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm mb-2">
                                <strong>Reason:</strong> {report.reason}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Reporter:</strong> {report.reporter_id?.username || 'Anonymous'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Target:</strong> {report.target_type} - {report.target_id}
                              </p>
                              {report.spamScore && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Spam Score:</strong> {(report.spamScore * 100).toFixed(1)}%
                                </p>
                              )}
                              {report.toxicityScore && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Toxicity Score:</strong> {(report.toxicityScore * 100).toFixed(1)}%
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveReport(report._id, 'approve')}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveReport(report._id, 'remove')}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No spam reports</h3>
                      <p className="text-muted-foreground">All spam reports have been resolved.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Flagged Posts</CardTitle>
                  <CardDescription>
                    Posts that have been automatically flagged by the spam detection system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {flaggedPosts && flaggedPosts.length > 0 ? (
                    <div className="space-y-4">
                      {flaggedPosts.map((post) => (
                        <div key={post._id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                By {post.author?.username} in {post.community_id?.title || 'General'}
                              </p>
                              <p className="text-sm mb-2">{post.body}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                {post.spamScore && <span>Spam: {(post.spamScore * 100).toFixed(1)}%</span>}
                                {post.toxicityScore && <span>Toxicity: {(post.toxicityScore * 100).toFixed(1)}%</span>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprovePost(post._id)}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemovePost(post._id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No flagged posts</h3>
                      <p className="text-muted-foreground">All posts are clean and approved.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default SpamManagement;