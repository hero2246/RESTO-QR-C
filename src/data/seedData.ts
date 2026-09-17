import { 
  Restaurant, 
  Category, 
  Product, 
  RestaurantTable, 
  Order, 
  Profile, 
  SaasBranding, 
  SaasSettings, 
  SaasPlan, 
  SaasEmployee, 
  RestaurantStaffMember, 
  AuditLog,
  Subscription,
  PaymentProviderConfig,
  Invoice,
  CustomStaffPosition,
  AttendanceRecord,
  OperationalTask,
  RestaurantActivityEvent
} from '../types';
import { createDefaultWebsiteConfig } from './restaurantThemes';

// ==============================================================================
// 1. BRANDING GLOBAL DU SAAS (Configuré par le OWNER)
// ==============================================================================
export const INITIAL_SAAS_BRANDING: SaasBranding = {
  platform_name: 'RESTO QR',
  slogan: 'Scannez. Commandez. Savourez.',
  description: 'La solution SaaS tout-en-un de menu digital par QR code et commande en direct sur table pour restaurants, cafés et bars.',
  logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
  favicon_url: '/favicon.ico',
  website_url: 'https://restoqr.com',
  primary_color: '#ea580c', // Orange chaleureux
  secondary_color: '#0f172a', // Slate nuit
  accent_color: '#f59e0b', // Ambre éclatant
  button_color: '#ea580c',
  button_text_color: '#ffffff',
  background_color: '#fafaf9',
  text_color: '#1c1917',
  card_color: '#ffffff',
  footer_color: '#0f172a',
  header_color: '#ffffff',
  sidebar_color: '#0f172a',
  link_color: '#ea580c',
  font_family: 'Plus Jakarta Sans',
  font_size_base: 'md',
  border_radius: 'lg',
  button_style: 'rounded',
  card_style: 'bordered',
  shadow_level: 'md',
  max_width: '7xl',

  // Landing Page Hero
  hero_title: 'Scannez. Commandez. Savourez.',
  hero_subtitle: 'Offrez une expérience de commande fluide sur smartphone à vos clients. Réduisez le temps d’attente, augmentez le panier moyen et optimisez vos services en salle.',
  hero_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
  hero_cta_primary_text: 'Créer mon Restaurant (Essai Gratuit)',
  hero_cta_secondary_text: 'Tester le Menu Client',

  // Section Fonctionnalités & Avantages
  features_title: 'Tout ce dont un restaurant moderne a besoin',
  features_subtitle: 'Une solution clé en main, conçue pour fluidifier les heures de pointe et augmenter le ticket moyen.',
  advantages: [
    {
      title: 'QR Code Unique par Table',
      description: 'Vos clients scannent et accèdent à votre carte immédiatement. Le numéro de table est automatiquement rattaché à la commande.',
      icon: 'QrCode'
    },
    {
      title: 'Suivi Live & Compte à Rebours',
      description: 'Le client suit l\'avancement pas-à-pas (reçue, confirmée avec temps estimé, préparation, prête) avec alertes visuelles claires.',
      icon: 'Clock'
    },
    {
      title: 'Kanban Cuisine & Alertes Sonores',
      description: 'Les cuisiniers et serveurs reçoivent une notification sonore instantanée à chaque nouvelle commande et gèrent les étapes d\'un simple clic.',
      icon: 'BellRing'
    }
  ],
  testimonials: [
    {
      author: 'Amadou Diallo',
      role: 'Fondateur, Chez Alpha Dakar',
      content: 'Depuis l\'adoption de RESTO QR, notre ticket moyen a augmenté de 23% et le temps d\'attente des clients a été divisé par deux.',
      rating: 5
    },
    {
      author: 'Fatou Sow',
      role: 'Gérante, Dakar Gourmand',
      content: 'L\'interface est ultra simple et le site personnalisé avec notre propre nom de domaine donne une image très professionnelle.',
      rating: 5
    }
  ],
  pricing_title: 'Des forfaits pensés pour la rentabilité de votre établissement',
  pricing_subtitle: 'Commencez gratuitement, passez au niveau supérieur quand votre restaurant grandit.',

  contact_email: 'contact@restoqr.com',
  contact_phone: '+221 33 800 00 00',
  footer_text: '© RESTO QR SaaS. Tous droits réservés. Propulsé par une architecture multi-tenant isolée.',
  legal_notice: 'RESTO QR est une marque déposée. Solution hébergée en conformité avec les standards de protection des données.',
  legal_cgu: 'Conditions Générales d\'Utilisation de la plateforme RESTO QR. Les restaurants partenaires sont seuls responsables de leurs cartes, prix et commandes.',
  legal_privacy: 'Politique de Confidentialité conforme RGPD et protection des données à caractère personnel.',
  legal_mentions: 'Édité par RESTO QR SAS, plateforme technologique d\'intermédiation pour la restauration.',
};

// ==============================================================================
// 2. PARAMÈTRES TECHNIQUES & SÉCURITÉ SAAS (OWNER)
// ==============================================================================
export const INITIAL_SAAS_SETTINGS: SaasSettings = {
  maintenance_mode: false,
  allow_new_registrations: true,
  require_email_verification: false,
  enforce_strong_passwords: true,
  owner_2fa_enabled: true,
  owner_pin_code: '789456', // Code PIN secret à 6 chiffres pour accès OWNER sécurisé
  owner_password: 'Alphayayadiallo@12', // Mot de passe maître Super Admin officiel
  owner_email: 'dalpahayaya249@gmail.com',
  max_session_duration_hours: 24,
  currency: 'FCFA',
  tax_rate_percent: 0,
  
  // Paramètres de Monétisation
  monetization: {
    monetization_mode: 'FREE_AND_PRO', // FREE_ONLY, FREE_AND_PRO, PAID_REQUIRED
    payment_required: false, // OFF par défaut pour simplifier le onboarding ou configurable par le Super Admin
    free_trial_enabled: true,
    trial_duration_days: 14,
    trial_behavior_on_expiry: 'downgrade_to_free',
    primary_currency: 'FCFA',
    yearly_discount_percent: 20,
    tax_rate_percent: 0,
    active_payment_provider: 'Wave',
    payment_mode: 'TEST', // TEST ou PRODUCTION
    mock_payments_allowed: true,
    mobile_money_name: 'Wave / Orange Money',
    mobile_money_phone: '+221 77 842 19 20',
    mobile_money_link: 'https://pay.wave.com/m/resto-qr-pro-senegal',
    mobile_money_instructions: '1. Cliquez sur "Ouvrir le lien Mobile Money" ou effectuez le transfert vers notre numéro Wave/OM.\n2. Notez votre référence de transaction.\n3. Cliquez sur "J\'ai effectué le paiement" pour soumettre votre confirmation.',
    mobile_money_qr_url: '',
  },

  // Feature Flags globaux (Priorité absolue sur les plans)
  feature_flags: {
    qr_codes: true,
    plans_and_billing: true,
    payments: true,
    custom_domains: true,
    reservations: true,
    reviews: true,
    promotions: true,
    coupons: true,
    gallery: true,
    advanced_analytics: true,
    whatsapp: true,
    multi_staff: true,
    pwa: true,
    remove_branding: true,
    custom_css: true,
    export_data: true,
    multiple_locations: true,
  },

  // Préférences Branding stockées dans la table globale settings
  branding: INITIAL_SAAS_BRANDING,
  last_updated_at: new Date().toISOString(),
};

