import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { SaasEmployee, SaasPermission, PlatformManagerRole } from '../../types';
import { 
  Users, 
  Plus, 
  ShieldCheck, 
  Lock, 
  CheckSquare, 
  Square, 
  Trash2, 
  Power, 
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  KeyRound,
  Crown,
  Briefcase,
  Headphones,
  DollarSign,
  Search,
  Filter,
  Check,
  Edit2,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface OwnerEmployeesPageProps {
  navigate: (path: string) => void;
}

interface RoleConfig {
  id: PlatformManagerRole;
  label: string;
  badge: string;
  color: string;
  bgLight: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultPermissions: SaasPermission[];
}

const PLATFORM_ROLES: RoleConfig[] = [
  {
    id: 'SUPER_ADMIN',
    label: 'Co-Super Administrateur',
    badge: 'SUPER ADMIN',
    color: '#ea580c',
    bgLight: 'rgba(234, 88, 12, 0.15)',
    icon: Crown,
    description: 'Accès étendu sur toute la plateforme : gestion des restaurants, forfaits, finances et personnalisation.',
    defaultPermissions: [
      'saas.restaurants.view',
      'saas.restaurants.manage',
      'saas.plans.manage',
      'saas.monetization.manage',
      'saas.subscriptions.manage',
      'saas.analytics.view',
      'saas.users.view',
      'saas.employees.manage',
      'saas.branding.edit',
      'saas.settings.edit',
      'saas.audit.view'
    ]
  },
  {
    id: 'PLATFORM_MANAGER',
    label: 'Gestionnaire Principal',
    badge: 'GESTIONNAIRE',
    color: '#8b5cf6',
    bgLight: 'rgba(139, 92, 246, 0.15)',
    icon: Briefcase,
    description: 'Gère les opérations quotidiennes : validation des restaurants, suivi des plans et support de niveau 2.',
    defaultPermissions: [
      'saas.restaurants.view',
      'saas.restaurants.manage',
      'saas.subscriptions.manage',
      'saas.analytics.view',
      'saas.users.view',
      'saas.audit.view'
    ]
  },
  {
    id: 'SUPPORT_MANAGER',
    label: 'Responsable Support Client',
    badge: 'SUPPORT CLIENT',
    color: '#06b6d4',
    bgLight: 'rgba(6, 182, 212, 0.15)',
    icon: Headphones,
    description: 'Assistance technique aux restaurants, résolution des incidents et consultation des profils.',
    defaultPermissions: [
      'saas.restaurants.view',
      'saas.users.view',
      'saas.analytics.view'
    ]
  },
  {
    id: 'FINANCE_MANAGER',
    label: 'Responsable Facturation & Revenus',
    badge: 'FINANCE & BILLING',
    color: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.15)',
    icon: DollarSign,
    description: 'Validation des encaissements Wave / Orange Money, suivi du MRR et gestion des abonnements.',
    defaultPermissions: [
      'saas.restaurants.view',
      'saas.plans.manage',
      'saas.monetization.manage',
      'saas.subscriptions.manage',
      'saas.analytics.view'
    ]
  },
  {
    id: 'CONTENT_MODERATOR',
    label: 'Modérateur Plateforme & Contenus',
    badge: 'MODÉRATEUR',
    color: '#f59e0b',
    bgLight: 'rgba(245, 158, 11, 0.15)',
    icon: ShieldCheck,
    description: 'Vérification de la conformité des cartes de restaurants, photos de menus et coordonnées.',
    defaultPermissions: [
      'saas.restaurants.view',
      'saas.restaurants.manage'
    ]
  }
];

