import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/common/Loader';
import { Users, FileText, MessageSquare, Building, TrendingUp, Activity } from 'lucide-react';
import { getAdminStats, getAllActivityLogs } from '../../redux/slice/admin.slice';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, activityLogs, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAdminStats());
    dispatch(getAllActivityLogs());
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total Comments',
      value: stats?.totalComments || 0,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Total Communities',
      value: stats?.totalCommunities || 0,
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Active Users Today',
      value: stats?.activeUsersToday || 0,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600 dark:text-red-400">{error}</p>
            <Button
              onClick={() => dispatch(getAdminStats())}
              className="w-full mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Overview of your platform statistics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value.toLocaleString()}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/users')}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/search')}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Posts
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/communities')}>
                  <Building className="mr-2 h-4 w-4" />
                  Manage Communities
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest platform activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs && activityLogs.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {activityLogs.slice(0, 10).map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Activity className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {log.user_id?.username || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {log.activities?.[0]?.event_type || 'Activity'} • {formatDistanceToNow(new Date(log.activities?.[0]?.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No recent activity found.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;