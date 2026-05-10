-- Migration : table notification_logs
-- À exécuter manuellement dans l'éditeur SQL de Supabase

CREATE TABLE IF NOT EXISTS notification_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL,
  email_to    TEXT        NOT NULL,
  period_ref  TIMESTAMPTZ NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garantit qu'un même rappel (type) ne soit envoyé qu'une fois par cycle (period_ref)
CREATE UNIQUE INDEX IF NOT EXISTS notification_logs_unique
  ON notification_logs (company_id, type, period_ref);

-- RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Seul le superadmin (via service role) peut lire/écrire les logs de notification
CREATE POLICY "service_role_only" ON notification_logs
  USING (auth.role() = 'service_role');
