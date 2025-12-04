import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Crown, Check, Sparkles, Zap, Target, TrendingUp,
  BarChart3, Calendar, ShoppingCart, Utensils, Camera,
  Award, Lock, Star, Shield, Infinity as InfinityIcon,
  Gift, Flame, Trophy, Heart, Users, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { setPremiumStatus } from '../store/authSlice';

const Paywall = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const ADMIN_ACCESS_CODE = 'R9X2LQ7B1V8T3YP';

  // Pricing plans with proper calculations
  const pricingPlans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '7.99',
      billingCycle: 'per month',
      totalPrice: '£7.99',
      pricePerMonth: '7.99',
      savings: null,
      savePercent: null,
      features: ['Cancel anytime', 'All premium features', 'Priority support'],
      popular: false,
      gradient: 'from-blue-500 to-cyan-500',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      id: '6month',
      name: '6-Month',
      price: '39.99',
      billingCycle: 'every 6 months',
      totalPrice: '£39.99',
      pricePerMonth: '6.67',
      savings: '£9.99',
      savePercent: '17%',
      features: ['Save £9.99', 'All premium features', 'Priority support'],
      popular: false,
      gradient: 'from-purple-500 to-pink-500',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '59.99',
      billingCycle: 'per year',
      totalPrice: '£59.99',
      pricePerMonth: '5.00',
      savings: '£35.89',
      savePercent: '37%',
      features: ['Save £35.89', 'Best value', 'All premium features', 'Priority support'],
      popular: true,
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      icon: <Crown className="w-6 h-6" />
    }
  ];

  const handleAdminCode = () => {
    if (adminCode.trim() === ADMIN_ACCESS_CODE) {
      toast.success('✨ Admin access code accepted! Redirecting...');
      setShowAdminModal(false);
      // Store admin flag in session
      sessionStorage.setItem('adminAccess', 'true');
      setTimeout(() => {
        // Redirect to register page where they can create account
        navigate('/register');
      }, 1000);
    } else {
      toast.error('Invalid access code');
    }
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    const plan = pricingPlans.find(p => p.id === planId);
    toast.success(`${plan.name} plan selected! 🎉`, { duration: 2000 });

    // For now, just grant premium since payment isn't integrated
    setTimeout(() => {
      dispatch(setPremiumStatus(true));
      toast.success('Welcome to Nutrio Premium!');
      navigate('/dashboard');
    }, 1500);
  };

  const premiumFeatures = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: '7 AI Personalized Meals Per Week',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: '20 Food Scans Per Day',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Smart Meal Planner',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      title: 'Auto Grocery Lists',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: <Utensils className="w-5 h-5" />,
      title: 'Fridge Scanning with AI',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Advanced Analytics',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: '25 Premium Achievements',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: '1.5x XP Multiplier',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Data Export as CSV',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Priority Support',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: 'Early Access to Features',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: <InfinityIcon className="w-5 h-5" />,
      title: 'Ad-Free Experience',
      gradient: 'from-green-500 to-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hidden Admin Access Button (Top Left) */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setShowAdminModal(true)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all opacity-30 hover:opacity-100 backdrop-blur-sm border border-white/10"
          title="Admin Access"
        >
          <Lock className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Animated Crown Icon */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/50 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
              <Crown className="w-12 h-12 text-white relative z-10" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Unlock Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 animate-pulse">
              Premium
            </span>
            {' '}Journey
          </h1>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of users achieving their nutrition goals with AI-powered insights
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 border-2 border-slate-900 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-300 font-medium">10,000+ active users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-300 font-medium">4.9/5 rating</span>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`relative ${plan.popular ? 'md:scale-105 md:z-10' : ''}`}
            >
              {/* Most Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1"
                  >
                    <Flame className="w-4 h-4" />
                    MOST POPULAR
                  </motion.div>
                </div>
              )}

              <div className={`relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.popular
                  ? 'border-amber-500 shadow-xl shadow-amber-500/20'
                  : 'border-white/20 hover:border-white/40'
              }`}>
                {/* Plan Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    {plan.savePercent && (
                      <span className="text-green-400 text-sm font-semibold">Save {plan.savePercent}</span>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-black text-white">£{plan.pricePerMonth}</span>
                    <span className="text-gray-400 text-lg">/month</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {plan.totalPrice} {plan.billingCycle}
                  </p>
                  {plan.savings && (
                    <p className="text-green-400 text-sm font-semibold mt-1">
                      💰 Save {plan.savings}
                    </p>
                  )}
                </div>

                {/* Free Trial Badge */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-semibold">14-day free trial included</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    plan.popular
                      ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-2xl hover:shadow-orange-500/50`
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {plan.popular ? '🚀 Get Started' : 'Choose Plan'}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-400 text-lg">Unlock all premium features with any plan</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <p className="text-white text-sm font-medium leading-tight">{feature.title}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-center gap-8 flex-wrap mb-8"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <InfinityIcon className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Heart className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-medium">30-Day Money Back</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">10,000+ Happy Users</span>
          </div>
        </motion.div>

        {/* Legal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-gray-500 text-xs max-w-2xl mx-auto">
            By starting your free trial, you agree to our Terms of Service and Privacy Policy.
            Your subscription will automatically renew after the 14-day trial unless cancelled.
            Cancel anytime with no questions asked.
          </p>
        </motion.div>
      </div>

      {/* Admin Access Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAdminModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Admin Access</h3>
                  <p className="text-gray-400 text-sm">Enter your access code</p>
                </div>
              </div>

              {/* Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Code
                </label>
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter access code"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono tracking-wider uppercase"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminCode()}
                  autoFocus
                />
              </div>

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
                <p className="text-blue-300 text-xs flex items-start gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>This code grants free premium access. You'll be redirected to create or login to your account.</span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAdminCode}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Unlock Access
                </button>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3 px-6 rounded-xl transition-all border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Paywall;
