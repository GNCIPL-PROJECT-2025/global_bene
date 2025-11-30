import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home,
  TrendingUp,
  Globe,
  Users,
  Plus,
  Bookmark,
  Bell,
  User,
  Settings,
  Shield,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useSidebar } from '@/context/SidebarContext';

const LeftSidebar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/', exact: true },
    { icon: TrendingUp, label: 'Popular', path: '/popular' },
    { icon: Globe, label: 'All', path: '/all' },
    { icon: Users, label: 'Communities', path: '/communities' },
  ];

  const userItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Bookmark, label: 'Saved', path: '/saved-posts' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  const adminItems = [
    { icon: Shield, label: 'Admin', path: '/admin/dashboard' },
  ];

  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Help', path: '/help' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.div 
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border z-40 overflow-hidden"
    >
      {/* Custom scrollbar styles */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 3px;
        }
        .sidebar-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.4);
        }
      `}</style>
      
      <div className="sidebar-scroll h-full overflow-y-auto overflow-x-hidden p-4 space-y-2">
        {/* Collapse/Expand Button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full p-2 rounded-lg hover:bg-muted transition-colors flex items-center mb-3 ${
            isCollapsed ? 'justify-center' : 'justify-start gap-3'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </motion.button>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={item.path}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className={`w-full justify-${isCollapsed ? 'center' : 'start'} gap-3 h-12 ${
                      active ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        {!isCollapsed && <div className="border-t border-border my-4" />}

        {/* Create Post */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to="/create-post">
            <Button className={`w-full justify-${isCollapsed ? 'center' : 'start'} gap-3 h-12 bg-primary hover:bg-primary/90`} title={isCollapsed ? 'Create Post' : ''}>
              <Plus className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Create Post</span>}
            </Button>
          </Link>
        </motion.div>

        {/* Create Community */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to="/create-community">
            <Button variant="outline" className={`w-full justify-${isCollapsed ? 'center' : 'start'} gap-3 h-12`} title={isCollapsed ? 'Create Community' : ''}>
              <Plus className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Create Community</span>}
            </Button>
          </Link>
        </motion.div>

        {/* Divider */}
        {!isCollapsed && <div className="border-t border-border my-4" />}

        {/* User Items */}
        {user && (
          <div className="space-y-1">
            {userItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to={item.path}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className={`w-full justify-${isCollapsed ? 'center' : 'start'} gap-3 h-10 ${
                        active ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                      }`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}

            {/* Admin Items */}
            {user.role === 'admin' && (
              <>
                {!isCollapsed && <div className="border-t border-border my-2" />}
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <motion.div
                      key={item.path}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link to={item.path}>
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={`w-full justify-${isCollapsed ? 'center' : 'start'} gap-3 h-10 ${
                            active ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                          }`}
                          title={isCollapsed ? item.label : ''}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && <span>{item.label}</span>}
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Footer Links */}
        {!isCollapsed && (
          <div className="mt-auto pt-3 border-t border-border/50">
            <div className="space-y-1 mb-3">
              {footerLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <div className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer">
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Global Bene, Inc. © 2025. All rights reserved.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LeftSidebar;