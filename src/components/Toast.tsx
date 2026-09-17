import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isError = toastMessage.type === 'error';

  return (
    <div 
      id="toast-notification"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-stone-900 text-white text-sm font-medium border border-stone-800 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-amber-400 shrink-0" />}
      <span>{toastMessage.text}</span>
    </div>
  );
};
