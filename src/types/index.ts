// ==============================================================================
// RESTO QR SaaS — Types & Modèle de Données Multi-Tenant
// ==============================================================================

// 1. Rôles dans la hiérarchie SaaS
export type UserRole = 
  | 'OWNER'               // Niveau 1 : Propriétaire principal du SaaS (contrôle absolu de la plateforme)
  | 'SAAS_EMPLOYEE'       // Niveau 2 : Employé SaaS (accès limité par permissions, interdiction de toucher au Owner)
  | 'RESTAURANT_OWNER'    // Niveau 3 : Propriétaire / gérant d'un restaurant (accès uniquement à son restaurant)
  | 'RESTAURANT_MANAGER'  // Niveau 4 : Responsable restaurant avec permissions déléguées
  | 'RESTAURANT_STAFF'    // Niveau 5 : Employé opérationnel (Serveur, Cuisine, Caissier)
  | 'CUSTOMER'           // Niveau 6 : Client sur table (sans compte obligatoire)
  | 'RESTAURANT'          // Alias de compatibilité
  | 'ADMIN';              // Alias de compatibilité

// Types de rôle pour le personnel en restaurant
export type StaffRoleType = 'MANAGER' | 'WAITER' | 'KITCHEN' | 'CASHIER' | 'BARTENDER' | 'HOST';

// Statut des restaurants dans le SaaS
export type RestaurantStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DELETED';

// Statut des commandes
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

// 2. Profil Utilisateur
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurant_id?: string; // Obligatoire si RESTAURANT_OWNER, RESTAURANT_MANAGER, RESTAURANT_STAFF
  staff_role?: StaffRoleType;
  permissions?: string[];
  is_active?: boolean;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
}

// 3. Permissions SaaS (Plateforme globale)
export type SaasPermission = 
  | 'saas.restaurants.view'
  | 'saas.restaurants.manage'
  | 'saas.restaurants.delete'
  | 'saas.plans.manage'
  | 'saas.monetization.manage'
  | 'saas.subscriptions.manage'
  | 'saas.analytics.view'
  | 'saas.users.view'
  | 'saas.employees.manage'
  | 'saas.branding.edit'
  | 'saas.settings.edit'
  | 'saas.audit.view'
  | 'saas.security.manage';

// 4. Permissions Restaurant (Tenant isolé)
export type RestaurantPermission = 
  | 'restaurant.view'
  | 'restaurant.edit'
  | 'menu.view'
  | 'menu.create'
  | 'menu.edit'
  | 'menu.delete'
  | 'view_categories'
  | 'create_categories'
  | 'update_categories'
  | 'delete_categories'
  | 'manage_categories'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'orders.view'
  | 'orders.manage'
  | 'orders.cancel'
  | 'tables.manage'
  | 'analytics.view'
  | 'staff.manage'
  | 'settings.manage'
  | 'qrcode.manage'
  | 'billing.view';

// Rôles spécifiques pour les gestionnaires de la plateforme principale
export type PlatformManagerRole = 
  | 'SUPER_ADMIN' 
  | 'PLATFORM_MANAGER' 
  | 'SUPPORT_MANAGER' 
  | 'FINANCE_MANAGER' 
  | 'CONTENT_MODERATOR';

// 5. Gestionnaire / Employé de la Plateforme SaaS Principale
export interface SaasEmployee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'SAAS_EMPLOYEE' | 'SUPER_ADMIN' | 'PLATFORM_MANAGER' | 'SUPPORT_MANAGER' | 'FINANCE_MANAGER' | 'CONTENT_MODERATOR';
  manager_role?: PlatformManagerRole;
  department?: string;
  access_pin?: string;
  access_code?: string; // Code d'accès unique généré pour l'invitation Gmail (ex: RESTO-AUTH-8921)
  permissions: string[];
  is_active: boolean;
  invited_via_gmail?: boolean;
  invitation_status?: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  invitation_sent_at?: string;
  invitation_expires_at?: string;
  created_at: string;
  last_login_at?: string;
}

// 5.1 Invitation d'un collaborateur par Gmail
export interface SaasEmployeeInvitation {
  id: string;
  email: string;
  name: string;
  department: string;
  manager_role: PlatformManagerRole;
  access_code: string;
  permissions: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  sent_at: string;
  expires_at: string;
  sent_by_user_id?: string;
}

// Statut d'emploi du personnel
export type StaffEmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'SUSPENDED';

