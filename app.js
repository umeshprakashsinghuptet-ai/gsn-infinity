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
   ========================================= 
/* =========================================
   PART 4B — AUTHENTICATION SYSTEM
   ========================================= */

/* 1. OPEN AUTH MODAL */

function openAuthModal(mode = "login") {

  const modal = getElement("authModal");

  if (!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  setAuthMode(mode);
}

/* 2. CLOSE AUTH MODAL */

function closeAuthModal() {

  const modal = getElement("authModal");

  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

/* 3. LOGIN / SIGNUP MODE */

function setAuthMode(mode) {

  const isSignup = mode === "signup";

  const title = getElement("authTitle");
  const subtitle = getElement("authSubtitle");
  const submit = getElement("authSubmit");
  const switchButton = getElement("authSwitch");
  const message = getElement("authMessage");

  if (title) {
    title.textContent = isSignup
      ? "Create Your Account"
      : "Welcome Back";
  }

  if (subtitle) {
    subtitle.textContent = isSignup
      ? "Join UPS Creator Studio"
      : "Login to your creative workspace";
  }

  if (submit) {
    submit.textContent = isSignup
      ? "Create Account"
      : "Login";
  }

  if (switchButton) {
    switchButton.textContent = isSignup
      ? "Already have an account? Login"
      : "New here? Create an account";
  }

  if (message) {
    message.textContent = "";
  }

  APP_STATE.authMode = mode;
}

/* 4. AUTH BUTTON EVENTS */

getElement("loginOpen")?.addEventListener(
  "click",
  () => openAuthModal("login")
);

getElement("getStarted")?.addEventListener(
  "click",
  () => openAuthModal("signup")
);

getElement("heroStart")?.addEventListener(
  "click",
  () => openAuthModal("signup")
);

getElement("modalClose")?.addEventListener(
  "click",
  closeAuthModal
);

getElement("authSwitch")?.addEventListener(
  "click",
  () => {

    const nextMode =
      APP_STATE.authMode === "signup"
        ? "login"
        : "signup";

    setAuthMode(nextMode);
  }
);

/* 5. AUTH MESSAGE */

function showAuthMessage(message, type = "error") {

  const box = getElement("authMessage");

  if (!box) return;

  box.textContent = message;
  box.dataset.type = type;
}

/* 6. AUTH FORM SUBMISSION */

getElement("authForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (!supabase) {
      showAuthMessage(
        "Supabase configuration check करें।"
      );
      return;
    }

    const email =
      getElement("authEmail")?.value.trim();

    const password =
      getElement("authPassword")?.value;

    if (!email || !password) {
      showAuthMessage(
        "Email और password दोनों भरें।"
      );
      return;
    }

    if (password.length < 6) {
      showAuthMessage(
        "Password कम से कम 6 characters का होना चाहिए।"
      );
      return;
    }

    const submit = getElement("authSubmit");

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Please wait...";
    }

    try {

      let result;

      if (APP_STATE.authMode === "signup") {

        result = await supabase.auth.signUp({
          email,
          password
        });

      } else {

        result = await supabase.auth.signInWithPassword({
          email,
          password
        });

      }

      if (result.error) {
        throw result.error;
      }

      if (APP_STATE.authMode === "signup") {

        if (!result.data.session) {

          showAuthMessage(
            "Account request सफल हुई। Email verification की जरूरत हो सकती है।",
            "success"
          );

        } else {

          showToast(
            "Account created successfully!",
            "success"
          );

          closeAuthModal();
        }

      } else {

        showToast(
          "Login successful!",
          "success"
        );

        closeAuthModal();
      }

    } catch (error) {

      showAuthMessage(
        error.message || "Authentication failed."
      );

    } finally {

      if (submit) {
        submit.disabled = false;

        submit.textContent =
          APP_STATE.authMode === "signup"
            ? "Create Account"
            : "Login";
      }

    }

  }
);

/* 7. LOAD USER PROFILE */

async function loadUserProfile(user) {

  if (!supabase || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Profile loading error:",
      error
    );

    return null;
  }

  APP_STATE.profile = data;

  return data;
}

/* 8. UPDATE AUTH UI */

function updateAuthUI(user, profile = null) {

  const publicView = getElement("publicView");
  const appView = getElement("appView");

  const isLoggedIn = Boolean(user);

  if (publicView) {
    publicView.hidden = isLoggedIn;
  }

  if (appView) {
    appView.hidden = !isLoggedIn;
  }

  if (!isLoggedIn) {

    APP_STATE.user = null;
    APP_STATE.profile = null;

    return;
  }

  APP_STATE.user = user;

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Creator";

  const welcomeName = getElement("welcomeName");
  const miniName = getElement("miniName");
  const miniRole = getElement("miniRole");

  if (welcomeName) {
    welcomeName.textContent = displayName;
  }

  if (miniName) {
    miniName.textContent = displayName;
  }

  if (miniRole) {
    miniRole.textContent =
      profile?.role || "tester";
  }

  const adminNav = getElement("adminNav");

  if (adminNav) {
    adminNav.hidden =
      profile?.role !== "super_admin";
  }

  const adminStatus = getElement("adminStatus");

  if (adminStatus) {
    adminStatus.textContent =
      profile?.role === "super_admin"
        ? "Administrator access detected."
        : "Standard user access.";
  }

}

/* 9. LOGOUT */

async function logoutUser() {

  if (!supabase) return;

  const { error } = await supabase.auth.signOut();

  if (error) {
    showToast(error.message, "error");
    return;
  }

  APP_STATE.user = null;
  APP_STATE.profile = null;
  APP_STATE.projects = [];

  updateAuthUI(null);

  showToast("You have been logged out.");

}

/* 10. LOGOUT BUTTONS */

getElement("logoutBtn")?.addEventListener(
  "click",
  logoutUser
);

getElement("topLogout")?.addEventListener(
  "click",
  logoutUser
);

/* =========================================
   END OF PART 4B
   ========================================= */