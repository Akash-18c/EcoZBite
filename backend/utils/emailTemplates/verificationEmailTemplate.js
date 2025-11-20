const verificationEmailTemplate = (username, verificationCode) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - EcoZBite</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 15px;
      background-color: #f1f5f9;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #374151;
    }

    .email-container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 25px;
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
      font-size: 22px;
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

    .body {
      padding: 35px 25px;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .welcome-message {
      font-size: 22px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 15px;
      line-height: 1.3;
    }

    .welcome-emoji {
      display: inline-block;
      margin-left: 6px;
    }

    .intro-message {
      font-size: 15px;
      line-height: 1.6;
      color: #6b7280;
      max-width: 450px;
      margin: 0 auto;
    }

    .code-section {
      text-align: center;
      margin: 35px 0;
    }

    .code-label {
      font-size: 17px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 20px;
      letter-spacing: 0.3px;
    }

    .code-box {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 20px 28px;
      font-size: 32px;
      font-weight: 700;
      color: #065f46;
      letter-spacing: 5px;
      text-align: center;
      margin: 18px auto;
      display: inline-block;
      min-width: 180px;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
      user-select: all;
      cursor: pointer;
    }

    .expiry-notice {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 20px auto 0;
      max-width: 280px;
      font-size: 13px;
      color: #92400e;
      font-weight: 500;
      text-align: center;
    }

    .expiry-icon {
      display: inline-block;
      margin-right: 6px;
    }

    .footer {
      background-color: #1f2937;
      padding: 25px;
      text-align: center;
      color: #ffffff;
    }

    .footer-accent {
      height: 3px;
      background: linear-gradient(90deg, #10b981, #059669);
      margin-bottom: 20px;
      border-radius: 2px;
    }

    .footer-slogan {
      font-size: 15px;
      font-weight: 500;
      color: #10b981;
      margin-bottom: 16px;
      font-style: italic;
    }

    .copyright {
      font-size: 13px;
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

    @media only screen and (max-width: 640px) {
      body {
        padding: 8px;
      }

      .email-container {
        border-radius: 12px;
      }

      .header {
        padding: 25px 18px;
      }

      .logo {
        width: 48px;
        height: 48px;
      }

      .brand-name {
        font-size: 22px;
      }

      .tagline {
        font-size: 13px;
      }

      .body {
        padding: 25px 18px;
      }

      .welcome-message {
        font-size: 19px;
      }

      .intro-message {
        font-size: 14px;
      }

      .code-box {
        font-size: 26px;
        letter-spacing: 3px;
        padding: 16px 22px;
        min-width: 150px;
      }

      .footer {
        padding: 20px 18px;
      }

      .social-icons {
        gap: 8px;
      }

      .social-link {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">
        <img src="cid:logo" alt="EcoZBite Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />
      </div>
      <h1 class="brand-name">EcoZBite</h1>
      <p class="tagline">Save Food, Save Money, Save Planet</p>
    </div>

    <div class="body">
      <div class="welcome-section">
        <h2 class="welcome-message">
          Welcome to EcoZBite, ${username}!<span class="welcome-emoji">🎉</span>
        </h2>
        <p class="intro-message">
          Thank you for joining our mission to reduce food waste and create a sustainable future. To complete your registration, please verify your email using the code below.
        </p>
      </div>

      <div class="code-section">
        <p class="code-label">Your Verification Code</p>
        <div class="code-box">
          ${verificationCode}
        </div>
        <div class="expiry-notice">
          <span class="expiry-icon">⏰</span>
          This code will expire in 10 minutes
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-accent"></div>
      <p class="footer-slogan">
        Together, we're making a difference! 🌍
      </p>
      <p class="copyright">
        © 2025 <a href="https://ecozbite.com" class="copyright-link">EcoZBite</a>. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

module.exports = verificationEmailTemplate;
