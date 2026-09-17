import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RestaurantStaffMember } from '../types';
import { StaffListTab } from '../components/staff/StaffListTab';
import { StaffFormModal } from '../components/staff/StaffFormModal';
import { PositionsTab } from '../components/staff/PositionsTab';
import { AttendanceTab } from '../components/staff/AttendanceTab';
import { TasksTab } from '../components/staff/TasksTab';
import { ActivityLogTab } from '../components/staff/ActivityLogTab';
import { ManagerDashboardTab } from '../components/staff/ManagerDashboardTab';
import { 
  Users, 
  Clock, 
  CheckSquare, 
  Briefcase, 
  Activity, 
  LayoutDashboard,
  Store,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

type OperationalTab = 'dashboard' | 'staff' | 'attendance' | 'tasks' | 'positions' | 'activity';

export const RestaurantStaffPage: React.FC = () => {
  const { activeRestaurant, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<OperationalTab>('staff');
  
  // Modal states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<RestaurantStaffMember | null>(null);

  if (!activeRestaurant) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500">
        <Store className="w-8 h-8 mx-auto mb-2 text-stone-400" />
        <p className="font-bold">Aucun restaurant sélectionné.</p>
        <p className="text-xs">Veuillez sélectionner un établissement pour accéder à sa gestion opérationnelle.</p>
      </div>
    );
  }

  const isOwner = currentUser?.role === 'OWNER' || currentUser?.role === 'RESTAURANT_OWNER';
  const isManager = currentUser?.role === 'RESTAURANT_MANAGER' || isOwner;

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setShowStaffModal(true);
  };

  const handleEditStaff = (staff: RestaurantStaffMember) => {
    setEditingStaff(staff);
    setShowStaffModal(true);
  };

  const tabs = [
    { id: 'staff', label: 'Collaborateurs', icon: Users },
    { id: 'dashboard', label: 'Vue Gérant', icon: LayoutDashboard },
    { id: 'attendance', label: 'Présence & Pointage', icon: Clock },
    { id: 'tasks', label: 'Tâches Opérationnelles', icon: CheckSquare },
    { id: 'positions', label: 'Postes & Fonctions', icon: Briefcase },
    { id: 'activity', label: 'Journal d’Activité', icon: Activity },
  ] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black uppercase tracking-wider">
              Gestion Opérationnelle Restaurant
            </span>
            {isOwner ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>Espace Propriétaire</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Espace Gérant</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Équipe, Présence & Activité — {activeRestaurant.name}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Pilotez les effectifs, les postes, le pointage quotidien, les tâches d'équipe et l'audit d'activité.
          </p>
        </div>

        {/* Tab switcher buttons on larger screens */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 overflow-x-auto max-w-full">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as OperationalTab)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render active tab */}
      {activeTab === 'staff' && (
        <StaffListTab
          onOpenAddModal={handleOpenAdd}
          onEditStaff={handleEditStaff}
        />
      )}

      {activeTab === 'dashboard' && (
        <ManagerDashboardTab
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'attendance' && (
        <AttendanceTab />
      )}

      {activeTab === 'tasks' && (
        <TasksTab />
      )}

      {activeTab === 'positions' && (
        <PositionsTab />
      )}

      {activeTab === 'activity' && (
        <ActivityLogTab />
      )}

      {/* Shared Staff Modal for Add / Edit */}
      <StaffFormModal
        isOpen={showStaffModal}
        onClose={() => {
          setShowStaffModal(false);
          setEditingStaff(null);
        }}
        staffToEdit={editingStaff}
      />

    </div>
  );
};
