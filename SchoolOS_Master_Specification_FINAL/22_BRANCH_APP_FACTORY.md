# SchoolOS — Branch App Factory

## Objective

Create a repeatable way to produce a new branch app without cloning the application codebase.

## Branch app record

Each branch needs:

```text
branch_id
organization_id
app_name
package_id
bundle_id
logo
icon
splash
theme
enabled_modules
support_contact
store_metadata
notification_identity
status
```

## Provisioning flow

```text
Create branch
 -> validate configuration
 -> create app configuration
 -> allocate identifiers
 -> prepare assets
 -> configure notification identity
 -> build Android
 -> build iOS
 -> QA
 -> publish
```

## Branch build matrix

Maintain a registry:

| Branch | Android ID | iOS Bundle ID | App Name | Version | Store Status |
|---|---|---|---|---|---|

## Secrets

Signing keys and provider secrets remain in secure CI/CD secret storage.

## Build modes

- development
- staging
- production

Each may have separate provider/configuration values.

## New branch checklist

- Branch exists.
- Branding approved.
- Admin account created.
- Modules configured.
- App IDs allocated.
- Android build validated.
- iOS build validated.
- Push notifications tested.
- Deep links tested.
- Store listing prepared.
- Privacy/support URLs verified.
- Cross-branch security tests passed.
