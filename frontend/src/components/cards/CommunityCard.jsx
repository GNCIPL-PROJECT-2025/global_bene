import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Calendar, Crown } from 'lucide-react';

const CommunityCard = ({ community, onJoin, viewMode = 'grid' }) => {
  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Community Avatar */}
              <Avatar className="h-16 w-16">
                <AvatarImage src={community.avatar?.secure_url} />
                <AvatarFallback className="text-lg font-bold">
                  {community.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Community Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/r/${community.name}`}
                      className="text-lg font-bold hover:text-blue-600 transition-colors block truncate"
                    >
                      r/{community.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{formatMemberCount(community.memberCount)} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{formatMemberCount(community.postCount)} posts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatDate(community.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Join Button */}
                  <div className="ml-4">
                    <Button
                      onClick={() => onJoin(community._id)}
                      variant={community.isJoined ? "outline" : "default"}
                      size="sm"
                      className={
                        community.isJoined
                          ? "border-green-500 text-green-600 hover:bg-green-50"
                          : "bg-orange-500 hover:bg-orange-600"
                      }
                    >
                      {community.isJoined ? 'Joined' : 'Join'}
                    </Button>
                  </div>
                </div>

                {/* Category and Moderators */}
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {community.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Crown className="h-3 w-3" />
                    <span>Mods: {community.moderators?.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
        {/* Banner */}
        {community.banner?.secure_url && (
          <div className="h-20 bg-gradient-to-r from-orange-400 to-red-500 relative overflow-hidden">
            <img
              src={community.banner.secure_url}
              alt={`${community.name} banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        <CardContent className="p-4">
          {/* Community Header */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={community.avatar?.secure_url} />
              <AvatarFallback className="font-bold">
                {community.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link
                to={`/r/${community.name}`}
                className="font-bold hover:text-blue-600 transition-colors block truncate"
              >
                r/{community.name}
              </Link>
              <Badge variant="secondary" className="text-xs mt-1">
                {community.category}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {community.description}
          </p>

          {/* Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{formatMemberCount(community.memberCount)}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{formatMemberCount(community.postCount)}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Created {formatDate(community.createdAt)}
            </div>
          </div>

          {/* Moderators */}
          <div className="flex items-center gap-1 mb-4 text-xs text-muted-foreground">
            <Crown className="h-3 w-3" />
            <span className="truncate">
              Mods: {community.moderators?.slice(0, 2).join(', ')}
              {community.moderators?.length > 2 && ` +${community.moderators.length - 2} more`}
            </span>
          </div>

          {/* Join Button */}
          <Button
            onClick={() => onJoin(community._id)}
            variant={community.isJoined ? "outline" : "default"}
            size="sm"
            className={`w-full ${
              community.isJoined
                ? "border-green-500 text-green-600 hover:bg-green-50"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {community.isJoined ? 'Joined' : 'Join Community'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CommunityCard;
