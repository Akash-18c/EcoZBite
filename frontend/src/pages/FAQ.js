import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, Search, Mail } from 'lucide-react';
import Layout from '../components/Layout';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is EcoZBite?",
          answer: "EcoZBite is an online platform that helps users discover and compare eco-friendly products and deals across multiple stores. We connect environmentally conscious consumers with local stores offering discounted products to reduce food waste and promote sustainable shopping."
        },
        {
          question: "How do I create an EcoZBite account?",
          answer: "Creating an account is simple! Go to the Sign-Up page, enter your email address, create a secure password, and verify your account via the email we send you. Once verified, you can start browsing deals and making purchases immediately."
        },
        {
          question: "Is EcoZBite free to use?",
          answer: "Yes, using EcoZBite to browse and compare products is completely free. There are no membership fees or hidden charges. You only pay for the products you purchase from our partner stores."
        }
      ]
    },
    {
      category: "Orders & Shopping",
      questions: [
        {
          question: "How can I track my order?",
          answer: "After placing an order, log into your account and go to the 'My Orders' section to view your order status and delivery details. You'll also receive email updates about your order progress, including confirmation, preparation, and pickup/delivery notifications."
        },
        {
          question: "Can I cancel or modify my order?",
          answer: "You can cancel orders within 2 minutes of placing them through your account dashboard. After this window, cancellations depend on the store's policy and order status. For modifications, please contact the store directly as soon as possible."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept various payment methods including credit/debit cards, digital wallets (UPI, Paytm, PhonePe), and cash on delivery (where available). All payments are processed securely through our trusted payment partners."
        }
      ]
    },
    {
      category: "Discounts & Pricing",
      questions: [
        {
          question: "Do you offer verified discounts?",
          answer: "Yes, all deals shown on EcoZBite are verified directly from store data and updated in real-time. Our platform displays current prices, discount percentages, and expiry dates to ensure you get accurate information for making informed purchasing decisions."
        },
        {
          question: "How do discounts work on EcoZBite?",
          answer: "Discounts are primarily based on product expiry dates. Stores offer increasing discounts as products approach their expiry dates to reduce food waste. You can see the original price, discounted price, and percentage savings for each product."
        },
        {
          question: "Can I compare prices between different stores?",
          answer: "Absolutely! EcoZBite's price comparison feature shows you how different stores price similar products, helping you find the best deals. You can see which store offers the highest discount and make informed decisions about where to shop."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          question: "What if I forget my password?",
          answer: "Click 'Forgot Password' on the login page and enter your email address. We'll send you a secure reset link. Follow the instructions in the email to create a new password. If you don't receive the email, check your spam folder or contact support."
        },
        {
          question: "Are my personal details safe?",
          answer: "Yes, we take data security seriously. We use secure encryption protocols to protect your personal information and never share your data with unauthorized parties. Our privacy policy details how we collect, use, and protect your information."
        },
        {
          question: "How do I update my profile information?",
          answer: "Log into your account and go to the 'Profile' or 'Account Settings' section. Here you can update your personal information, delivery addresses, notification preferences, and other account details."
        }
      ]
    },
    {
      category: "Store Partners",
      questions: [
        {
          question: "Can I become a partner store?",
          answer: "Yes! We welcome eco-conscious stores to join our platform. Visit the 'Partner With Us' section on our website to learn about requirements and apply. We look for stores committed to reducing food waste and offering quality products."
        },
        {
          question: "How do stores set their prices and discounts?",
          answer: "Partner stores have full control over their pricing and discount strategies. They can set original prices, apply discounts based on expiry dates, and adjust pricing in real-time. EcoZBite displays this information transparently to customers."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "The website isn't loading properly. What should I do?",
          answer: "Try refreshing the page, clearing your browser cache, or using a different browser. Check your internet connection and disable any ad blockers that might interfere. If problems persist, contact our technical support team."
        },
        {
          question: "How do I contact support?",
          answer: "You can reach our support team through multiple channels: email us at support@ecozbite.com, use the Contact Us page on our website, or call us during business hours. We typically respond to emails within 24-48 hours."
        }
      ]
    },
    {
      category: "Sustainability",
      questions: [
        {
          question: "What makes EcoZBite eco-friendly?",
          answer: "EcoZBite promotes sustainability by connecting consumers with discounted products that might otherwise go to waste, supporting local eco-conscious businesses, encouraging conscious shopping habits, and providing education about sustainable practices."
        },
        {
          question: "How does EcoZBite help reduce food waste?",
          answer: "We help reduce food waste by making it easy for consumers to find and purchase products approaching their expiry dates at discounted prices. This prevents perfectly good food from being thrown away while saving customers money."
        }
      ]
    }
  ];

  // Filter FAQs based on search term
  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about EcoZBite. Can't find what you're looking for? Contact our support team!
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
          </motion.div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredFaqs.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + categoryIndex * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-purple-200"
              >
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">{category.category}</h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {category.questions.map((faq, questionIndex) => {
                    const itemKey = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openItems[itemKey];
                    
                    return (
                      <div key={questionIndex}>
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 pr-4">
                              {faq.question}
                            </h3>
                            <div className="flex-shrink-0">
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-purple-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-4">
                                <p className="text-gray-700 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {searchTerm && filteredFaqs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any FAQs matching "{searchTerm}". Try different keywords or contact support.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear Search
              </button>
            </motion.div>
          )}

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-8 mt-12"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still Have Questions?
              </h2>
              <p className="text-gray-700 mb-6">
                Can't find the answer you're looking for? Our friendly support team is here to help!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@ecozbite.com"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Support
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-colors font-medium"
                >
                  Contact Form
                </a>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mt-8"
          >
            <div className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">24-48h</div>
              <div className="text-sm text-gray-600">Average Response Time</div>
            </div>
            <div className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">FAQ Availability</div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;