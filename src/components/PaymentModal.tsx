import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SaasPlan, PaymentProviderType } from '../types';
import { 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  X, 
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Clock,
  QrCode,
  AlertCircle
} from 'lucide-react';

interface PaymentModalProps {
  plan: SaasPlan;
  billingCycle: 'monthly' | 'yearly';
  restaurantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  plan,
  billingCycle,
  restaurantId,
  onClose,
  onSuccess
}) => {
  const { 
    saasSettings, 
    changeRestaurantPlan, 
    submitMobileMoneyPayment, 
    showToast 
  } = useApp();

  const isPaymentRequired = !!saasSettings.monetization.payment_required;
  const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

  // Mobile money parameters configured by Super Admin
  const mmName = saasSettings.monetization.mobile_money_name || 'Wave / Orange Money';
  const mmPhone = saasSettings.monetization.mobile_money_phone || '+221 77 123 45 67';
  const mmLink = saasSettings.monetization.mobile_money_link || 'https://pay.wave.com/m/resto-qr-pro-senegal';
  const mmInstructions = saasSettings.monetization.mobile_money_instructions || 
    '1. Cliquez sur "Payer maintenant" pour ouvrir l\'application ou le lien de paiement Wave/Orange Money.\n2. Effectuez le transfert du montant indiqué.\n3. Renseignez la référence du paiement et cliquez sur "J\'ai effectué le paiement".';
  const mmQrUrl = saasSettings.monetization.mobile_money_qr_url;

  // Form states
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [hasOpenedLink, setHasOpenedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<'IDLE' | 'FREE_ACTIVATED' | 'PENDING_VERIFICATION'>('IDLE');
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Copy phone helper
  const handleCopyPhone = () => {
    navigator.clipboard.writeText(mmPhone.replace(/\s+/g, ''));
    setCopiedPhone(true);
    showToast('Numéro copié dans le presse-papier', 'info');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Open external Mobile Money Link
  const handleOpenPaymentLink = () => {
    setHasOpenedLink(true);
    if (mmLink) {
      window.open(mmLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Free / Discovery Activation (when payment_required is OFF)
  const handleFreeActivation = () => {
    setIsSubmitting(true);
    try {
      const res = changeRestaurantPlan(restaurantId, plan.id, billingCycle);
      if (res.success) {
        setSubmittedStatus('FREE_ACTIVATED');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'activation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Mobile Money Proof (when payment_required is ON)
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      showToast('Veuillez renseigner votre référence ou numéro de transaction Mobile Money.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMobileMoneyPayment(
        restaurantId,
        plan.id,
        billingCycle,
        'Wave',
        transactionRef.trim(),
        notes.trim() || undefined
      );

      setSubmittedStatus('PENDING_VERIFICATION');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la transmission du paiement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl text-stone-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3.5">
          <div>
            <div className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Abonnement SaaS RESTO QR</div>
            <h3 className="text-lg font-black text-white">Souscription Formule {plan.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CASE 1: FREE / DISCOVERY ACTIVATION SUCCESS */}
        {submittedStatus === 'FREE_ACTIVATED' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Forfait {plan.name} Activé Immédiatement !</h4>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              Le Super Admin a autorisé l'accès direct sans obligation de paiement préalable.
            </p>
          </div>
        )}

        {/* CASE 2: PENDING VERIFICATION SUCCESS */}
        {submittedStatus === 'PENDING_VERIFICATION' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Paiement en Attente de Vérification</h4>
            <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
              Votre demande a bien été transmise avec la référence <span className="font-mono font-bold text-orange-400">{transactionRef}</span>. Le Super Admin vérifie la réception du paiement Mobile Money pour validation.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20">
              Statut : PENDING_VERIFICATION
            </div>
          </div>
        )}

        {/* CASE 3: INTERFACE DE PAIEMENT */}
        {submittedStatus === 'IDLE' && (
          <div className="space-y-5">
            
            {/* Amount Summary */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-400">Montant de l'abonnement</div>
                <div className="text-[11px] text-stone-500">
                  Cycle : {billingCycle === 'yearly' ? 'Annuel (12 mois)' : 'Mensuel'}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-white text-2xl">
                  {price.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs text-orange-400 font-bold ml-1">FCFA</span>
              </div>
            </div>

            {/* BRANCH A: PAYMENT REQUIRED = FALSE */}
            {!isPaymentRequired ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-200">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Mode Découverte Actif</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Le Super Admin autorise les établissements à tester et passer sur le forfait {plan.name} sans paiement préalable.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFreeActivation}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Activer le Forfait {plan.name} Gratuitement</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* BRANCH B: PAYMENT REQUIRED = TRUE -> FULL MOBILE MONEY WORKFLOW */
              <div className="space-y-4">
                
                {/* Mobile Money Details Box */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{mmName}</div>
                        <div className="text-[10px] text-stone-400">Paiement Mobile Money Sénégal / UEMOA</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-white bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
                        {mmPhone}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        title="Copier le numéro"
                        className="p-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition"
                      >
                        {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* QR Code preview if set */}
                  {Boolean(mmQrUrl && mmQrUrl.trim()) && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-900 border border-stone-800">
                      <img 
                        src={mmQrUrl} 
                        alt="QR Code Paiement" 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-contain bg-white p-1" 
                      />
                      <div className="text-[11px] text-stone-300">
                        <span className="font-bold block text-white">Scannez pour payer</span>
                        Ouvrez votre application Wave ou Orange Money et scannez ce QR Code.
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-[11px] text-stone-300 whitespace-pre-line leading-relaxed font-sans">
                    {mmInstructions}
                  </div>
                </div>

                {/* STEP 1: EXPLICIT BUTTON "PAYER MAINTENANT" */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-orange-400 flex items-center gap-1">
                    <span>Étape 1 : Effectuez votre transfert</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenPaymentLink}
                    className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer group"
                  >
                    <span>PAYER MAINTENANT ({price.toLocaleString('fr-FR')} FCFA)</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                  <div className="text-[10px] text-stone-400 text-center">
                    {hasOpenedLink ? (
                      <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Lien ouvert dans un nouvel onglet. Terminez puis confirmez ci-dessous.
                      </span>
                    ) : (
                      <span>Ouvre directement l'application ou le lien de paiement Mobile Money.</span>
                    )}
                  </div>
                </div>

                {/* STEP 2: "J'AI EFFECTUÉ LE PAIEMENT" FORM */}
                <form onSubmit={handleSubmitProof} className="space-y-3 pt-3 border-t border-stone-800">
                  <div className="text-[11px] font-bold text-stone-300 flex items-center gap-1">
                    <span>Étape 2 : Confirmez votre transaction</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Référence de transaction ou N° expéditeur <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: WAVE-204891 ou +221 77 000 00 00"
                      value={transactionRef}
                      onChange={e => setTransactionRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white font-mono placeholder-stone-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Notes ou précisions (Optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Virement effectué à 14h30 par M. Diallo"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !transactionRef.trim()}
                    className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 border border-stone-700 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>J'ai effectué le paiement</span>
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-stone-500 text-center leading-relaxed">
                    Après validation, le statut passera en <span className="font-mono text-amber-400">PENDING_VERIFICATION</span> et le Super Admin validera votre abonnement.
                  </div>
                </form>

              </div>
            )}

            <div className="text-center text-[10px] text-stone-500 flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Paiement sécurisé et contrôlé par l'administrateur RESTO QR</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
