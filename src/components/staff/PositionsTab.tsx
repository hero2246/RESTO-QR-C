import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomStaffPosition, StaffRoleType } from '../../types';
import { Briefcase, Plus, Edit2, Trash2, Shield, Users, Check, X, ChefHat, UtensilsCrossed, Receipt, ShieldAlert } from 'lucide-react';

export const PositionsTab: React.FC = () => {
  const {
    activeRestaurant,
    customPositions,
    restaurantStaff,
    addCustomPosition,
    updateCustomPosition,
    deleteCustomPosition,
    showToast
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingPos, setEditingPos] = useState<CustomStaffPosition | null>(null);

  // Form states
  const [posName, setPosName] = useState('');
  const [posRole, setPosRole] = useState<StaffRoleType>('WAITER');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([
    'orders.view',
    'orders.manage',
    'tables.view'
  ]);

  if (!activeRestaurant) return null;

  // Positions belonging to this restaurant or system
  const currentPositions = customPositions.filter(
    p => p.restaurant_id === activeRestaurant.id || p.is_system
  );

  const staffForRestaurant = restaurantStaff.filter(s => s.restaurant_id === activeRestaurant.id);

  const handleOpenAdd = () => {
    setEditingPos(null);
    setPosName('');
    setPosRole('WAITER');
    setDescription('');
    setPermissions(['orders.view', 'orders.manage', 'tables.view']);
    setShowModal(true);
  };

  const handleOpenEdit = (pos: CustomStaffPosition) => {
    setEditingPos(pos);
    setPosName(pos.name);
    setPosRole(pos.default_role);
    setDescription(pos.description || '');
    setPermissions(pos.default_permissions || []);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posName.trim()) return;

    if (editingPos) {
      updateCustomPosition(editingPos.id, {
        name: posName.trim(),
        default_role: posRole,
        description,
        default_permissions: permissions
      });
    } else {
      addCustomPosition({
        restaurant_id: activeRestaurant.id,
        name: posName.trim(),
        default_role: posRole,
        description,
        default_permissions: permissions,
        is_system: false
      });
    }

    setShowModal(false);
  };

  const getRoleIcon = (role: StaffRoleType) => {
    switch (role) {
      case 'KITCHEN':
        return <ChefHat className="w-4 h-4 text-amber-600" />;
      case 'WAITER':
        return <UtensilsCrossed className="w-4 h-4 text-blue-600" />;
      case 'CASHIER':
        return <Receipt className="w-4 h-4 text-emerald-600" />;
      default:
        return <Shield className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200">
        <div>
          <h2 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600" />
            <span>Postes & Fonctions Opérationnelles</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Créez des postes sur-mesure (ex: Pizzaïolo, Barman, Chef de rang, Plongeur) et définissez leurs droits par défaut.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Nouveau Poste</span>
        </button>
      </div>

      {/* Grid of Positions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPositions.map(pos => {
          const staffCount = staffForRestaurant.filter(
            s => s.position_title?.toLowerCase() === pos.name.toLowerCase() || s.staff_role === pos.default_role
          ).length;

          return (
            <div
              key={pos.id}
              className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:border-orange-200 hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                      {getRoleIcon(pos.default_role)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-stone-900 leading-tight">
                        {pos.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-stone-400 block mt-0.5">
                        Rôle système : {pos.default_role}
                      </span>
                    </div>
                  </div>

                  {pos.is_system ? (
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold border border-stone-200">
                      Standard
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(pos)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCustomPosition(pos.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {pos.description && (
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pos.description}
                  </p>
                )}

                {/* Default Permissions badges */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Permissions prédéfinies ({pos.default_permissions?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(pos.default_permissions || []).slice(0, 4).map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-[10px] text-stone-600 font-medium font-mono"
                      >
                        {p}
                      </span>
                    ))}
                    {(pos.default_permissions?.length || 0) > 4 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-[10px] text-stone-500 font-bold">
                        +{pos.default_permissions.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer with staff count */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>{staffCount} collaborateur(s)</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">
                  Poste actif
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Position */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {editingPos ? 'Modifier le Poste' : 'Créer un Poste Personnalisé'}
                </h3>
                <p className="text-xs text-stone-500">Pour le restaurant {activeRestaurant.name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Intitulé du poste <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={posName}
                  onChange={e => setPosName(e.target.value)}
                  placeholder="Ex: Barman Mixologue, Pizzaïolo..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Rôle système de base
                </label>
                <select
                  value={posRole}
                  onChange={e => setPosRole(e.target.value as StaffRoleType)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="WAITER">Serveur (Interface Salle)</option>
                  <option value="KITCHEN">Cuisinier (Interface KDS)</option>
                  <option value="CASHIER">Caissier (Interface Encaissements)</option>
                  <option value="MANAGER">Manager (Gestion Opérations)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description du rôle & missions
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Responsable de la préparation des cocktails, de la gestion des stocks du bar..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-md shadow-orange-600/20"
                >
                  {editingPos ? 'Mettre à jour' : 'Enregistrer le Poste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