// Statut de présence quotidienne
export type AttendanceStatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE' | 'UNSPECIFIED';

// Priorité de tâche
export type TaskPriorityType = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

// Catégorie de tâche opérationnelle
export type TaskCategoryType = 'KITCHEN' | 'ROOM' | 'CLEANING' | 'CASHIER' | 'STOCK' | 'DELIVERY' | 'ADMIN' | 'OTHER';

// Statut de tâche
export type OperationalTaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

// 6. Employé d'un Restaurant (Personnel de salle / cuisine / gestion)
export interface RestaurantStaffMember {
  id: string;
  restaurant_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'RESTAURANT_MANAGER' | 'RESTAURANT_STAFF';
  staff_role: StaffRoleType;
  position_title?: string; // Titre du poste (ex: 'Gérant', 'Chef pâtissier', 'Plongeur', etc.)
  station_label?: string; // Ex: 'Poste Chaud & Grillades', 'Salle - Rangs 1 à 6', 'Caisse Principale'
  shift_hours?: string;   // Ex: 'Service Continu 11h-23h', 'Service Midi 11h-16h'
  birth_date?: string;
  hire_date?: string;     // Date d'embauche
  salary?: number;
  employment_status?: StaffEmploymentStatus;
  notes?: string;
  invitation_code?: string;
  invitation_sent?: boolean;
  permissions: string[];
  is_active: boolean;
  is_online?: boolean;
  checked_in_at?: string;
  checked_out_at?: string;
  last_active_at?: string;
  current_station?: string;
  today_tasks_completed?: number;
  created_at: string;
}

// Poste personnalisé du restaurant
export interface CustomStaffPosition {
  id: string;
  restaurant_id: string;
  name: string;
  default_role: StaffRoleType;
  default_permissions: string[];
  description?: string;
  is_system?: boolean;
}

// Registre de présence opérationnel
export interface AttendanceRecord {
  id: string;
  restaurant_id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  position_title: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatusType;
  check_in_time?: string;  // HH:mm
  check_out_time?: string; // HH:mm
  hours_worked?: number;
  notes?: string;
  tasks_count?: number;
  recorded_by?: string;
  created_at: string;
}

// Tâche opérationnelle complète
export interface OperationalTask {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  assigned_role?: string;
  position_title?: string;
  date: string;      // YYYY-MM-DD
  due_time?: string; // HH:mm
  priority: TaskPriorityType;
  category: TaskCategoryType;
  status: OperationalTaskStatus;
  recurrence?: 'NONE' | 'DAILY' | 'WEEKLY';
  proof_comment?: string;
  proof_photo?: string;
  completed_at?: string;
  completed_by_id?: string;
  completed_by_name?: string;
  created_at: string;
}

// Journal d'activité chronologique du restaurant (Timeline)
export interface RestaurantActivityEvent {
  id: string;
  restaurant_id: string;
  user_id?: string;
  user_name: string;
  user_role: string;
  action: string;
  target?: string;
  category: 'ORDER' | 'STAFF' | 'ATTENDANCE' | 'TASK' | 'MENU' | 'TABLE' | 'PAYMENT' | 'RESERVATION' | 'LOGIN' | 'SETTING';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timestamp: string;
  details?: string;
}

// Tâche quotidienne d'un employé / équipe du jour (compatibilité)
export interface StaffDailyTask {
  id: string;
  restaurant_id: string;
  staff_id?: string;
  staff_name?: string;
  title: string;
  category: 'PREPARATION' | 'SERVICE' | 'CLEANING' | 'CASH' | 'MANAGEMENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  completed_at?: string;
  completed_by_name?: string;
  assigned_role?: StaffRoleType;
  created_at: string;
}

// 7. Modèle Restaurant (Tenant)
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  description: string;
  logo: string;
  cover_image: string;
  primary_color: string;
  secondary_color: string;
  status: RestaurantStatus;
  plan_id: string; // 'FREE' | 'PRO' | 'PREMIUM' ou ID personnalisé
  created_at: string;
  hours?: string;
  instagram?: string;
  facebook?: string;
  wifi_name?: string;
  wifi_password?: string;
  // Nouveaux champs pour Site Restaurant & Domaine
  custom_domain?: string;
  subdomain?: string;
  domain_status?: DomainStatus;
  featured_product_ids?: string[];
  website_config?: RestaurantWebsiteConfig;
  subscription?: Subscription;
  admin_override?: AdminOverride;
}

