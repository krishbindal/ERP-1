# Master Requirements Reconciliation

| ID | DOMAIN | REQUIREMENT | SOURCE | DB | BACKEND | WEB | MOBILE | RLS | TESTS | CI | OPS | DOCS | STATUS | GAP | SEVERITY | ACTION |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-001 | Cross-Cutting | Temporary credentials | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing middleware enforcement | P0 | Implement force_password_reset middleware |
| REQ-002 | Cross-Cutting | Identifier engine | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Missing central generator | P1 | Implement before Phase 6/7 |
| REQ-003 | Cross-Cutting | UUID generation | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-004 | Cross-Cutting | Business identifier generation | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Missing sequence generator | P1 | Implement before Phase 6 |
| REQ-005 | Cross-Cutting | Bulk import | 27_IMPORT_EXPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P2 | Defer to Phase 10 |
| REQ-006 | Cross-Cutting | Template engine | 27_IMPORT_EXPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P2 | Defer to Phase 10 |
| REQ-007 | Cross-Cutting | Duplicate detection | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P2 | Defer |
| REQ-008 | Cross-Cutting | Duplicate resolution | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P2 | Defer |
| REQ-009 | Cross-Cutting | Bulk operation engine | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P2 | Defer |
| REQ-010 | Cross-Cutting | Action Center | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P3 | Defer |
| REQ-011 | Cross-Cutting | Universal Search | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P3 | Defer |
| REQ-012 | Cross-Cutting | Onboarding | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P3 | Defer |
| REQ-013 | Cross-Cutting | History | 15_AUDIT_AND_COMPLIANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | DB history exists, missing UI | P2 | Implement History UI |
| REQ-014 | Cross-Cutting | Auditability | 15_AUDIT_AND_COMPLIANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing retention logic | P2 | Implement during Phase 6 |
| REQ-015 | Cross-Cutting | Notifications | 23_NOTIFICATION_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-016 | Cross-Cutting | Generated fields | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Missing Identifier engine | P1 | Implement before Phase 6 |
| REQ-017 | Cross-Cutting | Import preview | 27_IMPORT_EXPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P2 | Defer |
| REQ-018 | Cross-Cutting | Restartability | 27_IMPORT_EXPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P2 | Defer |
| REQ-019 | Cross-Cutting | Idempotency | 10_COMMUNICATION.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-020 | Cross-Cutting | Reconciliation | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Completely missing | P2 | Defer |
| REQ-021 | Cross-Cutting | Production ownership | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not reached yet | P1 | Defer to Phase 11 |
| REQ-022 | Cross-Cutting | Backup/restore | 34_BACKUP_DR.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Missing custom DR | P1 | Plan strategy |
| REQ-023 | Cross-Cutting | Monitoring/observability | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Missing custom metrics | P2 | Defer |
| REQ-024 | Cross-Cutting | Branch App Factory | 22_BRANCH_APP_FACTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Missing build automation | P2 | Defer to Phase 10 |
| REQ-025 | MASTER_INDEX | Product | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-026 | MASTER_INDEX | Architecture | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-027 | MASTER_INDEX | Security | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-028 | MASTER_INDEX | APIs / integrations | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-029 | MASTER_INDEX | UX / applications | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-030 | MASTER_INDEX | ERP modules | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-031 | MASTER_INDEX | Data operations | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-032 | MASTER_INDEX | Engineering quality | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-033 | MASTER_INDEX | DevOps / production | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-034 | MASTER_INDEX | Research | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-035 | MASTER_INDEX | Governance | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-036 | MASTER_INDEX | Execution order | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-037 | MASTER_INDEX | Templates | 01_MASTER_INDEX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-038 | PRODUCT_REQUIRE... | Vision | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-039 | PRODUCT_REQUIRE... | Goals | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-040 | PRODUCT_REQUIRE... | Non-goals for the foundation | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-041 | PRODUCT_REQUIRE... | Major product domains | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-042 | PRODUCT_REQUIRE... | Multi-branch requirements | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-043 | PRODUCT_REQUIRE... | Product surfaces | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-044 | PRODUCT_REQUIRE... | Non-functional requirements | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-045 | PRODUCT_REQUIRE... | Security | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-046 | PRODUCT_REQUIRE... | Reliability | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-047 | PRODUCT_REQUIRE... | Scalability | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-048 | PRODUCT_REQUIRE... | Maintainability | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-049 | PRODUCT_REQUIRE... | Product success criteria | 02_PRODUCT_REQUIREMENTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-050 | USER_ROLES_AND_... | Actor hierarchy | 03_USER_ROLES_AND_ACTORS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-051 | USER_ROLES_AND_... | Role principles | 03_USER_ROLES_AND_ACTORS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-052 | USER_ROLES_AND_... | Initial scope types | 03_USER_ROLES_AND_ACTORS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-053 | USER_ROLES_AND_... | Special cases to support | 03_USER_ROLES_AND_ACTORS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-054 | USER_ROLES_AND_... | Identity lifecycle | 03_USER_ROLES_AND_ACTORS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-055 | USER_ROLES_AND_... | Role assignment lifecycle | 03_USER_ROLES_AND_ACTORS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-056 | USER_JOURNEYS | Super Admin | 04_USER_JOURNEYS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-057 | USER_JOURNEYS | Branch Admin | 04_USER_JOURNEYS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-058 | USER_JOURNEYS | Teacher | 04_USER_JOURNEYS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-059 | USER_JOURNEYS | Parent | 04_USER_JOURNEYS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-060 | USER_JOURNEYS | Student | 04_USER_JOURNEYS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-061 | USER_JOURNEYS | Accountant | 04_USER_JOURNEYS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-062 | USER_JOURNEYS | Librarian | 04_USER_JOURNEYS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-063 | USER_JOURNEYS | Transport Manager | 04_USER_JOURNEYS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-064 | USER_JOURNEYS | Journey principles | 04_USER_JOURNEYS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-065 | BUSINESS_RULES | Tenancy | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-066 | BUSINESS_RULES | Student | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-067 | BUSINESS_RULES | Academic year | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-068 | BUSINESS_RULES | Scheduling | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-069 | BUSINESS_RULES | Attendance | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-070 | BUSINESS_RULES | Exams | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-071 | BUSINESS_RULES | Finance | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-072 | BUSINESS_RULES | Notifications | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-073 | BUSINESS_RULES | Branch lifecycle | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-074 | BUSINESS_RULES | User lifecycle | 05_BUSINESS_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-075 | SYSTEM_ARCHITEC... | Target | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-076 | SYSTEM_ARCHITEC... | Architecture style | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-077 | SYSTEM_ARCHITEC... | Canonical flows | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-078 | SYSTEM_ARCHITEC... | Authentication | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-079 | SYSTEM_ARCHITEC... | Data read | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-080 | SYSTEM_ARCHITEC... | Sensitive mutation | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-081 | SYSTEM_ARCHITEC... | Background job | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-082 | SYSTEM_ARCHITEC... | Centralization rule | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-083 | SYSTEM_ARCHITEC... | Configuration | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-084 | SYSTEM_ARCHITEC... | Failure isolation | 06_SYSTEM_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-085 | TECHNOLOGY_DECI... | Principle | 07_TECHNOLOGY_DECISIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-086 | TECHNOLOGY_DECI... | Required decisions before implementation | 07_TECHNOLOGY_DECISIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-087 | TECHNOLOGY_DECI... | Baseline | 07_TECHNOLOGY_DECISIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-088 | TECHNOLOGY_DECI... | Decision rule | 07_TECHNOLOGY_DECISIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-089 | TECHNOLOGY_DECI... | Avoid premature choices | 07_TECHNOLOGY_DECISIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-090 | ENVIRONMENT_STR... | Environments | 08_ENVIRONMENT_STRATEGY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-091 | ENVIRONMENT_STR... | Data separation | 08_ENVIRONMENT_STRATEGY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-092 | ENVIRONMENT_STR... | Environment-specific configuration | 08_ENVIRONMENT_STRATEGY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-093 | ENVIRONMENT_STR... | Promotion | 08_ENVIRONMENT_STRATEGY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-094 | ENVIRONMENT_STR... | Production protection | 08_ENVIRONMENT_STRATEGY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-095 | DATA_ARCHITECTU... | Data layers | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-096 | DATA_ARCHITECTU... | Transactional database | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-097 | DATA_ARCHITECTU... | Object storage | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-098 | DATA_ARCHITECTU... | Search/indexing | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-099 | DATA_ARCHITECTU... | Analytics | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-100 | DATA_ARCHITECTU... | Ownership | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-101 | DATA_ARCHITECTU... | History | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-102 | DATA_ARCHITECTU... | IDs | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-103 | DATA_ARCHITECTU... | Data retention | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-104 | DATA_ARCHITECTU... | Data migration | 09_DATA_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-105 | DATABASE_ERD | 10 DATABASE ERD | 10_DATABASE_ERD.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-106 | DATA_DICTIONARY... | 11 DATA DICTIONARY | 11_DATA_DICTIONARY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-107 | RBAC_PERMISSION... | Permission model | 12_RBAC_PERMISSION_MATRIX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-108 | RBAC_PERMISSION... | Action set | 12_RBAC_PERMISSION_MATRIX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-109 | RBAC_PERMISSION... | Scope set | 12_RBAC_PERMISSION_MATRIX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-110 | RBAC_PERMISSION... | Initial matrix | 12_RBAC_PERMISSION_MATRIX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-111 | RBAC_PERMISSION... | Rule | 12_RBAC_PERMISSION_MATRIX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-112 | RLS_SECURITY_MO... | 13 RLS SECURITY MODEL | 13_RLS_SECURITY_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-113 | THREAT_MODEL | Assets | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-114 | THREAT_MODEL | Primary threats | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-115 | THREAT_MODEL | T1 — Cross-branch data access | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-116 | THREAT_MODEL | T2 — Privilege escalation | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-117 | THREAT_MODEL | T3 — Token/session abuse | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-118 | THREAT_MODEL | T4 — Malicious client modification | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-119 | THREAT_MODEL | T5 — File leakage | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-120 | THREAT_MODEL | T6 — Financial manipulation | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-121 | THREAT_MODEL | T7 — Data loss | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-122 | THREAT_MODEL | T8 — Supply chain/package risk | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-123 | THREAT_MODEL | T9 — App signing compromise | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-124 | THREAT_MODEL | T10 — Prompt/AI implementation drift | 14_THREAT_MODEL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-125 | AUDIT_AND_COMPL... | Audit requirements | 15_AUDIT_AND_COMPLIANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-126 | AUDIT_AND_COMPL... | Audit record | 15_AUDIT_AND_COMPLIANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-127 | AUDIT_AND_COMPL... | Retention | 15_AUDIT_AND_COMPLIANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-128 | AUDIT_AND_COMPL... | Export | 15_AUDIT_AND_COMPLIANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-129 | AUDIT_AND_COMPL... | Compliance posture | 15_AUDIT_AND_COMPLIANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-130 | API_ARCHITECTUR... | API principles | 16_API_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-131 | API_ARCHITECTUR... | Resource naming | 16_API_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-132 | API_ARCHITECTUR... | Response pattern | 16_API_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-133 | API_ARCHITECTUR... | Pagination | 16_API_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-134 | API_ARCHITECTUR... | Authorization | 16_API_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-135 | API_ARCHITECTUR... | Transactions | 16_API_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-136 | API_ARCHITECTUR... | Idempotency | 16_API_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-137 | API_CONTRACT_TE... | Operation | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-138 | API_CONTRACT_TE... | Authentication | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-139 | API_CONTRACT_TE... | Authorization | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-140 | API_CONTRACT_TE... | Request | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-141 | API_CONTRACT_TE... | Validation | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-142 | API_CONTRACT_TE... | Response | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-143 | API_CONTRACT_TE... | Errors | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-144 | API_CONTRACT_TE... | RLS/server checks | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-145 | API_CONTRACT_TE... | Audit | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-146 | API_CONTRACT_TE... | Side effects | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-147 | API_CONTRACT_TE... | Performance | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-148 | API_CONTRACT_TE... | Tests | 17_API_CONTRACT_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-149 | INTEGRATIONS | Integration categories | 18_INTEGRATIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-150 | INTEGRATIONS | Integration rule | 18_INTEGRATIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-151 | INTEGRATIONS | Webhooks | 18_INTEGRATIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-152 | INTEGRATIONS | External data | 18_INTEGRATIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-153 | UX_UI_SYSTEM | UX goals | 19_UX_UI_SYSTEM.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-154 | UX_UI_SYSTEM | Global components | 19_UX_UI_SYSTEM.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-155 | UX_UI_SYSTEM | Design tokens | 19_UX_UI_SYSTEM.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-156 | UX_UI_SYSTEM | State requirements | 19_UX_UI_SYSTEM.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-157 | UX_UI_SYSTEM | Tables | 19_UX_UI_SYSTEM.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-158 | UX_UI_SYSTEM | Forms | 19_UX_UI_SYSTEM.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-159 | UX_UI_SYSTEM | Mobile | 19_UX_UI_SYSTEM.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-160 | UX_UI_SYSTEM | Accessibility | 19_UX_UI_SYSTEM.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-161 | SCREEN_INVENTOR... | Super Admin | 20_SCREEN_INVENTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-162 | SCREEN_INVENTOR... | Authentication | 20_SCREEN_INVENTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-163 | SCREEN_INVENTOR... | Organization | 20_SCREEN_INVENTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-164 | SCREEN_INVENTOR... | Branch Admin | 20_SCREEN_INVENTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-165 | SCREEN_INVENTOR... | Teacher | 20_SCREEN_INVENTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-166 | SCREEN_INVENTOR... | Parent | 20_SCREEN_INVENTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-167 | SCREEN_INVENTOR... | Student | 20_SCREEN_INVENTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-168 | SCREEN_INVENTOR... | Screen specification | 20_SCREEN_INVENTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-169 | APP_ARCHITECTUR... | Shared-code principle | 21_APP_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-170 | APP_ARCHITECTUR... | App identities | 21_APP_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-171 | APP_ARCHITECTUR... | Security warning | 21_APP_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-172 | APP_ARCHITECTUR... | App surfaces | 21_APP_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-173 | APP_ARCHITECTUR... | Shared packages | 21_APP_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-174 | APP_ARCHITECTUR... | Deep links | 21_APP_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-175 | APP_ARCHITECTUR... | Offline | 21_APP_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-176 | BRANCH_APP_FACT... | Objective | 22_BRANCH_APP_FACTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-177 | BRANCH_APP_FACT... | Branch app record | 22_BRANCH_APP_FACTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-178 | BRANCH_APP_FACT... | Provisioning flow | 22_BRANCH_APP_FACTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-179 | BRANCH_APP_FACT... | Branch build matrix | 22_BRANCH_APP_FACTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-180 | BRANCH_APP_FACT... | Secrets | 22_BRANCH_APP_FACTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-181 | BRANCH_APP_FACT... | Build modes | 22_BRANCH_APP_FACTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-182 | BRANCH_APP_FACT... | New branch checklist | 22_BRANCH_APP_FACTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-183 | NOTIFICATION_AR... | Channels | 23_NOTIFICATION_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-184 | NOTIFICATION_AR... | Event model | 23_NOTIFICATION_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-185 | NOTIFICATION_AR... | Eligibility | 23_NOTIFICATION_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-186 | NOTIFICATION_AR... | Templates | 23_NOTIFICATION_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-187 | NOTIFICATION_AR... | Delivery tracking | 23_NOTIFICATION_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-188 | NOTIFICATION_AR... | Retry | 23_NOTIFICATION_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-189 | NOTIFICATION_AR... | Preferences | 23_NOTIFICATION_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-190 | NOTIFICATION_AR... | Push | 23_NOTIFICATION_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-191 | FILE_STORAGE | Document categories | 24_FILE_STORAGE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-192 | FILE_STORAGE | Storage rule | 24_FILE_STORAGE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-193 | FILE_STORAGE | Suggested logical path | 24_FILE_STORAGE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-194 | FILE_STORAGE | Metadata | 24_FILE_STORAGE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-195 | FILE_STORAGE | Security | 24_FILE_STORAGE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-196 | FILE_STORAGE | Retention | 24_FILE_STORAGE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-197 | FILE_STORAGE | Migration | 24_FILE_STORAGE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-198 | MODULE_ARCHITEC... | Module contract | 25_MODULE_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-199 | MODULE_ARCHITEC... | Module dependency order | 25_MODULE_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-200 | MODULE_ARCHITEC... | Foundation | 25_MODULE_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-201 | MODULE_ARCHITEC... | Academic foundation | 25_MODULE_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-202 | MODULE_ARCHITEC... | Operations | 25_MODULE_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-203 | MODULE_ARCHITEC... | Supporting | 25_MODULE_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-204 | MODULE_ARCHITEC... | No hidden coupling | 25_MODULE_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-205 | MODULE_ARCHITEC... | Shared services | 25_MODULE_ARCHITECTURE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-206 | MODULE_SPECIFIC... | 1. Module | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-207 | MODULE_SPECIFIC... | 2. Actors | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-208 | MODULE_SPECIFIC... | 3. Scope | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-209 | MODULE_SPECIFIC... | 4. Entities | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-210 | MODULE_SPECIFIC... | 5. Business rules | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-211 | MODULE_SPECIFIC... | 6. Database | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-212 | MODULE_SPECIFIC... | 7. Security | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-213 | MODULE_SPECIFIC... | 8. APIs | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-214 | MODULE_SPECIFIC... | 9. Screens | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-215 | MODULE_SPECIFIC... | 10. Notifications | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-216 | MODULE_SPECIFIC... | 11. Files | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-217 | MODULE_SPECIFIC... | 12. Reports | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-218 | MODULE_SPECIFIC... | 13. Imports/exports | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-219 | MODULE_SPECIFIC... | 14. Tests | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-220 | MODULE_SPECIFIC... | 15. Definition of done | 26_MODULE_SPECIFICATION_TEMPLATE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-221 | IMPORT_EXPORT | Imports | 27_IMPORT_EXPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-222 | IMPORT_EXPORT | Import pipeline | 27_IMPORT_EXPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-223 | IMPORT_EXPORT | Rules | 27_IMPORT_EXPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-224 | IMPORT_EXPORT | Export | 27_IMPORT_EXPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-225 | IMPORT_EXPORT | Security | 27_IMPORT_EXPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-226 | REPORTING_ANALY... | Reporting layers | 28_REPORTING_ANALYTICS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-227 | REPORTING_ANALY... | Branch | 28_REPORTING_ANALYTICS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-228 | REPORTING_ANALY... | Organization | 28_REPORTING_ANALYTICS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-229 | REPORTING_ANALY... | Report design | 28_REPORTING_ANALYTICS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-230 | REPORTING_ANALY... | Authorization | 28_REPORTING_ANALYTICS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-231 | REPORTING_ANALY... | Performance | 28_REPORTING_ANALYTICS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-232 | TESTING_QA | Layers | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-233 | TESTING_QA | Mandatory cross-branch test matrix | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-234 | TESTING_QA | Branch A user | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-235 | TESTING_QA | Branch B user | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-236 | TESTING_QA | Super Admin | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-237 | TESTING_QA | Parent | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-238 | TESTING_QA | Student | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-239 | TESTING_QA | Teacher | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-240 | TESTING_QA | Regression | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-241 | TESTING_QA | Release gates | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-242 | TESTING_QA | Certification | 29_TESTING_QA.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-243 | PERFORMANCE_SCA... | Principles | 30_PERFORMANCE_SCALABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-244 | PERFORMANCE_SCA... | Likely hot paths | 30_PERFORMANCE_SCALABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-245 | PERFORMANCE_SCA... | Database | 30_PERFORMANCE_SCALABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-246 | PERFORMANCE_SCA... | Mobile | 30_PERFORMANCE_SCALABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-247 | PERFORMANCE_SCA... | Large operations | 30_PERFORMANCE_SCALABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-248 | PERFORMANCE_SCA... | Performance budgets | 30_PERFORMANCE_SCALABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-249 | ACCESSIBILITY | Baseline | 31_ACCESSIBILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-250 | ACCESSIBILITY | QA | 31_ACCESSIBILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-251 | GIT_CI_CD | Branch strategy | 32_GIT_CI_CD.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-252 | GIT_CI_CD | Pull request requirements | 32_GIT_CI_CD.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-253 | GIT_CI_CD | CI pipeline | 32_GIT_CI_CD.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-254 | GIT_CI_CD | Secrets | 32_GIT_CI_CD.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-255 | GIT_CI_CD | Branch app builds | 32_GIT_CI_CD.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-256 | GIT_CI_CD | Release | 32_GIT_CI_CD.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-257 | DEPLOYMENT | Environments | 33_DEPLOYMENT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-258 | DEPLOYMENT | Deployment sequence | 33_DEPLOYMENT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-259 | DEPLOYMENT | Rollback | 33_DEPLOYMENT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-260 | DEPLOYMENT | Production ownership | 33_DEPLOYMENT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-261 | BACKUP_DR | Objectives | 34_BACKUP_DR.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-262 | BACKUP_DR | Backup layers | 34_BACKUP_DR.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-263 | BACKUP_DR | Restore validation | 34_BACKUP_DR.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-264 | BACKUP_DR | Incident sequence | 34_BACKUP_DR.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-265 | BACKUP_DR | Disaster scenarios | 34_BACKUP_DR.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-266 | MONITORING_OBSE... | Monitor | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-267 | MONITORING_OBSE... | Application | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-268 | MONITORING_OBSE... | Database | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-269 | MONITORING_OBSE... | Auth | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-270 | MONITORING_OBSE... | Notifications | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-271 | MONITORING_OBSE... | Finance | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-272 | MONITORING_OBSE... | Correlation | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-273 | MONITORING_OBSE... | Alerts | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-274 | MONITORING_OBSE... | Logs | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-275 | MONITORING_OBSE... | Dashboard | 35_MONITORING_OBSERVABILITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-276 | APP_RELEASE_OPE... | Per-branch release record | 36_APP_RELEASE_OPERATIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-277 | APP_RELEASE_OPE... | Pre-release | 36_APP_RELEASE_OPERATIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-278 | APP_RELEASE_OPE... | Store operations | 36_APP_RELEASE_OPERATIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-279 | APP_RELEASE_OPE... | Emergency response | 36_APP_RELEASE_OPERATIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-280 | REVERSE_ENGINEE... | Authorized scope | 37_REVERSE_ENGINEERING_RESEARCH.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-281 | REVERSE_ENGINEE... | Android research | 37_REVERSE_ENGINEERING_RESEARCH.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-282 | REVERSE_ENGINEE... | Research outputs | 37_REVERSE_ENGINEERING_RESEARCH.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-283 | REVERSE_ENGINEE... | Rule | 37_REVERSE_ENGINEERING_RESEARCH.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-284 | COMPETITOR_RESE... | Suggested reference set | 38_COMPETITOR_RESEARCH_MATRIX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-285 | COMPETITOR_RESE... | Matrix | 38_COMPETITOR_RESEARCH_MATRIX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-286 | COMPETITOR_RESE... | Research rule | 38_COMPETITOR_RESEARCH_MATRIX.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-287 | PROJECT_ROADMAP... | Phase 0 — Discovery (COMPLETED) | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-288 | PROJECT_ROADMAP... | Phase 1 — Architecture (COMPLETED) | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-289 | PROJECT_ROADMAP... | Phase 2 — Tenancy/security foundation (COMPLETED) | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-290 | PROJECT_ROADMAP... | Phase 3 — Academic foundation (COMPLETED) | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-291 | PROJECT_ROADMAP... | Phase 4 — Scheduling (COMPLETED) | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-292 | PROJECT_ROADMAP... | Phase 5 — Operations | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-293 | PROJECT_ROADMAP... | Cross-cutting Platform Capabilities — Planned / Must Not Be Forgotten | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-294 | PROJECT_ROADMAP... | Smart Import & Template Engine | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-295 | PROJECT_ROADMAP... | Missing-Field & System-Field Generation | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-296 | PROJECT_ROADMAP... | Configurable Identifier Templates | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-297 | PROJECT_ROADMAP... | Temporary First-Login Credentials | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-298 | PROJECT_ROADMAP... | School Work-Efficiency Layer | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-299 | PROJECT_ROADMAP... | Action Center / Exception Engine | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-300 | PROJECT_ROADMAP... | Universal Search & Contextual Navigation | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-301 | PROJECT_ROADMAP... | Duplicate Detection & Record Resolution | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-302 | PROJECT_ROADMAP... | Onboarding Checklists | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-303 | PROJECT_ROADMAP... | Bulk Operation Engine | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-304 | PROJECT_ROADMAP... | Compliance & Reporting Automation | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-305 | PROJECT_ROADMAP... | Contextual Communication & Notification Intelligence | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-306 | PROJECT_ROADMAP... | School-Day Automation | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-307 | PROJECT_ROADMAP... | Safe AI Assistance | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-308 | PROJECT_ROADMAP... | Multilingual / Localization Automation | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-309 | PROJECT_ROADMAP... | Privacy & Data Center | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-310 | PROJECT_ROADMAP... | Branch App Factory & Per-Branch Applications | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-311 | PROJECT_ROADMAP... | Feature-Scope Rule | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-312 | PROJECT_ROADMAP... | Phase 6 — Assessments | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-313 | PROJECT_ROADMAP... | Phase 7 — Finance | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-314 | PROJECT_ROADMAP... | Phase 8 — Supporting modules | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-315 | PROJECT_ROADMAP... | Phase 9 — Analytics | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-316 | PROJECT_ROADMAP... | Phase 10 — Apps | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-317 | PROJECT_ROADMAP... | Phase 11 — Production certification | 39_PROJECT_ROADMAP.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-318 | CHANGE_CONTROL | Why | 40_CHANGE_CONTROL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-319 | CHANGE_CONTROL | Change levels | 40_CHANGE_CONTROL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-320 | CHANGE_CONTROL | Level 1 — Local implementation | 40_CHANGE_CONTROL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-321 | CHANGE_CONTROL | Level 2 — Module design | 40_CHANGE_CONTROL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-322 | CHANGE_CONTROL | Level 3 — Cross-module | 40_CHANGE_CONTROL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-323 | CHANGE_CONTROL | Level 4 — Foundation | 40_CHANGE_CONTROL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-324 | CHANGE_CONTROL | Change process | 40_CHANGE_CONTROL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-325 | CHANGE_CONTROL | Forbidden | 40_CHANGE_CONTROL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-326 | ANTIGRAVITY_OPE... | Mission | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-327 | ANTIGRAVITY_OPE... | First command | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-328 | ANTIGRAVITY_OPE... | Repository inspection | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-329 | ANTIGRAVITY_OPE... | Architecture discipline | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-330 | ANTIGRAVITY_OPE... | Implementation cycle | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-331 | ANTIGRAVITY_OPE... | Before each module | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-332 | ANTIGRAVITY_OPE... | After each module | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-333 | ANTIGRAVITY_OPE... | Security | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-334 | ANTIGRAVITY_OPE... | AI-specific rule | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-335 | ANTIGRAVITY_OPE... | Completion claims | 41_ANTIGRAVITY_OPERATING_RULES.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-336 | DEFINITION_OF_D... | Feature DoD | 42_DEFINITION_OF_DONE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-337 | DEFINITION_OF_D... | Product | 42_DEFINITION_OF_DONE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-338 | DEFINITION_OF_D... | Database | 42_DEFINITION_OF_DONE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-339 | DEFINITION_OF_D... | Backend | 42_DEFINITION_OF_DONE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-340 | DEFINITION_OF_D... | Frontend | 42_DEFINITION_OF_DONE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-341 | DEFINITION_OF_D... | Testing | 42_DEFINITION_OF_DONE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-342 | DEFINITION_OF_D... | Operations | 42_DEFINITION_OF_DONE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-343 | DEFINITION_OF_D... | Documentation | 42_DEFINITION_OF_DONE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-344 | DEFINITION_OF_D... | Release DoD | 42_DEFINITION_OF_DONE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-345 | RISK_REGISTER | 43 RISK REGISTER | 43_RISK_REGISTER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-346 | DECISION_LOG | ADR Template | 44_DECISION_LOG.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-347 | DECISION_LOG | ADR-XXXX — Title | 44_DECISION_LOG.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-348 | DECISION_LOG | Initial decisions | 44_DECISION_LOG.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-349 | DECISION_LOG | ADR-0001 — Centralized production data | 44_DECISION_LOG.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-350 | DECISION_LOG | ADR-0002 — Separate branded branch apps | 44_DECISION_LOG.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-351 | DECISION_LOG | ADR-0003 — Database-first branch isolation | 44_DECISION_LOG.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-352 | DECISION_LOG | ADR-0004 — Organization and branch are separate entities | 44_DECISION_LOG.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-353 | DECISION_LOG | ADR-0005 — Modular monolith first | 44_DECISION_LOG.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-354 | CLIENT_HANDOVER... | Ownership target | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-355 | CLIENT_HANDOVER... | Handover list | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-356 | CLIENT_HANDOVER... | Source | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-357 | CLIENT_HANDOVER... | Backend | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-358 | CLIENT_HANDOVER... | Domain | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-359 | CLIENT_HANDOVER... | Communications | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-360 | CLIENT_HANDOVER... | Payments | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-361 | CLIENT_HANDOVER... | Mobile | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-362 | CLIENT_HANDOVER... | Operations | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-363 | CLIENT_HANDOVER... | Handover rules | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-364 | CLIENT_HANDOVER... | Final handover evidence | 45_CLIENT_HANDOVER.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-365 | GLOSSARY | 46 GLOSSARY | 46_GLOSSARY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-366 | FOUNDATION_IDEN... | Critical acceptance | 01_FOUNDATION_IDENTITY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-367 | STUDENTS_GUARDI... | Rules | 02_STUDENTS_GUARDIANS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-368 | STUDENTS_GUARDI... | Critical acceptance | 02_STUDENTS_GUARDIANS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-369 | ACADEMICS | Critical acceptance | 03_ACADEMICS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-370 | SCHEDULING | Critical acceptance | 04_SCHEDULING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-371 | ATTENDANCE | 1. Module | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-372 | ATTENDANCE | 2. Actors | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-373 | ATTENDANCE | 3. Scope | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-374 | ATTENDANCE | 4. Entities | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-375 | ATTENDANCE | 5. Business rules | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-376 | ATTENDANCE | 6. Database | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-377 | ATTENDANCE | Tables & Fields | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-378 | ATTENDANCE | Constraints | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-379 | ATTENDANCE | Indexes | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-380 | ATTENDANCE | Migration / Archive | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-381 | ATTENDANCE | 7. Security | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-382 | ATTENDANCE | 8. APIs | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-383 | ATTENDANCE | Lifecycle / State Machine | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-384 | ATTENDANCE | Concurrency and Transactions | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-385 | ATTENDANCE | Operations | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-386 | ATTENDANCE | 9. Screens | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-387 | ATTENDANCE | 10. Notifications | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-388 | ATTENDANCE | 11. Files | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-389 | ATTENDANCE | 12. Reports | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-390 | ATTENDANCE | 13. Imports/exports | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-391 | ATTENDANCE | 14. Tests | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-392 | ATTENDANCE | 15. Definition of done | 05_ATTENDANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-393 | HOMEWORK_LEARNI... | 1. Domain Model | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-394 | HOMEWORK_LEARNI... | Core Entities | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-395 | HOMEWORK_LEARNI... | Dependency Relationships | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-396 | HOMEWORK_LEARNI... | 2. Database Schema | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-397 | HOMEWORK_LEARNI... | `homework_assignments` | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-398 | HOMEWORK_LEARNI... | `homework_attachments` | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-399 | HOMEWORK_LEARNI... | `homework_submissions` | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-400 | HOMEWORK_LEARNI... | `submission_attachments` | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-401 | HOMEWORK_LEARNI... | `homework_audit_logs` | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-402 | HOMEWORK_LEARNI... | 3. Assignment Lifecycle | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-403 | HOMEWORK_LEARNI... | 4. Submission Lifecycle | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-404 | HOMEWORK_LEARNI... | 5. Authorization/RLS | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-405 | HOMEWORK_LEARNI... | 6. Teacher Authorization | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-406 | HOMEWORK_LEARNI... | 7. Storage Security Design | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-407 | HOMEWORK_LEARNI... | 8. API/RPC Contract | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-408 | HOMEWORK_LEARNI... | 9. Notifications (EventBus) | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-409 | HOMEWORK_LEARNI... | 10. Concurrency (Deterministic OCC) | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-410 | HOMEWORK_LEARNI... | 11. Performance | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-411 | HOMEWORK_LEARNI... | 12. Test Matrix | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-412 | HOMEWORK_LEARNI... | Consistency Audit | 06_HOMEWORK_LEARNING.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD | P1 | Implement E2E test |
| REQ-413 | ADMISSIONS | Critical acceptance | 07_ADMISSIONS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-414 | EXAMS_RESULTS | Critical acceptance | 08_EXAMS_RESULTS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-415 | FEES_FINANCE | Critical acceptance | 09_FEES_FINANCE.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-416 | COMMUNICATION | Critical acceptance | 10_COMMUNICATION.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | IMPLEMENTED | None | N/A | None |
| REQ-417 | TRANSPORT | Critical acceptance | 11_TRANSPORT.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-418 | LIBRARY | Critical acceptance | 12_LIBRARY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-419 | INVENTORY | Critical acceptance | 13_INVENTORY.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-420 | HR_PAYROLL | Critical acceptance | 14_HR_PAYROLL.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |
| REQ-421 | REPORTING_ANALY... | Critical acceptance | 15_REPORTING_ANALYTICS.md | Y | Y | Y | N/A | Y | Y | Y | N/A | Y | PLANNED | Not started | P2 | Defer |