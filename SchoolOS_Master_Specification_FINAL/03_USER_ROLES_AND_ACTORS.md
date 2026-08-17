# SchoolOS — User Roles and Actors

## Actor hierarchy

```text
Organization
├── Super Admin
├── Organization Admin
│
└── Branch
    ├── Branch Admin
    ├── Principal
    ├── Vice Principal
    ├── Accountant
    ├── HR/Admin
    ├── Librarian
    ├── Transport Manager
    ├── Teacher
    ├── Class Teacher
    ├── Exam Coordinator
    ├── Parent/Guardian
    └── Student
```

## Role principles

Roles describe capability.

Scope describes where the capability applies.

Never assume:

`role = access to every row`

Instead evaluate:

`identity + organization membership + branch membership + role + permission + resource scope`

## Initial scope types

- Global
- Organization
- Branch
- Class
- Section
- Assigned resources
- Own child
- Own record

## Special cases to support

- Teacher working across more than one branch if authorized.
- Parent with children in different branches if the client permits it.
- Super Admin switching branch context.
- Staff with multiple roles.
- Temporary/acting roles.
- Disabled users.
- Disabled branches.

## Identity lifecycle

```text
Invited
 -> Active
 -> Suspended
 -> Deactivated
```

Keep identity lifecycle separate from employment/student lifecycle.

## Role assignment lifecycle

```text
Assigned
 -> Effective date begins
 -> Updated/expired
 -> Revoked
```

Do not overwrite history when the client needs an audit trail.
