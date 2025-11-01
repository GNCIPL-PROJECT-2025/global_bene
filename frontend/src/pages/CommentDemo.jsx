import React from 'react';
import CommentCard from '@/components/cards/CommentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CommentDemo = () => {
  // Sample comment data for demonstration
  const sampleComments = [
    {
      _id: '1',
      content: 'This is a fantastic post! I really appreciate the detailed explanation and the modern design approach. The animations are smooth and the overall user experience feels very polished.',
      author: {
        _id: 'user1',
        fullName: 'John Doe',
        username: 'johndoe',
        avatar: {
          secure_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
        }
      },
      upvotes: ['user2', 'user3', 'user4'],
      downvotes: [],
      repliesCount: 2,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      _id: '2',
      content: 'Great work on the redesign! The card-based layout makes it much easier to read through comments. The voting system is intuitive and the reply functionality is seamless.',
      author: {
        _id: 'user2',
        fullName: 'Sarah Wilson',
        username: 'sarahw',
        avatar: {
          secure_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e2?w=400&h=400&fit=crop&crop=face'
        }
      },
      upvotes: ['user1', 'user3'],
      downvotes: ['user5'],
      repliesCount: 1,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 minutes ago
    },
    {
      _id: '3',
      content: 'I love the progressive indentation for nested replies. It makes the conversation flow much more natural and easier to follow.',
      author: {
        _id: 'user3',
        fullName: 'Mike Chen',
        username: 'mikechen',
        avatar: {
          secure_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
        }
      },
      upvotes: ['user1', 'user2', 'user4', 'user5'],
      downvotes: [],
      repliesCount: 0,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
    },
    {
      _id: '4',
      content: 'The dark mode support is excellent! All the colors transition smoothly and maintain great contrast.',
      author: {
        _id: 'user4',
        fullName: 'Emma Thompson',
        username: 'emmathompson',
        avatar: {
          secure_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
        }
      },
      upvotes: ['user1'],
      downvotes: [],
      repliesCount: 0,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    }
  ];

  // Mock functions for demo
  const handleUpvote = (commentId) => {
    console.log('Upvoted comment:', commentId);
  };

  const handleDownvote = (commentId) => {
    console.log('Downvoted comment:', commentId);
  };

  const handleReply = (commentId, content) => {
    console.log('Reply to comment:', commentId, 'with content:', content);
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Modern Comment System Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Showcasing the redesigned comment cards with modern UI, smooth animations, and enhanced user experience.
            </p>
          </CardContent>
        </Card>

        {/* Features highlight */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">✨ Compact Modern Design</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Space-efficient card layout</li>
                  <li>• Smaller avatars and tighter spacing</li>
                  <li>• Progressive indentation for replies</li>
                  <li>• Modern avatar design with gradients</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">🚀 Enhanced Interactions</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Smooth hover animations</li>
                  <li>• Compact voting interface</li>
                  <li>• Quick action dropdown menu</li>
                  <li>• Like button with heart animation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments section */}
        <Card>
          <CardHeader>
            <CardTitle>Comments ({sampleComments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sampleComments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                onReply={handleReply}
                depth={0}
              />
            ))}
          </CardContent>
        </Card>

        {/* Implementation note */}
        <Card>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              This demo showcases the new CommentCard component. In the actual implementation,
              voting and reply functions will connect to your backend API.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommentDemo;