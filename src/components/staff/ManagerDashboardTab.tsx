import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Clock, 
  CheckSquare, 
  AlertCircle, 
  ChefHat, 
  UtensilsCrossed, 
  Receipt, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Flame,
  UserCheck,
  Coffee
} from 'lucide-react';

interface ManagerDashboardTabProps {
  onSelectTab: (tab: 'staff' | 'positions' | 'attendance' | 'tasks' | 'activity') => void;
}

export const ManagerDashboardTab: React.FC<ManagerDashboardTabProps> = ({ onSelectTab }) => {
  const { 
    activeRestaurant, 
    restaurantStaff, 
    attendanceRecords, 
    operationalTasks, 
    orders, 
    checkOutStaff 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  if (!activeRestaurant) return null;

  const staffForRestaurant = restaurantStaff.filter(s => s.restaurant_id === activeRestaurant.id);
  const activeStaff = staffForRestaurant.filter(s => s.employment_status === 'ACTIVE' || s.is_active);
  const onlineStaff = staffForRestaurant.filter(s => s.is_online);

  const todayAttendance = attendanceRecords.filter(
    r => r.restaurant_id === activeRestaurant.id && r.date === todayStr
  );

  const todayTasks = operationalTasks.filter(
    t => t.restaurant_id === activeRestaurant.id && t.date === todayStr
  );

  const activeOrders = orders.filter(
    o => o.restaurant_id === activeRestaurant.id && (o.status === 'PENDING' || o.status === 'PREPARING')
  );

  const urgentTasks = todayTasks.filter(
    t => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'DONE'
  );
  const urgentCount = urgentTasks.length;

  const lateAttendance = todayAttendance.filter(r => r.status === 'LATE');
  const absentStaff = todayAttendance.filter(r => r.status === 'ABSENT');

  const attendanceRate = activeStaff.length > 0 
    ? Math.round((todayAttendance.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length / activeStaff.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Poste de Contrôle Opérationnel en Direct</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Vue Opérationnelle — {activeRestaurant.name}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Supervisez les effectifs en poste, les commandes cuisine, les présences et les tâches prioritaires du jour.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('attendance')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-orange-400" />
            <span>Pointages du Jour</span>
          </button>
          <button
            onClick={() => onSelectTab('tasks')}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/30"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tâches ({todayTasks.filter(t => t.status !== 'DONE').length})</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onSelectTab('staff')}
          className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs cursor-pointer hover:border-orange-200 transition space-y-2"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Collaborateurs en Salle / Cuisine</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{onlineStaff.length}</span>
            <span className="text-xs text-stone-400 font-semibold">/ {activeStaff.length} actifs</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium">Actuellement connectés et pointés</p>
        </div>

        <div 
          onClick={() => onSelectTab('attendance')}
          className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs cursor-pointer hover:border-orange-200 transition space-y-2"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Taux de Présence Jour</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{attendanceRate}%</span>
            <span className="text-xs text-stone-400 font-semibold">présence</span>
          </div>
          <p className="text-[10px] text-blue-600 font-medium">{todayAttendance.length} collaborateurs pointés</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Commandes en Préparation</span>
            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-600">{activeOrders.length}</span>
            <span className="text-xs text-stone-400 font-semibold">en flux</span>
          </div>
          <p className="text-[10px] text-orange-600 font-medium">En attente ou en cuisine KDS</p>
        </div>

        <div 
          onClick={() => onSelectTab('tasks')}
          className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs cursor-pointer hover:border-orange-200 transition space-y-2"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Missions Urgentes</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">{urgentCount}</span>
            <span className="text-xs text-stone-400 font-semibold">critiques</span>
          </div>
          <p className="text-[10px] text-red-600 font-medium">À achever avant clôture</p>
        </div>

      </div>

      {/* Main Row: Live Staff on Duty & Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Staff on Duty (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-stone-900 tracking-tight flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Personnel Actuellement en Service ({onlineStaff.length})</span>
              </h3>
              <p className="text-xs text-stone-400">Collaborateurs ayant pris leur service aujourd'hui</p>
            </div>
            <button
              onClick={() => onSelectTab('staff')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Voir toute l'équipe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {onlineStaff.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-1">
              <Coffee className="w-8 h-8 mx-auto text-stone-300" />
              <p className="font-semibold text-sm">Aucun collaborateur en service en direct</p>
              <p className="text-xs text-stone-400">Les collaborateurs pointés apparaîtront ici.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {onlineStaff.map(staff => (
                <div
                  key={staff.id}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 hover:bg-stone-100/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={staff.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                      />
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 leading-tight">{staff.name}</h4>
                      <span className="text-[11px] font-semibold text-stone-500 block mt-0.5">
                        {staff.position_title || staff.staff_role}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Arrivée : {staff.checked_in_at ? new Date(staff.checked_in_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '11:00'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => checkOutStaff(staff.id)}
                    className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-[11px] transition"
                  >
                    Départ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operational Alerts (1 col) */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="text-sm font-black text-stone-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Alertes & Vigilance Opérationnelle</span>
            </h3>
            <p className="text-xs text-stone-400">Points nécessitant votre attention</p>
          </div>

          <div className="space-y-3">
            {urgentTasks.length > 0 ? (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-900">
                  <Flame className="w-4 h-4 text-red-600" />
                  <span>{urgentTasks.length} Tâche(s) Urgente(s) non terminée(s)</span>
                </div>
                <p className="text-[11px] text-red-700">
                  Mission : "{urgentTasks[0].title}" assignée à {urgentTasks[0].assigned_to_name || 'Équipe'}.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Toutes les tâches urgentes sont à jour.</span>
              </div>
            )}

            {lateAttendance.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{lateAttendance.length} Retard(s) enregistré(s) ce jour</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Collaborateurs : {lateAttendance.map(l => l.staff_name).join(', ')}.
                </p>
              </div>
            )}

            {absentStaff.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>{absentStaff.length} Absence(s) non justifiée(s)</span>
                </div>
                <p className="text-[11px] text-rose-700">
                  Vérifier les plannings de remplacement.
                </p>
              </div>
            )}

            {urgentTasks.length === 0 && lateAttendance.length === 0 && absentStaff.length === 0 && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                ✨ Tous les indicateurs opérationnels sont au vert pour ce service.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
