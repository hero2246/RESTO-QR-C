import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { 
  Settings, 
  ShieldAlert, 
  Check, 
  RefreshCw, 
  Lock, 
  Globe, 
  DollarSign, 
  CreditCard, 
  Sliders, 
  Save, 
  Zap, 
  HelpCircle,
  Eye,
  EyeOff,
  Calendar,
  ExternalLink,
  QrCode,
  Phone,
  Link as LinkIcon
} from 'lucide-react';
import { GlobalFeatureFlags, PaymentProviderConfig } from '../../types';

interface OwnerSettingsPageProps {
  navigate: (path: string) => void;
}

export const OwnerSettingsPage: React.FC<OwnerSettingsPageProps> = ({ navigate }) => {
  const { 
    saasSettings, 
    updateSaasSettings, 
    paymentProviders, 
    updatePaymentProvider, 
    updateMonetizationSettings,
    toggleGlobalFeatureFlag,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'monetization' | 'payments' | 'features'>('monetization');

  // General settings state
  const [generalData, setGeneralData] = useState({ ...saasSettings });
  
  // Monetization state
  const [monetizationData, setMonetizationData] = useState({ ...saasSettings.monetization });

  // Payment providers state
  const [providersList, setProvidersList] = useState<PaymentProviderConfig[]>(paymentProviders);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const [saved, setSaved] = useState(false);

  const handleGeneralSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSaasSettings(generalData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleMonetizationSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMonetizationSettings(monetizationData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveProvider = (provider: PaymentProviderConfig) => {
    updatePaymentProvider(provider.id, provider);
  };

  return (
    <OwnerLayout
      currentPath="/owner/settings"
      navigate={navigate}
      title="Paramètres & Monétisation de la Plateforme"
      subtitle="Politique commerciale, passerelles Wave/Orange Money, quotas et interrupteurs globaux"
    >
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* ========================================================================= */}
        {/* BANDEAU CLÉ : OÙ ACTIVER LE FORFAIT GRATUIT & LES PAIEMENTS PRO */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-850 border-2 border-orange-500/30 shadow-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>Centre d'Activation : Forfait Gratuit & Paiements PRO</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold">
                    Super Admin
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Activez ou désactivez en 1 clic l'accès au forfait gratuit (Freemium) et l'obligation de paiement par Wave, Orange Money ou Stripe pour le forfait PRO.
                </p>
              </div>
            </div>

            {/* Presets rapides 1-clic */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  updateMonetizationSettings({ free_plan_enabled: true, payment_required: true });
                  setMonetizationData(p => ({ ...p, free_plan_enabled: true, payment_required: true }));
                  showToast('Mode Freemium appliqué : Gratuit activé + Paiement PRO obligatoire', 'success');
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition border border-stone-700 hover:border-orange-500 cursor-pointer"
              >
                1. Mode Freemium (Recommandé)
              </button>
              <button
                type="button"
                onClick={() => {
                  updateMonetizationSettings({ free_plan_enabled: true, payment_required: false });
                  setMonetizationData(p => ({ ...p, free_plan_enabled: true, payment_required: false }));
                  showToast('Mode 100% Gratuit appliqué : Tous les forfaits sans paiement immédiat', 'info');
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition border border-stone-700 hover:border-blue-500 cursor-pointer"
              >
                2. Mode 100% Gratuit
              </button>
              <button
                type="button"
                onClick={() => {
                  updateMonetizationSettings({ free_plan_enabled: false, payment_required: true });
                  setMonetizationData(p => ({ ...p, free_plan_enabled: false, payment_required: true }));
                  showToast('Mode Paiement Strict appliqué : Pas de forfait gratuit', 'warning');
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition border border-stone-700 hover:border-amber-500 cursor-pointer"
              >
                3. Paiement Requis Obligatoire
              </button>
            </div>
          </div>

          {/* Les 2 Grands Interrupteurs Visuels Cliquables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Toggle Forfait Gratuit */}
            <div 
              onClick={() => {
                const next = !monetizationData.free_plan_enabled;
                setMonetizationData(p => ({ ...p, free_plan_enabled: next }));
                updateMonetizationSettings({ free_plan_enabled: next });
              }}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-4 ${
                monetizationData.free_plan_enabled 
                  ? 'bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400 shadow-md' 
                  : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  monetizationData.free_plan_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-500'
                }`}>
                  FREE
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Forfait Gratuit (Plan FREE)</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      monetizationData.free_plan_enabled 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-stone-800 text-stone-400'
                    }`}>
                      {monetizationData.free_plan_enabled ? '● ACTIVÉ' : '○ DÉSACTIVÉ'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-tight">
                    {monetizationData.free_plan_enabled 
                      ? 'Les restaurants s’inscrivent et créent leur menu gratuitement sans carte bancaire.' 
                      : 'Forfait gratuit fermé. Tous les restaurants doivent opter pour une formule payante.'}
                  </p>
                </div>
              </div>

              <div className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                monetizationData.free_plan_enabled ? 'bg-emerald-600' : 'bg-stone-800'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  monetizationData.free_plan_enabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* 2. Toggle Paiement PRO */}
            <div 
              onClick={() => {
                const next = !monetizationData.payment_required;
                setMonetizationData(p => ({ ...p, payment_required: next }));
                updateMonetizationSettings({ payment_required: next });
              }}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-4 ${
                monetizationData.payment_required 
                  ? 'bg-orange-950/20 border-orange-500/50 hover:border-orange-400 shadow-md' 
                  : 'bg-blue-950/20 border-blue-500/40 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  monetizationData.payment_required ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  PRO
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Paiement en Ligne pour le Forfait PRO</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      monetizationData.payment_required 
                        ? 'bg-orange-500/20 text-orange-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {monetizationData.payment_required ? '● PAIEMENT REQUIS' : '○ DÉCOUVERTE LIBRE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-tight">
                    {monetizationData.payment_required 
                      ? 'Paiement réel exigé par Wave, Orange Money ou Carte pour débloquer les fonctionnalités PRO.' 
                      : 'Mode découverte : les restaurants activent le forfait PRO sans débit immédiat.'}
                  </p>
                </div>
              </div>

              <div className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                monetizationData.payment_required ? 'bg-orange-600' : 'bg-blue-600'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  monetizationData.payment_required ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-900 border border-stone-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('monetization')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'monetization'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Politique Commerciale & Monétisation</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'payments'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Passerelles de Paiement</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'features'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Fonctionnalités Globales (Flags)</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'general'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Système & Sécurité</span>
          </button>
        </div>

        {/* TAB 1: MONETIZATION SETTINGS */}
        {activeTab === 'monetization' && (
          <form onSubmit={handleMonetizationSave} className="space-y-6">
            
            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-400" />
                    <span>Modèle Économique & Activation des Paiements</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Déterminez si la plateforme fonctionne en mode 100% gratuit, freemium ou paiement obligatoire.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>

              {/* Toggles */}
              <div className="divide-y divide-stone-800">
                
                {/* Free Plan Allowed */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Autoriser le Plan Gratuit (Freemium)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        Recommandé pour l'acquisition
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Les restaurants peuvent démarrer sans carte bancaire avec les quotas du plan FREE (30 produits, 1 staff).
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMonetizationData(p => ({ ...p, free_plan_enabled: !p.free_plan_enabled }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      monetizationData.free_plan_enabled ? 'bg-orange-600' : 'bg-stone-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                        monetizationData.free_plan_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Paid Required */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Paiement Obligatoire pour les Formules Payantes</span>
                      {monetizationData.payment_required ? (
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold">
                          Verrouillage Actif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                          Mode Découverte (Activation Immédiate)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Si désactivé, le Super Admin autorise les restaurants à activer le plan PRO/PREMIUM sans passer par la passerelle de paiement en ligne.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMonetizationData(p => ({ ...p, payment_required: !p.payment_required }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      monetizationData.payment_required ? 'bg-orange-600' : 'bg-stone-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                        monetizationData.payment_required ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* EXIGER DES PAIEMENTS : FREQUENCE OBLIGATOIRE (MENSUEL OU ANNUEL) */}
                <div className="py-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <span>Exigence de Fréquence de Facturation aux Restaurants</span>
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold">
                          Règle Commerciale
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Imposez aux restaurants abonnés un paiement strictement Mensuel, strictement Annuel, ou laissez-les choisir.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Option 1: Flexible */}
                    <button
                      type="button"
                      onClick={() => setMonetizationData(p => ({ ...p, billing_frequency_required: 'FLEXIBLE' }))}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                        (!monetizationData.billing_frequency_required || monetizationData.billing_frequency_required === 'FLEXIBLE')
                          ? 'bg-orange-500/10 border-orange-500 text-white ring-1 ring-orange-500/40'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-white">1. Flexible (Au Choix)</span>
                        {(!monetizationData.billing_frequency_required || monetizationData.billing_frequency_required === 'FLEXIBLE') && (
                          <Check className="w-4 h-4 text-orange-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 leading-snug">
                        Le restaurateur choisit librement entre Mensuel ou Annuel (avec la remise de 20% appliquée à l'année).
                      </p>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md self-start">
                        Option par défaut
                      </span>
                    </button>

                    {/* Option 2: Monthly Only */}
                    <button
                      type="button"
                      onClick={() => setMonetizationData(p => ({ ...p, billing_frequency_required: 'MONTHLY_ONLY' }))}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                        monetizationData.billing_frequency_required === 'MONTHLY_ONLY'
                          ? 'bg-orange-500/10 border-orange-500 text-white ring-1 ring-orange-500/40'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-white">2. Exiger Mensuel Uniquement</span>
                        {monetizationData.billing_frequency_required === 'MONTHLY_ONLY' && (
                          <Check className="w-4 h-4 text-orange-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 leading-snug">
                        Tous les restaurants doivent payer chaque mois. Les options d'engagement annuel sont masquées.
                      </p>
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md self-start">
                        Facturation récurrente mensuelle
                      </span>
                    </button>

                    {/* Option 3: Yearly Only */}
                    <button
                      type="button"
                      onClick={() => setMonetizationData(p => ({ ...p, billing_frequency_required: 'YEARLY_ONLY' }))}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                        monetizationData.billing_frequency_required === 'YEARLY_ONLY'
                          ? 'bg-orange-500/10 border-orange-500 text-white ring-1 ring-orange-500/40'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-white">3. Exiger Annuel Uniquement</span>
                        {monetizationData.billing_frequency_required === 'YEARLY_ONLY' && (
                          <Check className="w-4 h-4 text-orange-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 leading-snug">
                        Engagement et paiement comptant annuel obligatoires (12 mois d'avance) pour tous les abonnés.
                      </p>
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md self-start">
                        Engagement 1 an obligatoire
                      </span>
                    </button>
                  </div>
                </div>

                {/* Auto Suspend on Unpaid */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Suspension & Blocage Automatique en Cas d'Impayé</span>
                      {monetizationData.auto_suspend_unpaid ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold">
                          Blocage Strict Activé
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-bold">
                          Accès Toléré
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Si activé, l'accès au menu QR ou aux commandes en ligne sera automatiquement verrouillé si la facture n'est pas réglée à la fin de la période de grâce.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMonetizationData(p => ({ ...p, auto_suspend_unpaid: !p.auto_suspend_unpaid }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      monetizationData.auto_suspend_unpaid ? 'bg-red-600' : 'bg-stone-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                        monetizationData.auto_suspend_unpaid ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Allow Annual Billing */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white">Remise sur Facturation Annuelle (-20%)</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Accorder une réduction incitative aux restaurants souscrivant pour l'année complète.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMonetizationData(p => ({ ...p, allow_annual_billing: !p.allow_annual_billing }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      monetizationData.allow_annual_billing ? 'bg-orange-600' : 'bg-stone-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                        monetizationData.allow_annual_billing ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Invoice */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white">Émission Automatique des Factures PDF</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Générer et archiver une facture numérotée (FAC-AAAA-XXXX) à chaque validation de transaction.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMonetizationData(p => ({ ...p, auto_invoice_generation: !p.auto_invoice_generation }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      monetizationData.auto_invoice_generation ? 'bg-orange-600' : 'bg-stone-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                        monetizationData.auto_invoice_generation ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-800">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Jours d'Essai Gratuit (Trial)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={monetizationData.trial_period_days}
                    onChange={e => setMonetizationData(p => ({ ...p, trial_period_days: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">0 = aucun essai, activation directe</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Période de Grâce (jours de tolérance)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={monetizationData.grace_period_days}
                    onChange={e => setMonetizationData(p => ({ ...p, grace_period_days: parseInt(e.target.value) || 3 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">Délai avant suspension après expiration</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Devise de Tarification
                  </label>
                  <input
                    type="text"
                    value={monetizationData.currency}
                    onChange={e => setMonetizationData(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono uppercase"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">Exemple: FCFA, EUR, USD</span>
                </div>
              </div>

            </div>

          </form>
        )}

        {/* TAB 2: PAYMENT PROVIDERS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">

            {/* SECTION DÉDIÉE : PAIEMENT MOBILE MONEY DIRECT (PROMPT MAÎTRE #7) */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border-2 border-orange-500/30 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Paiement Direct Mobile Money (Wave / Orange Money)</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold">
                        Encaissement Pro
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Configurez votre lien de paiement Mobile Money personnalisé et votre numéro pour encaisser les abonnements Pro.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateMonetizationSettings(monetizationData);
                    showToast('Configuration Mobile Money enregistrée avec succès !', 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer Mobile Money</span>
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Nom du moyen de paiement
                  </label>
                  <input
                    type="text"
                    value={monetizationData.mobile_money_name || ''}
                    onChange={e => setMonetizationData(p => ({ ...p, mobile_money_name: e.target.value }))}
                    placeholder="Ex: Wave / Orange Money"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">Affiché sur l'écran de paiement du restaurant</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Numéro Mobile Money (Récepteur)
                  </label>
                  <input
                    type="text"
                    value={monetizationData.mobile_money_phone || ''}
                    onChange={e => setMonetizationData(p => ({ ...p, mobile_money_phone: e.target.value }))}
                    placeholder="Ex: +221 77 123 45 67"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono placeholder-stone-600 focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">Numéro vers lequel le transfert peut être effectué</span>
                </div>
              </div>

              {/* Explicit Field: Lien de paiement Mobile Money */}
              <div>
                <label className="block text-xs font-bold text-orange-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Lien de paiement Mobile Money (Champ Obligatoire pour le bouton PAYER)</span>
                  </span>
                  {monetizationData.mobile_money_link && (
                    <a
                      href={monetizationData.mobile_money_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-normal underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Tester le lien dans un nouvel onglet</span>
                    </a>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={monetizationData.mobile_money_link || ''}
                    onChange={e => setMonetizationData(p => ({ ...p, mobile_money_link: e.target.value }))}
                    placeholder="https://pay.wave.com/m/votre-lien-marchand-ou-lien-om"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-orange-500/50 text-xs text-white font-mono placeholder-stone-600 focus:outline-none focus:border-orange-400 pr-24 shadow-inner"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-600/20 text-orange-400 border border-orange-500/30">
                    Wave / OM Link
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5">
                  Quand le restaurant clique sur <strong className="text-white font-semibold">« PAYER MAINTENANT »</strong>, l'application ouvrira automatiquement cette URL dans un nouvel onglet pour lui permettre d'effectuer la transaction.
                </p>
              </div>

              {/* Instructions text */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Instructions détaillées pour le restaurant
                </label>
                <textarea
                  rows={3}
                  value={monetizationData.mobile_money_instructions || ''}
                  onChange={e => setMonetizationData(p => ({ ...p, mobile_money_instructions: e.target.value }))}
                  placeholder="Ex: 1. Cliquez sur 'Payer maintenant'...\n2. Notez votre code de transaction...\n3. Cliquez sur 'J'ai effectué le paiement'..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>

              {/* QR Code URL (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-stone-400" />
                  <span>Image ou URL du QR Code de paiement marchand (Optionnel)</span>
                </label>
                <input
                  type="text"
                  value={monetizationData.mobile_money_qr_url || ''}
                  onChange={e => setMonetizationData(p => ({ ...p, mobile_money_qr_url: e.target.value }))}
                  placeholder="https://exemple.com/mon-qr-wave.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-orange-400" />
                <span>Passerelles API & Cartes Bancaires (Stripe / Wave API)</span>
              </h3>
              <p className="text-xs text-stone-400 mb-6">
                Activez Wave, Orange Money ou Stripe et renseignez vos clés API d'encaissement marchand pour recevoir les abonnements.
              </p>

              <div className="space-y-6">
                {providersList.map((provider, idx) => (
                  <div 
                    key={provider.id}
                    className={`p-5 rounded-2xl border transition ${
                      provider.is_enabled 
                        ? 'bg-stone-950/80 border-stone-800 shadow-md' 
                        : 'bg-stone-950/30 border-stone-800/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                          provider.type === 'wave' ? 'bg-blue-500/20 text-blue-400' :
                          provider.type === 'orange_money' ? 'bg-orange-500/20 text-orange-400' :
                          provider.type === 'stripe' ? 'bg-indigo-500/20 text-indigo-400' :
                          'bg-stone-800 text-stone-300'
                        }`}>
                          {provider.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{provider.name}</span>
                            {provider.is_sandbox && (
                              <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold">
                                MODE TEST (SANDBOX)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            Devises: {(provider.supported_currencies || []).join(', ') || 'XOF'} • Frais: {provider.transaction_fee_pct}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...provider, is_enabled: !provider.is_enabled };
                            setProvidersList(prev => prev.map(p => p.id === provider.id ? updated : p));
                            handleSaveProvider(updated);
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            provider.is_enabled ? 'bg-orange-600' : 'bg-stone-800'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                              provider.is_enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* API Keys Configuration if enabled */}
                    {provider.is_enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-stone-800/80">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                            Clé Publique / Marchand ID
                          </label>
                          <input
                            type="text"
                            value={provider.public_key || ''}
                            onChange={e => {
                              const updated = { ...provider, public_key: e.target.value };
                              setProvidersList(prev => prev.map(p => p.id === provider.id ? updated : p));
                            }}
                            placeholder="ex: wave_pk_live_..."
                            className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-semibold text-stone-400">
                              Clé Secrète / Jeton Webhook
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowKeys(p => ({ ...p, [provider.id]: !p[provider.id] }))}
                              className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1"
                            >
                              {showKeys[provider.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{showKeys[provider.id] ? 'Masquer' : 'Afficher'}</span>
                            </button>
                          </div>
                          <input
                            type={showKeys[provider.id] ? 'text' : 'password'}
                            value={provider.secret_key || ''}
                            onChange={e => {
                              const updated = { ...provider, secret_key: e.target.value };
                              setProvidersList(prev => prev.map(p => p.id === provider.id ? updated : p));
                            }}
                            placeholder="••••••••••••••••••••••••"
                            className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between pt-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                            <input
                              type="checkbox"
                              checked={provider.is_sandbox}
                              onChange={e => {
                                const updated = { ...provider, is_sandbox: e.target.checked };
                                setProvidersList(prev => prev.map(p => p.id === provider.id ? updated : p));
                                handleSaveProvider(updated);
                              }}
                              className="rounded border-stone-800 text-orange-600 focus:ring-0 bg-stone-900"
                            />
                            <span>Activer le mode Sandbox (simuler les paiements sans débit réel)</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleSaveProvider(provider)}
                            className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition"
                          >
                            Sauvegarder cette passerelle
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GLOBAL FEATURE FLAGS */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <Sliders className="w-5 h-5 text-orange-400" />
                <span>Interrupteurs Globaux de Fonctionnalités (Master Switches)</span>
              </h3>
              <p className="text-xs text-stone-400 mb-6">
                Désactiver une option ici la désactivera pour TOUS les restaurants de la plateforme, quel que soit leur abonnement.
              </p>

              <div className="divide-y divide-stone-800">
                {[
                  {
                    key: 'custom_domain' as keyof GlobalFeatureFlags,
                    label: 'Connexion de Noms de Domaine Dédiés',
                    desc: 'Permet aux restaurants de connecter leur propre nom de domaine DNS (ex: chezalpha.com).'
                  },
                  {
                    key: 'online_ordering' as keyof GlobalFeatureFlags,
                    label: 'Prise de Commandes en Ligne & Paniers',
                    desc: 'Active la sélection de plats et la soumission du panier par les clients finaux.'
                  },
                  {
                    key: 'table_ordering' as keyof GlobalFeatureFlags,
                    label: 'Commandes Directes à Table (QR Code Table)',
                    desc: 'Attribue automatiquement le numéro de table via le paramètre URL (?table=X).'
                  },
                  {
                    key: 'whatsapp_notifications' as keyof GlobalFeatureFlags,
                    label: 'Notifications et Envoi de Commandes par WhatsApp',
                    desc: 'Permet l’envoi de la synthèse de commande directement sur le WhatsApp du restaurant.'
                  },
                  {
                    key: 'multi_staff' as keyof GlobalFeatureFlags,
                    label: 'Gestion d’Équipe & Comptes Employés',
                    desc: 'Permet aux restaurateurs de créer des accès cuisine, serveurs et managers.'
                  },
                  {
                    key: 'analytics_advanced' as keyof GlobalFeatureFlags,
                    label: 'Analytiques Avancées & Rapports Financiers',
                    desc: 'Tableaux de bord d’affluence, heures de pointe et métriques de marge.'
                  },
                  {
                    key: 'custom_branding' as keyof GlobalFeatureFlags,
                    label: 'Marque Blanche & Suppression Mention RESTO QR',
                    desc: 'Masque le badge de la plateforme dans le pied de page des sites clients.'
                  },
                ].map(item => {
                  const isEnabled = saasSettings.feature_flags[item.key] !== false;
                  return (
                    <div key={item.key} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5">{item.desc}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleGlobalFeatureFlag(item.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          isEnabled ? 'bg-orange-600' : 'bg-stone-800'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GENERAL & SYSTEM */}
        {activeTab === 'general' && (
          <form onSubmit={handleGeneralSave} className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-400" />
                <span>Disponibilité & Inscriptions</span>
              </h3>

              <div className="divide-y divide-stone-800/80">
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white">Mode Maintenance Global</div>
                    <div className="text-[11px] text-stone-400">
                      Verrouille l'accès public et affiche un écran d'indisponibilité technique.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneralData(p => ({ ...p, maintenance_mode: !p.maintenance_mode }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      generalData.maintenance_mode ? 'bg-red-600' : 'bg-stone-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                        generalData.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white">Autoriser les Nouvelles Inscriptions</div>
                    <div className="text-[11px] text-stone-400">
                      Permet aux nouveaux restaurants de s'enregistrer via /register.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneralData(p => ({ ...p, allow_new_registrations: !p.allow_new_registrations }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      generalData.allow_new_registrations ? 'bg-orange-600' : 'bg-stone-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                        generalData.allow_new_registrations ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les Paramètres Système</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </OwnerLayout>
  );
};
