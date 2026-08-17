# Login Screen Specification

- **Actor:** Unauthenticated User
- **Permission:** None
- **Purpose:** Secure entry point to the SchoolOS platform.
- **Navigation:** Routes to `/dashboard` (Web) or `AppStack` (Mobile) upon success.
- **Layout:** Centered card on a subtle gray background. Deep Blue primary button.
- **Data Requirements:** Email and Password inputs.
- **States:**
  - Idle: Standard form.
  - Loading: Button shows spinner.
  - Error: Inline red text below inputs or a top toast for network errors.
- **Responsive Behavior:** Card fills screen width on mobile, max-width 400px on desktop.
- **Accessibility:** Inputs must have semantic `<label>` or `aria-label`. Focus traps within modal if applicable.
- **Stitch Reference:** Generated via Stitch MCP on 2026-08-18.
- **Implementation Notes:** Integrates directly with Supabase Auth `signInWithPassword`.
