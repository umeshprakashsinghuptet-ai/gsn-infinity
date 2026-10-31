/* =========================================
   UPS CREATOR STUDIO
   Application Configuration
   ========================================= */

export const APP_CONFIG = Object.freeze({

  // Application Information
  APP_NAME: "UPS Creator Studio",
  APP_SUBTITLE: "All-in-One AI Creative Production Software",
  CREATOR_NAME: "Umesh Prakash Singh",
  TAGLINE: "Imagine. Create. Innovate.",
  VERSION: "1.3.0",

  // Supabase Connection
  SUPABASE_URL: "https://subhkybvlbptgzybxnth.supabase.co",

  // यहाँ अपना Supabase Publishable Key डालें
  // sb_publishable_... या पुरानी anon public key
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_hWveeK4qDUzdBWdAK0uROg_WTv7Pyjp",

  // Storage Configuration
  STORAGE_BUCKET: "owner-private-profile",
  MAX_PROFILE_IMAGE_SIZE: 5 * 1024 * 1024,

  // Application Settings
  DEFAULT_LANGUAGE: "hi",
  SUPPORTED_LANGUAGES: ["hi", "en"],

  DEFAULT_THEME: "dark",

  // User Roles
  USER_ROLES: [
    "super_admin",
    "office_editor",
    "tester"
  ],

  // Studio Settings
  STUDIOS: [
    "Video",
    "Image",
    "Poster",
    "Dance",
    "Film Maker",
    "Podcast",
    "Education"
  ],

  // Production Settings
  DEFAULT_ASPECT_RATIO: "9:16",

  SUPPORTED_ASPECT_RATIOS: [
    "9:16",
    "16:9",
    "1:1",
    "3:4"
  ],

  // Workflow Settings
  TOTAL_CORE_MODULES: 100,
  TOTAL_WORKFLOW_LOCKS: 25,
  TOTAL_PRODUCTION_ENGINES: 12,
  TOTAL_WORKFLOW_STAGES: 15,

  AUTO_SAVE: true,

  // Feature Status
  FEATURES: {
    AUTHENTICATION: true,
    USER_PROFILE: true,
    PROJECTS: true,
    AUTO_PILOT_WIZARD: true,
    ADMIN_CONSOLE: true,
    AI_GENERATION: false
  }

});

// Configuration Validation
export function validateConfig() {

  const errors = [];

  if (!APP_CONFIG.SUPABASE_URL) {
    errors.push("Supabase URL missing.");
  }

  if (
    !APP_CONFIG.SUPABASE_PUBLISHABLE_KEY ||
    APP_CONFIG.SUPABASE_PUBLISHABLE_KEY ===
    "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE"
  ) {
    errors.push("Supabase Publishable Key missing.");
  }

  return {
    valid: errors.length === 0,
    errors
  };

}
