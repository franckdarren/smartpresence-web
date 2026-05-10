-- ============================================================
-- SmartPresence — Migration v2 : Plans capacités + Multi-site
-- À exécuter manuellement dans Supabase SQL Editor
-- ============================================================

-- ── 1. Nouvelles colonnes capacités sur la table plans ───────
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS wifi_check_enabled     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS excel_export_enabled   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS advanced_reports_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS api_access_enabled     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS history_months         integer;  -- NULL = illimité

-- Mettre à jour les plans existants avec les bonnes valeurs
UPDATE plans SET
  wifi_check_enabled       = false,
  excel_export_enabled     = false,
  advanced_reports_enabled = false,
  api_access_enabled       = false,
  history_months           = 3
WHERE name = 'starter';

UPDATE plans SET
  wifi_check_enabled       = true,
  excel_export_enabled     = true,
  advanced_reports_enabled = false,
  api_access_enabled       = false,
  history_months           = 12
WHERE name = 'business';

UPDATE plans SET
  wifi_check_enabled       = true,
  excel_export_enabled     = true,
  advanced_reports_enabled = true,
  api_access_enabled       = true,
  history_months           = NULL
WHERE name = 'enterprise';

-- ── 2. Créer la table sites ──────────────────────────────────
CREATE TABLE IF NOT EXISTS sites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id),
  name        text NOT NULL,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  radius      integer NOT NULL DEFAULT 100,
  wifi_ssid   text,
  qr_token    uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at  timestamp DEFAULT now()
);

-- ── 3. Migrer les données existantes : 1 site par entreprise ─
-- Pour chaque entreprise, crée un site "Principal" en réutilisant
-- les coordonnées et le company_token existants comme qr_token.
INSERT INTO sites (company_id, name, latitude, longitude, radius, wifi_ssid, qr_token)
SELECT
  id,
  'Site principal',
  latitude,
  longitude,
  radius,
  wifi_ssid,
  company_token   -- l'UUID du site reprend l'ancien company_token → l'app mobile continue de fonctionner
FROM companies
ON CONFLICT DO NOTHING;

-- ── 4. Ajouter site_id sur les pointages (nullable pour legacy) ──
ALTER TABLE attendances
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id);

-- Optionnel : lier les pointages historiques au site principal de l'entreprise
-- (décommentez si vous souhaitez rétroactivement lier les anciens pointages)
-- UPDATE attendances a
-- SET site_id = s.id
-- FROM users u
-- JOIN sites s ON s.company_id = u.company_id
-- WHERE a.user_id = u.id AND a.site_id IS NULL;

-- ── 5. Index pour les performances ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_sites_company_id  ON sites(company_id);
CREATE INDEX IF NOT EXISTS idx_sites_qr_token    ON sites(qr_token);
CREATE INDEX IF NOT EXISTS idx_attendances_site  ON attendances(site_id);

-- ── 6. RLS sur la table sites ────────────────────────────────
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- superadmin : accès total
CREATE POLICY "superadmin_sites_all" ON sites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'superadmin'
    )
  );

-- admin : lecture/écriture sur ses propres sites
CREATE POLICY "admin_sites_own_company" ON sites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.company_id = sites.company_id
        AND users.role = 'admin'
    )
  );

-- employee : lecture des sites de son entreprise (pour pointer)
CREATE POLICY "employee_sites_read" ON sites
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.company_id = sites.company_id
    )
  );

-- ── 7. Bucket Supabase Storage pour les preuves de paiement ──
-- (À créer via le dashboard Supabase si pas encore fait)
-- Storage > New bucket > "payment-proofs" > private

-- ── 8. Fin ───────────────────────────────────────────────────
-- Pensez à re-exécuter le seed SQL ou npm run db:seed pour les
-- plans si vous avez une base vierge.