// 8. Catégorie de menu
export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  order: number;
  is_visible: boolean;
}

// 9. Option de produit
export interface ProductOption {
  id: string;
  name: string;
  price: number; // en FCFA
  is_required?: boolean;
}

// 10. Produit
export interface Product {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number; // en FCFA
  image: string;
  is_available: boolean;
  options: ProductOption[];
}

// 11. Table de restaurant
export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  name: string; // ex: "Table 1", "Table 4"
  is_active: boolean;
  qr_code_url?: string;
}

// 12. Option sélectionnée dans une commande
export interface SelectedOption {
  id: string;
  name: string;
  price: number;
}

// 13. Ligne de commande
export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  selected_options: SelectedOption[];
  subtotal: number;
}

// Mode de service en restaurant
export type ServiceMode = 'TABLE' | 'COMPTOIR' | 'A_EMPORTER' | 'LIVRAISON' | 'MIXTE';

// Statut de connexion du domaine personnalisé
export type DomainStatus = 'PENDING' | 'VERIFYING' | 'CONNECTED' | 'ERROR' | 'DISCONNECTED';

// Thèmes prédéfinis pour les sites restaurants
export type RestaurantThemeId = 
  | 'classic'     // 1. Restaurant classique (élégant, boisé, intemporel)
  | 'modern'      // 2. Restaurant moderne (épuré, contrasté)
  | 'fastfood'    // 3. Fast-food (énergique, percutant, visuel)
  | 'premium'     // 4. Restaurant premium (luxe, sombre, raffiné)
  | 'cafe'        // 5. Café & Salon de thé (doux, pastel, chaleureux)
  | 'streetfood'  // 6. Street Food (dynamique, urbain, coloré)
  | 'minimalist'; // 7. Minimaliste (typographie nette, blanc aéré)

// Horaires journaliers
export interface RestaurantHoursDay {
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

// Avis client sur le restaurant
export interface RestaurantReview {
  id: string;
  restaurant_id: string;
  author_name: string;
  rating: number; // 1 à 5
  comment: string;
  date: string;
  is_approved: boolean;
}

// Code promotionnel / Réduction
export interface RestaurantPromotion {
  id: string;
  restaurant_id: string;
  code: string;
  discount_percent: number; // ex: 20 pour -20%
  title: string;
  is_active: boolean;
  valid_until?: string;
}

// Image de galerie photo
export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category?: string;
}

// Configuration complète du site web d'un restaurant (Niveau 2 & 3)
export interface RestaurantWebsiteConfig {
  restaurant_id: string;
  theme_id: RestaurantThemeId;
  
  // Couleurs & Identité Visuelle
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    surface: string;
    button_text: string;
  };

  // Typographie & Formes
  typography: {
    font_family: string;
    heading_font: string;
  };
  style: {
    button_radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    card_radius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hero_style: 'clean' | 'image_cover' | 'split' | 'minimal';
  };

  // Visibilité des sections du site (activables / désactivables)
  sections_visibility: {
    hero: boolean;
    about: boolean;
    featured_products: boolean;
    menu: boolean;
    gallery: boolean;
    hours: boolean;
    location: boolean;
    contact: boolean;
    reviews: boolean;
    reservation: boolean;
  };

  // Contenu des sections
  hero: {
    title: string;
    subtitle: string;
    image_url: string;
    cta_menu_text: string;
    cta_order_text: string;
    badge_text?: string;
  };
  about: {
    title: string;
    subtitle?: string;
    story: string;
    image_url: string;
    chef_name?: string;
  };
  
  // Galerie photos
  gallery_images: GalleryImage[];

  // Horaires
  hours_schedule: RestaurantHoursDay[];
  allow_orders_when_closed: boolean;

  // Mode de service
  service_mode: ServiceMode;

  // Localisation & GPS
  location: {
    address: string;
    city: string;
    google_maps_url?: string;
    lat?: number;
    lng?: number;
    directions_note?: string;
  };

  // Contact & Réseaux Sociaux
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    enable_whatsapp_orders: boolean;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    x_twitter?: string;
    youtube?: string;
  };

  // SEO & Partage Social
  seo: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_image_url?: string;
    favicon_url?: string;
  };

  // Footer & Propriété
  footer: {
    custom_copyright?: string;
    show_powered_by_saas: boolean; // Si faux : AUCUN branding RESTO QR !
    notes?: string;
  };

  // Avis clients & Promotions
  reviews: RestaurantReview[];
  promotions: RestaurantPromotion[];
}

