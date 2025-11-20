import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    login: 'Login',
    signUp: 'Sign Up',
    
    // Hero Section
    heroTitle: 'Save Food, Save Money, Save Planet',
    heroSubtitle: 'Connect with supermarkets to get amazing discounts on fresh products before they expire. Fight food waste while saving money! 🌍',
    startSaving: 'Start Saving Today',
    storeOwner: "I'm a Store Owner",
    joinUsers: 'Join 10,000+ happy users',
    
    // Features
    whyChoose: 'Why Choose EcoZBite?',
    whyChooseSubtitle: "We're revolutionizing how people shop for food while making a positive impact on the environment",
    saveMoney: 'Save Money',
    saveMoneyDesc: 'Get up to 60% off on fresh products before they expire',
    reduceWaste: 'Reduce Waste',
    reduceWasteDesc: 'Help prevent food waste and protect our environment',
    easyShopping: 'Easy Shopping',
    easyShoppingDesc: 'Browse and reserve products with just a few clicks',
    makeImpact: 'Make Impact',
    makeImpactDesc: 'Join thousands making a positive environmental impact',
    
    // Stats
    productsSaved: 'Products Saved',
    happyUsers: 'Happy Users',
    partnerStores: 'Partner Stores',
    moneySaved: 'Money Saved',
    
    // How It Works
    howItWorks: 'How It Works',
    howItWorksSubtitle: 'Getting started is simple. Follow these easy steps to start saving money and reducing food waste',
    step1Title: 'Sign Up',
    step1Desc: 'Create your free account and verify your email',
    step2Title: 'Browse Deals',
    step2Desc: 'Discover discounted products near you',
    step3Title: 'Reserve & Save',
    step3Desc: 'Reserve items and pick them up at the store',
    
    // Testimonials
    testimonials: 'What Our Users Say',
    testimonialsSubtitle: 'Join thousands of satisfied customers who are making a difference',
    
    // CTA
    readyToMakeDifference: 'Ready to Make a Difference?',
    ctaSubtitle: 'Join EcoZBite today and start saving money while helping save the planet. Every purchase makes a difference! 🌍',
    startJourney: 'Start Your Journey',
    signIn: 'Sign In',
    freeToJoin: 'Free to join',
    secureTrusted: 'Secure & trusted',
    instantSavings: 'Instant savings',
    
    // Footer
    stayConnected: 'Stay Connected',
    newsletterDesc: 'Get weekly tips on reducing food waste and exclusive recipes!',
    subscribeNow: 'Subscribe Now',
    subscribing: 'Subscribing...',
    noSpam: 'No spam, unsubscribe anytime',
    contactInfo: 'Contact Info',
    followUs: 'Follow Us',
    contact: 'Contact',
    contactUs: 'Contact Us',
    copyright: '© 2025 EcoZBite. Made with ❤️. All rights reserved.',
    
    // Resources
    navigation: 'Navigation',
    resources: 'Resources',
    helpCenter: 'Help Center',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    support: 'Support',
    faq: 'FAQ',
    home: 'Home',
    products: 'Products',
    about: 'About',
    register: 'Register',
    
    // Success Messages
    subscriptionSuccess: 'Successfully subscribed to our newsletter! 🎉',
    messageSuccess: 'Message sent successfully! We\'ll get back to you within 24-48 hours.',
    
    // Language Names
    english: 'English',
    bengali: 'Bengali',
    hindi: 'Hindi'
  },
  
  bn: {
    // Navigation
    login: 'লগইন',
    signUp: 'সাইন আপ',
    
    // Hero Section
    heroTitle: 'খাদ্য সংরক্ষণ করুন, অর্থ সাশ্রয় করুন, পৃথিবী রক্ষা করুন',
    heroSubtitle: 'মেয়াদ শেষ হওয়ার আগে তাজা পণ্যে অবিশ্বাস্য ছাড় পেতে সুপারমার্কেটের সাথে সংযুক্ত হন। অর্থ সাশ্রয় করার সময় খাদ্য অপচয়ের বিরুদ্ধে লড়াই করুন! 🌍',
    startSaving: 'আজই সাশ্রয় শুরু করুন',
    storeOwner: 'আমি একজন দোকান মালিক',
    joinUsers: '১০,০০০+ খুশি ব্যবহারকারীদের সাথে যোগ দিন',
    
    // Features
    whyChoose: 'কেন EcoZBite বেছে নিবেন?',
    whyChooseSubtitle: 'আমরা খাদ্য কেনাকাটার পদ্ধতিতে বিপ্লব আনছি এবং পরিবেশে ইতিবাচক প্রভাব ফেলছি',
    saveMoney: 'অর্থ সাশ্রয় করুন',
    saveMoneyDesc: 'মেয়াদ শেষ হওয়ার আগে তাজা পণ্যে ৬০% পর্যন্ত ছাড় পান',
    reduceWaste: 'অপচয় কমান',
    reduceWasteDesc: 'খাদ্য অপচয় রোধ করতে এবং আমাদের পরিবেশ রক্ষা করতে সাহায্য করুন',
    easyShopping: 'সহজ কেনাকাটা',
    easyShoppingDesc: 'মাত্র কয়েকটি ক্লিকে পণ্য ব্রাউজ এবং রিজার্ভ করুন',
    makeImpact: 'প্রভাব তৈরি করুন',
    makeImpactDesc: 'হাজার হাজার মানুষের সাথে যোগ দিন যারা ইতিবাচক পরিবেশগত প্রভাব তৈরি করছে',
    
    // Stats
    productsSaved: 'সংরক্ষিত পণ্য',
    happyUsers: 'খুশি ব্যবহারকারী',
    partnerStores: 'অংশীদার দোকান',
    moneySaved: 'সাশ্রয়কৃত অর্থ',
    
    // How It Works
    howItWorks: 'এটি কীভাবে কাজ করে',
    howItWorksSubtitle: 'শুরু করা সহজ। অর্থ সাশ্রয় এবং খাদ্য অপচয় কমাতে এই সহজ পদক্ষেপগুলি অনুসরণ করুন',
    step1Title: 'সাইন আপ করুন',
    step1Desc: 'আপনার বিনামূল্যে অ্যাকাউন্ট তৈরি করুন এবং আপনার ইমেইল যাচাই করুন',
    step2Title: 'অফার ব্রাউজ করুন',
    step2Desc: 'আপনার কাছাকাছি ছাড়যুক্ত পণ্য আবিষ্কার করুন',
    step3Title: 'রিজার্ভ এবং সাশ্রয় করুন',
    step3Desc: 'আইটেম রিজার্ভ করুন এবং দোকান থেকে তুলে নিন',
    
    // Testimonials
    testimonials: 'আমাদের ব্যবহারকারীরা কী বলেন',
    testimonialsSubtitle: 'হাজার হাজার সন্তুষ্ট গ্রাহকদের সাথে যোগ দিন যারা পরিবর্তন আনছে',
    
    // CTA
    readyToMakeDifference: 'পরিবর্তন আনতে প্রস্তুত?',
    ctaSubtitle: 'আজই EcoZBite-এ যোগ দিন এবং গ্রহ রক্ষায় সাহায্য করার সময় অর্থ সাশ্রয় শুরু করুন। প্রতিটি ক্রয় একটি পার্থক্য তৈরি করে! 🌍',
    startJourney: 'আপনার যাত্রা শুরু করুন',
    signIn: 'সাইন ইন',
    freeToJoin: 'যোগদান বিনামূল্যে',
    secureTrusted: 'নিরাপদ এবং বিশ্বস্ত',
    instantSavings: 'তাৎক্ষণিক সাশ্রয়',
    
    // Footer
    stayConnected: 'সংযুক্ত থাকুন',
    newsletterDesc: 'খাদ্য অপচয় কমানোর সাপ্তাহিক টিপস এবং একচেটিয়া রেসিপি পান!',
    subscribeNow: 'এখনই সাবস্ক্রাইব করুন',
    subscribing: 'সাবস্ক্রাইব করা হচ্ছে...',
    noSpam: 'কোন স্প্যাম নেই, যেকোনো সময় আনসাবস্ক্রাইব করুন',
    contactInfo: 'যোগাযোগের তথ্য',
    followUs: 'আমাদের অনুসরণ করুন',
    contact: 'যোগাযোগ',
    contactUs: 'আমাদের সাথে যোগাযোগ করুন',
    copyright: '© ২০২৫ EcoZBite। ❤️ দিয়ে তৈরি। সমস্ত অধিকার সংরক্ষিত।',
    
    // Resources
    navigation: 'নেভিগেশন',
    resources: 'সম্পদ',
    helpCenter: 'সহায়তা কেন্দ্র',
    privacyPolicy: 'গোপনীয়তা নীতি',
    termsOfService: 'সেবার শর্তাবলী',
    support: 'সহায়তা',
    faq: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
    home: 'হোম',
    products: 'পণ্য',
    about: 'সম্পর্কে',
    register: 'নিবন্ধন',
    
    // Success Messages
    subscriptionSuccess: 'সফলভাবে আমাদের নিউজলেটারে সাবস্ক্রাইব করেছেন! 🎉',
    messageSuccess: 'বার্তা সফলভাবে পাঠানো হয়েছে! আমরা ২৪-৪৮ ঘন্টার মধ্যে আপনার কাছে ফিরে আসব।',
    
    // Language Names
    english: 'ইংরেজি',
    bengali: 'বাংলা',
    hindi: 'হিন্দি'
  },
  
  hi: {
    // Navigation
    login: 'लॉगिन',
    signUp: 'साइन अप',
    
    // Hero Section
    heroTitle: 'भोजन बचाएं, पैसे बचाएं, ग्रह बचाएं',
    heroSubtitle: 'समाप्ति से पहले ताज़ा उत्पादों पर अविश्वसनीय छूट पाने के लिए सुपरमार्केट से जुड़ें। पैसे बचाते समय खाद्य अपशिष्ट से लड़ें! 🌍',
    startSaving: 'आज ही बचत शुरू करें',
    storeOwner: 'मैं एक दुकान मालिक हूं',
    joinUsers: '10,000+ खुश उपयोगकर्ताओं के साथ जुड़ें',
    
    // Features
    whyChoose: 'EcoZBite क्यों चुनें?',
    whyChooseSubtitle: 'हम भोजन की खरीदारी के तरीके में क्रांति ला रहे हैं और पर्यावरण पर सकारात्मक प्रभाव डाल रहे हैं',
    saveMoney: 'पैसे बचाएं',
    saveMoneyDesc: 'समाप्ति से पहले ताज़ा उत्पादों पर 60% तक की छूट पाएं',
    reduceWaste: 'अपशिष्ट कम करें',
    reduceWasteDesc: 'खाद्य अपशिष्ट को रोकने और हमारे पर्यावरण की रक्षा करने में मदद करें',
    easyShopping: 'आसान खरीदारी',
    easyShoppingDesc: 'केवल कुछ क्लिक के साथ उत्पादों को ब्राउज़ और रिज़र्व करें',
    makeImpact: 'प्रभाव बनाएं',
    makeImpactDesc: 'हजारों लोगों के साथ जुड़ें जो सकारात्मक पर्यावरणीय प्रभाव बना रहे हैं',
    
    // Stats
    productsSaved: 'बचाए गए उत्पाद',
    happyUsers: 'खुश उपयोगकर्ता',
    partnerStores: 'साझेदार दुकानें',
    moneySaved: 'बचाए गए पैसे',
    
    // How It Works
    howItWorks: 'यह कैसे काम करता है',
    howItWorksSubtitle: 'शुरुआत करना सरल है। पैसे बचाने और खाद्य अपशिष्ट कम करने के लिए इन आसान चरणों का पालन करें',
    step1Title: 'साइन अप करें',
    step1Desc: 'अपना मुफ्त खाता बनाएं और अपना ईमेल सत्यापित करें',
    step2Title: 'डील्स ब्राउज़ करें',
    step2Desc: 'अपने आस-पास छूट वाले उत्पादों की खोज करें',
    step3Title: 'रिज़र्व और बचत करें',
    step3Desc: 'आइटम रिज़र्व करें और दुकान से उठाएं',
    
    // Testimonials
    testimonials: 'हमारे उपयोगकर्ता क्या कहते हैं',
    testimonialsSubtitle: 'हजारों संतुष्ट ग्राहकों के साथ जुड़ें जो बदलाव ला रहे हैं',
    
    // CTA
    readyToMakeDifference: 'बदलाव लाने के लिए तैयार हैं?',
    ctaSubtitle: 'आज ही EcoZBite में शामिल हों और ग्रह को बचाने में मदद करते समय पैसे बचाना शुरू करें। हर खरीदारी एक अंतर बनाती है! 🌍',
    startJourney: 'अपनी यात्रा शुरू करें',
    signIn: 'साइन इन',
    freeToJoin: 'शामिल होना मुफ्त',
    secureTrusted: 'सुरक्षित और भरोसेमंद',
    instantSavings: 'तत्काल बचत',
    
    // Footer
    stayConnected: 'जुड़े रहें',
    newsletterDesc: 'खाद्य अपशिष्ट कम करने के साप्ताहिक टिप्स और विशेष रेसिपी पाएं!',
    subscribeNow: 'अभी सब्सक्राइब करें',
    subscribing: 'सब्सक्राइब कर रहे हैं...',
    noSpam: 'कोई स्पैम नहीं, कभी भी अनसब्सक्राइब करें',
    contactInfo: 'संपर्क जानकारी',
    followUs: 'हमें फॉलो करें',
    contact: 'संपर्क',
    contactUs: 'हमसे संपर्क करें',
    copyright: '© 2025 EcoZBite। ❤️ के साथ बनाया गया। सभी अधिकार सुरक्षित।',
    
    // Resources
    navigation: 'नेवीगेशन',
    resources: 'संसाधन',
    helpCenter: 'सहायता केंद्र',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    support: 'सहायता',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    home: 'होम',
    products: 'उत्पाद',
    about: 'के बारे में',
    register: 'पंजीकरण',
    
    // Success Messages
    subscriptionSuccess: 'सफलतापूर्वक हमारे न्यूज़लेटर की सदस्यता ली गई! 🎉',
    messageSuccess: 'संदेश सफलतापूर्वक भेजा गया! हम 24-48 घंटों के भीतर आपसे संपर्क करेंगे।',
    
    // Language Names
    english: 'अंग्रेजी',
    bengali: 'बंगाली',
    hindi: 'हिंदी'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('ecozbite-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('ecozbite-language', languageCode);
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;