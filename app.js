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
   ========================================= 
/* =========================================
   PART 4C — SEVEN CREATIVE STUDIOS
   ========================================= */

/* 1. STUDIO INFORMATION */

const STUDIO_DATA = [

  {
    id: "video",
    name: "Video Studio",
    icon: "🎬",
    description: "Create engaging videos and reels.",
    outputs: ["Reels", "Shorts", "Long Videos"]
  },

  {
    id: "image",
    name: "Image Studio",
    icon: "🖼️",
    description: "Create creative AI image concepts.",
    outputs: ["AI Images", "Portraits", "Artwork"]
  },

  {
    id: "poster",
    name: "Poster Studio",
    icon: "🎨",
    description: "Design professional promotional posters.",
    outputs: ["Posters", "Banners", "Social Graphics"]
  },

  {
    id: "dance",
    name: "Dance Studio",
    icon: "💃",
    description: "Plan dance videos and choreography.",
    outputs: ["Dance Reels", "Choreography", "Music Scenes"]
  },

  {
    id: "film",
    name: "Film Maker Studio",
    icon: "🎥",
    description: "Develop cinematic film concepts.",
    outputs: ["Short Films", "Scenes", "Storyboards"]
  },

  {
    id: "podcast",
    name: "Podcast Studio",
    icon: "🎙️",
    description: "Create professional podcast scripts.",
    outputs: ["Interviews", "Discussions", "Episodes"]
  },

  {
    id: "education",
    name: "Education Studio",
    icon: "📚",
    description: "Create educational and learning content.",
    outputs: ["MCQ", "GK", "Lessons", "Explainers"]
  }

];

/* 2. CREATE STUDIO CARD */

function createStudioCard(studio) {

  return `
    <article class="studio-card panel">

      <div class="studio-icon">
        ${studio.icon}
      </div>

      <h3>${escapeHTML(studio.name)}</h3>

      <p>${escapeHTML(studio.description)}</p>

      <div class="studio-tags">
        ${studio.outputs.map(output => `
          <span class="tag">
            ${escapeHTML(output)}
          </span>
        `).join("")}
      </div>

      <button
        class="btn btn-primary studio-open"
        data-studio="${escapeHTML(studio.id)}"
        type="button"
      >
        Open Studio →
      </button>

    </article>
  `;
}

/* 3. RENDER ALL STUDIOS */

function renderStudios() {

  const publicContainer =
    getElement("publicStudios");

  const appContainer =
    getElement("allStudios");

  const cards = STUDIO_DATA
    .map(createStudioCard)
    .join("");

  if (publicContainer) {
    publicContainer.innerHTML = cards;
  }

  if (appContainer) {
    appContainer.innerHTML = cards;
  }

}

/* 4. OPEN SELECTED STUDIO */

function openStudio(studioId) {

  const studio = STUDIO_DATA.find(
    item => item.id === studioId
  );

  if (!studio) {
    showToast("Studio not found.", "error");
    return;
  }

  APP_STATE.currentStudio = studio;

  APP_STATE.wizard = {
    mode: "AUTO",
    step: 0,
    answers: {
      studio: studio.id
    },
    questions: [],
    completed: false
  };

  showPage("wizard");

  const title = getElement("pageTitle");

  if (title) {
    title.textContent = studio.name;
  }

  const questionArea = getElement("questionArea");

  if (questionArea) {

    questionArea.innerHTML = `
      <div class="recommendation">

        <h3>
          ${studio.icon}
          ${escapeHTML(studio.name)}
        </h3>

        <p>
          ${escapeHTML(studio.description)}
        </p>

        <p><strong>Available outputs:</strong></p>

        <p>
          ${studio.outputs
            .map(escapeHTML)
            .join(" • ")}
        </p>

        <button
          class="btn btn-primary"
          id="startStudioWizard"
          type="button"
        >
          Start Auto-Pilot →
        </button>

      </div>
    `;
  }

  getElement("startStudioWizard")?.addEventListener(
    "click",
    () => startWizard(studio.id)
  );

}

/* 5. STUDIO CLICK EVENTS */

document.addEventListener("click", (event) => {

  const button = event.target.closest(
    "[data-studio]"
  );

  if (!button) return;

  const studioId = button.dataset.studio;

  if (!APP_STATE.user) {
    openAuthModal("login");
    showToast("पहले Login करें।");
    return;
  }

  openStudio(studioId);

});

