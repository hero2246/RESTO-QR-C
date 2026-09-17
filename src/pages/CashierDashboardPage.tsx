import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { formatFCFA, formatTime } from '../utils/format';
import { DigitalReceiptModal } from '../components/DigitalReceiptModal';
import { 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Printer, 
  Banknote, 
  Smartphone,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

interface CashierDashboardPageProps {
  navigate: (path: string) => void;
}

export const CashierDashboardPage: React.FC<CashierDashboardPageProps> = ({ navigate }) => {
  const { activeRestaurant, orders, updateOrderStatus, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'ESPECES' | 'WAVE' | 'ORANGE_MONEY' | 'CARTE'>('ESPECES');

  // Filter orders for active restaurant
  const restoOrders = useMemo(() => {
    if (!activeRestaurant) return [];
    return orders
      .filter(o => o.restaurant_id === activeRestaurant.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, activeRestaurant]);

  // Orders awaiting payment vs settled
  const pendingPaymentOrders = useMemo(() => {
    return restoOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  }, [restoOrders]);

  const completedOrders = useMemo(() => {
    return restoOrders.filter(o => o.status === 'COMPLETED');
  }, [restoOrders]);

  // Today's total cash received
  const totalRevenueToday = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
  }, [completedOrders]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return pendingPaymentOrders;
    const q = search.toLowerCase();
    return pendingPaymentOrders.filter(
      o => o.order_number.toLowerCase().includes(q) ||
           (o.table_number && o.table_number.toLowerCase().includes(q)) ||
           (o.customer_name && o.customer_name.toLowerCase().includes(q))
    );
  }, [pendingPaymentOrders, search]);

  const handleConfirmPayment = () => {
    if (!paymentModalOrder) return;
    updateOrderStatus(paymentModalOrder.id, 'COMPLETED');
    showToast(`Paiement de ${formatFCFA(paymentModalOrder.total_amount)} enregistré par ${selectedMethod}`, 'success');
    // Open receipt right after payment
    setSelectedOrderForReceipt(paymentModalOrder);
    setPaymentModalOrder(null);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900 tracking-tight">Poste Caisse & Encaissement</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {activeRestaurant?.name || 'Restaurant'}
              </span>
            </div>
            <p className="text-xs text-stone-500">Paiements • Facturation • Billets de caisse</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition"
          >
            Vue Kanban
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-black transition"
          >
            Tableau de Bord
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Encaissé Aujourd'hui</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatFCFA(totalRevenueToday)}</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">{completedOrders.length} commande(s) réglée(s)</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">En Attente de Règlement</span>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingPaymentOrders.length}</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Total : {formatFCFA(pendingPaymentOrders.reduce((s, o) => s + o.total_amount, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Panier Moyen</span>
              <h3 className="text-2xl font-black text-stone-900 mt-1">
                {completedOrders.length > 0 
                  ? formatFCFA(Math.round(totalRevenueToday / completedOrders.length)) 
                  : '0 FCFA'}
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Moyenne par table</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-stone-50 text-stone-600 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Orders Awaiting Payment */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-stone-900">
                Commandes à Encaisser ({filteredOrders.length})
              </h2>
              <p className="text-xs text-stone-500">Sélectionnez une commande pour enregistrer le paiement ou éditer un ticket.</p>
            </div>

            <div className="w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher # ou Table..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              Aucune commande en attente d'encaissement.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredOrders.map(order => (
                <div 
                  key={order.id}
                  className="p-4 hover:bg-stone-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900 text-sm">
                        {order.order_number}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white font-bold text-xs">
                        Table {order.table_number || 'Comptoir'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'READY' ? 'Prête' : 'En cours'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600">
                      {order.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </div>

                    <div className="text-[11px] text-stone-400">
                      Reçue à {formatTime(order.created_at)}
                      {order.customer_name && ` • Client : ${order.customer_name}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">À payer</span>
                      <span className="text-base font-black text-stone-900 font-mono">
                        {formatFCFA(order.total_amount)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrderForReceipt(order)}
                      className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 transition shadow-xs"
                      title="Voir le ticket de caisse"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-cashier-pay-${order.id}`}
                      onClick={() => setPaymentModalOrder(order)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Encaisser</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique des paiements du jour */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-3">
          <h2 className="text-base font-black text-stone-900">
            Derniers Paiements Enregistrés ({completedOrders.length})
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
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {completedOrders.slice(0, 10).map(order => (
                  <tr key={order.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-bold text-stone-900">{order.order_number}</td>
                    <td className="py-2.5 px-3 font-bold">Table {order.table_number || 'Comptoir'}</td>
                    <td className="py-2.5 px-3 text-stone-600">{order.items.length} article(s)</td>
                    <td className="py-2.5 px-3 text-stone-500">{formatTime(order.updated_at || order.created_at)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        RÉGLÉ
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-stone-900">
                      {formatFCFA(order.total_amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedOrderForReceipt(order)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-stone-900"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Ticket</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Payment Confirmation Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-stone-200">
            <h3 className="text-base font-black text-stone-900 mb-1">
              Encaisser la commande {paymentModalOrder.order_number}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Table {paymentModalOrder.table_number || 'Comptoir'} • Montant à régler : 
              <strong className="text-emerald-600 font-mono text-sm ml-1">
                {formatFCFA(paymentModalOrder.total_amount)}
              </strong>
            </p>

            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Moyen de paiement utilisé :
            </label>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setSelectedMethod('ESPECES')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                  selectedMethod === 'ESPECES'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Espèces / Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('WAVE')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                  selectedMethod === 'WAVE'
                    ? 'bg-blue-50 text-blue-800 border-blue-500 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Wave Money</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('ORANGE_MONEY')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                  selectedMethod === 'ORANGE_MONEY'
                    ? 'bg-orange-50 text-orange-800 border-orange-500 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Smartphone className="w-4 h-4 text-orange-600" />
                <span>Orange Money</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('CARTE')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                  selectedMethod === 'CARTE'
                    ? 'bg-purple-50 text-purple-800 border-purple-500 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Carte Bancaire</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPaymentModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                id="btn-confirm-payment-received"
                onClick={handleConfirmPayment}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Valider l'encaissement & Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedOrderForReceipt && (
        <DigitalReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
          restaurantOverride={activeRestaurant}
        />
      )}

    </div>
  );
};