// ==============================================================================
// 3. PLANS SAAS DÉFAUT (FREE & PRO + ENTERPRISE)
// ==============================================================================
export const INITIAL_SAAS_PLANS: SaasPlan[] = [
  {
    id: 'FREE',
    name: 'FREE',
    price_monthly: 0,
    price_yearly: 0,
    description: 'Plan gratuit pour démarrer et tester la commande par QR code.',
    is_active: true,
    is_popular: false,
    display_order: 1,
    badge: 'Gratuit',
    color: '#64748b',
    max_products: 50,
    max_staff: 2,
    max_monthly_orders: 100,
    limits: {
      max_products: 50,
      max_categories: 10,
      max_staff: 2,
      max_monthly_orders: 100,
      max_pages: 3,
      max_images: 50,
      max_domains: 0,
      max_tables: 10,
      max_qr_codes: 1,
      max_gallery_images: 10,
      max_reservations: 0,
      max_storage_mb: 100,
    },
    feature_flags: {
      custom_domain: false,
      advanced_analytics: false,
      reservations: false,
      reviews: false,
      promotions: false,
      coupons: false,
      gallery: false,
      whatsapp: true,
      multi_staff: false,
      remove_branding: false,
      custom_css: false,
      advanced_qr: false,
      export_data: false,
      multiple_locations: false,
    },
    features: [
      'Jusqu’à 50 produits au menu',
      'Jusqu’à 10 catégories',
      '2 employés restaurant',
      '100 commandes mensuelles',
      'Site vitrine standard (3 pages)',
      '1 QR Code de table',
      'Support par email',
    ],
  },
  {
    id: 'PRO',
    name: 'PRO',
    price_monthly: 5000, // 5 000 FCFA / mois
    price_yearly: 50000, // 2 mois offerts
    description: 'La solution complète pour développer les ventes et fluidifier le service de votre restaurant.',
    is_active: true,
    is_popular: true,
    display_order: 2,
    badge: 'Recommandé',
    color: '#ea580c',
    max_products: -1, // Illimité
    max_staff: 10,
    max_monthly_orders: -1, // Illimité
    limits: {
      max_products: -1, // Illimité
      max_categories: -1, // Illimité
      max_staff: 10,
      max_monthly_orders: -1, // Illimité
      max_pages: -1,
      max_images: 500,
      max_domains: 5,
      max_tables: -1,
      max_qr_codes: -1,
      max_gallery_images: 50,
      max_reservations: -1,
      max_storage_mb: 1000,
    },
    feature_flags: {
      custom_domain: true,
      advanced_analytics: true,
      reservations: true,
      reviews: true,
      promotions: true,
      coupons: true,
      gallery: true,
      whatsapp: true,
      multi_staff: true,
      remove_branding: true,
      custom_css: true,
      advanced_qr: true,
      export_data: true,
      multiple_locations: true,
    },
    features: [
      'Produits et catégories illimités',
      'Commandes mensuelles illimitées',
      'Jusqu’à 10 employés (Serveurs, Cuisine)',
      'Nom de domaine personnalisé (.com, .sn)',
      'Suppression totale du branding SaaS (Marque Blanche)',
      'Statistiques avancées & rapports de vente',
      'Réservations en ligne & gestion des avis',
      'Galerie photos HD & promotions',
      'Support prioritaire WhatsApp 7j/7',
    ],
  },
];

// ==============================================================================
// 3.1 CONFIGURATION DES FOURNISSEURS DE PAIEMENT MODULAIRES
// ==============================================================================
export const INITIAL_PAYMENT_PROVIDERS: PaymentProviderConfig[] = [
  {
    id: 'prov-wave',
    name: 'Wave',
    enabled: true,
    is_active: true,
    mode: 'TEST',
    api_key_configured: true,
    masked_key: 'wv_live_••••••••••••89A2',
    currency: 'FCFA',
    instructions: 'Paiement instantané par QR Code ou numéro Wave Mobile Money.',
  },
  {
    id: 'prov-om',
    name: 'Orange Money',
    enabled: true,
    is_active: false,
    mode: 'TEST',
    api_key_configured: true,
    masked_key: 'om_sec_••••••••••••31C4',
    currency: 'FCFA',
    instructions: 'Validation par code OTP ou redirection Orange Money Web.',
  },
  {
    id: 'prov-stripe',
    name: 'Stripe',
    enabled: true,
    is_active: false,
    mode: 'TEST',
    api_key_configured: false,
    masked_key: 'sk_test_••••••••••••77EE',
    currency: 'EUR',
    instructions: 'Paiement par carte bancaire internationale Visa, Mastercard, AMEX.',
  },
  {
    id: 'prov-card',
    name: 'Carte bancaire',
    enabled: true,
    is_active: false,
    mode: 'TEST',
    api_key_configured: true,
    masked_key: 'cb_gw_••••••••••••5501',
    currency: 'FCFA',
    instructions: 'Passerelle carte bancaire sécurisée 3D-Secure.',
  },
];

// ==============================================================================
// 3.2 ABONNEMENTS DES RESTAURANTS
// ==============================================================================
export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-alpha',
    restaurant_id: 'resto-alpha',
    plan_id: 'PRO',
    status: 'ACTIVE',
    start_date: new Date(Date.now() - 30 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 335 * 86400000).toISOString(),
    billing_cycle: 'yearly',
    payment_status: 'PAID',
    payment_provider: 'Wave',
    transaction_id: 'WAVE-TX-9921448',
    auto_renew: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sub-dakar',
    restaurant_id: 'resto-dakar',
    plan_id: 'PRO',
    status: 'ACTIVE',
    start_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    billing_cycle: 'monthly',
    payment_status: 'PENDING_VERIFICATION',
    payment_provider: 'Wave',
    transaction_id: 'WAVE-SN-7849102',
    payment_reference: 'WAVE-SN-7849102',
    proof_notes: 'Transfert de 5 000 FCFA effectué via Wave par Babacar Diop à 11h45. Merci de valider notre formule Pro.',
    verification_requested_at: new Date(Date.now() - 45 * 60000).toISOString(),
    amount: 5000,
    currency: 'FCFA',
    auto_renew: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==============================================================================
// 3.3 HISTORIQUE DES FACTURES
// ==============================================================================
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1001',
    invoice_number: 'FAC-2026-001',
    restaurant_id: 'resto-alpha',
    restaurant_name: 'Chez Alpha',
    plan_id: 'PRO',
    plan_name: 'Restaurateur Pro (Annuel)',
    amount: 50000,
    currency: 'FCFA',
    billing_cycle: 'yearly',
    date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    status: 'PAID',
    payment_method: 'Wave Mobile Money',
  },
  {
    id: 'inv-1002',
    invoice_number: 'FAC-2026-002',
    restaurant_id: 'resto-alpha',
    restaurant_name: 'Chez Alpha',
    plan_id: 'PRO',
    plan_name: 'Restaurateur Pro (Renouvellement)',
    amount: 5000,
    currency: 'FCFA',
    billing_cycle: 'monthly',
    date: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
    status: 'PAID',
    payment_method: 'Orange Money',
  },
];

