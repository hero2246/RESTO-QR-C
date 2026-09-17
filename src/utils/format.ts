/**
 * Formats monetary amounts in FCFA currency format.
 * Example: 3500 -> "3 500 FCFA"
 */
export function formatFCFA(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 FCFA';
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

/**
 * Formats a date or timestamp into French readable format.
 */
export function formatTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatDateFr(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export const formatDate = formatDateFr;

/**
 * Calculates minutes elapsed since a given timestamp.
 */
export function getElapsedMinutes(dateString: string): number {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  } catch {
    return 0;
  }
}

/**
 * Order status translations and colors.
 */
export const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nouvelle commande',
  CONFIRMED: 'Commande confirmée',
  PREPARING: 'En préparation',
  READY: 'Commande prête',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  NEW: 'bg-amber-100 text-amber-800 border-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
  PREPARING: 'bg-purple-100 text-purple-800 border-purple-300',
  READY: 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse',
  COMPLETED: 'bg-stone-100 text-stone-700 border-stone-300',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300',
};
