import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { SaasPlan } from '../../types';
import { 
  CreditCard, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sliders, 
  Star,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface OwnerPlansPageProps {
  navigate: (path: string) => void;
}

export const OwnerPlansPage: React.FC<OwnerPlansPageProps> = ({ navigate }) => {
  const { 
    saasPlans, 
    addSaasPlan, 
    updateSaasPlan, 
    deleteSaasPlan, 
    togglePlanActive, 
    restaurants,
    saasSettings,
    updateMonetizationSettings,
    showToast 
  } = useApp();

  const [editingPlan, setEditingPlan] = useState<SaasPlan | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New plan form state
  const [newPlanData, setNewPlanData] = useState<Partial<SaasPlan>>({
    name: 'Pack Entreprise & Franchise',
    badge: 'ENTERPRISE',
    description: 'Solution sur mesure pour chaînes de restaurants et multi-sites',
    price_monthly: 25000,
    price_yearly: 240000,
    currency: 'FCFA',
    is_active: true,
    is_popular: false,
    trial_days: 14,
    features: [
      'Multi-établissements centralisés',
      'Menu QR Code illimité',
      'Commandes à table en temps réel',
      'Notifications WhatsApp automatiques',
      'Domaine personnalisé avec certificat SSL',
      'Support téléphonique 24/7'
    ],
    limits: {
      max_products: -1,
      max_categories: -1,
      max_staff: 25,
      max_tables: 100,
      max_monthly_orders: -1,
      max_custom_domains: 5,
      max_gallery_images: 100,
      storage_mb: 2000
    },
    feature_flags: {
      custom_domain: true,
      online_ordering: true,
      table_ordering: true,
      whatsapp_notifications: true,
      analytics_advanced: true,
      multi_staff: true,
      custom_branding: true,
      promotions_and_coupons: true,
      customer_reviews: true,
      priority_support: true,
      export_data: true
    }
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updateSaasPlan(editingPlan.id, editingPlan);
    setEditingPlan(null);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    addSaasPlan(newPlanData);
    setIsCreatingNew(false);
  };

  return (
    <OwnerLayout
      currentPath="/owner/plans"
      navigate={navigate}
      title="Gestion Complète des Plans SaaS & Quotas"
      subtitle="Contrôle absolu des forfaits : limites de produits, employés, tarifs et fonctionnalités incluses"
      actions={
        <button
          onClick={() => setIsCreatingNew(true)}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Nouveau Plan</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* ========================================================================= */}
        {/* BANDEAU CLÉ : ACTIVATION PAIEMENTS PRO & FORFAIT GRATUIT */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-850 border-2 border-orange-500/30 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>Activation Rapide : Forfait Gratuit & Paiements PRO</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold">
                    Direct
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Basculez directement l'accès au plan FREE et l'obligation de règlement en ligne pour le plan PRO.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  updateMonetizationSettings({ free_plan_enabled: true, payment_required: true });
                  showToast('Mode Freemium appliqué (Gratuit actif + PRO payant)', 'success');
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition border border-stone-700 hover:border-orange-500 cursor-pointer"
              >
                Freemium
              </button>
              <button
                type="button"
                onClick={() => {
                  updateMonetizationSettings({ free_plan_enabled: true, payment_required: false });
                  showToast('Mode 100% Gratuit activé pour tous les plans', 'info');
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition border border-stone-700 hover:border-blue-500 cursor-pointer"
              >
                100% Gratuit
              </button>
              <button
                type="button"
                onClick={() => {
                  updateMonetizationSettings({ free_plan_enabled: false, payment_required: true });
                  showToast('Mode Paiement Requis activé (Gratuit fermé)', 'warning');
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition border border-stone-700 hover:border-amber-500 cursor-pointer"
              >
                Paiement Strict
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Toggle Gratuit */}
            <div 
              onClick={() => {
                const next = !saasSettings.monetization.free_plan_enabled;
                updateMonetizationSettings({ free_plan_enabled: next });
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                saasSettings.monetization.free_plan_enabled
                  ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  saasSettings.monetization.free_plan_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-600'
                }`} />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Forfait Gratuit (FREE)</span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {saasSettings.monetization.free_plan_enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {saasSettings.monetization.free_plan_enabled ? 'Les restaurants peuvent débuter sans frais' : 'Inscription gratuite fermée'}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                saasSettings.monetization.free_plan_enabled ? 'bg-emerald-500 text-black' : 'bg-stone-800 text-stone-400'
              }`}>
                {saasSettings.monetization.free_plan_enabled ? 'Actif' : 'Fermé'}
              </span>
            </div>

            {/* Toggle PRO Payment */}
            <div 
              onClick={() => {
                const next = !saasSettings.monetization.payment_required;
                updateMonetizationSettings({ payment_required: next });
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                saasSettings.monetization.payment_required
                  ? 'bg-orange-950/20 border-orange-500/40 hover:border-orange-400'
                  : 'bg-blue-950/20 border-blue-500/40 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  saasSettings.monetization.payment_required ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'
                }`} />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Paiement en Ligne PRO</span>
                    <span className="text-[10px] text-orange-400 font-bold">
                      {saasSettings.monetization.payment_required ? 'EXIGÉ (Wave/OM/CB)' : 'MODE DÉCOUVERTE'}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {saasSettings.monetization.payment_required ? 'Passerelle de paiement en ligne obligatoire' : 'Activation immédiate sans transaction'}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                saasSettings.monetization.payment_required ? 'bg-orange-500 text-black' : 'bg-blue-500 text-white'
              }`}>
                {saasSettings.monetization.payment_required ? 'Payant' : 'Libre'}
              </span>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {saasPlans.filter(p => p.is_active).length} Forfaits Actifs sur la Vitrine
              </div>
              <div className="text-[11px] text-stone-400">
                Mode actuel : {saasSettings.monetization.payment_required ? 'Paiement en ligne obligatoire' : 'Activation directe permise'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Devise active :</span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 font-mono font-bold text-amber-400">
              {saasSettings.monetization.currency || 'FCFA'}
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {saasPlans.map(plan => {
            const subscribersCount = restaurants.filter(r => r.plan_id === plan.id).length;

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl border transition flex flex-col justify-between space-y-6 relative ${
                  !plan.is_active 
                    ? 'bg-stone-950/60 border-stone-800/60 opacity-60'
                    : plan.is_popular
                      ? 'bg-gradient-to-b from-stone-900 to-stone-950 border-orange-500/50 shadow-xl shadow-orange-500/5'
                      : 'bg-stone-900 border-stone-800'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-md shadow-orange-600/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Recommandé</span>
                  </div>
                )}

                <div className="space-y-4">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">{plan.name}</h3>
                        {!plan.is_active && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 text-[10px] font-bold">
                            Inactif
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">Code : {plan.id}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 text-xs font-semibold">
                      {subscribersCount} abonnés
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 min-h-[32px]">{plan.description}</p>

                  {/* Price Block */}
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white font-mono">
                        {plan.price_monthly.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs text-amber-400 font-bold">FCFA</span>
                      <span className="text-[11px] text-stone-400">/ mois</span>
                    </div>
                    {plan.price_yearly > 0 && (
                      <div className="text-[11px] text-stone-500 font-mono mt-1">
                        ou {plan.price_yearly.toLocaleString('fr-FR')} FCFA / an (remise)
                      </div>
                    )}
                  </div>

                  {/* Quotas & Limites */}
                  <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                      Quotas & Limites :
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Max Produits :</span>
                      <span className="font-mono font-bold text-white">
                        {plan.limits.max_products === -1 ? 'Illimité' : plan.limits.max_products}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Max Catégories :</span>
                      <span className="font-mono font-bold text-white">
                        {plan.limits.max_categories === -1 ? 'Illimité' : plan.limits.max_categories}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Max Collaborateurs :</span>
                      <span className="font-mono font-bold text-white">
                        {plan.limits.max_staff === -1 ? 'Illimité' : plan.limits.max_staff}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Max Tables QR Code :</span>
                      <span className="font-mono font-bold text-white">
                        {plan.limits.max_tables === -1 ? 'Illimité' : plan.limits.max_tables}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Commandes / mois :</span>
                      <span className="font-mono font-bold text-white">
                        {plan.limits.max_monthly_orders === -1 ? 'Illimité' : plan.limits.max_monthly_orders}
                      </span>
                    </div>
                  </div>

                  {/* Feature flags in this plan */}
                  <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Fonctionnalités Incluses :
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                      <div className="flex items-center gap-2">
                        {plan.feature_flags.custom_domain ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                        )}
                        <span className={plan.feature_flags.custom_domain ? 'text-stone-200' : 'text-stone-500 line-through'}>
                          Nom de domaine personnalisé
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plan.feature_flags.online_ordering ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                        )}
                        <span className={plan.feature_flags.online_ordering ? 'text-stone-200' : 'text-stone-500 line-through'}>
                          Commandes & Paniers en ligne
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plan.feature_flags.whatsapp_notifications ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                        )}
                        <span className={plan.feature_flags.whatsapp_notifications ? 'text-stone-200' : 'text-stone-500 line-through'}>
                          Envoi automatique WhatsApp
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plan.feature_flags.custom_branding ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                        )}
                        <span className={plan.feature_flags.custom_branding ? 'text-stone-200' : 'text-stone-500 line-through'}>
                          Marque blanche (sans logo SaaS)
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier les Quotas & Droits</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePlanActive(plan.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${
                        plan.is_active 
                          ? 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {plan.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{plan.is_active ? 'Désactiver' : 'Activer'}</span>
                    </button>

                    {plan.id !== 'FREE' && plan.id !== 'PRO' && (
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer définitivement le plan ${plan.name} ?`)) {
                            deleteSaasPlan(plan.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        title="Supprimer le plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Modal EDIT PLAN */}
        {editingPlan && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Modifier le Forfait : {editingPlan.name}</h3>
                  <p className="text-xs text-stone-400 font-mono">Identifiant technique : {editingPlan.id}</p>
                </div>
                <button
                  onClick={() => setEditingPlan(null)}
                  className="text-stone-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-5">
                
                {/* Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Nom Commercial</label>
                    <input
                      type="text"
                      value={editingPlan.name}
                      onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Badge Affiché</label>
                    <input
                      type="text"
                      value={editingPlan.badge || ''}
                      onChange={e => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                      placeholder="ex: POPULAIRE, PRO, VIP"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Prix Mensuel (FCFA)</label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={editingPlan.price_monthly}
                      onChange={e => setEditingPlan({ ...editingPlan, price_monthly: parseInt(e.target.value) || 0 })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Prix Annuel (FCFA)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={editingPlan.price_yearly}
                      onChange={e => setEditingPlan({ ...editingPlan, price_yearly: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Quotas / Limits */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Limites & Quotas Techniques (-1 = Illimité)</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Max Produits</label>
                      <input
                        type="number"
                        value={editingPlan.limits.max_products}
                        onChange={e => setEditingPlan({
                          ...editingPlan,
                          limits: { ...editingPlan.limits, max_products: parseInt(e.target.value) || -1 }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Max Catégories</label>
                      <input
                        type="number"
                        value={editingPlan.limits.max_categories}
                        onChange={e => setEditingPlan({
                          ...editingPlan,
                          limits: { ...editingPlan.limits, max_categories: parseInt(e.target.value) || -1 }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Max Staff</label>
                      <input
                        type="number"
                        value={editingPlan.limits.max_staff}
                        onChange={e => setEditingPlan({
                          ...editingPlan,
                          limits: { ...editingPlan.limits, max_staff: parseInt(e.target.value) || 1 }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Max Tables</label>
                      <input
                        type="number"
                        value={editingPlan.limits.max_tables}
                        onChange={e => setEditingPlan({
                          ...editingPlan,
                          limits: { ...editingPlan.limits, max_tables: parseInt(e.target.value) || -1 }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Features toggles */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Fonctionnalités Incluses dans ce Forfait
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { key: 'custom_domain' as const, label: 'Nom de domaine personnalisé' },
                      { key: 'online_ordering' as const, label: 'Prise de commandes en ligne' },
                      { key: 'table_ordering' as const, label: 'Commandes QR Code à table' },
                      { key: 'whatsapp_notifications' as const, label: 'Notifications WhatsApp' },
                      { key: 'multi_staff' as const, label: 'Gestion multi-employés' },
                      { key: 'custom_branding' as const, label: 'Marque blanche personnalisée' },
                      { key: 'promotions_and_coupons' as const, label: 'Codes promos & Réductions' },
                      { key: 'customer_reviews' as const, label: 'Avis & Évaluations clients' },
                      { key: 'priority_support' as const, label: 'Support prioritaire 24/7' },
                      { key: 'export_data' as const, label: 'Export des ventes Excel/CSV' },
                    ].map(feat => (
                      <label key={feat.key} className="flex items-center gap-2 p-2 rounded-xl bg-stone-900 border border-stone-800/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPlan.feature_flags[feat.key]}
                          onChange={e => setEditingPlan({
                            ...editingPlan,
                            feature_flags: {
                              ...editingPlan.feature_flags,
                              [feat.key]: e.target.checked
                            }
                          })}
                          className="rounded border-stone-800 text-orange-600 focus:ring-0 bg-stone-950"
                        />
                        <span className="text-stone-200">{feat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-600/20"
                  >
                    Enregistrer les Modifications
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* Modal CREATE PLAN */}
        {isCreatingNew && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Créer un Nouveau Plan SaaS</h3>
                  <p className="text-xs text-stone-400">Définissez une nouvelle offre commerciale pour vos restaurants</p>
                </div>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="text-stone-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Nom du Forfait</label>
                    <input
                      type="text"
                      value={newPlanData.name}
                      onChange={e => setNewPlanData({ ...newPlanData, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Identifiant Code Unique</label>
                    <input
                      type="text"
                      value={newPlanData.badge}
                      onChange={e => setNewPlanData({ ...newPlanData, badge: e.target.value, id: e.target.value.toUpperCase() })}
                      required
                      placeholder="ex: ENTERPRISE, VIP"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Prix Mensuel (FCFA)</label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={newPlanData.price_monthly}
                      onChange={e => setNewPlanData({ ...newPlanData, price_monthly: parseInt(e.target.value) || 0 })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Prix Annuel (FCFA)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={newPlanData.price_yearly}
                      onChange={e => setNewPlanData({ ...newPlanData, price_yearly: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Quotas */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                    Quotas Alloués (-1 = Illimité)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Max Produits</label>
                      <input
                        type="number"
                        value={newPlanData.limits?.max_products}
                        onChange={e => setNewPlanData({
                          ...newPlanData,
                          limits: { ...newPlanData.limits!, max_products: parseInt(e.target.value) || -1 }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Max Staff</label>
                      <input
                        type="number"
                        value={newPlanData.limits?.max_staff}
                        onChange={e => setNewPlanData({
                          ...newPlanData,
                          limits: { ...newPlanData.limits!, max_staff: parseInt(e.target.value) || 1 }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Max Tables</label>
                      <input
                        type="number"
                        value={newPlanData.limits?.max_tables}
                        onChange={e => setNewPlanData({
                          ...newPlanData,
                          limits: { ...newPlanData.limits!, max_tables: parseInt(e.target.value) || -1 }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Commandes/m</label>
                      <input
                        type="number"
                        value={newPlanData.limits?.max_monthly_orders}
                        onChange={e => setNewPlanData({
                          ...newPlanData,
                          limits: { ...newPlanData.limits!, max_monthly_orders: parseInt(e.target.value) || -1 }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-600/20"
                  >
                    Publier le Nouveau Plan
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </OwnerLayout>
  );
};
