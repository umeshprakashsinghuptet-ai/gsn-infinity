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
  VERSION: "1.0.0",

  // Supabase Connection
  SUPABASE_URL: "https://subhkybvlbptgzybxnth.supabase.co",

  // यहाँ अपना Supabase Publishable Key डालें
  // sb_publishable_... या पुरानी anon public key
  SUPABASE_PUBLISHABLE_KEY: "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE",

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
  TOTAL_CORE_MODULES: 50,
  TOTAL_WORKFLOW_LOCKS: 15,

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
/* =========================================
   UPS CREATOR STUDIO
   Main Application Engine
   PART 4A — CORE SETUP
   ========================================= */

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

import {
  APP_CONFIG,
  validateConfig
} from "./config.js";

/* =========================================
   1. APPLICATION INITIALIZATION
   ========================================= */

const configCheck = validateConfig();

let supabase = null;

if (configCheck.valid) {
  supabase = createClient(
    APP_CONFIG.SUPABASE_URL,
    APP_CONFIG.SUPABASE_PUBLISHABLE_KEY
  );
} else {
  console.warn(
    "Supabase configuration incomplete:",
    configCheck.errors
  );
}

/* =========================================
   2. APPLICATION STATE
   ========================================= */

const APP_STATE = {
  user: null,
  profile: null,
  projects: [],
  currentPage: "dashboard",
  currentStudio: null,
  wizard: {
    mode: "AUTO",
    step: 0,
    answers: {},
    questions: [],
    completed: false
  },
  isLoading: false
};

/* =========================================
   3. DOM HELPER FUNCTIONS
   ========================================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  document.querySelectorAll(selector);

function getElement(id) {
  return document.getElementById(id);
}

/* =========================================
   4. SAFE HTML HELPER
   ========================================= */

function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );
}

/* =========================================
   5. TOAST NOTIFICATION
   ========================================= */

function showToast(message, type = "info") {
  const toast = getElement("toast");

  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* =========================================
   6. PAGE NAVIGATION
   ========================================= */

function showPage(pageName) {
  const pageId = `page-${pageName}`;

  const targetPage = getElement(pageId);

  if (!targetPage) {
    showToast("यह पेज अभी उपलब्ध नहीं है।");
    return;
  }

  $$("[id^='page-']").forEach((page) => {
    page.classList.remove("active");
  });

  targetPage.classList.add("active");

  APP_STATE.currentPage = pageName;

  const title = getElement("pageTitle");

  if (title) {
    title.textContent =
      pageName.charAt(0).toUpperCase() +
      pageName.slice(1);
  }

  const breadcrumb = getElement("breadcrumb");

  if (breadcrumb) {
    breadcrumb.textContent = pageName;
  }

  getElement("sidebar")?.classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================
   7. NAVIGATION EVENTS
   ========================================= */

document.addEventListener("click", (event) => {

  const navItem = event.target.closest("[data-page]");

  if (navItem) {
    event.preventDefault();

    const pageName = navItem.dataset.page;

    showPage(pageName);
  }

});

/* =========================================
   8. MOBILE SIDEBAR
   ========================================= */

getElement("sideToggle")?.addEventListener(
  "click",
  () => {
    getElement("sidebar")?.classList.toggle("open");
  }
);

/* =========================================
   9. PUBLIC WEBSITE NAVIGATION
   ========================================= */

getElement("mobileMenu")?.addEventListener(
  "click",
  () => {
    const nav = $(".public-nav");

    nav?.classList.toggle("open");
  }
);

/* =========================================
   10. APPLICATION UTILITIES
   ========================================= */

function setLoading(status) {
  APP_STATE.isLoading = Boolean(status);

  document.body.classList.toggle(
    "app-loading",
    APP_STATE.isLoading
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "—";

  return new Date(dateValue).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

/* =========================================
   END OF PART 4A
   NEXT: PART 4B
   ========================================= */