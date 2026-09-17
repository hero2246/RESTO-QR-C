import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RestaurantTable } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Layers, 
  ExternalLink,
  QrCode
} from 'lucide-react';

interface TablesManagementPageProps {
  navigate: (path: string) => void;
}

export const TablesManagementPage: React.FC<TablesManagementPageProps> = ({ navigate }) => {
  const { activeRestaurant, tables, addTable, updateTable, deleteTable, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [tableName, setTableName] = useState('');

  if (!activeRestaurant) {
    return <div className="p-8 text-center text-stone-500">Sélectionnez un restaurant</div>;
  }

  const restoTables = tables.filter(t => t.restaurant_id === activeRestaurant.id);

  const openModal = (table?: RestaurantTable) => {
    if (table) {
      setEditingTable(table);
      setTableName(table.name);
    } else {
      setEditingTable(null);
      // Auto-suggest next table number
      const nextNum = restoTables.length + 1;
      setTableName(`Table ${nextNum}`);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    if (editingTable) {
      updateTable(editingTable.id, tableName.trim(), editingTable.is_active);
    } else {
      addTable(tableName.trim());
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Gestion des Tables & Emplacements
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Configurez les tables physiques de votre établissement pour identifier l’origine des commandes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une table</span>
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        {restoTables.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <Layers className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">Aucune table enregistrée</h3>
            <p className="text-xs text-stone-500">Ajoutez votre première table pour commencer à recevoir des commandes.</p>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
            >
              Créer Table 1
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {restoTables.map(table => (
              <div
                key={table.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-black text-orange-700 text-sm">
                    {table.name.replace(/[^0-9]/g, '') || '#'}
                  </div>
                  <button
                    onClick={() => updateTable(table.id, table.name, !table.is_active)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      table.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {table.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-stone-900">{table.name}</h4>
                  <div className="text-[11px] text-stone-400 mt-0.5">Salle / Terrasse</div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => navigate('/dashboard/qrcode')}
                    className="text-stone-500 hover:text-orange-600 flex items-center gap-1 font-medium"
                    title="Voir QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(table)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer la ${table.name} ?`)) {
                          deleteTable(table.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal Table */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-4">
              {editingTable ? 'Modifier la table' : 'Ajouter une table'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nom ou numéro de la table *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Table 5, Terrasse 2, VIP 1"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-black shadow-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
