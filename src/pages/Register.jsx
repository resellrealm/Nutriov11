import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../services/authService';
import { setCredentials, setOnboardingComplete } from '../store/authSlice';
import { isFirebaseConfigured } from '../config/firebase';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(formData.email, formData.password, formData.name);

      if (result.success) {
        // Store auth data
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('onboardingComplete', 'false');

        // Update Redux
        dispatch(setCredentials({
          user: result.user,
          token: result.token
        }));
        dispatch(setOnboardingComplete(false));

        toast.success('Account created! Let\'s set up your profile.');

        // Navigate to onboarding
        navigate('/onboarding');
      } else {
        toast.error(result.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Join Nutrio
            </h1>
            <p className="text-gray-600 mt-2">Start your nutrition journey today!</p>
          </div>

          {/* Firebase Configuration Warning */}
          {!isFirebaseConfigured && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-amber-800">Firebase Not Configured</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Create a <code className="bg-amber-100 px-1 rounded">.env</code> file based on{' '}
                    <code className="bg-amber-100 px-1 rounded">.env.example</code> with your Firebase credentials.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded text-primary"
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-primary hover:text-primary/80 underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-primary hover:text-primary/80 underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">Terms of Service</h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-700 space-y-4">
                <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <h3 className="font-semibold text-gray-900">1. Acceptance of Terms</h3>
                <p>By accessing and using Nutrio ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>

                <h3 className="font-semibold text-gray-900">2. Description of Service</h3>
                <p>Nutrio provides nutrition tracking, meal planning, and health monitoring services. The App allows users to log food intake, track nutritional information, set health goals, and receive personalized recommendations.</p>

                <h3 className="font-semibold text-gray-900">3. User Accounts</h3>
                <p>To use certain features of the App, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.</p>

                <h3 className="font-semibold text-gray-900">4. User Content and Data</h3>
                <p>You retain ownership of any content you submit to the App. By submitting content, you grant Nutrio a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content for the purpose of providing and improving our services.</p>

                <h3 className="font-semibold text-gray-900">5. Data Collection and Use</h3>
                <p>We collect and process personal data including but not limited to: name, email address, health information, dietary preferences, food logs, weight, height, age, gender, activity levels, and usage data. This data is used to provide personalized nutrition recommendations, improve our services, conduct research and analytics, and for marketing purposes with your consent.</p>

                <h3 className="font-semibold text-gray-900">6. Health Disclaimer</h3>
                <p>The App is not intended to diagnose, treat, cure, or prevent any disease. The nutritional information and recommendations provided are for general informational purposes only and should not be considered medical advice. Always consult with a qualified healthcare provider before making any changes to your diet or health regimen.</p>

                <h3 className="font-semibold text-gray-900">7. Prohibited Conduct</h3>
                <p>You agree not to: (a) use the App for any unlawful purpose; (b) attempt to gain unauthorized access to any portion of the App; (c) interfere with or disrupt the App or servers; (d) upload malicious code; (e) collect user information without consent; (f) impersonate any person or entity.</p>

                <h3 className="font-semibold text-gray-900">8. Intellectual Property</h3>
                <p>The App and its original content, features, and functionality are owned by Nutrio and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>

                <h3 className="font-semibold text-gray-900">9. Third-Party Services</h3>
                <p>The App may contain links to third-party websites or services that are not owned or controlled by Nutrio. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>

                <h3 className="font-semibold text-gray-900">10. Termination</h3>
                <p>We may terminate or suspend your account and access to the App immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the App will immediately cease.</p>

                <h3 className="font-semibold text-gray-900">11. Limitation of Liability</h3>
                <p>In no event shall Nutrio, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the App.</p>

                <h3 className="font-semibold text-gray-900">12. Indemnification</h3>
                <p>You agree to defend, indemnify, and hold harmless Nutrio and its licensees and licensors from any claim or demand made by any third party due to or arising out of your use of the App, violation of these Terms, or violation of any rights of another.</p>

                <h3 className="font-semibold text-gray-900">13. Changes to Terms</h3>
                <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

                <h3 className="font-semibold text-gray-900">14. Governing Law</h3>
                <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Nutrio operates, without regard to its conflict of law provisions.</p>

                <h3 className="font-semibold text-gray-900">15. Contact Us</h3>
                <p>If you have any questions about these Terms, please contact us at support@nutrio.app.</p>
              </div>
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setShowTermsModal(false);
                    setAgreedToTerms(true);
                  }}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  I Accept
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-700 space-y-4">
                <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <h3 className="font-semibold text-gray-900">1. Information We Collect</h3>
                <p><strong>Personal Information:</strong> Name, email address, date of birth, gender, profile photo, and account credentials.</p>
                <p><strong>Health & Nutrition Data:</strong> Height, weight, body measurements, dietary preferences, allergies, food logs, meal photos, calorie intake, macronutrient data, water consumption, and health goals.</p>
                <p><strong>Usage Data:</strong> App interactions, features used, time spent, device information, IP address, browser type, operating system, and crash reports.</p>
                <p><strong>Location Data:</strong> With your permission, we may collect location data to provide location-based features and recommendations.</p>

                <h3 className="font-semibold text-gray-900">2. How We Use Your Information</h3>
                <p>We use your information to: provide and maintain our services; personalize your experience and nutrition recommendations; analyze usage patterns and improve our App; communicate with you about updates, promotions, and support; conduct research and develop new features; comply with legal obligations; and prevent fraud and abuse.</p>

                <h3 className="font-semibold text-gray-900">3. Data Sharing and Disclosure</h3>
                <p>We may share your information with: service providers who assist in operating our App; analytics partners to understand usage patterns; advertising partners for targeted advertising (with consent); business partners for joint offerings; legal authorities when required by law; and in connection with a merger, acquisition, or sale of assets.</p>

                <h3 className="font-semibold text-gray-900">4. Data Retention</h3>
                <p>We retain your personal information for as long as your account is active or as needed to provide services. We may retain certain information for longer periods for legal, tax, or regulatory purposes, or to resolve disputes and enforce agreements.</p>

                <h3 className="font-semibold text-gray-900">5. Data Security</h3>
                <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>

                <h3 className="font-semibold text-gray-900">6. Your Rights</h3>
                <p>Depending on your jurisdiction, you may have rights to: access your personal data; correct inaccurate data; delete your data; restrict processing; data portability; object to processing; and withdraw consent. To exercise these rights, contact us at privacy@nutrio.app.</p>

                <h3 className="font-semibold text-gray-900">7. Cookies and Tracking</h3>
                <p>We use cookies, pixels, and similar technologies to collect usage data, remember preferences, analyze trends, and deliver targeted advertising. You can control cookies through your browser settings.</p>

                <h3 className="font-semibold text-gray-900">8. Third-Party Analytics</h3>
                <p>We use third-party analytics services (such as Google Analytics, Firebase Analytics, Mixpanel) that may collect information about your use of the App. These services have their own privacy policies.</p>

                <h3 className="font-semibold text-gray-900">9. Children's Privacy</h3>
                <p>Our App is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it promptly.</p>

                <h3 className="font-semibold text-gray-900">10. International Data Transfers</h3>
                <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.</p>

                <h3 className="font-semibold text-gray-900">11. Changes to This Policy</h3>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>

                <h3 className="font-semibold text-gray-900">12. Contact Us</h3>
                <p>If you have questions about this Privacy Policy, please contact us at privacy@nutrio.app or write to our Data Protection Officer at the address provided on our website.</p>
              </div>
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setShowPrivacyModal(false);
                    setAgreedToTerms(true);
                  }}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  I Accept
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
