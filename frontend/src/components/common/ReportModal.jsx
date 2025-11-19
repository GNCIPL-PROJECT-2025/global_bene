import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'violence', label: 'Violence or Dangerous Content' },
  { value: 'copyright', label: 'Copyright Infringement' },
  { value: 'other', label: 'Other' }
];

const ReportModal = ({ 
  isOpen, 
  onClose, 
  targetType = 'post', // 'post', 'comment', 'user'
  targetId,
  onSubmit,
  isLoading = false 
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Please select a reason');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setError('');
    await onSubmit({ reason: selectedReason, description });
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    setError('');
    onClose();
  };

  // Render modal into document.body to avoid stacking-context issues
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Report {targetType === 'user' ? 'User' : targetType === 'comment' ? 'Comment' : 'Post'}</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Reason Select */}
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Report</label>
                  <select
                    value={selectedReason}
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a reason...</option>
                    {REPORT_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Please provide details about why you're reporting this content..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setError('');
                    }}
                    className="min-h-24 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {description.length}/500 characters
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Info Message */}
                <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                  Our team will review this report and take appropriate action. Thank you for helping keep our community safe.
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedReason || !description.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ReportModal;
