---
name: SchoolOS
colors:
  surface: '#ffffff'
  surface-dim: '#f3f4f6'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9fafb'
  surface-container: '#f3f4f6'
  surface-container-high: '#e5e7eb'
  surface-container-highest: '#d1d5db'
  on-surface: '#111827'
  on-surface-variant: '#4b5563'
  inverse-surface: '#1f2937'
  inverse-on-surface: '#f9fafb'
  outline: '#d1d5db'
  outline-variant: '#e5e7eb'
  surface-tint: '#3b82f6'
  primary: '#2563eb'
  on-primary: '#ffffff'
  primary-container: '#dbeafe'
  on-primary-container: '#1e3a8a'
  inverse-primary: '#bfdbfe'
  secondary: '#4f46e5'
  on-secondary: '#ffffff'
  secondary-container: '#e0e7ff'
  on-secondary-container: '#312e81'
  tertiary: '#0ea5e9'
  on-tertiary: '#ffffff'
  tertiary-container: '#e0f2fe'
  on-tertiary-container: '#0c4a6e'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#fee2e2'
  on-error-container: '#7f1d1d'
  background: '#f9fafb'
  on-background: '#111827'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 60px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-edge: 32px
  section-gap: 64px
---

# SchoolOS Design System

## Foundations
- **Brand Colors:** Deep Blue (#2563eb) and Indigo (#4f46e5) form the core identity, providing a professional and trustworthy feel suitable for education administration.
- **Typography:** Inter is used for all text to ensure high legibility and a clean, modern aesthetic.
- **Spacing:** An 8px grid system.
- **Radius:** 8px (`md`) for cards and 6px (`sm`) for buttons.
- **Elevation:** Soft drop shadows (e.g., `0 4px 6px -1px rgb(0 0 0 / 0.1)`) are used to lift cards and modals above the background.

## Components
- **Buttons:** Filled for primary actions, outline for secondary actions, and ghost for tertiary actions.
- **Inputs:** Clean bottom borders or fully outlined with `outline-variant`. Active states use the `primary` color for the border.
- **Tables:** Zebra striping using `surface-container-low` and `surface-container` to maintain readability on large datasets.
- **Cards:** White (`surface`) backgrounds with 1px `outline-variant` borders and soft shadows. Used to group related information.

## States
- **Loading:** Skeleton loaders matching the dimensions of the final content, using a pulsing opacity animation.
- **Empty:** A centered illustration with a headline and a call-to-action button to create the first record.
- **Error/Permission Denied:** A red (`error`) icon with a clear message and a button to return to a safe state or request access.

## Responsive Rules
- **Mobile (< 768px):** Single column layouts. Sidebars collapse into hamburger menus. Tables convert to stacked card lists.
- **Tablet (768px - 1024px):** Two column layouts where applicable.
- **Desktop (> 1024px):** Persistent sidebars and dense data tables.

## Accessibility
- All text meets WCAG AA contrast requirements.
- Focus states are clearly visible with a 2px `primary` outline ring.
- Semantic HTML and ARIA labels are used for all interactive elements.
