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
   ========================================= 
/* =========================================
   PART 4E — CREATIVE BRIEF ENGINE
   ========================================= */

/* 1. AUTO TOPIC SUGGESTIONS */

const TOPIC_SUGGESTIONS = {
  Motivational: [
    "छोटी शुरुआत, बड़ी सफलता",
    "समय की कीमत समझिए",
    "आत्मविश्वास की ताकत"
  ],

  Educational: [
    "आज का महत्वपूर्ण सामान्य ज्ञान",
    "विज्ञान के रोचक तथ्य",
    "भारत का इतिहास"
  ],

  Entertainment: [
    "रोजमर्रा की जिंदगी के मजेदार पल",
    "एक दिलचस्प कहानी",
    "मनोरंजन की दुनिया"
  ],

  Facts: [
    "दुनिया के 5 रोचक तथ्य",
    "अंतरिक्ष के अनोखे रहस्य",
    "प्रकृति के अद्भुत तथ्य"
  ],

  Podcast: [
    "सफलता और संघर्ष पर बातचीत",
    "जीवन के अनुभव",
    "समाज और बदलती सोच"
  ],

  Music: [
    "संगीत की यादगार धुनें",
    "संगीत का भावनात्मक प्रभाव"
  ],

  Dance: [
    "ऊर्जावान डांस परफॉर्मेंस",
    "क्लासिकल और मॉडर्न डांस"
  ],

  Vlog: [
    "एक दिन की खास यात्रा",
    "मेरी दिनचर्या के खास पल"
  ],

  Business: [
    "बिजनेस शुरू करने की बुनियादी बातें",
    "ग्राहकों से बेहतर संवाद"
  ],

  "Auto-Detect": [
    "आज का नया और उपयोगी विषय",
    "एक रोचक जानकारी जो हर किसी को जाननी चाहिए",
    "सीखने योग्य एक महत्वपूर्ण बात"
  ]
};

/* 2. SELECT AUTO TOPIC */

function getAutoTopic(category) {

  const topics =
    TOPIC_SUGGESTIONS[category] ||
    TOPIC_SUGGESTIONS["Auto-Detect"];

  const index = Math.floor(
    Math.random() * topics.length
  );

  return topics[index];

}

/* 3. RECOMMEND ASPECT RATIO */

function recommendAspectRatio(platform) {

  const recommendations = {
    "YouTube": "16:9",
    "Facebook": "9:16",
    "Instagram": "9:16",
    "Multi-platform": "9:16"
  };

  return recommendations[platform] || "9:16";

}

/* 4. BUILD CREATIVE BRIEF */

function buildCreativeBrief() {

  const answers = APP_STATE.wizard.answers;

  const category =
    answers.category || "Auto-Detect";

  let topic = answers.topic;

  if (!topic) {
    topic = getAutoTopic(category);
    answers.topic = topic;
  }

  const platform =
    answers.platform || "Multi-platform";

  const output =
    answers.output || "Video";

  const ratio =
    answers.aspectRatio ||
    recommendAspectRatio(platform);

  const studio =
    APP_STATE.currentStudio?.name || "Creative Studio";

  return {

    studio,
    platform,
    output,
    audience: answers.audience || "India",
    language: answers.language || "Hindi + English",
    category,
    topic,
    duration: answers.duration || "Not applicable",
    aspectRatio: ratio,
    mode: answers.mode || APP_STATE.wizard.mode,
    createdAt: new Date().toISOString()

  };

}

/* 5. RENDER CREATIVE BRIEF */

function renderCreativeBrief(brief) {

  const area = getElement("questionArea");

  if (!area) return;

  const rows = [
    ["Studio", brief.studio],
    ["Platform", brief.platform],
    ["Output", brief.output],
    ["Audience", brief.audience],
    ["Language", brief.language],
    ["Category", brief.category],
    ["Topic", brief.topic],
    ["Duration", brief.duration],
    ["Aspect Ratio", brief.aspectRatio],
    ["Creation Mode", brief.mode]
  ];

  area.innerHTML = `

    <div class="recommendation">

      <h2>✨ Your Creative Brief</h2>

      <p>
        आपकी चुनी हुई जानकारी के आधार पर
        Production Brief तैयार है।
      </p>

      <div class="brief-details">

        ${rows.map(([label, value]) => `
          <div class="brief-row">
            <strong>${escapeHTML(label)}</strong>
            <span>${escapeHTML(value)}</span>
          </div>
        `).join("")}

      </div>

      <div class="wizard-controls">

        <button
          class="btn btn-secondary"
          id="editBrief"
          type="button"
        >
          ← Edit Answers
        </button>

        <button
          class="btn btn-primary"
          id="copyBrief"
          type="button"
        >
          Copy Brief
        </button>

        <button
          class="btn btn-secondary"
          id="downloadBrief"
          type="button"
        >
          Download TXT
        </button>

      </div>

    </div>

  `;

  getElement("editBrief")?.addEventListener(
    "click",
    () => {
      APP_STATE.wizard.step = 0;
      APP_STATE.wizard.completed = false;
      renderWizardQuestion();
    }
  );

  getElement("copyBrief")?.addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          formatBriefText(brief)
        );

        showToast("Creative Brief copied!", "success");

      } catch {

        showToast(
          "Copy सुविधा उपलब्ध नहीं है।",
          "error"
        );

      }

    }
  );

  getElement("downloadBrief")?.addEventListener(
    "click",
    () => downloadBriefText(brief)
  );

}

/* 6. FORMAT BRIEF TEXT */

function formatBriefText(brief) {

  return [
    "UPS CREATOR STUDIO",
    "CREATIVE PRODUCTION BRIEF",
    "",
    `Studio: ${brief.studio}`,
    `Platform: ${brief.platform}`,
    `Output: ${brief.output}`,
    `Audience: ${brief.audience}`,
    `Language: ${brief.language}`,
    `Category: ${brief.category}`,
    `Topic: ${brief.topic}`,
    `Duration: ${brief.duration}`,
    `Aspect Ratio: ${brief.aspectRatio}`,
    `Mode: ${brief.mode}`,
    "",
    "Imagine. Create. Innovate."
  ].join("\n");

}

/* 7. DOWNLOAD BRIEF */

