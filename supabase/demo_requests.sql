-- Migration : création de la table demo_requests
-- À exécuter manuellement dans l'éditeur SQL de Supabase

CREATE TABLE IF NOT EXISTS demo_requests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  company_name   TEXT        NOT NULL,
  email          TEXT        NOT NULL,
  phone          TEXT,
  employee_count TEXT        NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'new'
                             CHECK (status IN ('new', 'contacted', 'converted')),
  created_at     TIMESTAMP   DEFAULT NOW()
);

-- Index pour trier par date de création (lecture superadmin)
CREATE INDEX IF NOT EXISTS demo_requests_created_at_idx ON demo_requests (created_at DESC);

-- RLS : seul le superadmin (via service role) peut lire les demandes
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Aucune lecture publique — accès uniquement via service_role (API server-side)
CREATE POLICY "No direct client access" ON demo_requests
  FOR ALL USING (false);
