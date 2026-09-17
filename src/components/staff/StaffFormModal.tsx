import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantStaffMember, StaffRoleType, StaffEmploymentStatus, UserRole } from '../../types';
import { X, Shield, Lock, DollarSign, Calendar, Mail, Phone, User, Briefcase, FileText, CheckSquare, Sparkles } from 'lucide-react';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: RestaurantStaffMember | null;
}

const PERMISSION_GROUPS = [
  {
    category: 'Commandes & Service',
    permissions: [
      { id: 'orders.view', label: 'Consulter les commandes en direct' },
      { id: 'orders.manage', label: 'Modifier les commandes & statuts' },
      { id: 'orders.cancel', label: 'Annuler une commande' },
      { id: 'orders.complete', label: 'Valider le service d’une commande' },
    ]
  },
  {
    category: 'Cuisine (KDS)',
    permissions: [
      { id: 'kitchen.view', label: 'Accéder à l’écran cuisine KDS' },
      { id: 'kitchen.prepare', label: 'Prendre en charge les plats' },
      { id: 'kitchen.ready', label: 'Marquer un plat comme prêt' },
    ]
  },
  {
    category: 'Caisse & Encaissements',
    permissions: [
      { id: 'cashier.pay', label: 'Encaisser les paiements (espèces / CB / Mobile)' },
      { id: 'cashier.receipt', label: 'Imprimer les factures et reçus' },
      { id: 'cashier.close', label: 'Effectuer la clôture de caisse Z' },
    ]
  },
  {
    category: 'Tables & Salle',
    permissions: [
      { id: 'tables.view', label: 'Voir le plan de salle et l’état des tables' },
      { id: 'tables.manage', label: 'Déplacer ou assigner des tables' },
      { id: 'tables.lock', label: 'Bloquer ou réserver une table' },
    ]
  },
  {
    category: 'Menu, Catégories & Produits',
    permissions: [
      { id: 'manage_categories', label: 'Gestion complète des catégories (Créer, modifier, supprimer, réordonner)' },
      { id: 'view_categories', label: 'Consulter les catégories du menu' },
      { id: 'create_categories', label: 'Créer de nouvelles catégories' },
      { id: 'update_categories', label: 'Modifier les catégories et leur ordre' },
      { id: 'delete_categories', label: 'Supprimer des catégories' },
      { id: 'menu.view', label: 'Consulter le catalogue de plats' },
      { id: 'menu.edit', label: 'Ajouter ou éditer des plats et boissons' },
      { id: 'menu.prices', label: 'Modifier les tarifs de vente' },
      { id: 'menu.hide', label: 'Marquer un produit en rupture de stock' },
    ]
  },
  {
    category: 'Personnel & Opérations',
    permissions: [
      { id: 'staff.view', label: 'Voir la liste des employés' },
      { id: 'staff.add', label: 'Ajouter un nouvel employé' },
      { id: 'staff.edit', label: 'Modifier les fiches et postes des employés' },
      { id: 'staff.attendance', label: 'Gérer les pointages et présences' },
      { id: 'staff.tasks', label: 'Créer et attribuer des tâches opérationnelles' },
    ]
  },
  {
    category: 'Statistiques & Rapports',
    permissions: [
      { id: 'stats.revenue', label: 'Voir le chiffre d’affaires et les ventes' },
      { id: 'stats.reports', label: 'Exporter les rapports d’activité' },
    ]
  },
  {
    category: 'Paramètres Restaurant',
    permissions: [
      { id: 'settings.hours', label: 'Modifier les horaires d’ouverture' },
      { id: 'settings.restaurant', label: 'Modifier les informations du restaurant' },
    ]
  }
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
];

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  staffToEdit
}) => {
  const {
    activeRestaurant,
    currentUser,
    customPositions,
    addRestaurantStaff,
    updateRestaurantStaff
  } = useApp();

  const isOwner = currentUser?.role === 'OWNER' || currentUser?.role === 'RESTAURANT_OWNER';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [staffRole, setStaffRole] = useState<StaffRoleType>('WAITER');
  const [positionTitle, setPositionTitle] = useState('Serveur de Salle');
  const [employmentStatus, setEmploymentStatus] = useState<StaffEmploymentStatus>('ACTIVE');
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftHours, setShiftHours] = useState('Service Continu (11h - 23h)');
  const [salary, setSalary] = useState<number>(150000);
  const [notes, setNotes] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [tempPassword, setTempPassword] = useState('Resto2026!');
  const [sendInvitation, setSendInvitation] = useState(true);

  // Available positions for this restaurant
  const positionsForRestaurant = customPositions.filter(
    p => p.restaurant_id === activeRestaurant?.id || p.is_system
  );

  useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name);
      setEmail(staffToEdit.email);
      setPhone(staffToEdit.phone || '');
      setAvatar(staffToEdit.avatar || PRESET_AVATARS[0]);
      setStaffRole(staffToEdit.staff_role);
      setPositionTitle(staffToEdit.position_title || 'Collaborateur');
      setEmploymentStatus(staffToEdit.employment_status || (staffToEdit.is_active ? 'ACTIVE' : 'INACTIVE'));
      setHireDate(staffToEdit.hire_date || staffToEdit.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]);
      setShiftHours(staffToEdit.shift_hours || 'Service Continu');
      setSalary(staffToEdit.salary || 150000);
      setNotes(staffToEdit.notes || '');
      setSelectedPermissions(staffToEdit.permissions || []);
      setSendInvitation(false);
    } else {
      // Defaults for new employee
      setName('');
      setEmail('');
      setPhone('');
      setAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
      setStaffRole('WAITER');
      setPositionTitle('Serveur de Salle');
      setEmploymentStatus('ACTIVE');
      setHireDate(new Date().toISOString().split('T')[0]);
      setShiftHours('Service Continu (11h - 23h)');
      setSalary(150000);
      setNotes('');
      setSelectedPermissions(['orders.view', 'orders.manage', 'tables.view']);
      setTempPassword('Resto2026!');
      setSendInvitation(true);
    }
  }, [staffToEdit, isOpen]);

  if (!isOpen || !activeRestaurant) return null;

  const handlePositionChange = (title: string) => {
    setPositionTitle(title);
    const pos = positionsForRestaurant.find(p => p.name === title);
    if (pos) {
      setStaffRole(pos.default_role);
      setSelectedPermissions(pos.default_permissions);
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAllCategory = (permissions: { id: string }[]) => {
    const allIds = permissions.map(p => p.id);
    const allSelected = allIds.every(id => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const role: UserRole = staffRole === 'MANAGER' ? 'RESTAURANT_MANAGER' : 'RESTAURANT_STAFF';

    if (staffToEdit) {
      updateRestaurantStaff(staffToEdit.id, {
        name,
        email,
        phone,
        avatar,
        staff_role: staffRole,
        position_title: positionTitle,
        employment_status: employmentStatus,
        is_active: employmentStatus === 'ACTIVE',
        hire_date: hireDate,
        shift_hours: shiftHours,
        salary: isOwner ? salary : staffToEdit.salary,
        notes,
        permissions: selectedPermissions,
      });
    } else {
      addRestaurantStaff({
        restaurant_id: activeRestaurant.id,
        name,
        email,
        phone,
        avatar,
        role,
        staff_role: staffRole,
        position_title: positionTitle,
        employment_status: employmentStatus,
        is_active: employmentStatus === 'ACTIVE',
        hire_date: hireDate,
        shift_hours: shiftHours,
        salary: isOwner ? salary : 150000,
        notes,
        permissions: selectedPermissions,
        invitation_sent: sendInvitation,
        invitation_code: sendInvitation ? `INV-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        today_tasks_completed: 0,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-100 my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              <span>{staffToEdit ? 'Modifier la Fiche Collaborateur' : 'Ajouter un Collaborateur'}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Établissement : <span className="font-semibold text-stone-700">{activeRestaurant.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="staff-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Photo / Avatar de l'employé
            </label>
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt="Selected avatar"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-sm shrink-0"
              />
              <div className="flex flex-wrap gap-2">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition ${
                      avatar === url ? 'border-orange-500 scale-105 shadow-sm' : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Prénom & Nom <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Fatou Ndiaye"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email professionnel de connexion <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="fatou@restoqr.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Téléphone mobile / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Date d'embauche
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={hireDate}
                  onChange={e => setHireDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Position & Role */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
            <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-orange-600" />
              <span>Affectation, Poste & Rôle Système</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Poste / Fonction opérationnelle
                </label>
                <select
                  value={positionTitle}
                  onChange={e => handlePositionChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 font-semibold"
                >
                  <option value="Serveur de Salle">Serveur de Salle</option>
                  <option value="Chef Cuisinier">Chef Cuisinier</option>
                  <option value="Cuisinier / Commis">Cuisinier / Commis</option>
                  <option value="Caissier Principal">Caissier Principal</option>
                  <option value="Manager / Responsable">Manager / Responsable</option>
                  <option value="Barman / Mixologue">Barman / Mixologue</option>
                  <option value="Plongeur / Hygiène">Plongeur / Hygiène</option>
                  {positionsForRestaurant.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.default_role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Rôle Système (Interface attribuée)
                </label>
                <select
                  value={staffRole}
                  onChange={e => setStaffRole(e.target.value as StaffRoleType)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="WAITER">Serveur (Interface Prise de commande & Salle)</option>
                  <option value="KITCHEN">Cuisinier (Écran KDS & Préparation)</option>
                  <option value="CASHIER">Caissier (Encaissements & Tickets)</option>
                  <option value="MANAGER">Gérant / Manager (Opérations & Équipe)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Statut contractuel
                </label>
                <select
                  value={employmentStatus}
                  onChange={e => setEmploymentStatus(e.target.value as StaffEmploymentStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="ACTIVE">Actif (En service)</option>
                  <option value="ON_LEAVE">En congé (Absence autorisée)</option>
                  <option value="SUSPENDED">Suspendu (Accès coupé temporairement)</option>
                  <option value="INACTIVE">Inactif (Archivé)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Planning / Service habituel
                </label>
                <input
                  type="text"
                  value={shiftHours}
                  onChange={e => setShiftHours(e.target.value)}
                  placeholder="Ex: Service Soir (17h - 00h)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Confidential Salary section (Visible only for Owner) */}
          {isOwner && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-700" />
                  <span>Rémunération Mensuelle (Confidentiel Propriétaire)</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Réservé au Propriétaire
                </span>
              </div>
              <div className="max-w-xs">
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={salary}
                  onChange={e => setSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500"
                  placeholder="Salaire en FCFA"
                />
                <p className="text-[10px] text-amber-700 mt-1">
                  Ce montant n’est visible ni par le gérant ni par les collaborateurs.
                </p>
              </div>
            </div>
          )}

          {/* Invitation and Access credentials */}
          {!staffToEdit && (
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-700" />
                <span>Accès Initial & Invitation</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mot de passe temporaire
                  </label>
                  <input
                    type="text"
                    value={tempPassword}
                    onChange={e => setTempPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-blue-900">
                    <input
                      type="checkbox"
                      checked={sendInvitation}
                      onChange={e => setSendInvitation(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Générer un code d'invitation d'accès</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Granular Permissions Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span>Permissions Détaillées & Accréditations</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Définissez précisément les actions autorisées pour ce profil.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allIds = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.id));
                  if (selectedPermissions.length === allIds.length) {
                    setSelectedPermissions([]);
                  } else {
                    setSelectedPermissions(allIds);
                  }
                }}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
              >
                {selectedPermissions.length === PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.id)).length
                  ? 'Tout désélectionner'
                  : 'Tout cocher'}
              </button>
            </div>

            <div className="space-y-4">
              {PERMISSION_GROUPS.map((group, idx) => {
                const groupIds = group.permissions.map(p => p.id);
                const allGroupSelected = groupIds.every(id => selectedPermissions.includes(id));

                return (
                  <div key={idx} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="text-xs font-black text-stone-800 tracking-tight">
                        {group.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllCategory(group.permissions)}
                        className="text-[10px] font-semibold text-stone-500 hover:text-stone-800"
                      >
                        {allGroupSelected ? 'Décocher catégorie' : 'Cocher catégorie'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.permissions.map(perm => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'bg-orange-50/70 border-orange-200 text-orange-950 font-medium'
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100/60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5 shrink-0"
                            />
                            <span className="leading-tight">{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>Notes internes & Commentaires de gestion</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Ponctuelle, formée aux règles HACCP et au vin rouge de Bordeaux..."
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-100 flex items-center justify-end gap-3 shrink-0 bg-stone-50/50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-100 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="staff-form"
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black transition shadow-lg shadow-orange-600/20 flex items-center gap-1.5"
          >
            <span>{staffToEdit ? 'Enregistrer les Modifications' : 'Créer le Collaborateur'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
