# SchoolOS — Application Architecture

## Shared-code principle

Prefer shared code for common product surfaces.

```text
Shared SchoolOS code
        |
        +-- Branch A config -> App A
        +-- Branch B config -> App B
        +-- Branch C config -> App C
```

## App identities

Each branch may have unique:

- name
- icon
- package identifier
- bundle identifier
- splash
- theme
- store listing

## Security warning

Build-time branch identity is NOT a security control.

Authorization must come from authenticated context and server/database policies.

## App surfaces

- Super Admin web
- Branch admin web/app
- Teacher app
- Parent app
- Student app

The final split should follow usability and client requirements.

## Shared packages

Potential:

```text
auth
ui
database
api
permissions
notifications
config
localization
analytics
```

## Deep links

Design for:

- invitations
- password reset
- payment
- notifications
- documents
- announcements

Deep links must not bypass authorization.

## Offline

Offline scope is feature-specific.

Do not introduce arbitrary offline writes for financial/security-sensitive workflows without conflict handling.
