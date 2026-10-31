/* =========================================
   UPS CREATOR STUDIO
   APPLICATION CONFIGURATION
========================================= */

export const APP_CONFIG = {

  APP_NAME: "UPS Creator Studio",

  VERSION: "1.0.0",

  SUPABASE_URL:
    "https://subhkybvlbptgzybxnth.supabase.co",

 SUPABASE_PUBLISHABLE_KEY:
    "sb_publishable_hWveeK4qDUzdBWdAK0uROg_WTv7Pyjp",
   
  STORAGE_BUCKET:
    "owner-private-profile",

  MAX_PROFILE_IMAGE_SIZE:
    5 * 1024 * 1024,

  TOTAL_CORE_MODULES: 50,

  TOTAL_WORKFLOW_LOCKS: 15,

  DEFAULT_LANGUAGE:
    "Hindi + English",

  SUPPORTED_ASPECT_RATIOS: [
    "9:16",
    "16:9",
    "1:1",
    "3:4"
  ],

  FEATURES: {

    AUTHENTICATION: true,

    CLOUD_PROJECTS: true,

    PROFILE_STORAGE: true,

    AI_GENERATION: false,

    PROMPT_LIBRARY: true,

    QUALITY_AUDIT: true

  }

};

/* =========================================
   CONFIGURATION VALIDATION
========================================= */

export function validateConfig() {

  const errors = [];

  if (
    !APP_CONFIG.SUPABASE_URL ||
    !APP_CONFIG.SUPABASE_URL.startsWith("https://")
  ) {
    errors.push("Invalid Supabase URL");
  }

  if (
    !APP_CONFIG.SUPABASE_PUBLISHABLE_KEY ||
    APP_CONFIG.SUPABASE_PUBLISHABLE_KEY ===
    "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE"
  ) {
    errors.push("Supabase Publishable Key missing");
  }

  if (!APP_CONFIG.STORAGE_BUCKET) {
    errors.push("Storage bucket missing");
  }

  return {
    valid: errors.length === 0,
    errors
  };

}

console.log(
  "UPS Creator Studio Configuration Loaded."
);