/* 6. INITIAL STUDIO RENDER */

renderStudios();

/* =========================================
   END OF PART 4C
   ========================================= /* =========================================
   PART 4D — AUTO-PILOT WIZARD ENGINE
   ========================================= */

/* 1. WIZARD QUESTION BANK */

const WIZARD_QUESTIONS = [

  {
    id: "platform",
    title: "आप किस Platform के लिए Content बनाना चाहते हैं?",
    description: "अपना Publishing Platform चुनें।",
    type: "select",
    options: [
      "YouTube",
      "Facebook",
      "Instagram",
      "Multi-platform"
    ],
    default: "Multi-platform"
  },

  {
    id: "output",
    title: "आप क्या बनाना चाहते हैं?",
    description: "अपने Content का Output चुनें।",
    type: "select",
    options: [
      "Video",
      "Image",
      "Poster",
      "Reel",
      "Short Film",
      "Podcast",
      "Educational Content"
    ],
    default: "Video"
  },

  {
    id: "audience",
    title: "आपकी Target Audience कौन है?",
    description: "Content किसके लिए बनाया जाएगा?",
    type: "select",
    options: [
      "India",
      "USA",
      "Global Audience",
      "Students",
      "General Audience"
    ],
    default: "India"
  },

  {
    id: "language",
    title: "Content की Language चुनें।",
    description: "आपके Content में कौन-सी भाषा होगी?",
    type: "select",
    options: [
      "Hindi",
      "English",
      "Hindi + English"
    ],
    default: "Hindi + English"
  },

  {
    id: "category",
    title: "Content की Category चुनें।",
    description: "किस प्रकार का Content बनाना है?",
    type: "select",
    options: [
      "Motivational",
      "Educational",
      "Entertainment",
      "Facts",
      "Podcast",
      "Music",
      "Dance",
      "Vlog",
      "Business",
      "Auto-Detect"
    ],
    default: "Auto-Detect"
  },

  {
    id: "topic",
    title: "अपना Topic लिखें।",
    description: "AUTO मोड में खाली छोड़ने पर सुझाव तैयार होगा।",
    type: "text",
    placeholder: "अपना Topic यहाँ लिखें...",
    optional: true
  },

  {
    id: "duration",
    title: "Video की Duration चुनें।",
    description: "आपके Video की कुल अवधि कितनी होगी?",
    type: "select",
    options: [
      "10 Seconds",
      "15 Seconds",
      "30 Seconds",
      "60 Seconds",
      "2 Minutes",
      "5 Minutes",
      "10 Minutes"
    ],
    default: "30 Seconds",
    condition: {
      output: [
        "Video",
        "Reel",
        "Short Film",
        "Podcast"
      ]
    }
  },

  {
    id: "aspectRatio",
    title: "Video या Image का Ratio चुनें।",
    description: "Platform के अनुसार बेहतर Ratio चुनें।",
    type: "select",
    options: [
      "9:16",
      "16:9",
      "1:1",
      "3:4"
    ],
    default: "9:16"
  },

  {
    id: "mode",
    title: "Creation Mode चुनें।",
    description: "आप कितनी चीजें खुद तय करना चाहते हैं?",
    type: "select",
    options: [
      "AUTO",
      "MANUAL"
    ],
    default: "AUTO"
  }

];

/* 2. FILTER ACTIVE QUESTIONS */

function getActiveQuestions() {

  const answers = APP_STATE.wizard.answers;

  return WIZARD_QUESTIONS.filter(question => {

    if (!question.condition) return true;

    const requiredValues =
      question.condition.output || [];

    return requiredValues.includes(answers.output);

  });

}

/* 3. START WIZARD */

function startWizard(studioId) {

  const studio = STUDIO_DATA.find(
    item => item.id === studioId
  );

  if (!studio) return;

  APP_STATE.currentStudio = studio;

  APP_STATE.wizard.answers.studio = studio.id;
  APP_STATE.wizard.step = 0;
  APP_STATE.wizard.completed = false;

  renderWizardQuestion();

}

/* 4. SET WIZARD MODE */

