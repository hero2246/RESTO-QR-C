import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { formatTime, getElapsedMinutes } from '../utils/format';
import { playNotificationBeep } from '../utils/sound';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Volume2, 
  VolumeX, 
  Utensils, 
  AlertTriangle,
  RotateCcw,
  Maximize2
} from 'lucide-react';

interface KitchenDashboardPageProps {
  navigate: (path: string) => void;
}

export const KitchenDashboardPage: React.FC<KitchenDashboardPageProps> = ({ navigate }) => {
  const { activeRestaurant, orders, updateOrderStatus, showToast } = useApp();

  const [filter, setFilter] = useState<'ACTIVE' | 'PREPARING' | 'READY'>('ACTIVE');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // Filter kitchen-relevant orders for active restaurant
  const kitchenOrders = useMemo(() => {
    if (!activeRestaurant) return [];
    return orders
      .filter(o => o.restaurant_id === activeRestaurant.id && (o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY'))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [orders, activeRestaurant]);

  // Trigger beep when a new order arrives
  const newOrdersCount = kitchenOrders.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED').length;

  useEffect(() => {
    if (newOrdersCount > lastOrderCount && soundEnabled && lastOrderCount > 0) {
      playNotificationBeep();
    }
    setLastOrderCount(newOrdersCount);
  }, [newOrdersCount, lastOrderCount, soundEnabled]);

  const displayedOrders = useMemo(() => {
    if (filter === 'PREPARING') {
      return kitchenOrders.filter(o => o.status === 'PREPARING');
    }
    if (filter === 'READY') {
      return kitchenOrders.filter(o => o.status === 'READY');
    }
    // ACTIVE: Show NEW, CONFIRMED, and PREPARING
    return kitchenOrders.filter(o => o.status !== 'READY');
  }, [kitchenOrders, filter]);

  const handleStartPrep = (orderId: string) => {
    updateOrderStatus(orderId, 'PREPARING');
    showToast('Commande envoyée en préparation', 'success');
  };

  const handleMarkReady = (orderId: string, orderNum: string) => {
    updateOrderStatus(orderId, 'READY');
    if (soundEnabled) playNotificationBeep();
    showToast(`Commande ${orderNum} marquée PRÊTE ! Client et serveurs notifiés 🎉`, 'success');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Kitchen Top Bar */}
      <header className="p-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black shadow-lg shadow-orange-600/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight uppercase">Écran Cuisine (KDS)</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {activeRestaurant?.name || 'Restaurant'}
              </span>
            </div>
            <p className="text-xs text-stone-400">Préparation en direct • Commandes tactiles</p>
          </div>
        </div>

        {/* Filter buttons & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-stone-800 p-1 border border-stone-700">
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'ACTIVE'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              À préparer ({kitchenOrders.filter(o => o.status !== 'READY').length})
            </button>
            <button
              onClick={() => setFilter('PREPARING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'PREPARING'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              En cours ({kitchenOrders.filter(o => o.status === 'PREPARING').length})
            </button>
            <button
              onClick={() => setFilter('READY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'READY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Prêtes ({kitchenOrders.filter(o => o.status === 'READY').length})
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-stone-800 text-orange-400 border-stone-700'
                : 'bg-stone-800 text-stone-500 border-stone-700'
            }`}
            title={soundEnabled ? 'Alerte sonore activée' : 'Alerte sonore désactivée'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300 border border-stone-700 transition"
          >
            Sortir
          </button>
        </div>
      </header>

      {/* Main Grid for kitchen tickets */}
      <main className="p-4 sm:p-6 flex-1 overflow-y-auto">
        {displayedOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-6">
            <Utensils className="w-16 h-16 text-stone-700 mb-3" />
            <h2 className="text-xl font-bold text-stone-300">Cuisine dégagée !</h2>
            <p className="text-sm text-stone-500 mt-1 max-w-sm">
              Aucune commande en attente de préparation pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedOrders.map(order => {
              const elapsed = getElapsedMinutes(order.created_at);
              const isUrgent = elapsed > (order.estimated_minutes || 20);

              return (
                <div
                  key={order.id}
                  id={`kitchen-card-${order.id}`}
                  className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xl transition-all ${
                    order.status === 'READY'
                      ? 'bg-stone-900 border-emerald-500/40 text-stone-200'
                      : isUrgent
                      ? 'bg-stone-900 border-rose-500 ring-2 ring-rose-500/30 text-stone-100'
                      : order.status === 'PREPARING'
                      ? 'bg-stone-900 border-purple-500/50 text-stone-100'
                      : 'bg-stone-900 border-amber-500/50 text-stone-100'
                  }`}
                >
                  {/* Card Header: Order #, Table, Timer */}
                  <div className={`p-4 border-b ${
                    order.status === 'READY'
                      ? 'bg-emerald-950/40 border-emerald-800/40'
                      : isUrgent
                      ? 'bg-rose-950/40 border-rose-800/40'
                      : order.status === 'PREPARING'
                      ? 'bg-purple-950/40 border-purple-800/40'
                      : 'bg-amber-950/40 border-amber-800/40'
                  } flex items-center justify-between`}>
                    <div>
                      <span className="text-xl font-black tracking-tight text-white block">
                        {order.order_number}
                      </span>
                      <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md bg-white text-stone-950 font-black text-xs">
                        {order.table_number ? `TABLE ${order.table_number}` : 'COMPTOIR'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${
                        isUrgent ? 'bg-rose-500 text-white animate-pulse' : 'bg-stone-800 text-stone-300'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed} min</span>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-1">
                        Reçue à {formatTime(order.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Body */}
                  <div className="p-4 space-y-3 flex-1">
                    {order.customer_note && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                        <strong className="text-amber-200">Note client :</strong> {order.customer_note}
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {order.items.map((item, idx) => (
                        <div 
                          key={idx}
                          className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/50 flex items-start gap-3"
                        >
                          <span className="w-7 h-7 rounded-lg bg-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                            {item.quantity}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-sm text-stone-100 leading-snug">
                              {item.product_name}
                            </h4>
                            {item.selected_options && item.selected_options.length > 0 && (
                              <div className="text-xs text-orange-400 font-semibold mt-0.5">
                                {item.selected_options.map(opt => opt.name).join(' • ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kitchen Action Buttons */}
                  <div className="p-4 bg-stone-900/90 border-t border-stone-800 space-y-2">
                    {(order.status === 'NEW' || order.status === 'CONFIRMED') && (
                      <button
                        id={`kitchen-start-${order.id}`}
                        onClick={() => handleStartPrep(order.id)}
                        className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-98"
                      >
                        <Flame className="w-5 h-5" />
                        <span>LANCER PRÉPARATION</span>
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        id={`kitchen-ready-${order.id}`}
                        onClick={() => handleMarkReady(order.id, order.order_number)}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 animate-pulse-subtle"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>COMMANDE PRÊTE 🎉</span>
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <div className="text-center py-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 rounded-xl border border-emerald-800/40">
                        ✓ En attente de service par la salle
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
