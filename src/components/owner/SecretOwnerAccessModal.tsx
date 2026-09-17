import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, KeyRound, Eye, EyeOff, X, ArrowRight, Check, AlertTriangle, Sparkles, RefreshCw, Mail } from 'lucide-react';
import { OfficialOwnerEmailModal } from './OfficialOwnerEmailModal';

interface SecretOwnerAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const SecretOwnerAccessModal: React.FC<SecretOwnerAccessModalProps> = ({
  isOpen,
  onClose,
  navigate
}) => {
  const { saasSettings, unlockOwnerSession, updateOwnerCredentials, isOwnerAuthenticated } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SETUP'>('LOGIN');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState(saasSettings.owner_email || 'dalpahayaya249@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Setup / Password Creation Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [customEmail, setCustomEmail] = useState(saasSettings.owner_email || 'dalpahayaya249@gmail.com');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupSuccess, setSetupSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginPassword) {
      setLoginError('Veuillez renseigner votre mot de passe d\'accès Super Admin.');
      return;
    }

    const success = unlockOwnerSession(loginPassword, loginPin || undefined, loginEmail);
    if (success) {
      onClose();
      navigate('/owner/dashboard');
    } else {
      setLoginError('Accès refusé : Le mot de passe Super Admin ou le code PIN est invalide.');
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    if (newPassword.length < 6) {
      setSetupError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSetupError('Les deux mots de passe saisis ne correspondent pas.');
      return;
    }

    if (!/^\d{6}$/.test(newPin)) {
      setSetupError('Le code PIN de sécurité doit comporter exactement 6 chiffres numériques.');
      return;
    }

    if (newPin !== confirmPin) {
      setSetupError('La confirmation du code PIN ne correspond pas.');
      return;
    }

    const ok = updateOwnerCredentials(newPassword, newPin, customEmail);
    if (ok) {
      setSetupSuccess(true);
      setLoginPassword(newPassword);
      setLoginPin(newPin);
      setLoginEmail(customEmail);
      setTimeout(() => {
        setSetupSuccess(false);
        setActiveTab('LOGIN');
      }, 1500);
    }
  };

  return (
    <div 
      id="secret-owner-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="secret-owner-modal-card"
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 relative"
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Portail Secret Super Admin
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 border border-stone-700">
                  ROOT / OWNER
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Accès camouflé, strictement réservé au propriétaire de la plateforme.
              </p>
            </div>
          </div>

          <button
            id="btn-close-secret-owner-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-5 sm:px-6 pt-4 flex gap-2">
          <button
            id="tab-secret-owner-login"
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setLoginError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                : 'bg-stone-950/60 border border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Se Connecter</span>
          </button>

          <button
            id="tab-secret-owner-setup"
            type="button"
            onClick={() => {
              setActiveTab('SETUP');
              setSetupError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'SETUP'
                ? 'bg-orange-500/20 border border-orange-500/30 text-orange-300'
                : 'bg-stone-950/60 border border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Créer / Modifier mon mot de passe</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">

          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Official Confirmation Banner Button */}
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full p-2.5 rounded-2xl bg-orange-600/15 hover:bg-orange-600/25 border border-orange-500/30 text-orange-200 text-xs flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-orange-200 flex items-center gap-1.5">
                      <span>Courriel Officiel de Confirmation</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1 py-0.2 rounded border border-emerald-500/30">VALIDÉ</span>
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">dalpahayaya249@gmail.com • Alpha Yaya Diallo</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-0.5 transition" />
              </button>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {isOwnerAuthenticated && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                  <span>Votre session Propriétaire est déjà active.</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/owner/dashboard');
                    }}
                    className="underline font-bold"
                  >
                    Ouvrir le dashboard
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Identifiant Email Maître
                </label>
                <input
                  id="secret-owner-input-email"
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="dalpahayaya249@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Mot de Passe Maître
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showLoginPassword ? 'Masquer' : 'Afficher'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="secret-owner-input-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe secret"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition"
                  />
                  <Lock className="w-4 h-4 text-stone-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    Code PIN Secret 2FA
                  </label>
                  <span className="text-[10px] font-mono text-stone-400">Optionnel • Secours</span>
                </div>
                <div className="relative">
                  <input
                    id="secret-owner-input-pin"
                    type="text"
                    maxLength={6}
                    value={loginPin}
                    onChange={e => setLoginPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm font-mono tracking-widest text-center text-amber-400 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition"
                  />
                  <KeyRound className="w-4 h-4 text-stone-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                id="btn-submit-secret-owner-login"
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Déverrouiller l'Espace Super Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-end text-[11px] text-stone-500 border-t border-stone-800/60">
                <button
                  type="button"
                  onClick={() => setActiveTab('SETUP')}
                  className="hover:text-stone-300 transition"
                >
                  Modifier mes clés ?
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: CREATE / UPDATE MASTER PASSWORD */}
          {activeTab === 'SETUP' && (
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300">
                Définissez ici le mot de passe maître personnel et le code PIN de sécurité à 6 chiffres qui vous permettront d’accéder à votre console à tout moment.
              </div>

              {setupError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              {setupSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Vos nouveaux accès maître ont été enregistrés avec succès ! Redirection...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Email du Super Admin
                </label>
                <input
                  id="setup-owner-email"
                  type="email"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="votre-email@restoqr.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-300">
                      Nouveau Mot de Passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[10px] text-stone-400 hover:text-stone-200"
                    >
                      {showNewPassword ? 'Cacher' : 'Voir'}
                    </button>
                  </div>
                  <input
                    id="setup-owner-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Confirmer Mot de Passe
                  </label>
                  <input
                    id="setup-owner-password-confirm"
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Nouveau Code PIN (6 chiffres)
                  </label>
                  <input
                    id="setup-owner-pin"
                    type="text"
                    maxLength={6}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 852963"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm font-mono tracking-widest text-center text-amber-400 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Confirmer le Code PIN
                  </label>
                  <input
                    id="setup-owner-pin-confirm"
                    type="text"
                    maxLength={6}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 852963"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm font-mono tracking-widest text-center text-amber-400 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <button
                id="btn-save-custom-owner-credentials"
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer mes nouveaux accès et code PIN</span>
              </button>

            </form>
          )}

        </div>

        {/* Discreet footer reminder */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 text-center text-[10px] text-stone-500">
          Astuce : Vous pouvez ouvrir cette boîte secrète à tout moment en pressant <kbd className="px-1 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">Shift</kbd> + <kbd className="px-1 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">S</kbd> ou en cliquant 3 fois de suite sur le logo.
        </div>

      </div>

      {/* Official Confirmation Email Modal */}
      <OfficialOwnerEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onApplyAndLogin={() => {
          unlockOwnerSession('Alphayayadiallo@12', '789456', 'dalpahayaya249@gmail.com');
          onClose();
          navigate('/owner/dashboard');
        }}
      />

    </div>
  );
};
