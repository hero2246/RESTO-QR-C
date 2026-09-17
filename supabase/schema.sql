-- ==============================================================================
-- RESTO QR SaaS — Schéma PostgreSQL Multi-Tenant & Politiques RLS Supabase
-- Architecture : SaaS Multi-Tenant Isolé (OWNER / SAAS_EMPLOYEE / RESTAURANT_OWNER / STAFF / CUSTOMER)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. IDENTITÉ & PARAMÈTRES GLOBAUX DU SAAS (Niveau OWNER Uniquement)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.saas_branding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_name TEXT NOT NULL DEFAULT 'RESTO QR',
  slogan TEXT NOT NULL DEFAULT 'Scannez. Commandez. Savourez.',
  description TEXT DEFAULT 'Plateforme SaaS de menus numériques par QR code et commande en direct pour restaurants.',
  logo_url TEXT DEFAULT '',
  favicon_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#ea580c',
  secondary_color TEXT DEFAULT '#0f172a',
  accent_color TEXT DEFAULT '#f59e0b',
  font_family TEXT DEFAULT 'Plus Jakarta Sans',
  border_radius TEXT DEFAULT 'lg',
  hero_title TEXT DEFAULT 'Scannez. Commandez. Savourez.',
  hero_subtitle TEXT DEFAULT 'Révolutionnez le service en salle de votre restaurant avec notre plateforme de commande sur table.',
  contact_email TEXT DEFAULT 'contact@restoqr.com',
  contact_phone TEXT DEFAULT '+221 33 800 00 00',
  footer_text TEXT DEFAULT '© RESTO QR. Tous droits réservés.',
  legal_notice TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saas_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_mode BOOLEAN DEFAULT FALSE,
  allow_new_registrations BOOLEAN DEFAULT TRUE,
  require_email_verification BOOLEAN DEFAULT FALSE,
  enforce_strong_passwords BOOLEAN DEFAULT TRUE,
  owner_2fa_enabled BOOLEAN DEFAULT TRUE,
  owner_pin_code TEXT DEFAULT '789456', -- Code PIN secret de secours à 6 chiffres
  max_session_duration_hours INTEGER DEFAULT 24,
  currency TEXT DEFAULT 'FCFA',
  tax_rate_percent NUMERIC(4, 2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. PLANS SAAS & TARIFICATION
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY, -- 'FREE', 'PRO', 'PREMIUM'
  name TEXT NOT NULL,
  price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0, -- en FCFA
  price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  max_products INTEGER NOT NULL DEFAULT 20,
  max_staff INTEGER NOT NULL DEFAULT 2,
  max_monthly_orders INTEGER NOT NULL DEFAULT 100,
  features JSONB DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. PROFILS UTILISATEURS & RÔLES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'OWNER', 
    'SAAS_EMPLOYEE', 
    'RESTAURANT_OWNER', 
    'RESTAURANT_MANAGER', 
    'RESTAURANT_STAFF', 
    'CUSTOMER'
  )) DEFAULT 'RESTAURANT_OWNER',
  restaurant_id UUID,
  staff_role TEXT CHECK (staff_role IN ('MANAGER', 'WAITER', 'KITCHEN', 'CASHIER')),
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. RESTAURANTS INSCRITS (TENANTS)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Dakar',
  country TEXT DEFAULT 'Sénégal',
  description TEXT,
  logo TEXT,
  cover_image TEXT,
  primary_color TEXT DEFAULT '#ea580c',
  secondary_color TEXT DEFAULT '#0f172a',
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING', 'DELETED')) DEFAULT 'ACTIVE',
  plan_id TEXT NOT NULL REFERENCES public.plans(id) DEFAULT 'FREE',
  hours TEXT,
  instagram TEXT,
  facebook TEXT,
  wifi_name TEXT,
  wifi_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contrainte de clé étrangère sur profiles
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS fk_profiles_restaurant;
ALTER TABLE public.profiles 
  ADD CONSTRAINT fk_profiles_restaurant 
  FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 5. EMPLOYÉS DU SAAS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.saas_employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  permissions JSONB NOT NULL DEFAULT '["saas.restaurants.view", "saas.analytics.view"]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. EMPLOYÉS DES RESTAURANTS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.restaurant_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('RESTAURANT_MANAGER', 'RESTAURANT_STAFF')) DEFAULT 'RESTAURANT_STAFF',
  staff_role TEXT NOT NULL CHECK (staff_role IN ('MANAGER', 'WAITER', 'KITCHEN', 'CASHIER')) DEFAULT 'WAITER',
  permissions JSONB NOT NULL DEFAULT '["orders.view"]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. CATÉGORIES & PRODUITS DU MENU RESTAURANT
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0, -- en FCFA
  image TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0, -- en FCFA
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. TABLES DU RESTAURANT
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- ex: "Table 1", "Table 4"
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. COMMANDES EN SALLE & LIGNES DE COMMANDE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_note TEXT,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')) DEFAULT 'NEW',
  estimated_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_item_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------------------------
-- 10. JOURNAL D'AUDIT (AUDIT LOGS)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('RESTAURANT', 'EMPLOYEE', 'SETTINGS', 'BRANDING', 'SECURITY', 'AUTH')),
  target_name TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'SUCCESS',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. NOTIFICATIONS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'order_new',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- FONCTIONS SÉCURISÉES DE CONTRÔLE D'ACCÈS
