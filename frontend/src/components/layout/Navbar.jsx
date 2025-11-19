import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Bell,
  MessageSquare,
  Plus,
  User,
  Settings,
  LogOut,
  Home,
  TrendingUp,
  Menu,
  X,
  Sun,
  Moon,
  Bookmark,
  Shield
} from 'lucide-react';
import { logout } from '@/redux/slice/auth.slice';

const Navbar = ({ user, notificationsCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border-b border-border sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">Global Bene</span>
            </Link>
          </motion.div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search communities, posts, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full border-border focus:border-primary focus:ring-primary"
              />
            </form>
          </div>

          {/* Desktop Right side actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
            </motion.button>

            {/* Home */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Home className="h-5 w-5 text-muted-foreground" />
            </motion.button>

            {/* Trending */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/trending')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </motion.button>

            {/* Create Post */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                onClick={() => navigate('/create-post')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </motion.div>

            {/* Messages */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/messages')}
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
            >
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notificationsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationsCount > 99 ? '99+' : notificationsCount}
                </Badge>
              )}
            </motion.button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar?.secure_url} />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-sm text-muted-foreground">u/{user.username}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/saved-posts')}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved Posts
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/search')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-full border-border focus:border-primary focus:ring-primary"
                />
              </form>

              {/* Mobile Navigation */}
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" onClick={() => { toggleTheme(); }} className="justify-start">
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      Light Mode
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className="justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/trending'); setIsMobileMenuOpen(false); }} className="justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/create-post'); setIsMobileMenuOpen(false); }} className="justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/messages'); setIsMobileMenuOpen(false); }} className="justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/notifications'); setIsMobileMenuOpen(false); }} className="justify-start relative">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {notificationsCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {notificationsCount > 99 ? '99+' : notificationsCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Mobile User Section */}
              {user ? (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar?.secure_url} />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">u/{user.username}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button variant="ghost" onClick={() => { navigate('/saved-posts'); setIsMobileMenuOpen(false); }} className="w-full justify-start">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Saved Posts
                  </Button>
                  {user.role === 'admin' && (
                    <Button variant="ghost" onClick={() => { navigate('/admin/dashboard'); setIsMobileMenuOpen(false); }} className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }} className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="border-t pt-4 space-y-2">
                  <Button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full">
                    Log In
                  </Button>
                  <Button onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} variant="outline" className="w-full">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;