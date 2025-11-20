const axiosInstance = require('./axiosInstance');

class AIService {
  static async predictExpiry(category, purchaseDate = new Date()) {
    try {
      const response = await axiosInstance.post('/predict-expiry', {
        category,
        purchase_date: purchaseDate.toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('AI Service - Predict Expiry Error:', error.message);
      // Fallback logic
      return this.fallbackExpiryPrediction(category, purchaseDate);
    }
  }

  static async analyzeWaste(products) {
    try {
      const response = await axiosInstance.post('/analyze-waste', {
        products
      });

      return response.data;
    } catch (error) {
      console.error('AI Service - Analyze Waste Error:', error.message);
      return {
        total_waste_value: 0,
        waste_by_category: {},
        suggestions: ['AI service unavailable - manual analysis recommended'],
        analysis_date: new Date().toISOString()
      };
    }
  }

  static async recommendDiscount(daysUntilExpiry, originalPrice) {
    try {
      const response = await axiosInstance.post('/recommend-discount', {
        days_until_expiry: daysUntilExpiry,
        original_price: originalPrice
      });

      return response.data;
    } catch (error) {
      console.error('AI Service - Recommend Discount Error:', error.message);
      // Fallback discount logic
      return this.fallbackDiscountRecommendation(daysUntilExpiry, originalPrice);
    }
  }

  static async checkHealth() {
    try {
      const response = await axiosInstance.get('/health');
      return response.data;
    } catch (error) {
      console.error('AI Service - Health Check Error:', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Fallback methods when AI service is unavailable
  static fallbackExpiryPrediction(category, purchaseDate) {
    const expiryDays = {
      'dairy': 7,
      'meat': 3,
      'vegetables': 5,
      'fruits': 4,
      'bakery': 2,
      'frozen': 30,
      'canned': 365,
      'dry_goods': 180,
      'beverages': 14
    };

    const days = expiryDays[category.toLowerCase()] || 7;
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(expiryDate.getDate() + days);
    
    const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    
    let status = 'fresh';
    if (daysUntilExpiry < 0) status = 'expired';
    else if (daysUntilExpiry <= 1) status = 'critical';
    else if (daysUntilExpiry <= 3) status = 'warning';

    return {
      expiry_date: expiryDate.toISOString(),
      days_until_expiry: daysUntilExpiry,
      status,
      category,
      estimated_expiry_days: days
    };
  }

  static fallbackDiscountRecommendation(daysUntilExpiry, originalPrice) {
    let discountPercentage = 0;
    
    if (daysUntilExpiry <= 0) discountPercentage = 70;
    else if (daysUntilExpiry === 1) discountPercentage = 50;
    else if (daysUntilExpiry === 2) discountPercentage = 30;
    else if (daysUntilExpiry === 3) discountPercentage = 20;

    const discountedPrice = originalPrice * (1 - discountPercentage / 100);
    
    return {
      recommended_discount_percentage: discountPercentage,
      original_price: originalPrice,
      discounted_price: Math.round(discountedPrice * 100) / 100,
      days_until_expiry: daysUntilExpiry,
      urgency: daysUntilExpiry <= 1 ? 'high' : daysUntilExpiry <= 3 ? 'medium' : 'low'
    };
  }
}

module.exports = AIService;