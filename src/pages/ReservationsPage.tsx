import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RestaurantReservation } from '../types';
import { formatDate } from '../utils/format';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  Filter, 
  Search,
  Layers
} from 'lucide-react';

interface ReservationsPageProps {
  navigate: (path: string) => void;
}

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ navigate }) => {
  const { 
    activeRestaurant, 
    reservations, 
    createReservation, 
    updateReservationStatus, 
    tables,
    showToast 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('20:00');
  const [selectedTable, setSelectedTable] = useState('');
  const [notes, setNotes] = useState('');

  // Reservations for active restaurant
  const restoReservations = useMemo(() => {
    if (!activeRestaurant) return [];
    return reservations
      .filter(r => r.restaurant_id === activeRestaurant.id)
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  }, [reservations, activeRestaurant]);

  const filteredReservations = useMemo(() => {
    return restoReservations.filter(r => {
      if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return r.customer_name.toLowerCase().includes(q) ||
               r.customer_phone.toLowerCase().includes(q) ||
               (r.table_number && r.table_number.toLowerCase().includes(q));
      }
      return true;
    });
  }, [restoReservations, filterStatus, search]);

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRestaurant || !customerName.trim() || !customerPhone.trim()) return;

    createReservation({
      restaurant_id: activeRestaurant.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || undefined,
      guests_count: Number(guestsCount) || 2,
      date,
      time,
      status: 'CONFIRMED',
      table_number: selectedTable || undefined,
      notes: notes || undefined,
    });

    setShowNewModal(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
  };

  const handleStatusChange = (id: string, newStatus: RestaurantReservation['status']) => {
    updateReservationStatus(id, newStatus);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-600/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900 tracking-tight">Cahier de Réservations</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                {activeRestaurant?.name || 'Restaurant'}
              </span>
            </div>
            <p className="text-xs text-stone-500">Gestion des tables réservées et prévisions de service</p>
          </div>
        </div>

        <button
          id="btn-new-reservation"
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle réservation</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  filterStatus === s
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s === 'ALL' ? 'Toutes' : s === 'PENDING' ? 'En attente' : s === 'CONFIRMED' ? 'Confirmées' : s === 'COMPLETED' ? 'Honorées' : 'Annulées'}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher client, tél, table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Reservations Cards / Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {filteredReservations.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              Aucune réservation trouvée pour les critères sélectionnés.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredReservations.map(res => (
                <div
                  key={res.id}
                  className="p-4 hover:bg-stone-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900 text-sm">
                        {res.customer_name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 font-bold text-xs">
                        <Users className="w-3.5 h-3.5" />
                        {res.guests_count} pers.
                      </span>
                      {res.table_number && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white font-bold text-xs">
                          {res.table_number}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        res.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : res.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : res.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {res.status === 'CONFIRMED' ? 'CONFIRMÉE' : res.status === 'PENDING' ? 'EN ATTENTE' : res.status === 'COMPLETED' ? 'HONORÉE' : 'ANNULÉE'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                        <CalendarDays className="w-3.5 h-3.5 text-orange-600" />
                        {formatDate(res.date)} à {res.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        {res.customer_phone}
                      </span>
                      {res.customer_email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          {res.customer_email}
                        </span>
                      )}
                    </div>

                    {res.notes && (
                      <p className="text-xs text-stone-500 italic bg-stone-50 p-1.5 rounded-md">
                        Note : {res.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {res.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusChange(res.id, 'CONFIRMED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmer</span>
                      </button>
                    )}

                    {res.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusChange(res.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Client Arrivé (Honorée)</span>
                      </button>
                    )}

                    {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleStatusChange(res.id, 'CANCELLED')}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 hover:text-rose-700 text-stone-600 font-bold text-xs transition"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal: New Reservation */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-stone-200">
            <h3 className="text-base font-black text-stone-900 mb-1">
              Enregistrer une réservation
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Réservation prise par téléphone, email ou passage direct.
            </p>

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean Dupont"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Couverts / Pers.
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Table assignée (optionnel)
                  </label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  >
                    <option value="">-- Sans table fixe pour le moment --</option>
                    {tables.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.capacity} places)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    placeholder="client@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Notes / Demandes particulières
                </label>
                <textarea
                  rows={2}
                  placeholder="ex: Chaise haute pour enfant, allergie fruits de mer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Enregistrer la réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
