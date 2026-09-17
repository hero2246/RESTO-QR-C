import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  CreditCard, 
  Search, 
  ArrowUpRight, 
  Calendar, 
  RefreshCw,
  Zap,
  Lock,
  Plus,
  Phone,
  Check,
  X,
  XCircle,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

interface OwnerSubscriptionsPageProps {
  navigate: (path: string) => void;
}

export const OwnerSubscriptionsPage: React.FC<OwnerSubscriptionsPageProps> = ({ navigate }) => {
  const { 
    restaurants, 
    saasPlans, 
    getEffectivePlan, 
    getRestaurantUsage, 
    adminOverridePlan, 
    removeAdminOverride,
    changeRestaurantPlan,
    subscriptions,
    verifySubscriptionPayment
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');
  const [selectedRestoForOverride, setSelectedRestoForOverride] = useState<string | null>(null);
  const [overridePlanId, setOverridePlanId] = useState<string>('PRO');
  const [overrideDays, setOverrideDays] = useState<number>(30);
  const [overrideReason, setOverrideReason] = useState<string>('Offre promotionnelle accordée par le Super Admin');

  // Quick Plan Change modal
  const [changePlanRestoId, setChangePlanRestoId] = useState<string | null>(null);
  const [targetPlanId, setTargetPlanId] = useState<string>('PRO');

  // Payment Verification Modal (Prompt Maître #7)
  const [verificationModal, setVerificationModal] = useState<{
    subId: string;
    action: 'CONFIRM' | 'REJECT' | 'REQUEST_PROOF';
    sub: any;
    restoName: string;
  } | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.owner_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || r.plan_id === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestoForOverride) return;
    adminOverridePlan(selectedRestoForOverride, overridePlanId, overrideDays, overrideReason);
    setSelectedRestoForOverride(null);
  };

  const handleChangePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePlanRestoId) return;
    changeRestaurantPlan(changePlanRestoId, targetPlanId, 'monthly');
    setChangePlanRestoId(null);
  };

  return (
    <OwnerLayout
      currentPath="/owner/subscriptions"
      navigate={navigate}
      title="Abonnements des Établissements & Gestion des Quotas"
      subtitle="Supervision en temps réel des quotas, surclassements VIP et dérogations manuelles"
    >
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Global Subscription KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Restaurants Actifs</div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{restaurants.length}</div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% connectés à l'infrastructure SaaS</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Abonnés Forfaits Payants</div>
            <div className="text-2xl font-black text-orange-400 mt-1 font-mono">
              {restaurants.filter(r => r.plan_id !== 'FREE').length}
            </div>
            <div className="text-[11px] text-stone-400 mt-2">
              Taux de conversion : {Math.round((restaurants.filter(r => r.plan_id !== 'FREE').length / (restaurants.length || 1)) * 100)}%
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Dérogations VIP Actives</div>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
              {restaurants.filter(r => r.admin_override && new Date(r.admin_override.override_expires_at).getTime() > Date.now()).length}
            </div>
            <div className="text-[11px] text-amber-400/80 mt-2 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Accès surclassé Super Admin</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Alertes Quotas &gt; 80%</div>
            <div className="text-2xl font-black text-red-400 mt-1 font-mono">
              {restaurants.filter(r => {
                const u = getRestaurantUsage(r.id);
                const pLimit = u.limits.max_products;
                return pLimit > 0 && (u.products_count / pLimit) >= 0.8;
              }).length}
            </div>
            <div className="text-[11px] text-red-400/80 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Prêts pour un upsell</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION CLÉ : VALIDATION DES PAIEMENTS MOBILE MONEY (PROMPT MAÎTRE #7)    */}
        {/* ========================================================================= */}
        {(() => {
          const pendingSubs = subscriptions.filter(
            s => s.payment_status === 'PENDING_VERIFICATION' || s.payment_status === 'PENDING_PROOF'
          );

          return (
            <div className={`p-6 rounded-3xl border-2 transition ${
              pendingSubs.length > 0
                ? 'bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border-amber-500/40 shadow-2xl'
                : 'bg-stone-900 border-stone-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    pendingSubs.length > 0 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20' 
                      : 'bg-stone-800 text-stone-400'
                  }`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>Centre de Validation des Paiements Mobile Money</span>
                      {pendingSubs.length > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold animate-pulse">
                          {pendingSubs.length} en attente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          À jour
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Vérifiez les paiements Mobile Money (Wave / OM) déclarés par les restaurants et confirmez, demandez une preuve ou refusez.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-stone-400">
                  Mode Simple : Confirmation manuelle sans transmission de secrets bancaires
                </div>
              </div>

              {pendingSubs.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Aucun paiement Mobile Money en attente de traitement actuellement.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSubs.map(sub => {
                    const resto = restaurants.find(r => r.id === sub.restaurant_id);
                    const plan = saasPlans.find(p => p.id === sub.plan_id);

                    return (
                      <div 
                        key={sub.id}
                        className="p-5 rounded-2xl bg-stone-950 border border-stone-800/80 hover:border-amber-500/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-white">{resto?.name || sub.restaurant_id}</span>
                            <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-[11px] font-bold border border-orange-500/20">
                              Demande Forfait {plan?.name || sub.plan_id}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[11px] font-mono">
                              {sub.amount ? `${sub.amount.toLocaleString('fr-FR')} FCFA` : '5 000 FCFA'} ({sub.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'})
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.payment_status === 'PENDING_PROOF'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {sub.payment_status === 'PENDING_PROOF' ? 'Preuve demandée' : 'Vérification requise'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-stone-300">Fournisseur :</span> {sub.payment_provider || sub.payment_method || 'Wave'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-stone-300">Réf transaction :</span>
                              <code className="bg-stone-900 px-2 py-0.5 rounded text-orange-400 font-mono font-bold">
                                {sub.payment_reference || sub.transaction_id || 'Non renseigné'}
                              </code>
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-stone-500">
                              <Clock className="w-3 h-3" />
                              {new Date(sub.verification_requested_at || sub.created_at).toLocaleString('fr-FR')}
                            </span>
                          </div>

                          {sub.proof_notes && (
                            <div className="text-xs text-stone-300 bg-stone-900/80 p-2.5 rounded-xl border border-stone-800 max-w-2xl">
                              <span className="text-stone-500 font-semibold block text-[10px] uppercase">Message du restaurant :</span>
                              {sub.proof_notes}
                            </div>
                          )}
                        </div>

                        {/* Decision Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* 1. CONFIRMER */}
                          <button
                            type="button"
                            onClick={() => setVerificationModal({
                              subId: sub.id,
                              action: 'CONFIRM',
                              sub,
                              restoName: resto?.name || 'Restaurant'
                            })}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmer & Activer</span>
                          </button>

                          {/* 2. DEMANDER UNE PREUVE */}
                          <button
                            type="button"
                            onClick={() => setVerificationModal({
                              subId: sub.id,
                              action: 'REQUEST_PROOF',
                              sub,
                              restoName: resto?.name || 'Restaurant'
                            })}
                            className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Demander Preuve</span>
                          </button>

                          {/* 3. REFUSER */}
                          <button
                            type="button"
                            onClick={() => setVerificationModal({
                              subId: sub.id,
                              action: 'REJECT',
                              sub,
                              restoName: resto?.name || 'Restaurant'
                            })}
                            className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Refuser</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })()}

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-stone-900 border border-stone-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-stone-400 font-semibold shrink-0">Filtrer par plan :</span>
            <button
              onClick={() => setFilterPlan('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                filterPlan === 'ALL' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              Tous ({restaurants.length})
            </button>
            {saasPlans.map(plan => (
              <button
                key={plan.id}
                onClick={() => setFilterPlan(plan.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  filterPlan === plan.id 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {plan.name} ({restaurants.filter(r => r.plan_id === plan.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* Table of Subscriptions & Quotas */}
        <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] font-bold border-b border-stone-800 tracking-wider">
                <tr>
                  <th className="px-5 py-4">Établissement</th>
                  <th className="px-4 py-4">Plan Actuel</th>
                  <th className="px-4 py-4">Quota Produits</th>
                  <th className="px-4 py-4">Quota Staff</th>
                  <th className="px-4 py-4">Quota Tables</th>
                  <th className="px-4 py-4">Dérogation Super Admin</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                      Aucun établissement trouvé pour ces critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredRestaurants.map(restaurant => {
                    const effectivePlan = getEffectivePlan(restaurant.id);
                    const usage = getRestaurantUsage(restaurant.id);
                    const hasOverride = usage.isOverridden;

                    const prodPct = usage.limits.max_products === -1 ? 0 : Math.min(100, Math.round((usage.products_count / usage.limits.max_products) * 100));
                    const staffPct = usage.limits.max_staff === -1 ? 0 : Math.min(100, Math.round((usage.staff_count / usage.limits.max_staff) * 100));
                    const tablesPct = usage.limits.max_tables === -1 ? 0 : Math.min(100, Math.round((usage.tables_count / usage.limits.max_tables) * 100));

                    return (
                      <tr key={restaurant.id} className="hover:bg-stone-800/40 transition">
                        
                        {/* Restaurant identity */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm">{restaurant.name}</div>
                          <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                            <span>{restaurant.city || 'Sénégal'}</span>
                            <span>•</span>
                            <span className="font-mono text-stone-500">{restaurant.slug}</span>
                          </div>
                        </td>

                        {/* Current Plan */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              effectivePlan.id === 'PREMIUM' 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : effectivePlan.id === 'PRO'
                                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                  : 'bg-stone-800 text-stone-300'
                            }`}>
                              {effectivePlan.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500 mt-1 font-mono">
                            {effectivePlan.price_monthly > 0 ? `${effectivePlan.price_monthly.toLocaleString('fr-FR')} FCFA/m` : 'Gratuit'}
                          </div>
                        </td>

                        {/* Products Quota */}
                        <td className="px-4 py-4 min-w-[140px]">
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-white font-bold">{usage.products_count}</span>
                            <span className="text-stone-400">
                              {usage.limits.max_products === -1 ? 'Illimité' : `/ ${usage.limits.max_products}`}
                            </span>
                          </div>
                          {usage.limits.max_products !== -1 && (
                            <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${prodPct >= 90 ? 'bg-red-500' : prodPct >= 75 ? 'bg-amber-500' : 'bg-orange-500'}`}
                                style={{ width: `${prodPct}%` }}
                              />
                            </div>
                          )}
                        </td>

                        {/* Staff Quota */}
                        <td className="px-4 py-4 min-w-[120px]">
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-white font-bold">{usage.staff_count}</span>
                            <span className="text-stone-400">
                              {usage.limits.max_staff === -1 ? 'Illimité' : `/ ${usage.limits.max_staff}`}
                            </span>
                          </div>
                          {usage.limits.max_staff !== -1 && (
                            <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${staffPct >= 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${staffPct}%` }}
                              />
                            </div>
                          )}
                        </td>

                        {/* Tables Quota */}
                        <td className="px-4 py-4 min-w-[120px]">
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-white font-bold">{usage.tables_count}</span>
                            <span className="text-stone-400">
                              {usage.limits.max_tables === -1 ? 'Illimité' : `/ ${usage.limits.max_tables}`}
                            </span>
                          </div>
                          {usage.limits.max_tables !== -1 && (
                            <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${tablesPct >= 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${tablesPct}%` }}
                              />
                            </div>
                          )}
                        </td>

                        {/* Admin Override Status */}
                        <td className="px-4 py-4">
                          {hasOverride ? (
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                              <div className="font-bold flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span>Surclassé : {restaurant.admin_override?.override_plan}</span>
                              </div>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                Expire le {new Date(restaurant.admin_override!.override_expires_at).toLocaleDateString('fr-FR')}
                              </div>
                              <button
                                onClick={() => removeAdminOverride(restaurant.id)}
                                className="text-[10px] text-red-400 hover:underline mt-1 block"
                              >
                                Révoquer la dérogation
                              </button>
                            </div>
                          ) : (
                            <span className="text-stone-500 text-[11px]">Aucune</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setChangePlanRestoId(restaurant.id);
                                setTargetPlanId(restaurant.plan_id);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
                              title="Changer de forfait"
                            >
                              Changer Plan
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRestoForOverride(restaurant.id);
                                setOverridePlanId('PRO');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1"
                              title="Dérogation Super Admin"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>Dérogation VIP</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Apply Admin Override */}
        {selectedRestoForOverride && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Dérogation Plan Super Admin</h3>
                    <p className="text-xs text-stone-400">
                      Établissement : {restaurants.find(r => r.id === selectedRestoForOverride)?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRestoForOverride(null)}
                  className="text-stone-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Le Super Admin peut attribuer temporairement un forfait supérieur (PRO ou PREMIUM) à titre gracieux ou dans le cadre d’un accord commercial, sans impacter la facturation automatique.
              </p>

              <form onSubmit={handleApplyOverride} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Plan accordé</label>
                  <select
                    value={overridePlanId}
                    onChange={e => setOverridePlanId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                  >
                    {saasPlans.filter(p => p.id !== 'FREE').map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Durée de la dérogation (en jours)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={overrideDays}
                    onChange={e => setOverrideDays(parseInt(e.target.value) || 30)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Motif / Justification</label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRestoForOverride(null)}
                    className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                  >
                    Valider la Dérogation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Change Plan */}
        {changePlanRestoId && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Changement Manuel de Forfait</h3>
                  <p className="text-xs text-stone-400">
                    {restaurants.find(r => r.id === changePlanRestoId)?.name}
                  </p>
                </div>
                <button
                  onClick={() => setChangePlanRestoId(null)}
                  className="text-stone-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangePlanSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Sélectionner le nouveau forfait</label>
                  <select
                    value={targetPlanId}
                    onChange={e => setTargetPlanId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                  >
                    {saasPlans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.price_monthly > 0 ? `${p.price_monthly.toLocaleString('fr-FR')} FCFA/mois` : 'Gratuit'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setChangePlanRestoId(null)}
                    className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                  >
                    Appliquer le Forfait
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Verification Payment (Prompt Maître #7) */}
        {verificationModal && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-stone-200">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  {verificationModal.action === 'CONFIRM' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {verificationModal.action === 'REQUEST_PROOF' && <HelpCircle className="w-5 h-5 text-blue-400" />}
                  {verificationModal.action === 'REJECT' && <XCircle className="w-5 h-5 text-red-400" />}
                  <h3 className="text-base font-bold text-white">
                    {verificationModal.action === 'CONFIRM' && 'Confirmer le Paiement Mobile Money'}
                    {verificationModal.action === 'REQUEST_PROOF' && 'Demander une Preuve au Restaurant'}
                    {verificationModal.action === 'REJECT' && 'Refuser la Transaction'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setVerificationModal(null);
                    setVerificationNotes('');
                  }}
                  className="text-stone-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Details */}
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Établissement :</span>
                  <span className="font-bold text-white">{verificationModal.restoName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Formule demandée :</span>
                  <span className="font-bold text-orange-400">{verificationModal.sub.plan_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Montant :</span>
                  <span className="font-mono text-white font-bold">
                    {verificationModal.sub.amount ? `${verificationModal.sub.amount.toLocaleString('fr-FR')} FCFA` : '5 000 FCFA'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Réf transaction :</span>
                  <code className="font-mono text-amber-400 font-bold">
                    {verificationModal.sub.payment_reference || verificationModal.sub.transaction_id || 'Non spécifiée'}
                  </code>
                </div>
              </div>

              {verificationModal.action === 'CONFIRM' && (
                <div className="text-xs text-stone-400 space-y-2">
                  <p>
                    En confirmant, l'abonnement passera au statut <span className="text-emerald-400 font-bold">PAID</span> et le restaurant bénéficiera immédiatement de toutes les fonctionnalités et quotas illimités du forfait.
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Une facture officielle d'encaissement sera également générée et archivée.
                  </p>
                </div>
              )}

              {(verificationModal.action === 'REQUEST_PROOF' || verificationModal.action === 'REJECT') && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-300">
                    {verificationModal.action === 'REQUEST_PROOF' 
                      ? 'Préciser la preuve requise ou le message :' 
                      : 'Motif du rejet (communiqué au restaurant) :'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={verificationNotes}
                    onChange={e => setVerificationNotes(e.target.value)}
                    placeholder={verificationModal.action === 'REQUEST_PROOF' 
                      ? 'Ex: Merci de nous envoyer une capture SMS du transfert Wave ou de vérifier le numéro de transaction.'
                      : 'Ex: Le numéro de transaction ne correspond à aucun encaissement sur notre relevé.'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationModal(null);
                    setVerificationNotes('');
                  }}
                  className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    verifySubscriptionPayment(
                      verificationModal.subId,
                      verificationModal.action,
                      verificationNotes.trim() || undefined
                    );
                    setVerificationModal(null);
                    setVerificationNotes('');
                  }}
                  className={`py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition ${
                    verificationModal.action === 'CONFIRM' 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' 
                      : verificationModal.action === 'REQUEST_PROOF'
                        ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                        : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                  }`}
                >
                  {verificationModal.action === 'CONFIRM' && 'Confirmer & Activer'}
                  {verificationModal.action === 'REQUEST_PROOF' && 'Demander Preuve'}
                  {verificationModal.action === 'REJECT' && 'Confirmer Rejet'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </OwnerLayout>
  );
};
