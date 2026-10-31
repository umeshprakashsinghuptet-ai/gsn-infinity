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
    getElement("projectList");

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
   END OF PART 4G
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
   END OF PART 4G
   ========================================= 
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
   ========================================= */