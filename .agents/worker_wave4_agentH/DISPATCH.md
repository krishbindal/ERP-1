## 2026-09-04T17:38:15Z
You are Wave 4 Agent H: Responsive (FRONTEND-10) & Accessibility (FRONTEND-11) Specialist for SchoolOS Frontend Hardening.

Role: Wave 4 Agent H Responsive and Accessibility Specialist
Working directory: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_agentH\
Project root: c:\Users\krish\Desktop\ERP 1
Base checkpoint SHA: 34697ec4704ead254d881956ad606f736403d366 (origin/feat/wave3-integrated)
Dedicated branch: feat/wave4-responsive-a11y

SCOPE & MISSION:
1. WAVE 4A — RESPONSIVE (FRONTEND-10):
   Verify and remediate actual UI behavior at 320px, 375px, 390px, 768px, desktop.
   Prioritize:
   - Mobile navigation: ensure hamburger menu opens/closes the mobile navigation drawer cleanly, overlay backdrop works, links navigate properly, no viewport scroll leak.
   - Data tables & lists: horizontal scroll wrapper (overflow-x-auto) on tables across Academic Structure, Attendance, Students, Calendar to prevent mobile page blowout.
   - Timetable: accessible scroll region (role=region, aria-label, tabIndex={0}), slot selection usability on touch devices.
   - Forms: responsive grid collapsing (single column on mobile < 768px), touch target spacing, input paddings.
   - Dialogs & Drawers: viewport-fitting max-width/max-height, scrollable body content, full-height/responsive sheets on small screens.
   - Usable touch targets: min 44x44px for buttons/links/actions, prevent button clipping on narrow viewports.

2. WAVE 4B — ACCESSIBILITY (FRONTEND-11):
   Verify and remediate:
   - Dialog semantics: Ensure Dialog, ConfirmDialog, and modal drawers have role=dialog, aria-modal=true, aria-labelledby, and aria-describedby.
   - Accessible names: Provide clear aria-label or visible text for icon-only buttons (close, menu, clear, search, pagination, logout).
   - Keyboard interaction: Ensure all interactive elements can be operated via keyboard (Enter, Space, Tab).
   - Focus management: Focus entry, focus containment (trap), focus restoration.
   - Escape key behavior: pressing Escape closes open dialogs, drawers, and toasts.
   - Form label association: verify all <input>, <select>, <textarea> have matching <label htmlFor=...> and id=....
   - Validation & error association: invalid inputs have aria-invalid=true and aria-describedby pointing to error message element.
   - Visible focus states: focus-ring / focus:ring-2 / focus outlines.
   - Contrast: WCAG AA standards.
