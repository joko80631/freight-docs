-- Apply migrations in order
\i migrations/20240330000000_auth_schema.sql
\i migrations/20240330000001_storage_policies.sql
\i migrations/20240401000000_add_carrier_driver_fields.sql
\i migrations/20240401000001_document_status_workflow.sql
\i migrations/20240402000000_team_roles.sql 