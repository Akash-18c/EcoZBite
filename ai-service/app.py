from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import json
import os

app = Flask(__name__)

# Simple food expiry prediction based on category
FOOD_EXPIRY_DAYS = {
    'dairy': 7,
    'meat': 3,
    'vegetables': 5,
    'fruits': 4,
    'bakery': 2,
    'frozen': 30,
    'canned': 365,
    'dry_goods': 180,
    'beverages': 14
}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'EcoZBite AI Service'})

@app.route('/predict-expiry', methods=['POST'])
def predict_expiry():
    try:
        data = request.get_json()
        
        if not data or 'category' not in data:
            return jsonify({'error': 'Category is required'}), 400
        
        category = data['category'].lower()
        purchase_date = data.get('purchase_date', datetime.now().isoformat())
        
        # Parse purchase date
        if isinstance(purchase_date, str):
            purchase_date = datetime.fromisoformat(purchase_date.replace('Z', '+00:00'))
        
        # Get expiry days for category
        expiry_days = FOOD_EXPIRY_DAYS.get(category, 7)  # Default to 7 days
        
        # Calculate expiry date
        expiry_date = purchase_date + timedelta(days=expiry_days)
        
        # Calculate days until expiry
        days_until_expiry = (expiry_date - datetime.now()).days
        
        # Determine freshness status
        if days_until_expiry < 0:
            status = 'expired'
        elif days_until_expiry <= 1:
            status = 'critical'
        elif days_until_expiry <= 3:
            status = 'warning'
        else:
            status = 'fresh'
        
        return jsonify({
            'expiry_date': expiry_date.isoformat(),
            'days_until_expiry': days_until_expiry,
            'status': status,
            'category': category,
            'estimated_expiry_days': expiry_days
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-waste', methods=['POST'])
def analyze_waste():
    try:
        data = request.get_json()
        
        if not data or 'products' not in data:
            return jsonify({'error': 'Products data is required'}), 400
        
        products = data['products']
        total_waste = 0
        waste_by_category = {}
        
        for product in products:
            if product.get('status') == 'expired':
                waste_value = product.get('original_price', 0) * product.get('quantity', 1)
                total_waste += waste_value
                
                category = product.get('category', 'unknown')
                if category not in waste_by_category:
                    waste_by_category[category] = {'count': 0, 'value': 0}
                
                waste_by_category[category]['count'] += 1
                waste_by_category[category]['value'] += waste_value
        
        # Calculate waste reduction suggestions
        suggestions = []
        if total_waste > 100:
            suggestions.append("Consider implementing better inventory management")
        if waste_by_category.get('dairy', {}).get('count', 0) > 2:
            suggestions.append("Monitor dairy products more closely - they expire quickly")
        if waste_by_category.get('vegetables', {}).get('count', 0) > 3:
            suggestions.append("Consider buying vegetables in smaller quantities")
        
        return jsonify({
            'total_waste_value': total_waste,
            'waste_by_category': waste_by_category,
            'suggestions': suggestions,
            'analysis_date': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend-discount', methods=['POST'])
def recommend_discount():
    try:
        data = request.get_json()
        
        if not data or 'days_until_expiry' not in data:
            return jsonify({'error': 'Days until expiry is required'}), 400
        
        days_until_expiry = data['days_until_expiry']
        original_price = data.get('original_price', 0)
        
        # Discount recommendation logic
        if days_until_expiry <= 0:
            discount_percentage = 70  # Heavy discount for expired items
        elif days_until_expiry == 1:
            discount_percentage = 50  # 50% off for items expiring tomorrow
        elif days_until_expiry == 2:
            discount_percentage = 30  # 30% off for items expiring in 2 days
        elif days_until_expiry == 3:
            discount_percentage = 20  # 20% off for items expiring in 3 days
        else:
            discount_percentage = 0   # No discount needed
        
        discounted_price = original_price * (1 - discount_percentage / 100)
        
        return jsonify({
            'recommended_discount_percentage': discount_percentage,
            'original_price': original_price,
            'discounted_price': round(discounted_price, 2),
            'days_until_expiry': days_until_expiry,
            'urgency': 'high' if days_until_expiry <= 1 else 'medium' if days_until_expiry <= 3 else 'low'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)