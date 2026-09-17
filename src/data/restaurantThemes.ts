import { Restaurant, RestaurantThemeId, RestaurantWebsiteConfig, RestaurantHoursDay } from '../types';

export interface ThemePreset {
  id: RestaurantThemeId;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    surface: string;
    button_text: string;
  };
  typography: {
    font_family: string;
    heading_font: string;
  };
  style: {
    button_radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    card_radius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hero_style: 'clean' | 'image_cover' | 'split' | 'minimal';
  };
}

export const RESTAURANT_THEMES: Record<RestaurantThemeId, ThemePreset> = {
  classic: {
    id: 'classic',
    name: 'Restaurant Classique',
    description: 'Ambiance feutrée, élégance intemporelle et tonalités bordeaux & crème.',
    colors: {
      primary: '#881337', // Rose/Vin profond
      secondary: '#4c0519',
      accent: '#d97706', // Or ambré
      background: '#fafaf9',
      text: '#1c1917',
      surface: '#ffffff',
      button_text: '#ffffff',
    },
    typography: {
      font_family: 'system-ui, sans-serif',
      heading_font: 'serif',
    },
    style: {
      button_radius: 'md',
      card_radius: 'lg',
      hero_style: 'image_cover',
    },
  },
  modern: {
    id: 'modern',
    name: 'Restaurant Moderne',
    description: 'Design contemporain et épuré avec accents orange chaleureux.',
    colors: {
      primary: '#ea580c',
      secondary: '#0f172a',
      accent: '#f59e0b',
      background: '#f8fafc',
      text: '#0f172a',
      surface: '#ffffff',
      button_text: '#ffffff',
    },
    typography: {
      font_family: 'Plus Jakarta Sans, sans-serif',
      heading_font: 'Outfit, sans-serif',
    },
    style: {
      button_radius: 'lg',
      card_radius: 'xl',
      hero_style: 'split',
    },
  },
  fastfood: {
    id: 'fastfood',
    name: 'Fast-Food & Burger',
    description: 'Énergique, percutant avec jaune moutarde, rouge braise et boutons rebondis.',
    colors: {
      primary: '#dc2626', // Rouge gourmand
      secondary: '#18181b',
      accent: '#eab308', // Jaune vif
      background: '#fffbeb',
      text: '#18181b',
      surface: '#ffffff',
      button_text: '#ffffff',
    },
    typography: {
      font_family: 'Plus Jakarta Sans, sans-serif',
      heading_font: 'Outfit, sans-serif',
    },
    style: {
      button_radius: 'full',
      card_radius: 'xl',
      hero_style: 'split',
    },
  },
  premium: {
    id: 'premium',
    name: 'Restaurant Premium & Luxe',
    description: 'Immersion noire profonde, or noble et typographie haut-de-gamme.',
    colors: {
      primary: '#d97706', // Or / Amber
      secondary: '#09090b',
      accent: '#f59e0b',
      background: '#09090b', // Noir profond
      text: '#f4f4f5',
      surface: '#18181b',
      button_text: '#09090b',
    },
    typography: {
      font_family: 'system-ui, sans-serif',
      heading_font: 'serif',
    },
    style: {
      button_radius: 'none',
      card_radius: 'md',
      hero_style: 'image_cover',
    },
  },
  cafe: {
    id: 'cafe',
    name: 'Café & Salon de Thé',
    description: 'Tonalités douces espresso, noisette et sauge réconfortante.',
    colors: {
      primary: '#78350f', // Café boisé
      secondary: '#292524',
      accent: '#059669', // Vert feuille
      background: '#fafaf9',
      text: '#292524',
      surface: '#ffffff',
      button_text: '#ffffff',
    },
    typography: {
      font_family: 'Plus Jakarta Sans, sans-serif',
      heading_font: 'Outfit, sans-serif',
    },
    style: {
      button_radius: 'full',
      card_radius: 'xl',
      hero_style: 'clean',
    },
  },
  streetfood: {
    id: 'streetfood',
    name: 'Street Food & Urbain',
    description: 'Visuel dynamique, contrastes vifs, idéal pour food truck et maquis.',
    colors: {
      primary: '#ea580c', // Orange néon
      secondary: '#111827',
      accent: '#06b6d4', // Cyan pop
      background: '#f3f4f6',
      text: '#111827',
      surface: '#ffffff',
      button_text: '#ffffff',
    },
    typography: {
      font_family: 'Plus Jakarta Sans, sans-serif',
      heading_font: 'Outfit, sans-serif',
    },
    style: {
      button_radius: 'lg',
      card_radius: 'lg',
      hero_style: 'image_cover',
    },
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimaliste',
    description: 'Noir & blanc ultra net, mise en valeur absolue de la gastronomie.',
    colors: {
      primary: '#18181b',
      secondary: '#71717a',
      accent: '#27272a',
      background: '#ffffff',
      text: '#09090b',
      surface: '#f4f4f5',
      button_text: '#ffffff',
    },
    typography: {
      font_family: 'Plus Jakarta Sans, sans-serif',
      heading_font: 'Plus Jakarta Sans, sans-serif',
    },
    style: {
      button_radius: 'none',
      card_radius: 'none',
      hero_style: 'minimal',
    },
  },
};

