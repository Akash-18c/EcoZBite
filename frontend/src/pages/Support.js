import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Headphones, 
  Mail, 
  MessageCircle, 
  Clock, 
  HelpCircle,
  FileText,
  Shield,
  Phone,
  CheckCircle,
  AlertCircle,
  Search,
  User
} from 'lucide-react';
import Layout from '../components/Layout';

const Support = () => {
  const supportChannels = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Support",
      description: "Send us a detailed message about your issue",
      contact: "support@ecozbite.com",
      responseTime: "24-48 hours",
      color: "blue",
      action: "mailto:support@ecozbite.com"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Contact Form",
      description: "Fill out our contact form for personalized assistance",
      contact: "Online Form",
      responseTime: "24-48 hours",
      color: "green",
      action: "/contact"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Phone Support",
      description: "Call us for urgent issues and immediate assistance",
      contact: "+91 9907737323",
      responseTime: "Mon-Sat, 9 AM - 6 PM",
      color: "purple",
      action: "tel:+919907737323"
    }
  ];

  const commonIssues = [
    {
      icon: <User className="w-6 h-6" />,
      title: "Account Login Issues",
      description: "Problems signing in, forgotten passwords, or account verification",
      solutions: ["Reset your password", "Check email verification", "Clear browser cache"]
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Order Tracking",
      description: "Unable to find or track your orders",
      solutions: ["Check 'My Orders' section", "Verify order confirmation email", "Contact the store directly"]
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Discount Verification",
      description: "Questions about product discounts and pricing",
      solutions: ["Check product expiry dates", "Compare with original prices", "Contact store for clarification"]
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Technical Errors",
      description: "Website not loading, payment failures, or app crashes",
      solutions: ["Refresh the page", "Try a different browser", "Check internet connection"]
    }
  ];

  const quickLinks = [
    { title: "Help Center", path: "/help", icon: <HelpCircle className="w-5 h-5" /> },
    { title: "FAQ", path: "/faq", icon: <MessageCircle className="w-5 h-5" /> },
    { title: "Privacy Policy", path: "/privacy", icon: <Shield className="w-5 h-5" /> },
    { title: "Terms of Service", path: "/terms", icon: <FileText className="w-5 h-5" /> }
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
                <Headphones className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              We're Here to Help You
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about EcoZBite? Our support team is ready to make your green shopping experience smoother and more enjoyable.
            </p>
          </motion.div>

          {/* Support Channels */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {supportChannels.map((channel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1 hover:border-green-200"
              >
                <div className={`text-${channel.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                  {channel.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {channel.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {channel.description}
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700">Contact:</span>
                    <span className="ml-2 text-gray-600">{channel.contact}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{channel.responseTime}</span>
                  </div>
                </div>
                <a
                  href={channel.action}
                  className={`inline-flex items-center px-6 py-3 bg-${channel.color}-600 text-white rounded-lg hover:bg-${channel.color}-700 transition-colors font-medium`}
                >
                  Get Support
                </a>
              </motion.div>
            ))}
          </div>

          {/* Response Time Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 mb-12"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Response Times
              </h2>
              <p className="text-gray-700 mb-6">
                We're committed to providing timely support. Here's what you can expect:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">24-48h</div>
                  <div className="text-sm text-gray-600">Email & Form Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">Mon-Sat</div>
                  <div className="text-sm text-gray-600">Phone Support Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">9AM-6PM</div>
                  <div className="text-sm text-gray-600">Business Hours (IST)</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Common Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Common Issues & Quick Solutions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {commonIssues.map((issue, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="text-green-600 mr-4">
                      {issue.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Quick Solutions:</h4>
                    <ul className="space-y-1">
                      {issue.solutions.map((solution, solutionIndex) => (
                        <li key={solutionIndex} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Helpful Resources
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
                >
                  <div className="text-green-600 mr-3 group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-green-700">
                    {link.title}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Closing Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12 bg-gray-900 text-white rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              EcoZBite's support team is always ready to make your green shopping experience smoother. 
              Don't hesitate to reach out – we're here to help you save money while saving the planet! 🌱
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@ecozbite.com"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Us Now
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Form
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Support;