// 14. Commande
export interface Order {
  id: string;
  order_number: string; // ex: "#CMD-1048"
  restaurant_id: string;
  table_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_note?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  estimated_minutes?: number;
  service_mode?: ServiceMode;
  is_delayed?: boolean;
  preparation_started_at?: string;
  created_at: string;
  confirmed_at?: string;
  ready_at?: string;
  ready_by_name?: string;
  served_at?: string;
  served_by_name?: string;
  completed_at?: string;
}

// 15. Notification système
export interface NotificationItem {
  id: string;
  restaurant_id: string;
  order_id?: string;
  title: string;
  message: string;
  type: 'order_new' | 'order_ready' | 'order_served' | 'staff_checkin' | 'staff_checkout' | 'info' | 'security' | 'system';
  staff_name?: string;
  staff_role?: StaffRoleType;
  target_roles?: string[];
  read: boolean;
  created_at: string;
}

// 16. Identité & Branding Global SaaS (Niveau OWNER)
export interface SaasBranding {
  platform_name: string;
  slogan: string;
  description: string;
  logo_url: string;
  logo_secondary_url?: string;
  favicon_url: string;
  browser_title?: string;
  og_image_url?: string;
  website_url?: string;
  
  // Palette de couleurs & Apparence
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  button_color?: string;
  button_text_color?: string;
  background_color?: string;
  text_color?: string;
  card_color?: string;
  footer_color?: string;
  header_color?: string;
  sidebar_color?: string;
  link_color?: string;

  // Typographie et styles
  font_family: string;
  font_size_base?: 'sm' | 'md' | 'lg';
  border_radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  button_style?: 'pill' | 'rounded' | 'sharp';
  card_style?: 'flat' | 'bordered' | 'shadow' | 'elevated';
  shadow_level?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  max_width?: '6xl' | '7xl' | 'full';

  // Landing Page CMS
  hero_title: string;
  hero_subtitle: string;
  hero_image_url?: string;
  hero_cta_primary_text?: string;
  hero_cta_secondary_text?: string;
  features_title?: string;
  features_subtitle?: string;
  advantages?: { title: string; description: string; icon?: string }[];
  testimonials?: { author: string; role: string; content: string; avatar?: string; rating?: number }[];
  pricing_title?: string;
  pricing_subtitle?: string;

  // Contact & Footer
  contact_email: string;
  contact_phone: string;
  footer_text: string;
  legal_notice: string;
  company_name?: string;
  company_address?: string;
  whatsapp_support_number?: string;

  // Bannière d'annonce & Réseaux Sociaux
  announcement_banner_enabled?: boolean;
  announcement_banner_text?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_linkedin?: string;
  social_twitter?: string;

  // FAQ & Réseaux Sociaux
  faq_items?: { question: string; answer: string }[];
  social_links?: { platform: string; url: string }[];
  
  // Pages Légales
  legal_cgu?: string;
  legal_privacy?: string;
  legal_mentions?: string;
}

// 17. Limites et Fonctionnalités Configurables par Plan
export interface PlanLimits {
  max_products: number; // -1 = illimité
  max_categories: number;
  max_staff: number;
  max_monthly_orders: number;
  max_pages?: number;
  max_images?: number;
  max_domains?: number;
  max_custom_domains?: number;
  max_tables: number;
  max_qr_codes?: number;
  max_gallery_images?: number;
  max_reservations?: number;
  max_storage_mb?: number;
  storage_mb?: number;
}

export interface PlanFeatureFlags {
  custom_domain: boolean;
  advanced_analytics?: boolean;
  analytics_advanced?: boolean;
  reservations?: boolean;
  reviews?: boolean;
  promotions?: boolean;
  coupons?: boolean;
  promotions_and_coupons?: boolean;
  customer_reviews?: boolean;
  priority_support?: boolean;
  online_ordering?: boolean;
  table_ordering?: boolean;
  gallery?: boolean;
  whatsapp?: boolean;
  whatsapp_notifications?: boolean;
  multi_staff?: boolean;
  remove_branding?: boolean;
  custom_branding?: boolean;
  custom_css?: boolean;
  advanced_qr?: boolean;
  export_data?: boolean;
  multiple_locations?: boolean;
}

