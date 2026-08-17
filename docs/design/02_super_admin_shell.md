# Super Admin Shell Specification

- **Actor:** Super Admin
- **Permission:** `is_super_admin = true`
- **Purpose:** Organization-wide management and branch switching.
- **Navigation:** Persistent left sidebar (desktop) or hamburger drawer (mobile). Topbar for profile/logout.
- **Layout:** 250px sidebar, fluid content area.
- **Data Requirements:** Global organization stats, active branch selector.
- **States:**
  - Empty: "No branches created yet."
  - Loading: Skeleton over the main dashboard area.
- **Responsive Behavior:** Sidebar collapses below 1024px.
- **Accessibility:** Sidebar must be keyboard navigable.
- **Stitch Reference:** Generated via Stitch MCP on 2026-08-18.
- **Implementation Notes:** Context provided by `packages/auth`. `activeBranchId` is set here.
