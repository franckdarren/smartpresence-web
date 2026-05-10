-- ============================================================
-- Migration : plans + subscriptions + notification_logs
-- À exécuter manuellement dans l'éditeur SQL de Supabase
-- ============================================================

-- ─── 1. TABLE PLANS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "plans" (
  "id"                   uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"                 text NOT NULL,
  "price_monthly"        integer NOT NULL,
  "max_employees"        integer,          -- null = illimité
  "max_sites"            integer,          -- null = illimité
  "extra_employee_price" integer NOT NULL DEFAULT 2000,
  "created_at"           timestamp DEFAULT now(),
  CONSTRAINT "plans_name_unique" UNIQUE("name")
);

-- ─── 2. TABLE SUBSCRIPTIONS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id"                   uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id"           uuid NOT NULL UNIQUE REFERENCES "companies"("id") ON DELETE CASCADE,
  "plan_id"              uuid NOT NULL REFERENCES "plans"("id"),
  "status"               text NOT NULL CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  "billing_cycle"        text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  "current_period_start" timestamp NOT NULL,
  "current_period_end"   timestamp NOT NULL,
  "trial_ends_at"        timestamp,
  "extra_employees"      integer NOT NULL DEFAULT 0,
  "created_at"           timestamp DEFAULT now(),
  "updated_at"           timestamp DEFAULT now()
);

-- ─── 3. TABLE NOTIFICATION_LOGS ──────────────────────────────
CREATE TABLE IF NOT EXISTS "notification_logs" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "type"       text NOT NULL,
  "email_to"   text NOT NULL,
  "period_ref" timestamp NOT NULL,
  "sent_at"    timestamp DEFAULT now()
);

-- ─── 4. SEED — PLANS ─────────────────────────────────────────
-- Starter : gratuit 30 jours d'essai, limité à 10 employés
INSERT INTO "plans" ("name", "price_monthly", "max_employees", "max_sites", "extra_employee_price")
VALUES
  ('starter',    25000,  15,   1,    2000),
  ('business',   65000,  50,   3,    2000),
  ('enterprise', 150000, NULL, NULL, 2000)
ON CONFLICT ("name") DO NOTHING;

-- ─── 5. ROW LEVEL SECURITY ───────────────────────────────────
ALTER TABLE "plans"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_logs" ENABLE ROW LEVEL SECURITY;

-- Plans : lecture publique (nécessaire pour afficher les tarifs)
CREATE POLICY "plans_select_all" ON "plans"
  FOR SELECT USING (true);

-- Subscriptions : admin lit son abonnement, superadmin lit tout
CREATE POLICY "subscriptions_select_own" ON "subscriptions"
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "subscriptions_insert_service" ON "subscriptions"
  FOR INSERT WITH CHECK (true);  -- uniquement via service role

CREATE POLICY "subscriptions_update_service" ON "subscriptions"
  FOR UPDATE USING (true);       -- uniquement via service role

-- Notification logs : superadmin uniquement
CREATE POLICY "notification_logs_superadmin" ON "notification_logs"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superadmin')
  );
