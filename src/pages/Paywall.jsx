import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Crown, Check, X, Sparkles, Zap, Target, TrendingUp,
  BarChart3, Calendar, ShoppingCart, Utensils, Camera,
  Award, Lock, Star, ChevronRight, Shield, Infinity as InfinityIcon, CreditCard,
  Gift, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { setPremiumStatus } from '../store/authSlice';

const Paywall = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      if (formattedValue.replace('/', '').length > 4) return;
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    } else if (field === 'cardName') {
      formattedValue = value.toUpperCase();
    }

    setCardDetails({ ...cardDetails, [field]: formattedValue });
  };

  const validateCard = () => {
    const { cardNumber, cardName, expiryDate, cvv } = cardDetails;

    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
      toast.error('Please enter a valid card number');
      return false;
    }
    if (!cardName || cardName.length < 3) {
      toast.error('Please enter the cardholder name');
      return false;
    }
    if (!expiryDate || expiryDate.length < 5) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }

    return true;
  };

  const handleSubscribe = async () => {
    if (!validateCard()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      toast.success('🎉 Welcome to Nutrio! Your 14-day free trial has started!');

      // TODO: Implement actual payment processing and update user in Firebase
      // For now, just update Redux state
      dispatch(setPremiumStatus(true));

      setIsProcessing(false);

      // Navigate to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }, 2000);
  };

  const handlePromoCode = () => {
    const validCodes = ['ADMIN2024', 'TESTFREE', 'NUTRIOFREE'];

    if (validCodes.includes(promoCode.toUpperCase())) {
      toast.success('🎉 Promo code accepted! You now have full access!');
      dispatch(setPremiumStatus(true));
      setShowPromoModal(false);
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleRestore = () => {
    // TODO: Implement restore purchases
    toast.success('Checking for previous purchases...');
    setTimeout(() => {
      toast.error('No previous purchases found');
      setShowRestoreModal(false);
    }, 1500);
  };

  const premiumFeatures = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: '7 AI Personalized Meals Per Week',
      description: 'Get custom meal recommendations tailored to your goals',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'Unlimited AI Meal Scans',
      description: 'Analyze unlimited meals with photos',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Smart Meal Planner',
      description: 'Plan your entire week with AI-powered suggestions',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: 'Auto Grocery Lists',
      description: 'Generate shopping lists from your meal plans',
      color: 'from-orange-400 to-red-500'
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      title: 'Fridge Scanning',
      description: 'Scan your fridge and get instant recipe suggestions',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Advanced Analytics',
      description: 'Deep insights into your nutrition trends',
      color: 'from-indigo-400 to-purple-500'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Unlock 25 Premium Achievements',
      description: 'Access exclusive achievements and earn more XP',
      color: 'from-pink-400 to-rose-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '1.5x XP Multiplier',
      description: 'Level up faster with permanent XP boost',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Export Your Data',
      description: 'Download all your nutrition data as CSV',
      color: 'from-teal-400 to-cyan-500'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Priority Support',
      description: 'Get help faster with premium support',
      color: 'from-red-400 to-pink-500'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Early Access to Features',
      description: 'Be the first to try new features',
      color: 'from-purple-400 to-indigo-500'
    },
    {
      icon: <InfinityIcon className="w-6 h-6" />,
      title: 'Ad-Free Experience',
      description: 'Enjoy Nutrio without any interruptions',
      color: 'from-green-400 to-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hidden Admin Promo Code Button (Top Left) */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setShowPromoModal(true)}
          className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all opacity-50 hover:opacity-100"
          title="Admin Access"
        >
          <Gift className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Restore Button (Top Right) */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowRestoreModal(true)}
          className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          Restore Purchases
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Crown Icon */}
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Crown className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Try Nutrio <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">FREE</span> for 14 Days
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Get full access to all features for just <span className="font-bold text-gray-900 dark:text-white">$9.99/month</span>
          </p>
          <p className="text-base text-gray-500 dark:text-gray-400">
            Cancel anytime • No commitment required
          </p>
        </motion.div>

        {/* Main Card with Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700"
        >
          {/* Trial Info Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-4 mb-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Start Your Free Trial Today</h3>
                <p className="text-sm text-white/90">
                  Your card won't be charged until after your 14-day free trial ends
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Information
          </h3>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardDetails.cardName}
                onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                placeholder="JOHN DOE"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={cardDetails.expiryDate}
                  onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                  maxLength="5"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength="4"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:scale-100 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-6 h-6" />
                Start My Free Trial
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Free for 14 days, then $9.99/month. Cancel anytime.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Everything Included with Your Subscription
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.03 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-8 mb-6 flex-wrap"
        >
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <InfinityIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Premium Support</span>
          </div>
        </motion.div>

        {/* Legal Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline">
              Terms of Service
            </a>
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            By starting your free trial, you agree to our Terms of Service and Privacy Policy.
            Your subscription will automatically renew at $9.99/month after the 14-day trial unless cancelled.
            You can cancel anytime before the trial ends with no charge.
          </p>
        </motion.div>
      </div>

      {/* Promo Code Modal */}
      <AnimatePresence>
        {showPromoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPromoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin Access
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter your promo code to unlock Premium access.
              </p>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all mb-6"
                onKeyPress={(e) => e.key === 'Enter' && handlePromoCode()}
              />
              <div className="flex gap-4">
                <button
                  onClick={handlePromoCode}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Activate
                </button>
                <button
                  onClick={() => setShowPromoModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Modal */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRestoreModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Restore Purchases
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                If you've previously purchased Nutrio on this device, click below to restore your subscription.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleRestore}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Restore
                </button>
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl transition-colors"
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
