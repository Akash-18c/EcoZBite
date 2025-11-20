import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setResults(null);
      } else {
        toast.error('Please select a CSV or Excel file');
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,category,originalPrice,discountedPrice,stock,unit,expiryDate,description,imageUrl
Fresh Apples,Fruits & Vegetables,100,80,50,kg,2024-12-31,Fresh red apples from local farms,https://example.com/apple.jpg
Organic Milk,Dairy & Eggs,60,55,20,bottle,2024-02-15,Fresh organic milk 1L,https://example.com/milk.jpg`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:4000/api/products/bulk-upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setResults(response.data.results);
        toast.success(`Successfully processed ${response.data.results.successful} products`);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload products');
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setResults(null);
    setUploading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Products</h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {!results ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Upload Instructions</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Download the template CSV file below</li>
                          <li>• Fill in your product data following the format</li>
                          <li>• Upload the completed CSV file</li>
                          <li>• Maximum 100 products per upload</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadTemplate}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Template
                    </motion.button>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="bulk-upload"
                    />
                    <label htmlFor="bulk-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        {file ? file.name : 'Choose CSV or Excel file'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Click to browse or drag and drop your file here
                      </p>
                    </label>
                  </div>

                  {file && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {uploading ? 'Uploading...' : 'Upload Products'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Complete!</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                      <div className="text-sm text-green-800">Successful</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                      <div className="text-sm text-red-800">Failed</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{results.total}</div>
                      <div className="text-sm text-blue-800">Total</div>
                    </div>
                  </div>

                  {results.errors && results.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {results.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {results.errors.length > 5 && (
                          <li>• ... and {results.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkUploadModal;