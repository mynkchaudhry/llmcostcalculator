'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';
import GlassCard from './GlassCard';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: {
      icon: 'text-red-400',
      confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
      iconBg: 'bg-red-500/10 border-red-500/20'
    },
    warning: {
      icon: 'text-yellow-400',
      confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      iconBg: 'bg-yellow-500/10 border-yellow-500/20'
    },
    info: {
      icon: 'text-blue-400',
      confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white',
      iconBg: 'bg-blue-500/10 border-blue-500/20'
    }
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full border ${styles.iconBg}`}>
                  <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {message}
                  </p>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleConfirm}
                      className={`flex-1 ${styles.confirmButton}`}
                    >
                      {confirmText}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      className="flex-1"
                    >
                      {cancelText}
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}