function downloadBriefText(brief) {

  const blob = new Blob(
    [formatBriefText(brief)],
    { type: "text/plain;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "UPS-Creative-Brief.txt";

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Brief downloaded!", "success");

}

/* 8. FINISH WIZARD */

function finishWizard() {

  if (APP_STATE.wizard.completed) return;

  APP_STATE.wizard.completed = true;

  const brief = buildCreativeBrief();

  APP_STATE.wizard.brief = brief;

  renderCreativeBrief(brief);

}

/* =========================================
   END OF PART 4E
   ========================================= 
/* =========================================
   PART 4F — PROJECT MANAGEMENT SYSTEM
   ========================================= */

/* 1. PROJECT STORAGE KEY */

const PROJECT_STORAGE_KEY = "ups_creator_projects_v1";

/* 2. LOAD LOCAL PROJECTS */

function loadLocalProjects() {

  try {

    const saved = localStorage.getItem(
      PROJECT_STORAGE_KEY
    );

    APP_STATE.projects = saved
      ? JSON.parse(saved)
      : [];

    if (!Array.isArray(APP_STATE.projects)) {
      APP_STATE.projects = [];
    }

  } catch (error) {

    console.error("Project loading error:", error);

    APP_STATE.projects = [];

  }

  return APP_STATE.projects;
}

/* 3. SAVE PROJECTS TO LOCAL STORAGE */

function persistLocalProjects() {

  try {

    localStorage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify(APP_STATE.projects)
    );

    return true;

  } catch (error) {

    console.error("Project saving error:", error);

    showToast(
      "Project save नहीं हो पाया। Browser storage check करें।",
      "error"
    );

    return false;

  }

}

/* 4. CREATE PROJECT FROM BRIEF */

function createProjectFromBrief(brief) {

  const project = {

    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `project_${Date.now()}`,

    title: brief.topic || "Untitled Project",

    studio: brief.studio,

    output: brief.output,

    platform: brief.platform,

    category: brief.category,

    brief: brief,

    status: "Draft",

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString()

  };

  return project;

}

/* 5. SAVE CURRENT PROJECT */

function saveCurrentProject() {

  const brief = APP_STATE.wizard.brief;

  if (!brief) {

    showToast(
      "पहले Creative Brief तैयार करें।",
      "error"
    );

    return;

  }

  const project = createProjectFromBrief(brief);

  APP_STATE.projects.unshift(project);

  if (!persistLocalProjects()) {

    APP_STATE.projects.shift();

    return;

  }

  showToast(
    "Project successfully saved!",
    "success"
  );

  renderDashboardProjects();

}

/* 6. ADD SAVE BUTTON TO CREATIVE BRIEF */

const originalRenderCreativeBrief =
  renderCreativeBrief;

renderCreativeBrief = function(brief) {

  originalRenderCreativeBrief(brief);

  const container = $(
    "#questionArea .recommendation"
  );

  if (!container) return;

  const saveButton = document.createElement("button");

  saveButton.type = "button";
  saveButton.id = "saveCurrentProject";
  saveButton.className = "btn btn-primary";
  saveButton.textContent = "💾 Save Project";

  container.appendChild(saveButton);

  saveButton.addEventListener(
    "click",
    saveCurrentProject
  );

};

/* 7. DELETE PROJECT */

function deleteProject(projectId) {

  const previousProjects = [...APP_STATE.projects];

  APP_STATE.projects =
    APP_STATE.projects.filter(
      project => project.id !== projectId
    );

  if (!persistLocalProjects()) {

    APP_STATE.projects = previousProjects;

    return;

  }

  showToast("Project deleted.", "success");

  renderDashboardProjects();

}

/* 8. RENDER PROJECT CARD */

function createProjectCard(project) {

  return `

    <article class="project-card panel">

      <div class="project-card-header">

        <span class="tag">
          ${escapeHTML(project.studio)}
        </span>

        <span class="tag">
          ${escapeHTML(project.status)}
        </span>

      </div>

      <h3>
        ${escapeHTML(project.title)}
      </h3>

      <p>
        ${escapeHTML(project.output)}
        ·
        ${escapeHTML(project.platform)}
      </p>

      <small>
        Created: ${formatDate(project.createdAt)}
      </small>

      <div class="project-actions">

        <button
          type="button"
          class="btn btn-secondary"
          data-view-project="${escapeHTML(project.id)}"
        >
          View Brief
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          data-delete-project="${escapeHTML(project.id)}"
        >
          Delete
        </button>

      </div>

    </article>

  `;

}

/* 9. RENDER PROJECT LIST */

function renderDashboardProjects() {

  const recentContainer =
    getElement("recentProjects");

  const projectContainer =
    getElement("allProjects");

  const projects = APP_STATE.projects;

  if (recentContainer) {

    recentContainer.innerHTML = projects.length
      ? projects.slice(0, 5)
          .map(createProjectCard)
          .join("")
      : "<p>No projects saved yet.</p>";

  }

  if (projectContainer) {

    projectContainer.innerHTML = projects.length
      ? projects.map(createProjectCard).join("")
      : "<p>No projects saved yet.</p>";

  }

  const count = getElement("projectCount");

  if (count) {
    count.textContent = projects.length;
  }

}

/* 10. PROJECT ACTION EVENTS */

document.addEventListener("click", event => {

  const deleteButton = event.target.closest(
    "[data-delete-project]"
  );

  if (deleteButton) {

    const projectId =
      deleteButton.dataset.deleteProject;

    deleteProject(projectId);

    return;

  }

  const viewButton = event.target.closest(
    "[data-view-project]"
  );

  if (viewButton) {

    const project = APP_STATE.projects.find(
      item => item.id === viewButton.dataset.viewProject
    );

    if (!project) return;

    showPage("wizard");

    const area = getElement("questionArea");

    if (area) {
      renderCreativeBrief(project.brief);
    }

  }

});

/* 11. INITIAL PROJECT LOAD */

loadLocalProjects();

renderDashboardProjects();

/* =========================================
   END OF PART 4F
   ========================================= 
/* =========================================
   PART 4G — PROFILE & BRANDING SYSTEM
   ========================================= */

/* 1. PROFILE BRANDING STORAGE */

function getBrandingStorageKey() {

  const userId = APP_STATE.user?.id;

  return userId
    ? `ups_branding_${userId}`
    : "ups_branding_guest";

}

/* 2. LOAD BRANDING DATA */

function loadBrandingData() {

  try {

    const saved = localStorage.getItem(
      getBrandingStorageKey()
    );

    return saved ? JSON.parse(saved) : {
      brand: "",
      tagline: ""
    };

  } catch (error) {

    console.error("Branding load error:", error);

    return {
      brand: "",
      tagline: ""
    };

  }

}

/* 3. SAVE BRANDING DATA */

function saveBrandingData(data) {

  try {

    localStorage.setItem(
      getBrandingStorageKey(),
      JSON.stringify(data)
    );

    return true;

  } catch (error) {

    console.error("Branding save error:", error);

    return false;

  }

}

/* 4. LOAD PROFILE INTO FORM */

function renderProfileForm() {

  const profile = APP_STATE.profile || {};
  const branding = loadBrandingData();

  const nameInput = getElement("profileName");
  const brandInput = getElement("profileBrand");
  const taglineInput = getElement("profileTagline");

  if (nameInput) {
    nameInput.value = profile.full_name || "";
  }

  if (brandInput) {
    brandInput.value = branding.brand || "";
  }

  if (taglineInput) {
    taglineInput.value = branding.tagline || "";
  }

}

/* 5. PROFILE MESSAGE */

function showProfileMessage(message, type = "info") {

  const box = getElement("profileMessage");

  if (!box) return;

  box.textContent = message;
  box.dataset.type = type;

}

/* 6. SAVE PROFILE */

getElement("profileForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (!APP_STATE.user || !supabase) {

      showProfileMessage(
        "Profile update करने के लिए Login करें।",
        "error"
      );

      return;

    }

    const fullName =
      getElement("profileName")?.value.trim() || "";

    const brand =
      getElement("profileBrand")?.value.trim() || "";

    const tagline =
      getElement("profileTagline")?.value.trim() || "";

    if (!fullName) {

      showProfileMessage(
        "कृपया अपना नाम भरें।",
        "error"
      );

      return;

    }

    try {

      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: APP_STATE.user.id,
            full_name: fullName
          },
          {
            onConflict: "user_id"
          }
        )
        .select()
        .single();

      if (error) throw error;

      const brandingSaved = saveBrandingData({
        brand,
        tagline
      });

      if (!brandingSaved) {
        throw new Error(
          "Branding browser storage में सेव नहीं हो पाई।"
        );
      }

      APP_STATE.profile = data;

      updateAuthUI(
        APP_STATE.user,
        APP_STATE.profile
      );

      showProfileMessage(
        "Profile successfully updated!",
        "success"
      );

      showToast(
        "Profile saved successfully!",
        "success"
      );

    } catch (error) {

      console.error("Profile update error:", error);

      showProfileMessage(
        error.message || "Profile update failed.",
        "error"
      );

    }

  }
);

/* 7. PROFILE PHOTO LOCAL PREVIEW */

getElement("photoInput")?.addEventListener(
  "change",
  (event) => {

    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      showToast(
        "कृपया image file चुनें।",
        "error"
      );

      event.target.value = "";

      return;

    }

    if (
      file.size >
      APP_CONFIG.MAX_PROFILE_IMAGE_SIZE
    ) {

      showToast(
        "Image का size 5 MB से कम होना चाहिए।",
        "error"
      );

      event.target.value = "";

      return;

    }

    const preview =
      getElement("profilePhotoPreview");

    if (!preview) return;

    const oldUrl = preview.dataset.previewUrl;

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }

    const imageUrl = URL.createObjectURL(file);

    preview.dataset.previewUrl = imageUrl;

    if (preview.tagName === "IMG") {

      preview.src = imageUrl;

    } else {

      preview.style.backgroundImage =
        `url("${imageUrl}")`;

    }

    showToast(
      "Photo preview तैयार है। Cloud upload अभी सक्रिय नहीं है।"
    );

  }
);

/* 8. INITIAL PROFILE FORM */

renderProfileForm();
/* =========================================
   PART 4H — DASHBOARD SYSTEM
   ========================================= */

/* 1. DASHBOARD GREETING */

function getDashboardGreeting() {

  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";

  if (hour < 17) return "Good Afternoon";

  return "Good Evening";

}

/* 2. UPDATE DASHBOARD WELCOME */

function updateDashboardWelcome() {

  const greeting = getDashboardGreeting();

  const userName =
    APP_STATE.profile?.full_name ||
    APP_STATE.user?.user_metadata?.full_name ||
    APP_STATE.user?.email?.split("@")[0] ||
    "Creator";

  const welcomeName = getElement("welcomeName");

  if (welcomeName) {
    welcomeName.textContent =
      `${greeting}, ${userName}!`;
  }

}

/* 3. DASHBOARD STATISTICS */

function renderDashboardStats() {

  const projects = APP_STATE.projects || [];

  const totalProjects = projects.length;

  const draftProjects = projects.filter(
    project => project.status === "Draft"
  ).length;

  const completedProjects = projects.filter(
    project => project.status === "Completed"
  ).length;

  const statsContainer = $(
    "#page-dashboard .dashboard-stats"
  );

  if (statsContainer) {

    statsContainer.innerHTML = `

      <div class="metric-card panel">

        <span class="metric-label">
          Total Projects
        </span>

        <strong class="metric-value">
          ${totalProjects}
        </strong>

        <span class="metric-note">
          Your saved projects
        </span>

      </div>

      <div class="metric-card panel">

        <span class="metric-label">
          Draft Projects
        </span>

        <strong class="metric-value">
          ${draftProjects}
        </strong>

        <span class="metric-note">
          Projects in progress
        </span>

      </div>

      <div class="metric-card panel">

        <span class="metric-label">
          Completed Projects
        </span>

        <strong class="metric-value">
          ${completedProjects}
        </strong>

        <span class="metric-note">
          Finished projects
        </span>

      </div>

      <div class="metric-card panel">

        <span class="metric-label">
          Available Studios
        </span>

        <strong class="metric-value">
          ${STUDIO_DATA.length}
        </strong>

        <span class="metric-note">
          Creative production studios
        </span>

      </div>

    `;

  }

  const projectCount = getElement("projectCount");

  if (projectCount) {
    projectCount.textContent = totalProjects;
  }

}

/* 4. DASHBOARD STUDIO CARDS */

function renderDashboardStudios() {

  const container =
    getElement("dashboardStudios");

  if (!container) return;

  container.innerHTML = STUDIO_DATA.map(studio => `

    <button
      type="button"
      class="dashboard-studio-card panel"
      data-dashboard-studio="${escapeHTML(studio.id)}"
    >

      <span class="studio-icon">
        ${studio.icon}
      </span>

      <strong>
        ${escapeHTML(studio.name)}
      </strong>

      <small>
        ${escapeHTML(studio.description)}
      </small>

      <span class="studio-card-action">
        Open Studio →
      </span>

    </button>

  `).join("");

}

/* 5. DASHBOARD STUDIO EVENTS */

document.addEventListener("click", event => {

  const button = event.target.closest(
    "[data-dashboard-studio]"
  );

  if (!button) return;

  const studioId =
    button.dataset.dashboardStudio;

  if (!APP_STATE.user) {
    openAuthModal("login");
    return;
  }

  openStudio(studioId);

});

/* 6. RECENT PROJECTS */

function renderRecentProjects() {

  const container =
    getElement("recentProjects");

  if (!container) return;

  const recentProjects =
    APP_STATE.projects.slice(0, 5);

  if (!recentProjects.length) {

    container.innerHTML = `
      <div class="empty-state">

        <h3>No Projects Yet</h3>

        <p>
          अपना पहला Creative Project शुरू करें।
        </p>

        <button
          type="button"
          class="btn btn-primary"
          data-dashboard-action="create"
        >
          Create Your First Project
        </button>

      </div>
    `;

    return;

  }

  container.innerHTML = recentProjects
    .map(createProjectCard)
    .join("");

}

/* 7. DASHBOARD QUICK ACTIONS */

document.addEventListener("click", event => {

  const button = event.target.closest(
    "[data-dashboard-action]"
  );

  if (!button) return;

  const action = button.dataset.dashboardAction;

  if (action === "create") {

    showPage("studios");

  }

  if (action === "projects") {

    showPage("projects");

  }

  if (action === "profile") {

    showPage("profile");
    renderProfileForm();

  }

});

/* 8. COMPLETE DASHBOARD RENDER */

