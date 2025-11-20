import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertTriangle, Scale, Mail, Calendar } from 'lucide-react';
import Layout from '../components/Layout';

const TermsOfService = () => {
  const sections = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using EcoZBite, you accept and agree to be bound by the terms and provision of this agreement.",
        "These Terms of Service constitute a legally binding agreement between you and EcoZBite.",
        "If you do not agree to abide by the above, please do not use this service.",
        "We reserve the right to update these terms at any time, and your continued use constitutes acceptance of any changes.",
        "You must be at least 18 years old or have parental consent to use our services.",
        "By creating an account, you represent that all information provided is accurate and complete."
      ]
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "User Responsibilities",
      content: [
        "Provide accurate and truthful information when creating your account and placing orders.",
        "Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access.",
        "Use the platform only for lawful purposes and in accordance with these Terms of Service.",
        "Respect the intellectual property rights of EcoZBite and other users.",
        "Do not attempt to interfere with the proper functioning of the platform or bypass security measures.",
        "Follow all applicable local, state, and federal laws when using our services."
      ]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Purchases and Offers",
      content: [
        "EcoZBite acts as a platform connecting customers with third-party stores and does not directly sell products.",
        "All product listings, prices, and availability are provided by individual store partners.",
        "We do not handle payments directly; transactions are processed through secure third-party payment providers.",
        "Product prices and discounts are determined by individual stores and may change without notice.",
        "We strive to ensure accuracy of product information but cannot guarantee completeness or real-time updates.",
        "Orders are subject to store acceptance and product availability at the time of purchase."
      ]
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Refunds & Returns",
      content: [
        "Refund and return policies are determined by individual store partners, not by EcoZBite.",
        "Each store may have different policies regarding returns, exchanges, and refunds.",
        "Customers should review store-specific policies before making purchases.",
        "EcoZBite may assist in facilitating communication between customers and stores for dispute resolution.",
        "For perishable items, returns may be limited due to health and safety regulations.",
        "Any disputes regarding product quality or delivery should be addressed directly with the store partner."
      ]
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Prohibited Activities",
      content: [
        "Creating fake accounts or providing false information during registration or transactions.",
        "Attempting to hack, disrupt, or compromise the security of our platform or user accounts.",
        "Posting false reviews, ratings, or misleading information about products or stores.",
        "Using automated systems, bots, or scripts to access or interact with our platform.",
        "Engaging in any form of harassment, abuse, or inappropriate behavior toward other users or staff.",
        "Violating any applicable laws or regulations while using our services."
      ]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Intellectual Property",
      content: [
        "All content, features, and functionality on EcoZBite are owned by us and protected by copyright and trademark laws.",
        "The EcoZBite name, logo, and branding are registered trademarks and may not be used without permission.",
        "Users may not copy, modify, distribute, or create derivative works from our platform content.",
        "Product images and descriptions are provided by store partners and remain their intellectual property.",
        "User-generated content (reviews, comments) remains the property of the user but grants us license to use it.",
        "We respect the intellectual property rights of others and expect users to do the same."
      ]
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Limitation of Liability",
      content: [
        "EcoZBite is not responsible for the quality, safety, or legality of products offered by store partners.",
        "We do not guarantee the accuracy of product information, prices, or availability displayed on our platform.",
        "Our liability is limited to the maximum extent permitted by law for any damages arising from platform use.",
        "We are not liable for any indirect, incidental, special, or consequential damages.",
        "Store partners are independent businesses responsible for their own products, services, and customer interactions.",
        "Users assume all risks associated with purchasing and consuming products from store partners."
      ]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Updates to Terms",
      content: [
        "We reserve the right to modify these Terms of Service at any time to reflect changes in our services or legal requirements.",
        "Material changes will be communicated to users through email notifications or prominent platform notices.",
        "Continued use of EcoZBite after changes constitutes acceptance of the updated terms.",
        "Users are encouraged to review these terms periodically to stay informed of any updates.",
        "If you disagree with any changes, you may discontinue use of our services.",
        "The most current version of these terms will always be available on our website."
      ]
    }
  ];

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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Please read these terms carefully before using EcoZBite. These terms govern your use of our platform and services.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              Last updated: January 2025
            </div>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to EcoZBite</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              EcoZBite is a platform that connects environmentally conscious consumers with local stores offering 
              discounted products to reduce food waste. These Terms of Service ("Terms") govern your access to and 
              use of EcoZBite's website, mobile application, and related services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our services, you agree to these Terms. Please read them carefully. If you don't agree with 
              any part of these Terms, you may not use our services.
            </p>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:border-green-200"
              >
                <div className="flex items-center mb-6">
                  <div className="text-green-600 mr-4">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                
                <ul className="space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Governing Law */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Service and any separate agreements whereby we provide you services shall be governed by 
              and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Any disputes arising from these terms or your use of EcoZBite will be subject to the exclusive jurisdiction 
              of the courts in West Bengal, India.
            </p>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 mt-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Questions About These Terms?
              </h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about these Terms of Service, please contact us. We're here to help clarify any concerns.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@ecozbite.com"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  support@ecozbite.com
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                >
                  Contact Form
                </a>
              </div>
            </div>
          </motion.div>

          {/* Severability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-8 mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms of Service is found to be unenforceable or invalid, that provision will be 
              limited or eliminated to the minimum extent necessary so that these Terms of Service will otherwise remain in 
              full force and effect and enforceable. The failure of either party to exercise in any respect any right provided 
              for herein shall not be deemed a waiver of any further rights hereunder.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;