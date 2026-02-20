# 🐦 FlyingBird Pro

A beautifully designed, cross-platform adaptation of the classic Flappy mechanics, powered by React Native and Vite. Experience seamless playability with a built-in predictive Autopilot Bot, dynamic rendering environments, and competitive mock leaderboards.

## 🔥 Key Features

- **Flawless Cross-Platform Mechanics:** Runs on iOS, Android, and perfectly transitions to the Web with `react-native-web` and `vite`.
- **Intelligent Autopilot (UI Test Bot):** Engage the AI via the main menu to watch the game practically play itself. The Autopilot calculates trajectory, anticipates gravity 3 frames in the future, and executes precise micro-flaps to clear tight gaps.
- **Dynamic Procedural Environments:** Backgrounds adapt dynamically across various stages every 10 points.
- **Earth Cycle Leaderboards:** Competitive "Live" mock scoring metrics and global ranking interfaces.

---

## 🚀 Getting Started

Ensure you have your base Node configuration set up.

### Install Dependencies
```bash
npm install
```

### 🌍 Run Web (Recommended)
This boots the highly responsive Vite environment running the game natively in the browser on port `:5173`.
```bash
npm run web
```

### 📱 Run Mobile iOS & Android
Launch via standard React Native metro bundler:
```bash
npm run ios
# or
npm run android
```

---

## 🧪 Testing Infrastructure

The game ships with a comprehensive testing suite simulating unit mounts and End-to-End game flows via Playwright.

### Unit Tests
Execute the Jest snapshot and component verification tests:
```bash
npm run test
```

### End-to-End E2E Visual Tests
The robust visual Playwright suite mounts the engine, clears animations, accesses the Global Leaderboards, and even fully executes an autonomous run of the Autopilot Bot!

*To run E2E Tests, make sure your Web Server (`npm run web`) is active in a separate terminal OR rely on the auto-startup hook:*
```bash
# Headless run
npm run test:e2e

# Interactive UI test runner
npm run test:e2e:ui
```

---

## ☕ Support the Developer!
If you enjoy the project or love watching the Autopilot AI master the skies, consider sending a Ko-Fi over at:
[Ko-Fi Sponsor: FlyingBirdAlways](https://ko-fi.com/flyingbirdalways)
