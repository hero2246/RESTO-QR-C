import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingHeader } from './components/LandingHeader';
import { Toast } from './components/Toast';
import { RestaurantTeamChat } from './components/RestaurantTeamChat';

// Public & Restaurant Pages
import { LandingPage } from './pages/LandingPage';
import { PublicMenuPage } from './pages/PublicMenuPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { OrdersKanbanPage } from './pages/OrdersKanbanPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { TablesManagementPage } from './pages/TablesManagementPage';
import { QRCodePage } from './pages/QRCodePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RestaurantStaffPage } from './pages/RestaurantStaffPage';
import { KitchenDashboardPage } from './pages/KitchenDashboardPage';
import { WaiterDashboardPage } from './pages/WaiterDashboardPage';
import { CashierDashboardPage } from './pages/CashierDashboardPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { RestaurantSupportPage } from './pages/RestaurantSupportPage';
import { RestaurantRegistrationPage } from './pages/RestaurantRegistrationPage';
import { AuthPage } from './pages/AuthPage';

// Platform Admin Pages (Legacy)
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminRestaurantsPage } from './pages/AdminRestaurantsPage';

// SaaS Owner Portal Pages (Strictly isolated)
import { OwnerAuthPage } from './pages/owner/OwnerAuthPage';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { OwnerRestaurantsPage } from './pages/owner/OwnerRestaurantsPage';
import { OwnerEmployeesPage } from './pages/owner/OwnerEmployeesPage';
import { OwnerBrandingPage } from './pages/owner/OwnerBrandingPage';
import { OwnerSettingsPage } from './pages/owner/OwnerSettingsPage';
import { OwnerPlansPage } from './pages/owner/OwnerPlansPage';
import { OwnerSubscriptionsPage } from './pages/owner/OwnerSubscriptionsPage';
import { OwnerRevenuePage } from './pages/owner/OwnerRevenuePage';
import { OwnerAuditLogsPage } from './pages/owner/OwnerAuditLogsPage';
import { OwnerSecurityPage } from './pages/owner/OwnerSecurityPage';
import { SecurityAuditTester } from './pages/owner/SecurityAuditTester';
import { OwnerSupportPage } from './pages/owner/OwnerSupportPage';
import { PricingPage } from './pages/PricingPage';

