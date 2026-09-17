import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatusType } from '../../types';
import { 
  Clock, 
  Calendar, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Users, 
  X, 
  Coffee, 
  Flame,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export const AttendanceTab: React.FC = () => {
  const {
    activeRestaurant,
    restaurantStaff,
    attendanceRecords,
    recordAttendanceManual,
    checkInStaff,
    checkOutStaff,
    currentUser,
    showToast
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal manual edit
  const [showManualModal, setShowManualModal] = useState(false);
  const [targetStaffId, setTargetStaffId] = useState('');
  const [modalDate, setModalDate] = useState(todayStr);
  const [modalStatus, setModalStatus] = useState<AttendanceStatusType>('PRESENT');
  const [modalCheckIn, setModalCheckIn] = useState('11:00');
  const [modalCheckOut, setModalCheckOut] = useState('23:00');
  const [modalHours, setModalHours] = useState<number>(8);
  const [modalNotes, setModalNotes] = useState('');

  if (!activeRestaurant) return null;

  // Filter staff by current restaurant
  const currentStaff = restaurantStaff.filter(s => s.restaurant_id === activeRestaurant.id);

  // Filter attendance records by restaurant and selected date
  const recordsForDate = useMemo(() => {
    return attendanceRecords.filter(
      r => r.restaurant_id === activeRestaurant.id && r.date === selectedDate
    );
  }, [attendanceRecords, activeRestaurant, selectedDate]);

  // Combine staff with today's attendance so every staff member is visible
  const attendanceDisplayList = useMemo(() => {
    return currentStaff.map(staff => {
      const record = recordsForDate.find(r => r.staff_id === staff.id);
      if (record) {
        return {
          staff,
          record,
          status: record.status,
          checkIn: record.check_in_time,
          checkOut: record.check_out_time,
          hours: record.hours_worked || 0,
          validatedBy: record.recorded_by || 'Système'
        };
      } else {
        // Not checked in yet
        return {
          staff,
          record: null,
          status: (staff.is_online ? 'PRESENT' : 'UNSPECIFIED') as AttendanceStatusType,
          checkIn: staff.checked_in_at ? new Date(staff.checked_in_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : undefined,
          checkOut: staff.checked_out_at ? new Date(staff.checked_out_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : undefined,
          hours: 0,
          validatedBy: staff.is_online ? 'En direct' : '-'
        };
      }
    });
  }, [currentStaff, recordsForDate]);

  // Filtered by status and search
  const filteredList = useMemo(() => {
    return attendanceDisplayList.filter(item => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.staff.name.toLowerCase().includes(query) ||
          item.staff.email.toLowerCase().includes(query) ||
          (item.staff.position_title && item.staff.position_title.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [attendanceDisplayList, statusFilter, searchQuery]);

  // KPIs
  const totalStaffCount = currentStaff.length;
  const presentCount = attendanceDisplayList.filter(i => i.status === 'PRESENT').length;
  const lateCount = attendanceDisplayList.filter(i => i.status === 'LATE').length;
  const leaveCount = attendanceDisplayList.filter(i => i.status === 'ON_LEAVE' || i.status === 'ABSENT').length;
  const attendanceRate = totalStaffCount > 0 ? Math.round(((presentCount + lateCount) / totalStaffCount) * 100) : 0;

  const handleOpenManual = (staffId?: string) => {
    const sId = staffId || currentStaff[0]?.id || '';
    setTargetStaffId(sId);
    setModalDate(selectedDate);
    const existing = recordsForDate.find(r => r.staff_id === sId);
    if (existing) {
      setModalStatus(existing.status);
      setModalCheckIn(existing.check_in_time || '11:00');
      setModalCheckOut(existing.check_out_time || '23:00');
      setModalHours(existing.hours_worked || 8);
      setModalNotes(existing.notes || '');
    } else {
      setModalStatus('PRESENT');
      setModalCheckIn('11:00');
      setModalCheckOut('23:00');
      setModalHours(8);
      setModalNotes('');
    }
    setShowManualModal(true);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStaffId) return;

    recordAttendanceManual({
      staff_id: targetStaffId,
      date: modalDate,
      status: modalStatus,
      check_in_time: modalCheckIn,
      check_out_time: modalCheckOut,
      hours_worked: Number(modalHours),
      notes: modalNotes
    });

    setShowManualModal(false);
  };

  const getStatusBadge = (status: AttendanceStatusType) => {
    switch (status) {
      case 'PRESENT':
        return { label: 'Présent', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
      case 'LATE':
        return { label: 'En retard', bg: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
      case 'ABSENT':
        return { label: 'Absent injustifié', bg: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' };
      case 'ON_LEAVE':
        return { label: 'En congé / Repos', bg: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' };
      default:
        return { label: 'Non pointé', bg: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400' };
    }
  };

  // Find if current user is logged in as staff
  const myStaffRecord = currentStaff.find(
    s => Boolean(currentUser?.email && s.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Quick Pointage */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span>Registre Journalier de Présence & Pointage</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Suivi des arrivées, départs, retards et heures effectives pour l'établissement {activeRestaurant.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Pointage for logged in staff */}
          {myStaffRecord && (
            <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-700 pl-2">
                Mon pointage ({myStaffRecord.name}) :
              </span>
              {myStaffRecord.is_online ? (
                <button
                  onClick={() => checkOutStaff(myStaffRecord.id)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>Terminer Service</span>
                </button>
              ) : (
                <button
                  onClick={() => checkInStaff(myStaffRecord.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>Prendre mon Poste</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => handleOpenManual()}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Ajustement Manuel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Effectif Total</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-black text-stone-900">{totalStaffCount}</div>
          <p className="text-[10px] text-stone-400">Collaborateurs enregistrés</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold">Présents en Service</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{presentCount}</div>
          <p className="text-[10px] text-emerald-600/80">Pointés au restaurant</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold">En Retard</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700">{lateCount}</div>
          <p className="text-[10px] text-amber-600/80">Arrivées après l'horaire</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold">Taux de Présence</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700">{attendanceRate}%</div>
          <p className="text-[10px] text-blue-600/80">Pour la journée du {selectedDate}</p>
        </div>
      </div>

      {/* Date & Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700">
            <Calendar className="w-4 h-4 text-stone-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-stone-900 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedDate === todayStr ? 'bg-orange-600 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            Aujourd'hui
          </button>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE', 'UNSPECIFIED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {st === 'ALL' ? 'Tous' :
               st === 'PRESENT' ? 'Présents' :
               st === 'LATE' ? 'Retards' :
               st === 'ABSENT' ? 'Absents' :
               st === 'ON_LEAVE' ? 'Congés' : 'Non pointés'}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Collaborateur</th>
                <th className="px-4 py-3.5">Poste & Fonction</th>
                <th className="px-4 py-3.5">Statut du Jour</th>
                <th className="px-4 py-3.5">Arrivée</th>
                <th className="px-4 py-3.5">Départ</th>
                <th className="px-4 py-3.5">Heures</th>
                <th className="px-4 py-3.5">Tâches Finies</th>
                <th className="px-4 py-3.5">Validé Par</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    Aucun enregistrement de présence pour cette date ou ce filtre.
                  </td>
                </tr>
              ) : (
                filteredList.map(({ staff, record, status, checkIn, checkOut, hours, validatedBy }) => {
                  const badge = getStatusBadge(status);

                  return (
                    <tr key={staff.id} className="hover:bg-stone-50/60 transition">
                      
                      {/* Staff Identity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={staff.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-black text-stone-900 leading-tight">{staff.name}</div>
                            <div className="text-[11px] text-stone-400">{staff.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-stone-800 block">
                          {staff.position_title || 'Collaborateur'}
                        </span>
                        <span className="text-[10px] text-stone-400 block font-mono">
                          {staff.shift_hours || 'Service continu'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Check-in */}
                      <td className="px-4 py-4 font-mono font-bold text-stone-900">
                        {checkIn || '—'}
                      </td>

                      {/* Check-out */}
                      <td className="px-4 py-4 font-mono font-bold text-stone-900">
                        {checkOut || (status === 'PRESENT' ? 'En cours' : '—')}
                      </td>

                      {/* Worked Hours */}
                      <td className="px-4 py-4 font-semibold text-stone-700">
                        {hours > 0 ? `${hours}h` : '—'}
                      </td>

                      {/* Tasks completed */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold text-[11px]">
                          <span>{staff.today_tasks_completed || 0}</span>
                        </span>
                      </td>

                      {/* Validated by */}
                      <td className="px-4 py-4 text-stone-500 text-[11px]">
                        {validatedBy}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {staff.is_online ? (
                            <button
                              onClick={() => checkOutStaff(staff.id)}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold transition"
                              title="Pointer le départ"
                            >
                              Départ
                            </button>
                          ) : (
                            <button
                              onClick={() => checkInStaff(staff.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition border border-emerald-200"
                              title="Pointer l'arrivée"
                            >
                              Arrivée
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenManual(staff.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
                            title="Ajuster les heures ou statut"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
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

      {/* Manual Attendance Adjustment Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Ajustement Manuel de Pointage</h3>
                <p className="text-xs text-stone-500">Mise à jour du registre de présence</p>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Employé</label>
                <select
                  value={targetStaffId}
                  onChange={e => setTargetStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-bold focus:outline-none focus:border-orange-500"
                >
                  {currentStaff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.position_title || s.staff_role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={e => setModalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Statut</label>
                  <select
                    value={modalStatus}
                    onChange={e => setModalStatus(e.target.value as AttendanceStatusType)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="PRESENT">Présent</option>
                    <option value="LATE">En retard</option>
                    <option value="ABSENT">Absent injustifié</option>
                    <option value="ON_LEAVE">En congé / Repos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Arrivée</label>
                  <input
                    type="time"
                    value={modalCheckIn}
                    onChange={e => setModalCheckIn(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Départ</label>
                  <input
                    type="time"
                    value={modalCheckOut}
                    onChange={e => setModalCheckOut(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Heures</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={modalHours}
                    onChange={e => setModalHours(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Note justificative</label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  placeholder="Ex: Retard exceptionnel pour panne de transport, approuvé par le gérant..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-md shadow-orange-600/20"
                >
                  Enregistrer le Pointage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