function renderDashboard() {

  updateDashboardWelcome();

  renderDashboardStats();

  renderDashboardStudios();

  renderRecentProjects();

}

/* 9. DASHBOARD REFRESH */

function refreshDashboard() {

  loadLocalProjects();

  renderDashboard();

}

/* 10. DASHBOARD INITIAL RENDER */

renderDashboard();

/* =========================================
   END OF PART 4H
   ========================================= 
/* =========================================
   PART 4I — 50 CORE MODULES ENGINE
   ========================================= */

/* 1. CORE MODULE DATABASE */

const CORE_MODULES = [

  // THEME & PLANNING

  {
    id: 1,
    name: "Theme Engine",
    category: "Planning",
    description: "Selects suitable creative themes."
  },
  {
    id: 2,
    name: "Topic Discovery",
    category: "Planning",
    description: "Suggests relevant content topics."
  },
  {
    id: 3,
    name: "Audience Intelligence",
    category: "Planning",
    description: "Defines the intended audience."
  },
  {
    id: 4,
    name: "Platform Strategy",
    category: "Planning",
    description: "Plans content for publishing platforms."
  },
  {
    id: 5,
    name: "Content Category",
    category: "Planning",
    description: "Organizes content by category."
  },

  // STORY & SCRIPT

  {
    id: 6,
    name: "Story Engine",
    category: "Script",
    description: "Develops the main story structure."
  },
  {
    id: 7,
    name: "Script Writer",
    category: "Script",
    description: "Creates production scripts."
  },
  {
    id: 8,
    name: "Dialogue Engine",
    category: "Script",
    description: "Creates natural dialogue."
  },
  {
    id: 9,
    name: "Hook Generator",
    category: "Script",
    description: "Creates attention-grabbing openings."
  },
  {
    id: 10,
    name: "Narration Planner",
    category: "Script",
    description: "Plans voice narration."
  },

  // IDENTITY & PERFORMANCE

  {
    id: 11,
    name: "Identity Engine",
    category: "Identity",
    description: "Defines identity preservation requirements."
  },
  {
    id: 12,
    name: "Character Consistency",
    category: "Identity",
    description: "Maintains character continuity."
  },
  {
    id: 13,
    name: "Voice Planner",
    category: "Performance",
    description: "Plans voice characteristics."
  },
  {
    id: 14,
    name: "Pronunciation Checker",
    category: "Performance",
    description: "Reviews pronunciation requirements."
  },
  {
    id: 15,
    name: "Lip-Sync Planner",
    category: "Performance",
    description: "Plans dialogue and lip-sync alignment."
  },

  // VISUAL PRODUCTION

  {
    id: 16,
    name: "Scene Engine",
    category: "Visual",
    description: "Organizes scenes and sequences."
  },
  {
    id: 17,
    name: "Shot Planner",
    category: "Visual",
    description: "Plans camera shots."
  },
  {
    id: 18,
    name: "Camera Movement",
    category: "Visual",
    description: "Defines camera movement requirements."
  },
  {
    id: 19,
    name: "Lighting Designer",
    category: "Visual",
    description: "Plans lighting conditions."
  },
  {
    id: 20,
    name: "Background Designer",
    category: "Visual",
    description: "Defines background environments."
  },

  // CINEMATIC PRODUCTION

  {
    id: 21,
    name: "Cinematic Engine",
    category: "Cinematic",
    description: "Plans cinematic visual presentation."
  },
  {
    id: 22,
    name: "Color Grading",
    category: "Cinematic",
    description: "Defines color treatment."
  },
  {
    id: 23,
    name: "VFX Planner",
    category: "Cinematic",
    description: "Plans visual effects."
  },
  {
    id: 24,
    name: "Transition Designer",
    category: "Cinematic",
    description: "Plans scene transitions."
  },
  {
    id: 25,
    name: "Motion Graphics",
    category: "Cinematic",
    description: "Plans animated graphic elements."
  },

  // AUDIO PRODUCTION

  {
    id: 26,
    name: "Music Planner",
    category: "Audio",
    description: "Plans background music."
  },
  {
    id: 27,
    name: "Sound Effects",
    category: "Audio",
    description: "Plans sound effects."
  },
  {
    id: 28,
    name: "Audio Mixing",
    category: "Audio",
    description: "Defines audio mixing requirements."
  },
  {
    id: 29,
    name: "Voice Synchronization",
    category: "Audio",
    description: "Aligns voice and scene timing."
  },
  {
    id: 30,
    name: "Audio Quality",
    category: "Audio",
    description: "Reviews audio quality requirements."
  },

  // ACCURACY & LANGUAGE

  {
    id: 31,
    name: "Accuracy Engine",
    category: "Accuracy",
    description: "Reviews factual and production accuracy."
  },
  {
    id: 32,
    name: "Fact Verification",
    category: "Accuracy",
    description: "Identifies facts requiring verification."
  },
  {
    id: 33,
    name: "Hindi Typography",
    category: "Language",
    description: "Checks Hindi text presentation."
  },
  {
    id: 34,
    name: "Caption Generator",
    category: "Language",
    description: "Prepares caption text."
  },
  {
    id: 35,
    name: "Multilingual Support",
    category: "Language",
    description: "Plans multilingual content."
  },

  // IMAGE & DESIGN

  {
    id: 36,
    name: "Image Composition",
    category: "Design",
    description: "Plans image composition."
  },
  {
    id: 37,
    name: "Poster Designer",
    category: "Design",
    description: "Plans poster layouts."
  },
  {
    id: 38,
    name: "Typography Designer",
    category: "Design",
    description: "Plans typography and text hierarchy."
  },
  {
    id: 39,
    name: "Brand Identity",
    category: "Design",
    description: "Maintains brand presentation."
  },
  {
    id: 40,
    name: "Visual Consistency",
    category: "Design",
    description: "Reviews visual consistency."
  },

  // QUALITY & EXPORT

  {
    id: 41,
    name: "Privacy Protection",
    category: "Security",
    description: "Reviews privacy requirements."
  },
  {
    id: 42,
    name: "Safe Content Review",
    category: "Security",
    description: "Checks content safety requirements."
  },
  {
    id: 43,
    name: "Artifact Detection",
    category: "Quality",
    description: "Identifies visual artifact risks."
  },
  {
    id: 44,
    name: "Continuity Audit",
    category: "Quality",
    description: "Reviews scene continuity."
  },
  {
    id: 45,
    name: "Visual QA",
    category: "Quality",
    description: "Reviews visual quality requirements."
  },

  // DELIVERY & PERFORMANCE

  {
    id: 46,
    name: "Duration Controller",
    category: "Delivery",
    description: "Checks target duration."
  },
  {
    id: 47,
    name: "Aspect Ratio Controller",
    category: "Delivery",
    description: "Checks output aspect ratio."
  },
  {
    id: 48,
    name: "Export Manager",
    category: "Delivery",
    description: "Plans final export settings."
  },
  {
    id: 49,
    name: "Compatibility Checker",
    category: "Delivery",
    description: "Reviews platform compatibility."
  },
  {
    id: 50,
    name: "Final Production Audit",
    category: "Delivery",
    description: "Reviews final production readiness."
  }

];

/* 2. MODULE COUNT VALIDATION */

function validateCoreModules() {

  const expectedCount =
    APP_CONFIG.TOTAL_CORE_MODULES;

  const actualCount =
    CORE_MODULES.length;

  const uniqueIds = new Set(
    CORE_MODULES.map(module => module.id)
  );

  return {
    valid:
      actualCount === expectedCount &&
      uniqueIds.size === expectedCount,

    expected: expectedCount,

    actual: actualCount,

    unique: uniqueIds.size
  };

}

/* 3. RENDER CORE MODULES */

function renderCoreModules() {

  const container = getElement("moduleList");

  if (!container) return;

  container.innerHTML = CORE_MODULES.map(module => `

    <article class="module-card panel">

      <div class="module-card-header">

        <span class="module-number">
          ${String(module.id).padStart(2, "0")}
        </span>

        <span class="tag">
          ${escapeHTML(module.category)}
        </span>

      </div>

      <h3>
        ${escapeHTML(module.name)}
      </h3>

      <p>
        ${escapeHTML(module.description)}
      </p>

      <span class="module-status">
        Defined
      </span>

    </article>

  `).join("");

}

/* 4. MODULE SUMMARY */

function renderModuleSummary() {

  const result = validateCoreModules();

  const summary = getElement("moduleSummary");

  if (!summary) return;

  summary.textContent = result.valid
    ? `${result.actual}/50 Core Modules defined`
    : `Module validation issue: ${result.actual}/${result.expected}`;

}

/* 5. INITIALIZE MODULE SYSTEM */

function initializeCoreModules() {

  const result = validateCoreModules();

  console.log(
    "UPS Core Modules:",
    result
  );

  renderCoreModules();

  renderModuleSummary();

  if (!result.valid) {
    showToast(
      "Core Module count validation failed.",
      "error"
    );
  }

}

/* 6. RUN MODULE SYSTEM */

initializeCoreModules();

/* =========================================
   END OF PART 4I
   ========================================= 
/* =========================================
   PART 4J — 15 WORKFLOW LOCKS ENGINE
   ========================================= */

/* 1. WORKFLOW LOCK DATABASE */

