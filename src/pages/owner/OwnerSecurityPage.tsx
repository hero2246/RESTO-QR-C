import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { ShieldCheck, KeyRound, Lock, AlertTriangle, Check, RefreshCw, Smartphone } from 'lucide-react';

interface OwnerSecurityPageProps {
  navigate: (path: string) => void;
}

export const OwnerSecurityPage: React.FC<OwnerSecurityPageProps> = ({ navigate }) => {
  const { saasSettings, updateSaasSettings, addAuditLog, showToast } = useApp();

  const [currentPin, setCurrentPin] = useState(saasSettings.owner_pin_code || '789456');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [pinSaved, setPinSaved] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      showToast('Le code PIN doit comporter exactement 6 chiffres', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('La confirmation du code PIN ne correspond pas', 'error');
      return;
    }

    updateSaasSettings({ owner_pin_code: newPin });
    addAuditLog('MISE_A_JOUR_PIN_OWNER', 'SECURITY', 'Code PIN 2FA', 'Renouvellement du code PIN secret à 6 chiffres');
    setPinSaved(true);
    setNewPin('');
    setConfirmPin('');
    showToast('Code PIN secret 2FA mis à jour avec succès', 'success');
    setTimeout(() => setPinSaved(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('Le mot de passe doit comporter au moins 8 caractères', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Les deux mots de passe saisis ne correspondent pas', 'error');
      return;
    }

    const currentStoredPassword = saasSettings.owner_password || 'Alphayayadiallo@12';
    if (currentPassword && currentPassword !== currentStoredPassword) {
      showToast('Le mot de passe actuel saisi est incorrect', 'error');
      return;
    }

    updateSaasSettings({ owner_password: newPassword });
    addAuditLog('MISE_A_JOUR_MDP_OWNER', 'SECURITY', 'Mot de passe OWNER', 'Changement et enregistrement du mot de passe maître');
    setPwdSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Nouveau mot de passe maître enregistré avec succès', 'success');
    setTimeout(() => setPwdSaved(false), 3000);
  };

  return (
    <OwnerLayout
      currentPath="/owner/security"
      navigate={navigate}
      title="Sécurité Forte & Contrôle d'Accès Maître"
      subtitle="Gestion des clés de chiffrement, code PIN secret 2FA et protection du compte OWNER"
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Security Overview */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Console Privée Sécurisée</h3>
              <p className="text-xs text-stone-400">
                L'accès à l'espace /owner est protégé par un mot de passe maître ainsi qu'un code PIN 2FA d'urgence.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Formulaire PIN 2FA */}
          <form onSubmit={handleUpdatePin} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Code PIN Secret 2FA (6 chiffres)</span>
            </h3>
            
            <p className="text-xs text-stone-400">
              Ce code PIN est exigé lors de toute tentative de connexion sur l'interface /owner.
            </p>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs">
              <span className="text-stone-400">Code PIN actuel : </span>
              <span className="font-mono font-bold text-amber-400">
                {saasSettings.owner_pin_code || '789456'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nouveau Code PIN (6 chiffres)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 852963"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Confirmer le Nouveau Code PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 852963"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              {pinSaved ? <Check className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
              <span>{pinSaved ? 'Code PIN Enregistré !' : 'Mettre à Jour le Code PIN'}</span>
            </button>
          </form>

          {/* Formulaire Mot de Passe Maître */}
          <form onSubmit={handleUpdatePassword} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-400" />
              <span>Mot de Passe Maître OWNER</span>
            </h3>

            <p className="text-xs text-stone-400">
              Renouveler le mot de passe racine du compte propriétaire.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Mot de Passe Actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nouveau Mot de Passe (8+ caractères)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Confirmer le Nouveau Mot de Passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20"
            >
              {pwdSaved ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{pwdSaved ? 'Mot de passe mis à jour !' : 'Changer le Mot de Passe'}</span>
            </button>
          </form>

        </div>

        {/* Stealth Access Methods Explanatory Panel */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white text-sm font-bold">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Techniques Secrètes de Connexion pour le Propriétaire (Cachées au public)</span>
          </div>
          <p className="text-xs text-stone-400">
            Tous les liens d'accès direct au Super Admin ont été retirés des interfaces publiques (formulaires de login, menus démo et landing page). Vous disposez de 3 méthodes secrètes pour vous connecter à tout moment :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">1</span>
                <span>Raccourci Clavier Global</span>
              </div>
              <p className="text-[11px] text-stone-300">
                Pressez simultanément <kbd className="px-1.5 py-0.5 rounded bg-stone-800 font-mono text-white text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-stone-800 font-mono text-white text-[10px]">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-stone-800 font-mono text-white text-[10px]">S</kbd> (ou <kbd className="px-1.5 py-0.5 rounded bg-stone-800 font-mono text-white text-[10px]">Alt</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-stone-800 font-mono text-white text-[10px]">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-stone-800 font-mono text-white text-[10px]">O</kbd>) depuis n'importe quelle page.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">2</span>
                <span>Frappe Secrète sur le Logo</span>
              </div>
              <p className="text-[11px] text-stone-300">
                Cliquez 3 fois rapidement d'affilée sur le logo RESTO QR (en haut à gauche de la barre de navigation). La fenêtre secrète d'accès maître s'ouvrira immédiatement.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">3</span>
                <span>URL Privée & Port discret</span>
              </div>
              <p className="text-[11px] text-stone-300">
                Tapez directement <code className="text-orange-400 font-mono text-[10px]">/owner/login</code> dans la barre d'adresse de votre navigateur ou double-cliquez sur le point de copyright en bas de page.
              </p>
            </div>
          </div>
        </div>

      </div>
    </OwnerLayout>
  );
};
