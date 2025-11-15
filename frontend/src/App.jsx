import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/publicPages/LandingPage';
import LoginPage from './pages/authPages/LoginPage';
import RegisterPage from './pages/authPages/RegisterPage';
import ForgotPasswordPage from './pages/authPages/ForgotPasswordPage';
import ResetPasswordPage from './pages/authPages/ResetPasswordPage';
import RequestOtp from './pages/authPages/RequestOtp';
import VerifyOtp from './pages/authPages/VerifyOtp';
import ProfilePage from './pages/ProfilePage';
import SavedPostsPage from './pages/SavedPostsPage';
import NotificationsPage from './pages/NotificationsPage';
import ExploreCommunities from './components/common/ExploreCommunities';
import CreateCommunityPage from './pages/publicPages/CreateCommunityPage';
import CreatePostPage from './pages/publicPages/CreatePostPage';
import PostDetailPage from './pages/publicPages/PostDetailPage';
import ProtectedRoute from './routes/ProtectedRoute';
import './index.css';
import AboutPage from '@/pages/publicPages/AboutPage';
import ContactPage from '@/pages/publicPages/ContactPage';
import PrivacyPolicyPage from '@/pages/publicPages/PrivacyPolicyPage';
import TermsConditionPage from '@/pages/publicPages/TermsConditionPage';
import AdminDashboard from '@/pages/adminPages/AdminDashboard';
import UserManagement from '@/pages/adminPages/UserManagement';
import SpamManagement from '@/pages/adminPages/SpamManagement';
import CommunityPage from '@/pages/publicPages/CommunityPage';
import SearchPage from '@/pages/publicPages/SearchPage';

const App = () => {
  return (
    <Router>
      <div className="App min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/password/reset/:token" element={<ResetPasswordPage />} />
          <Route path="/request-otp" element={<RequestOtp />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/u/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/saved-posts" element={<ProtectedRoute><SavedPostsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/communities" element={<ExploreCommunities />} />
          <Route path="/r/:communityName" element={<CommunityPage />} />
          <Route path="/create-community" element={<ProtectedRoute><CreateCommunityPage /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
          <Route path="/post/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsConditionPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/spam" element={<ProtectedRoute requiredRole="admin"><SpamManagement /></ProtectedRoute>} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;