const WORKFLOW_LOCKS = [

  {
    id: 1,
    name: "Theme Lock",
    rule: "Selected theme must remain consistent.",
    check: brief => Boolean(brief.category)
  },

  {
    id: 2,
    name: "Dialogue Lock",
    rule: "Dialogue requirements must be defined.",
    check: brief => Boolean(brief.language)
  },

  {
    id: 3,
    name: "Identity Lock",
    rule: "Identity preservation requirements must be considered.",
    check: brief => Boolean(brief.studio)
  },

  {
    id: 4,
    name: "Performance Lock",
    rule: "Performance requirements must be reviewed.",
    check: brief => Boolean(brief.output)
  },

  {
    id: 5,
    name: "UI Lock",
    rule: "Output presentation must match the selected format.",
    check: brief => Boolean(brief.aspectRatio)
  },

  {
    id: 6,
    name: "Continuity Lock",
    rule: "Scene continuity requirements must be reviewed.",
    check: brief => Boolean(brief.topic)
  },

  {
    id: 7,
    name: "Production Lock",
    rule: "Production brief must contain essential details.",
    check: brief =>
      Boolean(brief.studio && brief.output && brief.topic)
  },

  {
    id: 8,
    name: "Transitions Lock",
    rule: "Transition requirements must be considered.",
    check: brief => Boolean(brief.output)
  },

  {
    id: 9,
    name: "QA Lock",
    rule: "Quality review must be performed.",
    check: brief => Boolean(brief.platform)
  },

  {
    id: 10,
    name: "Final Lock",
    rule: "Final production brief must be available.",
    check: brief => Boolean(brief.createdAt)
  },

  {
    id: 11,
    name: "Duration Lock",
    rule: "Video duration must be defined when applicable.",
    check: brief => {

      const videoOutputs = [
        "Video",
        "Reel",
        "Short Film",
        "Podcast"
      ];

      if (!videoOutputs.includes(brief.output)) {
        return true;
      }

      return Boolean(brief.duration) &&
        brief.duration !== "Not applicable";

    }
  },

  {
    id: 12,
    name: "Voice Lock",
    rule: "Language and voice requirements must be reviewed.",
    check: brief => Boolean(brief.language)
  },

  {
    id: 13,
    name: "Logic Lock",
    rule: "Production settings must be logically consistent.",
    check: brief =>
      Boolean(brief.studio && brief.platform && brief.output)
  },

  {
    id: 14,
    name: "Safe-Frame Lock",
    rule: "Aspect ratio must be supported.",
    check: brief =>
      APP_CONFIG.SUPPORTED_ASPECT_RATIOS.includes(
        brief.aspectRatio
      )
  },

  {
    id: 15,
    name: "Export Lock",
    rule: "Export format requirements must be reviewed.",
    check: brief => Boolean(brief.output)

  }

];

/* 2. VALIDATE LOCK COUNT */

function validateLockCount() {

  const expected =
    APP_CONFIG.TOTAL_WORKFLOW_LOCKS;

  const actual =
    WORKFLOW_LOCKS.length;

  const uniqueIds = new Set(
    WORKFLOW_LOCKS.map(lock => lock.id)
  );

  return {
    valid:
      actual === expected &&
      uniqueIds.size === expected,

    expected,
    actual,
    unique: uniqueIds.size
  };

}

/* 3. RUN WORKFLOW LOCK CHECKS */

function runWorkflowLocks(brief) {

  return WORKFLOW_LOCKS.map(lock => {

    let passed = false;

    try {

      passed = Boolean(lock.check(brief));

    } catch (error) {

      console.error(
        "Workflow Lock Error:",
        lock.name,
        error
      );

    }

    return {
      id: lock.id,
      name: lock.name,
      rule: lock.rule,
      passed,
      status: passed ? "PASS" : "REVIEW REQUIRED"
    };

  });

}

/* 4. RENDER WORKFLOW LOCKS */

function renderWorkflowLocks(results = null) {

  const container = getElement("lockList");

  if (!container) return;

  const lockResults = results ||
    WORKFLOW_LOCKS.map(lock => ({
      ...lock,
      status: "NOT CHECKED",
      passed: false
    }));

  container.innerHTML = lockResults.map(lock => `

    <article class="lock-card panel">

      <div class="lock-card-header">

        <span class="lock-number">
          ${String(lock.id).padStart(2, "0")}
        </span>

        <span class="tag">
          ${escapeHTML(lock.status)}
        </span>

      </div>

      <h3>
        ${escapeHTML(lock.name)}
      </h3>

      <p>
        ${escapeHTML(lock.rule)}
      </p>

    </article>

  `).join("");

}

/* 5. LOCK VALIDATION SUMMARY */

function renderLockSummary(results) {

  const summary = getElement("lockSummary");

  if (!summary) return;

  const passed = results.filter(
    item => item.passed
  ).length;

  const failed = results.length - passed;

  summary.textContent =
    `${passed}/15 Passed · ${failed} Need Review`;

}

/* 6. RUN COMPLETE QUALITY CHECK */

function runCompleteLockAudit(brief) {

  const countCheck = validateLockCount();

  if (!countCheck.valid) {

    showToast(
      "Workflow Lock count validation failed.",
      "error"
    );

    return [];

  }

  const results = runWorkflowLocks(brief);

  renderWorkflowLocks(results);

  renderLockSummary(results);

  return results;

}

/* 7. INITIAL LOCK DISPLAY */

function initializeWorkflowLocks() {

  const countCheck = validateLockCount();

  console.log(
    "UPS Workflow Locks:",
    countCheck
  );

  renderWorkflowLocks();

}

/* 8. INITIALIZE */

initializeWorkflowLocks();

/* =========================================
   END OF PART 4J
   ========================================= 
/* =========================================
   PART 4K — SUPER ADMIN CONSOLE
   ========================================= */

/* 1. CHECK ADMIN PERMISSION */

function isSuperAdmin() {

  return (
    APP_STATE.user &&
    APP_STATE.profile?.role === "super_admin"
  );

}

/* 2. ADMIN ACCESS GUARD */

function requireAdminAccess() {

  if (!APP_STATE.user) {

    showToast(
      "Admin access के लिए Login करें।",
      "error"
    );

    openAuthModal("login");

    return false;
  }

  if (!isSuperAdmin()) {

    showToast(
      "आपके Account को Super Admin अनुमति नहीं है।",
      "error"
    );

    return false;
  }

  return true;

}

/* 3. ADMIN SYSTEM STATISTICS */

function getAdminStatistics() {

  return {

    totalProjects:
      APP_STATE.projects.length,

    totalStudios:
      STUDIO_DATA.length,

    totalModules:
      CORE_MODULES.length,

    totalLocks:
      WORKFLOW_LOCKS.length,

    currentRole:
      APP_STATE.profile?.role || "tester",

    applicationVersion:
      APP_CONFIG.VERSION

  };

}

/* 4. RENDER ADMIN DASHBOARD */

function renderAdminDashboard() {

  const container = getElement("page-admin");

  if (!container) return;

  if (!isSuperAdmin()) {

    container.innerHTML = `

      <div class="panel admin-notice">

        <h2>🔒 Restricted Area</h2>

        <p>
          यह क्षेत्र केवल अधिकृत Super Admin के लिए है।
        </p>

        <p>
          आपके Account को Super Admin अनुमति नहीं मिली है।
        </p>

      </div>

    `;

    return;
  }

  const stats = getAdminStatistics();

  container.innerHTML = `

    <section class="admin-console">

      <div class="dashboard-banner panel">

        <span class="tag">
          SUPER ADMIN
        </span>

        <h2>Admin Control Center</h2>

        <p>
          UPS Creator Studio System Overview
        </p>

      </div>

      <div class="dashboard-stats">

        <div class="metric-card panel">

          <span class="metric-label">
            Total Local Projects
          </span>

          <strong class="metric-value">
            ${stats.totalProjects}
          </strong>

        </div>

        <div class="metric-card panel">

          <span class="metric-label">
            Creative Studios
          </span>

          <strong class="metric-value">
            ${stats.totalStudios}
          </strong>

        </div>

        <div class="metric-card panel">

          <span class="metric-label">
            Core Modules
          </span>

          <strong class="metric-value">
            ${stats.totalModules}
          </strong>

        </div>

        <div class="metric-card panel">

          <span class="metric-label">
            Workflow Locks
          </span>

          <strong class="metric-value">
            ${stats.totalLocks}
          </strong>

        </div>

      </div>

      <div class="panel admin-section">

        <h3>Account Information</h3>

        <p>
          Role:
          <strong>
            ${escapeHTML(stats.currentRole)}
          </strong>
        </p>

        <p>
          Application Version:
          <strong>
            ${escapeHTML(stats.applicationVersion)}
          </strong>
        </p>

      </div>

      <div class="panel admin-section">

        <h3>System Health</h3>

        <p>
          Authentication:
          ${supabase ? "Configured" : "Not Configured"}
        </p>

        <p>
          Core Modules:
          ${validateCoreModules().valid
            ? "Count Validated"
            : "Validation Required"}
        </p>

        <p>
          Workflow Locks:
          ${validateLockCount().valid
            ? "Count Validated"
            : "Validation Required"}
        </p>

      </div>

      <div class="panel admin-section">

        <h3>Management Availability</h3>

        <ul>

          <li>
            Dashboard Overview — Available
          </li>

          <li>
            Local Project Monitoring — Available
          </li>

          <li>
            User Management — Pending Secure Backend
          </li>

          <li>
            Role Management — Pending Secure Backend
          </li>

          <li>
            Cloud Storage Management — Pending
          </li>

          <li>
            Audit Logs — Pending
          </li>

          <li>
            Backup & Recovery — Pending
          </li>

        </ul>

      </div>

      <div class="panel admin-section">

        <h3>Security Notice</h3>

        <p>
          Admin UI visibility is not a security boundary.
          Sensitive operations must be verified by a
          trusted server-side function.
        </p>

      </div>

      <button
        type="button"
        class="btn btn-primary"
        id="refreshAdminDashboard"
      >
        Refresh Admin Dashboard
      </button>

    </section>

  `;

  getElement("refreshAdminDashboard")
    ?.addEventListener(
      "click",
      () => {

        renderAdminDashboard();

        showToast(
          "Admin dashboard refreshed.",
          "success"
        );

      }
    );

}

/* 5. ADMIN NAVIGATION */

getElement("adminNav")?.addEventListener(
  "click",
  (event) => {

    if (!requireAdminAccess()) {

      event.preventDefault();

      return;
    }

    renderAdminDashboard();

  }
);

/* 6. ADMIN PAGE ACCESS */

document.addEventListener("click", event => {

  const navItem = event.target.closest(
    '[data-page="admin"]'
  );

  if (!navItem) return;

  if (!requireAdminAccess()) {

    event.preventDefault();

    showPage("dashboard");

    return;
  }

  renderAdminDashboard();

});

/* 7. ADMIN UI REFRESH */

function refreshAdminConsole() {

  if (!isSuperAdmin()) return;

  renderAdminDashboard();

}

/* =========================================
   END OF PART 4K
   ========================================= 
/* =========================================
   PART 4L — SUPABASE CLOUD PROJECTS
   ========================================= */

/* 1. CHECK CLOUD CONNECTION */

function isCloudReady() {

  return Boolean(
    supabase &&
    APP_STATE.user
  );

}

/* 2. CONVERT CLOUD PROJECT */

