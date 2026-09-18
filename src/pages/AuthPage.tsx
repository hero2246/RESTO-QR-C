import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  QrCode, 
  Lock, 
  Mail, 
  Store, 
  ArrowRight, 
  UserCheck, 
  ChefHat, 
  UtensilsCrossed, 
  Receipt, 
  ShieldAlert, 
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { getSupabaseConfigurationError, supabase } from '../lib/supabase';

interface AuthPageProps {
  navigate: (path: string) => void;
}

export type LoginRoleTab = 
  | 'RESTAURANT_OWNER' 
  | 'RESTAURANT_MANAGER' 
  | 'STAFF_WAITER' 
  | 'STAFF_KITCHEN' 
  | 'STAFF_CASHIER';

export const AuthPage: React.FC<AuthPageProps> = ({ navigate }) => {
  const { login, restaurants, setActiveRestaurant, restaurantStaff } = useApp();
  
  const [selectedRole, setSelectedRole] = useState<LoginRoleTab>('STAFF_WAITER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);


  const handleRoleTabChange = (newRole: LoginRoleTab) => {
    setSelectedRole(newRole);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    const configurationError = getSupabaseConfigurationError();
    if (configurationError || !supabase) {
      setError(configurationError ?? 'Le service Supabase est indisponible.');
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError) {
        const message = authError.message.toLowerCase();
        if (message.includes('email not confirmed')) {
          setError('Votre email n’est pas encore confirmé. Consultez votre boîte mail.');
        } else if (message.includes('invalid login credentials')) {
          setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
        } else if (message.includes('fetch') || message.includes('network')) {
          setError('Supabase est inaccessible. Vérifiez l’URL et la connexion réseau.');
        } else {
          setError(`Erreur Supabase : ${authError.message}`);
        }
        return;
      }
    } catch (caughtError) {
      setError('Supabase est inaccessible. Vérifiez la configuration et réessayez.');
      return;
    }
    const staffAccount = restaurantStaff.find(staff => staff.email.trim().toLowerCase() === cleanEmail);
    let remoteRestaurant = null;
    if (selectedRole === 'RESTAURANT_OWNER') {
      const result = await supabase
        .from('restaurants')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();
      remoteRestaurant = result.data;
    } else if (staffAccount) {
      const result = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', staffAccount.restaurant_id)
        .maybeSingle();
      remoteRestaurant = result.data;
      if (!staffAccount.is_active || staffAccount.employment_status === 'INACTIVE') {
        setError('Votre compte employé est désactivé. Votre ancien responsable doit vous réinviter.');
        return;
      }
    }
    const chosenResto = remoteRestaurant || (staffAccount ? restaurants.find(r => r.id === staffAccount.restaurant_id) : null);
    if (!chosenResto) {
      setError('Aucun restaurant trouvé pour ce compte.');
      return;
    }
    if (selectedRole === 'RESTAURANT_OWNER' && chosenResto.status !== 'ACTIVE') {
      setError('Votre restaurant est encore en attente de validation par le Super Admin.');
      return;
    }
    setActiveRestaurant(chosenResto);

    // The authenticated email determines the only restaurant this account may access.
    const matchedStaff = staffAccount;

    if (selectedRole === 'RESTAURANT_OWNER') {
      login(email, 'RESTAURANT_OWNER', chosenResto?.id);
      navigate('/dashboard');
    } else if (selectedRole === 'RESTAURANT_MANAGER') {
      login(email, 'RESTAURANT_MANAGER', chosenResto?.id);
      navigate('/dashboard');
    } else if (selectedRole === 'STAFF_WAITER') {
      const staffRole = matchedStaff?.staff_role || 'WAITER';
      login(email, 'RESTAURANT_STAFF', chosenResto?.id, staffRole);
      // Direct redirection to the dedicated waiter / dining room platform
      navigate('/dashboard/waiter');
    } else if (selectedRole === 'STAFF_KITCHEN') {
      const staffRole = matchedStaff?.staff_role || 'KITCHEN';
      login(email, 'RESTAURANT_STAFF', chosenResto?.id, staffRole);
      // Direct redirection to the dedicated kitchen KDS platform
      navigate('/dashboard/kitchen');
    } else if (selectedRole === 'STAFF_CASHIER') {
      const staffRole = matchedStaff?.staff_role || 'CASHIER';
      login(email, 'RESTAURANT_STAFF', chosenResto?.id, staffRole);
      // Direct redirection to the cashier platform
      navigate('/dashboard/cashier');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-stone-50">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <button
            type="button"
            className="w-12 h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20 active:scale-95 transition-transform"
            title="Connexion Restaurant RESTO QR"
          >
            <QrCode className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Espace de Connexion Restaurant
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Connectez-vous pour être redirigé automatiquement vers votre espace de travail dédié.
          </p>
        </div>

        {/* Section 1: Connexion Personnel (Mise en valeur Serveur & Cuisinier) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <span>Connexion Personnel Opérationnel</span>
              <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Redirection Directe</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* 1. Serveur (Salle) */}
            <button
              id="role-tab-waiter"
              type="button"
              onClick={() => handleRoleTabChange('STAFF_WAITER')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between relative ${
                selectedRole === 'STAFF_WAITER'
                  ? 'bg-blue-50/80 border-blue-500 text-blue-950 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  selectedRole === 'STAFF_WAITER' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                {selectedRole === 'STAFF_WAITER' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <div className="font-extrabold text-xs">Serveur</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-0.5">→ Salle & Tables</div>
              </div>
            </button>

            {/* 2. Cuisinier (Cuisine KDS) */}
            <button
              id="role-tab-kitchen"
              type="button"
              onClick={() => handleRoleTabChange('STAFF_KITCHEN')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between relative ${
                selectedRole === 'STAFF_KITCHEN'
                  ? 'bg-amber-50/80 border-amber-500 text-amber-950 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  selectedRole === 'STAFF_KITCHEN' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  <ChefHat className="w-4 h-4" />
                </div>
                {selectedRole === 'STAFF_KITCHEN' && (
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div>
                <div className="font-extrabold text-xs">Cuisinier</div>
                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">→ Écran KDS</div>
              </div>
            </button>

            {/* 3. Caissier (Caisse) */}
            <button
              id="role-tab-cashier"
              type="button"
              onClick={() => handleRoleTabChange('STAFF_CASHIER')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between relative ${
                selectedRole === 'STAFF_CASHIER'
                  ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  selectedRole === 'STAFF_CASHIER' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <Receipt className="w-4 h-4" />
                </div>
                {selectedRole === 'STAFF_CASHIER' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <div className="font-extrabold text-xs">Caissier</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">→ Poste Caisse</div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Direction & Gestion Restaurant */}
        <div className="space-y-2 pt-1 border-t border-stone-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Direction & Gérance Restaurant :
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Propriétaire */}
            <button
              id="role-tab-owner"
              type="button"
              onClick={() => handleRoleTabChange('RESTAURANT_OWNER')}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                selectedRole === 'RESTAURANT_OWNER'
                  ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs ring-1 ring-orange-500'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                selectedRole === 'RESTAURANT_OWNER' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'
              }`}>
                <Store className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-xs">Propriétaire Restaurant</div>
                <div className="text-[10px] text-stone-500">Gestion globale & revenus</div>
              </div>
            </button>

            {/* Gérant */}
            <button
              id="role-tab-manager"
              type="button"
              onClick={() => handleRoleTabChange('RESTAURANT_MANAGER')}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                selectedRole === 'RESTAURANT_MANAGER'
                  ? 'bg-purple-50 border-purple-500 text-purple-950 shadow-xs ring-1 ring-purple-500'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                selectedRole === 'RESTAURANT_MANAGER' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
              }`}>
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-xs">Gérant d'Exploitation</div>
                <div className="text-[10px] text-stone-500">Supervision & service</div>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Destination Banner */}
        <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 transition-colors ${
          selectedRole === 'STAFF_WAITER' ? 'bg-blue-50 border-blue-200 text-blue-900' :
          selectedRole === 'STAFF_KITCHEN' ? 'bg-amber-50 border-amber-200 text-amber-950' :
          selectedRole === 'STAFF_CASHIER' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
          selectedRole === 'RESTAURANT_MANAGER' ? 'bg-purple-50 border-purple-200 text-purple-950' :
          'bg-orange-50 border-orange-200 text-orange-950'
        }`}>
          <Sparkles className="w-4 h-4 shrink-0" />
          <div className="leading-snug">
            <span className="font-bold">Redirection directe : </span>
            {selectedRole === 'STAFF_WAITER' && (
              <span>Dès connexion, vous accédez directement à l’interface <strong>Salle & Tables (/dashboard/waiter)</strong> pour le service en salle.</span>
            )}
            {selectedRole === 'STAFF_KITCHEN' && (
              <span>Dès connexion, vous accédez directement à l’écran <strong>Cuisine KDS (/dashboard/kitchen)</strong> avec alertes sonores et minuteries.</span>
            )}
            {selectedRole === 'STAFF_CASHIER' && (
              <span>Dès connexion, vous accédez directement au poste <strong>Caisse (/dashboard/cashier)</strong> pour l'encaissement et l'impression.</span>
            )}
            {selectedRole === 'RESTAURANT_OWNER' && (
              <span>Accès complet au <strong>Dashboard Restaurant (/dashboard)</strong> : menu, QR codes, serveurs, statistiques et réglages.</span>
            )}
            {selectedRole === 'RESTAURANT_MANAGER' && (
              <span>Accès au <strong>Dashboard de Supervision (/dashboard)</strong> : suivi en direct des commandes, tables et équipes.</span>
            )}
          </div>
        </div>

        {/* Standard credentials form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

  <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs text-orange-800">
  Votre email détermine automatiquement le restaurant et les droits associés à votre compte.
  </div>
  

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Identifiant / Adresse Email ({
                selectedRole === 'STAFF_WAITER' ? 'Serveur' :
                selectedRole === 'STAFF_KITCHEN' ? 'Cuisinier' :
                selectedRole === 'STAFF_CASHIER' ? 'Caissier' :
                selectedRole === 'RESTAURANT_MANAGER' ? 'Gérant' : 'Propriétaire'
              })
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Mot de Passe
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-stone-300 text-orange-600 focus:ring-orange-500" />
              <span>Se souvenir de moi</span>
            </label>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            className={`w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
              selectedRole === 'STAFF_WAITER' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25' :
              selectedRole === 'STAFF_KITCHEN' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25' :
              selectedRole === 'STAFF_CASHIER' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25' :
              selectedRole === 'RESTAURANT_MANAGER' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25' :
              'bg-orange-600 hover:bg-orange-700 shadow-orange-600/25'
            }`}
          >
            <span>
              {selectedRole === 'STAFF_WAITER' && 'Se connecter et accéder à la Salle (Serveur) →'}
              {selectedRole === 'STAFF_KITCHEN' && 'Se connecter et accéder à la Cuisine KDS (Cuisinier) →'}
              {selectedRole === 'STAFF_CASHIER' && 'Se connecter et accéder à la Caisse (Caissier) →'}
              {selectedRole === 'RESTAURANT_MANAGER' && 'Se connecter au Dashboard Gérant →'}
              {selectedRole === 'RESTAURANT_OWNER' && 'Se connecter au Dashboard Propriétaire →'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => navigate('/register')}
            className="text-orange-600 hover:text-orange-700 font-bold"
          >
            Créer un nouveau restaurant
          </button>
          
          <div className="flex items-center gap-3">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=support@resto-qr.com&su=Réclamation%20ou%20demande%20d%27assistance&body=Bonjour%2C%0A%0AJe%20souhaite%20signaler%20le%20problème%20suivant%20%3A%0A%0A"
              className="text-stone-400 hover:text-orange-600 transition text-[11px] flex items-center gap-1 font-medium"
              title="Contacter le support par Gmail"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contacter le support</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