export const DEFAULT_HOURS_SCHEDULE: RestaurantHoursDay[] = [
  { day: 'Lundi', open_time: '11:30', close_time: '23:00', is_closed: false },
  { day: 'Mardi', open_time: '11:30', close_time: '23:00', is_closed: false },
  { day: 'Mercredi', open_time: '11:30', close_time: '23:00', is_closed: false },
  { day: 'Jeudi', open_time: '11:30', close_time: '23:00', is_closed: false },
  { day: 'Vendredi', open_time: '11:30', close_time: '00:00', is_closed: false },
  { day: 'Samedi', open_time: '11:30', close_time: '00:00', is_closed: false },
  { day: 'Dimanche', open_time: '12:00', close_time: '22:30', is_closed: false },
];

export function createDefaultWebsiteConfig(
  resto: Restaurant,
  themeId: RestaurantThemeId = 'modern'
): RestaurantWebsiteConfig {
  const preset = RESTAURANT_THEMES[themeId] || RESTAURANT_THEMES.modern;

  return {
    restaurant_id: resto.id,
    theme_id: themeId,
    colors: { ...preset.colors },
    typography: { ...preset.typography },
    style: { ...preset.style },
    sections_visibility: {
      hero: true,
      about: true,
      featured_products: true,
      menu: true,
      gallery: true,
      hours: true,
      location: true,
      contact: true,
      reviews: true,
      reservation: true,
    },
    hero: {
      title: resto.name,
      subtitle: resto.description || 'Découvrez notre cuisine authentique et commandez en direct.',
      image_url: resto.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      cta_menu_text: 'Consulter la Carte',
      cta_order_text: 'Commander en Ligne',
      badge_text: 'Produits Frais & Faits Maison',
    },
    about: {
      title: 'Notre Histoire & Savoir-Faire',
      subtitle: `Bienvenue chez ${resto.name}`,
      story: `Fondé avec la passion des ingrédients d'exception, ${resto.name} vous invite à un voyage culinaire unique. Chaque plat est préparé à la minute avec amour et rigueur par notre brigade.`,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      chef_name: resto.owner_name || 'Chef Résident',
    },
    gallery_images: [
      {
        id: 'gal-1',
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
        caption: 'Viandes et grillades braisées au feu de bois',
        category: 'Plats',
      },
      {
        id: 'gal-2',
        url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
        caption: 'Burgers gourmets avec frites maison croustillantes',
        category: 'Spécialités',
      },
      {
        id: 'gal-3',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        caption: 'Salle climatisée et terrasse ombragée',
        category: 'Cadre',
      },
      {
        id: 'gal-4',
        url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
        caption: 'Desserts faits maison et gourmandises',
        category: 'Desserts',
      },
    ],
    hours_schedule: [...DEFAULT_HOURS_SCHEDULE],
    allow_orders_when_closed: false,
    service_mode: 'TABLE',
    location: {
      address: resto.address,
      city: resto.city || 'Dakar',
      google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resto.name + ' ' + resto.address)}`,
      lat: 14.7397,
      lng: -17.5029,
      directions_note: 'Parking surveillé disponible devant le restaurant.',
    },
    contact: {
      phone: resto.phone,
      whatsapp: resto.phone.replace(/[^0-9]/g, ''),
      email: resto.email,
      enable_whatsapp_orders: true,
      instagram: resto.instagram,
      facebook: resto.facebook,
      tiktok: '',
      x_twitter: '',
      youtube: '',
    },
    seo: {
      meta_title: `${resto.name} — Restaurant, Menu & Commande en Ligne`,
      meta_description: `${resto.name} à ${resto.city || resto.address}. Consultez notre carte, commandez en ligne ou réservez votre table facilement.`,
      meta_keywords: `${resto.name}, restaurant, menu digital, commande en ligne, ${resto.city || 'Dakar'}`,
      og_image_url: resto.cover_image,
      favicon_url: resto.logo,
    },
    footer: {
      custom_copyright: `© ${new Date().getFullYear()} ${resto.name}. Tous droits réservés.`,
      show_powered_by_saas: false, // Strictement aucun branding SaaS par défaut !
      notes: 'Paiement par carte bancaire, espèces, Wave et Orange Money acceptés.',
    },
    reviews: [
      {
        id: 'rev-1',
        restaurant_id: resto.id,
        author_name: 'Moussa S.',
        rating: 5,
        comment: 'Cuisine excellente et commande ultra rapide via le QR code à notre table ! Bravo à toute l’équipe.',
        date: 'Il y a 3 jours',
        is_approved: true,
      },
      {
        id: 'rev-2',
        restaurant_id: resto.id,
        author_name: 'Aïda D.',
        rating: 5,
        comment: 'Les burgers et les brochettes sont divins. Très bel endroit et service au top.',
        date: 'La semaine dernière',
        is_approved: true,
      },
    ],
    promotions: [
      {
        id: 'promo-1',
        restaurant_id: resto.id,
        code: 'BIENVENUE10',
        discount_percent: 10,
        title: '10% de réduction sur votre première commande en ligne',
        is_active: true,
      },
    ],
  };
}

/**
 * Calcule en direct si le restaurant est ouvert ou fermé selon le jour et l'heure actuelle
 */
export function getRestaurantOpenStatus(schedule?: RestaurantHoursDay[]): {
  isOpen: boolean;
  todaySchedule?: RestaurantHoursDay;
  statusText: string;
} {
  const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const now = new Date();
  const currentDayName = daysOfWeek[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const safeSchedule = Array.isArray(schedule) ? schedule : [];
  const today = safeSchedule.find(s => s.day.toLowerCase() === currentDayName.toLowerCase()) || safeSchedule[0];

  if (!today || today.is_closed) {
    return {
      isOpen: false,
      todaySchedule: today,
      statusText: `Fermé aujourd'hui (${currentDayName})`,
    };
  }

  const [openH, openM] = today.open_time.split(':').map(Number);
  const [closeH, closeM] = today.close_time.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;
  // Handle past midnight (e.g. 00:00 or 02:00)
  if (closeMinutes <= openMinutes) {
    closeMinutes += 24 * 60;
  }

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  return {
    isOpen,
    todaySchedule: today,
    statusText: isOpen 
      ? `Ouvert aujourd'hui (${today.open_time} - ${today.close_time})`
      : `Actuellement fermé (Ouvre à ${today.open_time})`,
  };
}

export const RESTAURANT_THEME_PRESETS = RESTAURANT_THEMES;