function mapCloudProject(row) {

  const answers = row.answers || {};

  return {

    id: row.id,

    title: row.title,

    studio: row.studio,

    output: answers.output || "Video",

    platform: answers.platform || "Multi-platform",

    category: answers.category || "Auto-Detect",

    brief: answers.brief || null,

    prompt: row.prompt,

    status: "Draft",

    createdAt: row.created_at,

    updatedAt: row.updated_at,

    source: "cloud"

  };

}

/* 3. LOAD CLOUD PROJECTS */

async function loadCloudProjects() {

  if (!isCloudReady()) {
    return [];
  }

  try {

    const { data, error } = await supabase
      .from("creator_projects")
      .select("*")
      .eq("user_id", APP_STATE.user.id)
      .order("created_at", {
        ascending: false
      });

    if (error) throw error;

    const cloudProjects = (data || [])
      .map(mapCloudProject);

    APP_STATE.projects = cloudProjects;

    persistLocalProjects();

    renderDashboardProjects();

    renderDashboard();

    return cloudProjects;

  } catch (error) {

    console.error(
      "Cloud project loading error:",
      error
    );

    showToast(
      "Cloud Projects load नहीं हुए।",
      "error"
    );

    return [];

  }

}

/* 4. SAVE PROJECT TO CLOUD */

async function saveProjectToCloud(project) {

  if (!isCloudReady()) {

    showToast(
      "Cloud save के लिए Login करें।",
      "error"
    );

    return null;

  }

  try {

    const { data, error } = await supabase
      .from("creator_projects")
      .insert({

        user_id: APP_STATE.user.id,

        title: project.title,

        studio: project.studio,

        prompt: project.brief
          ? formatBriefText(project.brief)
          : "",

        answers: {
          ...(project.brief || {}),
          output: project.output,
          platform: project.platform,
          category: project.category,
          brief: project.brief || null
        }

      })
      .select()
      .single();

    if (error) throw error;

    return data;

  } catch (error) {

    console.error(
      "Cloud project saving error:",
      error
    );

    showToast(
      error.message || "Cloud save failed.",
      "error"
    );

    return null;

  }

}

/* 5. CONNECT LOCAL SAVE WITH CLOUD SAVE */

const previousSaveCurrentProject =
  saveCurrentProject;

saveCurrentProject = async function() {

  if (!APP_STATE.user) {

    showToast(
      "पहले Login करें।",
      "error"
    );

    return;

  }

  const brief = APP_STATE.wizard.brief;

  if (!brief) return;

  const project = createProjectFromBrief(brief);

  const cloudRecord =
    await saveProjectToCloud(project);

  if (!cloudRecord) {

    showToast(
      "Project Cloud में सेव नहीं हुआ।",
      "error"
    );

    return;

  }

  project.id = cloudRecord.id;

  project.source = "cloud";

  APP_STATE.projects.unshift(project);

  persistLocalProjects();

  renderDashboard();

  showToast(
    "Project Cloud में सफलतापूर्वक सेव हुआ!",
    "success"
  );

};

/* 6. DELETE CLOUD PROJECT */

async function deleteCloudProject(projectId) {

  if (!isCloudReady()) {
    return false;
  }

  try {

    const { error } = await supabase
      .from("creator_projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", APP_STATE.user.id);

    if (error) throw error;

    return true;

  } catch (error) {

    console.error(
      "Cloud delete error:",
      error
    );

    showToast(
      "Cloud Project delete नहीं हुआ।",
      "error"
    );

    return false;

  }

}

/* 7. CONNECT DELETE WITH CLOUD */

const previousDeleteProject =
  deleteProject;

deleteProject = async function(projectId) {

  const project = APP_STATE.projects.find(
    item => item.id === projectId
  );

  if (!project) return;

  if (project.source === "cloud") {

    const deleted =
      await deleteCloudProject(projectId);

    if (!deleted) return;

  }

  previousDeleteProject(projectId);

};

/* 8. CLOUD CONNECTION STATUS */

function getCloudStatus() {

  if (!supabase) {
    return "Supabase Not Configured";
  }

  if (!APP_STATE.user) {
    return "Login Required";
  }

  return "Connected";

}

/* 9. CLOUD STATUS DISPLAY */

function renderCloudStatus() {

  const status = getElement("cloudStatus");

  if (!status) return;

  status.textContent = getCloudStatus();

}

/* =========================================
   END OF PART 4L
   ========================================= 
/* =========================================
   PART 4M — PROFILE PHOTO CLOUD UPLOAD
   ========================================= */

/* 1. PROFILE PHOTO STATE */

APP_STATE.profilePhotoPath = null;

/* 2. GET PRIVATE PHOTO URL */

async function getPrivatePhotoUrl(photoPath) {

  if (!supabase || !photoPath) return null;

  try {

    const { data, error } = await supabase
      .storage
      .from(APP_CONFIG.STORAGE_BUCKET)
      .createSignedUrl(photoPath, 3600);

    if (error) throw error;

    return data.signedUrl;

  } catch (error) {

    console.error(
      "Private photo URL error:",
      error
    );

    return null;

  }

}

/* 3. SHOW PROFILE PHOTO */

async function showProfilePhoto(photoPath) {

  const preview =
    getElement("profilePhotoPreview");

  if (!preview || !photoPath) return;

  const imageUrl =
    await getPrivatePhotoUrl(photoPath);

  if (!imageUrl) return;

  if (preview.tagName === "IMG") {

    preview.src = imageUrl;

  } else {

    preview.style.backgroundImage =
      `url("${imageUrl}")`;

  }

}

/* 4. UPLOAD PROFILE PHOTO */

async function uploadProfilePhoto(file) {

  if (!supabase || !APP_STATE.user) {

    showToast(
      "Photo Upload के लिए Login करें।",
      "error"
    );

    return false;

  }

  if (!file || !file.type.startsWith("image/")) {

    showToast(
      "कृपया सही Image File चुनें।",
      "error"
    );

    return false;

  }

  if (
    file.size > APP_CONFIG.MAX_PROFILE_IMAGE_SIZE
  ) {

    showToast(
      "Photo का Size 5 MB से कम होना चाहिए।",
      "error"
    );

    return false;

  }

  const extension =
    file.name.split(".").pop().toLowerCase();

  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp"
  ];

  if (!allowedExtensions.includes(extension)) {

    showToast(
      "केवल JPG, PNG और WEBP Images स्वीकार हैं।",
      "error"
    );

    return false;

  }

  const userId = APP_STATE.user.id;

  const filePath =
    `${userId}/profile-${Date.now()}.${extension}`;

  try {

    showToast("Photo Upload हो रही है...");

    /* UPLOAD TO PRIVATE STORAGE */

    const { data: uploadData, error: uploadError } =
      await supabase
        .storage
        .from(APP_CONFIG.STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        });

    if (uploadError) throw uploadError;

    /* SAVE PHOTO PATH IN PROFILE */

    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            photo_path: uploadData.path
          },
          {
            onConflict: "user_id"
          }
        )
        .select()
        .single();

    if (profileError) throw profileError;

    APP_STATE.profile = profileData;

    APP_STATE.profilePhotoPath =
      uploadData.path;

    /* SHOW PRIVATE IMAGE */

    await showProfilePhoto(uploadData.path);

    showToast(
      "Profile Photo Cloud में सेव हो गई!",
      "success"
    );

    return true;

  } catch (error) {

    console.error(
      "Profile Photo Upload Error:",
      error
    );

    showToast(
      error.message ||
      "Photo Upload नहीं हो पाई। Storage Policies जाँचें।",
      "error"
    );

    return false;

  }

}

/* 5. PHOTO INPUT CLOUD UPLOAD EVENT */

getElement("photoInput")?.addEventListener(
  "change",
  async (event) => {

    const file = event.target.files?.[0];

    if (!file) return;

    await uploadProfilePhoto(file);

  }
);

/* 6. LOAD SAVED PROFILE PHOTO */

async function loadSavedProfilePhoto() {

  const photoPath =
    APP_STATE.profile?.photo_path;

  if (!photoPath) return;

  APP_STATE.profilePhotoPath = photoPath;

  await showProfilePhoto(photoPath);

}

/* 7. PHOTO UPLOAD STATUS */

function getProfilePhotoStatus() {

  if (!APP_STATE.user) {
    return "Login Required";
  }

  if (APP_STATE.profilePhotoPath) {
    return "Cloud Photo Available";
  }

  return "No Cloud Photo";

}

/* =========================================
   END OF PART 4M
   ========================================= 
/* =========================================
   PART 4N — PROMPT GENERATION ENGINE
   ========================================= */

/* 1. PROMPT GENERATION RULES */

const PROMPT_RULES = {

  video: [
    "Create a clear visual sequence.",
    "Include an engaging opening hook.",
    "Define camera movement and scene composition.",
    "Maintain visual continuity.",
    "Specify aspect ratio and duration.",
    "Include suitable audio and caption requirements."
  ],

  image: [
    "Create a detailed visual composition.",
    "Define subject, background and lighting.",
    "Specify visual style and framing.",
    "Maintain text and visual accuracy.",
    "Specify the required aspect ratio."
  ],

  poster: [
    "Create a professional poster layout.",
    "Use a clear visual hierarchy.",
    "Keep headline and supporting text readable.",
    "Use balanced typography and spacing.",
    "Preserve brand identity and spelling accuracy."
  ],

  dance: [
    "Describe the dance performance concept.",
    "Define movement style and energy.",
    "Plan camera framing and scene continuity.",
    "Specify music synchronization requirements.",
    "Avoid unnatural or inconsistent movement."
  ],

  film: [
    "Develop a cinematic scene concept.",
    "Define characters and scene setting.",
    "Plan camera angles and lighting.",
    "Maintain character and scene continuity.",
    "Include a clear beginning, middle and ending."
  ],

  podcast: [
    "Create a natural conversation structure.",
    "Include opening and introduction.",
    "Develop meaningful discussion points.",
    "Include examples and a closing.",
    "Use clear speaker labels and natural dialogue."
  ],

  education: [
    "Present information in a clear learning sequence.",
    "Use accurate and understandable explanations.",
    "Include relevant examples.",
    "Keep educational language age-appropriate.",
    "Add a short learning summary."
  ]

};

/* 2. GET STUDIO PROMPT CATEGORY */

function getPromptCategory(studioId) {

  const mapping = {
    video: "video",
    image: "image",
    poster: "poster",
    dance: "dance",
    film: "film",
    podcast: "podcast",
    education: "education"
  };

  return mapping[studioId] || "video";

}

