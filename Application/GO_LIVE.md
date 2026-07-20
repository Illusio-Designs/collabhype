# Collabhype mobile app — Go-live & publishing guide

This is the Expo (React Native) app in `Application/`. It talks to the same
backend API as the web frontend. This guide covers everything needed to build
it and publish to the Google Play Store and Apple App Store.

---

## 0. Current status

**Working (login-gated for Brand & Creator):**
- Login / Register (role-based routing to Brand or Creator tabs)
- Overview, Campaigns, Orders/Payouts, Notifications (Inbox), Profile
- Browse packages & creators
- **Chat / rate negotiation** (consent gate, messages, offers, accept/decline)
- **Nano tasks** (creator claims), **Send brief** + delivery address, **Booking review**
- **In-app checkout / payment** — Razorpay escrow checkout from the Booking
  screen (create-order → Razorpay sheet → server-side verify). ⚠️ Uses the
  `react-native-razorpay` **native module**, so it only runs in a dev-client /
  EAS build — **not Expo Go** — and requires `npm install` + a fresh native
  build (see §3–§4).
- Socials, rate cards, support tickets

**Pending before a full launch:**
- (Optional) Push notifications, deep links for chat/campaign links.
- Final app icon / splash art + store screenshots.

> The app **only works after login** — the group layouts (`(brand)`, `(creator)`)
> redirect to `/login` when there is no session, and the API layer signs the user
> out on any `401`. A brand can't land in creator tabs and vice-versa.

---

## 1. Prerequisites (one-time)

- An **Expo account** — https://expo.dev (free).
- **EAS CLI**: `npm i -g eas-cli` then `eas login`.
- **Google Play**: a Play Console developer account ($25 one-time) + a service
  account JSON key (Play Console → Setup → API access) saved as
  `Application/play-service-account.json` (git-ignored).
- **Apple**: an Apple Developer Program membership ($99/yr) + your Apple ID,
  App Store Connect app ID, and Team ID.

---

## 2. Configure the app

1. **Backend URL.** The app reads `EXPO_PUBLIC_API_BASE_URL` at build time and
   appends `/api/v1`. Set it to your **production** backend in `eas.json` (all
   three build profiles) — replace the placeholder `https://api.collabhype.in`
   with your real API domain. For local dev, put it in a `.env`:
   ```
   EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com
   ```
2. **App identifiers** (already set in `app.json`):
   - iOS `ios.bundleIdentifier` = `com.collabhype.app`
   - Android `android.package` = `com.collabhype.app`
   - Change these if you own a different identifier.
3. **Version**: bump `expo.version` in `app.json` for each store release
   (build numbers auto-increment via `eas.json` → production `autoIncrement`).
4. **Icons & splash**: replace the files in `assets/images/` (icon, adaptive
   icon, splash) with final brand art before submitting.

---

## 3. Install & run locally (sanity check)

```bash
cd Application
npm install
npx expo start          # scan the QR with Expo Go for a quick check
```
Native modules (e.g. a future Razorpay SDK) require a **dev client**, not Expo Go:
```bash
eas build --profile development --platform android   # or ios
# install the resulting build on a device, then:
npx expo start --dev-client
```

---

## 4. Build for the stores

```bash
cd Application
eas build:configure          # first time only (creates credentials)

# Production store builds:
eas build --profile production --platform android    # -> .aab for Play
eas build --profile production --platform ios        # -> .ipa for App Store

# Quick shareable Android APK for internal testers:
eas build --profile preview --platform android
```
EAS builds in the cloud and returns a download/install link.

---

## 5. Submit to the stores

```bash
# Android (fill submit.production.android in eas.json first):
eas submit --profile production --platform android --latest

# iOS (fill submit.production.ios in eas.json first):
eas submit --profile production --platform ios --latest
```

### Store listing checklist (do this in the consoles)
- App name, short & full description, category.
- Screenshots (phone; iOS also needs a few sizes), feature graphic (Android).
- **Privacy Policy URL** → point to the web app's `/privacy` page.
- **Data safety (Play)** / **App Privacy (Apple)**: declare what you collect —
  name, email, phone, delivery address, chat messages, analytics (matches the
  app's Privacy Policy).
- Content rating questionnaire.
- Android: upload the `play-service-account.json` under API access.
- iOS: create the app in App Store Connect; first build goes through TestFlight.

---

## 6. Recommended pre-launch tests

- Register a **Brand** and a **Creator** account; confirm each lands on the
  right tabs and cannot see the other's.
- Brand: add a pack/creator to **Booking**, remove one, see subtotal.
- Brand ↔ Creator: accept the **chat** consent, exchange messages, send a
  **rate offer** (creator) and accept it (brand).
- Creator (Nano): open **Tasks**, accept one; brand **sends a brief** and sees
  the creator's delivery address on the campaign.
- Log out → confirm you're returned to **Login** and protected screens are gone.

---

## 7. What to apply before calling it "done"

1. ✅ **Checkout in-app** — implemented on the Booking screen
   (`/checkout/create-order` → Razorpay sheet → `/checkout/verify`). Because
   `react-native-razorpay` is a **native module**, you must:
   - `npm install` (pulls the dependency),
   - build a **dev client** or a store build with EAS (`eas build …`) — it will
     **not** work in Expo Go,
   - test a real payment on a device (use Razorpay test keys first).
   - Note: `app.json` has `newArchEnabled: true`. If the Razorpay sheet fails to
     open on the New Architecture, set `"newArchEnabled": false` and rebuild.
2. **Push notifications** (optional) — `expo-notifications` + register the
   device token so chat/campaign updates reach users off-app. (Also needs a
   small backend sender — not built yet.)
3. Final **icons/splash** and store screenshots.

Once #3 is done and #1 is verified on-device, the app is store-ready.
