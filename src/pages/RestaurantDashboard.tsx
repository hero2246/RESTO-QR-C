import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatTime } from '../utils/format';
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  TrendingUp, 
  QrCode, 
  BookOpen, 
  Layers, 
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Globe,
  Users
} from 'lucide-react';

interface RestaurantDashboardProps {
  navigate: (path: string) => void;
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ navigate }) => {
  const { activeRestaurant, orders, products, categories } = useApp();

  // Filter orders for active restaurant
  const restoOrders = useMemo(() => {
    if (!activeRestaurant) return [];
    return orders.filter(o => o.restaurant_id === activeRestaurant.id);
  }, [orders, activeRestaurant]);

  // Today's orders
  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return restoOrders.filter(o => new Date(o.created_at).toDateString() === today);
  }, [restoOrders]);

  const pendingOrders = restoOrders.filter(o => o.status === 'NEW');
  const preparingOrders = restoOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'PREPARING');
  const completedOrders = restoOrders.filter(o => o.status === 'COMPLETED' || o.status === 'READY');

  const todayRevenue = todayOrders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total_amount, 0);

  // Top ordered products
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; count: number; revenue: number }> = {};
    restoOrders.forEach(order => {
      if (order.status === 'CANCELLED') return;
      order.items.forEach(item => {
        if (!counts[item.product_id]) {
          counts[item.product_id] = { name: item.product_name, count: 0, revenue: 0 };
        }
        counts[item.product_id].count += item.quantity;
        counts[item.product_id].revenue += item.subtotal;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [restoOrders]);

  if (!activeRestaurant) {
    return (
      <div className="p-8 text-center text-stone-500">
        Aucun restaurant actif sélectionné.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Suspended Alert Banner */}
        {activeRestaurant.status === 'SUSPENDED' && (
          <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-300 text-red-800 space-y-2">
            <div className="flex items-center gap-2.5 font-black text-sm">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span>COMPTE RESTAURANT ACTUELLEMENT SUSPENDU</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              Votre établissement a été temporairement suspendu par l'administrateur de la plateforme SaaS. Vos menus QR code publics sont désactivés. Veuillez contacter le support de la plateforme ({activeRestaurant.email}) pour régulariser votre compte ou renouveler votre abonnement.
            </p>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-orange-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Espace Gestion Restaurant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bonjour, {activeRestaurant.name}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Vos clients commandent directement depuis leur table via votre QR Code. Gérez vos commandes en temps réel et optimisez vos services.
            </p>
          </div>

          {/* Quick Action Links */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/dashboard/staff')}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Équipe & Pointage</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/website')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>Créateur de Site (CMS)</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/orders')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Tableau des commandes</span>
            </button>
            <button
              onClick={() => navigate(`/site/${activeRestaurant.slug}`)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Voir le Site Public</span>
            </button>
          </div>
        </div>

        {/* 5 Key Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          
          {/* Today Orders */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Commandes jour</span>
              <ShoppingBag className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {todayOrders.length}
            </div>
            <div className="text-[11px] text-stone-500">
              {restoOrders.length} au total
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-2 bg-amber-50/30">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-xs font-bold uppercase tracking-wider">En attente</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900">
              {pendingOrders.length}
            </div>
            <div className="text-[11px] text-amber-700">
              Nécessitent validation
            </div>
          </div>

          {/* In Preparation */}
          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-2 bg-blue-50/30">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-xs font-bold uppercase tracking-wider">En préparation</span>
              <ChefHat className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-900">
              {preparingOrders.length}
            </div>
            <div className="text-[11px] text-blue-700">
              En cuisine actuellement
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-2 bg-emerald-50/30">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-bold uppercase tracking-wider">Servies / Prêtes</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900">
              {completedOrders.length}
            </div>
            <div className="text-[11px] text-emerald-700">
              Commandes traitées
            </div>
          </div>

          {/* Today's Revenue in FCFA */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">CA du jour</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-stone-900 truncate">
              {formatFCFA(todayRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              Revenu estimé aujourd'hui
            </div>
          </div>

        </div>

        {/* 2-Column: Recent Orders + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Orders List (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                  Dernières commandes enregistrées
                </h3>
              </div>
              <button
                onClick={() => navigate('/dashboard/orders')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>Ouvrir Kanban</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {restoOrders.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">
                Aucune commande pour le moment. Scannez votre QR code pour tester !
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {restoOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-stone-900">{order.order_number}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                          Table {order.table_number}
                        </span>
                        <span className="text-[11px] text-stone-400">{formatTime(order.created_at)}</span>
                      </div>
                      <div className="text-xs text-stone-600 mt-0.5 truncate max-w-sm">
                        {order.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-xs text-stone-900">{formatFCFA(order.total_amount)}</div>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'READY' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Top Products & Quick Links */}
          <div className="space-y-6">
            
            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-600" />
                <span>Plats les plus commandés</span>
              </h3>

              {topProducts.length === 0 ? (
                <div className="py-4 text-center text-xs text-stone-400">
                  Aucune vente enregistrée
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-700 font-bold flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <span className="font-medium text-stone-800 truncate">{p.name}</span>
                      </div>
                      <div className="text-right shrink-0 font-bold text-stone-900">
                        {p.count} ventes
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/dashboard/qrcode')}
                className="p-4 rounded-xl bg-white border border-stone-200 hover:border-orange-500/50 hover:bg-orange-50/30 transition text-left space-y-1 group"
              >
                <QrCode className="w-5 h-5 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-stone-900">Mon QR Code</div>
                <div className="text-[10px] text-stone-500">Imprimer & exporter</div>
              </button>

              <button
                onClick={() => navigate('/dashboard/menu')}
                className="p-4 rounded-xl bg-white border border-stone-200 hover:border-orange-500/50 hover:bg-orange-50/30 transition text-left space-y-1 group"
              >
                <BookOpen className="w-5 h-5 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-stone-900">Menu & Plats</div>
                <div className="text-[10px] text-stone-500">{products.filter(p => p.restaurant_id === activeRestaurant.id).length} plats configurés</div>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
