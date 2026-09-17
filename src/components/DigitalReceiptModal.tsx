import React from 'react';
import { Order, Restaurant } from '../types';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatTime, formatDate } from '../utils/format';
import { X, Printer, CheckCircle2, Sparkles } from 'lucide-react';

interface DigitalReceiptModalProps {
  order: Order;
  onClose: () => void;
  restaurantOverride?: Restaurant | null;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  order,
  onClose,
  restaurantOverride,
}) => {
  const { restaurants, saasBranding, saasPlans } = useApp();

  const restaurant = restaurantOverride || restaurants.find(r => r.id === order.restaurant_id) || ({
    id: order.restaurant_id || 'resto-unknown',
    name: 'Mon Restaurant',
    slug: 'mon-restaurant',
    phone: '+221 77 000 00 00',
    address: 'Dakar, Sénégal',
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
    current_plan_id: 'plan-free',
  } as unknown as Restaurant);

  // Determine if branding should be removed based on plan configuration
  const currentPlan = (saasPlans || []).find(p => p.id === (restaurant?.plan_id || (restaurant as any)?.current_plan_id));
  const hideBranding = currentPlan?.features?.remove_saas_branding ?? false;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        id={`digital-receipt-${order.id}`}
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]"
      >
        {/* Top bar (modal controls - hidden on print) */}
        <div className="p-3 bg-stone-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Billet de caisse électronique</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 overflow-y-auto font-mono text-stone-900 text-xs space-y-4 bg-stone-50/40">
          
          {/* Header Restaurant */}
          <div className="text-center space-y-1 border-b border-dashed border-stone-300 pb-4">
            {Boolean((restaurant.logo_url || (restaurant as any).logo)?.trim()) && (
              <img 
                src={restaurant.logo_url || (restaurant as any).logo} 
                alt={restaurant.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full mx-auto object-cover border border-stone-200 shadow-xs mb-2"
              />
            )}
            <h2 className="text-base font-black tracking-tight font-sans text-stone-900 uppercase">
              {restaurant.name}
            </h2>
            {restaurant.address && (
              <p className="text-[11px] text-stone-500 font-sans">{restaurant.address}</p>
            )}
            {restaurant.phone && (
              <p className="text-[11px] text-stone-500 font-sans">Tél : {restaurant.phone}</p>
            )}
          </div>

          {/* Ticket metadata */}
          <div className="border-b border-dashed border-stone-300 pb-3 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-500">Commande :</span>
              <span className="font-bold text-stone-900">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Table :</span>
              <span className="font-bold text-stone-900">{order.table_number || 'Comptoir'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Service :</span>
              <span className="font-bold text-stone-900 uppercase">
                {order.service_mode ? order.service_mode.replace('_', ' ') : 'SUR PLACE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date & Heure :</span>
              <span className="text-stone-700">
                {formatDate(order.created_at)} à {formatTime(order.created_at)}
              </span>
            </div>
            {order.customer_name && (
              <div className="flex justify-between">
                <span className="text-stone-500">Client :</span>
                <span className="font-semibold text-stone-800">{order.customer_name}</span>
              </div>
            )}
          </div>

          {/* Items breakdown */}
          <div className="space-y-2 border-b border-dashed border-stone-300 pb-4">
            <div className="flex justify-between font-bold text-stone-600 text-[10px] uppercase">
              <span>Articles</span>
              <span>Montant</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-stone-900 pr-2">
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="shrink-0 font-bold">{formatFCFA(item.subtotal)}</span>
                </div>
                {item.selected_options && item.selected_options.length > 0 && (
                  <div className="text-[10px] text-stone-500 pl-4">
                    {item.selected_options.map(opt => `+ ${opt.name} (${formatFCFA(opt.price)})`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-stone-600">
              <span>Sous-total HT :</span>
              <span>{formatFCFA(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm font-black font-sans text-stone-900 pt-1 border-t border-stone-200">
              <span>TOTAL TTC :</span>
              <span className="text-orange-600 font-mono text-base">{formatFCFA(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>Statut :</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {order.status === 'COMPLETED' ? 'RÉGLÉ & CLÔTURÉ' : 'ENREGISTRÉ'}
              </span>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="pt-3 pb-1 text-center border-t border-dashed border-stone-300">
            <div className="tracking-[0.25em] text-[14px] font-black text-stone-400 select-none">
              ||| | || |||| | ||| || |||
            </div>
            <p className="text-[9px] text-stone-400 mt-1 font-sans">
              Merci pour votre confiance ! À très bientôt.
            </p>
          </div>

          {/* Section 29 & 85: Mandatory discreet SaaS Branding at ticket bottom */}
          {!hideBranding && (
            <div className="pt-2 pb-1 text-center">
              <span className="text-[9px] text-stone-400 font-sans tracking-wide">
                Powered by <strong className="font-semibold text-stone-500">{saasBranding.platform_name || 'RESTO QR'}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Modal footer with action buttons */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
          >
            Fermer
          </button>
          <button
            id="btn-print-receipt"
            onClick={handlePrint}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>

      </div>
    </div>
  );
};
