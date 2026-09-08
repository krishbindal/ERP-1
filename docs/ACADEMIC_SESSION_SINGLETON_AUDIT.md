# ACADEMIC SESSION SINGLETON AUDIT

## Overview
This document inventories all instances where the application improperly assumes a singleton active academic session (e.g., using .maybeSingle() or silently picking the first/latest session) or fetches unrestricted branch-wide academic data without session context.

## Inventory

| File/Path | Current Behavior | Risk / Issue | Intended Replacement | Context Source |
| :--- | :--- | :--- | :--- | :--- |
| pps/web/src/app/scheduling/lib/scheduling-context.ts (getActiveAcademicYearId) | Queries status = 'ACTIVE' with .single(). | Throws 500 DB error if multiple active sessions exist. Hides ambiguity. | Require explicit cademicSessionId via URL params or user selection. Deprecate this helper. | UI-driven (URL search param) |
| pps/web/src/app/scheduling/timetable/page-data.ts (etchSchedulingPageData, etchTimetablePageData) | Queries status = 'ACTIVE' with .maybeSingle(). | Silently drops data if multiple active sessions exist (due to Postgres maybeSingle() returning null on multiple matches). Crashes timetable. | Accept cademicSessionId as a required parameter. Pass it to the queries. | UI-driven (URL search param) |
| pps/web/src/app/students/new/page.tsx | Queries .from('sections').limit(1).maybeSingle() to find ANY section for auto-enrollment. | Randomly places a new student into the first returned section, ignoring session context and class structure. Data corruption. | Remove auto-enrollment from creation, OR require explicit selection of Session + Class + Section in the form. | UI-driven (Form selection) |
| pps/web/src/app/attendance/page.tsx | Sorts by start_date descending and silently picks years[0]. | Hides ambiguity if there are overlapping sessions. May default to the wrong active session. | Require explicit cademicSessionId from URL/Selector. | UI-driven (URL search param) |
| pps/web/src/app/homework/new/page.tsx | Sorts by start_date descending and silently picks years[0]. | Same as above. | Require explicit cademicSessionId from URL/Selector. | UI-driven (URL search param) |
| pps/web/src/app/homework/page.tsx | Sorts by start_date descending and silently picks years[0]. | Same as above. | Require explicit cademicSessionId from URL/Selector. | UI-driven (URL search param) |
| pps/web/src/app/academic-structure/calendar/page.tsx | Falls back to getActiveAcademicYearId. | Throws 500 on multiple active sessions. | Use explicit context selector. | UI-driven (URL search param) |
| pps/web/src/app/academic-structure/page.tsx | Queries all classes and sections for the branch without cademic_year_id filtering. | Visual mixing of classes/sections across historical and future sessions. | Require explicit cademicSessionId and filter queries by it. | UI-driven (URL search param) |
| pps/web/src/app/students/page.tsx | Queries StudentsService.listStudents() which fetches all students without any branch or session parameter. | Visual mixing of all students across all sessions. | StudentsService and page must accept ranchId and cademic_year_id and query enrollments table. | UI-driven (URL search param) |

## Plan
1. Introduce a reusable <AcademicSessionSelector> UI component that reads/writes ?session= URL params.
2. Update all the above pages to read searchParams.session.
3. If no session is selected, render a "No Session Selected - Please choose a session" empty state instead of failing.
4. Refactor listStudents() to list enrollments for the given session.
5. Remove .single() and .maybeSingle() queries on cademic_years filtering by status = 'ACTIVE'.
