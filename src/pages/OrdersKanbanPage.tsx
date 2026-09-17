import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { formatFCFA, formatTime, getElapsedMinutes } from '../utils/format';
import { DigitalReceiptModal } from '../components/DigitalReceiptModal';
import { 
  ShoppingBag, 
  Clock, 
  Check, 
  ChefHat, 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Timer,
  ExternalLink,
  Receipt
} from 'lucide-react';

interface OrdersKanbanPageProps {
  navigate: (path: string) => void;
}

export const OrdersKanbanPage: React.FC<OrdersKanbanPageProps> = ({ navigate }) => {
  const { activeRestaurant, orders, updateOrderStatus, updateOrderEstimatedTime, showToast } = useApp();

  // Selected order to accept (modal for prep time)
  const [acceptingOrder, setAcceptingOrder] = useState<Order | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(20);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Filter orders for active restaurant
  const restoOrders = useMemo(() => {
    if (!activeRestaurant) return [];
    return orders
      .filter(o => o.restaurant_id === activeRestaurant.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, activeRestaurant]);

  // Group into Kanban columns
  const columns: { id: OrderStatus; title: string; color: string; badge: string }[] = [
    { id: 'NEW', title: 'Nouvelles', color: 'border-amber-400 bg-amber-50/30', badge: 'bg-amber-100 text-amber-800' },
    { id: 'CONFIRMED', title: 'Confirmées', color: 'border-blue-400 bg-blue-50/30', badge: 'bg-blue-100 text-blue-800' },
    { id: 'PREPARING', title: 'En préparation', color: 'border-purple-400 bg-purple-50/30', badge: 'bg-purple-100 text-purple-800' },
    { id: 'READY', title: 'Prêtes', color: 'border-emerald-400 bg-emerald-50/30', badge: 'bg-emerald-100 text-emerald-800' },
    { id: 'COMPLETED', title: 'Terminées', color: 'border-stone-300 bg-stone-50/50', badge: 'bg-stone-100 text-stone-700' },
  ];

  const handleConfirmAccept = () => {
    if (!acceptingOrder) return;
    const minutes = customMinutes ? parseInt(customMinutes, 10) || 20 : selectedMinutes;
    updateOrderStatus(acceptingOrder.id, 'CONFIRMED', minutes);
    setAcceptingOrder(null);
    setCustomMinutes('');
    showToast(`Commande ${acceptingOrder.order_number} acceptée (estimée à ${minutes} min)`);
  };

  const newOrdersCount = restoOrders.filter(o => o.status === 'NEW').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-100/60 p-4 sm:p-6 lg:p-8">
      
      {/* Page Title & Stats banner */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Gestion des Commandes
            </h1>
            {newOrdersCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs animate-pulse">
                <BellRing className="w-3.5 h-3.5" />
                <span>{newOrdersCount} nouvelle(s) commande(s)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Tableau Kanban en temps réel • {activeRestaurant?.name || 'Restaurant'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition"
          >
            Vue Synthèse
          </button>
          <button
            onClick={() => activeRestaurant && navigate(`/r/${activeRestaurant.slug}`)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700 transition flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Tester menu client</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {columns.map(column => {
          const columnOrders = restoOrders.filter(o => o.status === column.id);

          return (
            <div
              key={column.id}
              className={`rounded-2xl border ${column.color} bg-white/80 backdrop-blur-xs flex flex-col max-h-[82vh]`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-stone-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-800">
                    {column.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${column.badge}`}>
                    {columnOrders.length}
                  </span>
                </div>
              </div>

              {/* Column Scrollable Content */}
              <div className="p-3 overflow-y-auto space-y-3 flex-1">
                {columnOrders.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-xs">
                    Aucune commande
                  </div>
                ) : (
                  columnOrders.map(order => {
                    const elapsed = getElapsedMinutes(order.created_at);

                    return (
                      <div
                        key={order.id}
                        id={`kanban-card-${order.id}`}
                        className={`bg-white rounded-xl border p-3.5 shadow-xs hover:shadow-md transition space-y-2.5 ${
                          order.status === 'NEW' 
                            ? 'border-amber-400 ring-2 ring-amber-400/20 animate-pulse-subtle' 
                            : 'border-stone-200'
                        }`}
                      >
                        {/* Card Header: Order number + Table */}
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-black text-stone-900 text-sm block">
                              {order.order_number}
                            </span>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-stone-900 text-white font-bold text-[11px]">
                              Table {order.table_number}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-stone-600 flex items-center gap-1 font-medium justify-end">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {formatTime(order.created_at)}
                            </span>
                            <span className="text-[10px] text-stone-600 block mt-0.5">
                              Il y a {elapsed} min
                            </span>
                          </div>
                        </div>

                        {/* Customer note if any */}
                        {order.customer_name && (
                          <div className="text-xs text-stone-700 font-medium">
                            Client : <span className="font-bold">{order.customer_name}</span>
                          </div>
                        )}
                        {order.customer_note && (
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-snug">
                            <span className="font-bold">Note :</span> {order.customer_note}
                          </div>
                        )}

                        {/* Items list */}
                        <div className="border-t border-stone-100 pt-2 space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="text-xs text-stone-700 flex justify-between">
                              <div className="min-w-0 pr-1">
                                <span className="font-bold text-stone-900">{item.quantity}x</span>{' '}
                                <span className="truncate">{item.product_name}</span>
                                {item.selected_options.length > 0 && (
                                  <div className="text-[10px] text-stone-500 pl-4">
                                    {item.selected_options.map(o => o.name).join(', ')}
                                  </div>
                                )}
                              </div>
                              <span className="text-stone-900 font-semibold shrink-0">
                                {formatFCFA(item.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="border-t border-stone-100 pt-2 flex items-center justify-between font-black text-xs text-stone-900">
                          <span>Total :</span>
                          <span className="text-sm text-orange-600">{formatFCFA(order.total_amount)}</span>
                        </div>

                        {/* Action buttons depending on state */}
                        <div className="pt-2 space-y-2">
                          {(order.status === 'CONFIRMED' || order.status === 'PREPARING') && (
                            <div className="flex items-center justify-between text-[11px] bg-stone-50 p-1.5 rounded-lg border border-stone-200">
                              <span className="text-stone-500 font-medium">Temps restant :</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateOrderEstimatedTime(order.id, (order.estimated_minutes || 15) + 5)}
                                  className="px-2 py-0.5 rounded bg-white border border-stone-300 font-bold hover:bg-stone-100"
                                  title="Ajouter 5 minutes"
                                >
                                  +5m
                                </button>
                                <button
                                  onClick={() => updateOrderEstimatedTime(order.id, (order.estimated_minutes || 15) + 10)}
                                  className="px-2 py-0.5 rounded bg-white border border-stone-300 font-bold hover:bg-stone-100"
                                  title="Ajouter 10 minutes"
                                >
                                  +10m
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                          {order.status === 'NEW' && (
                            <button
                              id={`btn-accept-${order.id}`}
                              onClick={() => setAcceptingOrder(order)}
                              className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ACCEPTER</span>
                            </button>
                          )}

                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                            >
                              <ChefHat className="w-3.5 h-3.5" />
                              <span>Lancer préparation</span>
                            </button>
                          )}

                          {order.status === 'PREPARING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'READY')}
                              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 animate-pulse"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                              <span>COMMANDE PRÊTE</span>
                            </button>
                          )}

                          {order.status === 'READY' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                              className="w-full py-2 px-3 rounded-lg bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Terminer</span>
                            </button>
                          )}

                          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                            <button
                              onClick={() => {
                                if (confirm(`Annuler la commande ${order.order_number} ?`)) {
                                  updateOrderStatus(order.id, 'CANCELLED');
                                }
                              }}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Annuler la commande"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            id={`btn-receipt-${order.id}`}
                            onClick={() => setReceiptOrder(order)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition"
                            title="Générer reçu / addition"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accept Order Modal: Choose estimated prep time */}
      {acceptingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-stone-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  Accepter la commande {acceptingOrder.order_number}
                </h3>
                <p className="text-xs text-stone-500">
                  Table {acceptingOrder.table_number} • Total : {formatFCFA(acceptingOrder.total_amount)}
                </p>
              </div>
            </div>

            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Temps de préparation estimé :
            </label>

            {/* Quick time selection buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[10, 15, 20, 30, 45].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => {
                    setSelectedMinutes(minutes);
                    setCustomMinutes('');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                    selectedMinutes === minutes && !customMinutes
                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {minutes} min
                </button>
              ))}
              <button
                onClick={() => setSelectedMinutes(0)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                  customMinutes || selectedMinutes === 0
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Personnalisé
              </button>
            </div>

            {(selectedMinutes === 0 || customMinutes) && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Nombre de minutes sur mesure :
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="Ex: 25"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 mb-6">
              Le client verra immédiatement sur son écran : 
              <span className="font-bold block mt-0.5">
                « Commande confirmée • Temps estimé : {customMinutes || selectedMinutes} minutes »
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setAcceptingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                id="btn-confirm-accept-order"
                onClick={handleConfirmAccept}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
              >
                Valider & notifier le client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {receiptOrder && (
        <DigitalReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}

    </div>
  );
};
