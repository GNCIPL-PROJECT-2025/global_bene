import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import CreateCommunityModal from '@/components/common/CreateCommunityModal';

const MainLayout = ({ children, communities = [], userCommunities = [], notificationsCount = 0 }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleCreateCommunity = (newCommunity) => {
    // Handle community creation
    console.log('Creating community:', newCommunity);
    // In a real app, this would make an API call
    // For now, just close the modal
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} notificationsCount={notificationsCount} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex gap-4 lg:gap-6">
          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-0"
          >
            {children}
          </motion.main>

          {/* Sidebar */}
          <aside className="hidden lg:block lg:w-80 xl:w-96">
            <Sidebar
              communities={communities}
              userCommunities={userCommunities}
              onCreateCommunity={() => setShowCreateModal(true)}
            />
          </aside>
        </div>
      </div>

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCommunity}
      />
    </div>
  );
};

export default MainLayout;