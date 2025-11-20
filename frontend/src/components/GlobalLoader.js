import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const GlobalLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-6"
        >
          <Logo size="large" showText={false} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-900">EcoZBite</h2>
          <p className="text-gray-600">Loading your sustainable shopping experience...</p>
          
          <div className="flex justify-center space-x-1 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  backgroundColor: ['#10B981', '#059669', '#10B981']
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-3 h-3 bg-green-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GlobalLoader;