// 18. Plans SaaS & Quotas
export interface SaasPlan {
  id: string; // 'FREE' | 'PRO' | 'PREMIUM' | string
  name: string;
  price_monthly: number; // en FCFA ou devise sélectionnée
  price_yearly: number;
  description: string;
  is_active: boolean;
  is_popular?: boolean;
  is_custom?: boolean;
  display_order?: number;
  order?: number;
  badge?: string;
  color?: string;
  icon?: string;
  currency?: string;
  trial_days?: number;
  billing_period?: string;
  
  // Limites granulaires
  max_products?: number;
  max_staff?: number;
  max_monthly_orders?: number;
  limits: PlanLimits;

  // Feature flags par plan
  feature_flags: PlanFeatureFlags;
  
  // Liste des avantages affichés aux clients (texte libre)
  features: string[];
  created_at?: string;
  updated_at?: string;
}

// 19. Statuts et Modèles d'Abonnement Restaurant
export type SubscriptionStatus = 
  | 'TRIAL' 
  | 'ACTIVE' 
  | 'PAST_DUE' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'SUSPENDED' 
  | 'PENDING_PAYMENT';

export type PaymentStatus = 'PAID' | 'PENDING' | 'PENDING_VERIFICATION' | 'PENDING_PROOF' | 'FAILED' | 'NOT_REQUIRED' | 'REFUNDED';
export type PaymentProviderType = 'Wave' | 'Orange Money' | 'Stripe' | 'Carte bancaire' | 'Moov' | 'MTN' | 'Aucun' | 'wave' | 'orange_money' | 'stripe' | 'manual_transfer' | string;

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date?: string;
  end_date?: string;
  current_period_start?: string;
  current_period_end?: string;
  billing_cycle: 'monthly' | 'yearly';
  payment_status: PaymentStatus;
  payment_provider?: PaymentProviderType;
  payment_method?: string;
  amount?: number;
  currency?: string;
  cancel_at_period_end?: boolean;
  transaction_id?: string;
  payment_reference?: string;
  proof_notes?: string;
  proof_url?: string;
  verification_requested_at?: string;
  verified_at?: string;
  auto_renew?: boolean;
  created_at: string;
  updated_at?: string;
}

// 20. Dérogation Super Admin (Admin Override)
export interface AdminOverride {
  restaurant_id: string;
  override_plan: string;
  override_expires_at: string;
  override_reason: string;
  created_at: string;
  created_by: string;
}

// 21. Fournisseur de Paiement & Passerelle Modulaire
export type PaymentMode = 'TEST' | 'PRODUCTION';

export interface PaymentProviderConfig {
  id: string;
  name: string;
  type?: PaymentProviderType;
  enabled?: boolean;
  is_enabled?: boolean;
  is_active?: boolean;
  is_sandbox?: boolean;
  mode?: PaymentMode;
  api_key_configured?: boolean;
  public_key?: string;
  secret_key?: string;
  masked_key?: string;
  currency?: string;
  supported_currencies?: string[];
  transaction_fee_pct?: number;
  instructions?: string;
}

// 22. Facture & Transactions
export interface Invoice {
  id: string;
  invoice_number: string;
  restaurant_id: string;
  restaurant_name: string;
  customer_email?: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  billing_cycle?: 'monthly' | 'yearly';
  date?: string;
  created_at?: string;
  paid_at?: string;
  period_start?: string;
  period_end?: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  payment_method: string;
  payment_reference?: string;
  receipt_url?: string;
}

// 23. Mesures d'Utilisation en Temps Réel
export interface RestaurantUsage {
  restaurant_id?: string;
  products_count: number;
  categories_count: number;
  staff_count: number;
  monthly_orders_count: number;
  tables_count: number;
  domains_count?: number;
  custom_domains_count?: number;
  storage_mb?: number;
  storage_used_mb?: number;
  gallery_images_count: number;
  limits?: PlanLimits;
  isOverridden?: boolean;
  last_calculated_at?: string;
}

// 24. Paramètres de Monétisation & Facturation Globale (OWNER)
export type MonetizationMode = 'FREE_ONLY' | 'FREE_AND_PRO' | 'PAID_REQUIRED';
export type BillingFrequencyRequirement = 'FLEXIBLE' | 'MONTHLY_ONLY' | 'YEARLY_ONLY';

