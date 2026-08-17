# SchoolOS — Notification Architecture

## Channels

- In-app
- Push
- Email
- SMS
- Other approved channels

## Event model

```text
Business event
 -> notification rule
 -> recipient eligibility
 -> template
 -> channel
 -> provider
 -> delivery status
```

## Eligibility

Recipient must be authorized for the relevant organization/branch/entity.

Never send a branch B event to branch A recipients because of a client-side branch mistake.

## Templates

Templates should support:

- event
- locale
- channel
- title
- body
- variables
- enabled state

## Delivery tracking

Where provider supports it:

- queued
- sent
- delivered
- failed
- opened/read where available

## Retry

Retry transient provider failures.

Do not retry permanent failures indefinitely.

## Preferences

Support user preferences where appropriate:

- category
- channel
- quiet hours if required
- mandatory system notices

## Push

Maintain secure mapping between:

- user
- device/app installation
- branch
- notification provider token

Tokens expire and must be refreshed.
