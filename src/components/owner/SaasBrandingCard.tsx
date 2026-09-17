import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Palette, 
  Sparkles, 
  Upload, 
  Trash2, 
  Check, 
  RotateCcw, 
  Database, 
  Eye, 
  Layers, 
  Save, 
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Type,
  Image as ImageIcon
} from 'lucide-react';
import { SaasBranding } from '../../types';
import { INITIAL_SAAS_BRANDING } from '../../data/seedData';

interface SaasBrandingCardProps {
  navigate?: (path: string) => void;
}

const COLOR_PRESETS = [
  {
    name: 'Orange Solaire',
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
    name: 'Ambre & Terroir',
    primary: '#d97706',
    secondary: '#1c1917',
    accent: '#b45309',
  },
  {
    name: 'Rubis Gastronomie',
    primary: '#e11d48',
    secondary: '#0f172a',
    accent: '#fb7185',
  },
];

const PRESET_NAMES = [
  'RESTO QR',
  'SMART MENU',
  'GOURMET PASS',
  'TABLE DIGITALE',
  'AFRICA TABLES'
];

const PRESET_SLOGANS = [
  'Scannez. Commandez. Savourez.',
  'Le menu digital nouvelle génération',
  'Vos commandes sur table en 30 secondes',
  'La commande smartphone fluide & rapide'
];

const PRESET_LOGOS = [
  {
    label: 'Cloche Bistro',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Toque Chef',
    url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Restaurant Étoilé',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
  },
];

