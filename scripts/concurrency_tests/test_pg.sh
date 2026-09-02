docker exec supabase_db_ERP_1 psql -U postgres -d postgres -c "SELECT pid, state, query FROM pg_stat_activity WHERE query NOT LIKE '%pg_stat_activity%';"
