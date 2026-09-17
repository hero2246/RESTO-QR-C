import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SupportTicket } from '../types';
import { formatDate, formatTime } from '../utils/format';
import { 
  LifeBuoy, 
  Plus, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface RestaurantSupportPageProps {
  navigate: (path: string) => void;
}

export const RestaurantSupportPage: React.FC<RestaurantSupportPageProps> = ({ navigate }) => {
  const { 
    activeRestaurant, 
    supportTickets, 
    createSupportTicket, 
    replySupportTicket, 
    currentUser 
  } = useApp();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('TECHNIQUE');
  const [newPriority, setNewPriority] = useState<SupportTicket['priority']>('NORMAL');
  const [newMessage, setNewMessage] = useState('');
  const [replyText, setReplyText] = useState('');

  // Tickets for current restaurant
  const myTickets = useMemo(() => {
    if (!activeRestaurant) return [];
    return supportTickets
      .filter(t => t.restaurant_id === activeRestaurant.id)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [supportTickets, activeRestaurant]);

  // Set first ticket as active by default if none selected
  const activeTicket = useMemo(() => {
    if (!activeTicketId) return myTickets[0] || null;
    return myTickets.find(t => t.id === activeTicketId) || myTickets[0] || null;
  }, [myTickets, activeTicketId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim() || !activeRestaurant) return;
    createSupportTicket(activeRestaurant.id, newSubject, newCategory, newPriority, newMessage);
    setNewSubject('');
    setNewMessage('');
    setShowCreateModal(false);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    replySupportTicket(activeTicket.id, replyText);
    setReplyText('');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-600/20">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900 tracking-tight">Support & Assistance</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                {activeRestaurant?.name || 'Restaurant'}
              </span>
            </div>
            <p className="text-xs text-stone-500">Contact direct avec l'équipe technique et commerciale de la plateforme</p>
          </div>
        </div>

        <button
          id="btn-open-new-ticket"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un nouveau ticket</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tickets list */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Mes Tickets ({myTickets.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {myTickets.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Aucun ticket ouvert. Cliquez sur "Créer un nouveau ticket" si vous avez besoin d'aide.
              </div>
            ) : (
              myTickets.map(t => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    id={`ticket-item-${t.id}`}
                    onClick={() => setActiveTicketId(t.id)}
                    className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                      isSelected ? 'bg-orange-50/70 border-l-4 border-orange-600' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        t.status === 'OPEN'
                          ? 'bg-amber-100 text-amber-800'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : t.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {t.status === 'OPEN' ? 'OUVERT' : t.status === 'IN_PROGRESS' ? 'EN COURS' : t.status === 'RESOLVED' ? 'RÉSOLU' : 'FERMÉ'}
                      </span>

                      <span className="text-[10px] text-stone-400">
                        {formatDate(t.updated_at)}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-stone-900 line-clamp-1">
                      {t.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="capitalize">{t.category.toLowerCase().replace('_', ' ')}</span>
                      <span>{t.messages.length} message(s)</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Ticket Chat & Discussion View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
          {activeTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-stone-400">#{activeTicket.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      activeTicket.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-800'
                        : activeTicket.priority === 'HIGH'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      Priorité {activeTicket.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {activeTicket.category}
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-stone-900">{activeTicket.subject}</h3>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                    activeTicket.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeTicket.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeTicket.status === 'RESOLVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{activeTicket.status}</span>
                  </span>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/30">
                {activeTicket.messages.map(msg => {
                  const isStaffOrAdmin = msg.sender_role === 'OWNER' || msg.sender_role === 'SAAS_EMPLOYEE';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaffOrAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-stone-500">
                        {isStaffOrAdmin && (
                          <span className="inline-flex items-center gap-1 font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" />
                            Support Plateforme
                          </span>
                        )}
                        <span className="font-semibold text-stone-700">{msg.sender_name}</span>
                        <span>• {formatTime(msg.created_at)}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                          isStaffOrAdmin
                            ? 'bg-white text-stone-900 border border-stone-200 shadow-xs'
                            : 'bg-orange-600 text-white shadow-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Bar */}
              {activeTicket.status !== 'CLOSED' ? (
                <form onSubmit={handleReply} className="p-3 border-t border-stone-200 bg-white flex items-center gap-2">
                  <input
                    id="support-reply-input"
                    type="text"
                    placeholder="Écrivez votre réponse à l'assistance..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                  <button
                    id="btn-send-support-reply"
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 border-t border-stone-200 bg-stone-50 text-center text-xs text-stone-400 font-medium">
                  Ce ticket a été clôturé. Vous pouvez créer un nouveau ticket si besoin.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <LifeBuoy className="w-12 h-12 text-stone-300 mb-2" />
              <p className="text-xs font-medium">Sélectionnez un ticket pour afficher la conversation</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Create Ticket */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-stone-200">
            <h3 className="text-base font-black text-stone-900 mb-1">
              Ouvrir un nouveau ticket de support
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Notre équipe d'assistance vous répond sous 1 à 2 heures ouvrées.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Sujet de votre demande
                </label>
                <input
                  id="ticket-new-subject"
                  type="text"
                  required
                  placeholder="ex: Problème d'impression des tickets..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  >
                    <option value="TECHNIQUE">Technique / Bug</option>
                    <option value="FACTURATION">Facturation / Forfaits</option>
                    <option value="MENU_SITE">Menu & Mini-site</option>
                    <option value="AUTRE">Autre demande</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Priorité
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  >
                    <option value="LOW">Basse</option>
                    <option value="NORMAL">Normale</option>
                    <option value="HIGH">Haute</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Description détaillée
                </label>
                <textarea
                  id="ticket-new-message"
                  required
                  rows={4}
                  placeholder="Détaillez votre question ou le comportement observé..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  id="btn-submit-new-ticket"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Créer et envoyer le ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
