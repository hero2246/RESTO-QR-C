import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, KeyRound, AlertTriangle, ArrowRight, CheckCircle2, Terminal, Eye, EyeOff, Sparkles, Check, Mail } from 'lucide-react';
import { OfficialOwnerEmailModal } from '../../components/owner/OfficialOwnerEmailModal';

interface OwnerAuthPageProps {
  navigate: (path: string) => void;
}

export const OwnerAuthPage: React.FC<OwnerAuthPageProps> = ({ navigate }) => {
  const { unlockOwnerSession, updateOwnerCredentials, isOwnerAuthenticated, saasBranding, saasSettings } = useApp();
  
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'CREATE_PASSWORD'>('LOGIN');
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Login form state
  const [email, setEmail] = useState(saasSettings.owner_email || 'dalpahayaya249@gmail.com');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password creation state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [customEmail, setCustomEmail] = useState(saasSettings.owner_email || 'dalpahayaya249@gmail.com');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupSuccess, setSetupSuccess] = useState(false);

  // If already authenticated, redirect straight to dashboard
  if (isOwnerAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Session Propriétaire Déjà Ouverte</h2>
            <p className="text-xs text-stone-400 mt-2">
              Votre identité en tant que Propriétaire Fondateur du SaaS est active.
            </p>
          </div>
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2"
          >
            <span>Accéder au Dashboard Propriétaire</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Veuillez renseigner votre mot de passe Super Admin.');
      return;
    }

    const success = unlockOwnerSession(password, pinCode || undefined, email);
    if (success) {
      navigate('/owner/dashboard');
    } else {
      setError('Accès refusé : Le mot de passe Super Admin ou le code PIN de sécurité est invalide.');
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
      setPassword(newPassword);
      setPinCode(newPin);
      setEmail(customEmail);
      setTimeout(() => {
        setSetupSuccess(false);
        setActiveTab('LOGIN');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg space-y-6 relative z-10">
        
        {/* Header badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-[11px] font-bold text-amber-400 shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            <span>ESPACE PROPRIÉTAIRE SAAS (ACCÈS RÉSERVÉ)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {saasBranding.platform_name}
          </h1>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Portail racine confidentiel du SaaS. Cet accès est dissocié et masqué des interfaces publiques de restaurant.
          </p>
        </div>

        {/* Security Card */}
        <div className="bg-stone-900/95 border border-stone-800 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950 rounded-2xl border border-stone-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'LOGIN'
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Se Connecter</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('CREATE_PASSWORD');
                setSetupError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'CREATE_PASSWORD'
                  ? 'bg-orange-500/20 border border-orange-500/30 text-orange-300 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Créer / Changer mon MDP</span>
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'LOGIN' && (
            <div className="space-y-4">
              {/* Official Confirmation Banner Button */}
              <button
                type="button"
                onClick={() => setIsConfirmationModalOpen(true)}
                className="w-full p-3 rounded-2xl bg-orange-600/15 hover:bg-orange-600/25 border border-orange-500/30 text-orange-200 text-xs flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-orange-200 flex items-center gap-1.5">
                      <span>Courriel Officiel de Confirmation Super Admin</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">VALIDÉ</span>
                    </div>
                    <div className="text-[10px] text-stone-400">dalpahayaya249@gmail.com • Alpha Yaya Diallo</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition" />
              </button>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
                <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
                <span>
                  Authentification forte Super Admin avec mot de passe maître (dalpahayaya249@gmail.com).
                </span>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Identifiant Email Maître
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="dalpahayaya249@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-300">
                      Mot de Passe Maître
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Masquer' : 'Afficher'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Saisissez votre mot de passe secret"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition"
                    />
                    <Lock className="w-4 h-4 text-stone-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-300">
                      Code PIN de Sécurité (6 chiffres)
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">Optionnel • Secours</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm font-mono tracking-widest text-center text-amber-400 focus:outline-none focus:border-amber-500 transition"
                    />
                    <KeyRound className="w-4 h-4 text-stone-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Valider et Accéder à la Console Super Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-end text-xs">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-[11px] text-stone-400 hover:text-white transition"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE / UPDATE MASTER PASSWORD FORM */}
          {activeTab === 'CREATE_PASSWORD' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs leading-relaxed">
                Créez ou modifiez ici votre mot de passe d'accès personnel pour la console Propriétaire. Ces identifiants sont sauvegardés de façon persistante dans votre espace.
              </div>

              {setupError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              {setupSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Nouveaux identifiants enregistrés avec succès ! Redirection vers l'écran de connexion...</span>
                </div>
              )}

              <form onSubmit={handleSetupSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Email Propriétaire
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    required
                    placeholder="votre-email@restoqr.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-stone-300">
                        Nouveau Mot de Passe
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-[10px] text-stone-400 hover:text-stone-200"
                      >
                        {showNewPassword ? 'Masquer' : 'Voir'}
                      </button>
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      placeholder="Min. 6 caractères"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Confirmer le Mot de Passe
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Répétez mot de passe"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Nouveau Code PIN (6 chiffres)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={newPin}
                      onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="Ex: 852963"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm font-mono tracking-widest text-center text-amber-400 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Confirmer le Code PIN
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={confirmPin}
                      onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="Ex: 852963"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm font-mono tracking-widest text-center text-amber-400 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer mon Mot de Passe d'Accès Maître</span>
                </button>

              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('LOGIN')}
                  className="text-xs text-stone-400 hover:text-white transition"
                >
                  Retourner au formulaire de connexion
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Security notice footer */}
        <div className="text-center text-[10px] text-stone-400 space-y-1">
          <p>Toute tentative d’accès non autorisé fait l’objet d’un enregistrement cryptographique.</p>
          <p>Raccourci clavier furtif pour ré-ouvrir ce portail depuis n'importe quelle page : <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 font-mono text-stone-300">Ctrl + Shift + S</kbd></p>
        </div>

      </div>

      {/* Official Confirmation Email Modal */}
      <OfficialOwnerEmailModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onApplyAndLogin={() => {
          unlockOwnerSession('Alphayayadiallo@12', '789456', 'dalpahayaya249@gmail.com');
          navigate('/owner/dashboard');
        }}
      />

    </div>
  );
};
