import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/format';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  PieChart, 
  Calendar, 
  Award,
  Layers
} from 'lucide-react';

interface AnalyticsPageProps {
  navigate: (path: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ navigate }) => {
  const { activeRestaurant, orders, categories, products } = useApp();

  const restoOrders = useMemo(() => {
    if (!activeRestaurant) return [];
    return orders.filter(o => o.restaurant_id === activeRestaurant.id && o.status !== 'CANCELLED');
  }, [orders, activeRestaurant]);

  // Today
  const today = new Date().toDateString();
  const todayOrders = restoOrders.filter(o => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // Week (last 7 days)
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const weekOrders = restoOrders.filter(o => new Date(o.created_at).getTime() >= oneWeekAgo);
  const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // Month (last 30 days)
  const oneMonthAgo = Date.now() - 30 * 86400000;
  const monthOrders = restoOrders.filter(o => new Date(o.created_at).getTime() >= oneMonthAgo);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // Average basket
  const averageBasket = restoOrders.length > 0 
    ? Math.round(restoOrders.reduce((sum, o) => sum + o.total_amount, 0) / restoOrders.length)
    : 0;

  // Top products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    restoOrders.forEach(order => {
      order.items.forEach(item => {
        if (!map[item.product_id]) {
          map[item.product_id] = { name: item.product_name, count: 0, revenue: 0 };
        }
        map[item.product_id].count += item.quantity;
        map[item.product_id].revenue += item.subtotal;
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [restoOrders]);

  // Last 7 days breakdown for bar chart
  const last7DaysData = useMemo(() => {
    const days: { label: string; count: number; revenue: number }[] = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayStr = d.toDateString();
      const label = i === 0 ? "Aujourd'hui" : dayNames[d.getDay()];
      
      const dayOrdersList = restoOrders.filter(o => new Date(o.created_at).toDateString() === dayStr);
      const dayRev = dayOrdersList.reduce((sum, o) => sum + o.total_amount, 0);

      days.push({
        label,
        count: dayOrdersList.length,
        revenue: dayRev,
      });
    }
    return days;
  }, [restoOrders]);

  const maxRevenue = Math.max(...last7DaysData.map(d => d.revenue), 10000);

  if (!activeRestaurant) {
    return <div className="p-8 text-center text-stone-500">Sélectionnez un restaurant</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Analytiques & Statistiques
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Indicateurs de performance des commandes QR de {activeRestaurant.name}.
          </p>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Aujourd'hui</span>
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">{formatFCFA(todayRevenue)}</div>
            <div className="text-xs text-stone-500">{todayOrders.length} commande(s) passée(s)</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Cette Semaine</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">{formatFCFA(weekRevenue)}</div>
            <div className="text-xs text-stone-500">{weekOrders.length} commandes en 7 jours</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Ce Mois-ci</span>
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">{formatFCFA(monthRevenue)}</div>
            <div className="text-xs text-stone-500">{monthOrders.length} commandes totales</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Panier Moyen</span>
              <ShoppingBag className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">{formatFCFA(averageBasket)}</div>
            <div className="text-xs text-stone-500">Montant moyen par client</div>
          </div>

        </div>

        {/* 7-Days Visual Bar Chart */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                Évolution du chiffre d'affaires (7 derniers jours)
              </h3>
              <p className="text-xs text-stone-400">Total en FCFA généré par le menu QR</p>
            </div>
          </div>

          <div className="pt-4 h-56 flex items-end justify-between gap-2 sm:gap-6 border-b border-stone-100 pb-2">
            {last7DaysData.map((d, i) => {
              const heightPercent = Math.max(8, Math.round((d.revenue / maxRevenue) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-stone-600 opacity-0 group-hover:opacity-100 transition truncate max-w-full">
                    {formatFCFA(d.revenue)}
                  </span>
                  <div
                    className="w-full max-w-[48px] rounded-t-xl bg-orange-500 group-hover:bg-orange-600 transition-all shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-semibold text-stone-500 truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column: Top Products + Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-600" />
              <span>Top 5 des Plats les plus vendus</span>
            </h3>

            {topProducts.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-400">Aucune commande enregistrée</div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 font-bold flex items-center justify-center text-xs">
                        #{i + 1}
                      </span>
                      <span className="font-bold text-stone-900 truncate">{p.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-stone-900">{p.count} portions</div>
                      <div className="text-[11px] text-orange-600">{formatFCFA(p.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories popularity */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" />
              <span>Répartition par Catégorie</span>
            </h3>

            <div className="space-y-3">
              {categories.filter(c => c.restaurant_id === activeRestaurant.id).map(cat => {
                const catProducts = products.filter(p => p.category_id === cat.id);
                return (
                  <div key={cat.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">{cat.name}</span>
                    <span className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-600 font-semibold">
                      {catProducts.length} plat(s) au menu
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
