This folder contains SQL migrations and placeholders for Supabase Edge Functions.

Run migrations with your preferred Supabase tooling, e.g.:

```bash
supabase db push
psql < supabase/001_create_payments.sql
```

Be sure to review RLS policies and adjust `auth.uid()` checks to match your auth configuration.
