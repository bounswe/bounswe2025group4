# Job Listing Platform – Front-end

> A React 19 / Vite web-app that connects job-seekers with ethical employers.  
> This README is written as a **living TODO list** — check items off as you complete them!

---

## ⏱  0. Project Bootstrap

- [x] **Fork / clone** the repository  
- [x] `pnpm install` (or `npm ci`)  
- [x] Copy `.env.example` to `.env.local` and fill in API endpoints, JWT secret, Socket.io URL  
- [x] `pnpm run dev` &nbsp;▶︎ &nbsp;open <http://localhost:5173>  

---

## 🏗  1. Core Setup

- [x] Configure **ESLint flat-config** + Prettier  
- [x] Add **husky** pre-commit hook (`lint`, `type-check`, `test:unit`)  
- [x] Wire **React Router v7** data routes (see `src/app/router.tsx`)  
- [x] Create global **MUI v7** theme & dark-mode toggle  
- [x] Set up **AuthContext** (JWT access/refresh, social OAuth placeholders)  
- [x] Initialise **TanStack Query** client in `src/main.tsx`  
- [x] Create **Zustand** store for notifications and UI flags  

---

## 🔑  2. Authentication Flow

- [ ] `/register` → email / password + validation  
- [ ] `/login` + remember-me  
- [ ] Forgot-password wizard (`/reset-password`)  
- [ ] Account deletion confirmation dialog  

---

## 📄  3. Job Listings & Applications

- [x] **JobList** page `/jobs`  
  - [ ] Fetch + cache jobs (`queryKey: ['jobs', filters]`)  
  - [x] Filter sidebar (ethical policies, salary range, company)  
  - [x] Skeleton loaders & empty-state illustrations  
- [x] **JobDetail** page `/jobs/:id`  
  - [ ] Apply form (Router *action* + optimistic UI)  
  - [ ] Company badge linking to `/company/:slug`  
- [ ] Employer dashboard `/dashboard/jobs`  
  - [ ] CRUD wizard (MUI **DataGridPro**)  
  - [ ] Validation with `zod`  

---

## 🎓  4. Resume Review & Mentorship

- [ ] **MentorDirectory** `/mentorship`  
  - [ ] Capacity indicator chips  
  - [ ] Request modal → triggers Socket.io notification  
- [ ] **ChatThread** `/mentorship/chat/:threadId`  
  - [ ] Realtime messages (Socket.io)  
  - [ ] “Mark review complete” button  
- [ ] Rating dialog (+ optimistic update to mentor profile)  

---

## 💬  5. Networking Forum

- [ ] **ForumHome** `/forum`  
  - [ ] Create thread (RHF + markdown editor)  
  - [ ] Tag picker (predefined & custom)  
- [ ] **ThreadDetail**  
  - [ ] Infinite-scroll comments  
  - [ ] Edit / delete own posts  
  - [ ] Report inappropriate content → API  

---

## 🏢  6. Profiles

- [ ] **UserProfile** `/u/:username`  
  - [ ] Avatar upload (S3 presigned URL)  
  - [ ] Badges component  
- [ ] **CompanyProfile** `/company/:slug`  
  - [ ] Ethical-policy checklist  
  - [ ] Aggregated workplace ratings chart  

---

## 🚀  7. Production Readiness

- [ ] Add **Sentry** for error logging  
- [ ] PWA & offline cache (Workbox plugin)  
- [ ] Lighthouse performance budget (< 200 kB first load)  
- [ ] Environment-specific builds (`pnpm run build:staging`, `build:prod`)  
- [ ] GitHub Actions CI  
  - [ ] Vitest + React-Testing-Library suite  
  - [ ] Cypress smoke tests  
  - [ ] Deploy previews to Vercel  

---

## 🧪  8. Testing Matrix

- [ ] Unit tests ≥ 80 % coverage  
- [ ] Storybook stories for every shared component  
- [ ] a11y checks (axe-core) in CI  
- [ ] Manual QA on latest Chrome, Firefox, Safari, Edge + Android Chrome  

---

## 📌  9. Non-Functional Requirements Checklist

- [ ] 99 % uptime monitored via Status-page badge  
- [ ] GDPR/KVKK “Download my data” & “Erase me” flows  
- [ ] Daily encrypted backups verified  
- [ ] Security headers (CSP, HSTS, Referrer-Policy) via Vite plugin  

---

## ✨  10. Nice-to-Haves (Backlog)

- [ ] Dark-mode aware hero illustrations (svg)  
- [ ] Live search suggestions for job titles  
- [ ] Admin dashboard for forum moderation  
- [ ] Push notifications (Web Push API)  
- [ ] i18n Turkish 🇹🇷 & English 🇬🇧 toggle  

---

### How to contribute

1. Create a branch: `feat/<ticket-id>-short-desc`  
2. Check off the relevant boxes above in your PR description  
3. Run **all** lint / test scripts locally  
4. Open PR → ensure Vercel preview passes Cypress tests  

Happy coding! 🎉
