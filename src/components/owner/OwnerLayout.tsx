import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Palette, 
  Settings, 
  CreditCard, 
  ShieldCheck, 
  ScrollText, 
  LogOut, 
  Lock, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  LifeBuoy
} from 'lucide-react';

interface OwnerLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({
  currentPath,
  navigate,
  children,
  title,
  subtitle,
  actions
}) => {
  const { 
    currentUser, 
    isOwnerAuthenticated, 
    lockOwnerSession, 
    saasBranding, 
    restaurants, 
    saasEmployees,
    saasSettings
  } = useApp();

  // If not authenticated as OWNER, redirect to secret login
  if (!isOwnerAuthenticated || currentUser?.role !== 'OWNER') {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Accès Privé Protégé</h2>
            <p className="text-xs text-stone-400 mt-2">
              Cet espace est strictement réservé au Propriétaire Principal du SaaS. Vous devez vous authentifier avec vos identifiants et votre code PIN de sécurité.
            </p>
          </div>
          <button
            onClick={() => navigate('/owner')}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Déverrouiller l'accès Propriétaire</span>
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Vue Globale', icon: LayoutDashboard, path: '/owner/dashboard' },
    { label: `Restaurants (${restaurants.length})`, icon: Store, path: '/owner/restaurants' },
    { label: 'Abonnements & Limites', icon: CheckCircle2, path: '/owner/subscriptions' },
    { label: 'Plans SaaS & Quotas', icon: CreditCard, path: '/owner/plans' },
    { label: 'Facturation & Revenus', icon: Activity, path: '/owner/revenue' },
    { label: 'Personnalisation du SaaS', icon: Palette, path: '/owner/branding' },
    { label: 'Paramètres & Monétisation', icon: Settings, path: '/owner/settings' },
    { label: `Gestionnaires Plateforme (${saasEmployees.length})`, icon: Users, path: '/owner/employees' },
    { label: 'Journal d’Audit', icon: ScrollText, path: '/owner/audit' },
    { label: 'Support & Tickets', icon: LifeBuoy, path: '/owner/support' },
    { label: 'Sécurité & 2FA', icon: ShieldCheck, path: '/owner/security' },
    { label: 'Banc d’Essai & Tests', icon: ShieldCheck, path: '/owner/security-tests' },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row">
      
      {/* Sidebar Propriétaire SaaS */}
      <aside className="w-full md:w-64 bg-stone-900 border-r border-stone-800 flex flex-col shrink-0">
        
        {/* Header Propriétaire (Cliquable pour revenir au dashboard) */}
        <div className="p-5 border-b border-stone-800">
          <div 
            onClick={() => navigate('/owner/dashboard')}
            className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition"
            title="Revenir au tableau de bord"
          >
            {Boolean(saasBranding?.logo_url && saasBranding.logo_url.trim()) ? (
              <img 
                src={saasBranding.logo_url} 
                alt={saasBranding.platform_name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-xl object-cover border border-stone-700 shadow-md shadow-stone-900/50 group-hover:scale-105 transition transform"
              />
            ) : (
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition transform"
                style={{ backgroundColor: saasBranding.primary_color || '#ea580c' }}
              >
                <Lock className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-1.5">
                <span className="group-hover:text-orange-400 transition">{saasBranding.platform_name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 font-bold">OWNER</span>
              </div>
              <p className="text-[10px] text-stone-400 truncate">Console Maître SaaS</p>
            </div>
          </div>
          
          {/* Status Indicator (Cliquable vers paramètres) */}
          <div 
            onClick={() => navigate('/owner/settings')}
            className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 cursor-pointer hover:text-stone-200 transition"
            title="Voir les paramètres système"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Plateforme Active</span>
            </span>
            {saasSettings.maintenance_mode ? (
              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                Maintenance
              </span>
            ) : (
              <span className="text-[10px] text-stone-500 hover:text-stone-400">
                Paramètres →
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Owner Profile & Lock */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/50 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs font-bold text-amber-400">
              👑
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">Propriétaire Fondateur</div>
              <div className="text-[10px] text-stone-400 truncate">owner@restoqr.com</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                lockOwnerSession();
                navigate('/');
              }}
              className="w-full py-2 px-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-medium transition flex items-center justify-center gap-1.5"
              title="Verrouille l'accès et retourne à l'accueil"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Verrouiller</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-medium transition flex items-center justify-center gap-1.5"
              title="Voir le site public"
            >
              <span>Site Public</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        
        {/* Top bar */}
        <header className="h-16 px-6 border-b border-stone-800 bg-stone-900/40 backdrop-blur-md flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-stone-400">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </header>

        {/* Content body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {children}
        </div>

      </main>

    </div>
  );
};
