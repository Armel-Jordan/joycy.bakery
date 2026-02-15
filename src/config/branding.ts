/**
 * Branding Configuration
 * 
 * This file contains all client-specific branding information.
 * Each client branch should customize these values.
 */

export const branding = {
  // Business Information
  businessName: import.meta.env.VITE_BUSINESS_NAME || 'Joycy Bakery',
  tagline: 'Des créations artisanales faites avec amour',
  
  // Contact Information
  contact: {
    email: import.meta.env.VITE_BUSINESS_EMAIL || 'contact@joycybakery.com',
    phone: import.meta.env.VITE_BUSINESS_PHONE || '+1 (514) 555-1234',
    whatsapp: '+15145551234',
    address: import.meta.env.VITE_BUSINESS_ADDRESS || 'Québec, QC',
    country: 'Canada'
  },
  
  // Business Hours
  hours: {
    weekdays: 'Lundi - Vendredi: 9h - 18h',
    saturday: 'Samedi: 10h - 16h',
    sunday: 'Dimanche: Fermé'
  },
  
  // Social Media (optional)
  social: {
    facebook: '',
    instagram: '',
    twitter: ''
  },
  
  // Logo and Images
  assets: {
    logo: '/logo.jpeg',
    favicon: '/favicon.ico'
  }
};

/**
 * Theme Configuration
 * 
 * Define your color scheme here.
 * Current theme: Brown (Burnt Umber)
 */
export const theme = {
  colors: {
    primary: '#6E260E',      // Burnt Umber (main brown)
    secondary: '#D4A574',    // Tan (light brown)
    accent: '#F5EDE4',       // Cream (background accent)
    background: '#FFFFFF',   // White
    text: '#2C2C2C',        // Dark gray
    textLight: '#666666'    // Medium gray
  },
  
  // You can add more theme properties here
  fonts: {
    heading: 'system-ui, -apple-system, sans-serif',
    body: 'system-ui, -apple-system, sans-serif'
  }
};

/**
 * Product Categories
 * 
 * Define available product categories for this client.
 */
export const productCategories = [
  { value: 'Cookies', label: 'Cookies', emoji: '🍪' },
  { value: 'Crêpes', label: 'Crêpes', emoji: '🥞' },
  { value: 'Gâteaux', label: 'Gâteaux', emoji: '🎂' }
] as const;

export type ProductCategory = typeof productCategories[number]['value'];

/**
 * Feature Flags
 * 
 * Enable or disable features per client.
 */
export const features = {
  enablePromotions: true,
  enableCustomOrders: true,
  enableCart: true,
  enableBlog: false,
  enableReviews: false,
  enableLoyaltyProgram: false
};
