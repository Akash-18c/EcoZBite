import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Clock, 
  User, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Archive,
  Star,
  Calendar,
  Phone,
  Globe
} from 'lucide-react';
import Layout from '../../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchMessages();
  }, [searchTerm, statusFilter, pagination.currentPage]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/contact', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter
        }
      });

      if (response.data.success) {
        setMessages(response.data.messages);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId, status, adminNotes = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:4000/api/contact/${messageId}/status`, {
        status,
        adminNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Message status updated');
      fetchMessages();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update message status');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/contact/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Message deleted successfully');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
              <Mail className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Messages</h3>
            <p className="text-gray-600">Fetching contact messages...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 border border-green-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10 animate-pulse"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2"
              >
                📧 Contact Messages
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 text-lg"
              >
                Manage customer and store owner inquiries with ease
              </motion.p>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-6"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{pagination.total}</div>
                <div className="text-sm text-gray-500">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{messages.filter(m => m.status === 'pending').length}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <button
                onClick={fetchMessages}
                className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                title="Refresh Messages"
              >
                <RefreshCw className="w-5 h-5 text-green-600" />
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 backdrop-blur-sm"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, email, subject, or message content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 focus:bg-white transition-all duration-200 min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">🟡 Pending</option>
                  <option value="in-progress">🔵 In Progress</option>
                  <option value="resolved">🟢 Resolved</option>
                  <option value="closed">⚫ Closed</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Messages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Search className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600 max-w-md mx-auto">No contact messages match your current filters. Try adjusting your search criteria.</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    className="p-6 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center"
                          >
                            <User className="w-5 h-5 text-green-600" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-gray-900">{message.name}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{message.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                                {getStatusIcon(message.status)}
                                <span className="ml-1 capitalize">{message.status}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(message.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <motion.h3 
                          className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors"
                        >
                          {message.subject}
                        </motion.h3>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {message.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(message.createdAt).toLocaleString()}
                          </div>
                          <div className="flex items-center space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteMessage(message._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete Message"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Enhanced Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center"
          >
            <div className="flex space-x-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    page === pagination.currentPage
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Message Detail Modal */}
      <AnimatePresence>
        {showModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                        <p className="text-gray-600 flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {selectedMessage.name} • {selectedMessage.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200"
                  >
                    <XCircle className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Message Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                    Message Content
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                  </div>
                </motion.div>
                
                {/* Details Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                    Message Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Status</span>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMessage.status)}`}>
                          {getStatusIcon(selectedMessage.status)}
                          <span className="ml-1 capitalize">{selectedMessage.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Submitted</span>
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(selectedMessage.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Time</span>
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(selectedMessage.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Contact</span>
                        <div className="flex items-center text-sm text-gray-700">
                          <Phone className="w-4 h-4 mr-1" />
                          Available
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateMessageStatus(selectedMessage._id, 'in-progress')}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Mark In Progress
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateMessageStatus(selectedMessage._id, 'resolved')}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Resolved
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateMessageStatus(selectedMessage._id, 'closed')}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Close Message
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ContactMessages;