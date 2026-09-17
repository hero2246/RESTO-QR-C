import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RESTAURANT_THEMES, ThemePreset, createDefaultWebsiteConfig } from '../data/restaurantThemes';
import { RestaurantWebsiteConfig, DomainStatus } from '../types';
import { 
  Palette, 
  Globe, 
  Eye, 
  Layers, 
  Clock, 
  Image, 
  MessageSquare, 
  Tag, 
  Save, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ArrowLeft,
  Smartphone,
  Monitor,
  RefreshCw
} from 'lucide-react';

interface RestaurantWebsiteBuilderPageProps {
  navigate: (path: string) => void;
}

export const RestaurantWebsiteBuilderPage: React.FC<RestaurantWebsiteBuilderPageProps> = ({ navigate }) => {
  const { 
    activeRestaurant, 
    currentUser, 
    getRestaurantWebsiteConfig, 
    updateRestaurantWebsite, 
    connectCustomDomain, 
    verifyCustomDomain, 
    disconnectCustomDomain,
    toggleReviewApproval,
    addRestaurantPromotion,
    togglePromotionStatus,
    setSimulatedDomain,
    showToast 
  } = useApp();

  const restaurant = activeRestaurant;

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'THEME' | 'SECTIONS' | 'CONTENT' | 'GALLERY' | 'HOURS' | 'DOMAIN' | 'REVIEWS' | 'PROMOS'>('THEME');

  // Local draft config
  const [draftConfig, setDraftConfig] = useState<RestaurantWebsiteConfig | null>(null);

  // Custom domain input
  const [domainInput, setDomainInput] = useState<string>('');
  const [isVerifyingDomain, setIsVerifyingDomain] = useState<boolean>(false);

  // New gallery image input
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newImageCaption, setNewImageCaption] = useState<string>('');
  const [newImageCategory, setNewImageCategory] = useState<string>('Plats');

  // New promotion input
  const [newPromoCode, setNewPromoCode] = useState<string>('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(10);
  const [newPromoTitle, setNewPromoTitle] = useState<string>('');

  useEffect(() => {
    if (restaurant) {
      const existing = getRestaurantWebsiteConfig(restaurant.id);
      setDraftConfig(JSON.parse(JSON.stringify(existing)));
      setDomainInput(restaurant.custom_domain || '');
    }
  }, [restaurant, getRestaurantWebsiteConfig]);

  if (!restaurant || !draftConfig) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-600">Veuillez sélectionner un restaurant dans le panneau d'administration.</p>
      </div>
    );
  }

  // Handle Theme Preset click
  const applyPreset = (presetKey: string) => {
    const preset = RESTAURANT_THEMES[presetKey as keyof typeof RESTAURANT_THEMES];
    if (!preset) return;

    setDraftConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        theme_preset: presetKey as any,
        colors: { ...prev.colors, ...preset.colors },
        typography: { ...prev.typography, ...preset.typography },
        style: { ...prev.style, ...preset.style },
      };
    });
    showToast(`Thème « ${preset.name} » appliqué`, 'info');
  };

  // Save all changes
  const handleSave = () => {
    if (!restaurant || !draftConfig) return;
    updateRestaurantWebsite(restaurant.id, draftConfig);
  };

  // Custom domain connection
  const handleConnectDomain = () => {
    if (!domainInput.trim()) {
      showToast('Veuillez saisir un nom de domaine', 'error');
      return;
    }
    const res = connectCustomDomain(restaurant.id, domainInput);
    if (!res.success) {
      showToast(res.message, 'error');
    }
  };

  const handleVerifyDns = () => {
    setIsVerifyingDomain(true);
    setTimeout(() => {
      verifyCustomDomain(restaurant.id);
      setIsVerifyingDomain(false);
    }, 1200);
  };

  const handleAddGalleryImage = () => {
    if (!newImageUrl.trim()) return;
    setDraftConfig(prev => {
      if (!prev) return null;
      const newImg = {
        id: `img-${Date.now()}`,
        url: newImageUrl.trim(),
        caption: newImageCaption.trim() || 'Spécialité du restaurant',
        category: newImageCategory,
      };
      return {
        ...prev,
        gallery_images: [newImg, ...prev.gallery_images],
      };
    });
    setNewImageUrl('');
    setNewImageCaption('');
    showToast('Image ajoutée à la galerie', 'success');
  };

  const handleDeleteGalleryImage = (id: string) => {
    setDraftConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gallery_images: prev.gallery_images.filter(img => img.id !== id),
      };
    });
  };

  const handleAddPromo = () => {
    if (!newPromoCode.trim()) return;
    addRestaurantPromotion(restaurant.id, {
      code: newPromoCode.trim().toUpperCase(),
      discount_percent: Number(newPromoDiscount),
      title: newPromoTitle.trim() || `Offre spéciale -${newPromoDiscount}%`,
      is_active: true,
    });
    setNewPromoCode('');
    setNewPromoTitle('');
  };

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copié dans le presse-papiers !', 'info');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      
      {/* Top action header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-xl hover:bg-stone-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <span>Créateur de Site Web Restaurant</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold uppercase">
                  CMS Dédié
                </span>
              </h1>
              <p className="text-xs text-stone-600">
                Personnalisez le site vitrine autonome de <strong className="text-stone-900">{restaurant.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live preview in new view */}
            <button
              onClick={() => {
                // Directly navigate to restaurant website
                navigate(`/site/${restaurant.slug}`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition"
            >
              <Eye className="w-4 h-4 text-stone-600" />
              <span>Voir mon site</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer le Site</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto border-t border-stone-100 py-2 no-scrollbar">
          {[
            { id: 'THEME', label: 'Thèmes & Couleurs', icon: Palette },
            { id: 'SECTIONS', label: 'Sections du Site', icon: Layers },
            { id: 'CONTENT', label: 'Textes & Histoire', icon: Sparkles },
            { id: 'GALLERY', label: 'Galerie Photos', icon: Image },
            { id: 'HOURS', label: 'Horaires d\'Ouverture', icon: Clock },
            { id: 'DOMAIN', label: 'Nom de Domaine', icon: Globe },
            { id: 'REVIEWS', label: 'Avis Clients', icon: MessageSquare },
            { id: 'PROMOS', label: 'Codes Promo', icon: Tag },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ==================================================================== */}
        {/* TAB 1: THEMES & COLORS */}
        {/* ==================================================================== */}
        {activeTab === 'THEME' && (
          <div className="space-y-8">
            {/* Presets */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
              <h2 className="text-lg font-black text-stone-900 mb-1">
                Choisissez un Style Graphique Clé-en-main
              </h2>
              <p className="text-xs text-stone-600 mb-6">
                Chaque thème adapte automatiquement les couleurs, typographies et formes des cartes pour correspondre à votre ambiance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.entries(RESTAURANT_THEMES) as [string, ThemePreset][]).map(([key, preset]) => {
                  const isSelected = draftConfig.theme_preset === key;
                  return (
                    <div
                      key={key}
                      onClick={() => applyPreset(key)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                        isSelected 
                          ? 'border-orange-600 bg-orange-50/40 shadow-sm' 
                          : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-extrabold text-stone-900 text-sm">{preset.name}</h3>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 mb-4">{preset.description}</p>
                      </div>

                      {/* Color dots preview */}
                      <div className="flex items-center gap-1.5 pt-3 border-t border-stone-200">
                        <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.colors.primary }} />
                        <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.colors.secondary }} />
                        <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.colors.accent }} />
                        <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.colors.background }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Granular Color Picker */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
              <h2 className="text-lg font-black text-stone-900 mb-1">
                Ajustement Précis des Couleurs
              </h2>
              <p className="text-xs text-stone-600 mb-6">
                Personnalisez chaque nuance pour respecter la charte graphique exacte de votre restaurant.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Primary */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">
                    Couleur Primaire (Boutons, Actions)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={draftConfig.colors.primary}
                      onChange={e => setDraftConfig({
                        ...draftConfig,
                        colors: { ...draftConfig.colors, primary: e.target.value }
                      })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-stone-300 p-1"
                    />
                    <input 
                      type="text" 
                      value={draftConfig.colors.primary}
                      onChange={e => setDraftConfig({
                        ...draftConfig,
                        colors: { ...draftConfig.colors, primary: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 text-xs font-mono border border-stone-300 rounded-xl uppercase"
                    />
                  </div>
                </div>

                {/* Secondary */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">
                    Couleur Secondaire (Pied de page, Titres)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={draftConfig.colors.secondary}
                      onChange={e => setDraftConfig({
                        ...draftConfig,
                        colors: { ...draftConfig.colors, secondary: e.target.value }
                      })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-stone-300 p-1"
                    />
                    <input 
                      type="text" 
                      value={draftConfig.colors.secondary}
                      onChange={e => setDraftConfig({
                        ...draftConfig,
                        colors: { ...draftConfig.colors, secondary: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 text-xs font-mono border border-stone-300 rounded-xl uppercase"
                    />
                  </div>
                </div>

                {/* Background */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">
                    Couleur d'Arrière-Plan de la Page
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={draftConfig.colors.background}
                      onChange={e => setDraftConfig({
                        ...draftConfig,
                        colors: { ...draftConfig.colors, background: e.target.value }
                      })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-stone-300 p-1"
                    />
                    <input 
                      type="text" 
                      value={draftConfig.colors.background}
                      onChange={e => setDraftConfig({
                        ...draftConfig,
                        colors: { ...draftConfig.colors, background: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 text-xs font-mono border border-stone-300 rounded-xl uppercase"
                    />
                  </div>
                </div>

                {/* Button Radius */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">
                    Arrondi des Boutons
                  </label>
                  <select
                    value={draftConfig.style.button_radius}
                    onChange={e => setDraftConfig({
                      ...draftConfig,
                      style: { ...draftConfig.style, button_radius: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="none">Carré (0px)</option>
                    <option value="sm">Légèrement arrondi (6px)</option>
                    <option value="md">Moderne (12px)</option>
                    <option value="lg">Prononcé (16px)</option>
                    <option value="full">Pilule (Pill - 9999px)</option>
                  </select>
                </div>

                {/* Card Radius */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">
                    Arrondi des Cartes de Plats
                  </label>
                  <select
                    value={draftConfig.style.card_radius}
                    onChange={e => setDraftConfig({
                      ...draftConfig,
                      style: { ...draftConfig.style, card_radius: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="none">Angles droits (0px)</option>
                    <option value="sm">Discret (8px)</option>
                    <option value="md">Standard (12px)</option>
                    <option value="lg">Moderne (16px)</option>
                    <option value="xl">Grand arrondi (24px)</option>
                  </select>
                </div>

                {/* Service Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">
                    Modes de Restauration Proposés
                  </label>
                  <select
                    value={draftConfig.service_mode}
                    onChange={e => setDraftConfig({
                      ...draftConfig,
                      service_mode: e.target.value as any
                    })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-bold"
                  >
                    <option value="ALL">Complet (Sur Place, À Emporter, Livraison)</option>
                    <option value="DINE_IN">Sur Place Uniquement</option>
                    <option value="TAKEAWAY">À Emporter Uniquement</option>
                    <option value="DELIVERY">Livraison Uniquement</option>
                  </select>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: SECTIONS VISIBILITY */}
        {/* ==================================================================== */}
        {activeTab === 'SECTIONS' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-stone-900 mb-1">
                Sections Actives sur Votre Site
              </h2>
              <p className="text-xs text-stone-600">
                Activez ou désactivez les blocs de contenu selon les besoins de votre établissement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'hero', label: 'Bannière d\'accueil (Hero)', desc: 'Titre d\'accroche, photo principale et bouton d\'action' },
                { key: 'featured_products', label: 'Spécialités du Chef', desc: 'Mise en avant de vos plats signatures' },
                { key: 'menu', label: 'La Carte & Commande en Ligne', desc: 'Navigation interactive par catégories avec ajout au panier' },
                { key: 'about', label: 'Notre Histoire & Le Chef', desc: 'Récit de la fondation, valeurs et présentation du chef' },
                { key: 'gallery', label: 'Galerie Photos', desc: 'Présentation visuelle des assiettes et du cadre' },
                { key: 'hours', label: 'Horaires d\'Ouverture', desc: 'Tableau des heures avec statut ouvert/fermé en direct' },
                { key: 'location', label: 'Plan d\'Accès & Localisation', desc: 'Adresse précise et lien vers Google Maps' },
                { key: 'reviews', label: 'Avis Clients & Témoignages', desc: 'Notes sur 5 étoiles et commentaires vérifiés' },
                { key: 'contact', label: 'Boutons de Contact & WhatsApp', desc: 'Appel téléphonique et messagerie instantanée' },
              ].map(sec => {
                const isEnabled = draftConfig.sections_visibility[sec.key as keyof typeof draftConfig.sections_visibility];
                return (
                  <div 
                    key={sec.key}
                    onClick={() => {
                      setDraftConfig({
                        ...draftConfig,
                        sections_visibility: {
                          ...draftConfig.sections_visibility,
                          [sec.key]: !isEnabled,
                        }
                      });
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      isEnabled 
                        ? 'border-orange-500 bg-orange-50/40' 
                        : 'border-stone-200 bg-stone-50 opacity-60'
                    }`}
                  >
                    <div className="pr-4">
                      <div className="font-bold text-stone-900 text-sm">{sec.label}</div>
                      <div className="text-xs text-stone-600 mt-0.5">{sec.desc}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isEnabled ? 'bg-orange-600 text-white' : 'bg-stone-300 text-stone-600'
                    }`}>
                      {isEnabled ? '✓' : '✕'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: CONTENT & STORY */}
        {/* ==================================================================== */}
        {activeTab === 'CONTENT' && (
          <div className="space-y-8">
            {/* Hero Text */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-stone-900 mb-1">
                Bannière Principale (Hero)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Badge / Accroche Courte</label>
                  <input
                    type="text"
                    value={draftConfig.hero.badge_text || ''}
                    onChange={e => setDraftConfig({
                      ...draftConfig,
                      hero: { ...draftConfig.hero, badge_text: e.target.value }
                    })}
                    placeholder="Ex: Saveurs Authentiques & Grillades au Feu de Bois"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Image Principale (URL)</label>
                  <input
                    type="text"
                    value={draftConfig.hero.image_url || ''}
                    onChange={e => setDraftConfig({
                      ...draftConfig,
                      hero: { ...draftConfig.hero, image_url: e.target.value }
                    })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Grand Titre</label>
                <input
                  type="text"
                  value={draftConfig.hero.title}
                  onChange={e => setDraftConfig({
                    ...draftConfig,
                    hero: { ...draftConfig.hero, title: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Sous-titre / Description d'Accueil</label>
                <textarea
                  rows={3}
                  value={draftConfig.hero.subtitle}
                  onChange={e => setDraftConfig({
                    ...draftConfig,
                    hero: { ...draftConfig.hero, subtitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            {/* About Story */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-stone-900 mb-1">
                Notre Histoire & Équipe
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Nom du Chef / Gérant</label>
                  <input
                    type="text"
                    value={draftConfig.about.chef_name || ''}
                    onChange={e => setDraftConfig({
                      ...draftConfig,
                      about: { ...draftConfig.about, chef_name: e.target.value }
                    })}
                    placeholder="Ex: Chef Amadou Ba"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Photo de l'équipe (URL)</label>
                  <input
                    type="text"
                    value={draftConfig.about.image_url || ''}
                    onChange={e => setDraftConfig({
                      ...draftConfig,
                      about: { ...draftConfig.about, image_url: e.target.value }
                    })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Récit de l'Établissement</label>
                <textarea
                  rows={5}
                  value={draftConfig.about.story}
                  onChange={e => setDraftConfig({
                    ...draftConfig,
                    about: { ...draftConfig.about, story: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            {/* White-Label Footer Toggle */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-stone-900 mb-1">
                Marque Blanche & Pied de Page
              </h2>
              <p className="text-xs text-stone-600">
                Vous possédez votre site web à 100%. Contrôlez la présence de la mention du SaaS.
              </p>

              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <div className="text-sm font-bold text-stone-900">
                    Afficher la mention « Propulsé par RESTO QR »
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    Désactivé par défaut. Si coché, ajoute un discret badge en fin de page.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={draftConfig.footer.show_powered_by_saas}
                  onChange={e => setDraftConfig({
                    ...draftConfig,
                    footer: { ...draftConfig.footer, show_powered_by_saas: e.target.checked }
                  })}
                  className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: GALLERY */}
        {/* ==================================================================== */}
        {activeTab === 'GALLERY' && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-stone-900 mb-1">
                Ajouter une Photo à la Galerie
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="URL de l'image (https://...)"
                  className="sm:col-span-6 px-3 py-2 text-xs border border-stone-300 rounded-xl font-mono"
                />
                <input
                  type="text"
                  value={newImageCaption}
                  onChange={e => setNewImageCaption(e.target.value)}
                  placeholder="Légende (ex: Burger Gourmet)"
                  className="sm:col-span-3 px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
                <select
                  value={newImageCategory}
                  onChange={e => setNewImageCategory(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                >
                  <option value="Plats">Plats</option>
                  <option value="Spécialités">Spécialités</option>
                  <option value="Cadre">Cadre</option>
                  <option value="Desserts">Desserts</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="sm:col-span-1 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {draftConfig.gallery_images.map(img => (
                <div key={img.id} className="relative h-48 rounded-2xl overflow-hidden group border border-stone-200">
                  <img 
                    src={img.url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'} 
                    alt={img.caption} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-between p-3 text-white">
                    <span className="text-xs font-bold truncate pr-2">{img.caption}</span>
                    <button
                      onClick={() => handleDeleteGalleryImage(img.id)}
                      className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: HOURS */}
        {/* ==================================================================== */}
        {activeTab === 'HOURS' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-stone-900 mb-1">
              Configuration des Horaires d'Ouverture
            </h2>
            <p className="text-xs text-stone-600 mb-4">
              Ces horaires déterminent automatiquement si votre restaurant est affiché comme Ouvert ou Fermé en direct sur votre site.
            </p>

            <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl overflow-hidden">
              {draftConfig.hours_schedule.map((schedule, idx) => (
                <div key={schedule.day} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
                  <div className="w-32 font-bold text-sm text-stone-900">{schedule.day}</div>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-stone-600">
                      <input
                        type="checkbox"
                        checked={schedule.is_closed}
                        onChange={e => {
                          const updated = [...draftConfig.hours_schedule];
                          updated[idx].is_closed = e.target.checked;
                          setDraftConfig({ ...draftConfig, hours_schedule: updated });
                        }}
                        className="w-4 h-4 rounded text-orange-600"
                      />
                      <span>Fermé ce jour</span>
                    </label>

                    {!schedule.is_closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={schedule.open_time}
                          onChange={e => {
                            const updated = [...draftConfig.hours_schedule];
                            updated[idx].open_time = e.target.value;
                            setDraftConfig({ ...draftConfig, hours_schedule: updated });
                          }}
                          className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white"
                        />
                        <span className="text-xs text-stone-600">à</span>
                        <input
                          type="time"
                          value={schedule.close_time}
                          onChange={e => {
                            const updated = [...draftConfig.hours_schedule];
                            updated[idx].close_time = e.target.value;
                            setDraftConfig({ ...draftConfig, hours_schedule: updated });
                          }}
                          className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: CUSTOM DOMAIN & SUBDOMAIN */}
        {/* ==================================================================== */}
        {activeTab === 'DOMAIN' && (
          <div className="space-y-8">
            {/* Free Subdomain Info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
                <Globe className="w-4 h-4" />
                <span>Sous-Domaine Gratuit Inclus</span>
              </div>
              <h2 className="text-lg font-black text-stone-900 mb-2">
                Adresse RESTO QR de votre établissement
              </h2>
              <p className="text-xs text-stone-600 mb-4">
                Disponible immédiatement sans aucune configuration DNS supplémentaire :
              </p>

              <div className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-2xl max-w-xl">
                <span className="font-mono text-sm font-bold text-stone-900 flex-1">
                  https://{restaurant.subdomain || restaurant.slug}.restoqr.com
                </span>
                <button
                  onClick={() => copyToClipboard(`https://${restaurant.subdomain || restaurant.slug}.restoqr.com`)}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg"
                  title="Copier le lien"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/site/${restaurant.slug}`)}
                  className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800"
                >
                  Ouvrir
                </button>
              </div>
            </div>

            {/* Custom Domain Hub */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Marque Blanche Complète
                </span>
                <h2 className="text-lg font-black text-stone-900 mt-1">
                  Connecter Votre Propre Nom de Domaine
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Associez votre domaine (ex : <strong>chezalpha.com</strong>). Les visiteurs arrivent directement sur votre restaurant sans passer par la vitrine du SaaS.
                </p>
              </div>

              {/* Status Banner */}
              {restaurant.custom_domain && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  restaurant.domain_status === 'CONNECTED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-6 h-6 ${restaurant.domain_status === 'CONNECTED' ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <div>
                      <div className="font-bold text-sm">
                        {restaurant.custom_domain}
                      </div>
                      <div className="text-xs">
                        Statut : {restaurant.domain_status === 'CONNECTED' ? '🟢 Domaine Actif & Sécurisé SSL' : '🟡 En attente de propagation DNS'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {restaurant.domain_status !== 'CONNECTED' && (
                      <button
                        onClick={handleVerifyDns}
                        disabled={isVerifyingDomain}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingDomain ? 'animate-spin' : ''}`} />
                        <span>Vérifier DNS</span>
                      </button>
                    )}

                    {/* Simulate Domain Button (Crucial for live in-app testing) */}
                    <button
                      onClick={() => {
                        setSimulatedDomain(restaurant.custom_domain || null);
                        showToast(`Simulation activée pour ${restaurant.custom_domain}`, 'success');
                      }}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold"
                      title="Simule la navigation comme si vous veniez de ce nom de domaine"
                    >
                      Tester le Routage
                    </button>

                    <button
                      onClick={() => disconnectCustomDomain(restaurant.id)}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold"
                    >
                      Déconnecter
                    </button>
                  </div>
                </div>
              )}

              {/* Input for new custom domain */}
              {!restaurant.custom_domain && (
                <div className="flex gap-2 max-w-lg">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={e => setDomainInput(e.target.value)}
                    placeholder="Ex: chezalpha.com ou commande.chezalpha.com"
                    className="flex-1 px-4 py-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                  />
                  <button
                    onClick={handleConnectDomain}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold"
                  >
                    Ajouter le domaine
                  </button>
                </div>
              )}

              {/* Real DNS Setup Instructions */}
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="font-extrabold text-sm text-stone-900">
                  Instructions DNS Réelles (Chez votre hébergeur OVH, Namecheap, GoDaddy ou Cloudflare) :
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-stone-600">Type :</span> <strong>CNAME</strong> &nbsp;
                      <span className="text-stone-600">Hôte :</span> <strong>@ ou www</strong> &nbsp;
                      <span className="text-stone-600">Valeur :</span> <strong>cname.vercel-dns.com</strong>
                    </div>
                    <button
                      onClick={() => copyToClipboard('cname.vercel-dns.com')}
                      className="p-1 hover:bg-stone-100 rounded"
                    >
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-stone-600">Type :</span> <strong>A</strong> &nbsp;
                      <span className="text-stone-600">Hôte :</span> <strong>@</strong> &nbsp;
                      <span className="text-stone-600">Valeur :</span> <strong>76.76.21.21</strong>
                    </div>
                    <button
                      onClick={() => copyToClipboard('76.76.21.21')}
                      className="p-1 hover:bg-stone-100 rounded"
                    >
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600">
                  ⚡ La propagation DNS prend généralement entre 5 minutes et 2 heures. Le certificat SSL Let's Encrypt est émis automatiquement dès que les DNS pointent vers nos serveurs.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 7: REVIEWS MODERATION */}
        {/* ==================================================================== */}
        {activeTab === 'REVIEWS' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-stone-900 mb-1">
                Modération des Avis Clients
              </h2>
              <p className="text-xs text-stone-600">
                Vous avez le plein contrôle sur les avis publiés sur votre vitrine.
              </p>
            </div>

            <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl overflow-hidden">
              {draftConfig.reviews.map(rev => (
                <div key={rev.id} className="p-4 flex items-center justify-between bg-stone-50/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{rev.author_name}</span>
                      <span className="text-xs text-amber-500 font-bold">★ {rev.rating}/5</span>
                      <span className="text-[11px] text-stone-600">({rev.date})</span>
                    </div>
                    <p className="text-xs text-stone-700 italic">"{rev.comment}"</p>
                  </div>

                  <button
                    onClick={() => toggleReviewApproval(restaurant.id, rev.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                      rev.is_approved
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {rev.is_approved ? 'Visible en ligne' : 'Masqué'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 8: PROMOS */}
        {/* ==================================================================== */}
        {activeTab === 'PROMOS' && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-stone-900 mb-1">
                Créer un Nouveau Code Promotionnel
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <input
                  type="text"
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value)}
                  placeholder="Code (ex: BIENVENUE15)"
                  className="sm:col-span-4 px-3 py-2 text-xs border border-stone-300 rounded-xl font-mono uppercase"
                />
                <input
                  type="number"
                  value={newPromoDiscount}
                  onChange={e => setNewPromoDiscount(Number(e.target.value))}
                  placeholder="Remise en %"
                  className="sm:col-span-2 px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
                <input
                  type="text"
                  value={newPromoTitle}
                  onChange={e => setNewPromoTitle(e.target.value)}
                  placeholder="Description (ex: -15% sur la 1ère commande)"
                  className="sm:col-span-4 px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddPromo}
                  className="sm:col-span-2 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
                >
                  Ajouter l'offre
                </button>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-stone-900">Codes Promotions Actifs :</h3>
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl overflow-hidden">
                {draftConfig.promotions.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between bg-stone-50/40">
                    <div>
                      <span className="font-mono font-bold text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-lg mr-2">
                        {p.code}
                      </span>
                      <span className="text-xs font-bold text-stone-900">-{p.discount_percent}%</span>
                      <span className="text-xs text-stone-600 ml-2">({p.title})</span>
                    </div>

                    <button
                      onClick={() => togglePromotionStatus(restaurant.id, p.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl ${
                        p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {p.is_active ? 'Actif' : 'Désactivé'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
