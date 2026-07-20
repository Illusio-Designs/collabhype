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
- Socials, rate cards, support tickets

**Pending before a full launch:**
- **On-device checkout / payment** — needs the `react-native-razorpay` native
  module + a new native build. Until then, brands complete escrow checkout on
  the **web app**; the booking screen hands them off there.
- (Optional) Push notifications, deep links for chat/campaign links.

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

1. **Checkout in-app** — add `react-native-razorpay`, wire the
   `/checkout/create-order` → Razorpay sheet → `/checkout/verify` flow on the
   booking screen, then rebuild (native module ⇒ new EAS build).
2. **Push notifications** (optional) — `expo-notifications` + register the
   device token so chat/campaign updates reach users off-app.
3. Final **icons/splash** and store screenshots.

Once #1 and #3 are in, the app is store-ready.
