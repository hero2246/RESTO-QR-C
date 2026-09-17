import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, RestaurantTable } from '../types';
import { formatTime, formatFCFA } from '../utils/format';
import { 
  Users, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers, 
  Utensils, 
  AlertCircle,
  Coffee,
  Check
} from 'lucide-react';

interface WaiterDashboardPageProps {
  navigate: (path: string) => void;
}

export const WaiterDashboardPage: React.FC<WaiterDashboardPageProps> = ({ navigate }) => {
  const { activeRestaurant, orders, tables, updateOrderStatus, showToast } = useApp();

  const [tableStatusMap, setTableStatusMap] = useState<Record<string, 'FREE' | 'OCCUPIED' | 'CLEANING'>>({});

  // Filter orders for active restaurant
  const restoOrders = useMemo(() => {
    if (!activeRestaurant) return [];
    return orders
      .filter(o => o.restaurant_id === activeRestaurant.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, activeRestaurant]);

  // Orders that are READY and need to be served to tables immediately!
  const readyOrders = useMemo(() => {
    return restoOrders.filter(o => o.status === 'READY');
  }, [restoOrders]);

  const activeOrders = useMemo(() => {
    return restoOrders.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'PREPARING');
  }, [restoOrders]);

  const handleMarkServed = (orderId: string, orderNumber: string, tableNumber?: string) => {
    updateOrderStatus(orderId, 'COMPLETED');
    showToast(`Commande ${orderNumber} (Table ${tableNumber || '?'}) servie et finalisée avec succès !`, 'success');
  };

  const toggleTableClean = (tableName: string) => {
    setTableStatusMap(prev => {
      const current = prev[tableName] || 'FREE';
      const next = current === 'CLEANING' ? 'FREE' : 'CLEANING';
      return { ...prev, [tableName]: next };
    });
    showToast(`Statut de ${tableName} mis à jour`, 'info');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900 tracking-tight">Espace Serveur & Salle</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {activeRestaurant?.name || 'Restaurant'}
              </span>
            </div>
            <p className="text-xs text-stone-500">Service en salle • Tables & Commandes prêtes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/kitchen')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-black transition flex items-center gap-1.5 shadow-xs"
          >
            <span>Passer en Cuisine</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition"
          >
            Vue Synthèse
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Section 1: URGENT / COMMANDES PRÊTES À SERVIR */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-emerald-600" />
                <span>Commandes Prêtes à Servir ({readyOrders.length})</span>
              </h2>
            </div>
            {readyOrders.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 animate-pulse">
                Service Immédiat Requis
              </span>
            )}
          </div>

          {readyOrders.length === 0 ? (
            <div className="py-8 text-center bg-stone-50 rounded-xl border border-stone-100 text-stone-400 text-xs">
              Aucune commande en attente de service.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.map(order => (
                <div
                  key={order.id}
                  id={`waiter-ready-${order.id}`}
                  className="bg-emerald-50/50 rounded-xl border-2 border-emerald-400 p-4 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-base font-black text-stone-900 block">
                        {order.order_number}
                      </span>
                      <span className="inline-block mt-1 px-3 py-1 rounded-lg bg-emerald-700 text-white font-black text-xs">
                        TABLE {order.table_number || 'Comptoir'}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Prête à {formatTime(order.updated_at || order.created_at)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-stone-800 bg-white/80 p-2.5 rounded-lg border border-emerald-200/60">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span><strong>{item.quantity}x</strong> {item.product_name}</span>
                        <span className="font-bold">{formatFCFA(item.subtotal)}</span>
                      </div>
                    ))}
                    {order.customer_name && (
                      <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                        Client : {order.customer_name}
                      </div>
                    )}
                  </div>

                  <button
                    id={`btn-serve-${order.id}`}
                    onClick={() => handleMarkServed(order.id, order.order_number, order.table_number)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>MARQUER COMME SERVIE</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: TABLES ET OCCUPATION */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Plan des Tables & Occupation</span>
            </h2>
            <button
              onClick={() => navigate('/dashboard/tables')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Gérer la liste des tables →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {tables.map(table => {
              // Check if there is an active order for this table
              const tableOrder = restoOrders.find(
                o => (o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY') &&
                     (o.table_number === table.name.replace('Table ', '') || o.table_number === table.name)
              );

              const isCleaning = tableStatusMap[table.name] === 'CLEANING';
              const isOccupied = !!tableOrder;

              return (
                <div
                  key={table.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    tableOrder?.status === 'READY'
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30'
                      : isOccupied
                      ? 'bg-amber-50 border-amber-300'
                      : isCleaning
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-stone-900 text-sm">
                      {table.name}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      tableOrder?.status === 'READY'
                        ? 'bg-emerald-500 animate-ping'
                        : isOccupied
                        ? 'bg-amber-500'
                        : isCleaning
                        ? 'bg-purple-500'
                        : 'bg-stone-300'
                    }`} />
                  </div>

                  <div className="text-[11px] mb-3">
                    {tableOrder?.status === 'READY' ? (
                      <span className="font-black text-emerald-700 block">
                        PRÊTE ! ({tableOrder.order_number})
                      </span>
                    ) : isOccupied ? (
                      <span className="font-bold text-amber-800 block">
                        Occupée • {tableOrder?.items.length} plat(s)
                      </span>
                    ) : isCleaning ? (
                      <span className="font-bold text-purple-700 block">
                        À nettoyer
                      </span>
                    ) : (
                      <span className="text-stone-400 block">Libre</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                    <button
                      onClick={() => toggleTableClean(table.name)}
                      className="text-[10px] font-bold text-stone-600 hover:text-stone-900 bg-white px-2 py-1 rounded border border-stone-200"
                    >
                      {isCleaning ? 'Nettoyée' : 'À nettoyer'}
                    </button>
                    {isOccupied && (
                      <span className="text-[10px] font-bold text-stone-700">
                        {formatFCFA(tableOrder?.total_amount || 0)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: EN COURS DE PRÉPARATION (Suivi salle) */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            <span>Commandes en Cuisine ({activeOrders.length})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Commande</th>
                  <th className="py-2.5 px-3">Table</th>
                  <th className="py-2.5 px-3">Articles</th>
                  <th className="py-2.5 px-3">Heure</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activeOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-bold text-stone-900">{order.order_number}</td>
                    <td className="py-2.5 px-3 font-bold">Table {order.table_number}</td>
                    <td className="py-2.5 px-3 text-stone-600">
                      {order.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500">{formatTime(order.created_at)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'PREPARING'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'PREPARING' ? 'En cuisson' : 'Attente cuisine'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                      {formatFCFA(order.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
