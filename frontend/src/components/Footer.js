import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram, Youtube, Send, CheckCircle, Loader2, Sparkles, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import SuccessModal from './SuccessModal';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { t, currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);

    try {
      console.log('Submitting newsletter subscription:', email);
      
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      console.log('Newsletter response status:', response.status);
      
      const data = await response.json();
      console.log('Newsletter response data:', data);

      if (response.ok && data.success) {
        setEmail('');
        setShowSuccessModal(true);
        toast.success(t('subscriptionSuccess'));
      } else {
        toast.error(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 text-white">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2300ff88\' fill-opacity=\'0.06\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <Logo size="small" showText={false} />
              <span className="text-xl font-semibold bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                EcoZBite
              </span>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed text-sm">
              Connecting people with sustainable food choices. Save money, reduce waste, and make a positive impact on our planet.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Download App
            </motion.button>
          </div>

          {/* Navigation Section */}
          <div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-lg font-semibold mb-4 text-emerald-400"
            >
              {t('navigation')}
            </motion.h3>
            <ul className="space-y-2">
              {[
                { name: t('home'), path: '/' },
                { name: t('products'), path: '/products' },
                { name: t('about'), path: '/about' },
                { name: t('contact'), path: '/contact' },
                { name: t('login'), path: '/auth/login' },
                { name: t('register'), path: '/auth/register' }
              ].map((item, index) => (
                <motion.li 
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-sm block py-1 hover:translate-x-1 transform"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg font-semibold mb-4 text-teal-400"
            >
              {t('resources')}
            </motion.h3>
            <ul className="space-y-2">
              {[
                { name: t('helpCenter'), path: '/help' },
                { name: t('privacyPolicy'), path: '/privacy' },
                { name: t('termsOfService'), path: '/terms' },
                { name: t('support'), path: '/support' },
                { name: t('faq'), path: '/faq' }
              ].map((item, index) => (
                <motion.li 
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="text-gray-300 hover:text-teal-400 transition-all duration-200 text-sm block py-1 hover:translate-x-1 transform hover:bg-teal-900/20 hover:px-2 rounded"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg font-semibold mb-4 text-green-400 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {t('stayConnected')}
            </motion.h3>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-300 text-sm mb-4"
            >
              {t('newsletterDesc')}
            </motion.p>

            <motion.form 
              onSubmit={handleNewsletterSubmit} 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 group-hover:bg-gray-700/90"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubscribing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('subscribing')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('subscribeNow')}</span>
                  </>
                )}
              </motion.button>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-3 text-xs text-gray-400 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>{t('noSpam')}</span>
            </motion.div>
          </div>
        </div>

        {/* Contact & Social Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-700"
        >
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-green-400">{t('contactInfo')}</h4>
            <address className="not-italic space-y-2 text-gray-300 text-sm">
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center space-x-2 hover:text-green-400 transition-all duration-200"
              >
                <MapPin size={16} />
                <span>West Bengal, Barasat, India</span>
              </motion.div>
              <motion.a 
                href="mailto:support@ecozbite.com" 
                whileHover={{ x: 5 }}
                className="flex items-center space-x-2 hover:text-green-400 transition-all duration-200"
              >
                <Mail size={16} />
                <span>support@ecozbite.com</span>
              </motion.a>
              <motion.a 
                href="tel:+919907737323" 
                whileHover={{ x: 5 }}
                className="flex items-center space-x-2 hover:text-green-400 transition-all duration-200"
              >
                <Phone size={16} />
                <span>+91 9907737323</span>
              </motion.a>
            </address>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-green-400">{t('followUs')}</h4>
            <div className="flex space-x-3">
              {[{ icon: Linkedin, href: '#', label: 'LinkedIn' }, { icon: Twitter, href: '#', label: 'Twitter' }, { icon: Instagram, href: '#', label: 'Instagram' }, { icon: Youtube, href: '#', label: 'YouTube' }].map(({ icon: Icon, href, label }, index) => (
                <motion.a
                  key={label}
                  href={href}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-green-400 hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  aria-label={label}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-green-400">{t('contact')}</h4>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/contact"
                className="inline-block text-gray-300 hover:text-green-400 transition-all duration-200 text-sm font-medium py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {t('contactUs')}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0"
        >
          <div className="text-gray-300 text-sm">
            {t('copyright')}
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <select
              aria-label="Select Language"
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-gray-800 text-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-2 focus:ring-green-400 hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Newsletter Subscription Successful! 🎉"
        message="Thank you for subscribing! You'll receive weekly tips on reducing food waste and exclusive recipes. Check your email for a welcome message."
        type="success"
      />
    </footer>
  );
};

export default Footer;
