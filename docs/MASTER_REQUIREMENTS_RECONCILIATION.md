# Master Requirements Reconciliation

| ID | DOMAIN | REQUIREMENT | SOURCE DOC | DB | BACKEND | WEB | MOBILE | RLS | TESTS | CI | DOCS | STATUS | GAP | SEVERITY | ACTION |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-01 | Foundation | Identity & Orgs | 03_USER_ROLES_AND_ACTORS | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-02 | Foundation | Tenant Isolation | 13_RLS_SECURITY_MODEL | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-03 | Foundation | Storage | 24_FILE_STORAGE | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-04 | Foundation | API Contracts | 16_API_ARCHITECTURE | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-05 | Foundation | Audit Logging | 15_AUDIT_AND_COMPLIANCE | Y | Y | N | N | Y | Y | Y | Y | PARTIALLY IMPLEMENTED | Missing UI/complete historical audit | P2 | Implement history tables |
| REQ-06 | Students | Enrollment & Profiles | 02_PRODUCT_REQUIREMENTS | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-07 | Students | Guardians | 02_PRODUCT_REQUIREMENTS | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-08 | Students | Transfer | 02_PRODUCT_REQUIREMENTS | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-09 | Staff | Staff Profiles & Roles | 02_PRODUCT_REQUIREMENTS | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-10 | Staff | Teacher Assignments | 02_PRODUCT_REQUIREMENTS | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-11 | Scheduling | Calendar & Timetable | 04_SCHEDULING | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-12 | Scheduling | Substitutions | 04_SCHEDULING | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-13 | Attendance | Attendance Tracking | 05_ATTENDANCE | Y | Y | Y | N/A | Y | N | Y | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E | P1 | Add E2E tests |
| REQ-14 | Homework | Homework & Learning | 06_HOMEWORK_LEARNING | Y | Y | Y | N/A | Y | N | Y | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E | P1 | Add E2E tests |
| REQ-15 | Comm. | Communication Engine | 10_COMMUNICATION | Y | Y | Y | N/A | Y | Y | Y | Y | IMPLEMENTED | None | None | None |
| REQ-16 | Cross | Identifier Engine | 06_SYSTEM_ARCHITECTURE | N | N | N | N/A | N/A | N | N | Y | PLANNED | Missing central generator | P1 | Implement before Phase 7 |
| REQ-17 | Cross | Temp Credentials | 02_PRODUCT_REQUIREMENTS | Y | N | N | N/A | N/A | N | N | Y | PARTIALLY IMPLEMENTED | DB flag exists, missing enforcement | P1 | Implement enforcement |
| REQ-18 | Cross | Bulk Import | 27_IMPORT_EXPORT | N | N | N | N/A | N/A | N | N | Y | PLANNED | Completely missing | P2 | Defer |
| REQ-19 | Cross | Duplicate Detection | 05_BUSINESS_RULES | N | N | N | N/A | N/A | N | N | Y | PLANNED | Completely missing | P2 | Defer |
| REQ-20 | Cross | Bulk Operations | 02_PRODUCT_REQUIREMENTS | N | N | N | N/A | N/A | N | N | Y | PLANNED | Completely missing | P2 | Defer |
| REQ-21 | Cross | Action Center | 02_PRODUCT_REQUIREMENTS | N | N | N | N/A | N/A | N | N | Y | PLANNED | Completely missing | P3 | Defer |
| REQ-22 | Cross | Universal Search | 02_PRODUCT_REQUIREMENTS | N | N | N | N/A | N/A | N | N | Y | PLANNED | Completely missing | P3 | Defer |
| REQ-23 | Cross | Onboarding | 02_PRODUCT_REQUIREMENTS | N | N | N | N/A | N/A | N | N | Y | PLANNED | Completely missing | P3 | Defer |
| REQ-24 | Cross | Backup / DR | 34_BACKUP_DR | N | N | N | N/A | N/A | N | N | Y | PLANNED | Missing custom DR strategy | P1 | Plan strategy |
| REQ-25 | Cross | Observability | 35_MONITORING_OBSERVABILITY | N | N | N | N/A | N/A | N | N | Y | PLANNED | Missing dashboards/metrics | P2 | Defer |
| REQ-26 | Cross | Prod Ownership | 45_CLIENT_HANDOVER | N | N | N | N/A | N/A | N | N | Y | PLANNED | Handover not done | P1 | Defer |
| REQ-27 | App | Branch App Factory | 22_BRANCH_APP_FACTORY | N | N | N | N | N/A | N | N | Y | PLANNED | Missing factory | P2 | Defer |
