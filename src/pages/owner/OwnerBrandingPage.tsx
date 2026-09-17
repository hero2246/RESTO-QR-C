import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { 
  Palette, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Eye, 
  Save, 
  Globe, 
  Megaphone, 
  Phone, 
  Mail, 
  FileText, 
  Share2, 
  Sliders, 
  ExternalLink,
  Smartphone,
  Monitor,
  Building,
  Image as ImageIcon,
  Upload,
  Trash2,
  QrCode,
  Utensils,
  Bell
} from 'lucide-react';
import { SaasBranding } from '../../types';

interface OwnerBrandingPageProps {
  navigate: (path: string) => void;
}

const COLOR_PRESETS = [
  {
    name: 'Orange Terroir (Défaut)',
    primary: '#ea580c',
    secondary: '#0f172a',
    accent: '#f59e0b',
  },
  {
    name: 'Émeraude Prestige',
    primary: '#059669',
    secondary: '#0f172a',
    accent: '#d97706',
  },
  {
    name: 'Bleu Royal Tech',
    primary: '#2563eb',
    secondary: '#020617',
    accent: '#06b6d4',
  },
  {
    name: 'Pourpre Gourmand',
    primary: '#7c3aed',
    secondary: '#18181b',
    accent: '#ec4899',
  },
  {
    name: 'Luxe Noir & Or',
    primary: '#d97706',
    secondary: '#1c1917',
    accent: '#b45309',
  },
];

