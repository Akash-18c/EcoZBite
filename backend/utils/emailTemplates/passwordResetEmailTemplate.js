const passwordResetEmailTemplate = (username, resetCode) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - EcoZBite</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 20px;
      background-color: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #374151;
    }

    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* Header Section */
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
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

    .logo-text {
      font-size: 24px;
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
      font-weight: 400;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      letter-spacing: 0.3px;
    }

    /* Body Section */
    .body {
      padding: 40px 30px;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .welcome-message {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    .welcome-emoji {
      display: inline-block;
      margin-left: 8px;
    }

    .intro-message {
      font-size: 16px;
      line-height: 1.6;
      color: #6b7280;
      max-width: 480px;
      margin: 0 auto;
    }

    /* Reset Code Section */
    .code-section {
      text-align: center;
      margin: 40px 0;
    }

    .code-label {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 24px;
      letter-spacing: 0.3px;
    }

    .code-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 24px 32px;
      font-size: 36px;
      font-weight: 700;
      color: #92400e;
      letter-spacing: 6px;
      text-align: center;
      margin: 20px 0;
      display: inline-block;
      min-width: 200px;
      box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
      user-select: all;
      cursor: pointer;
    }

    .expiry-notice {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 24px auto 0;
      max-width: 300px;
      font-size: 14px;
      color: #92400e;
      font-weight: 500;
      text-align: center;
    }

    .expiry-icon {
      display: inline-block;
      margin-right: 8px;
    }

    /* Security Notice */
    .security-notice {
      background-color: #ecfdf5;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 24px auto 0;
      max-width: 400px;
      font-size: 14px;
      color: #065f46;
      font-weight: 500;
      text-align: center;
    }

    .security-icon {
      display: inline-block;
      margin-right: 8px;
    }

    /* Footer Section */
    .footer {
      background-color: #1f2937;
      padding: 32px 30px;
      text-align: center;
      color: #ffffff;
    }

    .footer-accent {
      height: 4px;
      background: linear-gradient(90deg, #10b981, #059669);
      margin-bottom: 24px;
    }

    .footer-slogan {
      font-size: 16px;
      font-weight: 500;
      color: #10b981;
      margin-bottom: 16px;
      font-style: italic;
    }

    .footer-slogan-emoji {
      display: inline-block;
      margin-left: 6px;
    }

    .copyright {
      font-size: 14px;
      color: #9ca3af;
      font-weight: 400;
    }

    .copyright-link {
      color: #10b981;
      text-decoration: none;
      font-weight: 500;
    }

    .copyright-link:hover {
      text-decoration: underline;
    }

    /* Responsive Design */
    @media only screen and (max-width: 640px) {
      body {
        padding: 10px;
      }

      .email-container {
        width: 100%;
        border-radius: 8px;
      }

      .header {
        padding: 30px 20px;
      }

      .logo {
        width: 56px;
        height: 56px;
      }

      .logo-text {
        font-size: 20px;
      }

      .brand-name {
        font-size: 24px;
      }

      .tagline {
        font-size: 14px;
      }

      .body {
        padding: 30px 20px;
      }

      .welcome-message {
        font-size: 20px;
      }

      .intro-message {
        font-size: 15px;
      }

      .code-box {
        font-size: 28px;
        letter-spacing: 4px;
        padding: 20px 24px;
        min-width: 160px;
      }

      .footer {
        padding: 24px 20px;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .body {
        background-color: #1f2937;
      }

      .welcome-message {
        color: #f9fafb;
      }

      .intro-message {
        color: #d1d5db;
      }

      .code-label {
        color: #e5e7eb;
      }
    }

    /* Print styles */
    @media print {
      .email-container {
        box-shadow: none;
        border: 1px solid #e5e7eb;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header Section -->
    <div class="header">
      <div class="logo">
        <img src="cid:logo" alt="EcoZBite Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />
      </div>
      <h1 class="brand-name">EcoZBite</h1>
      <p class="tagline">Save Food, Save Money, Save Planet</p>
    </div>

    <!-- Body Section -->
    <div class="body">
      <div class="welcome-section">
        <h2 class="welcome-message">
          Password Reset Request <span class="welcome-emoji">🔐</span>
        </h2>
        <p class="intro-message">
          Hi ${username}, we received a request to reset your password for your EcoZBite account. Use the code below to reset your password.
        </p>
      </div>

      <div class="code-section">
        <p class="code-label">Your Password Reset Code</p>
        <div class="code-box">
          ${resetCode}
        </div>
        <div class="expiry-notice">
          <span class="expiry-icon">⏰</span>
          This code will expire in 10 minutes
        </div>
        <div class="security-notice">
          <span class="security-icon">🛡️</span>
          If you didn't request this reset, please ignore this email. Your password will remain unchanged.
        </div>
      </div>
    </div>

    <!-- Footer Section -->
    <div class="footer">
      <div class="footer-accent"></div>
      <p class="footer-slogan">
        Secure your EcoZBite account 🌍
      </p>
      <p class="copyright">
        © 2025 <a href="https://ecozbite.com" class="copyright-link">EcoZBite</a>. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

module.exports = passwordResetEmailTemplate;
