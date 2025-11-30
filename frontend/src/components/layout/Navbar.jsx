import React, { useState, useEffect, useRef } from 'react';
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
  Shield,
  Users,
  FileText,
  Hash
} from 'lucide-react';
import { logout } from '@/redux/slice/auth.slice';
import { searchAPI } from '@/api/search.api';

const Navbar = ({ user, notificationsCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ communities: [], posts: [], users: [] });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  // Debounced search function
  const debouncedSearch = useRef(null);

  const performSearch = async (query) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults({ communities: [], posts: [], users: [] });
      setShowSearchDropdown(false);
      return;
    }

    setIsSearchLoading(true);
    try {
      const response = await searchAPI.searchAll(query.trim(), 3);
      setSearchResults(response.data.data);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ communities: [], posts: [], users: [] });
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }

    debouncedSearch.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleResultClick = (type, id) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (type === 'community') {
      navigate(`/g/${id}`);
    } else if (type === 'post') {
      navigate(`/post/${id}`);
    } else if (type === 'user') {
      navigate(`/user/${id}`);
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
                {/* Primary logo image (placed in `public/global_bene.png`). If image missing, fallback to initial circular G */}
                <img
                  src="/global_bane2-bg.png"
                  alt="Global Bene"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    // Show fallback circle-G when image fails to load
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    document.getElementById('logo-fallback')?.style.removeProperty('display');
                  }}
                  onLoad={(e) => {
                    // Hide fallback circle-G when image loads successfully
                    document.getElementById('logo-fallback')?.style.setProperty('display', 'none', 'important');
                  }}
                />
                <div id="logo-fallback" style={{ display: 'none' }} className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">G</span>
                </div>
                <span className="text-xl font-bold text-foreground hidden sm:block">Global Bene</span>
              </Link>
          </motion.div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search communities, posts, or users..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => searchQuery && setShowSearchDropdown(true)}
                className="pl-10 pr-4 py-2 w-full rounded-full border-border focus:border-primary focus:ring-primary"
              />
            </form>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
              >
                {isSearchLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Searching...
                  </div>
                ) : (
                  <>
                    {/* Communities */}
                    {searchResults.communities.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
                          <Hash className="h-4 w-4" />
                          Communities
                        </div>
                        {searchResults.communities.map((community) => (
                          <div
                            key={community._id}
                            onClick={() => handleResultClick('community', community.name)}
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={community.avatar?.secure_url} />
                              <AvatarFallback>
                                {community.title?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                g/{community.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {community.members_count} members
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Posts */}
                    {searchResults.posts.length > 0 && (
                      <div className="p-2 border-t border-border">
                        <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          Posts
                        </div>
                        {searchResults.posts.map((post) => (
                          <div
                            key={post._id}
                            onClick={() => handleResultClick('post', post._id)}
                            className="flex items-start gap-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                          >
                            <Avatar className="h-6 w-6 mt-1">
                              <AvatarImage src={post.author_id?.avatar?.secure_url} />
                              <AvatarFallback className="text-xs">
                                {post.author_id?.username?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {post.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                in g/{post.community_id?.name} by u/{post.author_id?.username}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Users */}
                    {searchResults.users.length > 0 && (
                      <div className="p-2 border-t border-border">
                        <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
                          <Users className="h-4 w-4" />
                          Users
                        </div>
                        {searchResults.users.map((user) => (
                          <div
                            key={user._id}
                            onClick={() => handleResultClick('user', user._id)}
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar?.secure_url} />
                              <AvatarFallback>
                                {user.username?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                u/{user.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.num_posts} posts
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show all results link */}
                    {(searchResults.communities.length > 0 || searchResults.posts.length > 0 || searchResults.users.length > 0) && (
                      <div className="p-2 border-t border-border">
                        <button
                          onClick={handleSearch}
                          className="w-full text-left text-sm text-primary hover:underline p-2"
                        >
                          See all results for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
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





            {/* Create Post */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                onClick={() => navigate('/create-post')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Post
              </Button>
            </motion.div>



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
                      <AvatarImage src={user.avatar?.secure_url} className="object-cover" />
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
                      <AvatarImage src={user.avatar?.secure_url} className="object-cover" />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">u/{user.username}</p>
                    </div>
                  </div>
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