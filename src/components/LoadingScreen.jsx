import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {
  LOADING_SCREEN_INCREMENT,
  LOADING_SCREEN_INTERVAL,
  LOADING_COMPLETION_DELAY
} from '../config/constants';

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

// Toast component
const Toast = ({ controls, className, initialX = 0, progress, isPopping }) => (
  <motion.div
    animate={controls}
    className={`absolute z-10 ${className}`}
    initial={{ y: 0, x: initialX }}
  >
    <motion.div
      className="relative"
      animate={{
        y: progress >= 70 && !isPopping ? [-2, -4, -2] : 0,
      }}
      transition={{
        duration: 0.5,
        repeat: progress >= 70 && !isPopping ? Infinity : 0,
      }}
    >
      {/* Toast slice */}
      <div className="w-24 h-32 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-lg shadow-xl relative overflow-hidden border-2 border-amber-500">
        {/* Toast texture */}
        <div className="absolute inset-2 bg-amber-100/40 rounded-md" />

        {/* Brown spots - appear gradually */}
        <motion.div
          className="absolute top-4 left-4 w-2 h-2 bg-amber-800 rounded-full"
          animate={{ opacity: Math.min(progress / 100, 0.7) }}
        />
        <motion.div
          className="absolute top-8 right-6 w-3 h-3 bg-amber-900 rounded-full"
          animate={{ opacity: Math.min(progress / 100, 0.6) }}
        />
        <motion.div
          className="absolute bottom-8 left-6 w-2 h-2 bg-amber-800 rounded-full"
          animate={{ opacity: Math.min(progress / 100, 0.7) }}
        />
        <motion.div
          className="absolute top-12 left-8 w-2 h-2 bg-amber-900 rounded-full"
          animate={{ opacity: Math.min(progress / 100, 0.5) }}
        />
        <motion.div
          className="absolute bottom-4 right-4 w-2 h-2 bg-amber-800 rounded-full"
          animate={{ opacity: Math.min(progress / 100, 0.6) }}
        />

        {/* Shine effect on toast */}
        <div className="absolute top-2 left-2 w-8 h-12 bg-white/30 rounded-full blur-sm" />
      </div>
    </motion.div>
  </motion.div>
);

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isPopping, setIsPopping] = useState(false);
  const [showSteam, setShowSteam] = useState(false);
  const [showPlate, setShowPlate] = useState(false);
  const [firstToastLanded, setFirstToastLanded] = useState(false);
  const [secondToastFlying, setSecondToastFlying] = useState(false);
  const audioContextRef = useRef(null);
  const sizzleOscillatorRef = useRef(null);
  const toast1Controls = useAnimation();
  const toast2Controls = useAnimation();
  const toasterControls = useAnimation();
  const plateControls = useAnimation();
  const screenToastControls = useAnimation();

  // Initialize Web Audio Context for sound effects
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play sizzling sound (continuous)
  const playSizzleSound = () => {
    if (!audioContextRef.current || sizzleOscillatorRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'pink';
    oscillator.frequency.setValueAtTime(80, ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.02, ctx.currentTime);

    oscillator.start(ctx.currentTime);
    sizzleOscillatorRef.current = { oscillator, gainNode };
  };

  // Stop sizzling sound
  const stopSizzleSound = () => {
    if (sizzleOscillatorRef.current) {
      sizzleOscillatorRef.current.gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContextRef.current.currentTime + 0.3
      );
      sizzleOscillatorRef.current.oscillator.stop(audioContextRef.current.currentTime + 0.3);
      sizzleOscillatorRef.current = null;
    }
  };

  // Play toaster "ding" sound
  const playDingSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  // Play pop sound
  const playPopSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  };

  // Play plate ding sound
  const playPlateDingSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  };

  // Play splat sound
  const playSplatSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
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
            stopSizzleSound();
            playDingSound();
            setShowPlate(true);

            // Slide in plate
            plateControls.start({
              x: 0,
              opacity: 1,
              transition: { duration: 0.4, ease: 'easeOut' }
            });

            // Shake toaster
            toasterControls.start({
              x: [-2, 2, -2, 2, 0],
              transition: { duration: 0.3 }
            });

            // First toast pops out and lands on plate
            setTimeout(() => {
              playPopSound();
              toast1Controls.start({
                y: -100,
                x: -280,
                rotate: [0, -15, -10],
                transition: {
                  type: 'spring',
                  stiffness: 150,
                  damping: 12,
                  duration: 0.8
                }
              }).then(() => {
                setFirstToastLanded(true);
                playPlateDingSound();

                // Second toast pops out and flies at camera
                setTimeout(() => {
                  playPopSound();
                  setSecondToastFlying(true);

                  toast2Controls.start({
                    y: -80,
                    x: 0,
                    rotate: [0, 5, 0],
                    scale: 1.1,
                    transition: {
                      type: 'spring',
                      stiffness: 180,
                      damping: 15,
                      duration: 0.5
                    }
                  }).then(() => {
                    // Toast flies at camera and fills screen
                    setTimeout(() => {
                      playSplatSound();
                      screenToastControls.start({
                        scale: 20,
                        opacity: 1,
                        transition: { duration: 0.6, ease: 'easeIn' }
                      }).then(() => {
                        // Transition to app
                        setTimeout(() => {
                          if (typeof onLoadingComplete === 'function') {
                            onLoadingComplete();
                          }
                        }, 300);
                      });
                    }, 200);
                  });
                }, 400);
              });
            }, 100);
          }

          return 100;
        }

        const newProgress = Math.min(oldProgress + LOADING_SCREEN_INCREMENT, 100);

        // Play tick sound at certain intervals
        if (Math.floor(newProgress) % 20 === 0 && Math.floor(oldProgress) % 20 !== 0) {
          playTickSound();
        }

        // Start sizzling at 20%
        if (newProgress >= 20 && !sizzleOscillatorRef.current) {
          playSizzleSound();
        }

        // Start showing steam at 50%
        if (newProgress >= 50 && !showSteam) {
          setShowSteam(true);
        }

        return newProgress;
      });
    }, LOADING_SCREEN_INTERVAL);

    return () => {
      clearInterval(timer);
      stopSizzleSound();
    };
  }, [onLoadingComplete, isPopping, showSteam, toast1Controls, toast2Controls, toasterControls, plateControls, screenToastControls]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary animate-gradient-xy overflow-hidden">
      {/* Plate */}
      {showPlate && (
        <motion.div
          animate={plateControls}
          initial={{ x: -100, opacity: 0 }}
          className="absolute left-20 bottom-32 z-0"
        >
          <div className="relative">
            {/* Plate */}
            <div className="w-40 h-6 bg-gradient-to-b from-gray-100 to-gray-200 rounded-full shadow-2xl border-4 border-gray-300">
              <div className="absolute inset-2 bg-white/50 rounded-full" />
            </div>
            {/* Plate shadow */}
            <div className="absolute -bottom-2 left-4 right-4 h-3 bg-black/20 rounded-full blur-md" />
          </div>
        </motion.div>
      )}

      {/* Screen-filling toast for transition */}
      {secondToastFlying && (
        <motion.div
          animate={screenToastControls}
          initial={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
        >
          <div className="w-96 h-[500px] bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-3xl shadow-2xl relative overflow-hidden border-8 border-amber-500">
            {/* Toast texture */}
            <div className="absolute inset-8 bg-amber-100/40 rounded-2xl" />

            {/* Brown spots */}
            <div className="absolute top-16 left-16 w-8 h-8 bg-amber-800 rounded-full opacity-70" />
            <div className="absolute top-32 right-24 w-12 h-12 bg-amber-900 rounded-full opacity-60" />
            <div className="absolute bottom-32 left-24 w-8 h-8 bg-amber-800 rounded-full opacity-70" />
            <div className="absolute top-48 left-32 w-8 h-8 bg-amber-900 rounded-full opacity-50" />
            <div className="absolute bottom-16 right-16 w-8 h-8 bg-amber-800 rounded-full opacity-60" />

            {/* Shine effect */}
            <div className="absolute top-8 left-8 w-32 h-48 bg-white/30 rounded-full blur-lg" />
          </div>
        </motion.div>
      )}

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
              <SteamParticle delay={0} x={-20} />
              <SteamParticle delay={0.3} x={-10} />
              <SteamParticle delay={0.6} x={0} />
              <SteamParticle delay={0.9} x={10} />
              <SteamParticle delay={1.2} x={20} />
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

              {/* Toaster slots - wider for 2 toasts */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <div className="w-14 h-6 bg-gray-950 rounded-t-lg border-2 border-gray-900" />
                <div className="w-14 h-6 bg-gray-950 rounded-t-lg border-2 border-gray-900" />
              </div>

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

            {/* Two Toast slices */}
            <Toast controls={toast1Controls} className="top-8 left-[20%]" initialX={-15} progress={progress} isPopping={isPopping} />
            <Toast controls={toast2Controls} className="top-8 left-[20%]" initialX={15} progress={progress} isPopping={isPopping} />
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: secondToastFlying ? 0 : 1,
            y: 0
          }}
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

        {/* Sparkles when first toast lands */}
        {firstToastLanded && !secondToastFlying && (
          <div className="absolute left-20 bottom-32 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  x: Math.cos((i / 8) * Math.PI * 2) * 50,
                  y: Math.sin((i / 8) * Math.PI * 2) * 50,
                }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
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
