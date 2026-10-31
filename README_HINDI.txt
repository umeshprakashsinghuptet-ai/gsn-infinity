UPS CREATOR STUDIO — PREMIUM READY PACKAGE

PACKAGE FILES (ROOT LEVEL)
- index.html
- styles.css
- app.js
- config.js
- .github/workflows/quality-check.yml

UPLOAD STEPS
1. Apni GitHub repository ka backup pehle se safe rakhein.
2. Is ZIP ko extract karein.
3. ZIP ke andar ki files aur .github folder ko repository ke ROOT mein upload/replace karein.
4. GitHub par folder structure verify karein: app.js, index.html, styles.css aur config.js seedhe root mein hone chahiye.
5. Commit karein. Actions tab mein “UPS Creator Studio - Quality Check” workflow run hoga.
6. GitHub Pages ki existing deployment setting ko preserve karein. Is package ka workflow sirf static quality checks karta hai; existing Pages deployment workflow ko replace nahi karta.

IMPORTANT SECURITY / BACKEND NOTES
- config.js mein Supabase publishable key hai. Browser-side publishable/anon key public hoti hai; kabhi service_role key yahan na rakhein.
- Supabase Auth, profiles/projects tables, RLS policies aur private Storage policies ko Supabase Dashboard mein configure aur live-test karna hoga.
- Admin/Super Admin ke sensitive actions ko trusted server-side Edge Functions + RLS se secure karna zaroori hai. Sirf frontend role check security nahi hai.
- Real AI image/video generation is package mein enabled nahi hai; AI_GENERATION false hi rahega jab tak secure backend/provider integration na ho.
- Workflow PASS hone ka matlab static checks pass hona hai, live Supabase/browser end-to-end certification nahi.
