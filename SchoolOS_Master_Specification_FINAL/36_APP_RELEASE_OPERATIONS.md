# SchoolOS — Mobile App Release Operations

## Per-branch release record

- branch
- app name
- Android application/package ID
- iOS bundle ID
- version
- build
- commit SHA
- release date
- store status
- release notes
- known issues

## Pre-release

- branding correct
- branch config correct
- API environment correct
- notifications correct
- deep links correct
- permissions correct
- no debug logging
- no secrets embedded
- RLS/security tests pass
- smoke test pass

## Store operations

Maintain separate client-owned accounts where possible.

Never permanently tie the product to a developer's personal store account.

## Emergency response

Document:

- app disablement
- provider disablement
- credential rotation
- urgent backend mitigation
- communication plan
