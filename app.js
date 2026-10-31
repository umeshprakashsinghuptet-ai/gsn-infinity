/* =========================================
   UPS CREATOR STUDIO
   MAIN APPLICATION ENGINE
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

  isLoading: false,
  authMode: "login"
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
    showPage(navItem.dataset.page);
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
   ========================================= */