export interface SaasMonetizationSettings {
  monetization_mode: MonetizationMode;
  payment_required: boolean; // ON / OFF
  free_plan_enabled?: boolean; // Forfait gratuit autorisé ou non
  billing_frequency_required?: BillingFrequencyRequirement; // 'FLEXIBLE' | 'MONTHLY_ONLY' | 'YEARLY_ONLY'
  auto_suspend_unpaid?: boolean; // Bloquer automatiquement le restaurant en cas de défaut de paiement
  grace_period_days?: number; // Nombre de jours de grâce avant suspension
  free_trial_enabled: boolean;
  trial_duration_days: number; // 7, 14, 30 jours
  trial_behavior_on_expiry: 'downgrade_to_free' | 'require_payment';
  primary_currency: string; // FCFA, XOF, EUR, USD
  yearly_discount_percent: number; // ex: 20
  tax_rate_percent: number;
  active_payment_provider: PaymentProviderType;
  payment_mode: PaymentMode; // TEST ou PRODUCTION
  mock_payments_allowed: boolean; // Simulation autorisée en mode test
  
  // Paramètres directs Mobile Money (Prompt Maître #7)
  mobile_money_name?: string; // Nom du moyen de paiement (Wave, Orange Money, etc.)
  mobile_money_phone?: string; // Numéro Mobile Money récepteur
  mobile_money_link?: string; // Lien de paiement direct Mobile Money (ex: https://pay.wave.com/m/...)
  mobile_money_instructions?: string; // Consignes affichées au restaurant
  mobile_money_qr_url?: string; // QR code image de paiement optionnel
}

// 25. Feature Flags Globaux (Priment sur tous les plans)
export interface GlobalFeatureFlags {
  qr_codes: boolean;
  plans_and_billing: boolean;
  payments: boolean;
  custom_domains: boolean;
  reservations: boolean;
  reviews: boolean;
  promotions: boolean;
  coupons: boolean;
  gallery: boolean;
  advanced_analytics: boolean;
  whatsapp: boolean;
  multi_staff: boolean;
  pwa: boolean;
  remove_branding: boolean;
  custom_css: boolean;
  export_data: boolean;
  multiple_locations: boolean;
}

// 26. Paramètres Techniques & Sécurité SaaS (Niveau OWNER)
export interface SaasSettings {
  maintenance_mode: boolean;
  allow_new_registrations: boolean;
  require_email_verification: boolean;
  enforce_strong_passwords: boolean;
  owner_2fa_enabled: boolean;
  owner_pin_code: string; // Code PIN de secours à 6 chiffres
  owner_password?: string; // Mot de passe maître du Super Admin Propriétaire
  owner_email?: string; // Identifiant de connexion maître
  max_session_duration_hours: number;
  currency: string;
  tax_rate_percent: number;

  // Monétisation
  monetization: SaasMonetizationSettings;

  // Feature Flags globaux (contrôlés par le OWNER)
  feature_flags: GlobalFeatureFlags;

  // Préférences Branding stockées dans la table globale 'settings'
  branding?: SaasBranding;
  last_updated_at?: string;
}

// 19. Journal d'Audit (Audit Logs)
export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  target_type: 'RESTAURANT' | 'EMPLOYEE' | 'SETTINGS' | 'BRANDING' | 'SECURITY' | 'AUTH';
  target_name: string;
  details: string;
  created_at: string;
  ip_address?: string;
  status: 'SUCCESS' | 'DENIED' | 'WARNING';
}

// 27. Tickets de Support (Restaurant <-> Super Admin)
export interface SupportTicketMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'OWNER' | 'SAAS_EMPLOYEE' | 'RESTAURANT_OWNER' | 'RESTAURANT_STAFF';
  message: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  subject: string;
  category: 'TECHNIQUE' | 'FACTURATION' | 'MENU_SITE' | 'AUTRE';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages: SupportTicketMessage[];
  created_at: string;
  updated_at: string;
}

// 28. Réservations de table en restaurant
export interface RestaurantReservation {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  guests_count: number;
  date: string; // AAAA-MM-JJ
  time: string; // HH:mm
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  table_number?: string;
  created_at: string;
}

// 20. Résultat de Test de Sécurité (Audit & Compliance)
export interface SecurityTestResult {
  id: string;
  title: string;
  description: string;
  scenario: string;
  expected: 'ACCÈS REFUSÉ' | 'AUTORISÉ';
  actual: 'ACCÈS REFUSÉ' | 'AUTORISÉ';
  passed: boolean;
  details: string;
}
