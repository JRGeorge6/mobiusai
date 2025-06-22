// Google AdSense Configuration
export const ADSENSE_CONFIG = {
  // Replace with your actual AdSense publisher ID
  PUBLISHER_ID: 'ca-pub-5839825627055873',
  
  // Ad slot IDs - replace with your actual ad slot IDs from AdSense
  AD_SLOTS: {
    FOOTER_BANNER: '9194120233', // Your footer banner ad slot ID
    SIDEBAR: '0987654321',       // Replace with your sidebar ad slot ID (if needed)
    IN_ARTICLE: '1122334455',    // Replace with your in-article ad slot ID (if needed)
  },
  
  // Ad formats
  AD_FORMATS: {
    BANNER: 'auto',
    RECTANGLE: 'rectangle',
    RESPONSIVE: 'auto',
  },
  
  // Development mode - set to false in production
  DEVELOPMENT_MODE: process.env.NODE_ENV === 'development',
  
  // AdSense settings
  SETTINGS: {
    // Enable/disable ads
    ENABLED: true,
    
    // Show ads only to non-authenticated users (optional)
    SHOW_TO_AUTHENTICATED_USERS: true,
    
    // Ad placement settings
    PLACEMENT: {
      FOOTER: true,
      SIDEBAR: false, // Set to true if you want sidebar ads
      IN_CONTENT: false, // Set to true if you want in-content ads
    },
    
    // Responsive settings
    RESPONSIVE: {
      ENABLED: true,
      MAX_WIDTH: '728px',
    },
  },
};

// Helper function to get ad slot ID
export const getAdSlot = (slotName: keyof typeof ADSENSE_CONFIG.AD_SLOTS): string => {
  return ADSENSE_CONFIG.AD_SLOTS[slotName];
};

// Helper function to check if ads should be shown
export const shouldShowAds = (isAuthenticated: boolean = false): boolean => {
  if (!ADSENSE_CONFIG.SETTINGS.ENABLED) return false;
  if (ADSENSE_CONFIG.DEVELOPMENT_MODE) return false;
  if (!ADSENSE_CONFIG.SETTINGS.SHOW_TO_AUTHENTICATED_USERS && isAuthenticated) return false;
  return true;
}; 