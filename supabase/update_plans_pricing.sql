-- ============================================================
-- Mise à jour des tarifs pour aligner sur la landing page
-- À exécuter manuellement dans l'éditeur SQL de Supabase
-- ============================================================

UPDATE "plans" SET
  "price_monthly"   = 25000,
  "max_employees"   = 15,
  "extra_employee_price" = 2000
WHERE "name" = 'starter';

UPDATE "plans" SET
  "price_monthly"   = 65000,
  "max_employees"   = 50,
  "extra_employee_price" = 2000
WHERE "name" = 'business';

UPDATE "plans" SET
  "price_monthly"   = 150000,
  "max_employees"   = NULL,
  "extra_employee_price" = 2000
WHERE "name" = 'enterprise';