// ==============================================================================
// 4. EMPLOYÉS DE LA PLATEFORME SAAS (Gérés par le OWNER)
// ==============================================================================
export const INITIAL_SAAS_EMPLOYEES: SaasEmployee[] = [
  {
    id: 'saas-emp-1',
    name: 'Alpha Diop',
    email: 'alpha.support@restoqr.com',
    phone: '+221 77 100 20 30',
    role: 'SAAS_EMPLOYEE',
    permissions: [
      'saas.restaurants.view',
      'saas.analytics.view',
      'saas.users.view',
    ],
    is_active: true,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    last_login_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'saas-emp-2',
    name: 'Aminata Niane',
    email: 'aminata.ops@restoqr.com',
    phone: '+221 78 200 30 40',
    role: 'SAAS_EMPLOYEE',
    permissions: [
      'saas.restaurants.view',
      'saas.restaurants.manage',
      'saas.analytics.view',
      'saas.users.view',
    ],
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    last_login_at: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
];

// ==============================================================================
// 5. PROFILS UTILISATEURS DU SYSTÈME
// ==============================================================================
export const INITIAL_PROFILES: Profile[] = [
  // 1. OWNER DU SAAS (Niveau 1)
  {
    id: 'usr-owner-root',
    email: 'dalpahayaya249@gmail.com',
    name: 'Alpha Yaya Diallo (Super Admin & Propriétaire Fondateur)',
    role: 'OWNER',
    phone: '+221 77 000 00 00',
    is_active: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  // 2. EMPLOYÉ SAAS (Niveau 2)
  {
    id: 'usr-saas-emp-1',
    email: 'alpha.support@restoqr.com',
    name: 'Alpha Diop (Support)',
    role: 'SAAS_EMPLOYEE',
    phone: '+221 77 100 20 30',
    permissions: ['saas.restaurants.view', 'saas.analytics.view', 'saas.users.view'],
    is_active: true,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  // 3. RESTAURANT OWNER : Chez Alpha (Niveau 3)
  {
    id: 'usr-resto-alpha',
    email: 'alpha@restoqr.com',
    name: 'Amadou Diallo',
    role: 'RESTAURANT_OWNER',
    restaurant_id: 'resto-alpha',
    phone: '+221 77 123 45 67',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  // 4. RESTAURANT MANAGER : Chez Alpha (Niveau 4)
  {
    id: 'usr-staff-alpha-manager',
    email: 'manager@chezalpha.sn',
    name: 'Babacar Sy',
    role: 'RESTAURANT_MANAGER',
    staff_role: 'MANAGER',
    restaurant_id: 'resto-alpha',
    phone: '+221 77 333 44 55',
    permissions: ['orders.view', 'orders.manage', 'menu.view', 'menu.edit', 'tables.manage', 'analytics.view'],
    is_active: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  // 5. RESTAURANT STAFF : Serveuse (Niveau 5)
  {
    id: 'usr-staff-alpha-waiter',
    email: 'serveur@chezalpha.sn',
    name: 'Khadija Fall',
    role: 'RESTAURANT_STAFF',
    staff_role: 'WAITER',
    restaurant_id: 'resto-alpha',
    permissions: ['orders.view', 'orders.manage'],
    is_active: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  // 6. RESTAURANT STAFF : Chef Cuisine (Niveau 5)
  {
    id: 'usr-staff-alpha-kitchen',
    email: 'cuisine@chezalpha.sn',
    name: 'Chef Ousmane',
    role: 'RESTAURANT_STAFF',
    staff_role: 'KITCHEN',
    restaurant_id: 'resto-alpha',
    permissions: ['orders.view', 'orders.manage'],
    is_active: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  // 6.1 RESTAURANT STAFF : Caissier
  {
    id: 'usr-staff-alpha-cashier',
    email: 'caisse@chezalpha.sn',
    name: 'Aminata Diallo',
    role: 'RESTAURANT_STAFF',
    staff_role: 'CASHIER',
    restaurant_id: 'resto-alpha',
    permissions: ['orders.view', 'orders.manage'],
    is_active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  // 7. RESTAURANT OWNER : Dakar Gourmand (Niveau 3)
  {
    id: 'usr-resto-dakar',
    email: 'contact@dakargourmand.sn',
    name: 'Marième Ndiaye',
    role: 'RESTAURANT_OWNER',
    restaurant_id: 'resto-dakar',
    phone: '+221 78 987 65 43',
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  }
];

// ==============================================================================
// 6. EMPLOYÉS DES RESTAURANTS (GESTION COMPLÈTE & OPÉRATIONNELLE)
// ==============================================================================
export const INITIAL_RESTAURANT_STAFF: RestaurantStaffMember[] = [
  {
    id: 'staff-1',
    restaurant_id: 'resto-alpha',
    name: 'Babacar Sy',
    first_name: 'Babacar',
    last_name: 'Sy',
    email: 'manager@chezalpha.sn',
    phone: '+221 77 333 44 55',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'RESTAURANT_MANAGER',
    staff_role: 'MANAGER',
    position_title: 'Gérant d’Exploitation',
    station_label: 'Supervision Globale & Direction',
    shift_hours: 'Service Continu 10h-23h',
    birth_date: '1988-04-12',
    hire_date: '2023-01-15',
    salary: 450000,
    employment_status: 'ACTIVE',
    notes: 'Excellente gestion des plannings et du respect des règles d’hygiène HACCP.',
    invitation_code: 'MGR-7890',
    invitation_sent: true,
    permissions: [
      'orders.view', 'orders.manage', 'orders.cancel', 'orders.finish',
      'kitchen.view', 'kitchen.prepare', 'kitchen.ready',
      'cashier.view', 'cashier.manage', 'cashier.print', 'cashier.close',
      'tables.view', 'tables.manage',
      'menu.view', 'menu.create', 'menu.edit',
      'staff.view', 'staff.create', 'staff.edit', 'staff.presence', 'staff.tasks',
      'analytics.view', 'analytics.activity',
      'settings.edit'
    ],
    is_active: true,
    is_online: true,
    checked_in_at: new Date(Date.now() - 7200000).toISOString(),
    last_active_at: new Date(Date.now() - 120000).toISOString(),
    current_station: 'Supervision Globale',
    today_tasks_completed: 4,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'staff-2',
    restaurant_id: 'resto-alpha',
    name: 'Khadija Fall',
    first_name: 'Khadija',
    last_name: 'Fall',
    email: 'serveur@chezalpha.sn',
    phone: '+221 77 555 66 77',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'RESTAURANT_STAFF',
    staff_role: 'WAITER',
    position_title: 'Chef de Rang / Serveur',
    station_label: 'Salle & Rangs 1 à 8',
    shift_hours: 'Service Midi & Soir 11h-16h / 19h-23h',
    birth_date: '1995-08-23',
    hire_date: '2023-06-01',
    salary: 220000,
    employment_status: 'ACTIVE',
    notes: 'Très appréciée des clients, rapidité de service exemplaire.',
    invitation_code: 'WTR-4421',
    invitation_sent: true,
    permissions: [
      'orders.view', 'orders.manage', 'orders.finish',
      'tables.view', 'tables.manage'
    ],
    is_active: true,
    is_online: true,
    checked_in_at: new Date(Date.now() - 5400000).toISOString(),
    last_active_at: new Date(Date.now() - 300000).toISOString(),
    current_station: 'Salle & Terrasse',
    today_tasks_completed: 3,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'staff-3',
    restaurant_id: 'resto-alpha',
    name: 'Chef Ousmane',
    first_name: 'Ousmane',
    last_name: 'Sarr',
    email: 'cuisine@chezalpha.sn',
    phone: '+221 77 888 99 00',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    role: 'RESTAURANT_STAFF',
    staff_role: 'KITCHEN',
    position_title: 'Chef Cuisinier / KDS',
    station_label: 'Chaud, Grillades & Sauces',
    shift_hours: 'Service Continu 10h30-22h30',
    birth_date: '1985-11-04',
    hire_date: '2022-10-10',
    salary: 380000,
    employment_status: 'ACTIVE',
    notes: 'Responsable de la conformité des recettes et du stock frais.',
    invitation_code: 'KIT-9023',
    invitation_sent: true,
    permissions: [
      'kitchen.view', 'kitchen.prepare', 'kitchen.ready',
      'orders.view'
    ],
    is_active: true,
    is_online: true,
    checked_in_at: new Date(Date.now() - 3600000).toISOString(),
    last_active_at: new Date(Date.now() - 60000).toISOString(),
    current_station: 'Cuisine KDS',
    today_tasks_completed: 5,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'staff-4',
    restaurant_id: 'resto-alpha',
    name: 'Aminata Diallo',
    first_name: 'Aminata',
    last_name: 'Diallo',
    email: 'caisse@chezalpha.sn',
    phone: '+221 77 111 22 33',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'RESTAURANT_STAFF',
    staff_role: 'CASHIER',
    position_title: 'Caissière Principale',
    station_label: 'Guichet Caisse & TPE',
    shift_hours: '11h-21h',
    birth_date: '1998-02-18',
    hire_date: '2023-09-15',
    salary: 200000,
    employment_status: 'ACTIVE',
    notes: 'Tenue de caisse rigoureuse, aucun écart d’encaissement.',
    invitation_code: 'CSH-1102',
    invitation_sent: true,
    permissions: [
      'cashier.view', 'cashier.manage', 'cashier.print', 'cashier.close',
      'orders.view'
    ],
    is_active: true,
    is_online: true,
    checked_in_at: new Date(Date.now() - 1800000).toISOString(),
    last_active_at: new Date(Date.now() - 180000).toISOString(),
    current_station: 'Caisse Principale',
    today_tasks_completed: 2,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'staff-5',
    restaurant_id: 'resto-alpha',
    name: 'Moussa Kane',
    first_name: 'Moussa',
    last_name: 'Kane',
    email: 'plongeur@chezalpha.sn',
    phone: '+221 77 444 88 99',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'RESTAURANT_STAFF',
    staff_role: 'KITCHEN',
    position_title: 'Plongeur & Hygiène',
    station_label: 'Zone Plonge & Déchets',
    shift_hours: '12h-23h',
    birth_date: '1999-07-10',
    hire_date: '2024-02-01',
    salary: 170000,
    employment_status: 'ACTIVE',
    notes: 'Hygiène irréprochable et entretien rigoureux.',
    permissions: ['kitchen.view'],
    is_active: true,
    is_online: false,
    checked_in_at: new Date(Date.now() - 14400000).toISOString(),
    checked_out_at: new Date(Date.now() - 3600000).toISOString(),
    last_active_at: new Date(Date.now() - 3600000).toISOString(),
    today_tasks_completed: 3,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'staff-6',
    restaurant_id: 'resto-alpha',
    name: 'Awa Faye',
    first_name: 'Awa',
    last_name: 'Faye',
    email: 'patisserie@chezalpha.sn',
    phone: '+221 77 999 11 22',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    role: 'RESTAURANT_STAFF',
    staff_role: 'KITCHEN',
    position_title: 'Chef Pâtissière & Desserts',
    station_label: 'Poste Froid & Desserts',
    shift_hours: '08h-16h',
    birth_date: '1992-09-14',
    hire_date: '2023-11-20',
    salary: 280000,
    employment_status: 'ON_LEAVE',
    notes: 'En congé annuel jusqu’au 25 du mois.',
    permissions: ['kitchen.view', 'kitchen.prepare'],
    is_active: true,
    is_online: false,
    today_tasks_completed: 0,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  }
];

// ==============================================================================
// 6.1 POSTES PERSONNALISÉS & RÔLES SYSTÈME
// ==============================================================================
export const INITIAL_CUSTOM_POSITIONS: CustomStaffPosition[] = [
  {
    id: 'pos-1',
    restaurant_id: 'resto-alpha',
    name: 'Gérant d’Exploitation',
    default_role: 'MANAGER',
    default_permissions: ['orders.view', 'orders.manage', 'menu.view', 'menu.edit', 'tables.manage', 'staff.view', 'staff.create', 'staff.edit', 'staff.presence', 'staff.tasks', 'analytics.view'],
    description: 'Gestion globale du restaurant, plannings, encadrement et approvisionnements.',
    is_system: true
  },
  {
    id: 'pos-2',
    restaurant_id: 'resto-alpha',
    name: 'Chef Cuisinier (KDS)',
    default_role: 'KITCHEN',
    default_permissions: ['kitchen.view', 'kitchen.prepare', 'kitchen.ready', 'orders.view'],
    description: 'Gestion des préparations chaudes, conformité recettes et écran KDS.',
    is_system: true
  },
  {
    id: 'pos-3',
    restaurant_id: 'resto-alpha',
    name: 'Chef de Rang / Serveur',
    default_role: 'WAITER',
    default_permissions: ['orders.view', 'orders.manage', 'orders.finish', 'tables.view', 'tables.manage'],
    description: 'Accueil des clients, prise de commandes et service aux tables.',
    is_system: true
  },
  {
    id: 'pos-4',
    restaurant_id: 'resto-alpha',
    name: 'Caissier / Encaissement',
    default_role: 'CASHIER',
    default_permissions: ['cashier.view', 'cashier.manage', 'cashier.print', 'cashier.close', 'orders.view'],
    description: 'Encaissements espèces, cartes et mobile money, clôtures de caisse.',
    is_system: true
  },
  {
    id: 'pos-5',
    restaurant_id: 'resto-alpha',
    name: 'Responsable Salle',
    default_role: 'WAITER',
    default_permissions: ['orders.view', 'orders.manage', 'tables.view', 'tables.manage', 'staff.presence'],
    description: 'Coordination de l’équipe de salle et attribution des rangs.',
    is_system: false
  },
  {
    id: 'pos-6',
    restaurant_id: 'resto-alpha',
    name: 'Plongeur & Hygiène',
    default_role: 'KITCHEN',
    default_permissions: ['kitchen.view'],
    description: 'Entretien de la vaisselle, des équipements de cuisine et normes HACCP.',
    is_system: false
  },
  {
    id: 'pos-7',
    restaurant_id: 'resto-alpha',
    name: 'Chef Pâtissier',
    default_role: 'KITCHEN',
    default_permissions: ['kitchen.view', 'kitchen.prepare', 'menu.view'],
    description: 'Confection des desserts artisanaux, glaces et pâtisseries fines.',
    is_system: false
  },
  {
    id: 'pos-8',
    restaurant_id: 'resto-alpha',
    name: 'Livreur Coursier',
    default_role: 'WAITER',
    default_permissions: ['orders.view', 'orders.manage'],
    description: 'Livraisons à domicile et commandes à emporter.',
    is_system: false
  }
];

// Helper date format YYYY-MM-DD
const getFormattedDate = (daysAgo: number = 0): string => {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return d.toISOString().split('T')[0];
};

// ==============================================================================
// 6.2 REGISTRE DE PRÉSENCE (ATTENDANCE RECORDS)
// ==============================================================================
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Aujourd'hui
  {
    id: 'att-101',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-1',
    staff_name: 'Babacar Sy',
    staff_role: 'MANAGER',
    position_title: 'Gérant d’Exploitation',
    date: getFormattedDate(0),
    status: 'PRESENT',
    check_in_time: '10:00',
    check_out_time: undefined,
    hours_worked: 7.5,
    notes: 'Pointage ponctuel, supervision ouverture.',
    tasks_count: 4,
    recorded_by: 'Babacar Sy (Pointage direct)',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'att-102',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-2',
    staff_name: 'Khadija Fall',
    staff_role: 'WAITER',
    position_title: 'Chef de Rang / Serveur',
    date: getFormattedDate(0),
    status: 'PRESENT',
    check_in_time: '10:45',
    check_out_time: undefined,
    hours_worked: 6.8,
    notes: 'Arrivée pour mise en place salle.',
    tasks_count: 3,
    recorded_by: 'Khadija Fall (Pointage direct)',
    created_at: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: 'att-103',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-3',
    staff_name: 'Chef Ousmane',
    staff_role: 'KITCHEN',
    position_title: 'Chef Cuisinier / KDS',
    date: getFormattedDate(0),
    status: 'PRESENT',
    check_in_time: '10:30',
    check_out_time: undefined,
    hours_worked: 7.0,
    notes: 'Réception arrivages viandes fraîches.',
    tasks_count: 5,
    recorded_by: 'Chef Ousmane (Pointage direct)',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'att-104',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-4',
    staff_name: 'Aminata Diallo',
    staff_role: 'CASHIER',
    position_title: 'Caissière Principale',
    date: getFormattedDate(0),
    status: 'LATE',
    check_in_time: '11:35',
    check_out_time: undefined,
    hours_worked: 5.5,
    notes: 'Retard de 35 min justifié (embouteillage pont)',
    tasks_count: 2,
    recorded_by: 'Babacar Sy (Gérant)',
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'att-105',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-5',
    staff_name: 'Moussa Kane',
    staff_role: 'KITCHEN',
    position_title: 'Plongeur & Hygiène',
    date: getFormattedDate(0),
    status: 'PRESENT',
    check_in_time: '11:00',
    check_out_time: '15:30',
    hours_worked: 4.5,
    notes: 'Fin du shift midi, retour prévu pour le service soir.',
    tasks_count: 3,
    recorded_by: 'Babacar Sy (Gérant)',
    created_at: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'att-106',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-6',
    staff_name: 'Awa Faye',
    staff_role: 'KITCHEN',
    position_title: 'Chef Pâtissière & Desserts',
    date: getFormattedDate(0),
    status: 'ON_LEAVE',
    notes: 'Congé annuel validé par la direction.',
    tasks_count: 0,
    recorded_by: 'Direction',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  // Hier
  {
    id: 'att-090',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-1',
    staff_name: 'Babacar Sy',
    staff_role: 'MANAGER',
    position_title: 'Gérant d’Exploitation',
    date: getFormattedDate(1),
    status: 'PRESENT',
    check_in_time: '09:55',
    check_out_time: '23:15',
    hours_worked: 13.3,
    tasks_count: 6,
    recorded_by: 'Système',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'att-091',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-2',
    staff_name: 'Khadija Fall',
    staff_role: 'WAITER',
    position_title: 'Chef de Rang / Serveur',
    date: getFormattedDate(1),
    status: 'PRESENT',
    check_in_time: '10:50',
    check_out_time: '23:00',
    hours_worked: 12.1,
    tasks_count: 5,
    recorded_by: 'Système',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'att-092',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-3',
    staff_name: 'Chef Ousmane',
    staff_role: 'KITCHEN',
    position_title: 'Chef Cuisinier / KDS',
    date: getFormattedDate(1),
    status: 'PRESENT',
    check_in_time: '10:15',
    check_out_time: '22:45',
    hours_worked: 12.5,
    tasks_count: 7,
    recorded_by: 'Système',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'att-093',
    restaurant_id: 'resto-alpha',
    staff_id: 'staff-4',
    staff_name: 'Aminata Diallo',
    staff_role: 'CASHIER',
    position_title: 'Caissière Principale',
    date: getFormattedDate(1),
    status: 'PRESENT',
    check_in_time: '11:00',
    check_out_time: '22:30',
    hours_worked: 11.5,
    tasks_count: 4,
    recorded_by: 'Système',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

// ==============================================================================
// 6.3 TÂCHES OPÉRATIONNELLES (OPERATIONAL TASKS)
// ==============================================================================
export const INITIAL_OPERATIONAL_TASKS: OperationalTask[] = [
  {
    id: 'tsk-001',
    restaurant_id: 'resto-alpha',
    title: 'Nettoyer et désinfecter la terrasse extérieure',
    description: 'Balayage, lavage au jet et désinfection des tables en terrasse avant le rush du midi.',
    assigned_to_id: 'staff-2',
    assigned_to_name: 'Khadija Fall',
    assigned_role: 'WAITER',
    position_title: 'Chef de Rang / Serveur',
    date: getFormattedDate(0),
    due_time: '11:30',
    priority: 'HIGH',
    category: 'CLEANING',
    status: 'DONE',
    proof_comment: 'Terrasse et tables désinfectées à 11h15, parasols ouverts.',
    completed_at: new Date(Date.now() - 3600000).toISOString(),
    completed_by_id: 'staff-2',
    completed_by_name: 'Khadija Fall',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'tsk-002',
    restaurant_id: 'resto-alpha',
    title: 'Vérifier la température des chambres froides et congélateurs',
    description: 'Relever les températures sur la fiche de contrôle HACCP (+2°C positif / -18°C négatif).',
    assigned_to_id: 'staff-3',
    assigned_to_name: 'Chef Ousmane',
    assigned_role: 'KITCHEN',
    position_title: 'Chef Cuisinier / KDS',
    date: getFormattedDate(0),
    due_time: '11:00',
    priority: 'URGENT',
    category: 'KITCHEN',
    status: 'DONE',
    proof_comment: 'Températures conformes : Chambre 1 à +2.5°C, Congélateur à -19°C. Fiche signée.',
    completed_at: new Date(Date.now() - 5400000).toISOString(),
    completed_by_id: 'staff-3',
    completed_by_name: 'Chef Ousmane',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'tsk-003',
    restaurant_id: 'resto-alpha',
    title: 'Approvisionnement rouleaux TPE et fond de caisse initial',
    description: 'Comptage de la caisse à 50 000 FCFA et rechargement des rouleaux thermiques.',
    assigned_to_id: 'staff-4',
    assigned_to_name: 'Aminata Diallo',
    assigned_role: 'CASHIER',
    position_title: 'Caissière Principale',
    date: getFormattedDate(0),
    due_time: '12:00',
    priority: 'NORMAL',
    category: 'CASHIER',
    status: 'DONE',
    proof_comment: 'Fond de caisse validé à 50 000 FCFA, 5 rouleaux d’avance installés.',
    completed_at: new Date(Date.now() - 1200000).toISOString(),
    completed_by_id: 'staff-4',
    completed_by_name: 'Aminata Diallo',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'tsk-004',
    restaurant_id: 'resto-alpha',
    title: 'Préparer la marinade secrète pour Dibiterie d’Agneau',
    description: 'Préparation de 15 kg d’agneau mariné aux épices locales et oignons caramélisés.',
    assigned_to_id: 'staff-3',
    assigned_to_name: 'Chef Ousmane',
    assigned_role: 'KITCHEN',
    position_title: 'Chef Cuisinier / KDS',
    date: getFormattedDate(0),
    due_time: '16:00',
    priority: 'HIGH',
    category: 'KITCHEN',
    status: 'IN_PROGRESS',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'tsk-005',
    restaurant_id: 'resto-alpha',
    title: 'Inventaire des stocks de boissons fraîches & jus maison',
    description: 'Compter les bouteilles de Bissap, Bouye et sodas en réserve bar.',
    assigned_to_id: 'staff-2',
    assigned_to_name: 'Khadija Fall',
    assigned_role: 'WAITER',
    position_title: 'Chef de Rang / Serveur',
    date: getFormattedDate(0),
    due_time: '18:00',
    priority: 'NORMAL',
    category: 'STOCK',
    status: 'TODO',
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'tsk-006',
    restaurant_id: 'resto-alpha',
    title: 'Clôture de caisse Z et rapport financier du soir',
    description: 'Édition du ticket Z, contrôle des paiements Wave/Orange Money et remise coffre.',
    assigned_to_id: 'staff-4',
    assigned_to_name: 'Aminata Diallo',
    assigned_role: 'CASHIER',
    position_title: 'Caissière Principale',
    date: getFormattedDate(0),
    due_time: '23:30',
    priority: 'URGENT',
    category: 'CASHIER',
    status: 'TODO',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'tsk-007',
    restaurant_id: 'resto-alpha',
    title: 'Nettoyage haute pression des filtres de hotte de cuisine',
    description: 'Démontage des filtres inox, trempage dégraissant et remontage avant fermeture.',
    assigned_to_id: 'staff-5',
    assigned_to_name: 'Moussa Kane',
    assigned_role: 'KITCHEN',
    position_title: 'Plongeur & Hygiène',
    date: getFormattedDate(0),
    due_time: '23:00',
    priority: 'NORMAL',
    category: 'CLEANING',
    status: 'TODO',
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

// ==============================================================================
// 6.4 JOURNAL D'ACTIVITÉ CHRONOLOGIQUE (ACTIVITY TIMELINE)
// ==============================================================================
export const INITIAL_RESTAURANT_ACTIVITIES: RestaurantActivityEvent[] = [
  {
    id: 'act-001',
    restaurant_id: 'resto-alpha',
    user_name: 'Babacar Sy',
    user_role: 'RESTAURANT_MANAGER',
    action: 'POINTAGE_ARRIVEE',
    target: 'Poste Supervision Globale',
    category: 'ATTENDANCE',
    date: getFormattedDate(0),
    time: '10:00',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: 'Prise de poste effectuée à l’heure par le Gérant.'
  },
  {
    id: 'act-002',
    restaurant_id: 'resto-alpha',
    user_name: 'Chef Ousmane',
    user_role: 'RESTAURANT_STAFF',
    action: 'POINTAGE_ARRIVEE',
    target: 'Poste Cuisine KDS',
    category: 'ATTENDANCE',
    date: getFormattedDate(0),
    time: '10:30',
    timestamp: new Date(Date.now() - 6000000).toISOString(),
    details: 'Chef Ousmane a démarré son service en cuisine.'
  },
  {
    id: 'act-003',
    restaurant_id: 'resto-alpha',
    user_name: 'Chef Ousmane',
    user_role: 'RESTAURANT_STAFF',
    action: 'TACHE_TERMINEE',
    target: 'Vérifier la température des chambres froides',
    category: 'TASK',
    date: getFormattedDate(0),
    time: '10:55',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    details: 'Preuve validée : relevé HACCP conforme (+2.5°C / -19°C).'
  },
  {
    id: 'act-004',
    restaurant_id: 'resto-alpha',
    user_name: 'Khadija Fall',
    user_role: 'RESTAURANT_STAFF',
    action: 'POINTAGE_ARRIVEE',
    target: 'Poste Salle & Rangs 1 à 8',
    category: 'ATTENDANCE',
    date: getFormattedDate(0),
    time: '10:45',
    timestamp: new Date(Date.now() - 5000000).toISOString(),
    details: 'Prise de poste de service en salle.'
  },
  {
    id: 'act-005',
    restaurant_id: 'resto-alpha',
    user_name: 'Khadija Fall',
    user_role: 'RESTAURANT_STAFF',
    action: 'TACHE_TERMINEE',
    target: 'Nettoyer et désinfecter la terrasse extérieure',
    category: 'TASK',
    date: getFormattedDate(0),
    time: '11:15',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: 'Terrasse préparée pour le service du midi.'
  },
  {
    id: 'act-006',
    restaurant_id: 'resto-alpha',
    user_name: 'Client Table 4',
    user_role: 'CUSTOMER',
    action: 'NOUVELLE_COMMANDE',
    target: 'Commande #CMD-1048 (13 000 FCFA)',
    category: 'ORDER',
    date: getFormattedDate(0),
    time: '12:10',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    details: '2x BURGER CLASSIC, 2x JUS DE BISSAP.'
  },
  {
    id: 'act-007',
    restaurant_id: 'resto-alpha',
    user_name: 'Aminata Diallo',
    user_role: 'RESTAURANT_STAFF',
    action: 'POINTAGE_ARRIVEE',
    target: 'Guichet Caisse & TPE',
    category: 'ATTENDANCE',
    date: getFormattedDate(0),
    time: '11:35',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    details: 'Pointage avec retard justifié de 35 min.'
  },
  {
    id: 'act-008',
    restaurant_id: 'resto-alpha',
    user_name: 'Aminata Diallo',
    user_role: 'RESTAURANT_STAFF',
    action: 'TACHE_TERMINEE',
    target: 'Approvisionnement rouleaux TPE et fond de caisse initial',
    category: 'TASK',
    date: getFormattedDate(0),
    time: '11:50',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    details: 'Fond de caisse 50 000 FCFA validé.'
  }
];

// ==============================================================================
// 7. RESTAURANTS INSCRITS (TENANTS)
// ==============================================================================
export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'resto-alpha',
    name: 'Chez Alpha',
    slug: 'chez-alpha',
    owner_name: 'Amadou Diallo',
    email: 'alpha@restoqr.com',
    phone: '+221 77 123 45 67',
    address: 'Almadies, Route de la Corniche Ouest',
    city: 'Dakar',
    country: 'Sénégal',
    description: 'Cuisine urbaine & grillades raffinées. Le meilleur des burgers gourmets, brochettes braisées et jus naturels.',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    cover_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    primary_color: '#ea580c', // Orange-ambre chaleureux
    secondary_color: '#0f172a', // Slate dark
    status: 'ACTIVE',
    plan_id: 'PRO',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    hours: 'Mar - Dim : 12h00 - 23h30',
    instagram: '@chez_alpha_dakar',
    facebook: 'chezalphadakar',
    wifi_name: 'ChezAlpha_Guest',
    wifi_password: 'bienvenuechezalpha',
    subdomain: 'chez-alpha',
    custom_domain: 'chezalpha.com',
    domain_status: 'CONNECTED',
    featured_product_ids: ['prod-alpha-1', 'prod-alpha-3'],
  },
  {
    id: 'resto-dakar',
    name: 'Le Dakar Gourmand',
    slug: 'dakar-gourmand',
    owner_name: 'Marième Ndiaye',
    email: 'contact@dakargourmand.sn',
    phone: '+221 78 987 65 43',
    address: 'Plateau, Rue Carnot x Victor Hugo',
    city: 'Dakar',
    country: 'Sénégal',
    description: 'Gastronomie sénégalaise authentique et fusion moderne au cœur du Plateau dakarois.',
    logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
    cover_image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&auto=format&fit=crop&q=80',
    primary_color: '#059669', // Emerald
    secondary_color: '#18181b', // Zinc
    status: 'ACTIVE',
    plan_id: 'FREE',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    hours: 'Lun - Sam : 11h30 - 23h00',
    instagram: '@dakargourmand',
    subdomain: 'dakar-gourmand',
    custom_domain: 'dakargourmand.sn',
    domain_status: 'PENDING',
    featured_product_ids: ['prod-dakar-1'],
  }
];

// ==============================================================================
// 8. CATÉGORIES DE MENU
// ==============================================================================
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-alpha-1',
    restaurant_id: 'resto-alpha',
    name: 'Burgers Gourmets',
    order: 1,
    is_visible: true,
  },
  {
    id: 'cat-alpha-2',
    restaurant_id: 'resto-alpha',
    name: 'Plats & Grillades',
    order: 2,
    is_visible: true,
  },
  {
    id: 'cat-alpha-3',
    restaurant_id: 'resto-alpha',
    name: 'Boissons & Jus Frais',
    order: 3,
    is_visible: true,
  },
  {
    id: 'cat-alpha-4',
    restaurant_id: 'resto-alpha',
    name: 'Desserts',
    order: 4,
    is_visible: true,
  },
  // Dakar gourmand categories
  {
    id: 'cat-dakar-1',
    restaurant_id: 'resto-dakar',
    name: 'Spécialités Terroir',
    order: 1,
    is_visible: true,
  },
  {
    id: 'cat-dakar-2',
    restaurant_id: 'resto-dakar',
    name: 'Boissons Fraîches',
    order: 2,
    is_visible: true,
  }
];

// ==============================================================================
// 9. PRODUITS DU MENU
// ==============================================================================
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-alpha-1',
    restaurant_id: 'resto-alpha',
    category_id: 'cat-alpha-1',
    name: 'BURGER CLASSIC',
    description: 'Pain brioché artisanal, steak pur bœuf façonné sur place, salade croquante, tomate fraîche et sauce signature.',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    options: [
      { id: 'opt-1', name: 'Fromage cheddar fondu supplémentaire', price: 500 },
      { id: 'opt-2', name: 'Portion de frites maison croustillantes', price: 1000 },
      { id: 'opt-3', name: 'Sauce spéciale secrète', price: 300 },
    ],
  },
  {
    id: 'prod-alpha-2',
    restaurant_id: 'resto-alpha',
    category_id: 'cat-alpha-1',
    name: 'SMASH BURGER BACON & CHEDDAR',
    description: 'Double smash steak caramélisé, double cheddar coulant, bacon grillé, oignons confits au miel.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    options: [
      { id: 'opt-smash-1', name: 'Steak supplémentaire', price: 1500 },
      { id: 'opt-smash-2', name: 'Frites de patates douces', price: 1200 },
    ],
  },
  {
    id: 'prod-alpha-3',
    restaurant_id: 'resto-alpha',
    category_id: 'cat-alpha-2',
    name: 'BROCHETTES DE LOTTE GRILLÉE',
    description: 'Morceaux de lotte fraîche marinés aux herbes locales, poivrons rôtis, servis avec aloco doré et sauce chien.',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    options: [
      { id: 'opt-lotte-1', name: 'Double portion Aloco', price: 1000 },
      { id: 'opt-lotte-2', name: 'Piment maison piquant', price: 300 },
    ],
  },
  {
    id: 'prod-alpha-4',
    restaurant_id: 'resto-alpha',
    category_id: 'cat-alpha-2',
    name: 'DIBITERIE D’AGNEAU BRAISÉ',
    description: 'Morceaux tendres de gigot et côtelettes d’agneau braisés au feu de bois, oignons moutardés relevés.',
    price: 6000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    options: [
      { id: 'opt-dibi-1', name: 'Extra oignons braisés', price: 500 },
      { id: 'opt-dibi-2', name: 'Frites ou Aloco', price: 1000 },
    ],
  },
  {
    id: 'prod-alpha-5',
    restaurant_id: 'resto-alpha',
    category_id: 'cat-alpha-3',
    name: 'JUS DE BISSAP MAISON & MENTHE',
    description: 'Fleurs d’hibiscus fraîches infusées, menthe fraîche cueillie du jardin et pointe de vanille.',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    options: [],
  },
  {
    id: 'prod-alpha-6',
    restaurant_id: 'resto-alpha',
    category_id: 'cat-alpha-3',
    name: 'JUS DE BOUYE (PAIN DE SINGE)',
    description: 'Nectar onctueux et rafraîchissant de fruit de baobab parfumé à la muscade et fleur d’oranger.',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    options: [],
  },
  {
    id: 'prod-alpha-7',
    restaurant_id: 'resto-alpha',
    category_id: 'cat-alpha-4',
    name: 'FONDANT CHOCOLAT NOIR & GLACE VANILLE',
    description: 'Cœur coulant au chocolat noir 70%, crumble de cacao et boule de glace vanille Bourbon.',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    options: [
      { id: 'opt-fond-1', name: 'Boule de glace vanille supplémentaire', price: 800 },
    ],
  },
  // Dakar gourmand product
  {
    id: 'prod-dakar-1',
    restaurant_id: 'resto-dakar',
    category_id: 'cat-dakar-1',
    name: 'THIÉBOUDIENNE PENDASENGHOR',
    description: 'Le célèbre riz au poisson rouge sénégalais mijoté aux légumes du pays, sauce nététou et tamarin.',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    options: [],
  }
];

// ==============================================================================
// 10. TABLES DE RESTAURANT
// ==============================================================================
export const INITIAL_TABLES: RestaurantTable[] = [
  { id: 'tbl-alpha-1', restaurant_id: 'resto-alpha', name: 'Table 1', is_active: true },
  { id: 'tbl-alpha-2', restaurant_id: 'resto-alpha', name: 'Table 2', is_active: true },
  { id: 'tbl-alpha-3', restaurant_id: 'resto-alpha', name: 'Table 3', is_active: true },
  { id: 'tbl-alpha-4', restaurant_id: 'resto-alpha', name: 'Table 4', is_active: true },
  { id: 'tbl-alpha-5', restaurant_id: 'resto-alpha', name: 'Table 5', is_active: true },
  { id: 'tbl-alpha-6', restaurant_id: 'resto-alpha', name: 'Table 6 (Terrasse)', is_active: true },
  { id: 'tbl-alpha-7', restaurant_id: 'resto-alpha', name: 'Table 7 (Salon VIP)', is_active: true },
  { id: 'tbl-dakar-1', restaurant_id: 'resto-dakar', name: 'Table 1', is_active: true },
  { id: 'tbl-dakar-2', restaurant_id: 'resto-dakar', name: 'Table 2', is_active: true },
];

// ==============================================================================
// 11. COMMANDES INITIALES
// ==============================================================================
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1048',
    order_number: '#CMD-1048',
    restaurant_id: 'resto-alpha',
    table_number: '4',
    customer_name: 'Moussa Diop',
    customer_phone: '+221 77 450 11 22',
    customer_note: 'Sans oignons, bien cuit s’il vous plaît',
    items: [
      {
        product_id: 'prod-alpha-1',
        product_name: 'BURGER CLASSIC',
        quantity: 2,
        unit_price: 3500,
        selected_options: [
          { id: 'opt-1', name: 'Fromage cheddar fondu supplémentaire', price: 500 },
          { id: 'opt-2', name: 'Portion de frites maison croustillantes', price: 1000 },
        ],
        subtotal: 10000,
      },
      {
        product_id: 'prod-alpha-5',
        product_name: 'JUS DE BISSAP MAISON & MENTHE',
        quantity: 2,
        unit_price: 1500,
        selected_options: [],
        subtotal: 3000,
      }
    ],
    total_amount: 13000,
    status: 'NEW',
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: 'ord-1047',
    order_number: '#CMD-1047',
    restaurant_id: 'resto-alpha',
    table_number: '5',
    customer_name: 'Aïssatou Ba',
    items: [
      {
        product_id: 'prod-alpha-2',
        product_name: 'SMASH BURGER BACON & CHEDDAR',
        quantity: 1,
        unit_price: 4500,
        selected_options: [{ id: 'opt-smash-2', name: 'Frites de patates douces', price: 1200 }],
        subtotal: 5700,
      },
      {
        product_id: 'prod-alpha-6',
        product_name: 'JUS DE BOUYE (PAIN DE SINGE)',
        quantity: 1,
        unit_price: 1800,
        selected_options: [],
        subtotal: 1800,
      }
    ],
    total_amount: 7500,
    status: 'CONFIRMED',
    estimated_minutes: 20,
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
    confirmed_at: new Date(Date.now() - 11 * 60000).toISOString(),
  },
  {
    id: 'ord-1046',
    order_number: '#CMD-1046',
    restaurant_id: 'resto-alpha',
    table_number: '2',
    customer_name: 'Cheikh Ndiaye',
    items: [
      {
        product_id: 'prod-alpha-3',
        product_name: 'BROCHETTES DE LOTTE GRILLÉE',
        quantity: 1,
        unit_price: 6500,
        selected_options: [{ id: 'opt-lotte-1', name: 'Double portion Aloco', price: 1000 }],
        subtotal: 7500,
      }
    ],
    total_amount: 7500,
    status: 'PREPARING',
    estimated_minutes: 25,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    confirmed_at: new Date(Date.now() - 22 * 60000).toISOString(),
  },
  {
    id: 'ord-1045',
    order_number: '#CMD-1045',
    restaurant_id: 'resto-alpha',
    table_number: '7',
    customer_name: 'Fatou Sow',
    items: [
      {
        product_id: 'prod-alpha-4',
        product_name: 'DIBITERIE D’AGNEAU BRAISÉ',
        quantity: 2,
        unit_price: 6000,
        selected_options: [],
        subtotal: 12000,
      }
    ],
    total_amount: 12000,
    status: 'READY',
    created_at: new Date(Date.now() - 38 * 60000).toISOString(),
    confirmed_at: new Date(Date.now() - 35 * 60000).toISOString(),
    ready_at: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 'ord-1044',
    order_number: '#CMD-1044',
    restaurant_id: 'resto-alpha',
    table_number: '1',
    customer_name: 'Ibrahima Fall',
    items: [
      {
        product_id: 'prod-alpha-1',
        product_name: 'BURGER CLASSIC',
        quantity: 1,
        unit_price: 3500,
        selected_options: [],
        subtotal: 3500,
      }
    ],
    total_amount: 3500,
    status: 'COMPLETED',
    created_at: new Date(Date.now() - 85 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 30 * 60000).toISOString(),
  }
];

// ==============================================================================
// 12. JOURNAL D'AUDIT INITIAL (AUDIT LOGS)
// ==============================================================================
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    user_id: 'usr-owner-root',
    user_name: 'Propriétaire Fondateur RESTO QR',
    user_role: 'OWNER',
    action: 'INITIALISATION_PLATEFORME',
    target_type: 'SETTINGS',
    target_name: 'Configuration RESTO QR SaaS',
    details: 'Initialisation de l’instance SaaS multi-tenant et des clés cryptographiques de session.',
    status: 'SUCCESS',
    ip_address: '197.234.219.12',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'log-002',
    user_id: 'usr-owner-root',
    user_name: 'Propriétaire Fondateur RESTO QR',
    user_role: 'OWNER',
    action: 'CREATION_EMPLOYE_SAAS',
    target_type: 'EMPLOYEE',
    target_name: 'Alpha Diop (alpha.support@restoqr.com)',
    details: 'Attribution des permissions : saas.restaurants.view, saas.analytics.view, saas.users.view',
    status: 'SUCCESS',
    ip_address: '197.234.219.12',
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 'log-003',
    user_id: 'usr-resto-alpha',
    user_name: 'Amadou Diallo',
    user_role: 'RESTAURANT_OWNER',
    action: 'INSCRIPTION_RESTAURANT',
    target_type: 'RESTAURANT',
    target_name: 'Chez Alpha (resto-alpha)',
    details: 'Création du tenant, activation du plan Restaurateur PRO et génération du QR code de table.',
    status: 'SUCCESS',
    ip_address: '41.82.170.85',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'log-004',
    user_id: 'usr-owner-root',
    user_name: 'Propriétaire Fondateur RESTO QR',
    user_role: 'OWNER',
    action: 'MISE_A_JOUR_SECURITE',
    target_type: 'SECURITY',
    target_name: 'Politique 2FA & PIN de secours',
    details: 'Activation du 2FA obligatoire pour le compte OWNER et renouvellement du code PIN d’urgence.',
    status: 'SUCCESS',
    ip_address: '197.234.219.12',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];
