import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Users, Mail, Calendar } from 'lucide-react';
import Layout from '../components/Layout';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Information We Collect",
      content: [
        "Personal Information: Name, email address, phone number, and delivery address when you create an account",
        "Device Information: IP address, browser type, device type, and operating system for security and optimization",
        "Usage Data: Pages visited, time spent on site, and interaction patterns to improve user experience",
        "Location Data: Approximate location to show nearby stores and relevant offers (with your permission)",
        "Transaction Data: Order history, payment preferences, and purchase patterns for better recommendations",
        "Communication Data: Messages sent through our contact forms and customer support interactions"
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: [
        "Account Management: To create and maintain your EcoZBite account and verify your identity",
        "Service Delivery: To process orders, send notifications, and provide customer support",
        "Personalization: To recommend eco-friendly products and stores based on your preferences and location",
        "Communication: To send important updates, promotional offers, and sustainability tips (with your consent)",
        "Analytics: To analyze usage patterns and improve our platform's functionality and user experience",
        "Legal Compliance: To comply with applicable laws, regulations, and legal processes"
      ]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Protection & Security",
      content: [
        "Encryption: All sensitive data is encrypted using industry-standard SSL/TLS protocols during transmission",
        "Secure Storage: Personal information is stored on secure servers with restricted access and regular security audits",
        "Access Control: Only authorized personnel have access to your data, and access is logged and monitored",
        "Regular Updates: We regularly update our security measures to protect against new threats and vulnerabilities",
        "Data Minimization: We only collect and retain data that is necessary for providing our services",
        "Incident Response: We have procedures in place to quickly respond to and mitigate any security incidents"
      ]
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Cookies & Tracking Technologies",
      content: [
        "Essential Cookies: Required for basic site functionality, user authentication, and security features",
        "Analytics Cookies: Help us understand how users interact with our site to improve performance and user experience",
        "Preference Cookies: Remember your settings and preferences to provide a personalized experience",
        "Marketing Cookies: Used to show relevant advertisements and measure the effectiveness of our marketing campaigns",
        "Third-Party Cookies: Some cookies are set by third-party services we use for analytics and advertising",
        "Cookie Control: You can manage cookie preferences through your browser settings or our cookie preference center"
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Third-Party Services & Data Sharing",
      content: [
        "Payment Processors: We work with secure payment providers to process transactions safely",
        "Delivery Partners: Order information is shared with delivery services to fulfill your purchases",
        "Analytics Providers: We use services like Google Analytics to understand user behavior and improve our platform",
        "Email Services: Marketing and transactional emails are sent through trusted email service providers",
        "Store Partners: Basic order information is shared with partner stores to fulfill your purchases",
        "Legal Requirements: We may share data when required by law, court order, or to protect our legal rights"
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Your Rights & Data Control",
      content: [
        "Access Rights: You can request a copy of all personal data we hold about you",
        "Correction Rights: You can update or correct any inaccurate personal information in your account",
        "Deletion Rights: You can request deletion of your account and associated personal data",
        "Portability Rights: You can request your data in a machine-readable format to transfer to another service",
        "Objection Rights: You can object to certain types of data processing, including marketing communications",
        "Withdrawal of Consent: You can withdraw consent for data processing at any time where consent is the legal basis"
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Your privacy is important to us. This policy explains how EcoZBite collects, uses, and protects your personal information.
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              EcoZBite ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our platform to 
              discover sustainable food options and reduce food waste.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using EcoZBite, you agree to the collection and use of information in accordance with this policy. 
              If you do not agree with our policies and practices, please do not use our services.
            </p>
          </motion.div>

          {/* Policy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:border-blue-200"
              >
                <div className="flex items-center mb-6">
                  <div className="text-blue-600 mr-4">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                
                <ul className="space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 mt-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Questions About Your Privacy?
              </h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact us.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:privacy@ecozbite.com"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  privacy@ecozbite.com
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Contact Form
                </a>
              </div>
            </div>
          </motion.div>

          {/* Data Retention */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your personal information only for as long as necessary to provide our services and fulfill the purposes outlined in this policy. 
              Specific retention periods include:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Account information: Retained while your account is active and for 2 years after account closure</li>
              <li>• Transaction records: Retained for 7 years for legal and accounting purposes</li>
              <li>• Marketing communications: Until you unsubscribe or withdraw consent</li>
              <li>• Analytics data: Aggregated and anonymized data may be retained indefinitely for research purposes</li>
            </ul>
          </motion.div>

          {/* Updates to Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
              legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page 
              and updating the "Last updated" date. We encourage you to review this policy periodically to stay informed about how 
              we protect your information.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;