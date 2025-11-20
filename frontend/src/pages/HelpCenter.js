import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  User, 
  ShoppingCart, 
  Leaf, 
  Mail,
  ArrowRight,
  Phone,
  MessageCircle
} from 'lucide-react';
import Layout from '../components/Layout';

const HelpCenter = () => {
  const helpSections = [
    {
      icon: <User className="w-8 h-8" />,
      title: "Getting Started",
      description: "Learn how to sign up, browse eco products, and compare offers",
      items: [
        "Create your free EcoZBite account",
        "Verify your email address",
        "Set up your profile and preferences",
        "Browse sustainable products near you",
        "Compare prices across different stores",
        "Understand discount and expiry information"
      ]
    },
    {
      icon: <User className="w-8 h-8" />,
      title: "Account Management",
      description: "Steps to update profiles, reset passwords, and manage preferences",
      items: [
        "Update your personal information",
        "Change your password securely",
        "Reset forgotten passwords",
        "Manage notification preferences",
        "Update delivery addresses",
        "Delete your account if needed"
      ]
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Orders & Delivery",
      description: "How to track orders, view delivery timelines, and return products",
      items: [
        "Place orders from verified stores",
        "Track your order status in real-time",
        "Understand pickup and delivery options",
        "View order history and receipts",
        "Handle returns and refunds",
        "Contact stores directly for issues"
      ]
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "EcoZBite Tips",
      description: "Tips for sustainable shopping and using verified eco stores",
      items: [
        "Maximize savings with expiry-based discounts",
        "Plan meals around available discounted items",
        "Understand product freshness indicators",
        "Support local sustainable businesses",
        "Reduce food waste in your household",
        "Share eco-friendly practices with friends"
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Welcome to the EcoZBite Help Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find answers to your questions and learn how to make the most of your sustainable shopping experience with EcoZBite.
            </p>
          </motion.div>

          {/* Help Sections */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {helpSections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-green-200"
              >
                <div className="flex items-center mb-6">
                  <div className="text-green-600 mr-4">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <ArrowRight className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Contact Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still Need Help?
              </h2>
              <p className="text-gray-600">
                Can't find what you're looking for? Our support team is here to help you with any questions or issues.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/contact"
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-center group block border border-gray-100 hover:border-green-200"
                >
                  <Mail className="w-8 h-8 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Form</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Send us a detailed message about your issue
                  </p>
                  <span className="text-green-600 text-sm font-medium">
                    Go to Contact Us →
                  </span>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="mailto:support@ecozbite.com"
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-center group block border border-gray-100 hover:border-blue-200"
                >
                  <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    support@ecozbite.com
                  </p>
                  <span className="text-blue-600 text-sm font-medium">
                    Send Email →
                  </span>
                </a>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/faq"
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-center group block border border-gray-100 hover:border-purple-200"
                >
                  <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Check our frequently asked questions
                  </p>
                  <span className="text-purple-600 text-sm font-medium">
                    View FAQ →
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Quick Tips for New Users
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Verify Your Email",
                  description: "Complete email verification to access all features",
                  icon: "✉️"
                },
                {
                  title: "Set Location",
                  description: "Enable location to find stores near you",
                  icon: "📍"
                },
                {
                  title: "Check Expiry Dates",
                  description: "Products are discounted based on expiry dates",
                  icon: "📅"
                },
                {
                  title: "Compare Prices",
                  description: "Use our price comparison to get the best deals",
                  icon: "💰"
                }
              ].map((tip, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-3">{tip.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenter;