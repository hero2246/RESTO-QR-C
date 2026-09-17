import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { SupportTicket } from '../../types';
import { formatDate, formatTime } from '../../utils/format';
import { 
  LifeBuoy, 
  Send, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Building2, 
  AlertTriangle,
  Search,
  ShieldCheck,
  Check,
  Lock
} from 'lucide-react';

interface OwnerSupportPageProps {
  navigate: (path: string) => void;
}

export const OwnerSupportPage: React.FC<OwnerSupportPageProps> = ({ navigate }) => {
  const { 
    supportTickets, 
    replySupportTicket, 
    updateSupportTicketStatus, 
    restaurants 
  } = useApp();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');

  const filteredTickets = useMemo(() => {
    return supportTickets
      .filter(t => {
        if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return t.subject.toLowerCase().includes(q) || 
                 t.restaurant_name.toLowerCase().includes(q) ||
                 t.id.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [supportTickets, filterStatus, search]);

  const activeTicket = useMemo(() => {
    if (!selectedTicketId) return filteredTickets[0] || null;
    return filteredTickets.find(t => t.id === selectedTicketId) || filteredTickets[0] || null;
  }, [filteredTickets, selectedTicketId]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    replySupportTicket(activeTicket.id, replyText);
    setReplyText('');
  };

  const handleStatusChange = (status: SupportTicket['status']) => {
    if (!activeTicket) return;
    updateSupportTicketStatus(activeTicket.id, status);
  };

  const openTicketsCount = supportTickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = supportTickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = supportTickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <OwnerLayout
      currentPath="/owner/support"
      navigate={navigate}
      title="Support & Assistance"
      subtitle="Assistance centralisée et résolution des tickets pour tous les restaurants partenaires"
      actions={
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
            {openTicketsCount} Ouvert(s)
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
            {inProgressCount} En cours
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            {resolvedCount} Résolu(s)
          </span>
        </div>
      }
    >
      {/* Main Grid: Ticket List + Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sidebar: Filters & Ticket List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[720px]">
          {/* Filter Bar */}
          <div className="p-3 border-b border-stone-200 space-y-2 bg-stone-50/70">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher resto, sujet, #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="flex rounded-lg bg-stone-200/60 p-0.5 text-[11px] font-bold">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`flex-1 py-1 rounded-md transition ${filterStatus === 'ALL' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'}`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterStatus('OPEN')}
                className={`flex-1 py-1 rounded-md transition ${filterStatus === 'OPEN' ? 'bg-white shadow-xs text-amber-700 font-black' : 'text-stone-600'}`}
              >
                Ouverts
              </button>
              <button
                onClick={() => setFilterStatus('IN_PROGRESS')}
                className={`flex-1 py-1 rounded-md transition ${filterStatus === 'IN_PROGRESS' ? 'bg-white shadow-xs text-blue-700' : 'text-stone-600'}`}
              >
                En cours
              </button>
              <button
                onClick={() => setFilterStatus('RESOLVED')}
                className={`flex-1 py-1 rounded-md transition ${filterStatus === 'RESOLVED' ? 'bg-white shadow-xs text-emerald-700' : 'text-stone-600'}`}
              >
                Résolus
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Aucun ticket ne correspond aux critères.
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const isSelected = activeTicket?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    id={`owner-ticket-item-${ticket.id}`}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 ${
                      isSelected ? 'bg-orange-50/70 border-l-4 border-orange-600' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{ticket.restaurant_name}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        ticket.status === 'OPEN'
                          ? 'bg-amber-100 text-amber-800'
                          : ticket.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : ticket.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-stone-800 line-clamp-1">
                      {ticket.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                      <span className="font-mono">#{ticket.id}</span>
                      <span>{formatDate(ticket.updated_at)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[720px]">
          {activeTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-orange-600" />
                      {activeTicket.restaurant_name}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">#{activeTicket.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                      {activeTicket.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTicket.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {activeTicket.priority}
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-stone-900">{activeTicket.subject}</h3>
                </div>

                {/* Status action dropdown / buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <span className="text-[11px] text-stone-500 font-medium">Statut :</span>
                  <select
                    id="ticket-status-select"
                    value={activeTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-bold bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden shadow-xs"
                  >
                    <option value="OPEN">Ouvert</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="RESOLVED">Résolu</option>
                    <option value="CLOSED">Clôturé</option>
                  </select>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/30">
                {activeTicket.messages.map(msg => {
                  const isStaffOrAdmin = msg.sender_role === 'OWNER' || msg.sender_role === 'SAAS_EMPLOYEE';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaffOrAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-stone-500">
                        <span className="font-bold text-stone-700">{msg.sender_name}</span>
                        {isStaffOrAdmin && (
                          <span className="inline-flex items-center gap-1 font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" />
                            Admin Support
                          </span>
                        )}
                        <span>• {formatDate(msg.created_at)} à {formatTime(msg.created_at)}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                          isStaffOrAdmin
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-white text-stone-900 border border-stone-200 shadow-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-3.5 border-t border-stone-200 bg-white flex items-center gap-2">
                <input
                  id="owner-support-reply-input"
                  type="text"
                  placeholder={`Répondre à ${activeTicket.restaurant_name} en tant que Support...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
                <button
                  id="btn-owner-send-reply"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Répondre</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <LifeBuoy className="w-12 h-12 text-stone-300 mb-2" />
              <p className="text-xs font-medium">Sélectionnez un ticket dans la liste pour voir les échanges</p>
            </div>
          )}
        </div>

      </div>
    </OwnerLayout>
  );
};
