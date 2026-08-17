# SchoolOS — Phase 1B: Branch App Factory Architecture

## 1. Technical Architecture (Expo & EAS)

To avoid cloning codebases for hundreds of branches, the "Branch App Factory" utilizes a single monolithic React Native (Expo) codebase, heavily parameterized at build time.

### The Mechanism: Dynamic `app.config.ts`

Expo allows the application configuration (`app.json`) to be defined programmatically as `app.config.ts`. During an EAS Build, environment variables dictate how the app is assembled.

```typescript
// Conceptual app.config.ts
export default ({ config }) => {
  const branchId = process.env.EXPO_PUBLIC_BRANCH_ID || 'default_schoolos';
  const branchConfig = fetchBranchConfigSync(branchId); 

  return {
    ...config,
    name: branchConfig.appName,
    slug: `schoolos-${branchId}`,
    ios: {
      bundleIdentifier: branchConfig.iosBundleId,
      buildNumber: process.env.BUILD_NUMBER,
    },
    android: {
      package: branchConfig.androidPackageId,
      versionCode: parseInt(process.env.BUILD_NUMBER),
    },
    icon: `./assets/branches/${branchId}/icon.png`,
    splash: {
      image: `./assets/branches/${branchId}/splash.png`,
      backgroundColor: branchConfig.primaryColor
    }
  };
};
```

## 2. Configuration Storage & Provisioning

- **Source of Truth:** Branch app configurations (bundle IDs, colors, names) are stored in the central PostgreSQL database (`branch_app_configs` table).
- **Provisioning:** When a new branch is created, a Supabase Edge Function allocates a new bundle ID and triggers a GitHub Action. The GitHub Action pulls the logo/icon from Supabase Storage, checks them into the git repository under `assets/branches/{branchId}/`, and registers the app with Apple/Google via Fastlane.

## 3. Scale Management Strategy

As the number of branches scales, rebuilding every app on every commit is impossible.

### Scale: 5 to 25 Branches
- Manual or semi-automated GitHub Actions matrix builds. When a major feature drops, a matrix job iterates over all 25 branches and queues EAS builds.

### Scale: 100 to 500 Branches
- **Decoupling Native and JS Updates:** Native code changes (requiring new binaries) are rare (e.g., adding a new camera SDK). 95% of updates are pure JavaScript/React components.
- **EAS Update (OTA):** We will utilize EAS Update. A single CI run builds the JavaScript bundle and pushes it over-the-air to *all* branches simultaneously. The apps download the update transparently.
- **Binary Releases:** When a native change is required, builds are batched. We run a scheduled pipeline that builds and submits 10-20 apps per night to avoid hitting EAS queue limits and Google Play API quotas.

## 4. Notifications & Identifiers

- **Google (Android):** We use a single Firebase project. FCM allows sending messages via HTTP V1 API without strict per-package isolation issues as long as the service account is valid.
- **Apple (iOS):** Because we use Apple Custom Apps, each branch has a distinct Bundle ID. Managing 500 APNs certificates is impossible. We will use **APNs Auth Keys (p8)**. A single team-level p8 key can send push notifications for *any* Bundle ID under that Apple Developer Account. Supabase Edge Functions will map the user's `branch_id` to the specific `bundle_id` when firing the push request to Apple.

## 5. Branch Offboarding (Data Export)

The centralized database handles offboarding via an asynchronous job.
1. Branch Admin requests export.
2. A Supabase Edge Function spins up.
3. It iterates through all tables where `branch_id = X`, serializing the records to a massive JSON archive.
4. It packages related files from Storage.
5. The ZIP archive is provided via a short-lived signed URL.
6. A scheduled cron job permanently cascading-deletes the `branch_id` after 30 days.
