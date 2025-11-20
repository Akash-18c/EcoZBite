import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Recycle } from 'lucide-react';

const Logo = ({ size = 'default', onClick, showText = true }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizes = {
    small: 'text-lg',
    default: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl'
  };

  const leafSizes = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    medium: 'w-7 h-7',
    large: 'w-8 h-8'
  };

  const recycleSizes = {
    small: 'w-2 h-2',
    default: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <motion.button
      onClick={onClick}
      className="flex items-center space-x-3 group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Animated Logo Container */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Background Circle */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Inner Elements */}
        <div className="relative z-10 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: [0, -360],
              y: [0, -2, 0]
            }}
            transition={{
              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Leaf className={`${leafSizes[size]} text-white`} />
          </motion.div>
          
          <motion.div
            className="absolute"
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Recycle className={`${recycleSizes[size]} text-green-100 opacity-60`} />
          </motion.div>
        </div>

        {/* Pulse Effect */}
        <motion.div
          className="absolute inset-0 bg-green-400 rounded-full opacity-30"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <motion.span
            className={`font-bold text-gray-900 group-hover:text-green-600 transition-colors ${textSizes[size]}`}
            animate={{
              backgroundPosition: ['0%', '100%', '0%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: 'linear-gradient(90deg, #059669, #10b981, #34d399, #10b981, #059669)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            EcoZBite
          </motion.span>
        </div>
      )}
    </motion.button>
  );
};

export default Logo;