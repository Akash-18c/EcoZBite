import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      default:
        return <CheckCircle className="w-16 h-16 text-green-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          button: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          button: 'bg-green-600 hover:bg-green-700'
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4 
              }}
              className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 ${colors.border} border-2`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="p-8 text-center">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.2, 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15 
                  }}
                  className="flex justify-center mb-6"
                >
                  <div className={`p-4 rounded-full ${colors.bg}`}>
                    {getIcon()}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-900 mb-4"
                >
                  {title}
                </motion.h3>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-lg ${colors.text} mb-8 leading-relaxed`}
                >
                  {message}
                </motion.p>

                {/* Action Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={onClose}
                  className={`px-8 py-3 ${colors.button} text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  Awesome!
                </motion.button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-green-400 rounded-full opacity-60"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-300 rounded-full opacity-40"></div>
              <div className="absolute top-1/4 -right-1 w-2 h-2 bg-green-500 rounded-full opacity-50"></div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;