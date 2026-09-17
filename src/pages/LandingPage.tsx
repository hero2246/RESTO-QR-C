import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  QrCode, 
  Smartphone, 
  ChefHat, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Layers,
  ExternalLink,
  CheckCircle2,
  BellRing
} from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { restaurants, setActiveRestaurant, setCurrentRole, saasBranding } = useApp();

  const handleTestRestaurant = (resto: typeof restaurants[0]) => {
    setActiveRestaurant(resto);
    navigate(`/r/${resto.slug}`);
  };

  const handleOpenDashboard = (resto: typeof restaurants[0]) => {
    setActiveRestaurant(resto);
    setCurrentRole('RESTAURANT');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>{saasBranding.slogan || 'Plateforme SaaS de Commande sur Table par QR Code'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
            Scannez. Commandez.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
              Savourez.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto font-normal">
            {saasBranding.hero_subtitle || "Révolutionnez le service en salle de votre restaurant. Vos clients commandent et suivent leur commande en temps réel depuis leur smartphone, sans télécharger d'application."}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 group"
            >
              <span>Créer mon Restaurant (Essai Gratuit)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                if (restaurants[0]) handleTestRestaurant(restaurants[0]);
              }}
              className="px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-sm shadow-sm transition flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-orange-400" />
              <span>Tester le Menu Client</span>
            </button>
          </div>

          <div className="pt-2 text-xs text-stone-600 flex items-center justify-center gap-4">
            <span>✓ Prêt à l'emploi</span>
            <span>✓ Tarification en FCFA</span>
            <span>✓ Suivi temps réel & audio</span>
          </div>
        </div>

        {/* Live Interactive Partner Restaurants Grid */}
        <div className="mt-16 pt-8 border-t border-stone-200">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              Nos restaurants partenaires
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Découvrez la carte digitale et l'expérience en salle de nos établissements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {restaurants.map(resto => (
              <div
                key={resto.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition overflow-hidden group"
              >
                <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                  <img
                    src={resto.cover_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'}
                    alt={resto.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-white">
                    <img
                      src={resto.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80'}
                      alt={resto.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-black text-base truncate">{resto.name}</h3>
                      <p className="text-xs text-stone-300 truncate">{resto.address}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                    {resto.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleTestRestaurant(resto)}
                      className="py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                      <span>Menu Client</span>
                    </button>

                    <button
                      onClick={() => handleOpenDashboard(resto)}
                      className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <ChefHat className="w-3.5 h-3.5 text-orange-400" />
                      <span>Espace Gérant</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-y border-stone-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Tout ce dont un restaurant moderne a besoin
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Une solution clé en main, conçue pour fluidifier les heures de pointe et augmenter le ticket moyen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-stone-900">QR Code Unique par Table</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Vos clients scannent et accèdent à votre carte immédiatement. Le numéro de table est automatiquement rattaché à la commande.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-stone-900">Suivi Live & Compte à Rebours</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Le client suit l'avancement pas-à-pas (reçue, confirmée avec temps estimé, préparation, prête) avec alertes visuelles claires.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-stone-900">Kanban Cuisine avec Alertes Audio</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Les cuisiniers et serveurs reçoivent une notification sonore instantanée à chaque nouvelle commande et gèrent les étapes d'un simple clic.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-stone-900 text-stone-400 text-xs px-4 text-center space-y-2">
        <div className="font-extrabold text-sm text-white tracking-tight">
          RESTO QR • Plateforme SaaS de Commande sur Table
        </div>
        <p>Conçu pour restaurants, cafés, fast-foods et maquis • Tarification en FCFA</p>
        <p className="text-stone-500 pt-2">© {new Date().getFullYear()} RESTO QR. Tous droits réservés.</p>
      </footer>

    </div>
  );
};
