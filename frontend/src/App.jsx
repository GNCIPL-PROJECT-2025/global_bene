// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LandingPage from './pages/publicPages/LandingPage';
// import LoginPage from './pages/authPages/LoginPage';
// import RegisterPage from './pages/authPages/RegisterPage';
// import ForgotPasswordPage from './pages/authPages/ForgotPasswordPage';
// import ResetPasswordPage from './pages/authPages/ResetPasswordPage';
// import RequestOtp from './pages/authPages/RequestOtp';
// import VerifyOtp from './pages/authPages/VerifyOtp';
// import ProfilePage from './pages/ProfilePage';
// import SavedPostsPage from './pages/SavedPostsPage';
// import NotificationsPage from './pages/NotificationsPage';
// import ExploreCommunities from './components/common/ExploreCommunities';
// import CreateCommunityPage from './pages/publicPages/CreateCommunityPage';
// import CreatePostPage from './pages/publicPages/CreatePostPage';
// import PostDetailPage from './pages/publicPages/PostDetailPage';
// import ProtectedRoute from './routes/ProtectedRoute';
// import './index.css';
// import AboutPage from '@/pages/publicPages/AboutPage';
// import ContactPage from '@/pages/publicPages/ContactPage';
// import PrivacyPolicyPage from '@/pages/publicPages/PrivacyPolicyPage';
// import TermsConditionPage from '@/pages/publicPages/TermsConditionPage';
// import AdminDashboard from '@/pages/adminPages/AdminDashboard';
// import UserManagement from '@/pages/adminPages/UserManagement';
// import PostManagement from '@/pages/adminPages/PostManagement';
// import CommunityManagement from '@/pages/adminPages/CommunityManagement';
// import SpamManagement from '@/pages/adminPages/SpamManagement';
// import CommunityPage from '@/pages/publicPages/CommunityPage';
// import UserProfilePage from '@/pages/publicPages/UserProfilePage';
// import SearchPage from '@/pages/SearchPage';

// const App = () => {
//   return (
//     <Router>
//       <div className="App min-h-screen bg-background text-foreground">
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//           <Route path="/password/reset/:token" element={<ResetPasswordPage />} />
//           <Route path="/request-otp" element={<RequestOtp />} />
//           <Route path="/verify-otp" element={<VerifyOtp />} />
//           <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
//           <Route path="/saved-posts" element={<ProtectedRoute><SavedPostsPage /></ProtectedRoute>} />
//           <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
//           <Route path="/communities" element={<ExploreCommunities />} />
//           <Route path="/create-community" element={<ProtectedRoute><CreateCommunityPage /></ProtectedRoute>} />
//           <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
//           <Route path="/post/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
//           <Route path="/about" element={<AboutPage />} />
//           <Route path="/help" element={<ContactPage />} />
//           <Route path="/privacy" element={<PrivacyPolicyPage />} />
//           <Route path="/terms" element={<TermsConditionPage />} />
//           <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
//           <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
//           <Route path="/admin/posts" element={<ProtectedRoute requiredRole="admin"><PostManagement /></ProtectedRoute>} />
//           <Route path="/admin/communities" element={<ProtectedRoute requiredRole="admin"><CommunityManagement /></ProtectedRoute>} />
//           <Route path="/admin/spam" element={<ProtectedRoute requiredRole="admin"><SpamManagement /></ProtectedRoute>} />
//           <Route path="/g/:communityName" element={<CommunityPage />} />
//           <Route path="/user/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
//           <Route path="/search" element={<SearchPage />} />
//           {/* Add more routes as needed */}
//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default App;


import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from './redux/slice/auth.slice';

// Lazy load components
const LandingPage = lazy(() => import('./pages/publicPages/LandingPage'));
const LoginPage = lazy(() => import('./pages/authPages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/authPages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/authPages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/authPages/ResetPasswordPage'));
const RequestOtp = lazy(() => import('./pages/authPages/RequestOtp'));
const VerifyOtp = lazy(() => import('./pages/authPages/VerifyOtp'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SavedPostsPage = lazy(() => import('./pages/SavedPostsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ExploreCommunities = lazy(() => import('./components/common/ExploreCommunities'));
const CreateCommunityPage = lazy(() => import('./pages/publicPages/CreateCommunityPage'));
const CreatePostPage = lazy(() => import('./pages/publicPages/CreatePostPage'));
const PostDetailPage = lazy(() => import('./pages/publicPages/PostDetailPage'));
const ProtectedRoute = lazy(() => import('./routes/ProtectedRoute'));
const AboutPage = lazy(() => import('@/pages/publicPages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/publicPages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/publicPages/PrivacyPolicyPage'));
const TermsConditionPage = lazy(() => import('@/pages/publicPages/TermsConditionPage'));
const AdminDashboard = lazy(() => import('@/pages/adminPages/AdminDashboard'));
const UserManagement = lazy(() => import('@/pages/adminPages/UserManagement'));
const PostManagement = lazy(() => import('@/pages/adminPages/PostManagement'));
const CommunityManagement = lazy(() => import('@/pages/adminPages/CommunityManagement'));
const SpamManagement = lazy(() => import('@/pages/adminPages/SpamManagement'));
const CommunityPage = lazy(() => import('@/pages/publicPages/CommunityPage'));
const UserProfilePage = lazy(() => import('@/pages/publicPages/UserProfilePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const auth = searchParams.get('auth');
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (auth === 'success' && accessToken && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Clean the URL
      navigate('/', { replace: true });

      // Check auth status to set user in Redux
      dispatch(checkAuthStatus());
    }
  }, [location, navigate, dispatch]);

  return (
    <div className="App min-h-screen bg-background text-foreground">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div></div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/password/reset/:token" element={<ResetPasswordPage />} />
          <Route path="/request-otp" element={<RequestOtp />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/saved-posts" element={<ProtectedRoute><SavedPostsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/communities" element={<ExploreCommunities />} />
          <Route path="/create-community" element={<ProtectedRoute><CreateCommunityPage /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
          <Route path="/post/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsConditionPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/posts" element={<ProtectedRoute requiredRole="admin"><PostManagement /></ProtectedRoute>} />
          <Route path="/admin/communities" element={<ProtectedRoute requiredRole="admin"><CommunityManagement /></ProtectedRoute>} />
          <Route path="/admin/spam" element={<ProtectedRoute requiredRole="admin"><SpamManagement /></ProtectedRoute>} />
          <Route path="/g/:communityName" element={<CommunityPage />} />
          <Route path="/user/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/search" element={<SearchPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </Suspense>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
