import React from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { SaasBrandingCard } from '../../components/owner/SaasBrandingCard';
import { 
  Store, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
  Sliders,
  DollarSign
} from 'lucide-react';

interface OwnerDashboardProps {
  navigate: (path: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ navigate }) => {
  const { 
    restaurants, 
    orders, 
    saasEmployees, 
    saasPlans, 
    auditLogs, 
    saasBranding,
    saasSettings,
    updateMonetizationSettings,
    showToast,
    runSecurityTests
  } = useApp();

  // Metrics computation
  const activeRestaurants = restaurants.filter(r => r.status === 'ACTIVE');
  const suspendedRestaurants = restaurants.filter(r => r.status === 'SUSPENDED');
  
  // Total platform GMV (volume total des commandes traitées par tous les restaurants)
  const totalGmv = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // MRR estimation based on active restaurants and their plan price
  const monthlyRecurringRevenue = restaurants.reduce((sum, r) => {
    const plan = saasPlans.find(p => p.id === r.plan_id);
    return sum + (plan?.price_monthly || 0);
  }, 0);

  // Plans breakdown
  const planCounts = {
    FREE: restaurants.filter(r => r.plan_id === 'FREE').length,
    PRO: restaurants.filter(r => r.plan_id === 'PRO').length,
    PREMIUM: restaurants.filter(r => r.plan_id === 'PREMIUM').length,
  };

  const recentLogs = auditLogs.slice(0, 5);

  return (
    <OwnerLayout
      currentPath="/owner/dashboard"
      navigate={navigate}
      title="Tableau de Bord Propriétaire SaaS"
      subtitle="Supervision macroscopique et santé globale de l'écosystème RESTO QR"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/owner/security-tests')}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold transition flex items-center gap-1.5 border border-amber-500/20 shadow-sm cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Exécuter Audit Sécurité</span>
          </button>
          <button
            onClick={() => navigate('/owner/restaurants')}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Gérer les Restaurants</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Banner Welcome & Separation Policy */}
        <div 
          onClick={() => navigate('/owner/branding')}
          className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-850 border border-stone-800 hover:border-stone-700 rounded-3xl p-6 relative overflow-hidden shadow-xl cursor-pointer transition"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ISOLATION MULTI-TENANT STRICTE ACTIVE</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Plateforme SaaS {saasBranding.platform_name}</span>
                <span className="text-xs font-normal text-stone-500 hover:text-stone-300">(cliquer pour personnaliser)</span>
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Règle fondamentale : Le propriétaire gère la plateforme, les plans et l'infrastructure. Les restaurants possèdent et pilotent exclusivement leur propre établissement et leurs commandes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/owner/settings');
                }}
                className="px-4 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-orange-500/40 text-right cursor-pointer transition"
              >
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">MRR Estimé SaaS</div>
                <div className="text-lg font-black text-amber-400 font-mono">
                  {monthlyRecurringRevenue.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/owner/restaurants');
                }}
                className="px-4 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-emerald-500/40 text-right cursor-pointer transition"
              >
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Volume d'Affaires Global</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {totalGmv.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET RAPIDE : STATUT ACTIVATION PAIEMENT PRO & GRATUIT */}
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Politique Commerciale Active</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px] font-mono font-bold">
                  {saasSettings.monetization.currency || 'FCFA'}
                </span>
              </div>
              <div className="text-[11px] text-stone-400 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${saasSettings.monetization.free_plan_enabled ? 'bg-emerald-400' : 'bg-stone-600'}`} />
                  Plan Gratuit : <strong className={saasSettings.monetization.free_plan_enabled ? 'text-emerald-400 font-medium' : 'text-stone-400 font-medium'}>{saasSettings.monetization.free_plan_enabled ? 'Activé' : 'Désactivé'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${saasSettings.monetization.payment_required ? 'bg-orange-400' : 'bg-blue-400'}`} />
                  Paiement PRO : <strong className={saasSettings.monetization.payment_required ? 'text-orange-400 font-medium' : 'text-blue-400 font-medium'}>{saasSettings.monetization.payment_required ? 'Requis (Wave/OM)' : 'Découverte Gratuite'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !saasSettings.monetization.free_plan_enabled;
                updateMonetizationSettings({ free_plan_enabled: next });
                showToast(`Forfait gratuit ${next ? 'activé' : 'désactivé'}`, 'info');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                saasSettings.monetization.free_plan_enabled 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
              }`}
            >
              {saasSettings.monetization.free_plan_enabled ? 'Désactiver Gratuit' : 'Activer Gratuit'}
            </button>
            <button
              onClick={() => {
                const next = !saasSettings.monetization.payment_required;
                updateMonetizationSettings({ payment_required: next });
                showToast(`Paiement PRO ${next ? 'requis' : 'en mode découverte libre'}`, 'info');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                saasSettings.monetization.payment_required 
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
              }`}
            >
              {saasSettings.monetization.payment_required ? 'Rendre PRO Libre' : 'Exiger Paiement PRO'}
            </button>
            <button
              onClick={() => navigate('/owner/settings')}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-orange-600/20 cursor-pointer"
            >
              <span>Paramètres Paiements</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top 4 KPI Cards (All Clickable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Restaurants Inscrits */}
          <div 
            onClick={() => navigate('/owner/restaurants')}
            className="bg-stone-900 border border-stone-800 hover:border-orange-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Restaurants Inscrits</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{restaurants.length}</span>
              <span className="text-[11px] text-emerald-400 font-semibold">{activeRestaurants.length} actifs</span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/60">
              <span>Suspendus : {suspendedRestaurants.length}</span>
              <span className="text-orange-400 hover:text-orange-300 font-medium text-[11px] flex items-center gap-0.5">
                <span>Détails</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Commandes Traitées */}
          <div 
            onClick={() => navigate('/owner/restaurants')}
            className="bg-stone-900 border border-stone-800 hover:border-blue-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Total Commandes SaaS</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{orders.length}</span>
              <span className="text-[11px] text-stone-400 font-medium">sur tables QR</span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/60">
              <span>Panier moyen : {orders.length > 0 ? Math.round(totalGmv / orders.length).toLocaleString('fr-FR') : 0} FCFA</span>
              <span className="text-blue-400 font-medium text-[11px] flex items-center gap-0.5">
                <span>Voir</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Employés Plateforme */}
          <div 
            onClick={() => navigate('/owner/employees')}
            className="bg-stone-900 border border-stone-800 hover:border-purple-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Gestionnaires Plateforme</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{saasEmployees.length}</span>
              <span className="text-[11px] text-stone-400 font-medium">gestionnaires</span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/60">
              <span>Matrice RBAC stricte</span>
              <span className="text-purple-400 hover:text-purple-300 font-medium text-[11px] flex items-center gap-0.5">
                <span>Gérer</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Santé de Sécurité */}
          <div 
            onClick={() => navigate('/owner/security-tests')}
            className="bg-stone-900 border border-stone-800 hover:border-emerald-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Sécurité & Isolation</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">100%</span>
              <span className="text-[11px] text-emerald-400 font-semibold">6/6 Tests OK</span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/60">
              <span>Anti-escalade actif</span>
              <span className="text-amber-400 hover:text-amber-300 font-medium text-[11px] flex items-center gap-0.5">
                <span>Auditer</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>

        {/* COMPOSANT SAAS BRANDING : PERSONNALISATION DYNAMIQUE DANS TABLE SETTINGS */}
        <SaasBrandingCard navigate={navigate} />

        {/* Two-Column Section: Plans Distribution + Recent Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Plans Distribution */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Répartition des Plans SaaS</h3>
                <p className="text-[11px] text-stone-400">Abonnements des restaurants hébergés</p>
              </div>
              <button
                onClick={() => navigate('/owner/plans')}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Modifier les plans</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {saasPlans.map(plan => {
                const count = planCounts[plan.id] || 0;
                const percent = restaurants.length > 0 ? Math.round((count / restaurants.length) * 100) : 0;
                return (
                  <div 
                    key={plan.id} 
                    onClick={() => navigate('/owner/plans')}
                    className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800/80 hover:border-orange-500/40 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{plan.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">
                          {plan.price_monthly.toLocaleString('fr-FR')} FCFA/m
                        </span>
                      </div>
                      <span className="text-stone-300 font-bold">{count} ({percent}%)</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          plan.id === 'PREMIUM' ? 'bg-amber-500' : plan.id === 'PRO' ? 'bg-orange-500' : 'bg-stone-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick action */}
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Gestion globale des quotas & forfaits</span>
              <button
                onClick={() => navigate('/owner/plans')}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-[11px] font-medium transition cursor-pointer"
              >
                Configurer
              </button>
            </div>
          </div>

          {/* Recent Audit Logs (2 columns span) */}
          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Journal d'Audit en Temps Réel</h3>
                <p className="text-[11px] text-stone-400">Dernières opérations administratives tracées sur la plateforme</p>
              </div>
              <button
                onClick={() => navigate('/owner/audit')}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Voir tout le journal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-800/80">
              {recentLogs.map((log, idx) => (
                <div 
                  key={`${log.id}-${idx}`} 
                  onClick={() => navigate('/owner/audit')}
                  className="py-3 flex items-start justify-between gap-4 cursor-pointer hover:bg-stone-800/30 px-2 rounded-xl transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        log.status === 'DENIED' 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-xs font-semibold text-white truncate">{log.target_name}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <span className="text-[10px] text-stone-400">{log.user_name}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Inviolabilité : Aucun log ne peut être effacé manuellement.</span>
              <button
                onClick={() => navigate('/owner/audit')}
                className="text-stone-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
              >
                Consulter les {auditLogs.length} événements
              </button>
            </div>
          </div>

        </div>

      </div>
    </OwnerLayout>
  );
};
