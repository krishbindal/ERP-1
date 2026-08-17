# SchoolOS — UX/UI System

## UX goals

- Fast for daily school operations.
- Clear branch context.
- Predictable navigation.
- Dense data without visual clutter.
- Mobile-first for repetitive workflows.
- Accessible controls and readable typography.

## Global components

- App shell
- Sidebar/navigation
- Top bar
- Branch switcher (Super Admin only as applicable)
- Breadcrumbs
- Data table
- Search
- Filters
- Pagination
- Tabs
- Modal/dialog
- Drawer
- Form fields
- Date/time picker
- File upload
- Status badge
- Toast
- Confirmation dialog
- Empty state
- Loading skeleton
- Error state

## Design tokens

Define centrally:

- colors
- typography scale
- spacing
- radius
- elevation
- icon rules
- motion
- breakpoints

## State requirements

Every major screen must support:

- loading
- success
- empty
- validation error
- network error
- permission denied
- partial data where applicable

## Tables

Tables should support:

- sorting
- filtering
- search
- pagination
- column visibility where useful
- bulk actions only where permitted
- export only where permitted

## Forms

Forms must define:

- required fields
- validation
- server validation errors
- unsaved-change warning where needed
- success behavior

## Mobile

Prioritize:

- attendance
- homework
- timetable
- communication
- fee visibility/payment
- results

## Accessibility

Target a robust accessible baseline:

- keyboard navigation
- visible focus
- labels
- semantic controls
- readable contrast
- screen-reader-friendly structure where applicable
