# Phase 3C.4: Stitch UI Architecture & Layout

This document defines the user interface architecture for the foundational academic management screens. It serves as the blueprint for the React/Next.js implementation.

## 1. Application Shell
The Application Shell wraps all authenticated routes and provides global navigation.

### Components
*   **Sidebar (Left):**
    *   Responsive (collapses to hamburger menu on mobile).
    *   **Navigation Links:** Dashboard, Academic Structure, Staff, Students, Settings.
    *   Active state styling with a subtle highlight.
*   **Top Bar:**
    *   **Branch Selector:** A dropdown allowing Super Admins or multi-branch staff to switch their active context. Defaults to the user's primary assigned branch.
    *   **User Menu:** Avatar, Name, Role Badge (e.g., "Branch Admin"), and Logout button.

## 2. Dashboard Shell
*   **Layout:** Grid-based layout.
*   **Loading State:** Skeleton loaders matching the dimensions of the final widgets.
*   **Empty State:** "Welcome to [Branch Name]. Your dashboard will populate once academic data is entered."

## 3. Academic Structure Hub
A centralized page (`/academic-structure`) for managing Years, Classes, and Sections.

### 3.1 Tabs Navigation
*   Since Years, Classes, and Sections are tightly coupled, we use a horizontal tab interface to switch between them.

### 3.2 Data Tables (Shared Pattern)
*   **Columns:** Descriptive headers (e.g., Name, Start Date, Status, Actions).
*   **Empty State:** Illustration with a primary "Create First [Entity]" button.
*   **Actions:** Edit (pencil icon) and Delete (trash icon) grouped in the rightmost column.
*   **Pagination:** Standard 10-row pagination.

### 3.3 Create/Edit Slide-out Forms
*   **Interaction:** Clicking "Create" opens a right-aligned sliding drawer (Slide-out) rather than navigating to a new page. This preserves context.
*   **Form Elements:**
    *   Standard input fields with floating labels.
    *   Date pickers for `academic_years`.
    *   Select dropdowns for linking (e.g., selecting an Academic Year when creating a Class).
*   **Validation:** Inline red text below fields for errors.
*   **Feedback:** Toast notifications in the bottom-right corner ("Class created successfully", "Error: Unauthorized").

## 4. Permission-Denied States
*   **Trigger:** A Teacher attempts to access `/academic-structure/create` directly via URL.
*   **UI:** A centered, polite "Access Denied" illustration. 
*   **Copy:** "You do not have the required permissions to view this page. If you believe this is an error, please contact your Super Admin."
*   **Action:** "Return to Dashboard" button.

## 5. Responsive Behavior
*   **Desktop (lg):** Persistent sidebar, full data tables.
*   **Tablet (md):** Collapsible sidebar, scrollable data tables.
*   **Mobile (sm):** Bottom navigation or hamburger menu, stacked cards instead of data tables for entities. Slide-out forms become full-screen modals.