function setWizardMode(mode) {

  APP_STATE.wizard.mode =
    mode === "MANUAL" ? "MANUAL" : "AUTO";

  APP_STATE.wizard.answers.mode =
    APP_STATE.wizard.mode;

  renderWizardQuestion();

}

/* 5. SAVE CURRENT ANSWER */

function saveWizardAnswer() {

  const questions = getActiveQuestions();

  const question =
    questions[APP_STATE.wizard.step];

  if (!question) return true;

  const input = getElement("wizardAnswer");

  if (!input) return true;

  const value = input.value.trim();

  if (!value && !question.optional) {

    showToast(
      "कृपया अपना जवाब चुनें।",
      "error"
    );

    return false;
  }

  if (value) {
    APP_STATE.wizard.answers[question.id] = value;
  }

  return true;

}

/* 6. RENDER QUESTION */

function renderWizardQuestion() {

  const area = getElement("questionArea");

  if (!area) return;

  const questions = getActiveQuestions();

  const step = APP_STATE.wizard.step;

  const question = questions[step];

  if (!question) {
    finishWizard();
    return;
  }

  const savedValue =
    APP_STATE.wizard.answers[question.id] ||
    question.default ||
    "";

  let inputHTML = "";

  if (question.type === "select") {

    inputHTML = `
      <select id="wizardAnswer">

        <option value="">
          Select an option
        </option>

        ${question.options.map(option => `
          <option
            value="${escapeHTML(option)}"
            ${savedValue === option ? "selected" : ""}
          >
            ${escapeHTML(option)}
          </option>
        `).join("")}

      </select>
    `;

  } else {

    inputHTML = `
      <input
        id="wizardAnswer"
        type="text"
        maxlength="200"
        placeholder="${escapeHTML(question.placeholder || "")}"
        value="${escapeHTML(savedValue)}"
      >
    `;

  }

  area.innerHTML = `

    <div class="wizard-question">

      <div class="question-count">
        Question ${step + 1} of ${questions.length}
      </div>

      <h2>${escapeHTML(question.title)}</h2>

      <p>${escapeHTML(question.description)}</p>

      <div class="wizard-input">
        ${inputHTML}
      </div>

      <div class="wizard-mode-control">

        <button
          type="button"
          class="btn btn-secondary"
          data-wizard-mode="AUTO"
        >
          AUTO
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          data-wizard-mode="MANUAL"
        >
          MANUAL
        </button>

      </div>

      <p class="wizard-mode-label">
        Current Mode: ${APP_STATE.wizard.mode}
      </p>

    </div>

  `;

  const stepLabel = getElement("wizardStep");

  if (stepLabel) {
    stepLabel.textContent =
      `${step + 1} / ${questions.length}`;
  }

  const progress = getElement("wizardProgress");

  if (progress) {
    progress.style.width =
      `${((step + 1) / questions.length) * 100}%`;
  }

  const backButton = getElement("wizardBack");

  if (backButton) {
    backButton.disabled = step === 0;
  }

}

/* 7. MODE BUTTON EVENTS */

document.addEventListener("click", event => {

  const button = event.target.closest(
    "[data-wizard-mode]"
  );

  if (!button) return;

  setWizardMode(button.dataset.wizardMode);

});

/* 8. NEXT QUESTION */

getElement("wizardNext")?.addEventListener(
  "click",
  () => {

    if (!saveWizardAnswer()) return;

    APP_STATE.wizard.step++;

    renderWizardQuestion();

  }
);

/* 9. PREVIOUS QUESTION */

getElement("wizardBack")?.addEventListener(
  "click",
  () => {

    saveWizardAnswer();

    if (APP_STATE.wizard.step > 0) {

      APP_STATE.wizard.step--;

      renderWizardQuestion();

    }

  }
);

/* 10. SKIP OPTIONAL QUESTION */

getElement("wizardSkip")?.addEventListener(
  "click",
  () => {

    const questions = getActiveQuestions();

    const question =
      questions[APP_STATE.wizard.step];

    if (question?.optional) {

      APP_STATE.wizard.step++;

      renderWizardQuestion();

    } else {

      showToast(
        "यह सवाल जरूरी है। इसे Skip नहीं कर सकते।"
      );

    }

  }
);

/* =========================================
   END OF PART 4D
   ========================================= */