/* 3. BUILD PRODUCTION PROMPT */

function buildProductionPrompt(brief) {

  if (!brief) {
    throw new Error("Creative Brief उपलब्ध नहीं है।");
  }

  const studioId =
    APP_STATE.currentStudio?.id ||
    brief.studioId ||
    "video";

  const category =
    getPromptCategory(studioId);

  const rules =
    PROMPT_RULES[category];

  const prompt = `UPS CREATOR STUDIO
PRODUCTION PROMPT

PROJECT INFORMATION

Studio: ${brief.studio}
Platform: ${brief.platform}
Output: ${brief.output}
Target Audience: ${brief.audience}
Language: ${brief.language}
Category: ${brief.category}
Topic: ${brief.topic}

PRODUCTION SETTINGS

Duration: ${brief.duration}
Aspect Ratio: ${brief.aspectRatio}
Creation Mode: ${brief.mode}

CREATIVE DIRECTION

Create professional, clear and engaging content
based on the selected topic and audience.

The final output should match the selected
platform, language and content format.

STUDIO-SPECIFIC INSTRUCTIONS

${rules.map((rule, index) =>
  `${index + 1}. ${rule}`
).join("\n")}

QUALITY REQUIREMENTS

1. Maintain content consistency.
2. Check spelling and language accuracy.
3. Follow the selected aspect ratio.
4. Review visual and audio requirements where applicable.
5. Respect privacy and content safety.
6. Review the final output before publishing.

FINAL OUTPUT

Prepare the requested ${brief.output} concept
for ${brief.platform}.

Topic: ${brief.topic}

Language: ${brief.language}

UPS Creator Studio
Imagine. Create. Innovate.`;

  return {
    studio: category,
    title: brief.topic,
    prompt,
    createdAt: new Date().toISOString()
  };

}

/* 4. GENERATE PROMPT FROM CURRENT BRIEF */

function generateCurrentPrompt() {

  const brief = APP_STATE.wizard.brief;

  if (!brief) {

    showToast(
      "पहले Creative Brief तैयार करें।",
      "error"
    );

    return null;

  }

  try {

    const result =
      buildProductionPrompt(brief);

    APP_STATE.generatedPrompt = result;

    return result;

  } catch (error) {

    console.error(
      "Prompt generation error:",
      error
    );

    showToast(
      error.message,
      "error"
    );

    return null;

  }

}

/* 5. RENDER GENERATED PROMPT */

