import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatTime, STATUS_LABELS } from '../utils/format';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  BellRing, 
  ShoppingBag, 
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderTrackingPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, navigate }) => {
  const { orders, restaurants } = useApp();

  const order = orders.find(o => o.id === orderId);
  const restaurant = order ? restaurants.find(r => r.id === order.restaurant_id) : null;

  // Countdown timer in seconds (derived from estimated minutes)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!order?.confirmed_at || !order?.estimated_minutes || order.status === 'READY' || order.status === 'COMPLETED') {
      setTimeLeftSeconds(null);
      return;
    }

    const confirmedTime = new Date(order.confirmed_at).getTime();
    const durationMs = order.estimated_minutes * 60 * 1000;
    const targetTime = confirmedTime + durationMs;

    const interval = setInterval(() => {
      const remainingMs = targetTime - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftSeconds(remainingSec);
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.confirmed_at, order?.estimated_minutes, order?.status]);

  // Confetti when order becomes ready
  useEffect(() => {
    if (order?.status === 'READY') {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {}
    }
  }, [order?.status]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Commande introuvable</h2>
          <p className="text-sm text-stone-600 mb-6">Cette commande n’existe pas ou a été archivée.</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Steps definition for timeline
  const steps = [
    { key: 'NEW', label: 'Commande envoyée', desc: 'Reçue par le restaurant' },
    { key: 'CONFIRMED', label: 'Commande confirmée', desc: order.estimated_minutes ? `Temps estimé : ${order.estimated_minutes} min` : 'Validée en cuisine' },
    { key: 'PREPARING', label: 'En préparation', desc: 'Nos cuisiniers s’activent' },
    { key: 'READY', label: 'Commande prête', desc: 'À savourer sans attendre' },
    { key: 'COMPLETED', label: 'Terminée', desc: 'Merci de votre visite' },
  ];

  const statusOrder = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
  const currentStepIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => restaurant ? navigate(`/r/${restaurant.slug}`) : navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-stone-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au menu</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Actualisation en temps réel</span>
          </div>
        </div>

        {/* Big Alert Banner when READY */}
        {order.status === 'READY' && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl animate-bounce-subtle text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              🎉 Votre commande est prête !
            </h2>
            <p className="text-sm text-emerald-100 mt-1 max-w-sm mx-auto">
              Le service arrive à votre table ou votre commande est disponible au comptoir de {restaurant?.name || 'notre restaurant'}. Bon appétit !
            </p>
          </div>
        )}

        {/* Order Main Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 overflow-hidden relative">
          
          {/* Top Order Badge */}
          <div className="flex items-start justify-between border-b border-stone-100 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                {restaurant?.name || 'Restaurant'}
              </span>
              <h1 className="text-2xl font-black text-stone-900 mt-0.5">
                {order.order_number}
              </h1>
              <div className="text-xs text-stone-600 mt-1">
                Passée à {formatTime(order.created_at)} • Table {order.table_number}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold border bg-orange-50 text-orange-700 border-orange-200">
                {STATUS_LABELS[order.status] || order.status}
              </span>
              <div className="text-lg font-black text-stone-900 mt-2">
                {formatFCFA(order.total_amount)}
              </div>
            </div>
          </div>

          {/* Countdown Clock (if confirmed and in prep) */}
          {timeLeftSeconds !== null && (
            <div className="my-6 p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                  <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium">Temps d'attente estimé</div>
                  <div className="text-sm font-bold text-white">
                    {timeLeftSeconds === 0 ? 'Finition et dressage...' : 'Préparation en cuisine'}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-mono font-bold text-orange-400">
                {formatCountdown(timeLeftSeconds)}
              </div>
            </div>
          )}

          {/* Delay Notice Banner if timer reached 0 but not ready */}
          {timeLeftSeconds === 0 && (order.status === 'PREPARING' || order.status === 'CONFIRMED') && (
            <div className="my-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs font-medium">
              <ChefHat className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>Dressage soigné en cours :</strong> Le chef apporte une attention particulière aux finitions de vos assiettes. Votre commande arrive à votre table d'un instant à l'autre !
              </div>
            </div>
          )}

          {/* Timeline */}
          {!isCancelled ? (
            <div className="mt-8 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-5">
                Suivi de votre commande :
              </h3>

              <div className="relative pl-6 space-y-7 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {steps.map((step, index) => {
                  const isDone = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.key} className="relative flex items-start gap-3.5">
                      {/* Step marker */}
                      <div 
                        className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                          isDone 
                            ? 'bg-orange-600 border-orange-600 text-white shadow-xs' 
                            : 'bg-white border-stone-300 text-stone-300'
                        }`}
                      >
                        {isDone ? '✓' : ''}
                      </div>

                      <div className="flex-1">
                        <div className={`text-sm font-bold leading-tight ${
                          isCurrent ? 'text-orange-600 font-black' : isDone ? 'text-stone-900' : 'text-stone-600'
                        }`}>
                          {step.label}
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5">
                          {step.desc}
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 uppercase tracking-wide">
                          Actuel
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="my-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium text-center">
              Cette commande a été annulée par l’établissement.
            </div>
          )}

          {/* Ordered Items summary */}
          <div className="pt-6 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
              Détail des articles commandés :
            </h4>
            <div className="space-y-2.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between text-xs py-1">
                  <div>
                    <span className="font-bold text-stone-900">{item.quantity}x</span>{' '}
                    <span className="text-stone-800 font-medium">{item.product_name}</span>
                    {item.selected_options.length > 0 && (
                      <div className="text-[11px] text-stone-600 pl-4">
                        {item.selected_options.map(o => `+ ${o.name}`).join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-stone-900">{formatFCFA(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {order.customer_note && (
              <div className="mt-4 p-3 bg-stone-50 rounded-xl text-xs text-stone-600 border border-stone-100">
                <span className="font-bold text-stone-700">Remarque transmise :</span> {order.customer_note}
              </div>
            )}
          </div>

        </div>

        {/* Help & Contact box */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center text-xs text-stone-600 space-y-2">
          <p className="font-semibold text-stone-800">
            Une question ou une demande pour votre table ?
          </p>
          <div className="flex items-center justify-center gap-2">
            {restaurant?.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold transition"
              >
                <span>📞 Appeler le restaurant</span>
              </a>
            )}
            <button
              onClick={() => alert(`Un serveur a été notifié pour la Table ${order.table_number}. Il arrive dans quelques instants !`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold border border-orange-200 transition"
            >
              <span>🔔 Appeler le serveur à table</span>
            </button>
          </div>
          <p className="text-[11px] text-stone-500 pt-1">
            Commande {order.order_number} • Table {order.table_number} • {restaurant?.name}
          </p>
        </div>

      </div>
    </div>
  );
};
