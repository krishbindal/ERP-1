# SchoolOS — Phase 1B: App Distribution Architecture

## 1. Distribution Strategy Analysis

We must support branded apps across Android and iOS without violating store policies, specifically Apple Review Guideline 4.3 (Spam), which prohibits publishing highly similar white-labeled apps to the public App Store.

### Recommended Model: Hybrid Distribution

The "App per Branch" requirement will be satisfied differently depending on the user cohort and the mobile operating system.

#### A. Parent/Student Apps (B2C)
Parents and students need high discoverability and lack managed devices.
- **Android:** We will publish branch-specific white-labeled apps to the public Google Play Store (Google is generally more lenient than Apple regarding white-labeling).
- **iOS:** To avoid Apple's Guideline 4.3 rejection, we will publish a **single unified "SchoolOS" app** to the public App Store. Upon first launch, the user enters a "School Code" (or logs in), and the app dynamically downloads the branch's specific branding configuration (logo, colors, name) over the air.

#### B. Teacher & Branch Admin Apps (B2B)
Staff members use the app as an internal business tool.
- **iOS:** Distributed privately as **Apple Custom Apps** via Apple Business Manager (ABM). Each branch gets its own distinct, branded app binary, distributed privately via redemption codes or MDM (Mobile Device Management) bypassing public App Store review constraints.
- **Android:** Distributed via **Managed Google Play** or unlisted Play Store links, retaining branch-specific branding.

#### C. Super Admin App
- Distributed as a single unified public/private app that can context-switch between all branches globally. (Alternatively, handled via responsive Web only for Phase 1).

## 2. Branch App Identity & Branding

- **Security Identity:** A mobile app's embedded `BRANCH_ID` (compiled into the binary) is used **solely for configuration and branding routing** (fetching the correct theme, API endpoints, and login context).
- **It is NOT a security boundary.** The backend NEVER trusts the client's assertion that "I am the Branch A app."
- **Wrong App Scenario:** If a parent from Branch B accidentally downloads the Branch A app, they will not be able to log in. Authentication will fail because their `auth_user_branches()` evaluation will return `[B]`, but the app's context is demanding `A`.

## 3. Scale Management (5 to 500 Branches)

Managing App Store listings is the ultimate friction point.

- **5-25 branches:** Manual App Store Connect / Play Console configuration is viable.
- **100-500 branches:** The hybrid approach saves us from managing 500 public iOS listings. We only manage 500 Android listings (via Fastlane automation) and 500 Private ABM apps (which require less strict review and update cycles).

## 4. API Version Compatibility

With hundreds of deployed apps, forcing simultaneous updates is impossible. 

- **Backend Backward Compatibility:** The backend APIs must remain non-breaking. Changes to database schemas must be strictly additive.
- **EAS Updates:** Expo Application Services (EAS) OTA (Over-The-Air) Updates will be heavily utilized to push JavaScript logic fixes to old binaries instantly without going through app store review, effectively keeping all branches on the same JS codebase version regardless of their underlying native binary version.
- **Deprecation Policy:** A global `min_app_version` check will exist. If an app falls below the minimum required binary version, the API returns a `426 Upgrade Required`, and the app locks, forcing the user to update from the store.
