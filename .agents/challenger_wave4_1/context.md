# Challenger Wave 4 Context

## Working Directory
`c:\Users\krish\Desktop\ERP 1\.agents\challenger_wave4_1\`

## Project Root
`c:\Users\krish\Desktop\ERP 1`

## Target Branch & Commit
- Branch: `feat/wave4-integrated`
- Commit SHA: `96fac29a08b6b95bc93c686bf49990b01b019a71`
- Base SHA: `34697ec4704ead254d881956ad606f736403d366` (`origin/feat/wave3-integrated`)

## Mission
Empirically stress-test the Wave 4 integration:
1. Verify modal dialog and drawer focus trap: Tab/Shift+Tab cycles within dialog.
2. Verify escape key dismisses open dialogs, drawers, and toasts.
3. Verify mobile viewports (320px, 375px, 390px): verify drawer max-width doesn't blow out (`max-w-[85vw]`), backdrop remains tap-accessible.
4. Verify touch targets on interactive controls (buttons, links) are >= 44x44px.
5. Verify table keyboard horizontal scrolling (`role="region"` with `tabIndex={0}`).
6. Verify student form submission error alerts and valid enrollment flow.
7. Run the full unit and Playwright E2E test suites to empirically verify correctness and lack of flakiness.
