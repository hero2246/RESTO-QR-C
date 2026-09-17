import React from 'react';
import { QrCode, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LandingHeaderProps {
  navigate: (path: string) => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ navigate }) => {
  const { saasBranding } = useApp();

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left"
          aria-label={`${saasBranding.platform_name}, retour à l'accueil`}
        >
          {Boolean(saasBranding?.logo_url && saasBranding.logo_url.trim()) ? (
            <img
              src={saasBranding.logo_url}
              alt={saasBranding.platform_name}
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-xl border border-stone-200 object-cover shadow-sm"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
              style={{ backgroundColor: saasBranding.primary_color || '#ea580c' }}
            >
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <span className="text-xl font-extrabold tracking-tight text-stone-900">
            {saasBranding.platform_name}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Connexion
        </button>
      </div>
    </header>
  );
};

export default LandingHeader;
