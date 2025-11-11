import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          setTimeout(() => {
            onLoadingComplete();
          }, 300);
          return 100;
        }
        const diff = Math.random() * 15;
        return Math.min(oldProgress + diff, 100);
      });
    }, 150);

    return () => {
      clearInterval(timer);
    };
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary animate-gradient-xy">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Logo */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl">
            <div className="text-6xl">🍽️</div>
          </div>
          
          {/* App Name */}
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Nutrio
          </h1>
          <p className="text-white/90 text-lg font-medium mb-8">
            Your Nutrition Journey
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-white rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <motion.p 
            className="text-white/80 text-sm mt-3 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {progress < 30 ? 'Preparing your nutrition tracker...' :
             progress < 60 ? 'Loading your data...' :
             progress < 90 ? 'Almost ready...' :
             'Welcome back!'}
          </motion.p>
        </div>

        {/* Animated Dots */}
        <motion.div 
          className="flex justify-center space-x-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