export const OwnerBrandingPage: React.FC<OwnerBrandingPageProps> = ({ navigate }) => {
  const { saasBranding, updateSaasBranding, showToast } = useApp();

  const [formData, setFormData] = useState<SaasBranding>({ ...saasBranding });
  const [activeTab, setActiveTab] = useState<'identity' | 'theme' | 'showcase' | 'contact' | 'legal'>('identity');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaved, setIsSaved] = useState(false);

  // Quick preset logos
  const PRESET_LOGOS = [
    {
      name: 'Cloche Gourmande Pro',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Bistrot Étoilé Gold',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Chef & Toque Moderne',
      url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=200&auto=format&fit=crop&q=80'
    }
  ];

  // Quick preset SaaS Names
  const PRESET_NAMES = ['RESTO QR', 'MENU PASS', 'AFRICA TABLES', 'GOURMET QR', 'SMART MENU'];

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("L'image ne doit pas dépasser 2 Mo", 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        handleChange('logo_url', event.target.result);
        showToast('Logo importé avec succès', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleChange('logo_url', '');
    showToast('Logo supprimé. Le nom textuel stylisé sera affiché par défaut.', 'info');
  };

  const handleChange = (field: keyof SaasBranding, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
    }));
    setIsSaved(false);
    showToast(`Palette "${preset.name}" appliquée`, 'info');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSaasBranding(formData);
    setIsSaved(true);
    showToast('Personnalisation du SaaS enregistrée avec succès', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Voulez-vous restaurer les paramètres visuels par défaut de RESTO QR ?')) {
      const defaultState: Partial<SaasBranding> = {
        platform_name: 'RESTO QR',
        slogan: 'Menus QR Interactifs & Commandes à Table en Temps Réel',
        description: 'La solution SaaS n°1 en Afrique de l’Ouest pour digitaliser votre salle, accélérer les rotations de tables et fidéliser vos clients.',
        primary_color: '#ea580c',
        secondary_color: '#0f172a',
        accent_color: '#f59e0b',
        hero_title: 'Digitalisez Votre Restaurant avec des Menus QR Interactifs',
        hero_subtitle: 'Permettez à vos clients de scanner, feuilleter votre carte avec photos gourmandes et commander directement depuis leur table sans attendre.',
        contact_email: 'contact@restoqr.com',
        contact_phone: '+221 77 000 00 00',
        announcement_banner_enabled: false,
      };
      setFormData(prev => ({ ...prev, ...defaultState }));
      setIsSaved(false);
      showToast('Paramètres par défaut restaurés (cliquez sur Enregistrer pour confirmer)', 'info');
    }
  };

  return (
    <OwnerLayout
      currentPath="/owner/branding"
      navigate={navigate}
      title="Personnalisation & Modification du SaaS"
      subtitle="Contrôlez l'image de marque, logos, thèmes de couleurs, textes vitrine et informations officielles"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition flex items-center gap-1.5"
            title="Restaurer les valeurs initiales"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Enregistré !' : 'Enregistrer les Modifications'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Global Announcement / Preset Quick Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-850 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: formData.primary_color }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Personnalisation Globale en Temps Réel</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Actif
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Toutes les modifications appliquées ici reconfigurent instantanément la vitrine publique, les en-têtes et les emails.
              </p>
            </div>
          </div>

          {/* Color quick presets */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
            <span className="text-[11px] text-stone-400 shrink-0 font-medium">Palettes prédéfinies :</span>
            {COLOR_PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="w-7 h-7 rounded-lg border border-stone-700 p-0.5 hover:scale-110 transition shrink-0 group relative"
                title={preset.name}
              >
                <div 
                  className="w-full h-full rounded-md" 
                  style={{ backgroundColor: preset.primary }} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Form Tabs (7 cols) + Interactive Live Preview (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Settings Section (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-900 border border-stone-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('identity')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTab === 'identity'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. Marque & Logos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('theme')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTab === 'theme'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>2. Couleurs & Style</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('showcase')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTab === 'showcase'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>3. Textes Vitrine</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTab === 'contact'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>4. Support & Siège</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('legal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTab === 'legal'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>5. Réseaux & Légal</span>
              </button>
            </div>

            {/* TAB 1: IDENTITY & LOGOS */}
            {activeTab === 'identity' && (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Identité de Marque & Logos Principaux</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Ces informations définissent la dénomination affichée partout sur la plateforme et les navigateurs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Nom de la Plateforme SaaS
                    </label>
                    <input
                      type="text"
                      value={formData.platform_name}
                      onChange={e => handleChange('platform_name', e.target.value)}
                      placeholder="Ex: RESTO QR"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-bold focus:outline-none focus:border-orange-500 transition"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-stone-500">Exemples rapides :</span>
                      {PRESET_NAMES.map(name => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handleChange('platform_name', name)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition ${
                            formData.platform_name === name 
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-bold'
                              : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Slogan Officiel
                    </label>
                    <input
                      type="text"
                      value={formData.slogan}
                      onChange={e => handleChange('slogan', e.target.value)}
                      placeholder="Ex: Menus QR Interactifs & Commandes"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">Accroche affichée sous le logo et sur les bannières</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Description de la Plateforme (Méta & Référencement)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Courte description de présentation de la solution..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition leading-relaxed"
                  />
                </div>

                {/* LOGO GESTION AVANCEE (AJOUT, SUPPRESSION, FICHIER, PRESETS) */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-400" />
                        <span>Logo Principal de la Plateforme</span>
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Ajoutez, modifiez ou supprimez le logo officiel affiché sur l'ensemble du SaaS.
                      </p>
                    </div>

                    {formData.logo_url && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer le logo</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Visual Preview Box */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-stone-900/70 border border-stone-800 text-center min-h-[120px]">
                      {Boolean(formData.logo_url && formData.logo_url.trim()) ? (
                        <div className="space-y-2 flex flex-col items-center">
                          <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800">
                            <img 
                              src={formData.logo_url} 
                              alt="Logo SaaS" 
                              className="h-12 w-auto max-w-[140px] object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Logo actif
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center mx-auto text-base">
                            {formData.platform_name.substring(0, 2).toUpperCase() || 'RQ'}
                          </div>
                          <p className="text-[11px] text-stone-400 font-medium">Aucun logo image</p>
                          <p className="text-[9px] text-stone-500">Affichage monogramme textuel</p>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="md:col-span-8 space-y-3">
                      {/* Upload local file */}
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                          Importer un fichier depuis votre appareil
                        </label>
                        <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-stone-900 border border-dashed border-stone-700 hover:border-orange-500 text-stone-300 hover:text-white text-xs cursor-pointer transition">
                          <Upload className="w-3.5 h-3.5 text-orange-400" />
                          <span>Choisir une image (PNG, SVG, JPG - max 2Mo)</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoFileUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>

                      {/* Direct URL input */}
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                          Ou saisir directement une URL d'image
                        </label>
                        <input
                          type="text"
                          value={formData.logo_url}
                          onChange={e => handleChange('logo_url', e.target.value)}
                          placeholder="https://.../logo.png"
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono focus:outline-none focus:border-orange-500 transition"
                        />
                      </div>

                      {/* Presets */}
                      <div>
                        <span className="text-[10px] text-stone-500 block mb-1.5">Ou choisir parmi nos logos professionnels préconfigurés :</span>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_LOGOS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                handleChange('logo_url', preset.url);
                                showToast(`Logo "${preset.name}" sélectionné`, 'info');
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-orange-500 text-[11px] text-stone-300 hover:text-white transition"
                            >
                              <img 
                                src={preset.url} 
                                alt={preset.name} 
                                className="w-4 h-4 rounded-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                              <span>{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      URL du Favicon
                    </label>
                    <input
                      type="text"
                      value={formData.favicon_url}
                      onChange={e => handleChange('favicon_url', e.target.value)}
                      placeholder="/favicon.ico"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white text-[11px] font-mono focus:outline-none focus:border-orange-500 transition"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">Icône d'onglet du navigateur (.ico ou .png 32x32)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Nom de l'Entreprise Éditrice
                    </label>
                    <input
                      type="text"
                      value={formData.company_name || 'RESTO QR TECHNOLOGIES SAS'}
                      onChange={e => handleChange('company_name', e.target.value)}
                      placeholder="Ex: RESTO QR TECHNOLOGIES SAS"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">Raison sociale affichée dans le copyright et les factures</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: THEME & COLORS */}
            {activeTab === 'theme' && (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-orange-400" />
                    <span>Charte Graphique & Palette de Couleurs</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Ajustez les codes hexadécimaux et les arrondis d'interface de l'ensemble de l'application.
                  </p>
                </div>

                {/* Color pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Primary color */}
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                    <label className="block text-xs font-semibold text-stone-300">
                      Couleur Primaire
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={e => handleChange('primary_color', e.target.value)}
                        className="w-10 h-10 rounded-xl border border-stone-700 bg-stone-900 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={e => handleChange('primary_color', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono uppercase font-bold"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 block">Boutons d'action principaux, badges et liens actifs</span>
                  </div>

                  {/* Secondary color */}
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                    <label className="block text-xs font-semibold text-stone-300">
                      Couleur Secondaire
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={e => handleChange('secondary_color', e.target.value)}
                        className="w-10 h-10 rounded-xl border border-stone-700 bg-stone-900 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={e => handleChange('secondary_color', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono uppercase font-bold"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 block">Fonds sombres, barres d'outils et headers</span>
                  </div>

                  {/* Accent color */}
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                    <label className="block text-xs font-semibold text-stone-300">
                      Couleur d'Accent
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.accent_color}
                        onChange={e => handleChange('accent_color', e.target.value)}
                        className="w-10 h-10 rounded-xl border border-stone-700 bg-stone-900 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.accent_color}
                        onChange={e => handleChange('accent_color', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono uppercase font-bold"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 block">Puces, notifications, étoiles et éléments VIP</span>
                  </div>

                </div>

                {/* Borders & Radii */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-800">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Rayon d'Arrondi des Composants (Boutons & Cartes)
                    </label>
                    <select
                      value={formData.border_radius || 'lg'}
                      onChange={e => handleChange('border_radius', e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    >
                      <option value="none">Sans arrondi (Angles droits stricts)</option>
                      <option value="sm">Arrondi discret (4px)</option>
                      <option value="md">Arrondi standard (8px)</option>
                      <option value="lg">Arrondi moderne fluide (16px) — Recommandé</option>
                      <option value="full">Arrondi pilule total (9999px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Style des Cartes de Contenu
                    </label>
                    <select
                      value={formData.card_style || 'bordered'}
                      onChange={e => handleChange('card_style', e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    >
                      <option value="bordered">Bordures subtiles (Flat Clean)</option>
                      <option value="shadow">Ombre douce (Soft Elevation)</option>
                      <option value="elevated">Élévation contrastée (Pro Studio)</option>
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: SHOWCASE & LANDING CMS */}
            {activeTab === 'showcase' && (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-orange-400" />
                    <span>Textes Vitrine & Appels à l'Action (Landing Page)</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Gérez les titres percutants, sous-titres et messages promotionnels visibles par les restaurateurs.
                  </p>
                </div>

                {/* Global Announcement Banner Toggle */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Bannière d'Alerte / Annonce Globale</span>
                        {formData.announcement_banner_enabled ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            Affichée
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-bold">
                            Désactivée
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Affiche un bandeau d'information tout en haut du site public (ex: promotions, nouvelles fonctionnalités).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('announcement_banner_enabled', !formData.announcement_banner_enabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        formData.announcement_banner_enabled ? 'bg-orange-600' : 'bg-stone-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                          formData.announcement_banner_enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {formData.announcement_banner_enabled && (
                    <div className="pt-2 border-t border-stone-850">
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">Texte de l'annonce</label>
                      <input
                        type="text"
                        value={formData.announcement_banner_text || '🎉 Offre de lancement : 1 mois PRO offert pour tout nouveau restaurant inscrit !'}
                        onChange={e => handleChange('announcement_banner_text', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Titre Principal Hero (Page d'accueil)
                  </label>
                  <input
                    type="text"
                    value={formData.hero_title}
                    onChange={e => handleChange('hero_title', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-bold focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Sous-titre Hero
                  </label>
                  <textarea
                    rows={2}
                    value={formData.hero_subtitle}
                    onChange={e => handleChange('hero_subtitle', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Bouton CTA Principal (Texte)
                    </label>
                    <input
                      type="text"
                      value={formData.hero_cta_primary_text || 'Créer mon restaurant'}
                      onChange={e => handleChange('hero_cta_primary_text', e.target.value)}
                      placeholder="Ex: Créer mon restaurant"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Bouton CTA Secondaire (Texte)
                    </label>
                    <input
                      type="text"
                      value={formData.hero_cta_secondary_text || 'Voir la démo en direct'}
                      onChange={e => handleChange('hero_cta_secondary_text', e.target.value)}
                      placeholder="Ex: Voir la démo en direct"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: SUPPORT & CONTACT */}
            {activeTab === 'contact' && (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-400" />
                    <span>Coordonnées Officielles & Support Technique</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Ces coordonnées figurent sur la page d'accueil, les formulaires d'aide et les reçus de paiement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Email de Support Client
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={e => handleChange('contact_email', e.target.value)}
                        placeholder="support@restoqr.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Téléphone Principal
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                      <input
                        type="text"
                        value={formData.contact_phone}
                        onChange={e => handleChange('contact_phone', e.target.value)}
                        placeholder="+221 77 000 00 00"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Numéro WhatsApp Support Dédié
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp_support_number || '+221770000000'}
                      onChange={e => handleChange('whatsapp_support_number', e.target.value)}
                      placeholder="+221770000000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">Format international direct pour le clic WhatsApp</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Adresse Physique / Siège Social
                    </label>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-stone-400 shrink-0" />
                      <input
                        type="text"
                        value={formData.company_address || 'Dakar, Sénégal - Plateau Tech Hub'}
                        onChange={e => handleChange('company_address', e.target.value)}
                        placeholder="Dakar, Sénégal"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Texte de Copyright Pied de Page
                  </label>
                  <input
                    type="text"
                    value={formData.footer_text}
                    onChange={e => handleChange('footer_text', e.target.value)}
                    placeholder="© 2026 RESTO QR Technologies. Tous droits réservés."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                  />
                </div>

              </div>
            )}

            {/* TAB 5: LEGAL & SOCIAL */}
            {activeTab === 'legal' && (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-orange-400" />
                    <span>Réseaux Sociaux & Pages Légales Obligatoires</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Renseignez vos liens de communication et les mentions de conformité RGPD / Protection des données.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Lien Instagram</label>
                    <input
                      type="text"
                      value={formData.social_instagram || 'https://instagram.com/restoqr'}
                      onChange={e => handleChange('social_instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Lien Facebook</label>
                    <input
                      type="text"
                      value={formData.social_facebook || 'https://facebook.com/restoqr'}
                      onChange={e => handleChange('social_facebook', e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Lien LinkedIn</label>
                    <input
                      type="text"
                      value={formData.social_linkedin || 'https://linkedin.com/company/restoqr'}
                      onChange={e => handleChange('social_linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Lien Twitter / X</label>
                    <input
                      type="text"
                      value={formData.social_twitter || 'https://x.com/restoqr'}
                      onChange={e => handleChange('social_twitter', e.target.value)}
                      placeholder="https://x.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white text-[11px]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800">
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Mentions Légales & Registre de Commerce
                  </label>
                  <textarea
                    rows={2}
                    value={formData.legal_notice}
                    onChange={e => handleChange('legal_notice', e.target.value)}
                    placeholder="RESTO QR Technologies SAS - RCCM SN.DKR.2024.B.10234 - NINEA 009281729..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white leading-relaxed"
                  />
                </div>

              </div>
            )}

            {/* Bottom save bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-stone-500">
                Dernière modification appliquée localement
              </span>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-lg shadow-orange-600/20 flex items-center gap-2"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Modifications Enregistrées !' : 'Appliquer & Enregistrer'}</span>
              </button>
            </div>

          </div>

          {/* Interactive Live Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sticky top-6 space-y-4 shadow-xl">
              
              {/* Preview Header Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Aperçu en Direct</span>
                </div>
                <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg transition ${
                      previewDevice === 'desktop' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Vue Ordinateur"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg transition ${
                      previewDevice === 'mobile' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Vue Smartphone"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mock Browser Frame */}
              <div 
                className={`rounded-2xl border border-stone-800 bg-stone-950 overflow-hidden shadow-2xl transition-all duration-300 mx-auto ${
                  previewDevice === 'mobile' ? 'max-w-[320px]' : 'w-full'
                }`}
              >
                {/* Mock Browser URL Bar */}
                <div className="px-3 py-2 bg-stone-900 border-b border-stone-800 flex items-center gap-2 text-[10px] text-stone-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/60" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                    <div className="w-2 h-2 rounded-full bg-green-500/60" />
                  </div>
                  <div className="bg-stone-950 px-2 py-0.5 rounded-md flex-1 text-center font-mono truncate text-[9px] text-stone-400">
                    https://www.{formData.platform_name.toLowerCase().replace(/\s+/g, '')}.com
                  </div>
                </div>

                {/* Announcement Banner (if enabled) */}
                {formData.announcement_banner_enabled && (
                  <div 
                    className="py-1 px-3 text-center text-[9px] font-bold text-white transition"
                    style={{ backgroundColor: formData.primary_color }}
                  >
                    {formData.announcement_banner_text || 'Annonce active sur la plateforme'}
                  </div>
                )}

                {/* Mock Navbar */}
                <div className="p-3 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/60 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      QR
                    </div>
                    <div>
                      <div className="text-xs font-black text-white tracking-wider">
                        {formData.platform_name}
                      </div>
                      <div className="text-[8px] text-stone-400 truncate max-w-[120px]">
                        {formData.slogan}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md text-[9px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      {formData.hero_cta_primary_text || 'S’inscrire'}
                    </button>
                  </div>
                </div>

                {/* Mock Hero Section */}
                <div className="p-4 space-y-3 text-center bg-gradient-to-b from-stone-950 to-stone-900/80">
                  <span 
                    className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide shadow-sm"
                    style={{ 
                      backgroundColor: `${formData.primary_color}25`, 
                      color: formData.primary_color,
                      borderColor: `${formData.primary_color}40`,
                      borderWidth: '1px'
                    }}
                  >
                    ✦ {formData.slogan}
                  </span>

                  <h4 className="text-xs font-black text-white leading-snug px-2">
                    {formData.hero_title}
                  </h4>

                  <p className="text-[9px] text-stone-400 leading-relaxed max-w-[280px] mx-auto">
                    {formData.hero_subtitle}
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-[9px] font-bold text-white shadow-md transition"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      {formData.hero_cta_primary_text || 'Créer mon restaurant'}
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg text-[9px] font-medium text-stone-300 bg-stone-800 border border-stone-700"
                    >
                      {formData.hero_cta_secondary_text || 'Voir la démo'}
                    </button>
                  </div>
                </div>

                {/* Mock Restaurant Menu Card Item */}
                <div className="p-3 bg-stone-900 border-t border-stone-800 space-y-2">
                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Aperçu d'une Table Restaurant</span>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[8px] font-bold text-white"
                      style={{ backgroundColor: formData.accent_color }}
                    >
                      En direct
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-stone-800 shrink-0 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80" 
                        alt="Plat exemple"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-white truncate">Plat Gourmet Signature</div>
                      <div className="text-[8px] text-stone-400 truncate">Menu digitalisé avec QR Code de table</div>
                      <div className="text-[9px] font-mono font-bold mt-0.5" style={{ color: formData.accent_color }}>
                        4 500 FCFA
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md text-[8px] font-bold text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>

                {/* Mock Footer */}
                <div className="p-2 bg-stone-950 border-t border-stone-850 text-center text-[8px] text-stone-500">
                  {formData.footer_text || '© 2026 RESTO QR Technologies'}
                </div>

              </div>

              {/* Open public site button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition flex items-center justify-center gap-2 border border-stone-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Tester le Rendu sur la Vitrine Publique</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </OwnerLayout>
  );
};
