# SchoolOS — RBAC Permission Matrix

## Permission model

Permission should be represented as a structured capability:

```text
<domain>.<resource>.<action>
```

Examples:

```text
students.student.read
students.student.create
students.student.update
students.student.archive

fees.invoice.read
fees.invoice.create
fees.payment.record
fees.refund.approve

exams.marks.enter
exams.marks.publish
```

## Action set

- Read
- Create
- Update
- Delete
- Archive
- Publish
- Approve
- Export
- Import
- Configure
- Manage

## Scope set

- Global
- Organization
- Branch
- Class
- Section
- Assigned
- Own child
- Own record

## Initial matrix

| Domain | Super Admin | Branch Admin | Principal | Teacher | Accountant | Librarian | Parent | Student |
|---|---|---|---|---|---|---|---|---|
| Branches | All | Own | Read | No | No | No | No | No |
| Students | All | CRUD own | CRUD own | Scoped | Read | Read limited | Own child | Own |
| Academics | All | CRUD own | CRUD own | Scoped | Read | No | Read | Read |
| Attendance | All | CRUD own | CRUD own | Scoped | Read | No | Own child | Own |
| Exams | All | CRUD own | CRUD own | Scoped | Read | No | Read | Read |
| Fees | All | CRUD own | Read | No | CRUD own | No | Own child | Own |
| Library | All | Configure own | Read | Read | No | CRUD own | Child scope | Own |
| Transport | All | Configure own | Read | Read limited | No | No | Own child | Own |
| Reports | All | Own branch | Own branch | Scoped | Finance | Library | Own | Own |
| Settings | All | Branch | Limited | No | Limited | Limited | Personal | Personal |

This table is a baseline. Final permission matrix must be completed per screen and API.

## Rule

Role names are not the enforcement mechanism by themselves.

The system evaluates:

`user -> memberships -> roles -> permissions -> resource scope`
