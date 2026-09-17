import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantStaffMember, StaffEmploymentStatus, AttendanceStatusType } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ShieldOff, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Key, 
  Copy, 
  Check, 
  X, 
  Send,
  MoreVertical,
  Activity
} from 'lucide-react';

interface StaffListTabProps {
  onOpenAddModal: () => void;
  onEditStaff: (staff: RestaurantStaffMember) => void;
}

export const StaffListTab: React.FC<StaffListTabProps> = ({ onOpenAddModal, onEditStaff }) => {
  const {
    activeRestaurant,
    restaurantStaff,
    attendanceRecords,
    currentUser,
    deactivateRestaurantStaff,
    deleteRestaurantStaff,
    sendStaffInvitation,
    checkInStaff,
    checkOutStaff,
    showToast
  } = useApp();

  const isOwner = currentUser?.role === 'OWNER' || currentUser?.role === 'RESTAURANT_OWNER';
  const todayStr = new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Delete confirmation modal
  const [staffToDelete, setStaffToDelete] = useState<RestaurantStaffMember | null>(null);

  // Invite code modal
  const [staffToInvite, setStaffToInvite] = useState<RestaurantStaffMember | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!activeRestaurant) return null;

  // Filter staff by active restaurant
  const currentStaff = restaurantStaff.filter(s => s.restaurant_id === activeRestaurant.id);

  // Get today's attendance records to determine today's status
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter(
      r => r.restaurant_id === activeRestaurant.id && r.date === todayStr
    );
  }, [attendanceRecords, activeRestaurant, todayStr]);

  // Combined staff with calculated status
  const staffWithTodayInfo = useMemo(() => {
    return currentStaff.map(staff => {
      const attRecord = todayRecords.find(r => r.staff_id === staff.id);
      let todayAttendanceStatus: AttendanceStatusType = 'UNSPECIFIED';

      if (attRecord) {
        todayAttendanceStatus = attRecord.status;
      } else if (staff.is_online) {
        todayAttendanceStatus = 'PRESENT';
      }

      return {
        ...staff,
        todayAttendanceStatus
      };
    });
  }, [currentStaff, todayRecords]);

  // Filtered list
  const filteredStaff = useMemo(() => {
    return staffWithTodayInfo.filter(s => {
      if (statusFilter !== 'ALL') {
        const empStatus = s.employment_status || (s.is_active ? 'ACTIVE' : 'INACTIVE');
        if (empStatus !== statusFilter) return false;
      }

      if (roleFilter !== 'ALL' && s.staff_role !== roleFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.phone && s.phone.includes(q)) ||
          (s.position_title && s.position_title.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [staffWithTodayInfo, statusFilter, roleFilter, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('Code d’invitation copié dans le presse-papier !', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getEmploymentBadge = (status?: StaffEmploymentStatus, isActive?: boolean) => {
    const s = status || (isActive ? 'ACTIVE' : 'INACTIVE');
    switch (s) {
      case 'ACTIVE':
        return { label: 'Actif', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'ON_LEAVE':
        return { label: 'En congé', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'SUSPENDED':
        return { label: 'Suspendu', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Inactif', bg: 'bg-stone-100 text-stone-600 border-stone-200' };
    }
  };

  const getAttendanceBadge = (status: AttendanceStatusType) => {
    switch (status) {
      case 'PRESENT':
        return { label: 'Présent', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 'LATE':
        return { label: 'En retard', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case 'ABSENT':
        return { label: 'Absent', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
      case 'ON_LEAVE':
        return { label: 'En congé', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
      default:
        return { label: 'Non pointé', bg: 'bg-stone-50 text-stone-500 border-stone-200', dot: 'bg-stone-400' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Main Action */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span>Gestion Complète des Collaborateurs</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Effectif, plannings, présences en direct, rôles et attributions du restaurant {activeRestaurant.name}.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Collaborateur</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone ou poste..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'INACTIVE'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {st === 'ALL' ? 'Tous les statuts' :
               st === 'ACTIVE' ? 'Actifs' :
               st === 'ON_LEAVE' ? 'En congé' :
               st === 'SUSPENDED' ? 'Suspendus' : 'Inactifs'}
            </button>
          ))}
        </div>

      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Collaborateur</th>
                <th className="px-4 py-3.5">Poste & Fonction</th>
                <th className="px-4 py-3.5">Statut</th>
                <th className="px-4 py-3.5">Présence Jour</th>
                <th className="px-4 py-3.5">Embauche</th>
                <th className="px-4 py-3.5">Tâches Jour</th>
                {isOwner && <th className="px-4 py-3.5">Rémunération</th>}
                <th className="px-4 py-3.5">Activité</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={isOwner ? 9 : 8} className="py-14 text-center text-stone-400">
                    Aucun collaborateur trouvé correspondant à ces filtres.
                  </td>
                </tr>
              ) : (
                filteredStaff.map(staff => {
                  const empBadge = getEmploymentBadge(staff.employment_status, staff.is_active);
                  const attBadge = getAttendanceBadge(staff.todayAttendanceStatus);

                  return (
                    <tr key={staff.id} className="hover:bg-stone-50/60 transition">
                      
                      {/* Photo & Name & Contact */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={staff.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-2xl object-cover border border-stone-200"
                            />
                            {staff.is_online && (
                              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                            )}
                          </div>
                          <div>
                            <div className="font-black text-stone-900 leading-tight flex items-center gap-1.5">
                              <span>{staff.name}</span>
                            </div>
                            <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Mail className="w-3 h-3 text-stone-300" />
                                {staff.email}
                              </span>
                              {staff.phone && (
                                <>
                                  <span className="text-stone-300">•</span>
                                  <span className="flex items-center gap-0.5">
                                    <Phone className="w-3 h-3 text-stone-300" />
                                    {staff.phone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Position & System role */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-stone-900 block">
                          {staff.position_title || 'Collaborateur'}
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block mt-0.5">
                          Rôle : {staff.staff_role}
                        </span>
                      </td>

                      {/* Employment Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${empBadge.bg}`}>
                          {empBadge.label}
                        </span>
                      </td>

                      {/* Today's Presence */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${attBadge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${attBadge.dot}`} />
                          <span>{attBadge.label}</span>
                        </span>
                      </td>

                      {/* Hire Date */}
                      <td className="px-4 py-4 text-stone-500 font-mono text-[11px]">
                        {staff.hire_date || staff.created_at?.split('T')[0] || '—'}
                      </td>

                      {/* Today's Tasks completed */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-bold text-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{staff.today_tasks_completed || 0}</span>
                        </span>
                      </td>

                      {/* Salary (Owner only) */}
                      {isOwner && (
                        <td className="px-4 py-4 font-bold text-stone-900 font-mono">
                          {staff.salary ? `${staff.salary.toLocaleString('fr-FR')} FCFA` : '—'}
                        </td>
                      )}

                      {/* Last Activity */}
                      <td className="px-4 py-4 text-stone-500 text-[11px]">
                        {staff.last_active_at ? (
                          <span className="font-mono">{new Date(staff.last_active_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                          'Récemment'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Pointage toggle */}
                          {staff.is_online ? (
                            <button
                              onClick={() => checkOutStaff(staff.id)}
                              className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] transition"
                              title="Pointer départ"
                            >
                              Départ
                            </button>
                          ) : (
                            <button
                              onClick={() => checkInStaff(staff.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] transition border border-emerald-200"
                              title="Pointer arrivée"
                            >
                              Arrivée
                            </button>
                          )}

                          {/* Invite / Access code */}
                          <button
                            onClick={() => setStaffToInvite(staff)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Code d'accès & Invitation"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditStaff(staff)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
                            title="Modifier la fiche"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Deactivate */}
                          <button
                            onClick={() => deactivateRestaurantStaff(staff.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            title={staff.is_active ? "Désactiver l'employé" : "Réactiver l'employé"}
                          >
                            <ShieldOff className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setStaffToDelete(staff)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-100">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900">Supprimer le collaborateur ?</h3>
              <p className="text-xs text-stone-500">
                Êtes-vous sûr de vouloir supprimer définitivement <span className="font-bold text-stone-800">{staffToDelete.name}</span> ?
                Pour conserver l'historique sans donner accès, préférez l'option <strong>Désactiver</strong>.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRestaurantStaff(staffToDelete.id);
                  setStaffToDelete(null);
                }}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-600/20"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Code Modal */}
      {staffToInvite && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Accès & Invitation Employé</h3>
                <p className="text-xs text-stone-500">{staffToInvite.name} ({staffToInvite.position_title})</p>
              </div>
              <button
                onClick={() => setStaffToInvite(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-700 block">
                Code d'invitation sécurisé :
              </span>
              <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border border-stone-200 font-mono text-sm font-black text-stone-900">
                <span>{staffToInvite.invitation_code || 'INV-9821'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(staffToInvite.invitation_code || 'INV-9821')}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold transition flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Transmettez ce code ou ses identifiants ({staffToInvite.email}) au collaborateur pour qu'il se connecte directement à son interface.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  sendStaffInvitation(staffToInvite.id);
                  setStaffToInvite(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Renvoyer l'invitation</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
