# SchoolOS — Glossary

Organization: top-level customer/education group.

Branch: individual school/campus belonging to an organization.

Tenant: isolated organizational context; in SchoolOS an organization is the primary tenant, with branches beneath it.

Super Admin: organization-level administrator with authorized cross-branch visibility.

Branch Admin: administrator scoped to a specific branch.

RLS: PostgreSQL Row Level Security.

RBAC: Role Based Access Control.

Membership: relationship between a user and an organization/branch.

Scope: the set of resources a permission applies to.

Canonical data: authoritative source of truth.

App factory: process for generating branch-specific app builds from shared code/configuration.

Idempotency: repeated execution of an operation produces one logical result rather than duplicates.

Audit log: record of sensitive actions and state changes.

Migration: version-controlled database schema/data change.
