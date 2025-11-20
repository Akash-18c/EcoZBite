import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Leaf,
  ShoppingCart,
  DollarSign,
  Globe,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Heart,
  Zap,
  Shield
} from 'lucide-react';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import LocationMap from '../components/LocationMap';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: t('saveMoney'),
      description: t('saveMoneyDesc')
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: t('reduceWaste'),
      description: t('reduceWasteDesc')
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: t('easyShopping'),
      description: t('easyShoppingDesc')
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t('makeImpact'),
      description: t('makeImpactDesc')
    }
  ];

  const stats = [
    { number: "50K+", label: t('productsSaved'), icon: <Leaf className="w-6 h-6" /> },
    { number: "10K+", label: t('happyUsers'), icon: <Users className="w-6 h-6" /> },
    { number: "500+", label: t('partnerStores'), icon: <ShoppingCart className="w-6 h-6" /> },
    { number: "₹15Cr+", label: t('moneySaved'), icon: <span className="text-2xl font-bold">₹</span> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Customer",
      content: "EcoZBite has saved me hundreds of dollars while helping the environment. It's a win-win!",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Mike Chen",
      role: "Store Manager",
      content: "Our food waste reduced by 70% since joining EcoZBite. Amazing platform!",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Emma Davis",
      role: "Eco Enthusiast",
      content: "Finally, a way to shop sustainably without breaking the bank. Love it!",
      rating: 5,
      avatar: "👩‍🌾"
    }
  ];

  return (
    <>
      <Helmet>
        <title>EcoZBite - Save Food, Save Money, Save Planet 🌱</title>
        <meta name="description" content="Connect with supermarkets to get discounted products before they expire. Join the fight against food waste and save money while protecting the environment." />
        <meta name="keywords" content="food waste, discount, supermarket, sustainability, eco-friendly, save money, environment" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="cursor-pointer"
                >
                  <Logo size="medium" showText={true} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/auth/register"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {t('signUp')}
                </Link>
              </motion.div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-green-100 via-purple-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Join the Food Waste Revolution
                  </motion.div>
                  
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    {t('heroTitle')}
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {t('heroSubtitle')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/auth/register"
                    className="group px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {t('startSaving')}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/auth/login"
                    className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300 flex items-center justify-center"
                  >
                    {t('storeOwner')}
                  </Link>
                </div>

                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {['👩‍💼', '👨‍💼', '👩‍🌾', '👨‍🍳'].map((emoji, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                          className="w-10 h-10 bg-white rounded-full border-2 border-white flex items-center justify-center text-lg shadow-md"
                        >
                          {emoji}
                        </motion.div>
                      ))}
                    </div>
                    <span className="ml-3 text-sm text-gray-600">
                      {t('joinUsers')}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                {/* Dashboard-style Map Component */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <LocationMap />
                </div>
                
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl shadow-lg"
                >
                  🗺️
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-xl shadow-lg"
                >
                  📍
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4 text-green-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {t('whyChoose')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('whyChooseSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {t('howItWorks')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('howItWorksSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  title: t('step1Title'),
                  description: t('step1Desc'),
                  icon: "👤"
                },
                {
                  step: "02",
                  title: t('step2Title'),
                  description: t('step2Desc'),
                  icon: "🔍"
                },
                {
                  step: "03",
                  title: t('step3Title'),
                  description: t('step3Desc'),
                  icon: "💰"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  <div className="text-6xl mb-6">{step.icon}</div>
                  <div className="text-green-600 text-lg font-bold mb-2">STEP {step.step}</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 -right-6 text-green-600">
                      <ArrowRight className="w-8 h-8" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {t('testimonials')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('testimonialsSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>



        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                {t('readyToMakeDifference')}
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                {t('ctaSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth/register"
                  className="group px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center font-semibold"
                >
                  {t('startJourney')}
                  <Heart className="w-5 h-5 ml-2 group-hover:text-red-500 transition-colors" />
                </Link>
                
                <Link
                  to="/auth/login"
                  className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300 flex items-center justify-center font-semibold"
                >
                  {t('signIn')}
                </Link>
              </div>
              
              <div className="mt-8 flex items-center justify-center space-x-8 text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  {t('freeToJoin')}
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  {t('secureTrusted')}
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-green-600" />
                  {t('instantSavings')}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        {/* Footer Component */}
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
