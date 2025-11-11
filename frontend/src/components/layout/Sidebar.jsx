import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, TrendingUp, Users, Star } from 'lucide-react';

const Sidebar = ({ communities = [], userCommunities = [], onCreateCommunity }) => {
  const popularCommunities = communities.slice(0, 5);

  return (
    <div className="w-80 space-y-4">
      {/* Create Community Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Create Community</h3>
                <p className="text-sm text-muted-foreground">Share your interests</p>
              </div>
            </div>
            {onCreateCommunity ? (
              <Button
                onClick={onCreateCommunity}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Create Community
              </Button>
            ) : (
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link to="/create-community">
                  Create Community
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Popular Communities */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Communities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularCommunities.map((community, index) => (
              <motion.div
                key={community._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={community.avatar?.secure_url} />
                  <AvatarFallback>{community.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/r/${community.name}`}
                    className="font-medium text-sm hover:text-blue-600 block truncate"
                  >
                    g/{community.name}
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{community.members_count || 0} members</span>
                  </div>
                </div>
              </motion.div>
            ))}
            <Separator />
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link to="/communities">
                View All Communities
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Your Communities */}
      {userCommunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Communities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userCommunities.slice(0, 5).map((community, index) => (
                <motion.div
                  key={community._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <Link
                    to={`/r/${community.name}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={community.avatar?.secure_url} />
                      <AvatarFallback>{community.name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">g/{community.name}</span>
                  </Link>
                </motion.div>
              ))}
              {userCommunities.length > 5 && (
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link to="/my-communities">
                    View All ({userCommunities.length})
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Footer Links */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/about" className="block hover:text-blue-600 transition-colors">
                About Global Bene
              </Link>
              <Link to="/help" className="block hover:text-blue-600 transition-colors">
                Help Center
              </Link>
              <Link to="/privacy" className="block hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
            </div>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground">
              © 2025 Global Bene. All rights reserved.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Sidebar;