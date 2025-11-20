const welcomeEmailTemplate = (name) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EcoZBite</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fffe;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 35px 25px;
            text-align: center;
            color: white;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 8px;
            margin-bottom: 20px;
        }
        
        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 8px;
        }
        
        .leaf-icon {
            font-size: 32px;
            animation: realistic-sway 4s ease-in-out infinite;
            filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(34, 197, 94, 0.4));
        }
        
        @keyframes realistic-sway {
            0%, 100% { 
                transform: rotate(-2deg) translateY(0px) scale(1);
            }
            25% { 
                transform: rotate(1deg) translateY(-1px) scale(1.02);
            }
            50% { 
                transform: rotate(2deg) translateY(0px) scale(1);
            }
            75% { 
                transform: rotate(-1deg) translateY(-1px) scale(1.01);
            }
        }
        
        .logo-text {
            font-size: 20px;
            font-weight: 700;
            color: #10b981;
            letter-spacing: -0.5px;
        }
        
        .brand-name {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 12px 0;
            letter-spacing: -0.5px;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-top: 8px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .features {
            background: #f0fdf4;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .features h3 {
            color: #059669;
            font-size: 18px;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .feature-list {
            list-style: none;
            padding: 0;
        }
        
        .feature-list li {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;
            color: #374151;
        }
        
        .feature-icon {
            margin-right: 12px;
            font-size: 16px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-content {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .social-link {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: #e5e7eb;
            border-radius: 50%;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: background-color 0.3s ease;
        }
        
        .social-link:hover {
            background: #10b981;
            color: white;
        }
        
        .contact-info {
            font-size: 12px;
            color: #9ca3af;
            line-height: 1.5;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 25px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .logo {
                font-size: 28px;
            }
            
            .greeting {
                font-size: 22px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <img src="cid:logo" alt="EcoZBite Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />
            </div>
            <h1 class="brand-name">EcoZBite</h1>
            <div class="tagline">Save Food • Save Money • Save Planet</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">Welcome to EcoZBite, ${name}! 🎉</div>
            
            <div class="message">
                Thank you for joining our mission to reduce food waste and create a more sustainable future. 
                You're now part of a community that's making a real difference, one purchase at a time.
            </div>
            
            <div class="features">
                <h3>🌟 What You Can Do Now</h3>
                <ul class="feature-list">
                    <li><span class="feature-icon">💰</span> Save up to 60% on fresh products</li>
                    <li><span class="feature-icon">🌱</span> Help reduce food waste in your community</li>
                    <li><span class="feature-icon">🛒</span> Discover amazing deals from local stores</li>
                    <li><span class="feature-icon">📱</span> Get instant notifications for new deals</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/products" class="cta-button">
                    Start Shopping Now 🛒
                </a>
            </div>
            
            <div class="divider"></div>
            
            <div class="message">
                <strong>Need help getting started?</strong><br>
                Our support team is here to help you make the most of your EcoZBite experience. 
                Feel free to reach out anytime!
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <strong>EcoZBite Team</strong><br>
                Making sustainability accessible to everyone 🌍
            </div>
            
            <div class="contact-info">
                EcoZBite Inc. | support@ecozbite.com<br>
                This email was sent to you because you signed up for EcoZBite.<br>
                <a href="#" style="color: #10b981;">Unsubscribe</a> | <a href="#" style="color: #10b981;">Privacy Policy</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = welcomeEmailTemplate;