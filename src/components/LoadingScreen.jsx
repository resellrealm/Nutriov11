import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {
  LOADING_SCREEN_INCREMENT,
  LOADING_SCREEN_INTERVAL,
  LOADING_COMPLETION_DELAY
} from '../config/constants';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isPopping, setIsPopping] = useState(false);
  const [showSteam, setShowSteam] = useState(false);
  const audioContextRef = useRef(null);
  const toastControls = useAnimation();
  const toasterControls = useAnimation();

  // Initialize Web Audio Context for sound effects
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play toaster "ding" sound
  const playDingSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Create a pleasant "ding" with two frequencies
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  // Play subtle tick sound
  const playTickSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  };

  // Progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);

          if (!isPopping) {
            setIsPopping(true);
            playDingSound();

            // Animate toast popping out
            toastControls.start({
              y: -150,
              rotate: [0, -5, 5, -3, 0],
              transition: {
                type: 'spring',
                stiffness: 200,
                damping: 10,
                duration: 0.6
              }
            });

            // Shake toaster
            toasterControls.start({
              x: [-2, 2, -2, 2, 0],
              transition: { duration: 0.3 }
            });
          }

          // Complete loading after animation
          setTimeout(() => {
            if (typeof onLoadingComplete === 'function') {
              onLoadingComplete();
            }
          }, LOADING_COMPLETION_DELAY);

          return 100;
        }

        const newProgress = Math.min(oldProgress + LOADING_SCREEN_INCREMENT, 100);

        // Play tick sound at certain intervals
        if (Math.floor(newProgress) % 20 === 0 && Math.floor(oldProgress) % 20 !== 0) {
          playTickSound();
        }

        // Start showing steam at 50%
        if (newProgress >= 50 && !showSteam) {
          setShowSteam(true);
        }

        return newProgress;
      });
    }, LOADING_SCREEN_INTERVAL);

    return () => clearInterval(timer);
  }, [onLoadingComplete, isPopping, showSteam, toastControls, toasterControls]);

  // Steam particle component
  const SteamParticle = ({ delay, x }) => (
    <motion.div
      className="absolute bottom-0 w-4 h-4 bg-white/40 rounded-full blur-sm"
      initial={{ y: 0, x, opacity: 0, scale: 0.5 }}
      animate={{
        y: -60,
        opacity: [0, 0.6, 0],
        scale: [0.5, 1.2, 0.8],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
    />
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary animate-gradient-xy">
      <div className="text-center relative">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Preparing Nutrio...
          </h2>
          <p className="text-white/90 text-lg mb-8">
            {progress < 30 ? '🔥 Heating up...' :
             progress < 60 ? '♨️ Getting toasty...' :
             progress < 90 ? '🍞 Almost ready...' :
             isPopping ? '✨ Perfect!' : '⏰ Final seconds...'}
          </p>
        </motion.div>

        {/* Toaster Container */}
        <div className="relative w-64 h-80 mx-auto">
          {/* Steam particles */}
          {showSteam && !isPopping && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-32">
              <SteamParticle delay={0} x={-10} />
              <SteamParticle delay={0.3} x={0} />
              <SteamParticle delay={0.6} x={10} />
              <SteamParticle delay={0.9} x={-5} />
              <SteamParticle delay={1.2} x={5} />
            </div>
          )}

          {/* Toaster Body */}
          <motion.div
            animate={toasterControls}
            className="relative w-48 h-56 mx-auto"
          >
            {/* Main toaster body */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-3xl shadow-2xl border-4 border-gray-600">
              {/* Shine effect */}
              <div className="absolute top-4 left-4 w-8 h-16 bg-white/20 rounded-full blur-sm" />

              {/* Heating coils glow effect */}
              <motion.div
                className="absolute inset-x-8 top-20 bottom-20 rounded-lg"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 100, 0, 0.3)',
                    `0 0 30px rgba(255, 100, 0, ${0.3 + progress / 200})`,
                  ],
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
              >
                {/* Heating element lines */}
                <div className="h-full flex flex-col justify-around px-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-1 rounded-full"
                      animate={{
                        backgroundColor: [
                          'rgb(139, 0, 0)',
                          `rgb(255, ${100 + progress}, 0)`,
                        ],
                      }}
                      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Toaster slots */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-950 rounded-t-lg border-2 border-gray-900" />

              {/* Control dial */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-600 rounded-full shadow-inner flex items-center justify-center border-2 border-gray-500">
                <motion.div
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>

              {/* Timer display */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded text-green-400 font-mono text-sm font-bold border border-green-500/30">
                {Math.ceil((100 - progress) / 20)}s
              </div>
            </div>

            {/* Toast */}
            <motion.div
              animate={toastControls}
              className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10"
              initial={{ y: progress < 70 ? 0 : -20 }}
            >
              <motion.div
                className="relative"
                animate={{
                  y: progress >= 70 && !isPopping ? [-20, -25, -20] : 0,
                }}
                transition={{
                  duration: 0.5,
                  repeat: progress >= 70 && !isPopping ? Infinity : 0,
                }}
              >
                {/* Butter on top (appears at 80% while still in toaster) */}
                {progress >= 80 && (
                  <motion.div
                    initial={{ scale: 0, y: -10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-yellow-300 rounded-full shadow-lg z-20"
                  >
                    {/* Melting butter effect */}
                    <motion.div
                      className="absolute inset-0 bg-yellow-200 rounded-full"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                )}

                {/* Toast slice */}
                <div className="w-24 h-32 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-lg shadow-xl relative overflow-hidden border-2 border-amber-500">
                  {/* Toast texture */}
                  <div className="absolute inset-2 bg-amber-100/40 rounded-md" />

                  {/* Brown spots - appear gradually */}
                  <motion.div
                    className="absolute top-4 left-4 w-2 h-2 bg-amber-800 rounded-full"
                    animate={{ opacity: progress / 100 }}
                  />
                  <motion.div
                    className="absolute top-8 right-6 w-3 h-3 bg-amber-900 rounded-full"
                    animate={{ opacity: progress / 100 }}
                  />
                  <motion.div
                    className="absolute bottom-8 left-6 w-2 h-2 bg-amber-800 rounded-full"
                    animate={{ opacity: progress / 100 }}
                  />

                  {/* Shine effect on toast */}
                  <div className="absolute top-2 left-2 w-8 h-12 bg-white/30 rounded-full blur-sm" />

                  {/* Happy face on toast */}
                  {progress > 50 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center text-3xl"
                    >
                      {isPopping ? '🤩' : '😊'}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-80 mx-auto mt-12"
        >
          <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
            <motion.div
              className="h-full bg-white rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-white/90 text-sm mt-3 font-medium">
            {Math.round(progress)}% Toasted
          </p>
        </motion.div>

        {/* Sparkles when done */}
        {isPopping && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: '50%',
                  top: '40%',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos((i / 12) * Math.PI * 2) * 100,
                  y: Math.sin((i / 12) * Math.PI * 2) * 100,
                }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
