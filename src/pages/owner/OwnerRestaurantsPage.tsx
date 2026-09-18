import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { Restaurant, RestaurantStatus } from '../../types';
import { 
  Store, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  Power, 
  CreditCard, 
  ExternalLink, 
  Trash2, 
  AlertTriangle,
  QrCode,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface OwnerRestaurantsPageProps {
  navigate: (path: string) => void;
}

export const OwnerRestaurantsPage: React.FC<OwnerRestaurantsPageProps> = ({ navigate }) => {
  const { 
    restaurants, 
    setRestaurantStatus, 
    setRestaurantPlan, 
    deleteRestaurant, 
    saasPlans,
    products,
    tables,
    orders
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RestaurantStatus>('ALL');
  const [selectedRestoForPlan, setSelectedRestoForPlan] = useState<Restaurant | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtered restaurants
  const pendingRestaurants = restaurants.filter(resto => resto.status === 'PENDING');

  const filteredRestaurants = restaurants.filter(resto => {
    const matchQuery = 
      resto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resto.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resto.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resto.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || resto.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <OwnerLayout
      currentPath="/owner/restaurants"
      navigate={navigate}
      title="Gestion des Restaurants (Tenants)"
      subtitle="Supervision des établissements hébergés, états des comptes et quotas d'abonnements"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-medium">
            {restaurants.length} établissements enregistrés
          </span>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Anti-Interference Architecture Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
            <span>
              <strong>Principe d'Isolation SaaS :</strong> Le propriétaire administre le statut légal, les abonnements et les quotas techniques du restaurant. L'édition quotidienne du menu, des prix et des commandes en cuisine est sous la responsabilité exclusive du restaurant.
            </span>
          </div>
        </div>

        {pendingRestaurants.length > 0 && (
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left text-xs text-amber-200 hover:bg-amber-500/15 transition"
          >
            <strong>{pendingRestaurants.length} demande{pendingRestaurants.length > 1 ? 's' : ''} en attente</strong>
            <span className="ml-2 text-amber-300/80">Cliquez pour afficher les restaurants à valider.</span>
          </button>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, gérant, email ou slug..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-950 border border-stone-800 rounded-xl w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'ACTIVE', 'SUSPENDED', 'PENDING'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === tab
                    ? 'bg-stone-800 text-white shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'Tous' : tab === 'ACTIVE' ? 'Actifs' : tab === 'SUSPENDED' ? 'Suspendus' : 'En attente'}
              </button>
            ))}
          </div>

        </div>

        {/* Restaurants Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Restaurant</th>
                  <th className="py-3.5 px-4">Gérant / Contact</th>
                  <th className="py-3.5 px-4">Plan SaaS</th>
                  <th className="py-3.5 px-4">Métriques</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-5 text-right">Actions SaaS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      Aucun restaurant ne correspond à vos critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredRestaurants.map(resto => {
                    const restoProducts = products.filter(p => p.restaurant_id === resto.id);
                    const restoTables = tables.filter(t => t.restaurant_id === resto.id);
                    const restoOrders = orders.filter(o => o.restaurant_id === resto.id);
                    const isSuspended = resto.status === 'SUSPENDED';

                    return (
                      <tr key={resto.id} className="hover:bg-stone-850/50 transition">
                        
                        {/* Restaurant Name & Slug */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={resto.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'}
                              alt={resto.name}
                              className="w-10 h-10 rounded-xl object-cover border border-stone-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{resto.name}</span>
                                <a 
                                  href={`/r/${resto.slug}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-stone-400 hover:text-orange-400 transition"
                                  title="Ouvrir le menu client"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                              <div className="text-[11px] text-stone-400 font-mono">
                                /r/{resto.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Gérant & Contact */}
                        <td className="py-4 px-4">
                          <div className="font-medium text-stone-200">{resto.owner_name}</div>
                          <div className="text-[11px] text-stone-400">{resto.email}</div>
                          <div className="text-[10px] text-stone-400">{resto.phone}</div>
                        </td>

                        {/* Plan SaaS */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedRestoForPlan(resto)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 hover:border-orange-500/50 transition font-mono text-[11px]"
                          >
                            <CreditCard className="w-3 h-3 text-orange-400" />
                            <span className="font-bold text-white">{resto.plan_id}</span>
                          </button>
                        </td>

                        {/* Métriques */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5 text-[11px] text-stone-300">
                            <div>{restoProducts.length} produits • {restoTables.length} tables</div>
                            <div className="text-[10px] text-stone-400">{restoOrders.length} commandes enregistrées</div>
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            resto.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isSuspended
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {resto.status === 'ACTIVE' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Actif</span>
                              </>
                            ) : isSuspended ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>Suspendu</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>En attente</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions SaaS */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {resto.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => setRestaurantStatus(resto.id, 'ACTIVE')}
                                className="p-2 rounded-xl border border-emerald-600/30 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 text-xs font-semibold flex items-center gap-1.5"
                                title="Approuver le restaurant"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Approuver</span>
                              </button>
                            )}

                            {/* Toggle Suspend/Activate */}
                            <button
                              onClick={() => setRestaurantStatus(resto.id, isSuspended ? 'ACTIVE' : 'SUSPENDED')}
                              className={`p-2 rounded-xl border transition text-xs font-semibold flex items-center gap-1.5 ${
                                isSuspended
                                  ? 'bg-emerald-600/10 border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/20'
                                  : 'bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600/20'
                              }`}
                              title={isSuspended ? 'Réactiver le restaurant' : 'Suspendre le restaurant'}
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">{isSuspended ? 'Réactiver' : 'Suspendre'}</span>
                            </button>

                            {/* Delete restaurant */}
                            <button
                              onClick={() => setConfirmDeleteId(resto.id)}
                              className="p-2 rounded-xl bg-stone-800 hover:bg-red-900/40 text-stone-400 hover:text-red-400 transition"
                              title="Supprimer définitivement le restaurant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

        {/* Modal Change Plan */}
        {selectedRestoForPlan && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Changer le Plan SaaS</h3>
                  <p className="text-xs text-stone-400">Pour {selectedRestoForPlan.name}</p>
                </div>
                <button
                  onClick={() => setSelectedRestoForPlan(null)}
                  className="text-stone-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {saasPlans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      setRestaurantPlan(selectedRestoForPlan.id, plan.id);
                      setSelectedRestoForPlan(null);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                      selectedRestoForPlan.plan_id === plan.id
                        ? 'bg-orange-600/10 border-orange-500 text-white'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{plan.name}</span>
                        {plan.id === 'PRO' && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold">Populaire</span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400 mt-1">
                        Jusqu’à {plan.max_products} produits • {plan.max_staff} employés
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-amber-400">
                        {plan.price_monthly.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-[10px] text-stone-400">par mois</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Delete Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-base font-bold text-white">Confirmer la Suppression ?</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Cette action supprimera définitivement le restaurant, son menu, ses tables et l'historique associé. Cette action est irréversible.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    deleteRestaurant(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg shadow-red-600/20"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </OwnerLayout>
  );
};
