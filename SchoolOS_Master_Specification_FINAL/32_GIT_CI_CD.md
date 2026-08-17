# SchoolOS — Git, CI/CD and Change Management

## Branch strategy

Use a simple, reviewable strategy such as:

- main
- feature branches
- release tags

Avoid long-lived divergent branches.

## Pull request requirements

A PR should include:

- purpose
- affected modules
- migrations
- security impact
- tests
- screenshots where UI changes
- documentation updates

## CI pipeline

```text
Install
 -> lint/type checks
 -> unit tests
 -> database/migration tests
 -> RLS/security suite
 -> integration tests
 -> web build
 -> mobile build for affected configs
 -> artifact/report
```

## Secrets

Store only in secure CI secret management.

## Branch app builds

Build artifacts must be tied to:

- branch configuration
- commit SHA
- version
- build number

## Release

Only tagged/approved commits are released to production.