function AppContent({
  currentPath,
  navigate
}: {
  currentPath: string;
  navigate: (path: string) => void;
}) {
  const { currentUser, showToast, restaurants } = useApp();

  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    const isPlatformHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.vercel.app');
    if (isPlatformHost || currentPath.startsWith('/r/')) return;
    const matchedRestaurant = restaurants.find((restaurant) => restaurant.custom_domain?.toLowerCase() === hostname && restaurant.status === 'ACTIVE');
    if (matchedRestaurant) navigate(`/r/${matchedRestaurant.slug}`);
  }, [currentPath, navigate, restaurants]);

  // Strict Role-Based Access Control (RBAC) Guard
  useEffect(() => {
    const restaurantPaths = currentPath === '/dashboard' ||
      currentPath === '/dashboard/' ||
      currentPath.startsWith('/dashboard/') ||
      currentPath === '/restaurant/dashboard' ||
      currentPath === '/restaurant/staff';

    if (restaurantPaths && !currentUser) {
      navigate('/login');
      return;
    }

    if (restaurantPaths && currentUser && !currentUser.restaurant_id) {
      showToast('Créez d’abord votre restaurant pour accéder au dashboard.', 'error');
      navigate('/register');
      return;
    }

    if (!currentUser) return;

    // Strict staff separation
    if (currentUser.role === 'RESTAURANT_STAFF') {
      const staffRole = currentUser.staff_role;

      if (staffRole === 'KITCHEN') {
        // Cuisinier : Strictement limité à Cuisine KDS
        if (currentPath.startsWith('/dashboard') && currentPath !== '/dashboard/kitchen') {
          showToast('Accès restreint : Le chef cuisinier est strictement limité à l’écran Cuisine KDS.', 'error');
          navigate('/dashboard/kitchen');
        } else if (currentPath.startsWith('/admin') || currentPath.startsWith('/owner')) {
          navigate('/dashboard/kitchen');
        }
      } else if (staffRole === 'WAITER') {
        // Serveur : Strictement limité à la Salle
        if (currentPath.startsWith('/dashboard') && currentPath !== '/dashboard/waiter') {
          showToast('Accès restreint : Le serveur est strictement limité à l’interface Salle & Service.', 'error');
          navigate('/dashboard/waiter');
        } else if (currentPath.startsWith('/admin') || currentPath.startsWith('/owner')) {
          navigate('/dashboard/waiter');
        }
      } else if (staffRole === 'CASHIER') {
        // Caissier : Strictement limité à la Caisse
        if (currentPath.startsWith('/dashboard') && currentPath !== '/dashboard/cashier') {
          showToast('Accès restreint : Le caissier est strictement limité au poste Caisse & Facturation.', 'error');
          navigate('/dashboard/cashier');
        } else if (currentPath.startsWith('/admin') || currentPath.startsWith('/owner')) {
          navigate('/dashboard/cashier');
        }
      }
    }

    // Protection stricte de l'accès aux Catégories & Menu (/dashboard/menu)
    if (currentPath === '/dashboard/menu') {
      const isSaaSAdmin = currentUser.role === 'OWNER' || currentUser.role === 'ADMIN' || currentUser.role === 'SAAS_EMPLOYEE';
      if (isSaaSAdmin) {
        showToast('Accès refusé : Les catégories sont exclusivement gérées au niveau restaurant.', 'error');
        navigate('/admin/dashboard');
        return;
      }

      if (currentUser.role === 'RESTAURANT_MANAGER') {
        const hasCategoryPerm = currentUser.permissions && (
          currentUser.permissions.includes('manage_categories') ||
          currentUser.permissions.includes('view_categories') ||
          currentUser.permissions.includes('menu.view')
        );
        if (!hasCategoryPerm) {
          showToast("Accès refusé : Permission 'manage_categories' requise pour accéder aux catégories.", 'error');
          navigate('/dashboard');
          return;
        }
      } else if (currentUser.role === 'RESTAURANT_STAFF') {
        const hasStaffPerm = currentUser.permissions && currentUser.permissions.includes('manage_categories');
        if (!hasStaffPerm) {
          showToast("Accès restreint : Votre poste n'autorise pas la gestion des catégories.", 'error');
          if (currentUser.staff_role === 'KITCHEN') navigate('/dashboard/kitchen');
          else if (currentUser.staff_role === 'WAITER') navigate('/dashboard/waiter');
          else if (currentUser.staff_role === 'CASHIER') navigate('/dashboard/cashier');
          else navigate('/dashboard');
          return;
        }
      }
    }

    // Protection de la gestion du personnel : seul le gérant et le propriétaire ont droit d'accéder
    if (currentPath === '/dashboard/staff' || currentPath === '/restaurant/staff') {
      const isManagerOrOwner = 
        currentUser.role === 'OWNER' || 
        currentUser.role === 'RESTAURANT_OWNER' || 
        currentUser.role === 'RESTAURANT_MANAGER' || 
        currentUser.role === 'RESTAURANT' ||
        currentUser.role === 'ADMIN' ||
        currentUser.staff_role === 'MANAGER';

      if (!isManagerOrOwner) {
        showToast('Accès refusé : Seuls le gérant et le propriétaire ont accès à la gestion du personnel.', 'error');
        if (currentUser.staff_role === 'KITCHEN') navigate('/dashboard/kitchen');
        else if (currentUser.staff_role === 'WAITER') navigate('/dashboard/waiter');
        else if (currentUser.staff_role === 'CASHIER') navigate('/dashboard/cashier');
        else navigate('/dashboard');
      }
    }
  }, [currentPath, currentUser, navigate, showToast]);

  // Router matching logic
  const renderRoute = () => {
    // ==========================================
    // 1. SaaS Owner Secret Portal (/owner/*)
    // ==========================================
    if (currentPath === '/owner' || currentPath === '/owner/' || currentPath === '/owner/login') {
      return <OwnerAuthPage navigate={navigate} />;
    }
    if (currentPath === '/owner/dashboard') {
      return <OwnerDashboard navigate={navigate} />;
    }
    if (currentPath === '/owner/restaurants') {
      return <OwnerRestaurantsPage navigate={navigate} />;
    }
    if (currentPath === '/owner/employees') {
      return <OwnerEmployeesPage navigate={navigate} />;
    }
    if (currentPath === '/owner/branding') {
      return <OwnerBrandingPage navigate={navigate} />;
    }
    if (currentPath === '/owner/settings') {
      return <OwnerSettingsPage navigate={navigate} />;
    }
    if (currentPath === '/owner/plans') {
      return <OwnerPlansPage navigate={navigate} />;
    }
    if (currentPath === '/owner/subscriptions') {
      return <OwnerSubscriptionsPage navigate={navigate} />;
    }
    if (currentPath === '/owner/revenue') {
      return <OwnerRevenuePage navigate={navigate} />;
    }
    if (currentPath === '/owner/audit') {
      return <OwnerAuditLogsPage navigate={navigate} />;
    }
    if (currentPath === '/owner/security') {
      return <OwnerSecurityPage navigate={navigate} />;
    }
    if (currentPath === '/owner/security-tests') {
      return <SecurityAuditTester navigate={navigate} />;
    }
    if (currentPath === '/owner/support') {
      return <OwnerSupportPage navigate={navigate} />;
    }

    // ==========================================
    // 2. Customer Public Menu: /r/:restaurantSlug
    // ==========================================
    if (currentPath.startsWith('/r/')) {
      const slug = currentPath.replace('/r/', '').split('/')[0];
      return <PublicMenuPage slug={slug} navigate={navigate} />;
    }

    // ==========================================
    // 3. Customer Order Tracking: /order/:orderId
    // ==========================================
    if (currentPath.startsWith('/order/')) {
      const orderId = currentPath.replace('/order/', '').split('/')[0];
      return <OrderTrackingPage orderId={orderId} navigate={navigate} />;
    }

    // ==========================================
    // 4. Restaurant Dashboard & Operations
    // ==========================================
    if (currentPath === '/dashboard' || currentPath === '/dashboard/' || currentPath === '/restaurant/dashboard') {
      return <RestaurantDashboard navigate={navigate} />;
    }
    if (currentPath === '/dashboard/orders') {
      return <OrdersKanbanPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/kitchen') {
      return <KitchenDashboardPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/waiter') {
      return <WaiterDashboardPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/cashier') {
      return <CashierDashboardPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/reservations') {
      return <ReservationsPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/support') {
      return <RestaurantSupportPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/menu') {
      return <MenuManagementPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/tables') {
      return <TablesManagementPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/qrcode') {
      return <QRCodePage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/analytics') {
      return <AnalyticsPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/settings') {
      return <SettingsPage navigate={navigate} />;
    }
    if (currentPath === '/dashboard/staff' || currentPath === '/restaurant/staff') {
      return <RestaurantStaffPage />;
    }

    // ==========================================
    // 5. Platform Admin (Legacy fallback)
    // ==========================================
    if (currentPath === '/admin' || currentPath === '/admin/dashboard') {
      return <AdminDashboard navigate={navigate} />;
    }
    if (currentPath === '/admin/restaurants') {
      return <AdminRestaurantsPage navigate={navigate} />;
    }

    // ==========================================
    // 6. Auth & Restaurant Self-Registration
    // ==========================================
    if (currentPath === '/register' || currentPath === '/register/') {
      return <RestaurantRegistrationPage navigate={navigate} />;
    }
    if (currentPath === '/pricing' || currentPath === '/pricing/') {
      return <PricingPage navigate={navigate} />;
    }
    if (currentPath === '/login' || currentPath === '/login/') {
      return <AuthPage navigate={navigate} />;
    }

    // Default: Landing Page
    return <LandingPage navigate={navigate} />;
  };

  const isOwnerPath = currentPath.startsWith('/owner');
  const isPublicAuthPath = currentPath === '/register' || currentPath === '/register/' || currentPath === '/login' || currentPath === '/login/';
  const isRestaurantWorkspace = currentPath.startsWith('/dashboard') || currentPath.startsWith('/restaurant/');

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col selection:bg-orange-500 selection:text-white">
      {(currentPath === '/' || currentPath === '') && <LandingHeader navigate={navigate} />}
      {currentPath !== '/' && currentPath !== '' && !isOwnerPath && !isPublicAuthPath && <Navbar currentPath={currentPath} navigate={navigate} />}
      
      <main className="flex-1">
        {renderRoute()}
      </main>

      {isRestaurantWorkspace && currentUser?.restaurant_id && <RestaurantTeamChat />}
      <Toast />
    </div>
  );
}

export default function App() {
  // Client-side router supporting both pathname and popstate
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AppProvider>
      <AppContent currentPath={currentPath} navigate={navigate} />
    </AppProvider>
  );
}
