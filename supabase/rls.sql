-- ============================================================
-- Row Level Security — Attendance System
-- ============================================================
-- Helper: récupère le rôle de l'utilisateur connecté
-- ============================================================

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Helper: récupère le company_id de l'utilisateur connecté
CREATE OR REPLACE FUNCTION auth_user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$;

-- ============================================================
-- TABLE: companies
-- ============================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- superadmin : lecture totale
CREATE POLICY "companies_select_superadmin"
  ON public.companies
  FOR SELECT
  USING (auth_user_role() = 'superadmin');

-- superadmin : écriture totale
CREATE POLICY "companies_insert_superadmin"
  ON public.companies
  FOR INSERT
  WITH CHECK (auth_user_role() = 'superadmin');

CREATE POLICY "companies_update_superadmin"
  ON public.companies
  FOR UPDATE
  USING (auth_user_role() = 'superadmin');

CREATE POLICY "companies_delete_superadmin"
  ON public.companies
  FOR DELETE
  USING (auth_user_role() = 'superadmin');

-- admin : lecture de son entreprise uniquement
CREATE POLICY "companies_select_admin"
  ON public.companies
  FOR SELECT
  USING (
    auth_user_role() = 'admin'
    AND id = auth_user_company_id()
  );

-- employee : aucun accès (aucune policy → accès refusé par défaut)

-- ============================================================
-- TABLE: users
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- superadmin : lecture totale
CREATE POLICY "users_select_superadmin"
  ON public.users
  FOR SELECT
  USING (auth_user_role() = 'superadmin');

-- superadmin : écriture totale
CREATE POLICY "users_insert_superadmin"
  ON public.users
  FOR INSERT
  WITH CHECK (auth_user_role() = 'superadmin');

CREATE POLICY "users_update_superadmin"
  ON public.users
  FOR UPDATE
  USING (auth_user_role() = 'superadmin');

CREATE POLICY "users_delete_superadmin"
  ON public.users
  FOR DELETE
  USING (auth_user_role() = 'superadmin');

-- admin : lecture des users de son entreprise uniquement
CREATE POLICY "users_select_admin"
  ON public.users
  FOR SELECT
  USING (
    auth_user_role() = 'admin'
    AND company_id = auth_user_company_id()
  );

-- admin : création d'employees dans son entreprise uniquement
CREATE POLICY "users_insert_admin"
  ON public.users
  FOR INSERT
  WITH CHECK (
    auth_user_role() = 'admin'
    AND role = 'employee'
    AND company_id = auth_user_company_id()
  );

-- employee : lecture de son propre profil uniquement
CREATE POLICY "users_select_employee"
  ON public.users
  FOR SELECT
  USING (
    auth_user_role() = 'employee'
    AND id = auth.uid()
  );

-- ============================================================
-- TABLE: attendances
-- ============================================================

ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- superadmin : lecture totale
CREATE POLICY "attendances_select_superadmin"
  ON public.attendances
  FOR SELECT
  USING (auth_user_role() = 'superadmin');

-- admin : lecture des attendances des employés de son entreprise
CREATE POLICY "attendances_select_admin"
  ON public.attendances
  FOR SELECT
  USING (
    auth_user_role() = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = attendances.user_id
        AND u.company_id = auth_user_company_id()
    )
  );

-- employee : lecture de ses propres attendances uniquement
CREATE POLICY "attendances_select_employee"
  ON public.attendances
  FOR SELECT
  USING (
    auth_user_role() = 'employee'
    AND user_id = auth.uid()
  );

-- employee : création de ses propres attendances uniquement
CREATE POLICY "attendances_insert_employee"
  ON public.attendances
  FOR INSERT
  WITH CHECK (
    auth_user_role() = 'employee'
    AND user_id = auth.uid()
  );

-- employee : pas de UPDATE ni DELETE (aucune policy pour ces opérations)
