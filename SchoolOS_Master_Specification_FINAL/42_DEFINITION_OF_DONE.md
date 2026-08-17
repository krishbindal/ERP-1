# SchoolOS — Definition of Done

## Feature DoD

A feature is complete only when:

### Product
- requirement confirmed
- acceptance criteria defined
- edge cases identified

### Database
- schema implemented
- migration versioned
- constraints
- indexes
- ownership
- RLS

### Backend
- business logic
- validation
- authorization
- consistent errors
- transactions/idempotency where needed

### Frontend
- main flow
- loading
- empty
- validation
- error
- permission denied
- responsive/mobile behavior

### Testing
- unit
- integration
- RLS
- negative cases
- E2E where appropriate

### Operations
- logging
- audit
- notifications
- monitoring as applicable

### Documentation
- module docs
- API docs
- schema docs
- change record

## Release DoD

- migrations validated
- CI green
- security suite green
- critical E2E green
- builds signed
- smoke test
- release notes
- rollback/mitigation known
