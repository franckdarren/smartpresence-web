-- ============================================================
-- Migration : payment_requests + storage bucket payment-proofs
-- À exécuter manuellement dans l'éditeur SQL de Supabase
-- ============================================================

-- ─── 1. TABLE PAYMENT_REQUESTS ───────────────────────────────
CREATE TABLE IF NOT EXISTS "payment_requests" (
  "id"                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id"          uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "subscription_id"     uuid REFERENCES "subscriptions"("id") ON DELETE SET NULL,
  "plan_id"             uuid NOT NULL REFERENCES "plans"("id"),
  "billing_cycle"       text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  "amount"              integer NOT NULL,
  "proof_storage_path"  text NOT NULL,
  "status"              text NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'approved', 'rejected')),
  "notes"               text,
  "reviewed_by"         uuid REFERENCES "users"("id"),
  "reviewed_at"         timestamp with time zone,
  "created_at"          timestamp with time zone DEFAULT now()
);

-- ─── 2. ROW LEVEL SECURITY ───────────────────────────────────
ALTER TABLE "payment_requests" ENABLE ROW LEVEL SECURITY;

-- Admins peuvent voir les demandes de leur entreprise
CREATE POLICY "payment_requests_select_own" ON "payment_requests"
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Admins peuvent soumettre une demande pour leur entreprise
CREATE POLICY "payment_requests_insert_admin" ON "payment_requests"
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seul le service role peut mettre à jour (via approbation superadmin)
CREATE POLICY "payment_requests_update_service" ON "payment_requests"
  FOR UPDATE USING (true);

-- ─── 3. STORAGE BUCKET payment-proofs ────────────────────────
-- À exécuter dans l'éditeur SQL Supabase (Storage section)
-- Ou via le dashboard Storage > New bucket

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,   -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Admins peuvent uploader dans leur dossier company_id/
CREATE POLICY "payment_proofs_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Seul le service role peut lire (pour générer des signed URLs)
CREATE POLICY "payment_proofs_select_service" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs'
  );
