import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Store, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';

interface RestaurantRegistrationPageProps {
  navigate: (path: string) => void;
}

export const RestaurantRegistrationPage: React.FC<RestaurantRegistrationPageProps> = ({ navigate }) => {
  const { registerRestaurant, saasBranding, saasPlans } = useApp();

  const [restaurantName, setRestaurantName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dakar');
  const [country, setCountry] = useState('Sénégal');
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'PRO'>('PRO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName || !ownerName || !email || !phone) return;

    setIsSubmitting(true);
    try {
      await registerRestaurant({
        name: restaurantName,
        owner_name: ownerName,
        email,
        phone,
        password,
        address: address || 'Plateau / Corniche',
        city,
        country,
        plan_id: selectedPlan,
      });
      navigate('/login?pending=1');
    } catch {
      // The context displays the Supabase error and keeps the form available for retry.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-center items-center p-4 py-12">
      
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 cursor-pointer font-black text-xl text-stone-900 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center text-sm font-black shadow-md shadow-orange-600/20">
              QR
            </div>
            <span>{saasBranding.platform_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Créer votre Espace Restaurant
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Rejoignez la plateforme SaaS et activez vos menus digitaux par QR code en quelques minutes.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-200/50 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Section 1: Restaurant Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider text-orange-600">
                1. Votre Établissement
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nom du Restaurant *
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={e => setRestaurantName(e.target.value)}
                    required
                    placeholder="Ex: Le Teranga Grill"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 transition font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Adresse complète
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Ex: Route des Almadies"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Owner & Login */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider text-orange-600">
                2. Responsable & Identifiants
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nom & Prénom du Gérant *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    required
                    placeholder="Ex: Mamadou Diagne"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 transition font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Téléphone de contact *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="+221 77 123 45 67"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email de Connexion *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="contact@restaurant.sn"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Plan Selection */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider text-orange-600">
                3. Choix de l'Offre de Départ
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Free */}
                <div
                  onClick={() => setSelectedPlan('FREE')}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    selectedPlan === 'FREE'
                      ? 'bg-orange-50/50 border-orange-500 ring-2 ring-orange-500/20'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-stone-900">Offre Découverte</span>
                    <span className="font-bold text-xs text-stone-900 font-mono">0 FCFA</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Jusqu'à 15 produits et 5 tables. Idéal pour démarrer sans engagement.
                  </p>
                </div>

                {/* Pro */}
                <div
                  onClick={() => setSelectedPlan('PRO')}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 relative ${
                    selectedPlan === 'PRO'
                      ? 'bg-orange-50/50 border-orange-500 ring-2 ring-orange-500/20'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <span>Restaurateur PRO</span>
                      <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white text-[9px] font-bold">Populaire</span>
                    </span>
                    <span className="font-bold text-xs text-orange-600 font-mono">25.000 FCFA/m</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Commandes illimitées, écran cuisine Kanban en direct, multi-serveurs.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Après la création, un email de confirmation sera envoyé à votre adresse. Confirmez-la pour activer votre compte, puis attendez l’approbation du Super Admin.
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Création de votre restaurant...' : 'Créer mon Restaurant & Accéder au Tableau de Bord'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Footnote */}
          <div className="pt-2 text-center text-xs text-stone-500">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-orange-600 hover:text-orange-700 font-bold"
            >
              Se connecter à l'espace restaurant
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