-- ==============================================================================

-- Vérifie si l'utilisateur connecté est le OWNER principal du SaaS
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'OWNER' AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifie si l'utilisateur connecté est un employé SaaS avec une permission spécifique
CREATE OR REPLACE FUNCTION public.has_saas_permission(req_perm TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.is_owner() THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.saas_employees se
    JOIN public.profiles p ON p.id = se.user_id
    WHERE p.id = auth.uid() 
      AND se.is_active = TRUE
      AND se.permissions ? req_perm
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Récupère le restaurant_id de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_my_restaurant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT restaurant_id FROM public.profiles 
    WHERE id = auth.uid() AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifie si l'utilisateur est le propriétaire ou membre du restaurant
CREATE OR REPLACE FUNCTION public.is_restaurant_member(resto_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (public.get_my_restaurant_id() = resto_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- POLITIQUES ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.saas_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. SaaS Branding : Lecture publique, Modification réservée au OWNER
CREATE POLICY "Public read saas_branding" ON public.saas_branding FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage saas_branding" ON public.saas_branding FOR ALL USING (public.is_owner());

-- 2. SaaS Settings : OWNER uniquement
CREATE POLICY "Owner manage saas_settings" ON public.saas_settings FOR ALL USING (public.is_owner());

-- 3. Plans : Lecture publique, Modification réservée au OWNER
CREATE POLICY "Public read plans" ON public.plans FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage plans" ON public.plans FOR ALL USING (public.is_owner());

-- 4. Profils : Chacun lit et met à jour son profil ; OWNER et admins voient tout
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_owner());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_owner());

-- 5. Restaurants :
-- - Public voit uniquement les restaurants ACTIVE
-- - Membres du restaurant voient leur propre restaurant
-- - OWNER et employés SaaS avec permission voient tous les restaurants
CREATE POLICY "Public can read active restaurants" ON public.restaurants FOR SELECT 
  USING (
    status = 'ACTIVE' 
    OR public.has_saas_permission('saas.restaurants.view') 
    OR id = public.get_my_restaurant_id()
  );

-- OWNER gère le statut, les plans et l'existence du tenant
CREATE POLICY "Owner/SaaS can manage restaurants" ON public.restaurants FOR ALL 
  USING (public.has_saas_permission('saas.restaurants.manage'));

-- Restaurant Owner peut mettre à jour ses coordonnées et branding restaurant
CREATE POLICY "Restaurant Owner can update own restaurant" ON public.restaurants FOR UPDATE 
  USING (id = public.get_my_restaurant_id());

-- 6. SaaS Employees : OWNER seul a le contrôle absolu
CREATE POLICY "Owner manages saas_employees" ON public.saas_employees FOR ALL 
  USING (public.is_owner());

-- 7. Restaurant Staff : Isolé par restaurant_id
CREATE POLICY "Restaurant manages its staff" ON public.restaurant_staff FOR ALL 
  USING (restaurant_id = public.get_my_restaurant_id() OR public.is_owner());

-- 8. Menus, Catégories, Produits, Tables : Isolation stricte
CREATE POLICY "Public read menu of active restaurants" ON public.categories FOR SELECT 
  USING (
    is_visible = TRUE 
    OR restaurant_id = public.get_my_restaurant_id() 
    OR public.has_saas_permission('saas.restaurants.view')
  );

CREATE POLICY "Restaurant manages its categories" ON public.categories FOR ALL 
  USING (restaurant_id = public.get_my_restaurant_id());

CREATE POLICY "Public read products of active restaurants" ON public.products FOR SELECT 
  USING (
    is_available = TRUE 
    OR restaurant_id = public.get_my_restaurant_id() 
    OR public.has_saas_permission('saas.restaurants.view')
  );

-- RÈGLE CRITIQUE : Seul le propriétaire ou gérant du restaurant peut modifier ses propres produits !
CREATE POLICY "Restaurant manages its products" ON public.products FOR ALL 
  USING (restaurant_id = public.get_my_restaurant_id());

CREATE POLICY "Restaurant manages its tables" ON public.tables FOR ALL 
  USING (restaurant_id = public.get_my_restaurant_id());

CREATE POLICY "Public read active tables" ON public.tables FOR SELECT 
  USING (is_active = TRUE OR restaurant_id = public.get_my_restaurant_id());

-- 9. Commandes :
-- - Les clients peuvent insérer une commande sans compte
-- - La cuisine et le restaurant ne voient que les commandes de LEUR restaurant_id
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can read own order by id" ON public.orders FOR SELECT USING (TRUE);

CREATE POLICY "Restaurant manages its own orders" ON public.orders FOR ALL 
  USING (restaurant_id = public.get_my_restaurant_id());

CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public and restaurant can read order items" ON public.order_items FOR SELECT USING (TRUE);

-- 10. Audit Logs : OWNER et employés autorisés
CREATE POLICY "Owner read audit logs" ON public.audit_logs FOR SELECT 
  USING (public.has_saas_permission('saas.audit.view'));
CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (TRUE);

-- ------------------------------------------------------------------------------
-- REALTIME
-- ------------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
