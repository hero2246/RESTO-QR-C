import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SecretOwnerAccessModal } from './owner/SecretOwnerAccessModal';
import { 
  QrCode, 
  UtensilsCrossed, 
  LayoutDashboard, 
  ShoppingBag, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Layers,
  ChevronDown,
  Sparkles,
  Globe,
  ChefHat,
  CalendarDays,
  Receipt,
  LifeBuoy,
  Users,
  UserCheck,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Radio
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { 
    currentUser, 
    activeRestaurant, 
    logout, 
    orders, 
    login, 
    restaurants,
    setActiveRestaurantId,
    saasBranding,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    checkInStaff,
    checkOutStaff,
    restaurantStaff
  } = useApp();

  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [isSecretOwnerModalOpen, setIsSecretOwnerModalOpen] = useState(false);
  const [logoKnocks, setLogoKnocks] = useState(0);

  // Global stealth keyboard listener for Owner (Ctrl+Shift+S or Alt+Shift+O)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) ||
        (e.altKey && e.shiftKey && (e.key === 'O' || e.key === 'o')) ||
        (e.metaKey && e.shiftKey && (e.key === 'O' || e.key === 'o'))
      ) {
        e.preventDefault();
        setIsSecretOwnerModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBrandLogoClick = (e: React.MouseEvent) => {
    // If rapid 3 clicks detected, trigger secret modal!
    const newKnock = logoKnocks + 1;
    if (newKnock >= 3) {
      e.preventDefault();
      e.stopPropagation();
      setIsSecretOwnerModalOpen(true);
      setLogoKnocks(0);
      return;
    }
    setLogoKnocks(newKnock);
    setTimeout(() => setLogoKnocks(0), 2000);

    // Standard navigation
    if (currentUser?.role === 'RESTAURANT_STAFF') {
      if (currentUser.staff_role === 'KITCHEN') navigate('/dashboard/kitchen');
      else if (currentUser.staff_role === 'WAITER') navigate('/dashboard/waiter');
      else if (currentUser.staff_role === 'CASHIER') navigate('/dashboard/cashier');
      else navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  // Calculate new orders for badge
  const activeRestoOrders = activeRestaurant 
    ? orders.filter(o => o.restaurant_id === activeRestaurant.id && (o.status === 'NEW' || o.status === 'CONFIRMED'))
    : [];
  const newOrdersCount = activeRestoOrders.filter(o => o.status === 'NEW').length;

  // Strict separation of SaaS Super Admin and Restaurant roles
  const isSaaSAdmin = Boolean(
    currentUser && (
      currentUser.role === 'OWNER' || 
      currentUser.role === 'ADMIN' || 
      currentUser.role === 'SAAS_EMPLOYEE'
    )
  );

  const isRestaurantManagerOrOwner = Boolean(
    currentUser && !isSaaSAdmin && (
      currentUser.role === 'RESTAURANT_OWNER' || 
      currentUser.role === 'RESTAURANT_MANAGER' || 
      currentUser.role === 'RESTAURANT' ||
      currentUser.staff_role === 'MANAGER'
    )
  );

  // Category & Menu Access: Restaurant Owner has it by default. Manager only if granted permission.
  const canAccessMenu = Boolean(
    currentUser && !isSaaSAdmin && (
      currentUser.role === 'RESTAURANT_OWNER' || 
      currentUser.role === 'RESTAURANT' ||
      (currentUser.role === 'RESTAURANT_MANAGER' && (
        Boolean(currentUser.permissions && (
          currentUser.permissions.includes('manage_categories') ||
          currentUser.permissions.includes('view_categories') ||
          currentUser.permissions.includes('menu.view')
        ))
      ))
    )
  );

  const isManagerOrOwner = isRestaurantManagerOrOwner;

  const userNotifications = notifications.filter(n => {
    if (!currentUser) return true;
    if (n.target_roles && n.target_roles.length > 0) {
      if (isSaaSAdmin && n.target_roles.includes('OWNER')) return true;
      if (isRestaurantManagerOrOwner && (n.target_roles.includes('MANAGER') || n.target_roles.includes('OWNER'))) return true;
      if (currentUser.staff_role && n.target_roles.includes(currentUser.staff_role)) return true;
      return false;
    }
    return true;
  });

  const unreadNotificationsCount = userNotifications.filter(n => !n.read).length;

  // Find staff profile for current user if staff
  const currentStaffMember = (restaurantStaff || []).find(
    s => Boolean(currentUser?.email && s.email && s.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  // If on customer-facing view, render clean header
  const isCustomerPage = currentPath.startsWith('/r/') || currentPath.startsWith('/order/');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              id="nav-logo-btn"
              onClick={handleBrandLogoClick}
              className="flex items-center gap-2.5 text-left group"
              title="RESTO QR (Astuce: 3 clics rapides ouvrent la console d'administration maîtresse)"
            >
              {Boolean(saasBranding?.logo_url && saasBranding.logo_url.trim()) ? (
                <img 
                  src={saasBranding.logo_url}
                  alt={saasBranding.platform_name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-stone-200 shadow-sm group-hover:scale-105 transition-transform"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: saasBranding.primary_color || '#ea580c' }}
                >
                  <QrCode className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="font-extrabold text-xl tracking-tight text-stone-900 block leading-tight">
                  {saasBranding.platform_name}
                </span>
                <span className="text-[10px] text-stone-600 font-medium tracking-wide uppercase block -mt-0.5 truncate max-w-[200px]">
                  {saasBranding.slogan || 'Menu Digital & Commande'}
                </span>
              </div>
            </button>

            {/* Restaurant manager & owner navigation: FULL ACCESS TO ALL MODULES */}
            {isManagerOrOwner && !isCustomerPage && (
              <nav className="hidden lg:flex items-center gap-1">
                <button
                  id="nav-resto-overview"
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentPath === '/dashboard' 
                      ? 'bg-stone-100 text-stone-900 font-bold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-stone-500" />
                  Dashboard
                </button>

                <button
                  id="nav-resto-orders"
                  onClick={() => navigate('/dashboard/orders')}
                  className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentPath === '/dashboard/orders' 
                      ? 'bg-stone-100 text-stone-900 font-bold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                  Commandes
                  {newOrdersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black rounded-full bg-orange-600 text-white animate-pulse">
                      {newOrdersCount}
                    </span>
                  )}
                </button>

                {/* Service Operational Modules */}
                <button
                  id="nav-resto-kitchen"
                  onClick={() => navigate('/dashboard/kitchen')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                    currentPath === '/dashboard/kitchen' 
                      ? 'bg-amber-100 text-amber-900 font-black' 
                      : 'text-amber-800 bg-amber-50/70 hover:bg-amber-100'
                  }`}
                  title="Écran Cuisine KDS"
                >
                  <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                  Cuisine
                </button>

                <button
                  id="nav-resto-waiter"
                  onClick={() => navigate('/dashboard/waiter')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                    currentPath === '/dashboard/waiter' 
                      ? 'bg-blue-100 text-blue-900 font-black' 
                      : 'text-blue-800 bg-blue-50/70 hover:bg-blue-100'
                  }`}
                  title="Interface Salle & Serveur"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-blue-700" />
                  Salle
                </button>

                <button
                  id="nav-resto-cashier"
                  onClick={() => navigate('/dashboard/cashier')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                    currentPath === '/dashboard/cashier' 
                      ? 'bg-emerald-100 text-emerald-900 font-black' 
                      : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100'
                  }`}
                  title="Caisse & Encaissement"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                  Caisse
                </button>

                <button
                  id="nav-resto-staff"
                  onClick={() => navigate('/dashboard/staff')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentPath === '/dashboard/staff' || currentPath === '/restaurant/staff'
                      ? 'bg-orange-50 text-orange-900 font-bold border border-orange-200' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                  title="Gestion opérationnelle de l'équipe, présence et tâches"
                >
                  <Users className="w-3.5 h-3.5 text-orange-600" />
                  <span>Équipe & Pointage</span>
                </button>

                <button
                  id="nav-resto-reservations"
                  onClick={() => navigate('/dashboard/reservations')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentPath === '/dashboard/reservations' 
                      ? 'bg-stone-100 text-stone-900 font-bold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5 text-stone-500" />
                  Réservations
                </button>

                {canAccessMenu && (
                  <button
                    id="nav-resto-menu"
                    onClick={() => navigate('/dashboard/menu')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentPath === '/dashboard/menu' 
                        ? 'bg-stone-100 text-stone-900 font-bold' 
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                    Menu & Catégories
                  </button>
                )}

                <button
                  id="nav-resto-tables"
                  onClick={() => navigate('/dashboard/tables')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentPath === '/dashboard/tables' 
                      ? 'bg-stone-100 text-stone-900 font-bold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  Tables
                </button>

                <button
                  id="nav-resto-support"
                  onClick={() => navigate('/dashboard/support')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentPath === '/dashboard/support' 
                      ? 'bg-orange-50 text-orange-800 font-bold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <LifeBuoy className="w-3.5 h-3.5 text-orange-600" />
                  Support
                </button>

                <button
                  id="nav-resto-settings"
                  onClick={() => navigate('/dashboard/settings')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentPath === '/dashboard/settings' 
                      ? 'bg-stone-100 text-stone-900 font-bold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-stone-500" />
                  Paramètres
                </button>
              </nav>
            )}

            {/* Restaurant Staff navigation: STRICTLY RESTRICTED BY POST / STATION */}
            {currentUser?.role === 'RESTAURANT_STAFF' && !isManagerOrOwner && !isCustomerPage && (
              <nav className="hidden md:flex items-center gap-2">
                {/* 1. CUISINIER UNIQUEMENT */}
                {currentUser.staff_role === 'KITCHEN' && (
                  <div className="flex items-center gap-2">
                    <button
                      id="nav-staff-kitchen"
                      onClick={() => navigate('/dashboard/kitchen')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        currentPath === '/dashboard/kitchen' 
                          ? 'bg-amber-600 text-white shadow-xs' 
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Écran Cuisine KDS (Mon Poste)</span>
                    </button>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      Cuisinier KDS
                    </span>
                  </div>
                )}

                {/* 2. SERVEUR SALLE UNIQUEMENT */}
                {currentUser.staff_role === 'WAITER' && (
                  <div className="flex items-center gap-2">
                    <button
                      id="nav-staff-waiter"
                      onClick={() => navigate('/dashboard/waiter')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        currentPath === '/dashboard/waiter' 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>Interface Salle & Serveur (Mon Poste)</span>
                    </button>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      Serveur Salle
                    </span>
                  </div>
                )}

                {/* 3. CAISSIER UNIQUEMENT */}
                {currentUser.staff_role === 'CASHIER' && (
                  <div className="flex items-center gap-2">
                    <button
                      id="nav-staff-cashier"
                      onClick={() => navigate('/dashboard/cashier')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        currentPath === '/dashboard/cashier' 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Poste Caisse & Encaissement (Mon Poste)</span>
                    </button>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Caissier
                    </span>
                  </div>
                )}

                {/* Pointage presence en direct */}
                <button
                  onClick={() => checkInStaff()}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 transition"
                  title="Confirmer ma présence au poste (Gérant notifié)"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>En poste</span>
                </button>
              </nav>
            )}

            {/* Platform Admin navigation */}
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'OWNER' || currentUser?.role === 'SAAS_EMPLOYEE') && !isCustomerPage && (
              <nav className="hidden md:flex items-center gap-1">
                <button
                  id="nav-admin-dashboard"
                  onClick={() => navigate('/admin/dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/admin/dashboard' 
                      ? 'bg-stone-100 text-stone-900 font-semibold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Vue Globale
                </button>
                <button
                  id="nav-admin-restaurants"
                  onClick={() => navigate('/admin/restaurants')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/admin/restaurants' 
                      ? 'bg-stone-100 text-stone-900 font-semibold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                  Restaurants ({restaurants.length})
                </button>
              </nav>
            )}

            {/* Public visitor navigation */}
            {!currentUser && !isCustomerPage && (
              <nav className="hidden sm:flex items-center gap-1">
                <button
                  id="nav-public-pricing"
                  onClick={() => navigate('/pricing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    currentPath === '/pricing'
                      ? 'bg-orange-50 text-orange-600 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Tarifs & Formules
                </button>
              </nav>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Public Menu Preview link for restaurant manager */}
            {activeRestaurant && isManagerOrOwner && (
              <button
                id="nav-btn-view-client-menu"
                onClick={() => navigate(`/r/${activeRestaurant.slug}`)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
                title="Ouvrir le menu client accessible par QR code"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Voir Menu Client</span>
              </button>
            )}

            {/* REAL-TIME NOTIFICATION BELL WITH ROLE FILTERING */}
            {currentUser && (
              <div className="relative">
                <button
                  id="btn-notifications-toggle"
                  onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                  className={`relative p-2 rounded-xl border transition-colors ${
                    unreadNotificationsCount > 0 
                      ? 'bg-amber-50 text-amber-800 border-amber-300' 
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  }`}
                  title="Notifications en temps réel"
                >
                  {unreadNotificationsCount > 0 ? (
                    <BellRing className="w-4 h-4 text-orange-600 animate-bounce" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black rounded-full bg-rose-600 text-white shadow-xs">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {showNotificationsMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-stone-200 shadow-2xl p-3 z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                        <span className="font-bold text-stone-900 text-xs">Notifications en direct</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                          {userNotifications.length}
                        </span>
                      </div>
                      {userNotifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[11px] text-stone-500 hover:text-stone-800 font-semibold"
                        >
                          Tout effacer
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                      {userNotifications.length === 0 ? (
                        <div className="py-8 text-center text-stone-400 text-xs">
                          Aucune notification pour le moment.
                        </div>
                      ) : (
                        userNotifications.map((notif, idx) => (
                          <div
                            key={`${notif.id}-${idx}`}
                            onClick={() => markNotificationAsRead(notif.id)}
                            className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                              !notif.read 
                                ? 'bg-orange-50/70 border-orange-200 text-stone-900' 
                                : 'bg-stone-50 border-stone-200/70 text-stone-600 opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-stone-900 flex items-center gap-1">
                                {notif.type === 'order_ready' && <ChefHat className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                {notif.type === 'order_served' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                {notif.type === 'staff_checkin' && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-stone-500 shrink-0 flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {new Date(notif.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-700 leading-snug">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Session status */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-semibold text-stone-900 leading-none flex items-center justify-end gap-1">
                    {currentUser.role === 'RESTAURANT_STAFF' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    )}
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="text-[10px] text-stone-600 mt-0.5 font-medium">
                    {currentUser.staff_role === 'KITCHEN' && 'Poste Cuisine KDS'}
                    {currentUser.staff_role === 'WAITER' && 'Poste Serveur Salle'}
                    {currentUser.staff_role === 'CASHIER' && 'Poste Caisse & Paiement'}
                    {isManagerOrOwner && 'Gérant / Propriétaire'}
                    {!currentUser.staff_role && !isManagerOrOwner && (activeRestaurant?.name || 'Restaurant')}
                  </div>
                </div>
                <button
                  id="btn-logout"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  title="Se déconnecter"
                  className="p-2 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-nav-login"
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm"
              >
                Connexion
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Secret Master Portal Modal (Stealth access for the Super Admin Owner) */}
      <SecretOwnerAccessModal
        isOpen={isSecretOwnerModalOpen}
        onClose={() => setIsSecretOwnerModalOpen(false)}
        navigate={navigate}
      />
    </header>
  );
};
