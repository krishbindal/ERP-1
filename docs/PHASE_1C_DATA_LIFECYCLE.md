# SchoolOS — Data Lifecycle & Deletion Policy

Due to financial, compliance, and academic integrity requirements, hard deletes are strictly forbidden in most operational domains.

| Domain | Policy | Reason |
| :--- | :--- | :--- |
| Organizations/Branches | ARCHIVE | Relational cascade would destroy years of compliance data. |
| Students | ARCHIVE | Academic history must be preserved. Status changed to 'Archived' or 'Graduated'. |
| Finance (Invoices, Payments) | IMMUTABLE | Transaction integrity. Mistakes are handled via 'Refund' or 'Adjustment' counterpart rows. |
| Audit Logs | IMMUTABLE | Tamper evidence. |
| Memberships | SOFT DELETE | Revoked access must maintain history of who had access when. |
| Ephemeral Data (Notifications) | HARD DELETE | Cleanup old read alerts after 90 days via pg_cron. |
