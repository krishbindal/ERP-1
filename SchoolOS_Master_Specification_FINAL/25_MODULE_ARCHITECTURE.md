# SchoolOS — Module Architecture

## Module contract

Every module must define:

1. Goal
2. Actors
3. Scope
4. Entities
5. Database tables
6. Relationships
7. API operations
8. Permissions
9. RLS
10. Screens
11. Business rules
12. Notifications
13. Audit events
14. Imports/exports
15. Reports
16. Tests
17. Dependencies
18. Done criteria

## Module dependency order

### Foundation
Identity -> Tenancy -> RBAC/RLS -> Configuration -> Audit

### Academic foundation
People -> Academic Year -> Classes/Sections -> Subjects -> Enrollment

### Operations
Scheduling -> Attendance -> Homework -> Exams -> Fees

### Supporting
Admissions -> Communication -> Transport -> Library -> Inventory -> HR

Dependencies must be reviewed before implementation.

## No hidden coupling

Modules may depend on canonical entities but must not modify unrelated domain state without a documented contract.

## Shared services

- auth
- permissions
- storage
- notifications
- audit
- file validation
- exports
- reporting
