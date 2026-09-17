import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  CreditCard,
  Building,
  Store,
  Star,
  CheckCircle2,
  X
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

interface PricingPageProps {
  navigate: (path: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate }) => {
  const { 
    saasPlans, 
    saasSettings, 
    saasBranding, 
    currentUser, 
    activeRestaurant, 
    changeRestaurantPlan 
  } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any | null>(null);

  const activePlans = saasPlans.filter(p => p.is_active);

  const handleSelectPlan = (plan: any) => {
    // If not logged in, take to register
    if (!currentUser) {
      navigate('/register');
      return;
    }

    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    
    // Check if free or payment required
    if (price === 0 || !saasSettings.monetization.payment_required) {
      if (activeRestaurant) {
        changeRestaurantPlan(activeRestaurant.id, plan.id, billingCycle);
        navigate('/dashboard/settings');
      } else {
        navigate('/register');
      }
    } else {
      setSelectedPlanForPayment(plan);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tarifs Transparents & Sans Surprise</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight">
            Choisissez la Formule Idéale pour Votre Restaurant
          </h1>
          <p className="text-base text-stone-600">
            Digitalisez votre carte en 2 minutes, optimisez vos services avec le QR Code interactif et encaissez directement via Wave & Orange Money.
          </p>

          {/* Billing Cycle Toggle */}
          {saasSettings.monetization.allow_annual_billing && (
            <div className="pt-6 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-stone-900' : 'text-stone-400'}`}>
                Facturation Mensuelle
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-stone-900 transition-colors duration-200 ease-in-out focus:outline-none"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${billingCycle === 'yearly' ? 'text-stone-900' : 'text-stone-400'}`}>
                  Facturation Annuelle
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase">
                  -20% Remise
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className={`grid grid-cols-1 gap-8 max-w-6xl mx-auto ${
          activePlans.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3'
        }`}>
          {activePlans.map(plan => {
            const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const isPopular = plan.is_popular;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 transition-all flex flex-col justify-between relative ${
                  isPopular
                    ? 'bg-stone-900 text-white border-2 border-orange-500 shadow-2xl shadow-orange-500/10 scale-105 z-10'
                    : 'bg-white text-stone-900 border border-stone-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-orange-600/30">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Le Choix des Restaurateurs</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">{plan.name}</h3>
                    <p className={`text-xs mt-1.5 min-h-[36px] ${isPopular ? 'text-stone-400' : 'text-stone-500'}`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="py-4 border-y border-stone-200/20">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black font-mono">
                        {price === 0 ? '0' : price.toLocaleString('fr-FR')}
                      </span>
                      <span className={`text-sm font-bold ${isPopular ? 'text-amber-400' : 'text-orange-600'}`}>
                        FCFA
                      </span>
                      <span className={`text-xs ${isPopular ? 'text-stone-400' : 'text-stone-500'}`}>
                        / {billingCycle === 'yearly' ? 'an' : 'mois'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <div className="text-[11px] text-emerald-500 font-semibold mt-1">
                        Économisez 2 mois d'abonnement offert
                      </div>
                    )}
                  </div>

                  {/* Quotas */}
                  <div className="space-y-2.5 text-xs">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-orange-500">
                      Quotas Inclus :
                    </div>
                    <div className="flex justify-between">
                      <span className={isPopular ? 'text-stone-300' : 'text-stone-600'}>Nombre de plats :</span>
                      <span className="font-bold font-mono">{plan.limits.max_products === -1 ? 'Illimité' : plan.limits.max_products}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isPopular ? 'text-stone-300' : 'text-stone-600'}>Comptes équipe :</span>
                      <span className="font-bold font-mono">{plan.limits.max_staff === -1 ? 'Illimité' : plan.limits.max_staff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isPopular ? 'text-stone-300' : 'text-stone-600'}>Tables QR Code :</span>
                      <span className="font-bold font-mono">{plan.limits.max_tables === -1 ? 'Illimité' : plan.limits.max_tables}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5 pt-4 border-t border-stone-200/20">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-stone-400">
                      Fonctionnalités Clés :
                    </div>
                    <ul className="space-y-2 text-xs">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-orange-400' : 'text-emerald-600'}`} />
                          <span className={isPopular ? 'text-stone-300' : 'text-stone-700'}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <span>{price === 0 ? 'Commencer Gratuitement' : `Choisir la formule ${plan.name}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {plan.trial_days > 0 && (
                    <div className={`text-center text-[11px] mt-2 ${isPopular ? 'text-stone-400' : 'text-stone-500'}`}>
                      {plan.trial_days} jours d'essai sans engagement
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Payment Methods Trust Banner */}
        <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-4 max-w-4xl mx-auto shadow-sm">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Moyens de Paiement Locaux & Sécurisés
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 py-2">
            <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Wave Sénégal & Côte d'Ivoire</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Orange Money</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
              <span className="w-3 h-3 rounded-full bg-indigo-600" />
              <span>Cartes Bancaires Visa & Mastercard</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 max-w-lg mx-auto">
            Activation instantanée de votre abonnement dès validation du transfert. Facture officielle générée automatiquement.
          </p>
        </div>

      </div>

      {/* Payment Modal */}
      {selectedPlanForPayment && (
        <PaymentModal
          plan={selectedPlanForPayment}
          billingCycle={billingCycle}
          restaurantId={activeRestaurant?.id || 'resto-demo'}
          onClose={() => setSelectedPlanForPayment(null)}
          onSuccess={() => {
            setSelectedPlanForPayment(null);
            navigate('/dashboard/settings');
          }}
        />
      )}
    </div>
  );
};
