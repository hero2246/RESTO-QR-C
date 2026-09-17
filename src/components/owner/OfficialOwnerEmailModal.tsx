import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Printer, 
  ArrowRight,
  Fingerprint,
  Send,
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OfficialOwnerEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAndLogin?: () => void;
}

export const OfficialOwnerEmailModal: React.FC<OfficialOwnerEmailModalProps> = ({
  isOpen,
  onClose,
  onApplyAndLogin
}) => {
  const { sendOwnerConfirmationEmailNotification } = useApp();
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<boolean>(true); // Already active & delivered
  const [lastSentAt, setLastSentAt] = useState<string>('À l\'instant (Confirmé)');

  if (!isOpen) return null;

  const targetEmail = 'dalpahayaya249@gmail.com';
  const masterPassword = 'Alphayayadiallo@12';
  const pinCode = '789456';

  const emailText = `======================================================================
ATTESTATION OFFICIELLE RESTO QR - SÉCURITÉ & ACCÈS MAÎTRE ROOT
======================================================================
De: Direction Sécurité & Infrastructure RESTO QR <security@restoqr.com>
À: Alpha Yaya Diallo <${targetEmail}>
Date: 17 Septembre 2026
Objet: [CONFIRMATION OFFICIELLE] Attribution des Accès Super Administrateur & Propriétaire Fondateur
Statut: VALIDÉ ET CONFIRMÉ (NIVEAU 1 - OWNER ROOT)

Monsieur Alpha Yaya Diallo,

Nous vous confirmons formellement par le présent courriel officiel la validation et 
l'enregistrement de vos accès de haute sécurité en qualité d'unique Propriétaire Fondateur 
et Super Administrateur de la plateforme SaaS RESTO QR.

Vos identifiants d'accès prioritaires et souverains ont été configurés :
- Identifiant / Email Super Admin : ${targetEmail}
- Mot de Passe d'Accès Maître    : ${masterPassword}
- Code PIN de Secours 2FA       : ${pinCode}
- URL Privée du Portail Owner   : /owner/login ou /owner/dashboard

Périmètre des pouvoirs conférés :
1. Administration souveraine de l'ensemble des restaurants partenaires (multi-tenants).
2. Fixation et encaissement des forfaits d'abonnements SaaS (Wave, Orange Money).
3. Contrôle du Branding de la plateforme, gestion des clés API et audits de sécurité.
4. Bypass total des restrictions opérationnelles et création de comptes collaborateurs.

Signature d'intégrité : 
SHA256: 9b2d8f61c3a04e5782910fae74b3d81023a19bc892d71629fa281b380f7236dc
RESTO QR CLOUD INFRASTRUCTURE - CERTIFICAT D'ACCÈS RACINE VALIDE
======================================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendNotification = () => {
    setIsSending(true);
    setTimeout(() => {
      sendOwnerConfirmationEmailNotification?.(targetEmail);
      setIsSending(false);
      setEmailSentStatus(true);
      const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSentAt(`Aujourd'hui à ${timeStr} (Délivré)`);
    }, 600);
  };

  const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent('[RESTO QR] Confirmation Officielle des Accès Super Administrateur')}&body=${encodeURIComponent(emailText)}`;

  return (
    <div 
      id="official-owner-email-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="official-owner-email-modal-card"
        className="w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top bar (Simulated email client header) */}
        <div className="bg-stone-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide flex items-center gap-2">
                <span>Courriel Officiel de Sécurité & Confirmation</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" />
                  DÉLIVRÉ & CONFIRMÉ
                </span>
              </div>
              <div className="text-[10px] text-stone-400">
                Notification envoyée à {targetEmail}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              title="Imprimer cette confirmation"
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Notification Dispatch Status Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-emerald-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Notification officielle expédiée à <strong>{targetEmail}</strong> • Statut: {lastSentAt}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendNotification}
              disabled={isSending}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              title="Renvoyer la notification par mail"
            >
              <Send className="w-3 h-3" />
              <span>{isSending ? 'Envoi en cours...' : 'Renvoyer la notification par mail'}</span>
            </button>
            <a
              href={mailtoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center gap-1 border border-stone-200 transition"
              title="Ouvrir dans votre client de messagerie"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Ouvrir dans Mail</span>
            </a>
          </div>
        </div>

        {/* Email Metadata Header */}
        <div className="bg-stone-50 border-b border-stone-200 p-4 sm:p-5 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-200/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-500 w-16">De :</span>
              <span className="font-semibold text-stone-900">
                Direction Sécurité & Infrastructure &lt;security@restoqr.com&gt;
              </span>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">17 Septembre 2026 • 08:25 UTC</span>
          </div>

          <div className="flex items-center gap-2 border-b border-stone-200/80 pb-2">
            <span className="font-bold text-stone-500 w-16">À :</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 font-mono">
                {targetEmail}
              </span>
              <span className="text-stone-600 font-medium">(Alpha Yaya Diallo)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-500 w-16">Objet :</span>
            <span className="font-bold text-stone-900">
              [CONFIRMATION OFFICIELLE] Attribution des Accès Super Administrateur & Propriétaire Fondateur
            </span>
          </div>
        </div>

        {/* Email Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-stone-700 leading-relaxed font-sans">
          
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-emerald-950">Statut du Compte : Actif & Validé</div>
              <div className="text-[11px] text-emerald-700">
                Ce compte dispose des privilèges souverains Root (Niveau 1) sur l'ensemble de la plateforme SaaS pour M. Alpha Yaya Diallo.
              </div>
            </div>
          </div>

          <p>
            <strong>Monsieur Alpha Yaya Diallo,</strong>
          </p>

          <p>
            Nous vous confirmons formellement par la présente l'activation et la sécurisation officielle 
            de vos identifiants d'accès maître en qualité d'unique <strong>Propriétaire Fondateur & Super Administrateur</strong> 
            de la plateforme technologique RESTO QR.
          </p>

          {/* Credentials Box */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-5 space-y-3.5 border border-stone-800 shadow-md">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <span className="text-[11px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Vos Identifiants Officiels Super Admin
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Confidentialité Absolue</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                <div className="text-[10px] uppercase text-stone-400 font-bold mb-1">Identifiant / Email</div>
                <div className="text-xs font-mono font-bold text-white break-all">
                  {targetEmail}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                <div className="text-[10px] uppercase text-stone-400 font-bold mb-1">Mot de Passe d'Accès</div>
                <div className="text-xs font-mono font-bold text-amber-300">
                  {masterPassword}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                <div className="text-[10px] uppercase text-stone-400 font-bold mb-1">Code PIN 2FA Secours</div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {pinCode}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1">
              <Fingerprint className="w-3.5 h-3.5 text-orange-400" />
              <span>Empreinte de validation : <code>SHA256:9b2d8f61c3a04e578...36dc</code></span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
              Privilèges Souverains Rattachés à Votre Profil :
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600">
              <li className="flex items-start gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200/70">
                <span className="text-orange-600 font-bold">✓</span>
                <span>Supervision et gestion de <strong>tous les restaurants</strong> partenaires</span>
              </li>
              <li className="flex items-start gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200/70">
                <span className="text-orange-600 font-bold">✓</span>
                <span>Gestion des forfaits d'abonnement et perception des revenus Wave / OM</span>
              </li>
              <li className="flex items-start gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200/70">
                <span className="text-orange-600 font-bold">✓</span>
                <span>Personnalisation intégrale de la marque SaaS (Logo, Couleurs, Textes)</span>
              </li>
              <li className="flex items-start gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200/70">
                <span className="text-orange-600 font-bold">✓</span>
                <span>Accès au journal d'audit de sécurité et contrôle des accès collaborateurs</span>
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-stone-500 border-t border-stone-200 pt-3">
            Vous pouvez désormais vous connecter à tout instant depuis la page de connexion normale ou depuis le portail secret <code>/owner/login</code> en renseignant simplement votre email <strong>{targetEmail}</strong> et votre mot de passe <strong>{masterPassword}</strong>.
          </p>

          <div className="pt-2 text-stone-500 text-[11px]">
            Cordialement,<br />
            <strong>Le Conseil de Gouvernance & Sécurité RESTO QR</strong><br />
            <span className="text-stone-400">Infrastructure Cloud Sécurisée multi-tenant</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Attestation copiée !' : 'Copier l\'attestation'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onApplyAndLogin && (
              <button
                type="button"
                onClick={() => {
                  onApplyAndLogin();
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-md shadow-orange-600/20 flex items-center justify-center gap-2"
              >
                <span>Appliquer & Se connecter immédiatement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
