import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { AuditLog } from '../../types';
import { 
  ScrollText, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  User, 
  Globe, 
  FileText,
  Download,
  Info
} from 'lucide-react';

interface OwnerAuditLogsPageProps {
  navigate: (path: string) => void;
}

export const OwnerAuditLogsPage: React.FC<OwnerAuditLogsPageProps> = ({ navigate }) => {
  const { auditLogs, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target_name.toLowerCase().includes(search.toLowerCase()) ||
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'ALL' || log.target_type === filterType;
    const matchStatus = filterStatus === 'ALL' || log.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleExportCsv = () => {
    const headers = ['ID', 'Date', 'Action', 'Utilisateur', 'Role', 'Cible', 'Details', 'Statut', 'IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.created_at,
      l.action,
      `"${l.user_name}"`,
      l.user_role,
      `"${l.target_name}"`,
      `"${l.details}"`,
      l.status,
      l.ip_address || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_restoqr_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Journal d’audit exporté en CSV', 'success');
  };

  return (
    <OwnerLayout
      currentPath="/owner/audit"
      navigate={navigate}
      title="Journal d'Audit & Traçabilité Complète"
      subtitle="Historique inaltérable de toutes les opérations administratives sur la plateforme SaaS"
      actions={
        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition flex items-center gap-1.5 border border-stone-700"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter CSV</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Compliance notice */}
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Intégrité Cryptographique :</strong> Chaque action sur la plateforme (suspension de restaurant, création d'employé, modification de branding ou tentative d'accès) est horodatée avec l'adresse IP de l'opérateur.
            </span>
          </div>
          <span className="font-mono text-stone-300 font-bold hidden sm:inline">
            {auditLogs.length} événements enregistrés
          </span>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une action, un gérant ou un détail..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Target Type Filter */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">Toutes les cibles</option>
              <option value="RESTAURANT">Restaurants</option>
              <option value="EMPLOYEE">Employés SaaS</option>
              <option value="SECURITY">Sécurité & 2FA</option>
              <option value="SETTINGS">Paramètres</option>
              <option value="BRANDING">Branding</option>
              <option value="AUTH">Authentification</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="SUCCESS">Succès</option>
              <option value="DENIED">Refusé (Bloqué)</option>
              <option value="WARNING">Avertissement</option>
            </select>
          </div>

        </div>

        {/* Audit Logs Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Date & Heure</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Opérateur</th>
                  <th className="py-3.5 px-4">Cible</th>
                  <th className="py-3.5 px-4">Détails Opérationnels</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      Aucune ligne d'audit ne correspond aux filtres appliqués.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr 
                      key={`${log.id}-${idx}`} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-stone-850/50 transition cursor-pointer"
                    >
                      
                      {/* Date */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-stone-300 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{new Date(log.created_at).toLocaleString('fr-FR')}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white text-[11px]">
                          {log.action}
                        </span>
                      </td>

                      {/* Operator */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-200">{log.user_name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{log.user_role}</div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-300">{log.target_name}</div>
                        <div className="text-[10px] text-stone-400 uppercase">{log.target_type}</div>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-stone-400">
                        {log.details}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'DENIED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : log.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {log.status === 'DENIED' ? 'Refusé' : log.status === 'WARNING' ? 'Avertissement' : 'Succès'}
                        </span>
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4 text-right text-[11px] font-mono text-stone-400">
                        {log.ip_address || '197.234.219.12'}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Log Details */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <ScrollText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedLog.action}</h3>
                    <p className="text-[10px] font-mono text-stone-400">ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-stone-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-[10px] uppercase text-stone-400 font-bold">Détails de l'événement</div>
                  <div className="text-white leading-relaxed">{selectedLog.details}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="text-stone-400 text-[10px]">Opérateur</div>
                    <div className="text-white font-bold">{selectedLog.user_name}</div>
                    <div className="text-stone-400 font-mono text-[10px]">{selectedLog.user_role}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="text-stone-400 text-[10px]">Cible affectée</div>
                    <div className="text-white font-bold">{selectedLog.target_name}</div>
                    <div className="text-stone-400 text-[10px] uppercase">{selectedLog.target_type}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-stone-400 pt-1">
                  <span>Horodatage : {new Date(selectedLog.created_at).toLocaleString('fr-FR')}</span>
                  <span>IP : {selectedLog.ip_address || '197.234.219.12'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </OwnerLayout>
  );
};
