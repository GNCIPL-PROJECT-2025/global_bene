import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import Navbar from '@/components/layout/Navbar';
import LeftSidebar from '@/components/layout/LeftSidebar';
import Sidebar from '@/components/layout/Sidebar';
import CreateCommunityModal from '@/components/common/CreateCommunityModal';
import { useSidebar } from '@/context/SidebarContext';

const MainLayout = ({ children, communities = [], userCommunities = [] }) => {
  const { isCollapsed } = useSidebar();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);

  const handleCreateCommunity = (newCommunity) => {
    // Handle community creation
    console.log('Creating community:', newCommunity);
    // In a real app, this would make an API call
    // For now, just close the modal
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} notificationsCount={unreadCount} />
      <LeftSidebar />

      <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 flex`}>
        {/* Main Content with padding */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-w-0"
          >
            {children}
          </motion.main>
        </div>

        {/* Right Sidebar - no padding, sticks to right edge */}
        <aside className="hidden lg:block w-80 xl:w-96 pr-4 sm:pr-6 lg:pr-8 py-4 sm:py-6 shrink-0">
          <Sidebar
            communities={communities}
            userCommunities={userCommunities}
            onCreateCommunity={() => setShowCreateModal(true)}
          />
        </aside>
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