const ALL_SAAS_PERMISSIONS: { id: SaasPermission; label: string; description: string; category: string }[] = [
  { 
    id: 'saas.restaurants.view', 
    label: 'Consulter les restaurants', 
    description: 'Accéder aux établissements hébergés et à leurs fiches',
    category: 'Restaurants'
  },
  { 
    id: 'saas.restaurants.manage', 
    label: 'Gérer & Suspendre les restaurants', 
    description: 'Activer, suspendre ou modifier les statuts des comptes restaurants',
    category: 'Restaurants'
  },
  { 
    id: 'saas.restaurants.delete', 
    label: 'Supprimer des restaurants', 
    description: 'Suppression définitive d’un établissement (droit critique)',
    category: 'Restaurants'
  },
  { 
    id: 'saas.plans.manage', 
    label: 'Gérer les plans & quotas', 
    description: 'Créer et configurer les forfaits FREE, PRO et leurs limites',
    category: 'Monétisation'
  },
  { 
    id: 'saas.monetization.manage', 
    label: 'Paramètres de monétisation & passerelles', 
    description: 'Activer les modes de paiement Wave, Orange Money et Stripe',
    category: 'Monétisation'
  },
  { 
    id: 'saas.subscriptions.manage', 
    label: 'Gérer les abonnements & dérogations', 
    description: 'Accorder des accès VIP, renouveler et appliquer des remises',
    category: 'Monétisation'
  },
  { 
    id: 'saas.analytics.view', 
    label: 'Consulter l’analytique globale & MRR', 
    description: 'Visualiser les chiffres d’affaires et volumes de commandes',
    category: 'Analytique'
  },
  { 
    id: 'saas.users.view', 
    label: 'Consulter les comptes utilisateurs', 
    description: 'Visualiser les comptes gérants de restaurant et serveurs',
    category: 'Sécurité'
  },
  { 
    id: 'saas.employees.manage', 
    label: 'Gérer les autres gestionnaires', 
    description: 'Créer et administrer des comptes gestionnaires subordonnés',
    category: 'Administration'
  },
  { 
    id: 'saas.branding.edit', 
    label: 'Personnaliser le branding SaaS', 
    description: 'Modifier la charte graphique, les logos et les textes vitrine',
    category: 'Administration'
  },
  { 
    id: 'saas.settings.edit', 
    label: 'Modifier les réglages globaux', 
    description: 'Activer la maintenance ou ajuster les politiques de sécurité',
    category: 'Administration'
  },
  { 
    id: 'saas.audit.view', 
    label: 'Consulter le journal d’audit', 
    description: 'Accéder aux journaux de traçabilité des opérations',
    category: 'Sécurité'
  },
];

