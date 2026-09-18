import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Palette, 
  Store, 
  Clock, 
  Phone, 
  MapPin, 
  Share2, 
  Save, 
  Eye, 
  Check, 
  Sparkles,
  ExternalLink,
  CreditCard,
  Zap,
  TrendingUp,
  ArrowUpRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  Link2
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

interface SettingsPageProps {
  navigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ navigate }) => {
  const { 
    activeRestaurant, 
    updateRestaurant, 
    showToast,
    getEffectivePlan,
    getRestaurantUsage,
    saasPlans,
    invoices,
    saasSettings
  } = useApp();

  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<any | null>(null);
  const [name, setName] = useState(activeRestaurant?.name || '');
  const [description, setDescription] = useState(activeRestaurant?.description || '');
  const [phone, setPhone] = useState(activeRestaurant?.phone || '');
  const [address, setAddress] = useState(activeRestaurant?.address || '');
  const [hours, setHours] = useState(activeRestaurant?.hours || '');
  const [instagram, setInstagram] = useState(activeRestaurant?.instagram || '');
  const [facebook, setFacebook] = useState(activeRestaurant?.facebook || '');
  const [logo, setLogo] = useState(activeRestaurant?.logo || '');
  const [coverImage, setCoverImage] = useState(activeRestaurant?.cover_image || '');
  const [primaryColor, setPrimaryColor] = useState(activeRestaurant?.primary_color || '#ea580c');
  const [secondaryColor, setSecondaryColor] = useState(activeRestaurant?.secondary_color || '#0f172a');
  const [customDomain, setCustomDomain] = useState(activeRestaurant?.custom_domain || '');

  const normalizedDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const domainIsValid = normalizedDomain === '' || /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(normalizedDomain);

  useEffect(() => {
    if (activeRestaurant) {
      setName(activeRestaurant.name || '');
      setDescription(activeRestaurant.description || '');
      setPhone(activeRestaurant.phone || '');
      setAddress(activeRestaurant.address || '');
      setHours(activeRestaurant.hours || '');
      setInstagram(activeRestaurant.instagram || '');
      setFacebook(activeRestaurant.facebook || '');
      setLogo(activeRestaurant.logo || '');
      setCoverImage(activeRestaurant.cover_image || '');
      setPrimaryColor(activeRestaurant.primary_color || '#ea580c');
      setSecondaryColor(activeRestaurant.secondary_color || '#0f172a');
      setCustomDomain(activeRestaurant.custom_domain || '');
    }
  }, [activeRestaurant]);

  if (!activeRestaurant) {
    return <div className="p-8 text-center text-stone-500">Sélectionnez un restaurant</div>;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurant(activeRestaurant.id, {
      name,
      description,
      phone,
      address,
      hours,
      instagram,
      facebook,
      logo,
      cover_image: coverImage,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Paramètres & Personnalisation du Restaurant
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Personnalisez l’identité, les coordonnées et les couleurs de votre carte digitale.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/r/${activeRestaurant.slug}`)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ouvrir Menu Client</span>
            </button>
          </div>
        </div>

        <section className="bg-stone-950 text-white rounded-3xl border border-stone-800 p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black">Votre site web indépendant</h2>
                <p className="text-xs text-stone-400 mt-1 max-w-xl">Connectez un domaine à votre restaurant. Vos clients arriveront directement sur votre menu, sans voir la plateforme RESTO QR.</p>
              </div>
            </div>
            <a href="https://www.ovhcloud.com/fr/domains/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-stone-900 hover:bg-orange-50 transition">
              Acheter un domaine <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
            <label className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Domaine personnalisé</span>
              <input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="www.monrestaurant.com" className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500" />
              {!domainIsValid && <span className="block text-[11px] text-red-400">Saisissez un domaine valide, par exemple restaurant.com.</span>}
            </label>
            <button type="button" disabled={!domainIsValid || !normalizedDomain} onClick={() => { updateRestaurant(activeRestaurant.id, { custom_domain: normalizedDomain, domain_status: 'PENDING' }); showToast('Domaine enregistré. Configurez le DNS indiqué par votre registrar.', 'success'); }} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40 transition">
              <Link2 className="w-3.5 h-3.5" /> Connecter
            </button>
          </div>
          <div className="rounded-xl border border-stone-800 bg-stone-900/70 px-3.5 py-3 text-[11px] text-stone-400">
            {activeRestaurant.custom_domain ? <><span className="font-bold text-amber-300">{activeRestaurant.custom_domain}</span> est en statut <span className="font-bold text-amber-300">{activeRestaurant.domain_status || 'PENDING'}</span>. La connexion DNS finale doit être faite auprès de votre registrar.</> : <>Achetez d’abord votre domaine, puis saisissez-le ici pour générer votre demande de connexion.</>}
          </div>
        </section>

        {/* Mon Forfait SaaS & Quotas */}
        {(() => {
          const effectivePlan = getEffectivePlan(activeRestaurant.id);
          const usage = getRestaurantUsage(activeRestaurant.id);
          const restoInvoices = invoices.filter(i => i.restaurant_id === activeRestaurant.id);

          const prodPct = usage.limits.max_products === -1 ? 0 : Math.min(100, Math.round((usage.products_count / usage.limits.max_products) * 100));
          const staffPct = usage.limits.max_staff === -1 ? 0 : Math.min(100, Math.round((usage.staff_count / usage.limits.max_staff) * 100));
          const tablesPct = usage.limits.max_tables === -1 ? 0 : Math.min(100, Math.round((usage.tables_count / usage.limits.max_tables) * 100));

          return (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-stone-900">Abonnement & Consommation des Quotas</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                        Formule {effectivePlan.name}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {effectivePlan.price_monthly > 0 
                        ? `${effectivePlan.price_monthly.toLocaleString('fr-FR')} FCFA / mois`
                        : 'Accès Découverte Gratuit'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {effectivePlan.id === 'FREE' && (
                    <button
                      type="button"
                      onClick={() => {
                        const proPlan = saasPlans.find(p => p.id === 'PRO');
                        if (proPlan) setSelectedPlanToUpgrade(proPlan);
                      }}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Passer au Forfait PRO</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/pricing')}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                  >
                    Comparer les Formules
                  </button>
                </div>
              </div>

              {/* VIP Override banner if present */}
              {usage.isOverridden && activeRestaurant.admin_override && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold">Surclassement VIP accordé par le Super Admin !</div>
                    <div className="text-amber-700 mt-0.5">
                      Votre restaurant bénéficie gracieusement du plan <span className="font-bold">{activeRestaurant.admin_override.override_plan}</span> jusqu'au {new Date(activeRestaurant.admin_override.override_expires_at).toLocaleDateString('fr-FR')}.
                    </div>
                  </div>
                </div>
              )}

              {/* Quota gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Products */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-2">
                    <span>Plats & Boissons</span>
                    <span className="font-mono text-stone-900">
                      {usage.products_count} / {usage.limits.max_products === -1 ? '∞' : usage.limits.max_products}
                    </span>
                  </div>
                  {usage.limits.max_products !== -1 && (
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${prodPct >= 90 ? 'bg-red-500' : prodPct >= 75 ? 'bg-amber-500' : 'bg-orange-500'}`}
                        style={{ width: `${prodPct}%` }}
                      />
                    </div>
                  )}
                  <div className="text-[10px] text-stone-500 mt-2">
                    {usage.limits.max_products === -1 
                      ? 'Aucune limite sur votre carte'
                      : `${Math.max(0, usage.limits.max_products - usage.products_count)} emplacements restants`}
                  </div>
                </div>

                {/* Staff */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-2">
                    <span>Comptes Collaborateurs</span>
                    <span className="font-mono text-stone-900">
                      {usage.staff_count} / {usage.limits.max_staff === -1 ? '∞' : usage.limits.max_staff}
                    </span>
                  </div>
                  {usage.limits.max_staff !== -1 && (
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${staffPct >= 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${staffPct}%` }}
                      />
                    </div>
                  )}
                  <div className="text-[10px] text-stone-500 mt-2">
                    Cuisine, serveurs et managers
                  </div>
                </div>

                {/* Tables */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-2">
                    <span>Tables QR Code</span>
                    <span className="font-mono text-stone-900">
                      {usage.tables_count} / {usage.limits.max_tables === -1 ? '∞' : usage.limits.max_tables}
                    </span>
                  </div>
                  {usage.limits.max_tables !== -1 && (
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${tablesPct >= 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${tablesPct}%` }}
                      />
                    </div>
                  )}
                  <div className="text-[10px] text-stone-500 mt-2">
                    Génération illimitée des QR codes PDF
                  </div>
                </div>

              </div>

              {/* Invoices */}
              {restoInvoices.length > 0 && (
                <div className="pt-2 border-t border-stone-100">
                  <div className="text-xs font-bold text-stone-700 mb-3 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-stone-400" />
                    <span>Factures Récentes de l'Abonnement</span>
                  </div>
                  <div className="divide-y divide-stone-100 border border-stone-100 rounded-2xl overflow-hidden">
                    {restoInvoices.map(inv => (
                      <div key={inv.id} className="p-3 bg-stone-50/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-stone-900 font-mono">{inv.invoice_number}</span>
                          <span className="text-stone-400 ml-2">
                            {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-stone-900">{inv.amount.toLocaleString('fr-FR')} FCFA</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Acquittée
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* 2-Column Form + Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form (7 cols) */}
          <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
            
            {/* Identity section */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <Store className="w-4 h-4 text-orange-600" />
                <span>Identité de l'établissement</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nom officiel du restaurant *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Slogan ou description d'accueil
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Numéro de téléphone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Horaires d'ouverture
                  </label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Adresse physique
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Visual Branding section */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <Palette className="w-4 h-4 text-orange-600" />
                <span>Charte graphique & Visuels</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  URL du Logo
                </label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  URL de l'image de couverture
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono"
                />
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Couleur Principale (Boutons & Accent)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-28 px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Couleur Secondaire (Header / Dark)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-28 px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les modifications</span>
            </button>

          </form>

          {/* Live Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Aperçu en direct (Menu Client)</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Mise à jour en temps réel
              </span>
            </div>

            {/* Smartphone simulator frame */}
            <div className="rounded-[2.5rem] border-8 border-stone-800 bg-stone-50 shadow-2xl overflow-hidden max-w-sm mx-auto">
              
              {/* Header inside phone */}
              <div className="relative h-40 w-full overflow-hidden bg-stone-900">
                <img
                  src={coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'}
                  alt="Cover"
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2.5 text-white">
                  <img
                    src={logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80'}
                    alt="Logo"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm truncate">{name || 'Nom du restaurant'}</div>
                    <div className="text-[10px] text-stone-300 truncate">{hours || 'Horaires'}</div>
                  </div>
                </div>
              </div>

              {/* Sample category tab */}
              <div className="p-3 border-b border-stone-200 flex gap-1.5 overflow-x-auto text-[11px] font-bold">
                <span 
                  className="px-2.5 py-1 rounded-lg text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  Burgers
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-600">
                  Plats
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-600">
                  Boissons
                </span>
              </div>

              {/* Sample Product item inside phone */}
              <div className="p-3 space-y-2">
                <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex gap-2.5">
                  <div className="w-14 h-14 rounded-lg bg-stone-200 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80"
                      alt="Burger"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xs text-stone-900 truncate">BURGER CLASSIC</div>
                      <div className="text-[10px] text-stone-400 truncate">Pain brioché, steak, sauce...</div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-black text-xs text-stone-900">3 500 FCFA</span>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sample Cart floating button */}
                <div 
                  className="p-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-between shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>1 article</span>
                  <span>3 500 FCFA</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {selectedPlanToUpgrade && (
        <PaymentModal
          plan={selectedPlanToUpgrade}
          billingCycle="monthly"
          restaurantId={activeRestaurant.id}
          onClose={() => setSelectedPlanToUpgrade(null)}
          onSuccess={() => {
            setSelectedPlanToUpgrade(null);
            showToast('Abonnement PRO activé avec succès !', 'success');
          }}
        />
      )}
    </div>
  );
};