function renderGeneratedPrompt(result) {

  const area = getElement("questionArea");

  if (!area || !result) return;

  area.innerHTML = `

    <div class="recommendation">

      <span class="tag">
        PRODUCTION PROMPT
      </span>

      <h2>
        ${escapeHTML(result.title)}
      </h2>

      <p>
        Your studio-specific production prompt is ready.
      </p>

      <textarea
        id="generatedPromptText"
        rows="18"
        spellcheck="true"
      >${escapeHTML(result.prompt)}</textarea>

      <div class="wizard-controls">

        <button
          type="button"
          class="btn btn-primary"
          id="copyGeneratedPrompt"
        >
          Copy Prompt
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          id="downloadGeneratedPrompt"
        >
          Download TXT
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          id="backToCreativeBrief"
        >
          Back to Brief
        </button>

      </div>

    </div>

  `;

  getElement("copyGeneratedPrompt")
    ?.addEventListener(
      "click",
      async () => {

        const text =
          getElement("generatedPromptText")?.value;

        try {

          await navigator.clipboard.writeText(text);

          showToast(
            "Production Prompt copied!",
            "success"
          );

        } catch {

          showToast(
            "Prompt copy नहीं हो पाया।",
            "error"
          );

        }

      }
    );

  getElement("downloadGeneratedPrompt")
    ?.addEventListener(
      "click",
      () => {

        const text =
          getElement("generatedPromptText")?.value;

        const blob = new Blob(
          [text],
          { type: "text/plain;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "UPS-Production-Prompt.txt";

        document.body.appendChild(link);

        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        showToast(
          "Prompt downloaded!",
          "success"
        );

      }
    );

  getElement("backToCreativeBrief")
    ?.addEventListener(
      "click",
      () => renderCreativeBrief(
        APP_STATE.wizard.brief
      )
    );

}

/* 6. ADD GENERATE BUTTON TO BRIEF */

const previousPromptBriefRenderer =
  renderCreativeBrief;

renderCreativeBrief = function(brief) {

  previousPromptBriefRenderer(brief);

  const container = $(
    "#questionArea .recommendation"
  );

  if (!container) return;

  const button = document.createElement("button");

  button.type = "button";
  button.id = "generateProductionPrompt";
  button.className = "btn btn-primary";
  button.textContent = "✨ Generate Production Prompt";

  container.appendChild(button);

  button.addEventListener(
    "click",
    () => {

      const result = generateCurrentPrompt();

      if (result) {
        renderGeneratedPrompt(result);
      }

    }
  );

};

/* 7. PROMPT ENGINE STATUS */

function getPromptEngineStatus() {

  return {
    available: true,
    generationType: "Rule-Based Templates",
    externalAIConnected: false,
    supportedStudios: Object.keys(PROMPT_RULES)
  };

}

/* 8. INITIAL PROMPT ENGINE CHECK */

console.log(
  "UPS Prompt Engine:",
  getPromptEngineStatus()
);

/* =========================================
   END OF PART 4N
   ========================================= 
/* =========================================
   PART 4O — PROMPT LIBRARY & HISTORY
========================================= */

const PROMPT_LIBRARY_KEY = "ups_creator_prompt_library_v1";

function getPromptLibrary() {
  try {
    const data = JSON.parse(
      localStorage.getItem(PROMPT_LIBRARY_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Prompt Library Error:", error);
    return [];
  }
}

function savePromptLibrary(data) {
  try {
    localStorage.setItem(
      PROMPT_LIBRARY_KEY,
      JSON.stringify(data)
    );
    return true;
  } catch (error) {
    showToast("Prompt save नहीं हो पाया। Storage चेक करें।");
    return false;
  }
}

function savePromptToLibrary() {
  const promptElement = $("generatedPromptText");

  if (!promptElement) {
    showToast("पहले Production Prompt generate करें।");
    return;
  }

  const promptText =
    promptElement.value ||
    promptElement.textContent ||
    "";

  if (!promptText.trim()) {
    showToast("कोई Prompt उपलब्ध नहीं है।");
    return;
  }

  const library = getPromptLibrary();

  const item = {
    id: "prompt_" + Date.now(),
    title:
      (APP_STATE.currentStudio?.name || "Creative") +
      " Production Prompt",
    studio:
      APP_STATE.currentStudio?.name || "Creative Studio",
    prompt: promptText,
    createdAt: new Date().toISOString()
  };

  library.unshift(item);

  // अधिकतम 100 prompts सेव होंगे
  const updatedLibrary = library.slice(0, 100);

  if (savePromptLibrary(updatedLibrary)) {
    showToast("Prompt Library में सेव हो गया!");
    renderPromptLibrary();
  }
}

function renderPromptLibrary() {
  const page = $("page-projects");

  if (!page) return;

  let librarySection = $("promptLibrarySection");

  if (!librarySection) {
    librarySection = document.createElement("section");
    librarySection.id = "promptLibrarySection";
    librarySection.className = "prompt-library-section";

    page.appendChild(librarySection);
  }

  const library = getPromptLibrary();

  librarySection.innerHTML = `
    <div class="section-heading">
      <div>
        <h2>Prompt Library</h2>
        <p>आपके सेव किए गए Production Prompts</p>
      </div>
      <span class="library-count">
        ${library.length} Saved
      </span>
    </div>

    ${
      library.length
        ? library.map(item => `
          <article class="prompt-library-card">
            <div class="prompt-library-info">
              <h3>${escapeHTML(item.title)}</h3>
              <p>${escapeHTML(item.studio)}</p>
              <small>
                ${formatDate(item.createdAt)}
              </small>
            </div>

            <div class="prompt-library-actions">
              <button
                class="btn btn-secondary"
                data-prompt-view="${escapeHTML(item.id)}">
                View
              </button>

              <button
                class="btn btn-secondary"
                data-prompt-copy="${escapeHTML(item.id)}">
                Copy
              </button>

              <button
                class="btn btn-danger"
                data-prompt-delete="${escapeHTML(item.id)}">
                Delete
              </button>
            </div>
          </article>
        `).join("")
        : `
          <div class="empty-state">
            <h3>Library अभी खाली है</h3>
            <p>Production Prompt बनाकर उसे यहाँ सेव करें।</p>
          </div>
        `
    }
  `;

  librarySection.onclick = async (event) => {
    const viewButton = event.target.closest("[data-prompt-view]");
    const copyButton = event.target.closest("[data-prompt-copy]");
    const deleteButton = event.target.closest("[data-prompt-delete]");

    const id =
      viewButton?.dataset.promptView ||
      copyButton?.dataset.promptCopy ||
      deleteButton?.dataset.promptDelete;

    if (!id) return;

    const items = getPromptLibrary();
    const selected = items.find(item => item.id === id);

    if (!selected) return;

    if (viewButton) {
      showSavedPrompt(selected);
    }

    if (copyButton) {
      try {
        await navigator.clipboard.writeText(selected.prompt);
        showToast("Prompt Copy हो गया!");
      } catch (error) {
        showToast("Copy नहीं हुआ। Prompt को View करके कॉपी करें।");
      }
    }

    if (deleteButton) {
      const confirmed = confirm(
        "क्या आप इस Prompt को Delete करना चाहते हैं?"
      );

      if (!confirmed) return;

      const updated = items.filter(item => item.id !== id);

      if (savePromptLibrary(updated)) {
        renderPromptLibrary();
        showToast("Prompt Delete हो गया।");
      }
    }
  };
}

function showSavedPrompt(item) {
  const oldModal = $("savedPromptModal");

  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");

  modal.id = "savedPromptModal";
  modal.className = "auth-modal open";

  modal.innerHTML = `
    <div class="auth-modal-content prompt-view-modal">
      <button
        class="modal-close"
        id="savedPromptClose">
        ×
      </button>

      <h2>${escapeHTML(item.title)}</h2>
      <p>${escapeHTML(item.studio)}</p>

      <textarea
        id="savedPromptContent"
        readonly
        rows="12">${escapeHTML(item.prompt)}</textarea>

      <div class="prompt-library-actions">
        <button
          class="btn btn-primary"
          id="savedPromptCopy">
          Copy Prompt
        </button>

        <button
          class="btn btn-secondary"
          id="savedPromptDownload">
          Download
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  $("savedPromptClose").onclick = () => modal.remove();

  $("savedPromptCopy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      showToast("Prompt Copy हो गया!");
    } catch (error) {
      showToast("Copy उपलब्ध नहीं है।");
    }
  };

  $("savedPromptDownload").onclick = () => {
    const blob = new Blob(
      [item.prompt],
      { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "UPS-Production-Prompt.txt";
    link.click();

    URL.revokeObjectURL(url);
    showToast("Prompt Download शुरू हो गया!");
  };
}

/* Add Save to Library button */

const previousPromptRender = renderGeneratedPrompt;

renderGeneratedPrompt = function(result) {
  previousPromptRender(result);

  const container = $("generatedPromptText")?.parentElement;

  if (!container) return;

  if ($("savePromptLibraryBtn")) return;

  const button = document.createElement("button");

  button.id = "savePromptLibraryBtn";
  button.className = "btn btn-primary";
  button.textContent = "Save to Prompt Library";

  button.addEventListener("click", savePromptToLibrary);

  container.appendChild(button);
};

/* Add Prompt Library to Projects Page */

const previousProjectsRender = renderProjects;

if (typeof previousProjectsRender === "function") {
  renderProjects = function() {
    previousProjectsRender();
    renderPromptLibrary();
  };
}

/* Initial Library Setup */

document.addEventListener("DOMContentLoaded", () => {
  renderPromptLibrary();
});

console.log("PART 4O — Prompt Library & History Loaded");
/* =========================================
   PART 4P — QUALITY AUDIT & PRODUCTION CHECK
========================================= */

function runQualityAudit() {
  const checks = [];

  const promptElement = $("generatedPromptText");

  const promptText = promptElement
    ? (promptElement.value || promptElement.textContent || "").trim()
    : "";

  const studio = APP_STATE.currentStudio;
  const answers = APP_STATE.answers || {};

  // 1. Studio Check
  checks.push({
    name: "Studio Selection",
    passed: Boolean(studio),
    detail: studio
      ? "Creative Studio selected."
      : "Studio selection अभी बाकी है।"
  });

  // 2. Production Prompt Check
  checks.push({
    name: "Production Prompt",
    passed: promptText.length > 30,
    detail: promptText.length > 30
      ? "Production Prompt तैयार है।"
      : "पहले Production Prompt generate करें।"
  });

  // 3. Configuration Check
  const configResult = validateConfig();

  checks.push({
    name: "Supabase Configuration",
    passed: Boolean(configResult.valid),
    detail: configResult.valid
      ? "Configuration validation passed."
      : "Supabase URL या Publishable Key जाँचें।"
  });

  // 4. Project Information Check
  const projectName =
    answers.topic ||
    answers.subject ||
    answers.activity ||
    "";

  checks.push({
    name: "Project Topic",
    passed: Boolean(String(projectName).trim()),
    detail: projectName
      ? "Project topic उपलब्ध है।"
      : "Project topic अभी सेट नहीं है।"
  });

  // 5. Language Check
  const language =
    answers.language ||
    APP_CONFIG.DEFAULT_LANGUAGE;

  checks.push({
    name: "Language Selection",
    passed: Boolean(language),
    detail: language
      ? "Language preference उपलब्ध है।"
      : "Language select करें।"
  });

  // 6. Output Check
  const output =
    answers.output ||
    answers.format ||
    "";

  checks.push({
    name: "Output Format",
    passed: Boolean(output),
    detail: output
      ? "Output format selected."
      : "Output format select करें।"
  });

  // 7. Core Modules Count Check
  const moduleContainer = $("moduleList");
  const moduleCount = moduleContainer
    ? moduleContainer.children.length
    : 0;

  checks.push({
    name: "Core Modules Display",
    passed: moduleCount === 50,
    detail: moduleCount === 50
      ? "50 Core Modules displayed."
      : `अभी ${moduleCount} modules दिखाई दे रहे हैं।`
  });

  // 8. Workflow Locks Count Check
  const lockContainer = $("lockList");
  const lockCount = lockContainer
    ? lockContainer.children.length
    : 0;

  checks.push({
    name: "Workflow Locks Display",
    passed: lockCount === 15,
    detail: lockCount === 15
      ? "15 Workflow Locks displayed."
      : `अभी ${lockCount} locks दिखाई दे रहे हैं।`
  });

  const passed = checks.filter(item => item.passed).length;
  const failed = checks.length - passed;

  const percentage = Math.round(
    (passed / checks.length) * 100
  );

  return {
    checks,
    passed,
    failed,
    total: checks.length,
    percentage,
    status: failed === 0 ? "READY" : "NEEDS ATTENTION"
  };
}

function renderQualityAudit() {
  const audit = runQualityAudit();

  let container = $("qualityAuditSection");

  if (!container) {
    container = document.createElement("section");
    container.id = "qualityAuditSection";
    container.className = "quality-audit-section";

    const target = $("generatedPromptText")?.parentElement;

    if (target) {
      target.appendChild(container);
    } else {
      const page = $("page-wizard");

      if (!page) return;

      page.appendChild(container);
    }
  }

  container.innerHTML = `
    <div class="section-heading">
      <div>
        <h2>Production Quality Audit</h2>
        <p>Creative Brief और Production Readiness Check</p>
      </div>

      <span class="audit-score">
        ${audit.percentage}%
      </span>
    </div>

    <div class="audit-summary">
      <div>
        <strong>${audit.passed}</strong>
        <span>Passed</span>
      </div>

      <div>
        <strong>${audit.failed}</strong>
        <span>Needs Attention</span>
      </div>

      <div>
        <strong>${audit.total}</strong>
        <span>Total Checks</span>
      </div>
    </div>

    <div class="audit-status">
      ${audit.status === "READY"
        ? "🟢 PRODUCTION CHECK PASSED"
        : "🟡 IMPROVEMENTS REQUIRED"}
    </div>

    <div class="audit-check-list">
      ${audit.checks.map(check => `
        <div class="audit-check-item">
          <span>
            ${check.passed ? "🟢" : "🔴"}
          </span>

          <div>
            <strong>${escapeHTML(check.name)}</strong>
            <p>${escapeHTML(check.detail)}</p>
          </div>
        </div>
      `).join("")}
    </div>

    <button
      type="button"
      class="btn btn-secondary"
      id="refreshQualityAudit">
      Re-Run Quality Audit
    </button>
  `;

  const refreshButton = $("refreshQualityAudit");

  if (refreshButton) {
    refreshButton.addEventListener(
      "click",
      renderQualityAudit
    );
  }

  return audit;
}

/* Add Audit Button to Production Prompt */

const previousAuditPromptRender = renderGeneratedPrompt;

renderGeneratedPrompt = function(result) {
  previousAuditPromptRender(result);

  const container = $("generatedPromptText")?.parentElement;

  if (!container) return;

  if ($("runQualityAuditBtn")) return;

  const button = document.createElement("button");

  button.id = "runQualityAuditBtn";
  button.type = "button";
  button.className = "btn btn-secondary";
  button.textContent = "Run Production Quality Audit";

  button.addEventListener("click", renderQualityAudit);

  container.appendChild(button);
};

/* Audit Summary Helper */

function getQualityAuditSummary() {
  const audit = runQualityAudit();

  return {
    score: audit.percentage + "%",
    passed: audit.passed,
    needsAttention: audit.failed,
    totalChecks: audit.total,
    status: audit.status
  };
}

console.log(
  "PART 4P — Quality Audit & Production Check Loaded"
);
/* =========================================
   PART 4Q — FINAL INITIALIZATION
   UPS CREATOR STUDIO
========================================= */

(async function initializeUPSStudio() {

  console.log("UPS Creator Studio Initializing...");

  // 1. Basic Application Setup
  function initializeBasicUI() {
    const yearElement = $("year");

    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }

    if (typeof renderStudios === "function") {
      renderStudios();
    }

    if (typeof renderDashboard === "function") {
      renderDashboard();
    }

    if (typeof renderModules === "function") {
      renderModules();
    }

    if (typeof renderLocks === "function") {
      renderLocks();
    }

    if (typeof renderProjects === "function") {
      renderProjects();
    }

    if (typeof renderPromptLibrary === "function") {
      renderPromptLibrary();
    }
  }

  // 2. Restore Existing Supabase Session
  async function restoreUserSession() {

    if (!supabase) {
      console.warn("Supabase is not configured.");

      showToast(
        "Supabase configuration pending. Public mode available."
      );

      return;
    }

    try {
      const { data, error } =
        await supabase.auth.getSession();

      if (error) throw error;

      const session = data?.session;

      if (session?.user) {
        APP_STATE.user = session.user;

        if (typeof updateAuthUI === "function") {
          updateAuthUI(session.user);
        }

        if (typeof loadUserProfile === "function") {
          await loadUserProfile(session.user);
        }

        if (typeof loadCloudProjects === "function") {
          await loadCloudProjects();
        }

        if (typeof renderDashboard === "function") {
          renderDashboard();
        }

        console.log("Existing session restored.");

      } else {
        APP_STATE.user = null;

        if (typeof updateAuthUI === "function") {
          updateAuthUI(null);
        }
      }

    } catch (error) {
      console.error("Session Restore Error:", error);

      showToast("Login session check नहीं हो पाया।");
    }
  }

  // 3. Listen for Authentication Changes
  function initializeAuthListener() {

    if (!supabase) return;

    supabase.auth.onAuthStateChange(
      async (event, session) => {

        console.log("Auth Event:", event);

        APP_STATE.user = session?.user || null;

        if (typeof updateAuthUI === "function") {
          updateAuthUI(session?.user || null);
        }

        if (session?.user) {

          if (event === "SIGNED_IN" ||
              event === "TOKEN_REFRESHED") {

            setTimeout(async () => {

              try {
                if (typeof loadUserProfile === "function") {
                  await loadUserProfile(session.user);
                }

                if (typeof loadCloudProjects === "function") {
                  await loadCloudProjects();
                }

                if (typeof renderDashboard === "function") {
                  renderDashboard();
                }

              } catch (error) {
                console.error(
                  "User Data Sync Error:",
                  error
                );
              }

            }, 0);
          }

        } else if (event === "SIGNED_OUT") {

          APP_STATE.projects = [];

          if (typeof renderDashboard === "function") {
            renderDashboard();
          }

        }
      }
    );
  }

  // 4. Validate Core System
  function validateCoreSystem() {

    const results = {
      config: typeof APP_CONFIG !== "undefined",
      studio: Array.isArray(STUDIO_DATA),
      modules: Array.isArray(CORE_MODULES),
      locks: Array.isArray(WORKFLOW_LOCKS),
      promptEngine:
        typeof buildProductionPrompt === "function",
      qualityAudit:
        typeof runQualityAudit === "function"
    };

    const passed = Object.values(results)
      .filter(Boolean).length;

    console.table(results);

    console.log(
      "Core System Check:",
      passed + "/" + Object.keys(results).length
    );

    return results;
  }

  // 5. Initialize Application
  initializeBasicUI();

  validateCoreSystem();

  // Register listener before restoring session
  initializeAuthListener();

  await restoreUserSession();

  // 6. Final Status
  APP_STATE.initialized = true;

  console.log(
    "UPS Creator Studio Initialization Complete."
  );

  window.UPS_CREATOR_STUDIO = {
    version: APP_CONFIG.VERSION,
    state: APP_STATE,
    validate: validateCoreSystem,
    qualityAudit: runQualityAudit,
    promptLibrary: getPromptLibrary,
    buildPrompt: buildProductionPrompt
  };

  showToast("UPS Creator Studio तैयार है!");

})().catch(error => {

  console.error(
    "UPS Creator Studio Fatal Initialization Error:",
    error
  );

});
/* =========================================
   UPS MOBILE REPAIR CENTER
   DIAGNOSIS + SAFE AUTO FIX
========================================= */

(function UPSMobileRepairCenter() {

  if (window.UPS_REPAIR_CENTER) return;

  const errors = [];
  const MAX_ERRORS = 30;

  // Capture JavaScript errors
  window.addEventListener("error", function(e) {
    errors.unshift({
      type: "JavaScript Error",
      message: e.message || "Unknown error",
      file: e.filename || "Unknown file",
      line: e.lineno || 0,
      time: new Date().toLocaleString()
    });

    errors.length = Math.min(errors.length, MAX_ERRORS);
  });

  // Capture rejected promises
  window.addEventListener("unhandledrejection", function(e) {
    errors.unshift({
      type: "Promise Error",
      message: String(e.reason || "Unknown rejection"),
      file: "Promise",
      line: 0,
      time: new Date().toLocaleString()
    });

    errors.length = Math.min(errors.length, MAX_ERRORS);
  });

  function scanWebsite() {
    const results = [];
    const all = document.querySelectorAll("*");

    // Duplicate IDs
    const ids = {};

    document.querySelectorAll("[id]").forEach(el => {
      const id = el.id;
      ids[id] = (ids[id] || 0) + 1;
    });

    Object.keys(ids).forEach(id => {
      if (ids[id] > 1) {
        results.push({
          level: "ERROR",
          title: "Duplicate HTML ID",
          detail: id + " (" + ids[id] + " times)"
        });
      }
    });

    // Buttons without accessible text
    document.querySelectorAll("button").forEach((btn, i) => {
      if (!btn.textContent.trim() &&
          !btn.getAttribute("aria-label") &&
          !btn.querySelector("img[alt]")) {
        results.push({
          level: "WARNING",
          title: "Button label missing",
          detail: "Button #" + (i + 1)
        });
      }
    });

    // Links without destination
    document.querySelectorAll("a").forEach((link, i) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") {
        results.push({
          level: "WARNING",
          title: "Link destination missing",
          detail: "Link #" + (i + 1)
        });
      }
    });

    // Images without alt
    document.querySelectorAll("img").forEach((img, i) => {
      if (!img.hasAttribute("alt")) {
        results.push({
          level: "WARNING",
          title: "Image ALT missing",
          detail: "Image #" + (i + 1)
        });
      }
    });

    // Empty important containers
    [
      "publicView",
      "appView",
      "sidebar",
      "page-dashboard",
      "page-wizard"
    ].forEach(id => {
      if (!document.getElementById(id)) {
        results.push({
          level: "ERROR",
          title: "Important HTML element missing",
          detail: "#" + id
        });
      }
    });

    // JavaScript error report
    errors.forEach(err => {
      results.push({
        level: "ERROR",
        title: err.type,
        detail: err.message + " | " + err.file +
          " | Line: " + err.line
      });
    });

    // Supabase check
    if (!window.UPS_CREATOR_STUDIO) {
      results.push({
        level: "WARNING",
        title: "Application API not initialized",
        detail: "Final initialization object unavailable."
      });
    }

    // Mobile viewport check
    const viewport = document.querySelector(
      'meta[name="viewport"]'
    );

    if (!viewport) {
      results.push({
        level: "WARNING",
        title: "Mobile viewport missing",
        detail: "Check index.html viewport meta tag."
      });
    }

    return results;
  }

  // Safe repairs only
  function runSafeRepairs() {
    let repaired = 0;

    // Buttons without type can accidentally submit forms
    document.querySelectorAll("button").forEach(btn => {
      if (!btn.hasAttribute("type")) {
        btn.setAttribute("type", "button");
        repaired++;
      }
    });

    // Add empty alt to decorative images
    document.querySelectorAll("img:not([alt])").forEach(img => {
      img.setAttribute("alt", "");
      repaired++;
    });

    return repaired;
  }

  function createRepairCenter() {
    if (document.getElementById("upsRepairButton")) return;

    const style = document.createElement("style");

    style.textContent = `
      #upsRepairButton {
        position:fixed;
        right:16px;
        bottom:18px;
        z-index:99998;
        border:0;
        border-radius:30px;
        padding:14px 19px;
        background:#6d5dfc;
        color:white;
        font-size:14px;
        font-weight:700;
        box-shadow:0 5px 25px #0005;
        cursor:pointer;
      }

      #upsRepairPanel {
        position:fixed;
        inset:0;
        z-index:99999;
        background:#080d1b;
        color:#fff;
        padding:18px;
        overflow-y:auto;
        font-family:Arial,sans-serif;
        display:none;
      }

      #upsRepairPanel h2 {
        font-size:23px;
        margin:12px 0;
      }

      .ups-repair-card {
        background:#172238;
        border:1px solid #34435f;
        border-radius:12px;
        padding:13px;
        margin:10px 0;
        overflow-wrap:anywhere;
      }

      .ups-repair-card small {
        color:#b9c7df;
        display:block;
        margin-top:6px;
      }

      .ups-repair-action {
        width:100%;
        padding:14px;
        margin:7px 0;
        border:0;
        border-radius:9px;
        font-weight:bold;
        font-size:15px;
        cursor:pointer;
      }

      .ups-repair-primary {
        background:#6d5dfc;
        color:white;
      }

      .ups-repair-secondary {
        background:#263550;
        color:white;
      }
    `;

    document.head.appendChild(style);

    const button = document.createElement("button");

    button.id = "upsRepairButton";
    button.type = "button";
    button.textContent = "🔧 Repair Center";

    const panel = document.createElement("div");

    panel.id = "upsRepairPanel";

    panel.innerHTML = `
      <h2>🔧 UPS Repair Center</h2>
      <p>Website Diagnosis & Safe Repair</p>

      <div id="upsRepairSummary" class="ups-repair-card">
        अभी वेबसाइट की जाँच नहीं हुई है।
      </div>

      <button class="ups-repair-action ups-repair-primary"
        id="upsRunScan">
        🔍 Scan Website
      </button>

      <button class="ups-repair-action ups-repair-secondary"
        id="upsSafeFix">
        🛠️ Apply Safe Fixes
      </button>

      <button class="ups-repair-action ups-repair-secondary"
        id="upsCopyReport">
        📋 Copy Error Report
      </button>

      <button class="ups-repair-action ups-repair-secondary"
        id="upsClosePanel">
        Close
      </button>

      <div id="upsRepairResults"></div>
    `;

    document.body.append(button, panel);

    button.onclick = () => {
      panel.style.display = "block";
      displayScan();
    };

    document.getElementById("upsClosePanel").onclick = () => {
      panel.style.display = "none";
    };

    document.getElementById("upsRunScan").onclick =
      displayScan;

    document.getElementById("upsSafeFix").onclick = () => {
      const count = runSafeRepairs();

      displayScan();

      alert(
        count + " सुरक्षित सुधार लागू किए गए।"
      );
    };

    document.getElementById("upsCopyReport").onclick =
      async () => {
        const report = JSON.stringify(
          {
            date: new Date().toISOString(),
            url: location.href,
            errors,
            diagnosis: scanWebsite()
          },
          null,
          2
        );

        try {
          await navigator.clipboard.writeText(report);
          alert("Report Copy हो गई।");
        } catch (e) {
          const area = document.createElement("textarea");
          area.value = report;
          panel.appendChild(area);
          area.select();
          alert("Report Select हो गई। Copy करें।");
        }
      };
  }

  function displayScan() {
    const results = scanWebsite();

    const summary =
      document.getElementById("upsRepairSummary");

    const output =
      document.getElementById("upsRepairResults");

    const errorCount = results.filter(
      x => x.level === "ERROR"
    ).length;

    const warningCount = results.filter(
      x => x.level === "WARNING"
    ).length;

    summary.textContent =
      "कुल समस्याएँ: " + results.length +
      " | Errors: " + errorCount +
      " | Warnings: " + warningCount;

    if (!results.length) {
      output.innerHTML = `
        <div class="ups-repair-card">
          🟢 कोई समस्या इस Scan में नहीं मिली।
          <small>यह पूर्ण Functionality Test नहीं है।</small>
        </div>
      `;
      return;
    }

    output.innerHTML = results.map(item => {
      const card = document.createElement("div");

      card.className = "ups-repair-card";

      const title = document.createElement("strong");
      title.textContent =
        (item.level === "ERROR" ? "🔴 " : "🟡 ") +
        item.title;

      const detail = document.createElement("small");
      detail.textContent = item.detail;

      card.append(title, detail);

      return card.outerHTML;
    }).join("");
  }

  function start() {
    createRepairCenter();

    window.UPS_REPAIR_CENTER = {
      scan: scanWebsite,
      repair: runSafeRepairs,
      errors: errors
    };

    console.log("UPS Mobile Repair Center Ready.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();
