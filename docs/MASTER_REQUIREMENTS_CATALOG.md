# Master Requirements Catalog

| ID | DOMAIN | REQUIREMENT | MASTER SOURCE | SOURCE SECTION | TYPE | STATUS | EVIDENCE |
|---|---|---|---|---|---|---|---|
| REQ-001 | Cross-Cutting | Temporary credentials | 02_PRODUCT_REQUIREMENTS.md | Temporary credentials | security | PARTIALLY IMPLEMENTED | Missing middleware enforcement |
| REQ-002 | Cross-Cutting | Identifier engine | 06_SYSTEM_ARCHITECTURE.md | Identifier engine | data | PLANNED | Missing central generator |
| REQ-003 | Cross-Cutting | UUID generation | 06_SYSTEM_ARCHITECTURE.md | UUID generation | data | IMPLEMENTED | Codebase inspection |
| REQ-004 | Cross-Cutting | Business identifier generation | 39_PROJECT_ROADMAP.md | Business identifier generation | data | PLANNED | Missing sequence generator |
| REQ-005 | Cross-Cutting | Bulk import | 27_IMPORT_EXPORT.md | Bulk import | data | PLANNED | Completely missing |
| REQ-006 | Cross-Cutting | Template engine | 27_IMPORT_EXPORT.md | Template engine | functional | PLANNED | Completely missing |
| REQ-007 | Cross-Cutting | Duplicate detection | 05_BUSINESS_RULES.md | Duplicate detection | functional | PLANNED | Completely missing |
| REQ-008 | Cross-Cutting | Duplicate resolution | 05_BUSINESS_RULES.md | Duplicate resolution | functional | PLANNED | Completely missing |
| REQ-009 | Cross-Cutting | Bulk operation engine | 39_PROJECT_ROADMAP.md | Bulk operation engine | functional | PLANNED | Completely missing |
| REQ-010 | Cross-Cutting | Action Center | 39_PROJECT_ROADMAP.md | Action Center | UX | PLANNED | Completely missing |
| REQ-011 | Cross-Cutting | Universal Search | 39_PROJECT_ROADMAP.md | Universal Search | functional | PLANNED | Completely missing |
| REQ-012 | Cross-Cutting | Onboarding | 39_PROJECT_ROADMAP.md | Onboarding | functional | PLANNED | Completely missing |
| REQ-013 | Cross-Cutting | History | 15_AUDIT_AND_COMPLIANCE.md | History | functional | PARTIALLY IMPLEMENTED | DB history exists, missing UI |
| REQ-014 | Cross-Cutting | Auditability | 15_AUDIT_AND_COMPLIANCE.md | Auditability | governance | PARTIALLY IMPLEMENTED | Missing retention logic |
| REQ-015 | Cross-Cutting | Notifications | 23_NOTIFICATION_ARCHITECTURE.md | Notifications | functional | IMPLEMENTED | Codebase inspection |
| REQ-016 | Cross-Cutting | Generated fields | 02_PRODUCT_REQUIREMENTS.md | Generated fields | data | PLANNED | Missing Identifier engine |
| REQ-017 | Cross-Cutting | Import preview | 27_IMPORT_EXPORT.md | Import preview | data | PLANNED | Completely missing |
| REQ-018 | Cross-Cutting | Restartability | 27_IMPORT_EXPORT.md | Restartability | functional | PLANNED | Completely missing |
| REQ-019 | Cross-Cutting | Idempotency | 10_COMMUNICATION.md | Idempotency | functional | IMPLEMENTED | Codebase inspection |
| REQ-020 | Cross-Cutting | Reconciliation | 39_PROJECT_ROADMAP.md | Reconciliation | functional | PLANNED | Completely missing |
| REQ-021 | Cross-Cutting | Production ownership | 45_CLIENT_HANDOVER.md | Production ownership | UX | PLANNED | Not reached yet |
| REQ-022 | Cross-Cutting | Backup/restore | 34_BACKUP_DR.md | Backup/restore | infrastructure | PLANNED | Missing custom DR |
| REQ-023 | Cross-Cutting | Monitoring/observability | 35_MONITORING_OBSERVABILITY.md | Monitoring/observability | operational | PLANNED | Missing custom metrics |
| REQ-024 | Cross-Cutting | Branch App Factory | 22_BRANCH_APP_FACTORY.md | Branch App Factory | functional | PLANNED | Missing build automation |
| REQ-025 | MASTER_INDEX | Product | 01_MASTER_INDEX.md | Product | functional | PLANNED | Not started |
| REQ-026 | MASTER_INDEX | Architecture | 01_MASTER_INDEX.md | Architecture | functional | PLANNED | Not started |
| REQ-027 | MASTER_INDEX | Security | 01_MASTER_INDEX.md | Security | security | IMPLEMENTED | Codebase inspection |
| REQ-028 | MASTER_INDEX | APIs / integrations | 01_MASTER_INDEX.md | APIs / integrations | functional | PLANNED | Not started |
| REQ-029 | MASTER_INDEX | UX / applications | 01_MASTER_INDEX.md | UX / applications | UX | PLANNED | Not started |
| REQ-030 | MASTER_INDEX | ERP modules | 01_MASTER_INDEX.md | ERP modules | functional | PLANNED | Not started |
| REQ-031 | MASTER_INDEX | Data operations | 01_MASTER_INDEX.md | Data operations | functional | PLANNED | Not started |
| REQ-032 | MASTER_INDEX | Engineering quality | 01_MASTER_INDEX.md | Engineering quality | functional | PLANNED | Not started |
| REQ-033 | MASTER_INDEX | DevOps / production | 01_MASTER_INDEX.md | DevOps / production | operational | PLANNED | Not started |
| REQ-034 | MASTER_INDEX | Research | 01_MASTER_INDEX.md | Research | functional | PLANNED | Not started |
| REQ-035 | MASTER_INDEX | Governance | 01_MASTER_INDEX.md | Governance | governance | PLANNED | Not started |
| REQ-036 | MASTER_INDEX | Execution order | 01_MASTER_INDEX.md | Execution order | functional | PLANNED | Not started |
| REQ-037 | MASTER_INDEX | Templates | 01_MASTER_INDEX.md | Templates | functional | PLANNED | Not started |
| REQ-038 | PRODUCT_REQUIRE... | Vision | 02_PRODUCT_REQUIREMENTS.md | Vision | functional | PLANNED | Not started |
| REQ-039 | PRODUCT_REQUIRE... | Goals | 02_PRODUCT_REQUIREMENTS.md | Goals | functional | PLANNED | Not started |
| REQ-040 | PRODUCT_REQUIRE... | Non-goals for the foundation | 02_PRODUCT_REQUIREMENTS.md | Non-goals for the foundation | functional | PLANNED | Not started |
| REQ-041 | PRODUCT_REQUIRE... | Major product domains | 02_PRODUCT_REQUIREMENTS.md | Major product domains | functional | PLANNED | Not started |
| REQ-042 | PRODUCT_REQUIRE... | Multi-branch requirements | 02_PRODUCT_REQUIREMENTS.md | Multi-branch requirements | UX | PLANNED | Not started |
| REQ-043 | PRODUCT_REQUIRE... | Product surfaces | 02_PRODUCT_REQUIREMENTS.md | Product surfaces | functional | PLANNED | Not started |
| REQ-044 | PRODUCT_REQUIRE... | Non-functional requirements | 02_PRODUCT_REQUIREMENTS.md | Non-functional requirements | UX | PLANNED | Not started |
| REQ-045 | PRODUCT_REQUIRE... | Security | 02_PRODUCT_REQUIREMENTS.md | Security | security | IMPLEMENTED | Codebase inspection |
| REQ-046 | PRODUCT_REQUIRE... | Reliability | 02_PRODUCT_REQUIREMENTS.md | Reliability | functional | PLANNED | Not started |
| REQ-047 | PRODUCT_REQUIRE... | Scalability | 02_PRODUCT_REQUIREMENTS.md | Scalability | functional | PLANNED | Not started |
| REQ-048 | PRODUCT_REQUIRE... | Maintainability | 02_PRODUCT_REQUIREMENTS.md | Maintainability | functional | PLANNED | Not started |
| REQ-049 | PRODUCT_REQUIRE... | Product success criteria | 02_PRODUCT_REQUIREMENTS.md | Product success criteria | functional | PLANNED | Not started |
| REQ-050 | USER_ROLES_AND_... | Actor hierarchy | 03_USER_ROLES_AND_ACTORS.md | Actor hierarchy | functional | IMPLEMENTED | Codebase inspection |
| REQ-051 | USER_ROLES_AND_... | Role principles | 03_USER_ROLES_AND_ACTORS.md | Role principles | security | IMPLEMENTED | Codebase inspection |
| REQ-052 | USER_ROLES_AND_... | Initial scope types | 03_USER_ROLES_AND_ACTORS.md | Initial scope types | functional | IMPLEMENTED | Codebase inspection |
| REQ-053 | USER_ROLES_AND_... | Special cases to support | 03_USER_ROLES_AND_ACTORS.md | Special cases to support | functional | IMPLEMENTED | Codebase inspection |
| REQ-054 | USER_ROLES_AND_... | Identity lifecycle | 03_USER_ROLES_AND_ACTORS.md | Identity lifecycle | functional | IMPLEMENTED | Codebase inspection |
| REQ-055 | USER_ROLES_AND_... | Role assignment lifecycle | 03_USER_ROLES_AND_ACTORS.md | Role assignment lifecycle | security | IMPLEMENTED | Codebase inspection |
| REQ-056 | USER_JOURNEYS | Super Admin | 04_USER_JOURNEYS.md | Super Admin | functional | PLANNED | Not started |
| REQ-057 | USER_JOURNEYS | Branch Admin | 04_USER_JOURNEYS.md | Branch Admin | functional | PLANNED | Not started |
| REQ-058 | USER_JOURNEYS | Teacher | 04_USER_JOURNEYS.md | Teacher | functional | IMPLEMENTED | Codebase inspection |
| REQ-059 | USER_JOURNEYS | Parent | 04_USER_JOURNEYS.md | Parent | functional | PLANNED | Not started |
| REQ-060 | USER_JOURNEYS | Student | 04_USER_JOURNEYS.md | Student | functional | IMPLEMENTED | Codebase inspection |
| REQ-061 | USER_JOURNEYS | Accountant | 04_USER_JOURNEYS.md | Accountant | functional | PLANNED | Not started |
| REQ-062 | USER_JOURNEYS | Librarian | 04_USER_JOURNEYS.md | Librarian | functional | PLANNED | Not started |
| REQ-063 | USER_JOURNEYS | Transport Manager | 04_USER_JOURNEYS.md | Transport Manager | functional | PLANNED | Not started |
| REQ-064 | USER_JOURNEYS | Journey principles | 04_USER_JOURNEYS.md | Journey principles | functional | PLANNED | Not started |
| REQ-065 | BUSINESS_RULES | Tenancy | 05_BUSINESS_RULES.md | Tenancy | functional | PLANNED | Not started |
| REQ-066 | BUSINESS_RULES | Student | 05_BUSINESS_RULES.md | Student | functional | IMPLEMENTED | Codebase inspection |
| REQ-067 | BUSINESS_RULES | Academic year | 05_BUSINESS_RULES.md | Academic year | functional | PLANNED | Not started |
| REQ-068 | BUSINESS_RULES | Scheduling | 05_BUSINESS_RULES.md | Scheduling | functional | IMPLEMENTED | Codebase inspection |
| REQ-069 | BUSINESS_RULES | Attendance | 05_BUSINESS_RULES.md | Attendance | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-070 | BUSINESS_RULES | Exams | 05_BUSINESS_RULES.md | Exams | functional | PLANNED | Not started |
| REQ-071 | BUSINESS_RULES | Finance | 05_BUSINESS_RULES.md | Finance | functional | PLANNED | Not started |
| REQ-072 | BUSINESS_RULES | Notifications | 05_BUSINESS_RULES.md | Notifications | functional | PLANNED | Not started |
| REQ-073 | BUSINESS_RULES | Branch lifecycle | 05_BUSINESS_RULES.md | Branch lifecycle | functional | PLANNED | Not started |
| REQ-074 | BUSINESS_RULES | User lifecycle | 05_BUSINESS_RULES.md | User lifecycle | functional | PLANNED | Not started |
| REQ-075 | SYSTEM_ARCHITEC... | Target | 06_SYSTEM_ARCHITECTURE.md | Target | functional | PLANNED | Not started |
| REQ-076 | SYSTEM_ARCHITEC... | Architecture style | 06_SYSTEM_ARCHITECTURE.md | Architecture style | functional | PLANNED | Not started |
| REQ-077 | SYSTEM_ARCHITEC... | Canonical flows | 06_SYSTEM_ARCHITECTURE.md | Canonical flows | functional | PLANNED | Not started |
| REQ-078 | SYSTEM_ARCHITEC... | Authentication | 06_SYSTEM_ARCHITECTURE.md | Authentication | security | IMPLEMENTED | Codebase inspection |
| REQ-079 | SYSTEM_ARCHITEC... | Data read | 06_SYSTEM_ARCHITECTURE.md | Data read | functional | PLANNED | Not started |
| REQ-080 | SYSTEM_ARCHITEC... | Sensitive mutation | 06_SYSTEM_ARCHITECTURE.md | Sensitive mutation | functional | PLANNED | Not started |
| REQ-081 | SYSTEM_ARCHITEC... | Background job | 06_SYSTEM_ARCHITECTURE.md | Background job | functional | PLANNED | Not started |
| REQ-082 | SYSTEM_ARCHITEC... | Centralization rule | 06_SYSTEM_ARCHITECTURE.md | Centralization rule | functional | PLANNED | Not started |
| REQ-083 | SYSTEM_ARCHITEC... | Configuration | 06_SYSTEM_ARCHITECTURE.md | Configuration | functional | PLANNED | Not started |
| REQ-084 | SYSTEM_ARCHITEC... | Failure isolation | 06_SYSTEM_ARCHITECTURE.md | Failure isolation | functional | PLANNED | Not started |
| REQ-085 | TECHNOLOGY_DECI... | Principle | 07_TECHNOLOGY_DECISIONS.md | Principle | functional | PLANNED | Not started |
| REQ-086 | TECHNOLOGY_DECI... | Required decisions before implementation | 07_TECHNOLOGY_DECISIONS.md | Required decisions before implementation | UX | PLANNED | Not started |
| REQ-087 | TECHNOLOGY_DECI... | Baseline | 07_TECHNOLOGY_DECISIONS.md | Baseline | functional | PLANNED | Not started |
| REQ-088 | TECHNOLOGY_DECI... | Decision rule | 07_TECHNOLOGY_DECISIONS.md | Decision rule | functional | PLANNED | Not started |
| REQ-089 | TECHNOLOGY_DECI... | Avoid premature choices | 07_TECHNOLOGY_DECISIONS.md | Avoid premature choices | functional | PLANNED | Not started |
| REQ-090 | ENVIRONMENT_STR... | Environments | 08_ENVIRONMENT_STRATEGY.md | Environments | functional | PLANNED | Not started |
| REQ-091 | ENVIRONMENT_STR... | Data separation | 08_ENVIRONMENT_STRATEGY.md | Data separation | functional | PLANNED | Not started |
| REQ-092 | ENVIRONMENT_STR... | Environment-specific configuration | 08_ENVIRONMENT_STRATEGY.md | Environment-specific configuration | functional | PLANNED | Not started |
| REQ-093 | ENVIRONMENT_STR... | Promotion | 08_ENVIRONMENT_STRATEGY.md | Promotion | functional | PLANNED | Not started |
| REQ-094 | ENVIRONMENT_STR... | Production protection | 08_ENVIRONMENT_STRATEGY.md | Production protection | functional | PLANNED | Not started |
| REQ-095 | DATA_ARCHITECTU... | Data layers | 09_DATA_ARCHITECTURE.md | Data layers | functional | PLANNED | Not started |
| REQ-096 | DATA_ARCHITECTU... | Transactional database | 09_DATA_ARCHITECTURE.md | Transactional database | data | PLANNED | Not started |
| REQ-097 | DATA_ARCHITECTU... | Object storage | 09_DATA_ARCHITECTURE.md | Object storage | functional | IMPLEMENTED | Codebase inspection |
| REQ-098 | DATA_ARCHITECTU... | Search/indexing | 09_DATA_ARCHITECTURE.md | Search/indexing | data | PLANNED | Not started |
| REQ-099 | DATA_ARCHITECTU... | Analytics | 09_DATA_ARCHITECTURE.md | Analytics | functional | PLANNED | Not started |
| REQ-100 | DATA_ARCHITECTU... | Ownership | 09_DATA_ARCHITECTURE.md | Ownership | functional | PLANNED | Not started |
| REQ-101 | DATA_ARCHITECTU... | History | 09_DATA_ARCHITECTURE.md | History | functional | PLANNED | Not started |
| REQ-102 | DATA_ARCHITECTU... | IDs | 09_DATA_ARCHITECTURE.md | IDs | functional | PLANNED | Not started |
| REQ-103 | DATA_ARCHITECTU... | Data retention | 09_DATA_ARCHITECTURE.md | Data retention | functional | PLANNED | Not started |
| REQ-104 | DATA_ARCHITECTU... | Data migration | 09_DATA_ARCHITECTURE.md | Data migration | data | PLANNED | Not started |
| REQ-105 | DATABASE_ERD | 10 DATABASE ERD | 10_DATABASE_ERD.md | 10 DATABASE ERD | data | PLANNED | Not started |
| REQ-106 | DATA_DICTIONARY... | 11 DATA DICTIONARY | 11_DATA_DICTIONARY.md | 11 DATA DICTIONARY | functional | PLANNED | Not started |
| REQ-107 | RBAC_PERMISSION... | Permission model | 12_RBAC_PERMISSION_MATRIX.md | Permission model | functional | PLANNED | Not started |
| REQ-108 | RBAC_PERMISSION... | Action set | 12_RBAC_PERMISSION_MATRIX.md | Action set | functional | PLANNED | Not started |
| REQ-109 | RBAC_PERMISSION... | Scope set | 12_RBAC_PERMISSION_MATRIX.md | Scope set | functional | PLANNED | Not started |
| REQ-110 | RBAC_PERMISSION... | Initial matrix | 12_RBAC_PERMISSION_MATRIX.md | Initial matrix | testing | PLANNED | Not started |
| REQ-111 | RBAC_PERMISSION... | Rule | 12_RBAC_PERMISSION_MATRIX.md | Rule | functional | PLANNED | Not started |
| REQ-112 | RLS_SECURITY_MO... | 13 RLS SECURITY MODEL | 13_RLS_SECURITY_MODEL.md | 13 RLS SECURITY MODEL | security | IMPLEMENTED | Codebase inspection |
| REQ-113 | THREAT_MODEL | Assets | 14_THREAT_MODEL.md | Assets | functional | PLANNED | Not started |
| REQ-114 | THREAT_MODEL | Primary threats | 14_THREAT_MODEL.md | Primary threats | functional | PLANNED | Not started |
| REQ-115 | THREAT_MODEL | T1 — Cross-branch data access | 14_THREAT_MODEL.md | T1 — Cross-branch data access | security | PLANNED | Not started |
| REQ-116 | THREAT_MODEL | T2 — Privilege escalation | 14_THREAT_MODEL.md | T2 — Privilege escalation | functional | PLANNED | Not started |
| REQ-117 | THREAT_MODEL | T3 — Token/session abuse | 14_THREAT_MODEL.md | T3 — Token/session abuse | functional | PLANNED | Not started |
| REQ-118 | THREAT_MODEL | T4 — Malicious client modification | 14_THREAT_MODEL.md | T4 — Malicious client modification | functional | PLANNED | Not started |
| REQ-119 | THREAT_MODEL | T5 — File leakage | 14_THREAT_MODEL.md | T5 — File leakage | functional | PLANNED | Not started |
| REQ-120 | THREAT_MODEL | T6 — Financial manipulation | 14_THREAT_MODEL.md | T6 — Financial manipulation | functional | PLANNED | Not started |
| REQ-121 | THREAT_MODEL | T7 — Data loss | 14_THREAT_MODEL.md | T7 — Data loss | functional | PLANNED | Not started |
| REQ-122 | THREAT_MODEL | T8 — Supply chain/package risk | 14_THREAT_MODEL.md | T8 — Supply chain/package risk | functional | PLANNED | Not started |
| REQ-123 | THREAT_MODEL | T9 — App signing compromise | 14_THREAT_MODEL.md | T9 — App signing compromise | functional | PLANNED | Not started |
| REQ-124 | THREAT_MODEL | T10 — Prompt/AI implementation drift | 14_THREAT_MODEL.md | T10 — Prompt/AI implementation drift | infrastructure | PLANNED | Not started |
| REQ-125 | AUDIT_AND_COMPL... | Audit requirements | 15_AUDIT_AND_COMPLIANCE.md | Audit requirements | UX | PLANNED | Not started |
| REQ-126 | AUDIT_AND_COMPL... | Audit record | 15_AUDIT_AND_COMPLIANCE.md | Audit record | governance | PLANNED | Not started |
| REQ-127 | AUDIT_AND_COMPL... | Retention | 15_AUDIT_AND_COMPLIANCE.md | Retention | functional | PLANNED | Not started |
| REQ-128 | AUDIT_AND_COMPL... | Export | 15_AUDIT_AND_COMPLIANCE.md | Export | data | PLANNED | Not started |
| REQ-129 | AUDIT_AND_COMPL... | Compliance posture | 15_AUDIT_AND_COMPLIANCE.md | Compliance posture | governance | PLANNED | Not started |
| REQ-130 | API_ARCHITECTUR... | API principles | 16_API_ARCHITECTURE.md | API principles | functional | PLANNED | Not started |
| REQ-131 | API_ARCHITECTUR... | Resource naming | 16_API_ARCHITECTURE.md | Resource naming | functional | PLANNED | Not started |
| REQ-132 | API_ARCHITECTUR... | Response pattern | 16_API_ARCHITECTURE.md | Response pattern | functional | PLANNED | Not started |
| REQ-133 | API_ARCHITECTUR... | Pagination | 16_API_ARCHITECTURE.md | Pagination | functional | PLANNED | Not started |
| REQ-134 | API_ARCHITECTUR... | Authorization | 16_API_ARCHITECTURE.md | Authorization | security | IMPLEMENTED | Codebase inspection |
| REQ-135 | API_ARCHITECTUR... | Transactions | 16_API_ARCHITECTURE.md | Transactions | functional | PLANNED | Not started |
| REQ-136 | API_ARCHITECTUR... | Idempotency | 16_API_ARCHITECTURE.md | Idempotency | functional | PLANNED | Not started |
| REQ-137 | API_CONTRACT_TE... | Operation | 17_API_CONTRACT_TEMPLATE.md | Operation | functional | PLANNED | Not started |
| REQ-138 | API_CONTRACT_TE... | Authentication | 17_API_CONTRACT_TEMPLATE.md | Authentication | security | IMPLEMENTED | Codebase inspection |
| REQ-139 | API_CONTRACT_TE... | Authorization | 17_API_CONTRACT_TEMPLATE.md | Authorization | security | IMPLEMENTED | Codebase inspection |
| REQ-140 | API_CONTRACT_TE... | Request | 17_API_CONTRACT_TEMPLATE.md | Request | functional | PLANNED | Not started |
| REQ-141 | API_CONTRACT_TE... | Validation | 17_API_CONTRACT_TEMPLATE.md | Validation | functional | PLANNED | Not started |
| REQ-142 | API_CONTRACT_TE... | Response | 17_API_CONTRACT_TEMPLATE.md | Response | functional | PLANNED | Not started |
| REQ-143 | API_CONTRACT_TE... | Errors | 17_API_CONTRACT_TEMPLATE.md | Errors | functional | PLANNED | Not started |
| REQ-144 | API_CONTRACT_TE... | RLS/server checks | 17_API_CONTRACT_TEMPLATE.md | RLS/server checks | security | IMPLEMENTED | Codebase inspection |
| REQ-145 | API_CONTRACT_TE... | Audit | 17_API_CONTRACT_TEMPLATE.md | Audit | governance | PLANNED | Not started |
| REQ-146 | API_CONTRACT_TE... | Side effects | 17_API_CONTRACT_TEMPLATE.md | Side effects | functional | PLANNED | Not started |
| REQ-147 | API_CONTRACT_TE... | Performance | 17_API_CONTRACT_TEMPLATE.md | Performance | functional | PLANNED | Not started |
| REQ-148 | API_CONTRACT_TE... | Tests | 17_API_CONTRACT_TEMPLATE.md | Tests | testing | PLANNED | Not started |
| REQ-149 | INTEGRATIONS | Integration categories | 18_INTEGRATIONS.md | Integration categories | functional | PLANNED | Not started |
| REQ-150 | INTEGRATIONS | Integration rule | 18_INTEGRATIONS.md | Integration rule | functional | PLANNED | Not started |
| REQ-151 | INTEGRATIONS | Webhooks | 18_INTEGRATIONS.md | Webhooks | functional | PLANNED | Not started |
| REQ-152 | INTEGRATIONS | External data | 18_INTEGRATIONS.md | External data | functional | PLANNED | Not started |
| REQ-153 | UX_UI_SYSTEM | UX goals | 19_UX_UI_SYSTEM.md | UX goals | UX | PLANNED | Not started |
| REQ-154 | UX_UI_SYSTEM | Global components | 19_UX_UI_SYSTEM.md | Global components | functional | PLANNED | Not started |
| REQ-155 | UX_UI_SYSTEM | Design tokens | 19_UX_UI_SYSTEM.md | Design tokens | functional | PLANNED | Not started |
| REQ-156 | UX_UI_SYSTEM | State requirements | 19_UX_UI_SYSTEM.md | State requirements | UX | PLANNED | Not started |
| REQ-157 | UX_UI_SYSTEM | Tables | 19_UX_UI_SYSTEM.md | Tables | data | PLANNED | Not started |
| REQ-158 | UX_UI_SYSTEM | Forms | 19_UX_UI_SYSTEM.md | Forms | functional | PLANNED | Not started |
| REQ-159 | UX_UI_SYSTEM | Mobile | 19_UX_UI_SYSTEM.md | Mobile | functional | PLANNED | Not started |
| REQ-160 | UX_UI_SYSTEM | Accessibility | 19_UX_UI_SYSTEM.md | Accessibility | security | PLANNED | Not started |
| REQ-161 | SCREEN_INVENTOR... | Super Admin | 20_SCREEN_INVENTORY.md | Super Admin | functional | PLANNED | Not started |
| REQ-162 | SCREEN_INVENTOR... | Authentication | 20_SCREEN_INVENTORY.md | Authentication | security | IMPLEMENTED | Codebase inspection |
| REQ-163 | SCREEN_INVENTOR... | Organization | 20_SCREEN_INVENTORY.md | Organization | functional | PLANNED | Not started |
| REQ-164 | SCREEN_INVENTOR... | Branch Admin | 20_SCREEN_INVENTORY.md | Branch Admin | functional | PLANNED | Not started |
| REQ-165 | SCREEN_INVENTOR... | Teacher | 20_SCREEN_INVENTORY.md | Teacher | functional | IMPLEMENTED | Codebase inspection |
| REQ-166 | SCREEN_INVENTOR... | Parent | 20_SCREEN_INVENTORY.md | Parent | functional | PLANNED | Not started |
| REQ-167 | SCREEN_INVENTOR... | Student | 20_SCREEN_INVENTORY.md | Student | functional | IMPLEMENTED | Codebase inspection |
| REQ-168 | SCREEN_INVENTOR... | Screen specification | 20_SCREEN_INVENTORY.md | Screen specification | UX | PLANNED | Not started |
| REQ-169 | APP_ARCHITECTUR... | Shared-code principle | 21_APP_ARCHITECTURE.md | Shared-code principle | functional | PLANNED | Not started |
| REQ-170 | APP_ARCHITECTUR... | App identities | 21_APP_ARCHITECTURE.md | App identities | functional | PLANNED | Not started |
| REQ-171 | APP_ARCHITECTUR... | Security warning | 21_APP_ARCHITECTURE.md | Security warning | security | IMPLEMENTED | Codebase inspection |
| REQ-172 | APP_ARCHITECTUR... | App surfaces | 21_APP_ARCHITECTURE.md | App surfaces | functional | PLANNED | Not started |
| REQ-173 | APP_ARCHITECTUR... | Shared packages | 21_APP_ARCHITECTURE.md | Shared packages | functional | PLANNED | Not started |
| REQ-174 | APP_ARCHITECTUR... | Deep links | 21_APP_ARCHITECTURE.md | Deep links | functional | PLANNED | Not started |
| REQ-175 | APP_ARCHITECTUR... | Offline | 21_APP_ARCHITECTURE.md | Offline | functional | PLANNED | Not started |
| REQ-176 | BRANCH_APP_FACT... | Objective | 22_BRANCH_APP_FACTORY.md | Objective | functional | PLANNED | Not started |
| REQ-177 | BRANCH_APP_FACT... | Branch app record | 22_BRANCH_APP_FACTORY.md | Branch app record | functional | PLANNED | Not started |
| REQ-178 | BRANCH_APP_FACT... | Provisioning flow | 22_BRANCH_APP_FACTORY.md | Provisioning flow | functional | PLANNED | Not started |
| REQ-179 | BRANCH_APP_FACT... | Branch build matrix | 22_BRANCH_APP_FACTORY.md | Branch build matrix | UX | PLANNED | Not started |
| REQ-180 | BRANCH_APP_FACT... | Secrets | 22_BRANCH_APP_FACTORY.md | Secrets | functional | PLANNED | Not started |
| REQ-181 | BRANCH_APP_FACT... | Build modes | 22_BRANCH_APP_FACTORY.md | Build modes | UX | PLANNED | Not started |
| REQ-182 | BRANCH_APP_FACT... | New branch checklist | 22_BRANCH_APP_FACTORY.md | New branch checklist | functional | PLANNED | Not started |
| REQ-183 | NOTIFICATION_AR... | Channels | 23_NOTIFICATION_ARCHITECTURE.md | Channels | functional | PLANNED | Not started |
| REQ-184 | NOTIFICATION_AR... | Event model | 23_NOTIFICATION_ARCHITECTURE.md | Event model | functional | PLANNED | Not started |
| REQ-185 | NOTIFICATION_AR... | Eligibility | 23_NOTIFICATION_ARCHITECTURE.md | Eligibility | functional | PLANNED | Not started |
| REQ-186 | NOTIFICATION_AR... | Templates | 23_NOTIFICATION_ARCHITECTURE.md | Templates | functional | PLANNED | Not started |
| REQ-187 | NOTIFICATION_AR... | Delivery tracking | 23_NOTIFICATION_ARCHITECTURE.md | Delivery tracking | functional | PLANNED | Not started |
| REQ-188 | NOTIFICATION_AR... | Retry | 23_NOTIFICATION_ARCHITECTURE.md | Retry | functional | PLANNED | Not started |
| REQ-189 | NOTIFICATION_AR... | Preferences | 23_NOTIFICATION_ARCHITECTURE.md | Preferences | functional | PLANNED | Not started |
| REQ-190 | NOTIFICATION_AR... | Push | 23_NOTIFICATION_ARCHITECTURE.md | Push | functional | PLANNED | Not started |
| REQ-191 | FILE_STORAGE | Document categories | 24_FILE_STORAGE.md | Document categories | functional | IMPLEMENTED | Codebase inspection |
| REQ-192 | FILE_STORAGE | Storage rule | 24_FILE_STORAGE.md | Storage rule | functional | IMPLEMENTED | Codebase inspection |
| REQ-193 | FILE_STORAGE | Suggested logical path | 24_FILE_STORAGE.md | Suggested logical path | functional | IMPLEMENTED | Codebase inspection |
| REQ-194 | FILE_STORAGE | Metadata | 24_FILE_STORAGE.md | Metadata | functional | IMPLEMENTED | Codebase inspection |
| REQ-195 | FILE_STORAGE | Security | 24_FILE_STORAGE.md | Security | security | IMPLEMENTED | Codebase inspection |
| REQ-196 | FILE_STORAGE | Retention | 24_FILE_STORAGE.md | Retention | functional | IMPLEMENTED | Codebase inspection |
| REQ-197 | FILE_STORAGE | Migration | 24_FILE_STORAGE.md | Migration | data | IMPLEMENTED | Codebase inspection |
| REQ-198 | MODULE_ARCHITEC... | Module contract | 25_MODULE_ARCHITECTURE.md | Module contract | functional | PLANNED | Not started |
| REQ-199 | MODULE_ARCHITEC... | Module dependency order | 25_MODULE_ARCHITECTURE.md | Module dependency order | functional | PLANNED | Not started |
| REQ-200 | MODULE_ARCHITEC... | Foundation | 25_MODULE_ARCHITECTURE.md | Foundation | functional | PLANNED | Not started |
| REQ-201 | MODULE_ARCHITEC... | Academic foundation | 25_MODULE_ARCHITECTURE.md | Academic foundation | functional | PLANNED | Not started |
| REQ-202 | MODULE_ARCHITEC... | Operations | 25_MODULE_ARCHITECTURE.md | Operations | functional | PLANNED | Not started |
| REQ-203 | MODULE_ARCHITEC... | Supporting | 25_MODULE_ARCHITECTURE.md | Supporting | functional | PLANNED | Not started |
| REQ-204 | MODULE_ARCHITEC... | No hidden coupling | 25_MODULE_ARCHITECTURE.md | No hidden coupling | functional | PLANNED | Not started |
| REQ-205 | MODULE_ARCHITEC... | Shared services | 25_MODULE_ARCHITECTURE.md | Shared services | functional | PLANNED | Not started |
| REQ-206 | MODULE_SPECIFIC... | 1. Module | 26_MODULE_SPECIFICATION_TEMPLATE.md | 1. Module | functional | PLANNED | Not started |
| REQ-207 | MODULE_SPECIFIC... | 2. Actors | 26_MODULE_SPECIFICATION_TEMPLATE.md | 2. Actors | functional | PLANNED | Not started |
| REQ-208 | MODULE_SPECIFIC... | 3. Scope | 26_MODULE_SPECIFICATION_TEMPLATE.md | 3. Scope | functional | PLANNED | Not started |
| REQ-209 | MODULE_SPECIFIC... | 4. Entities | 26_MODULE_SPECIFICATION_TEMPLATE.md | 4. Entities | functional | PLANNED | Not started |
| REQ-210 | MODULE_SPECIFIC... | 5. Business rules | 26_MODULE_SPECIFICATION_TEMPLATE.md | 5. Business rules | functional | PLANNED | Not started |
| REQ-211 | MODULE_SPECIFIC... | 6. Database | 26_MODULE_SPECIFICATION_TEMPLATE.md | 6. Database | data | PLANNED | Not started |
| REQ-212 | MODULE_SPECIFIC... | 7. Security | 26_MODULE_SPECIFICATION_TEMPLATE.md | 7. Security | security | IMPLEMENTED | Codebase inspection |
| REQ-213 | MODULE_SPECIFIC... | 8. APIs | 26_MODULE_SPECIFICATION_TEMPLATE.md | 8. APIs | functional | PLANNED | Not started |
| REQ-214 | MODULE_SPECIFIC... | 9. Screens | 26_MODULE_SPECIFICATION_TEMPLATE.md | 9. Screens | UX | PLANNED | Not started |
| REQ-215 | MODULE_SPECIFIC... | 10. Notifications | 26_MODULE_SPECIFICATION_TEMPLATE.md | 10. Notifications | functional | PLANNED | Not started |
| REQ-216 | MODULE_SPECIFIC... | 11. Files | 26_MODULE_SPECIFICATION_TEMPLATE.md | 11. Files | functional | PLANNED | Not started |
| REQ-217 | MODULE_SPECIFIC... | 12. Reports | 26_MODULE_SPECIFICATION_TEMPLATE.md | 12. Reports | functional | PLANNED | Not started |
| REQ-218 | MODULE_SPECIFIC... | 13. Imports/exports | 26_MODULE_SPECIFICATION_TEMPLATE.md | 13. Imports/exports | data | PLANNED | Not started |
| REQ-219 | MODULE_SPECIFIC... | 14. Tests | 26_MODULE_SPECIFICATION_TEMPLATE.md | 14. Tests | testing | PLANNED | Not started |
| REQ-220 | MODULE_SPECIFIC... | 15. Definition of done | 26_MODULE_SPECIFICATION_TEMPLATE.md | 15. Definition of done | governance | PLANNED | Not started |
| REQ-221 | IMPORT_EXPORT | Imports | 27_IMPORT_EXPORT.md | Imports | data | PLANNED | Not started |
| REQ-222 | IMPORT_EXPORT | Import pipeline | 27_IMPORT_EXPORT.md | Import pipeline | data | PLANNED | Not started |
| REQ-223 | IMPORT_EXPORT | Rules | 27_IMPORT_EXPORT.md | Rules | functional | PLANNED | Not started |
| REQ-224 | IMPORT_EXPORT | Export | 27_IMPORT_EXPORT.md | Export | data | PLANNED | Not started |
| REQ-225 | IMPORT_EXPORT | Security | 27_IMPORT_EXPORT.md | Security | security | IMPLEMENTED | Codebase inspection |
| REQ-226 | REPORTING_ANALY... | Reporting layers | 28_REPORTING_ANALYTICS.md | Reporting layers | functional | PLANNED | Not started |
| REQ-227 | REPORTING_ANALY... | Branch | 28_REPORTING_ANALYTICS.md | Branch | functional | PLANNED | Not started |
| REQ-228 | REPORTING_ANALY... | Organization | 28_REPORTING_ANALYTICS.md | Organization | functional | PLANNED | Not started |
| REQ-229 | REPORTING_ANALY... | Report design | 28_REPORTING_ANALYTICS.md | Report design | functional | PLANNED | Not started |
| REQ-230 | REPORTING_ANALY... | Authorization | 28_REPORTING_ANALYTICS.md | Authorization | security | IMPLEMENTED | Codebase inspection |
| REQ-231 | REPORTING_ANALY... | Performance | 28_REPORTING_ANALYTICS.md | Performance | functional | PLANNED | Not started |
| REQ-232 | TESTING_QA | Layers | 29_TESTING_QA.md | Layers | functional | PLANNED | Not started |
| REQ-233 | TESTING_QA | Mandatory cross-branch test matrix | 29_TESTING_QA.md | Mandatory cross-branch test matrix | testing | PLANNED | Not started |
| REQ-234 | TESTING_QA | Branch A user | 29_TESTING_QA.md | Branch A user | functional | PLANNED | Not started |
| REQ-235 | TESTING_QA | Branch B user | 29_TESTING_QA.md | Branch B user | functional | PLANNED | Not started |
| REQ-236 | TESTING_QA | Super Admin | 29_TESTING_QA.md | Super Admin | functional | PLANNED | Not started |
| REQ-237 | TESTING_QA | Parent | 29_TESTING_QA.md | Parent | functional | PLANNED | Not started |
| REQ-238 | TESTING_QA | Student | 29_TESTING_QA.md | Student | functional | IMPLEMENTED | Codebase inspection |
| REQ-239 | TESTING_QA | Teacher | 29_TESTING_QA.md | Teacher | functional | IMPLEMENTED | Codebase inspection |
| REQ-240 | TESTING_QA | Regression | 29_TESTING_QA.md | Regression | functional | PLANNED | Not started |
| REQ-241 | TESTING_QA | Release gates | 29_TESTING_QA.md | Release gates | functional | PLANNED | Not started |
| REQ-242 | TESTING_QA | Certification | 29_TESTING_QA.md | Certification | functional | PLANNED | Not started |
| REQ-243 | PERFORMANCE_SCA... | Principles | 30_PERFORMANCE_SCALABILITY.md | Principles | functional | PLANNED | Not started |
| REQ-244 | PERFORMANCE_SCA... | Likely hot paths | 30_PERFORMANCE_SCALABILITY.md | Likely hot paths | functional | PLANNED | Not started |
| REQ-245 | PERFORMANCE_SCA... | Database | 30_PERFORMANCE_SCALABILITY.md | Database | data | PLANNED | Not started |
| REQ-246 | PERFORMANCE_SCA... | Mobile | 30_PERFORMANCE_SCALABILITY.md | Mobile | functional | PLANNED | Not started |
| REQ-247 | PERFORMANCE_SCA... | Large operations | 30_PERFORMANCE_SCALABILITY.md | Large operations | functional | PLANNED | Not started |
| REQ-248 | PERFORMANCE_SCA... | Performance budgets | 30_PERFORMANCE_SCALABILITY.md | Performance budgets | functional | PLANNED | Not started |
| REQ-249 | ACCESSIBILITY | Baseline | 31_ACCESSIBILITY.md | Baseline | functional | PLANNED | Not started |
| REQ-250 | ACCESSIBILITY | QA | 31_ACCESSIBILITY.md | QA | functional | PLANNED | Not started |
| REQ-251 | GIT_CI_CD | Branch strategy | 32_GIT_CI_CD.md | Branch strategy | functional | PLANNED | Not started |
| REQ-252 | GIT_CI_CD | Pull request requirements | 32_GIT_CI_CD.md | Pull request requirements | UX | PLANNED | Not started |
| REQ-253 | GIT_CI_CD | CI pipeline | 32_GIT_CI_CD.md | CI pipeline | functional | PLANNED | Not started |
| REQ-254 | GIT_CI_CD | Secrets | 32_GIT_CI_CD.md | Secrets | functional | PLANNED | Not started |
| REQ-255 | GIT_CI_CD | Branch app builds | 32_GIT_CI_CD.md | Branch app builds | UX | PLANNED | Not started |
| REQ-256 | GIT_CI_CD | Release | 32_GIT_CI_CD.md | Release | functional | PLANNED | Not started |
| REQ-257 | DEPLOYMENT | Environments | 33_DEPLOYMENT.md | Environments | functional | PLANNED | Not started |
| REQ-258 | DEPLOYMENT | Deployment sequence | 33_DEPLOYMENT.md | Deployment sequence | infrastructure | PLANNED | Not started |
| REQ-259 | DEPLOYMENT | Rollback | 33_DEPLOYMENT.md | Rollback | functional | PLANNED | Not started |
| REQ-260 | DEPLOYMENT | Production ownership | 33_DEPLOYMENT.md | Production ownership | functional | PLANNED | Not started |
| REQ-261 | BACKUP_DR | Objectives | 34_BACKUP_DR.md | Objectives | functional | PLANNED | Not started |
| REQ-262 | BACKUP_DR | Backup layers | 34_BACKUP_DR.md | Backup layers | infrastructure | PLANNED | Not started |
| REQ-263 | BACKUP_DR | Restore validation | 34_BACKUP_DR.md | Restore validation | functional | PLANNED | Not started |
| REQ-264 | BACKUP_DR | Incident sequence | 34_BACKUP_DR.md | Incident sequence | functional | PLANNED | Not started |
| REQ-265 | BACKUP_DR | Disaster scenarios | 34_BACKUP_DR.md | Disaster scenarios | infrastructure | PLANNED | Not started |
| REQ-266 | MONITORING_OBSE... | Monitor | 35_MONITORING_OBSERVABILITY.md | Monitor | operational | PLANNED | Not started |
| REQ-267 | MONITORING_OBSE... | Application | 35_MONITORING_OBSERVABILITY.md | Application | functional | PLANNED | Not started |
| REQ-268 | MONITORING_OBSE... | Database | 35_MONITORING_OBSERVABILITY.md | Database | data | PLANNED | Not started |
| REQ-269 | MONITORING_OBSE... | Auth | 35_MONITORING_OBSERVABILITY.md | Auth | security | IMPLEMENTED | Codebase inspection |
| REQ-270 | MONITORING_OBSE... | Notifications | 35_MONITORING_OBSERVABILITY.md | Notifications | functional | PLANNED | Not started |
| REQ-271 | MONITORING_OBSE... | Finance | 35_MONITORING_OBSERVABILITY.md | Finance | functional | PLANNED | Not started |
| REQ-272 | MONITORING_OBSE... | Correlation | 35_MONITORING_OBSERVABILITY.md | Correlation | functional | PLANNED | Not started |
| REQ-273 | MONITORING_OBSE... | Alerts | 35_MONITORING_OBSERVABILITY.md | Alerts | functional | PLANNED | Not started |
| REQ-274 | MONITORING_OBSE... | Logs | 35_MONITORING_OBSERVABILITY.md | Logs | functional | PLANNED | Not started |
| REQ-275 | MONITORING_OBSE... | Dashboard | 35_MONITORING_OBSERVABILITY.md | Dashboard | functional | PLANNED | Not started |
| REQ-276 | APP_RELEASE_OPE... | Per-branch release record | 36_APP_RELEASE_OPERATIONS.md | Per-branch release record | functional | PLANNED | Not started |
| REQ-277 | APP_RELEASE_OPE... | Pre-release | 36_APP_RELEASE_OPERATIONS.md | Pre-release | functional | PLANNED | Not started |
| REQ-278 | APP_RELEASE_OPE... | Store operations | 36_APP_RELEASE_OPERATIONS.md | Store operations | functional | PLANNED | Not started |
| REQ-279 | APP_RELEASE_OPE... | Emergency response | 36_APP_RELEASE_OPERATIONS.md | Emergency response | functional | PLANNED | Not started |
| REQ-280 | REVERSE_ENGINEE... | Authorized scope | 37_REVERSE_ENGINEERING_RESEARCH.md | Authorized scope | security | IMPLEMENTED | Codebase inspection |
| REQ-281 | REVERSE_ENGINEE... | Android research | 37_REVERSE_ENGINEERING_RESEARCH.md | Android research | infrastructure | PLANNED | Not started |
| REQ-282 | REVERSE_ENGINEE... | Research outputs | 37_REVERSE_ENGINEERING_RESEARCH.md | Research outputs | functional | PLANNED | Not started |
| REQ-283 | REVERSE_ENGINEE... | Rule | 37_REVERSE_ENGINEERING_RESEARCH.md | Rule | functional | PLANNED | Not started |
| REQ-284 | COMPETITOR_RESE... | Suggested reference set | 38_COMPETITOR_RESEARCH_MATRIX.md | Suggested reference set | functional | PLANNED | Not started |
| REQ-285 | COMPETITOR_RESE... | Matrix | 38_COMPETITOR_RESEARCH_MATRIX.md | Matrix | testing | PLANNED | Not started |
| REQ-286 | COMPETITOR_RESE... | Research rule | 38_COMPETITOR_RESEARCH_MATRIX.md | Research rule | functional | PLANNED | Not started |
| REQ-287 | PROJECT_ROADMAP... | Phase 0 — Discovery (COMPLETED) | 39_PROJECT_ROADMAP.md | Phase 0 — Discovery (COMPLETED) | functional | PLANNED | Not started |
| REQ-288 | PROJECT_ROADMAP... | Phase 1 — Architecture (COMPLETED) | 39_PROJECT_ROADMAP.md | Phase 1 — Architecture (COMPLETED) | functional | PLANNED | Not started |
| REQ-289 | PROJECT_ROADMAP... | Phase 2 — Tenancy/security foundation (COMPLETED) | 39_PROJECT_ROADMAP.md | Phase 2 — Tenancy/security foundation (COMPLETED) | security | IMPLEMENTED | Codebase inspection |
| REQ-290 | PROJECT_ROADMAP... | Phase 3 — Academic foundation (COMPLETED) | 39_PROJECT_ROADMAP.md | Phase 3 — Academic foundation (COMPLETED) | functional | PLANNED | Not started |
| REQ-291 | PROJECT_ROADMAP... | Phase 4 — Scheduling (COMPLETED) | 39_PROJECT_ROADMAP.md | Phase 4 — Scheduling (COMPLETED) | functional | IMPLEMENTED | Codebase inspection |
| REQ-292 | PROJECT_ROADMAP... | Phase 5 — Operations | 39_PROJECT_ROADMAP.md | Phase 5 — Operations | functional | PLANNED | Not started |
| REQ-293 | PROJECT_ROADMAP... | Cross-cutting Platform Capabilities — Planned / Must Not Be Forgotten | 39_PROJECT_ROADMAP.md | Cross-cutting Platform Capabilities — Planned / Must Not Be Forgotten | functional | PLANNED | Not started |
| REQ-294 | PROJECT_ROADMAP... | Smart Import & Template Engine | 39_PROJECT_ROADMAP.md | Smart Import & Template Engine | data | PLANNED | Not started |
| REQ-295 | PROJECT_ROADMAP... | Missing-Field & System-Field Generation | 39_PROJECT_ROADMAP.md | Missing-Field & System-Field Generation | functional | PLANNED | Not started |
| REQ-296 | PROJECT_ROADMAP... | Configurable Identifier Templates | 39_PROJECT_ROADMAP.md | Configurable Identifier Templates | data | PLANNED | Not started |
| REQ-297 | PROJECT_ROADMAP... | Temporary First-Login Credentials | 39_PROJECT_ROADMAP.md | Temporary First-Login Credentials | security | PLANNED | Not started |
| REQ-298 | PROJECT_ROADMAP... | School Work-Efficiency Layer | 39_PROJECT_ROADMAP.md | School Work-Efficiency Layer | functional | PLANNED | Not started |
| REQ-299 | PROJECT_ROADMAP... | Action Center / Exception Engine | 39_PROJECT_ROADMAP.md | Action Center / Exception Engine | UX | PLANNED | Not started |
| REQ-300 | PROJECT_ROADMAP... | Universal Search & Contextual Navigation | 39_PROJECT_ROADMAP.md | Universal Search & Contextual Navigation | functional | PLANNED | Not started |
| REQ-301 | PROJECT_ROADMAP... | Duplicate Detection & Record Resolution | 39_PROJECT_ROADMAP.md | Duplicate Detection & Record Resolution | functional | PLANNED | Not started |
| REQ-302 | PROJECT_ROADMAP... | Onboarding Checklists | 39_PROJECT_ROADMAP.md | Onboarding Checklists | functional | PLANNED | Not started |
| REQ-303 | PROJECT_ROADMAP... | Bulk Operation Engine | 39_PROJECT_ROADMAP.md | Bulk Operation Engine | functional | PLANNED | Not started |
| REQ-304 | PROJECT_ROADMAP... | Compliance & Reporting Automation | 39_PROJECT_ROADMAP.md | Compliance & Reporting Automation | governance | PLANNED | Not started |
| REQ-305 | PROJECT_ROADMAP... | Contextual Communication & Notification Intelligence | 39_PROJECT_ROADMAP.md | Contextual Communication & Notification Intelligence | functional | IMPLEMENTED | Codebase inspection |
| REQ-306 | PROJECT_ROADMAP... | School-Day Automation | 39_PROJECT_ROADMAP.md | School-Day Automation | functional | PLANNED | Not started |
| REQ-307 | PROJECT_ROADMAP... | Safe AI Assistance | 39_PROJECT_ROADMAP.md | Safe AI Assistance | functional | PLANNED | Not started |
| REQ-308 | PROJECT_ROADMAP... | Multilingual / Localization Automation | 39_PROJECT_ROADMAP.md | Multilingual / Localization Automation | functional | PLANNED | Not started |
| REQ-309 | PROJECT_ROADMAP... | Privacy & Data Center | 39_PROJECT_ROADMAP.md | Privacy & Data Center | functional | PLANNED | Not started |
| REQ-310 | PROJECT_ROADMAP... | Branch App Factory & Per-Branch Applications | 39_PROJECT_ROADMAP.md | Branch App Factory & Per-Branch Applications | functional | PLANNED | Not started |
| REQ-311 | PROJECT_ROADMAP... | Feature-Scope Rule | 39_PROJECT_ROADMAP.md | Feature-Scope Rule | functional | PLANNED | Not started |
| REQ-312 | PROJECT_ROADMAP... | Phase 6 — Assessments | 39_PROJECT_ROADMAP.md | Phase 6 — Assessments | functional | PLANNED | Not started |
| REQ-313 | PROJECT_ROADMAP... | Phase 7 — Finance | 39_PROJECT_ROADMAP.md | Phase 7 — Finance | functional | PLANNED | Not started |
| REQ-314 | PROJECT_ROADMAP... | Phase 8 — Supporting modules | 39_PROJECT_ROADMAP.md | Phase 8 — Supporting modules | functional | PLANNED | Not started |
| REQ-315 | PROJECT_ROADMAP... | Phase 9 — Analytics | 39_PROJECT_ROADMAP.md | Phase 9 — Analytics | functional | PLANNED | Not started |
| REQ-316 | PROJECT_ROADMAP... | Phase 10 — Apps | 39_PROJECT_ROADMAP.md | Phase 10 — Apps | functional | PLANNED | Not started |
| REQ-317 | PROJECT_ROADMAP... | Phase 11 — Production certification | 39_PROJECT_ROADMAP.md | Phase 11 — Production certification | functional | PLANNED | Not started |
| REQ-318 | CHANGE_CONTROL | Why | 40_CHANGE_CONTROL.md | Why | functional | PLANNED | Not started |
| REQ-319 | CHANGE_CONTROL | Change levels | 40_CHANGE_CONTROL.md | Change levels | functional | PLANNED | Not started |
| REQ-320 | CHANGE_CONTROL | Level 1 — Local implementation | 40_CHANGE_CONTROL.md | Level 1 — Local implementation | functional | PLANNED | Not started |
| REQ-321 | CHANGE_CONTROL | Level 2 — Module design | 40_CHANGE_CONTROL.md | Level 2 — Module design | functional | PLANNED | Not started |
| REQ-322 | CHANGE_CONTROL | Level 3 — Cross-module | 40_CHANGE_CONTROL.md | Level 3 — Cross-module | functional | PLANNED | Not started |
| REQ-323 | CHANGE_CONTROL | Level 4 — Foundation | 40_CHANGE_CONTROL.md | Level 4 — Foundation | functional | PLANNED | Not started |
| REQ-324 | CHANGE_CONTROL | Change process | 40_CHANGE_CONTROL.md | Change process | functional | PLANNED | Not started |
| REQ-325 | CHANGE_CONTROL | Forbidden | 40_CHANGE_CONTROL.md | Forbidden | functional | PLANNED | Not started |
| REQ-326 | ANTIGRAVITY_OPE... | Mission | 41_ANTIGRAVITY_OPERATING_RULES.md | Mission | functional | PLANNED | Not started |
| REQ-327 | ANTIGRAVITY_OPE... | First command | 41_ANTIGRAVITY_OPERATING_RULES.md | First command | functional | PLANNED | Not started |
| REQ-328 | ANTIGRAVITY_OPE... | Repository inspection | 41_ANTIGRAVITY_OPERATING_RULES.md | Repository inspection | functional | PLANNED | Not started |
| REQ-329 | ANTIGRAVITY_OPE... | Architecture discipline | 41_ANTIGRAVITY_OPERATING_RULES.md | Architecture discipline | functional | PLANNED | Not started |
| REQ-330 | ANTIGRAVITY_OPE... | Implementation cycle | 41_ANTIGRAVITY_OPERATING_RULES.md | Implementation cycle | functional | PLANNED | Not started |
| REQ-331 | ANTIGRAVITY_OPE... | Before each module | 41_ANTIGRAVITY_OPERATING_RULES.md | Before each module | functional | PLANNED | Not started |
| REQ-332 | ANTIGRAVITY_OPE... | After each module | 41_ANTIGRAVITY_OPERATING_RULES.md | After each module | functional | PLANNED | Not started |
| REQ-333 | ANTIGRAVITY_OPE... | Security | 41_ANTIGRAVITY_OPERATING_RULES.md | Security | security | IMPLEMENTED | Codebase inspection |
| REQ-334 | ANTIGRAVITY_OPE... | AI-specific rule | 41_ANTIGRAVITY_OPERATING_RULES.md | AI-specific rule | functional | PLANNED | Not started |
| REQ-335 | ANTIGRAVITY_OPE... | Completion claims | 41_ANTIGRAVITY_OPERATING_RULES.md | Completion claims | functional | PLANNED | Not started |
| REQ-336 | DEFINITION_OF_D... | Feature DoD | 42_DEFINITION_OF_DONE.md | Feature DoD | functional | PLANNED | Not started |
| REQ-337 | DEFINITION_OF_D... | Product | 42_DEFINITION_OF_DONE.md | Product | functional | PLANNED | Not started |
| REQ-338 | DEFINITION_OF_D... | Database | 42_DEFINITION_OF_DONE.md | Database | data | PLANNED | Not started |
| REQ-339 | DEFINITION_OF_D... | Backend | 42_DEFINITION_OF_DONE.md | Backend | functional | PLANNED | Not started |
| REQ-340 | DEFINITION_OF_D... | Frontend | 42_DEFINITION_OF_DONE.md | Frontend | functional | PLANNED | Not started |
| REQ-341 | DEFINITION_OF_D... | Testing | 42_DEFINITION_OF_DONE.md | Testing | testing | PLANNED | Not started |
| REQ-342 | DEFINITION_OF_D... | Operations | 42_DEFINITION_OF_DONE.md | Operations | functional | PLANNED | Not started |
| REQ-343 | DEFINITION_OF_D... | Documentation | 42_DEFINITION_OF_DONE.md | Documentation | functional | PLANNED | Not started |
| REQ-344 | DEFINITION_OF_D... | Release DoD | 42_DEFINITION_OF_DONE.md | Release DoD | functional | PLANNED | Not started |
| REQ-345 | RISK_REGISTER | 43 RISK REGISTER | 43_RISK_REGISTER.md | 43 RISK REGISTER | functional | PLANNED | Not started |
| REQ-346 | DECISION_LOG | ADR Template | 44_DECISION_LOG.md | ADR Template | infrastructure | PLANNED | Not started |
| REQ-347 | DECISION_LOG | ADR-XXXX — Title | 44_DECISION_LOG.md | ADR-XXXX — Title | infrastructure | PLANNED | Not started |
| REQ-348 | DECISION_LOG | Initial decisions | 44_DECISION_LOG.md | Initial decisions | functional | PLANNED | Not started |
| REQ-349 | DECISION_LOG | ADR-0001 — Centralized production data | 44_DECISION_LOG.md | ADR-0001 — Centralized production data | infrastructure | PLANNED | Not started |
| REQ-350 | DECISION_LOG | ADR-0002 — Separate branded branch apps | 44_DECISION_LOG.md | ADR-0002 — Separate branded branch apps | infrastructure | PLANNED | Not started |
| REQ-351 | DECISION_LOG | ADR-0003 — Database-first branch isolation | 44_DECISION_LOG.md | ADR-0003 — Database-first branch isolation | data | PLANNED | Not started |
| REQ-352 | DECISION_LOG | ADR-0004 — Organization and branch are separate entities | 44_DECISION_LOG.md | ADR-0004 — Organization and branch are separate entities | infrastructure | PLANNED | Not started |
| REQ-353 | DECISION_LOG | ADR-0005 — Modular monolith first | 44_DECISION_LOG.md | ADR-0005 — Modular monolith first | infrastructure | PLANNED | Not started |
| REQ-354 | CLIENT_HANDOVER... | Ownership target | 45_CLIENT_HANDOVER.md | Ownership target | functional | PLANNED | Not started |
| REQ-355 | CLIENT_HANDOVER... | Handover list | 45_CLIENT_HANDOVER.md | Handover list | functional | PLANNED | Not started |
| REQ-356 | CLIENT_HANDOVER... | Source | 45_CLIENT_HANDOVER.md | Source | functional | PLANNED | Not started |
| REQ-357 | CLIENT_HANDOVER... | Backend | 45_CLIENT_HANDOVER.md | Backend | functional | PLANNED | Not started |
| REQ-358 | CLIENT_HANDOVER... | Domain | 45_CLIENT_HANDOVER.md | Domain | functional | PLANNED | Not started |
| REQ-359 | CLIENT_HANDOVER... | Communications | 45_CLIENT_HANDOVER.md | Communications | functional | IMPLEMENTED | Codebase inspection |
| REQ-360 | CLIENT_HANDOVER... | Payments | 45_CLIENT_HANDOVER.md | Payments | functional | PLANNED | Not started |
| REQ-361 | CLIENT_HANDOVER... | Mobile | 45_CLIENT_HANDOVER.md | Mobile | functional | PLANNED | Not started |
| REQ-362 | CLIENT_HANDOVER... | Operations | 45_CLIENT_HANDOVER.md | Operations | functional | PLANNED | Not started |
| REQ-363 | CLIENT_HANDOVER... | Handover rules | 45_CLIENT_HANDOVER.md | Handover rules | functional | PLANNED | Not started |
| REQ-364 | CLIENT_HANDOVER... | Final handover evidence | 45_CLIENT_HANDOVER.md | Final handover evidence | functional | PLANNED | Not started |
| REQ-365 | GLOSSARY | 46 GLOSSARY | 46_GLOSSARY.md | 46 GLOSSARY | functional | PLANNED | Not started |
| REQ-366 | FOUNDATION_IDEN... | Critical acceptance | 01_FOUNDATION_IDENTITY.md | Critical acceptance | functional | IMPLEMENTED | Codebase inspection |
| REQ-367 | STUDENTS_GUARDI... | Rules | 02_STUDENTS_GUARDIANS.md | Rules | functional | IMPLEMENTED | Codebase inspection |
| REQ-368 | STUDENTS_GUARDI... | Critical acceptance | 02_STUDENTS_GUARDIANS.md | Critical acceptance | functional | IMPLEMENTED | Codebase inspection |
| REQ-369 | ACADEMICS | Critical acceptance | 03_ACADEMICS.md | Critical acceptance | functional | PLANNED | Not started |
| REQ-370 | SCHEDULING | Critical acceptance | 04_SCHEDULING.md | Critical acceptance | functional | IMPLEMENTED | Codebase inspection |
| REQ-371 | ATTENDANCE | 1. Module | 05_ATTENDANCE.md | 1. Module | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-372 | ATTENDANCE | 2. Actors | 05_ATTENDANCE.md | 2. Actors | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-373 | ATTENDANCE | 3. Scope | 05_ATTENDANCE.md | 3. Scope | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-374 | ATTENDANCE | 4. Entities | 05_ATTENDANCE.md | 4. Entities | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-375 | ATTENDANCE | 5. Business rules | 05_ATTENDANCE.md | 5. Business rules | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-376 | ATTENDANCE | 6. Database | 05_ATTENDANCE.md | 6. Database | data | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-377 | ATTENDANCE | Tables & Fields | 05_ATTENDANCE.md | Tables & Fields | data | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-378 | ATTENDANCE | Constraints | 05_ATTENDANCE.md | Constraints | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-379 | ATTENDANCE | Indexes | 05_ATTENDANCE.md | Indexes | data | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-380 | ATTENDANCE | Migration / Archive | 05_ATTENDANCE.md | Migration / Archive | data | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-381 | ATTENDANCE | 7. Security | 05_ATTENDANCE.md | 7. Security | security | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-382 | ATTENDANCE | 8. APIs | 05_ATTENDANCE.md | 8. APIs | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-383 | ATTENDANCE | Lifecycle / State Machine | 05_ATTENDANCE.md | Lifecycle / State Machine | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-384 | ATTENDANCE | Concurrency and Transactions | 05_ATTENDANCE.md | Concurrency and Transactions | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-385 | ATTENDANCE | Operations | 05_ATTENDANCE.md | Operations | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-386 | ATTENDANCE | 9. Screens | 05_ATTENDANCE.md | 9. Screens | UX | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-387 | ATTENDANCE | 10. Notifications | 05_ATTENDANCE.md | 10. Notifications | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-388 | ATTENDANCE | 11. Files | 05_ATTENDANCE.md | 11. Files | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-389 | ATTENDANCE | 12. Reports | 05_ATTENDANCE.md | 12. Reports | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-390 | ATTENDANCE | 13. Imports/exports | 05_ATTENDANCE.md | 13. Imports/exports | data | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-391 | ATTENDANCE | 14. Tests | 05_ATTENDANCE.md | 14. Tests | testing | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-392 | ATTENDANCE | 15. Definition of done | 05_ATTENDANCE.md | 15. Definition of done | governance | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-393 | HOMEWORK_LEARNI... | 1. Domain Model | 06_HOMEWORK_LEARNING.md | 1. Domain Model | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-394 | HOMEWORK_LEARNI... | Core Entities | 06_HOMEWORK_LEARNING.md | Core Entities | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-395 | HOMEWORK_LEARNI... | Dependency Relationships | 06_HOMEWORK_LEARNING.md | Dependency Relationships | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-396 | HOMEWORK_LEARNI... | 2. Database Schema | 06_HOMEWORK_LEARNING.md | 2. Database Schema | data | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-397 | HOMEWORK_LEARNI... | `homework_assignments` | 06_HOMEWORK_LEARNING.md | `homework_assignments` | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-398 | HOMEWORK_LEARNI... | `homework_attachments` | 06_HOMEWORK_LEARNING.md | `homework_attachments` | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-399 | HOMEWORK_LEARNI... | `homework_submissions` | 06_HOMEWORK_LEARNING.md | `homework_submissions` | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-400 | HOMEWORK_LEARNI... | `submission_attachments` | 06_HOMEWORK_LEARNING.md | `submission_attachments` | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-401 | HOMEWORK_LEARNI... | `homework_audit_logs` | 06_HOMEWORK_LEARNING.md | `homework_audit_logs` | governance | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-402 | HOMEWORK_LEARNI... | 3. Assignment Lifecycle | 06_HOMEWORK_LEARNING.md | 3. Assignment Lifecycle | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-403 | HOMEWORK_LEARNI... | 4. Submission Lifecycle | 06_HOMEWORK_LEARNING.md | 4. Submission Lifecycle | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-404 | HOMEWORK_LEARNI... | 5. Authorization/RLS | 06_HOMEWORK_LEARNING.md | 5. Authorization/RLS | security | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-405 | HOMEWORK_LEARNI... | 6. Teacher Authorization | 06_HOMEWORK_LEARNING.md | 6. Teacher Authorization | security | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-406 | HOMEWORK_LEARNI... | 7. Storage Security Design | 06_HOMEWORK_LEARNING.md | 7. Storage Security Design | security | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-407 | HOMEWORK_LEARNI... | 8. API/RPC Contract | 06_HOMEWORK_LEARNING.md | 8. API/RPC Contract | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-408 | HOMEWORK_LEARNI... | 9. Notifications (EventBus) | 06_HOMEWORK_LEARNING.md | 9. Notifications (EventBus) | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-409 | HOMEWORK_LEARNI... | 10. Concurrency (Deterministic OCC) | 06_HOMEWORK_LEARNING.md | 10. Concurrency (Deterministic OCC) | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-410 | HOMEWORK_LEARNI... | 11. Performance | 06_HOMEWORK_LEARNING.md | 11. Performance | functional | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-411 | HOMEWORK_LEARNI... | 12. Test Matrix | 06_HOMEWORK_LEARNING.md | 12. Test Matrix | testing | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-412 | HOMEWORK_LEARNI... | Consistency Audit | 06_HOMEWORK_LEARNING.md | Consistency Audit | governance | PARTIALLY IMPLEMENTED | Missing Playwright E2E per DoD |
| REQ-413 | ADMISSIONS | Critical acceptance | 07_ADMISSIONS.md | Critical acceptance | functional | PLANNED | Not started |
| REQ-414 | EXAMS_RESULTS | Critical acceptance | 08_EXAMS_RESULTS.md | Critical acceptance | functional | PLANNED | Not started |
| REQ-415 | FEES_FINANCE | Critical acceptance | 09_FEES_FINANCE.md | Critical acceptance | functional | PLANNED | Not started |
| REQ-416 | COMMUNICATION | Critical acceptance | 10_COMMUNICATION.md | Critical acceptance | functional | IMPLEMENTED | Codebase inspection |
| REQ-417 | TRANSPORT | Critical acceptance | 11_TRANSPORT.md | Critical acceptance | functional | PLANNED | Not started |
| REQ-418 | LIBRARY | Critical acceptance | 12_LIBRARY.md | Critical acceptance | functional | PLANNED | Not started |
| REQ-419 | INVENTORY | Critical acceptance | 13_INVENTORY.md | Critical acceptance | functional | PLANNED | Not started |
| REQ-420 | HR_PAYROLL | Critical acceptance | 14_HR_PAYROLL.md | Critical acceptance | functional | PLANNED | Not started |
| REQ-421 | REPORTING_ANALY... | Critical acceptance | 15_REPORTING_ANALYTICS.md | Critical acceptance | functional | PLANNED | Not started |