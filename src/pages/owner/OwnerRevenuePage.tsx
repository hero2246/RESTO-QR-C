import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  Send,
  Plus,
  Printer,
  Sparkles,
  PieChart,
  BarChart3,
  Building2,
  Check
} from 'lucide-react';
import { PaymentProviderType, Invoice } from '../../types';

interface OwnerRevenuePageProps {
  navigate: (path: string) => void;
}

export const OwnerRevenuePage: React.FC<OwnerRevenuePageProps> = ({ navigate }) => {
  const { 
    invoices, 
    markInvoicePaid,
    createManualInvoice,
    paymentProviders, 
    restaurants, 
    saasPlans, 
    saasSettings,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Invoice Form State
  const [newInvRestoId, setNewInvRestoId] = useState(restaurants[0]?.id || '');
  const [newInvPlanId, setNewInvPlanId] = useState('PRO');
  const [newInvAmount, setNewInvAmount] = useState(15000);
  const [newInvCycle, setNewInvCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [newInvProvider, setNewInvProvider] = useState<PaymentProviderType>('wave');
  const [newInvRef, setNewInvRef] = useState(`TX-${Date.now().toString().slice(-6)}`);
  const [newInvStatus, setNewInvStatus] = useState<'PAID' | 'PENDING'>('PAID');

  // Financial calculations
  const totalRevenue = invoices
    .filter(i => i.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const mrr = restaurants
    .map(r => {
      const p = saasPlans.find(plan => plan.id === r.plan_id);
      return p ? p.price_monthly : 0;
    })
    .reduce((acc, curr) => acc + curr, 0);

  const arr = mrr * 12;

  const pendingRevenue = invoices
    .filter(i => i.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const payingRestaurantsCount = restaurants.filter(r => r.plan_id !== 'FREE').length;
  const conversionRate = restaurants.length > 0 
    ? Math.round((payingRestaurantsCount / restaurants.length) * 100) 
    : 0;

  const arpu = payingRestaurantsCount > 0 
    ? Math.round(mrr / payingRestaurantsCount) 
    : 0;

  // Monthly revenue breakdown for visual chart (last 6 months)
  const monthlyData = [
    { month: 'Nov', revenue: Math.round(mrr * 0.65), target: mrr },
    { month: 'Déc', revenue: Math.round(mrr * 0.80), target: mrr },
    { month: 'Jan', revenue: Math.round(mrr * 0.88), target: mrr },
    { month: 'Fév', revenue: Math.round(mrr * 0.94), target: mrr },
    { month: 'Mar', revenue: mrr, target: mrr },
    { month: 'Avr (Proj.)', revenue: Math.round(mrr * 1.25), target: Math.round(mrr * 1.2) }
  ];
  const maxMonthly = Math.max(...monthlyData.map(d => d.revenue), 100000);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = providerFilter === 'ALL' || inv.payment_method === providerFilter;
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesProvider && matchesStatus;
  });

  const getProviderBadge = (provider: string) => {
    const p = String(provider).toLowerCase();
    if (p.includes('wave')) {
      return <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px]">WAVE CI/SN</span>;
    }
    if (p.includes('orange')) {
      return <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold text-[10px]">ORANGE MONEY</span>;
    }
    if (p.includes('stripe') || p.includes('carte')) {
      return <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-[10px]">STRIPE / CB</span>;
    }
    if (p.includes('moov')) {
      return <span className="px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-300 border border-blue-600/20 font-bold text-[10px]">MOOV MONEY</span>;
    }
    if (p.includes('mtn')) {
      return <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold text-[10px]">MTN MOMO</span>;
    }
    return <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-bold text-[10px]">CASH / VIREMENT</span>;
  };

  const handleCreateManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resto = restaurants.find(r => r.id === newInvRestoId);
    const plan = saasPlans.find(p => p.id === newInvPlanId);
    
    createManualInvoice({
      restaurant_id: newInvRestoId,
      restaurant_name: resto?.name || 'Restaurant Client',
      customer_email: resto?.email || 'contact@restaurant.com',
      plan_id: newInvPlanId,
      plan_name: plan?.name || 'Forfait SaaS',
      amount: Number(newInvAmount),
      currency: 'FCFA',
      billing_cycle: newInvCycle,
      payment_method: newInvProvider,
      payment_reference: newInvRef,
      status: newInvStatus
    });

    setShowCreateModal(false);
  };

  return (
    <OwnerLayout
      currentPath="/owner/revenue"
      navigate={navigate}
      title="Facturation & Revenus SaaS"
      subtitle="Suivi des transactions, encaissements Wave/Orange Money, métriques MRR et factures"
    >
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-stone-900 border border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Tableau de Suivi Financier Global</div>
              <div className="text-xs text-stone-400">Suivez les souscriptions mensuelles, annuelles et les flux de trésorerie</div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer un Règlement</span>
            </button>
            <button
              onClick={() => navigate('/owner/settings')}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Passerelles Paiement</span>
            </button>
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase">
              <span>MRR (Mensuel Récurrent)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">
              {mrr.toLocaleString('fr-FR')} <span className="text-xs text-amber-400 font-normal">FCFA</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>ARR Projeté : {arr.toLocaleString('fr-FR')} FCFA/an</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase">
              <span>Total Encaissé</span>
              <DollarSign className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-orange-400 mt-2 font-mono">
              {totalRevenue.toLocaleString('fr-FR')} <span className="text-xs text-amber-400 font-normal">FCFA</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-2">
              {invoices.filter(i => i.status === 'PAID').length} factures acquittées
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase">
              <span>En Attente de Règlement</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
              {pendingRevenue.toLocaleString('fr-FR')} <span className="text-xs text-amber-400 font-normal">FCFA</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-2">
              {invoices.filter(i => i.status === 'PENDING').length} factures non réglées
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase">
              <span>Taux Conversion Payant</span>
              <PieChart className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">
              {conversionRate} %
            </div>
            <div className="text-[11px] text-blue-400 mt-2">
              {payingRestaurantsCount} sur {restaurants.length} restaurants en formule payante
            </div>
          </div>

        </div>

        {/* Visual Revenue Growth & Monthly Progression Chart */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                <span>Progression Mensuelle du Revenu & Objectifs d'Encaissement</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Évolution du chiffre d'affaires mensuel récurrent sur le semestre écoulé
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span className="w-3 h-3 rounded-md bg-orange-500 inline-block" />
                <span>Revenu Encaissé</span>
              </span>
              <span className="flex items-center gap-1.5 text-stone-400">
                <span className="w-3 h-3 rounded-md bg-stone-800 border border-stone-700 inline-block" />
                <span>Objectif</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="grid grid-cols-6 gap-3 sm:gap-6 pt-4 h-48 items-end">
            {monthlyData.map((item, idx) => {
              const heightPct = Math.round((item.revenue / maxMonthly) * 100);
              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-mono text-stone-400 mb-1.5 opacity-0 group-hover:opacity-100 transition">
                    {(item.revenue / 1000).toFixed(0)}k
                  </div>
                  <div className="w-full bg-stone-950 rounded-xl overflow-hidden p-1 flex flex-col justify-end h-32 border border-stone-800/80 group-hover:border-orange-500/50 transition">
                    <div 
                      style={{ height: `${Math.min(heightPct, 100)}%` }}
                      className="w-full rounded-lg bg-gradient-to-t from-orange-600 to-amber-500 transition-all duration-500"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-stone-300 mt-2 text-center truncate w-full">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-800/80 text-xs">
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/50 flex justify-between items-center">
              <span className="text-stone-400">Panier Moyen / Resto (ARPU) :</span>
              <span className="font-mono font-bold text-white">{arpu.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/50 flex justify-between items-center">
              <span className="text-stone-400">Abonnements Annuels :</span>
              <span className="font-mono font-bold text-emerald-400">
                {invoices.filter(i => i.billing_cycle === 'yearly').length} restaurants (-20%)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/50 flex justify-between items-center">
              <span className="text-stone-400">Abonnements Mensuels :</span>
              <span className="font-mono font-bold text-amber-400">
                {invoices.filter(i => i.billing_cycle === 'monthly').length} restaurants
              </span>
            </div>
          </div>
        </div>

        {/* Payment Gateways Status Banner */}
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
          <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Passerelles de Paiement Configurées</span>
            <button 
              onClick={() => navigate('/owner/settings')}
              className="text-xs text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>Gérer les clés API & modes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {paymentProviders.map(provider => (
              <div 
                key={provider.id}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  provider.is_enabled 
                    ? 'bg-stone-950/80 border-stone-800' 
                    : 'bg-stone-950/30 border-stone-800/40 opacity-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{provider.name}</span>
                    <span className={`w-2 h-2 rounded-full ${provider.is_enabled ? 'bg-emerald-500' : 'bg-stone-600'}`} />
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">Frais: {provider.transaction_fee_pct}%</div>
                </div>
                <div className="text-[10px] text-stone-500 font-mono mt-2">
                  {provider.is_sandbox ? 'SANDBOX' : 'PROD'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-stone-900 border border-stone-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher facture, restaurant, réf..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300"
            >
              <option value="ALL">Tous les modes</option>
              <option value="wave">Wave</option>
              <option value="orange_money">Orange Money</option>
              <option value="stripe">Carte / Stripe</option>
              <option value="manual_transfer">Virement / Espèces</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300"
            >
              <option value="ALL">Tous statuts</option>
              <option value="PAID">Acquittées</option>
              <option value="PENDING">En attente</option>
              <option value="FAILED">Échouées</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] font-bold border-b border-stone-800 tracking-wider">
                <tr>
                  <th className="px-5 py-4">Numéro Facture</th>
                  <th className="px-4 py-4">Établissement</th>
                  <th className="px-4 py-4">Plan SaaS</th>
                  <th className="px-4 py-4">Montant (FCFA)</th>
                  <th className="px-4 py-4">Moyen de Paiement</th>
                  <th className="px-4 py-4">Statut</th>
                  <th className="px-4 py-4">Date d'émission</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-stone-500">
                      Aucune transaction ou facture enregistrée.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-stone-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white font-mono flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-stone-400" />
                          <span>{invoice.invoice_number}</span>
                        </div>
                        {invoice.payment_reference && (
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                            Réf: {invoice.payment_reference}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-white">{invoice.restaurant_name}</div>
                        <div className="text-[11px] text-stone-400">{invoice.customer_email}</div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-200 text-[11px] font-bold">
                          {invoice.plan_name}
                        </span>
                        <span className="block text-[10px] text-stone-400 mt-0.5">
                          {invoice.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-mono font-black text-white text-sm">
                          {invoice.amount.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {getProviderBadge(invoice.payment_method)}
                      </td>

                      <td className="px-4 py-4">
                        {invoice.status === 'PAID' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Acquittée</span>
                          </span>
                        ) : invoice.status === 'PENDING' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" />
                            <span>En attente</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold flex items-center gap-1 w-max">
                            <AlertCircle className="w-3 h-3" />
                            <span>Échouée</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-stone-400 text-[11px]">
                        {new Date(invoice.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status === 'PENDING' && (
                            <button
                              onClick={() => markInvoicePaid(invoice.id)}
                              title="Valider l'encaissement"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold transition flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Valider</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-stone-400" />
                            <span>Reçu</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Enregistrer un Règlement / Émettre une Facture Manuelle */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Enregistrer un Règlement Manuel</h3>
                    <p className="text-xs text-stone-400">Émettez une facture pour un paiement espèces, virement ou Wave externe</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-stone-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateManualSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Établissement / Restaurant</label>
                  <select
                    value={newInvRestoId}
                    onChange={e => setNewInvRestoId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white"
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Forfait / Formule</label>
                    <select
                      value={newInvPlanId}
                      onChange={e => {
                        setNewInvPlanId(e.target.value);
                        const pl = saasPlans.find(p => p.id === e.target.value);
                        if (pl) {
                          setNewInvAmount(newInvCycle === 'yearly' ? pl.price_yearly : pl.price_monthly);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white"
                    >
                      {saasPlans.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Fréquence Facturation</label>
                    <select
                      value={newInvCycle}
                      onChange={e => {
                        const cyc = e.target.value as 'monthly' | 'yearly';
                        setNewInvCycle(cyc);
                        const pl = saasPlans.find(p => p.id === newInvPlanId);
                        if (pl) {
                          setNewInvAmount(cyc === 'yearly' ? pl.price_yearly : pl.price_monthly);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white"
                    >
                      <option value="monthly">Mensuel</option>
                      <option value="yearly">Annuel (-20%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Montant Réglé (FCFA)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newInvAmount}
                      onChange={e => setNewInvAmount(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Moyen de Règlement</label>
                    <select
                      value={newInvProvider}
                      onChange={e => setNewInvProvider(e.target.value as PaymentProviderType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white"
                    >
                      <option value="wave">Wave Mobile Money</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="manual_transfer">Virement Bancaire</option>
                      <option value="stripe">Carte Bancaire / Stripe</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Référence Transaction</label>
                    <input
                      type="text"
                      value={newInvRef}
                      onChange={e => setNewInvRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Statut Initial</label>
                    <select
                      value={newInvStatus}
                      onChange={e => setNewInvStatus(e.target.value as 'PAID' | 'PENDING')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white"
                    >
                      <option value="PAID">Acquittée (Encaissé)</option>
                      <option value="PENDING">En attente d'encaissement</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-600/20"
                  >
                    Enregistrer la Facture
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* Invoice Detail & Official Printable Receipt Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  {Boolean(saasSettings.branding.logo_url && saasSettings.branding.logo_url.trim()) ? (
                    <img 
                      src={saasSettings.branding.logo_url} 
                      alt="Logo" 
                      className="w-10 h-10 object-contain rounded-xl bg-stone-950 p-1 border border-stone-800" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-sm">
                      {saasSettings.branding.platform_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-black text-white font-mono">{selectedInvoice.invoice_number}</h3>
                    <p className="text-xs text-orange-400 font-semibold">{saasSettings.branding.platform_name} • Reçu Officiel</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-stone-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Status Stamp */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-950 border border-stone-800">
                <span className="text-stone-400 text-xs">Statut de la Transaction :</span>
                {selectedInvoice.status === 'PAID' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>RÈGLEMENT ACQUITTÉ</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>EN COURS DE VALIDATION</span>
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                  <span className="text-stone-400">Client / Établissement :</span>
                  <span className="font-bold text-white">{selectedInvoice.restaurant_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                  <span className="text-stone-400">Email Facturation :</span>
                  <span className="font-mono text-stone-300">{selectedInvoice.customer_email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                  <span className="text-stone-400">Forfait & Cycle :</span>
                  <span className="font-bold text-orange-400">
                    {selectedInvoice.plan_name} ({selectedInvoice.billing_cycle === 'yearly' ? 'Facturation Annuelle' : 'Facturation Mensuelle'})
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                  <span className="text-stone-400">Passerelle de Paiement :</span>
                  <span>{getProviderBadge(selectedInvoice.payment_method)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                  <span className="text-stone-400">Réf. Transaction Passerelle :</span>
                  <span className="font-mono text-stone-300">{selectedInvoice.payment_reference || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                  <span className="text-stone-400">Période Couverte :</span>
                  <span className="text-stone-300">
                    {new Date(selectedInvoice.period_start).toLocaleDateString('fr-FR')} au {new Date(selectedInvoice.period_end).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t border-stone-700 text-sm">
                  <span className="font-bold text-white">Montant Total TTC :</span>
                  <span className="font-mono font-black text-amber-400 text-base">
                    {selectedInvoice.amount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Reçu</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Reçu officiel renvoyé par email à ${selectedInvoice.customer_email}`, 'success');
                  }}
                  className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Renvoyer par Email</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </OwnerLayout>
  );
};