export const OwnerEmployeesPage: React.FC<OwnerEmployeesPageProps> = ({ navigate }) => {
  const { 
    saasEmployees, 
    addSaasEmployee, 
    updateSaasEmployee, 
    deleteSaasEmployee, 
    toggleSaasEmployeeStatus,
    showToast 
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<SaasEmployee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formRole, setFormRole] = useState<PlatformManagerRole>('PLATFORM_MANAGER');
  const [formPin, setFormPin] = useState('');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDepartment('Opérations Plateforme');
    setFormRole('PLATFORM_MANAGER');
    setFormPin(Math.floor(100000 + Math.random() * 900000).toString());
    const defaultRole = PLATFORM_ROLES.find(r => r.id === 'PLATFORM_MANAGER');
    setFormPermissions(defaultRole ? defaultRole.defaultPermissions : []);
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: SaasEmployee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormEmail(emp.email);
    setFormPhone(emp.phone || '');
    setFormDepartment(emp.department || 'Opérations');
    setFormRole(emp.manager_role || 'PLATFORM_MANAGER');
    setFormPin(emp.access_pin || '******');
    setFormPermissions([...emp.permissions]);
  };

  const handleRoleSelect = (roleId: PlatformManagerRole) => {
    setFormRole(roleId);
    const roleConfig = PLATFORM_ROLES.find(r => r.id === roleId);
    if (roleConfig) {
      setFormPermissions(roleConfig.defaultPermissions);
    }
  };

  const handleTogglePermission = (permId: string) => {
    setFormPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAllPermissions = () => {
    setFormPermissions(ALL_SAAS_PERMISSIONS.map(p => p.id));
  };

  const handleClearPermissions = () => {
    setFormPermissions([]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Veuillez renseigner le nom et l’email', 'error');
      return;
    }

    if (editingEmployee) {
      updateSaasEmployee(editingEmployee.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        department: formDepartment.trim(),
        manager_role: formRole,
        access_pin: formPin,
        permissions: formPermissions,
      });
      setEditingEmployee(null);
      showToast(`Gestionnaire ${formName} mis à jour`, 'success');
    } else {
      addSaasEmployee({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        department: formDepartment.trim(),
        role: formRole,
        manager_role: formRole,
        access_pin: formPin,
        permissions: formPermissions,
        is_active: true,
      });
      setShowAddModal(false);
    }
  };

  // Filter employees
  const filteredEmployees = saasEmployees.filter(emp => {
    const matchQuery = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.phone && emp.phone.includes(searchTerm)) ||
      (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole = 
      selectedRoleFilter === 'ALL' || 
      emp.manager_role === selectedRoleFilter ||
      (selectedRoleFilter === 'ACTIVE' && emp.is_active) ||
      (selectedRoleFilter === 'INACTIVE' && !emp.is_active);

    return matchQuery && matchRole;
  });

  return (
    <OwnerLayout
      currentPath="/owner/employees"
      navigate={navigate}
      title="Gestionnaires de la Plateforme Principale"
      subtitle="Déléguez et supervisez l'équipe centrale du SaaS : Co-Super Admins, Gestionnaires généraux, Support et Finances"
      actions={
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Gestionnaire Plateforme</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Anti-Escalation Rule Alert */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 shrink-0 text-amber-400" />
            <span>
              <strong>Règle Anti-Escalade Inviolable :</strong> Les gestionnaires de plateforme ajoutés ci-dessous agissent avec des permissions déléguées. Le système bloque strictement toute tentative d'auto-promotion au rang de OWNER fondateur ou de suppression des garde-fous de sécurité.
            </span>
          </div>
        </div>

        {/* Roles overview pill banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PLATFORM_ROLES.map(role => {
            const count = saasEmployees.filter(e => e.manager_role === role.id).length;
            const Icon = role.icon;
            return (
              <div 
                key={role.id}
                onClick={() => setSelectedRoleFilter(role.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  selectedRoleFilter === role.id 
                    ? 'bg-stone-850 border-orange-500 shadow-md' 
                    : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: role.bgLight, color: role.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white font-mono bg-stone-950 px-2 py-0.5 rounded-lg border border-stone-800">
                    {count}
                  </span>
                </div>
                <div className="mt-2 text-xs font-bold text-white truncate">{role.label}</div>
                <div className="text-[10px] text-stone-400 truncate">{role.badge}</div>
              </div>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, email, téléphone ou rôle..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-950 border border-stone-800 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedRoleFilter === 'ALL'
                  ? 'bg-stone-800 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Tous ({saasEmployees.length})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedRoleFilter === 'ACTIVE'
                  ? 'bg-stone-800 text-emerald-400 shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setSelectedRoleFilter('INACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedRoleFilter === 'INACTIVE'
                  ? 'bg-stone-800 text-red-400 shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Suspendus
            </button>
          </div>
        </div>

        {/* Managers Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-3xl space-y-3">
            <Users className="w-12 h-12 text-stone-600 mx-auto" />
            <div className="text-stone-300 font-bold text-sm">Aucun gestionnaire ne correspond aux filtres</div>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Utilisez le bouton ci-dessus pour ajouter des gestionnaires de la plateforme principale (Co-Admins, Support, Finances).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredEmployees.map(emp => {
              const roleConfig = PLATFORM_ROLES.find(r => r.id === (emp.manager_role || emp.role)) || PLATFORM_ROLES[1];
              const Icon = roleConfig.icon;

              return (
                <div 
                  key={emp.id}
                  className={`p-6 rounded-3xl border transition space-y-5 shadow-lg ${
                    emp.is_active 
                      ? 'bg-stone-900 border-stone-800 hover:border-stone-700' 
                      : 'bg-stone-900/50 border-stone-800/60 opacity-60'
                  }`}
                >
                  
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow"
                        style={{ backgroundColor: roleConfig.bgLight, color: roleConfig.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{emp.name}</span>
                          <span 
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: roleConfig.bgLight, color: roleConfig.color }}
                          >
                            {roleConfig.badge}
                          </span>
                        </h3>
                        <div className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-stone-500" />
                          <span>{emp.email}</span>
                        </div>
                        {emp.phone && (
                          <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-stone-500" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions on card */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
                        title="Modifier les informations et permissions"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleSaasEmployeeStatus(emp.id)}
                        className={`p-2 rounded-xl border transition cursor-pointer ${
                          emp.is_active 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                            : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                        }`}
                        title={emp.is_active ? 'Désactiver le compte' : 'Activer le compte'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Confirmer la suppression du gestionnaire ${emp.name} ?`)) {
                            deleteSaasEmployee(emp.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-red-900/40 text-stone-400 hover:text-red-400 transition cursor-pointer"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Department & Pin */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-950/60 p-3 rounded-2xl border border-stone-850">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Département / Affectation</span>
                      <span className="text-stone-200 font-semibold">{emp.department || 'Opérations Plateforme'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Code PIN de secours</span>
                      <span className="text-stone-200 font-mono">{emp.access_pin || 'Non configuré'}</span>
                    </div>
                  </div>

                  {/* Permissions tags */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Permissions Attribuées ({emp.permissions.length})</span>
                      <span className="text-[10px] text-stone-400">
                        Créé le {new Date(emp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {emp.permissions.map(permId => {
                        const permInfo = ALL_SAAS_PERMISSIONS.find(p => p.id === permId);
                        return (
                          <span 
                            key={permId}
                            className="px-2 py-0.5 rounded-lg bg-stone-950 border border-stone-800 text-[10px] text-stone-300 font-mono"
                          >
                            {permInfo ? permInfo.label : permId}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: Add / Edit Platform Manager */}
        {(showAddModal || editingEmployee) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto my-8">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingEmployee ? 'Modifier le Gestionnaire de Plateforme' : 'Ajouter un Gestionnaire de la Plateforme Principale'}
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Définissez les accès, le rôle hiérarchique et les autorisations spécifiques
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-5">
                
                {/* Manager Role Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-300">
                    1. Rôle du Gestionnaire sur la Plateforme
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PLATFORM_ROLES.map(role => {
                      const isSelected = formRole === role.id;
                      const Icon = role.icon;
                      return (
                        <div
                          key={role.id}
                          onClick={() => handleRoleSelect(role.id)}
                          className={`p-3 rounded-2xl border transition cursor-pointer ${
                            isSelected 
                              ? 'bg-stone-950 border-orange-500 shadow-md' 
                              : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: role.bgLight, color: role.color }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white flex items-center justify-between">
                                <span>{role.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                              </div>
                              <p className="text-[10px] text-stone-400 line-clamp-1">{role.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Identity info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Ex: Ibrahima Sow"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Email de connexion *
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="ibrahima.admin@restoqr.com"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Téléphone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Département / Affectation
                    </label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={e => setFormDepartment(e.target.value)}
                      placeholder="Ex: Direction Commerciale, Support Client"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                {/* PIN and Passcode */}
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Code PIN d'Accès Sécurisé</div>
                      <div className="text-[10px] text-stone-400">Utilisé pour l'authentification rapide et les opérations critiques</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formPin}
                      onChange={e => setFormPin(e.target.value)}
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-white font-mono text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setFormPin(Math.floor(100000 + Math.random() * 900000).toString())}
                      className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-semibold"
                    >
                      Générer
                    </button>
                  </div>
                </div>

                {/* Permissions Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-stone-300">
                      2. Permissions Granulaires ({formPermissions.length} sélectionnées)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold"
                      >
                        Tout cocher
                      </button>
                      <span className="text-stone-600">•</span>
                      <button
                        type="button"
                        onClick={handleClearPermissions}
                        className="text-[10px] text-stone-400 hover:text-white font-semibold"
                      >
                        Tout désélectionner
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 bg-stone-950/40 rounded-2xl border border-stone-850">
                    {ALL_SAAS_PERMISSIONS.map(perm => {
                      const isChecked = formPermissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleTogglePermission(perm.id)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                            isChecked 
                              ? 'bg-stone-950 border-orange-500/60' 
                              : 'bg-stone-950/40 border-stone-850 hover:border-stone-800'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-orange-400" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                              <span>{perm.label}</span>
                              <span className="text-[9px] text-stone-500 px-1 py-0.2 rounded bg-stone-900">
                                {perm.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-400 line-clamp-1">{perm.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEmployee(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-md shadow-orange-600/20"
                  >
                    {editingEmployee ? 'Enregistrer les Modifications' : 'Créer le Gestionnaire Plateforme'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </OwnerLayout>
  );
};
