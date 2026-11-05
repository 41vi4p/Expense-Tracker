# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project

ExpenseTracker: a Next.js 16 / React 19 / TypeScript / Tailwind CSS 4 app using Firebase Auth (Google) and Firestore.
It is deployed to Vercel as a web app and also packaged as an Android APK with Capacitor.

## ⚠️ Mandatory: version every change

For **every** change you make (feature, fix, refactor, dependency bump, docs that matter to users):

1. **Bump the version in `package.json`** (and `package-lock.json`) using semver:
   - `patch` (x.y.Z): bug fixes, small tweaks, dependency patches
   - `minor` (x.Y.0): new backwards-compatible features
   - `major` (X.0.0): breaking changes or big overhauls
   - Use `npm version <patch|minor|major> --no-git-tag-version`.
2. **Document it in `docs/CHANGELOG.md`**: add a new `## [x.y.z] - YYYY-MM-DD` section at the top
   (Keep a Changelog groups: Added / Changed / Fixed / Security / Removed). Write it for end users,
   because this text becomes the GitHub release notes verbatim.
3. Update the version badge in `README.md`.

The release workflow publishes a release only when `package.json` has a version with no matching `vX.Y.Z` tag,
and it fails if `docs/CHANGELOG.md` has no section for that version. Forgetting step 1 means no APK is released.

## Requirements

Node.js >= 24.12 (required by Firebase 12; enforced via `engines`, used by Vercel and CI).

## Commands

```bash
npm run dev            # dev server (Turbopack)
npm run build          # web production build
npm run build:static   # static export into ./out (used by the Android app)
npm run lint           # ESLint (flat config)
npx tsc --noEmit       # type check
npm run android:debug  # build a debug APK (needs JDK 21 + Android SDK)
```

Before finishing a change run `npx tsc --noEmit`, `npm run lint` and `npm run build`.

## Architecture

- `src/app/*` pages (all client components; no server routes, so the whole app can be statically exported).
- `src/contexts/AuthContext.tsx` Firebase auth. On Android it uses the native Google dialog (`@capacitor-firebase/authentication`) and exchanges the ID token; on web it uses the popup.
- `src/contexts/ThemeContext.tsx` light/dark/system. The `<html>` element gets a `light` or `dark` class; an inline script in `layout.tsx` sets it before first paint.
- `src/lib/firestore.ts` all data access. `src/lib/validation.ts` input validation. `src/lib/logging.ts` activity log.
- `firestore.rules` security rules. **Any new collection or field must be added to the rules.**
- `android/` Capacitor Android project; `capacitor.config.ts` its config.
- `.github/workflows/ci.yml` checks; `release.yml` builds the APK and publishes the release.

## Conventions

### Theming
- Use the semantic tokens (`bg-background`, `bg-surface`, `text-foreground`, `border-border`, `text-primary`, ...) which resolve per theme in `globals.css`.
- Do **not** hard-code `text-gray-*`, `bg-white`, `bg-black/*` for surfaces. Use `text-foreground/70`, `bg-surface`, `modal-overlay`, `backdrop-blur-glass`.
- `text-white` is fine only on saturated coloured backgrounds (gradient buttons, icon chips).
- Verify new UI in both light and dark.

### Security rules of thumb
- Never trust the client: validate with `validateTransaction`/`sanitizeText` and mirror constraints in `firestore.rules`.
- Never write PII (email, name, IP, user agent) to activity logs.
- Never add a function that reads data across users.
- Never commit secrets: `.env*`, `google-services.json`, keystores are git-ignored. Firebase web config is public by design; access is controlled by the rules.
- Run `npm audit` when touching dependencies.

### Next.js notes
- Keep pages compatible with `output: 'export'` (no API routes, no server actions, no dynamic routes without `generateStaticParams`).
- Use `useRouter().push` for navigation, never `window.location.href`.

## Release process

See [docs/ANDROID.md](docs/ANDROID.md). In short: bump version -> update changelog -> merge to `main` -> the workflow tags `vX.Y.Z`, builds the APK and creates the GitHub release with the changelog section as notes.
