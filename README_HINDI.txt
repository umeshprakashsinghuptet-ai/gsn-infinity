# UPS Creator Studio v1.3 — Hardened Package

## Included
- Existing UPS Creator Studio application and cinematic UI.
- 100-module / 25-lock / 12-engine / 15-stage architecture registry.
- Prompt variants: Detailed, Short, Ultra Short and YT Create (maximum 900 JS characters).
- Gemini Image and Video prompt drafting.
- Multi-clip storyboard planning and JSON copy/download.
- Supabase profile and project integration hooks.
- Private profile-photo upload flow (5 MB client-side cap), preview, replace and delete.
- Profile-photo upload rollback cleanup if the profile database update fails.
- Supabase security migration: `SUPABASE_SECURITY_HARDENING.sql`.
- Human-readable deployment and live-test instructions.

## Important capability boundaries
This package is a prompt-production planner and storyboard system. It does NOT itself provide live Gemini image/video generation or MP4 rendering. Those require a secure server-side provider integration and credentials. The admin screen is not a complete production user-management backend. Do not treat client-side role visibility as authorization.

## Before deployment
1. Download a ZIP backup of your current GitHub repository.
2. Keep Supabase database and Storage data. Do not delete the Supabase project or bucket.
3. Extract this ZIP and upload its contents to the repository root (not the parent folder).
4. Preserve any existing GitHub Pages deployment workflow if your repository has one.
5. In Supabase SQL Editor, review and run `SUPABASE_SECURITY_HARDENING.sql` once as project owner.
6. In Supabase Dashboard > Settings > API, verify the Data API is enabled for `public.profiles` and `public.creator_projects`.
7. Verify Storage bucket `owner-private-profile` exists, is Private, and has the intended 5 MB bucket limit.
8. Confirm the browser app uses only the Supabase publishable/anon key. Never add `service_role` to `config.js`.

## First Super Admin
The migration intentionally prevents a normal signed-in user from self-assigning a role. It does not automatically create a Super Admin. Set the first Super Admin role only from a trusted Supabase SQL Editor session after confirming the exact account UUID:
`UPDATE public.profiles SET role='super_admin' WHERE user_id='<verified-auth-user-uuid>';`
Never run this with a guessed UUID. Do not expose service-role credentials.

## Live verification required
Static checks do not prove login, upload, cloud save, RLS, Admin authorization, Gemini API or MP4 rendering. Follow `LIVE_TEST_PLAN_HINDI.txt` and record actual outcomes before calling this production-ready.