export const SaasBrandingCard: React.FC<SaasBrandingCardProps> = ({ navigate }) => {
  const { saasBranding, saasSettings, updateSaasBranding, showToast } = useApp();

  // Inputs contrôlés
  const [platformName, setPlatformName] = useState<string>(saasBranding.platform_name);
  const [slogan, setSlogan] = useState<string>(saasBranding.slogan);
  const [logoUrl, setLogoUrl] = useState<string>(saasBranding.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState<string>(saasBranding.primary_color || '#ea580c');
  const [secondaryColor, setSecondaryColor] = useState<string>(saasBranding.secondary_color || '#0f172a');
  const [accentColor, setAccentColor] = useState<string>(saasBranding.accent_color || '#f59e0b');
  
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchroniser avec les valeurs globales si modifiées ailleurs
  useEffect(() => {
    setPlatformName(saasBranding.platform_name);
    setSlogan(saasBranding.slogan);
    setLogoUrl(saasBranding.logo_url || '');
    setPrimaryColor(saasBranding.primary_color || '#ea580c');
    setSecondaryColor(saasBranding.secondary_color || '#0f172a');
    setAccentColor(saasBranding.accent_color || '#f59e0b');
  }, [saasBranding]);

  // Fonction centrale de sauvegarde dans la table globale 'settings'
  const persistToGlobalSettings = (overrides?: Partial<SaasBranding>) => {
    const payload: Partial<SaasBranding> = {
      platform_name: overrides?.platform_name !== undefined ? overrides.platform_name : platformName,
      slogan: overrides?.slogan !== undefined ? overrides.slogan : slogan,
      logo_url: overrides?.logo_url !== undefined ? overrides.logo_url : logoUrl,
      primary_color: overrides?.primary_color !== undefined ? overrides.primary_color : primaryColor,
      secondary_color: overrides?.secondary_color !== undefined ? overrides.secondary_color : secondaryColor,
      accent_color: overrides?.accent_color !== undefined ? overrides.accent_color : accentColor,
      button_color: overrides?.primary_color !== undefined ? overrides.primary_color : primaryColor,
      link_color: overrides?.primary_color !== undefined ? overrides.primary_color : primaryColor,
    };

    updateSaasBranding(payload);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  // Handlers contrôlés avec support auto-sync direct
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPlatformName(val);
    if (autoSync) {
      persistToGlobalSettings({ platform_name: val });
    }
  };

  const handleSloganChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSlogan(val);
    if (autoSync) {
      persistToGlobalSettings({ slogan: val });
    }
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLogoUrl(val);
    if (autoSync) {
      persistToGlobalSettings({ logo_url: val });
    }
  };

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    if (autoSync) {
      persistToGlobalSettings({ primary_color: color });
    }
  };

  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
    if (autoSync) {
      persistToGlobalSettings({ secondary_color: color });
    }
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    if (autoSync) {
      persistToGlobalSettings({ accent_color: color });
    }
  };

  const handleApplyPresetColors = (preset: typeof COLOR_PRESETS[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setAccentColor(preset.accent);
    persistToGlobalSettings({
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
    });
    showToast(`Palette « ${preset.name} » appliquée et stockée dans 'settings'`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast("L'image ne doit pas dépasser 3 Mo", 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setLogoUrl(result);
        persistToGlobalSettings({ logo_url: result });
        showToast("Logo importé et enregistré dans la table 'settings'", 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    setPlatformName(INITIAL_SAAS_BRANDING.platform_name);
    setSlogan(INITIAL_SAAS_BRANDING.slogan);
    setLogoUrl(INITIAL_SAAS_BRANDING.logo_url);
    setPrimaryColor(INITIAL_SAAS_BRANDING.primary_color);
    setSecondaryColor(INITIAL_SAAS_BRANDING.secondary_color);
    setAccentColor(INITIAL_SAAS_BRANDING.accent_color);

    updateSaasBranding(INITIAL_SAAS_BRANDING);
    showToast("Branding réinitialisé aux valeurs d'usine et enregistré dans 'settings'", 'info');
  };

  const lastUpdate = saasSettings.last_updated_at 
    ? new Date(saasSettings.last_updated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : 'À l’instant';

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 lg:p-7 space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative ambient glow based on dynamic primary color */}
      <div 
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors duration-300"
            style={{ backgroundColor: primaryColor }}
          >
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base lg:text-lg font-black text-white tracking-tight">
                SaaS Branding
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-stone-300 text-[10px] font-mono font-medium">
                <Database className="w-3 h-3 text-amber-400" />
                <span>table: settings</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Personnalisation dynamique en temps réel du nom, slogan, logo et des couleurs
            </p>
          </div>
        </div>

        {/* Status indicator & quick links */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400">
            <span className={`w-2 h-2 rounded-full ${isSavedRecently ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
            <span>Sync: <strong className="text-stone-300 font-mono">{lastUpdate}</strong></span>
          </div>

          <button
            id="saas-branding-reset-btn"
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-stone-700/60"
            title="Réinitialiser le branding aux paramètres par défaut"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Par défaut</span>
          </button>

          {navigate && (
            <button
              id="saas-branding-full-page-btn"
              type="button"
              onClick={() => navigate('/owner/branding')}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-400 hover:text-orange-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-orange-500/20"
              title="Ouvrir la page de personnalisation avancée (CMS Landing, Polices, Mentions)"
            >
              <span>Page Complète</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Form Inputs (Col 1-2) + Live Interactive Preview (Col 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left / Middle: Controlled Inputs (8 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          {/* 1. NOM DE LA PLATEFORME */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="saas-branding-name-input"
                className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"
              >
                <Type className="w-3.5 h-3.5 text-orange-400" />
                <span>Nom de la Plateforme SaaS</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                {platformName.length} / 40 car.
              </span>
            </div>

            <div className="relative">
              <input
                id="saas-branding-name-input"
                type="text"
                value={platformName}
                onChange={handleNameChange}
                maxLength={40}
                placeholder="Ex: RESTO QR"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-stone-400 font-medium">Suggestions :</span>
              {PRESET_NAMES.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setPlatformName(name);
                    persistToGlobalSettings({ platform_name: name });
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                    platformName === name 
                      ? 'bg-orange-600/30 text-orange-300 border border-orange-500/40' 
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. SLOGAN DE LA PLATEFORME */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="saas-branding-slogan-input"
                className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Slogan & Accroche Commerciale</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                {slogan.length} / 100 car.
              </span>
            </div>

            <div className="relative">
              <input
                id="saas-branding-slogan-input"
                type="text"
                value={slogan}
                onChange={handleSloganChange}
                maxLength={100}
                placeholder="Ex: Scannez. Commandez. Savourez."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            {/* Quick Slogan suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-stone-400 font-medium">Exemples :</span>
              {PRESET_SLOGANS.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSlogan(item);
                    persistToGlobalSettings({ slogan: item });
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition cursor-pointer truncate max-w-[200px] ${
                    slogan === item 
                      ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' 
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-800'
                  }`}
                  title={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 3. LOGO DE LA PLATEFORME */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="saas-branding-logo-url"
                className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Logo de la Plateforme</span>
              </label>
              <span className="text-[10px] text-stone-400">PNG, SVG, JPG, WebP</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Logo preview thumbnail */}
              <div className="relative shrink-0 group">
                <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-700 flex items-center justify-center overflow-hidden shadow-inner">
                  {Boolean(logoUrl && logoUrl.trim()) ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo SaaS" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-black text-stone-500 font-mono">
                      {platformName.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrl('');
                      persistToGlobalSettings({ logo_url: '' });
                      showToast("Logo supprimé de la table 'settings'", 'info');
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-[10px] shadow cursor-pointer transition"
                    title="Supprimer le logo actuel"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Controls: URL input + upload button */}
              <div className="flex-1 w-full space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    id="saas-branding-logo-url"
                    type="text"
                    value={logoUrl}
                    onChange={handleLogoUrlChange}
                    placeholder="Coller l'URL d'une image (https://...)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  />
                  
                  {/* File Upload trigger */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition flex items-center gap-1.5 shrink-0 border border-stone-700 cursor-pointer"
                    title="Téléverser un logo depuis votre ordinateur"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Téléverser</span>
                  </button>
                </div>

                {/* Preset Logos */}
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-stone-400">Préréglages :</span>
                  {PRESET_LOGOS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setLogoUrl(preset.url);
                        persistToGlobalSettings({ logo_url: preset.url });
                      }}
                      className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 text-[10px] font-medium border border-stone-800 cursor-pointer transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. COULEURS DE LA PLATEFORME */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Couleurs de la Plateforme</span>
              </label>
              <span className="text-[10px] text-stone-400">Palette hexadécimale dynamique</span>
            </div>

            {/* Quick 1-Click Color Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-stone-400 font-medium">Thèmes recommandés :</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPresetColors(preset)}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer group ${
                      primaryColor.toLowerCase() === preset.primary.toLowerCase()
                        ? 'border-orange-500 bg-stone-900 shadow-md'
                        : 'border-stone-800 bg-stone-900/60 hover:bg-stone-850 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: preset.primary }} />
                      <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: preset.accent }} />
                    </div>
                    <div className="text-[10px] font-bold text-white truncate group-hover:text-orange-400 transition">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual color pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Couleur Principale */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Couleur Principale
                </span>
                <div className="flex items-center gap-2">
                  <input
                    id="saas-branding-primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    id="saas-branding-primary-hex"
                    type="text"
                    value={primaryColor}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    maxLength={7}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Couleur Secondaire */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Couleur Sombre (Base)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    id="saas-branding-secondary-color"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => handleSecondaryColorChange(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    id="saas-branding-secondary-hex"
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => handleSecondaryColorChange(e.target.value)}
                    maxLength={7}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Couleur d'Accent */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Couleur d'Accent
                </span>
                <div className="flex items-center gap-2">
                  <input
                    id="saas-branding-accent-color"
                    type="color"
                    value={accentColor}
                    onChange={(e) => handleAccentColorChange(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    id="saas-branding-accent-hex"
                    type="text"
                    value={accentColor}
                    onChange={(e) => handleAccentColorChange(e.target.value)}
                    maxLength={7}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 bg-stone-900 border-stone-700"
              />
              <span>Sauvegarder instantanément dans la table <code className="text-amber-400 font-mono text-[11px]">'settings'</code></span>
            </label>

            <button
              id="saas-branding-save-btn"
              type="button"
              onClick={() => {
                persistToGlobalSettings();
                showToast("Préférences enregistrées avec succès dans la table 'settings'", 'success');
              }}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                isSavedRecently 
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20'
              }`}
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enregistré dans 'settings' !</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer dans la table 'settings'</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right: Live Interactive Preview Card (4-5 cols on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aperçu Dynamique en Direct</span>
            </h4>
            <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Live Preview
            </span>
          </div>

          {/* Realistic SaaS Navbar & Header Mockup */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 space-y-4 shadow-2xl overflow-hidden">
            
            {/* Mock Header Top Bar */}
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {Boolean(logoUrl && logoUrl.trim()) ? (
                  <img 
                    src={logoUrl} 
                    alt={platformName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover border border-stone-700" 
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {platformName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                    <span>{platformName}</span>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[8px] font-bold text-white uppercase"
                      style={{ backgroundColor: primaryColor }}
                    >
                      SaaS
                    </span>
                  </div>
                  <p className="text-[9px] text-stone-400 truncate">{slogan}</p>
                </div>
              </div>

              {/* Action button in preview */}
              <div 
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                Commander
              </div>
            </div>

            {/* Mock Banner Display */}
            <div 
              className="p-3.5 rounded-xl border border-stone-800 text-center space-y-1.5 relative overflow-hidden"
              style={{ backgroundColor: `${secondaryColor}99` }}
            >
              <span 
                className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide text-white uppercase"
                style={{ backgroundColor: accentColor }}
              >
                Nouveau Service QR
              </span>
              <h5 className="text-sm font-black text-white tracking-tight">
                {platformName}
              </h5>
              <p className="text-[10px] text-stone-300 leading-tight">
                {slogan}
              </p>
              
              <div className="pt-2 flex justify-center gap-2">
                <button 
                  type="button" 
                  className="px-3 py-1 rounded-lg text-[10px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Tester la carte
                </button>
                <button 
                  type="button" 
                  className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-stone-800 text-stone-300"
                >
                  Scanner
                </button>
              </div>
            </div>

            {/* Palette swatch indicator */}
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800/80 space-y-2 text-[11px]">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                Teintes Actives de la Plateforme
              </span>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span>Primaire :</span>
                </span>
                <span className="font-mono text-stone-400">{primaryColor}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: secondaryColor }} />
                  <span>Fond / Sombre :</span>
                </span>
                <span className="font-mono text-stone-400">{secondaryColor}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span>Accentuation :</span>
                </span>
                <span className="font-mono text-stone-400">{accentColor}</span>
              </div>
            </div>

            {/* Table Settings persistence summary */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Database className="w-3 h-3 text-amber-400" />
                <span>Enregistrement persistant vérifié</span>
              </div>
              <p className="text-stone-300 leading-tight">
                Les clés <code className="text-amber-300 font-mono">platform_name</code>, <code className="text-amber-300 font-mono">slogan</code>, <code className="text-amber-300 font-mono">logo_url</code> et <code className="text-amber-300 font-mono">colors</code> sont persistées dans l'objet global <code className="text-amber-300 font-mono">settings.branding</code>.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
