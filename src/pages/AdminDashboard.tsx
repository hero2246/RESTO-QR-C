import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/format';
import { 
  ShieldCheck, 
  Store, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Plus, 
  ArrowUpRight,
  Layers,
  RotateCcw
} from 'lucide-react';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { restaurants, orders, resetToDemoData } = useApp();

  const handleResetDemoData = () => {
    const confirmed = window.confirm(
      'Réinitialiser toutes les données de démonstration ? Les modifications locales seront supprimées.'
    );
    if (confirmed) resetToDemoData();
  };

  const activeCount = restaurants.filter(r => r.is_active).length;
  const disabledCount = restaurants.filter(r => !r.is_active).length;

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);

  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administration Globale de la Plateforme SaaS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Tableau de bord Super Administrateur
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Supervision de l'ensemble des restaurants partenaires, du volume de commandes consolidé et de l'activité SaaS.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDemoData}
              className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-2"
              title="Remettre le chiffre d’affaires de démonstration à zéro"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser le chiffre d’affaires</span>
            </button>
            <button
              onClick={() => navigate('/admin/restaurants')}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Gérer les Restaurants ({restaurants.length})</span>
            </button>
          </div>
        </div>

        {/* 6 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Restaurants</span>
              <Store className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">{restaurants.length}</div>
            <div className="text-[11px] text-stone-500">Inscrits au total</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-2 bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">Actifs</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900">{activeCount}</div>
            <div className="text-[11px] text-emerald-700">Menus ouverts</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Désactivés</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">{disabledCount}</div>
            <div className="text-[11px] text-stone-500">En pause ou suspendus</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Cmds Jour</span>
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">{todayOrders.length}</div>
            <div className="text-[11px] text-stone-500">Aujourd'hui</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Cmds Totales</span>
              <Layers className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">{orders.length}</div>
            <div className="text-[11px] text-stone-500">Toutes plateformes</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Volume d'affaires</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg sm:text-xl font-black text-stone-900 truncate">
              {formatFCFA(totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">CA cumulé en FCFA</div>
          </div>

        </div>

        {/* Restaurants Overview Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                Aperçu des Restaurants Partenaires
              </h3>
              <p className="text-xs text-stone-500">
                Gérez les établissements et inspectez leurs menus et commandes
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/restaurants')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Voir la liste complète</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {restaurants.map(resto => {
              const restoOrdersCount = orders.filter(o => o.restaurant_id === resto.id).length;
              return (
                <div key={resto.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={resto.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80'}
                      alt={resto.name}
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-stone-900 truncate flex items-center gap-2">
                        <span>{resto.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          resto.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {resto.is_active ? 'Actif' : 'Désactivé'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 truncate">
                        {resto.address || resto.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <span className="font-bold text-stone-700">
                      {restoOrdersCount} commande(s)
                    </span>
                    <button
                      onClick={() => navigate(`/r/${resto.slug}`)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Menu</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
