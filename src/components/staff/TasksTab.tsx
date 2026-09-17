import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OperationalTask, OperationalTaskStatus, TaskPriorityType, TaskCategoryType } from '../../types';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Filter, 
  Search, 
  X, 
  Trash2, 
  Check, 
  Camera, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const TasksTab: React.FC = () => {
  const {
    activeRestaurant,
    restaurantStaff,
    operationalTasks,
    addOperationalTask,
    updateOperationalTask,
    deleteOperationalTask,
    updateTaskStatus,
    currentUser
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [proofComment, setProofComment] = useState('');

  // Form states for new task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [taskDate, setTaskDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState('14:00');
  const [priority, setPriority] = useState<TaskPriorityType>('NORMAL');
  const [category, setCategory] = useState<TaskCategoryType>('ROOM');

  if (!activeRestaurant) return null;

  const currentStaff = restaurantStaff.filter(s => s.restaurant_id === activeRestaurant.id);

  // Filter tasks for current restaurant
  const tasksForRestaurant = useMemo(() => {
    return operationalTasks.filter(t => t.restaurant_id === activeRestaurant.id);
  }, [operationalTasks, activeRestaurant]);

  // Filtered list
  const filteredTasks = useMemo(() => {
    return tasksForRestaurant.filter(t => {
      if (selectedDate && t.date !== selectedDate) return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.assigned_to_name && t.assigned_to_name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tasksForRestaurant, selectedDate, statusFilter, categoryFilter, priorityFilter, searchQuery]);

  // Metrics
  const totalTasks = tasksForRestaurant.filter(t => t.date === selectedDate).length;
  const pendingCount = tasksForRestaurant.filter(t => t.date === selectedDate && (t.status === 'TODO' || (t.status as string) === 'PENDING')).length;
  const inProgressCount = tasksForRestaurant.filter(t => t.date === selectedDate && t.status === 'IN_PROGRESS').length;
  const doneCount = tasksForRestaurant.filter(t => t.date === selectedDate && t.status === 'DONE').length;
  const urgentCount = tasksForRestaurant.filter(t => t.date === selectedDate && (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'DONE').length;

  const handleOpenAdd = () => {
    setTaskTitle('');
    setTaskDesc('');
    setAssignedStaffId(currentStaff[0]?.id || '');
    setTaskDate(selectedDate || todayStr);
    setDueTime('14:00');
    setPriority('NORMAL');
    setCategory('ROOM');
    setShowAddModal(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const assignedStaff = currentStaff.find(s => s.id === assignedStaffId);

    addOperationalTask({
      restaurant_id: activeRestaurant.id,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      assigned_to_id: assignedStaff?.id,
      assigned_to_name: assignedStaff?.name,
      assigned_role: assignedStaff?.staff_role,
      position_title: assignedStaff?.position_title,
      date: taskDate,
      due_time: dueTime,
      priority,
      category,
      status: 'TODO'
    });

    setShowAddModal(false);
  };

  const handleConfirmComplete = () => {
    if (!completingTaskId) return;
    updateTaskStatus(completingTaskId, 'DONE', proofComment);
    setCompletingTaskId(null);
    setProofComment('');
  };

  const getPriorityBadge = (p: TaskPriorityType) => {
    switch (p) {
      case 'URGENT':
        return { label: 'Urgente', bg: 'bg-red-100 text-red-800 border-red-200', icon: Flame };
      case 'HIGH':
        return { label: 'Haute', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle };
      case 'LOW':
        return { label: 'Basse', bg: 'bg-stone-100 text-stone-600 border-stone-200', icon: Clock };
      default:
        return { label: 'Normale', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock };
    }
  };

  const getCategoryLabel = (c: TaskCategoryType) => {
    switch (c) {
      case 'KITCHEN': return 'Cuisine & Préparation';
      case 'ROOM': return 'Service en salle';
      case 'CLEANING': return 'Nettoyage & Hygiène';
      case 'CASHIER': return 'Caisse & Facturation';
      case 'STOCK': return 'Stock & Approvisionnement';
      case 'DELIVERY': return 'Livraison & Commandes';
      case 'ADMIN': return 'Management & Admin';
      default: return 'Autre mission';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Actions */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-orange-600" />
            <span>Gestion Opérationnelle des Tâches</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Assignez, cadrez et suivez en temps réel l'exécution des missions d'équipe pour {activeRestaurant.name}.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une Tâche</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">À Faire</span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-black text-stone-900">{pendingCount}</div>
          <p className="text-[10px] text-stone-400">Non débutées</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold">En Cours</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700">{inProgressCount}</div>
          <p className="text-[10px] text-blue-600/80">En cours d'exécution</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold">Terminées</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{doneCount}</div>
          <p className="text-[10px] text-emerald-600/80">Validées aujourd'hui</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-red-600">
            <span className="text-xs font-bold">Urgentes / Critiques</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-700">{urgentCount}</div>
          <p className="text-[10px] text-red-600/80">Nécessitent action immédiate</p>
        </div>
      </div>

      {/* Date & Filter controls */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
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

        {/* Status filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {st === 'ALL' ? 'Toutes' :
               st === 'PENDING' ? 'À faire' :
               st === 'IN_PROGRESS' ? 'En cours' :
               st === 'DONE' ? 'Terminées' : 'Annulées'}
            </button>
          ))}
        </div>

      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="font-semibold text-sm">Aucune tâche trouvée pour ces critères</p>
            <p className="text-xs text-stone-400 mt-1">Créez une nouvelle tâche pour organiser le service.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const priorityBadge = getPriorityBadge(task.priority);
            const PriorityIcon = priorityBadge.icon;
            const isDone = task.status === 'DONE';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-3xl p-5 border transition flex flex-col justify-between space-y-4 shadow-xs ${
                  isDone ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : 'border-stone-200 hover:border-orange-200 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Category & Priority header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      {getCategoryLabel(task.category)}
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityBadge.bg}`}>
                      <PriorityIcon className="w-3 h-3" />
                      <span>{priorityBadge.label}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className={`text-sm font-black text-stone-900 leading-snug ${isDone ? 'line-through text-stone-500' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Proof Comment if done */}
                  {isDone && task.proof_comment && (
                    <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                      <span className="text-[10px] font-bold block text-emerald-700">Preuve / Commentaire :</span>
                      <p className="italic">"{task.proof_comment}"</p>
                    </div>
                  )}

                  {/* Assigned to & Due time */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>{task.assigned_to_name || 'Non assigné'}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-stone-600">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{task.due_time || 'Service'}</span>
                    </div>
                  </div>

                </div>

                {/* Status action buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                        className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200"
                      >
                        Démarrer
                      </button>
                    )}

                    {task.status !== 'DONE' && (
                      <button
                        onClick={() => {
                          setCompletingTaskId(task.id);
                          setProofComment('');
                        }}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Terminer</span>
                      </button>
                    )}

                    {task.status === 'DONE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Terminée ({task.completed_at ? new Date(task.completed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'OK'})</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => deleteOperationalTask(task.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Supprimer la tâche"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Nouvelle Tâche Opérationnelle</h3>
                <p className="text-xs text-stone-500">Pour le restaurant {activeRestaurant.name}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Intitulé de la tâche <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Ex: Vérifier température des frigos et étiquetage DLC"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description détaillée / Consignes
                </label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="Consigner les relevés de températures dans le classeur HACCP..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Assignée à
                  </label>
                  <select
                    value={assignedStaffId}
                    onChange={e => setAssignedStaffId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 font-bold"
                  >
                    {currentStaff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.position_title || s.staff_role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as TaskCategoryType)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="ROOM">Service en salle</option>
                    <option value="KITCHEN">Cuisine & Préparation</option>
                    <option value="CLEANING">Nettoyage & Plonge</option>
                    <option value="CASHIER">Caisse & Clôture</option>
                    <option value="MANAGEMENT">Management & Briefing</option>
                    <option value="STOCK">Stock & Inventaire</option>
                    <option value="DELIVERY">Livraison & Réception</option>
                    <option value="ADMIN">Administration</option>
                    <option value="OTHER">Autre mission</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={e => setTaskDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Heure limite</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={e => setDueTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Priorité</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriorityType)}
                    className="w-full px-2 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 font-bold"
                  >
                    <option value="LOW">Basse</option>
                    <option value="NORMAL">Normale</option>
                    <option value="HIGH">Haute</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-md shadow-orange-600/20"
                >
                  Créer la Tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Confirmation Modal */}
      {completingTaskId && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-100">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Valider l'accomplissement</h3>
              <p className="text-xs text-stone-500">
                Ajoutez un commentaire ou preuve optionnelle pour clore cette mission.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Commentaire de validation
              </label>
              <textarea
                rows={2}
                value={proofComment}
                onChange={e => setProofComment(e.target.value)}
                placeholder="Ex: Frigo vérifié à 3.8°C, fiche signée..."
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setCompletingTaskId(null)}
                className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
