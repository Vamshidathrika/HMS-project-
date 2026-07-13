import re

input_path = r'C:\Users\Administrator\.gemini\antigravity\scratch\ashirwad-hospital\local_dump_inserts.sql'
output_path = r'C:\Users\Administrator\.gemini\antigravity\scratch\ashirwad-hospital\supabase_migration.sql'

print(f"Cleaning {input_path} and writing to {output_path}...")

with open(input_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

clean_lines = []
for line in lines:
    # Comment out OWNER TO postgres
    if 'OWNER TO postgres' in line:
        line = '-- ' + line
    # Comment out client settings that may be restricted
    elif line.strip().startswith('SELECT pg_catalog.set_config'):
        line = '-- ' + line
    # Comment out schema creation if any
    elif line.strip().startswith('CREATE SCHEMA'):
        line = '-- ' + line
    # Comment out transaction timeout setting if not supported
    elif 'transaction_timeout' in line:
        line = '-- ' + line
    
    clean_lines.append(line)

# Add custom triggers for auto updated_at
trigger_sql = """

-- =======================================================
-- CUSTOM HMS TRIGGERS FOR AUTO UPDATED_AT
-- =======================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check and add updated_at columns if they don't exist, and create triggers
DO $$
DECLARE
    t text;
    tables_list text[] := ARRAY[
        'departments', 'doctors', 'patients', 'users', 'wards', 'beds',
        'op_registrations', 'ip_registrations', 'prescriptions', 
        'prescription_medicines', 'bills', 'bill_items', 'payments'
    ];
BEGIN
    FOREACH t IN ARRAY tables_list LOOP
        -- Add updated_at column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = t AND column_name = 'updated_at'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_at timestamp with time zone default now()', t);
        END IF;

        -- Drop existing trigger if any
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%I ON public.%I', t, t);

        -- Create trigger
        EXECUTE format('CREATE TRIGGER set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t, t);
    END LOOP;
END;
$$;
"""

clean_lines.append(trigger_sql)

with open(output_path, 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print("Done! supabase_migration.sql is ready with automatic triggers.")
