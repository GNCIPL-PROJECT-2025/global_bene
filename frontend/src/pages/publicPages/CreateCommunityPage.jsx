import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '@/Layouts/MainLayout';
import CreateCommunityModal from '@/components/common/CreateCommunityModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [showModal, setShowModal] = useState(true);

  const handleCreateCommunity = (newCommunity) => {
    // Community creation is now handled by Redux in the modal
    console.log('Community created:', newCommunity);
    setShowModal(false);
    // You could redirect to the new community page here
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-linear-to-r from-primary to-primary/80 rounded-lg p-6 text-primary-foreground"
        >
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Link to="/communities">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Communities
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create a Community</h1>
              <p className="text-primary-foreground/80 mt-2">
                Build a community around your interests and connect with like-minded people.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-lg p-6 shadow-sm border-border"
        >
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Choose a unique name for your community (this cannot be changed later)</p>
            <p>• Write a clear description of what your community is about</p>
            <p>• Select an appropriate category to help users find your community</p>
            <p>• Upload an avatar and banner to make your community stand out</p>
            <p>• Configure your community settings (private/public, media permissions)</p>
          </div>
        </motion.div>

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-8"
        >
          <Button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
          >
            Start Creating Your Community
          </Button>
        </motion.div>
      </div>

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={showModal}
        onClose={handleClose}
      />
    </MainLayout>
  );
};

export default CreateCommunityPage;