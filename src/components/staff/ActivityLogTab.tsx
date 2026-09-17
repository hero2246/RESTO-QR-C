import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantActivityEvent } from '../../types';
import { 
  Activity, 
  Calendar, 
  Filter, 
  Clock, 
  User, 
  CheckCircle2, 
  UtensilsCrossed, 
  Receipt, 
  AlertCircle, 
  ShieldCheck, 
  ChefHat,
  Search
} from 'lucide-react';

export const ActivityLogTab: React.FC = () => {
  const { activeRestaurant, restaurantActivities } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeRestaurant) return null;

  // Filter activities for this restaurant
  const activitiesForRestaurant = useMemo(() => {
    return (restaurantActivities || []).filter(a => a.restaurant_id === activeRestaurant.id);
  }, [restaurantActivities, activeRestaurant]);

  // Filtered list
  const filteredActivities = useMemo(() => {
    return activitiesForRestaurant.filter(act => {
      if (selectedDate && act.date !== selectedDate) return false;
      if (selectedCategory !== 'ALL' && act.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          act.action.toLowerCase().includes(q) ||
          act.user_name.toLowerCase().includes(q) ||
          (act.target && act.target.toLowerCase().includes(q)) ||
          (act.details && act.details.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activitiesForRestaurant, selectedDate, selectedCategory, searchQuery]);

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'ATTENDANCE':
        return { label: 'Présence', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: User };
      case 'TASK':
        return { label: 'Tâche', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 };
      case 'ORDER':
        return { label: 'Commande', bg: 'bg-orange-100 text-orange-800 border-orange-200', icon: UtensilsCrossed };
      case 'PAYMENT':
        return { label: 'Encaissement', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: Receipt };
      case 'MENU':
        return { label: 'Carte & Menu', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: ChefHat };
      case 'STAFF':
        return { label: 'Équipe RH', bg: 'bg-stone-100 text-stone-800 border-stone-200', icon: ShieldCheck };
      default:
        return { label: 'Général', bg: 'bg-stone-100 text-stone-700 border-stone-200', icon: Activity };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span>Journal d'Activité Opérationnelle (Audit & Timeline)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Historique chronologique et immuable des actions effectuées au restaurant {activeRestaurant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 border border-stone-200">
            {filteredActivities.length} événement(s)
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700">
            <Calendar className="w-4 h-4 text-stone-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-stone-900 focus:outline-none"
            />
          </div>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 font-bold"
            >
              Toutes les dates
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'ATTENDANCE', 'TASK', 'ORDER', 'PAYMENT', 'STAFF'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat === 'ALL' ? 'Tous' :
               cat === 'ATTENDANCE' ? 'Présences' :
               cat === 'TASK' ? 'Tâches' :
               cat === 'ORDER' ? 'Commandes' :
               cat === 'PAYMENT' ? 'Caisses' : 'Personnel'}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6">
        {filteredActivities.length === 0 ? (
          <div className="py-16 text-center text-stone-400 space-y-1">
            <Activity className="w-8 h-8 mx-auto text-stone-300" />
            <p className="font-semibold text-sm">Aucun événement répertorié</p>
            <p className="text-xs text-stone-400">Les actions de service, pointages et commandes apparaîtront ici.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {filteredActivities.map((act, idx) => {
              const meta = getCategoryMeta(act.category);
              const CatIcon = meta.icon;

              return (
                <div key={`${act.id || 'act'}-${idx}`} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>

                  <div className="bg-stone-50/70 hover:bg-stone-100/70 border border-stone-200/80 rounded-2xl p-4 transition space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.bg}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{meta.label}</span>
                        </span>
                        <span className="text-xs font-black text-stone-900">
                          {act.action}
                        </span>
                        {act.target && (
                          <span className="text-xs text-stone-600 font-semibold">
                            → {act.target}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-mono text-stone-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{act.date} à {act.time}</span>
                      </div>
                    </div>

                    {act.details && (
                      <p className="text-xs text-stone-600 leading-relaxed pl-1">
                        {act.details}
                      </p>
                    )}

                    <div className="pt-2 border-t border-stone-200/60 flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-700">Auteur :</span>
                      <span>{act.user_name}</span>
                      <span className="text-stone-300">•</span>
                      <span className="font-mono text-stone-400 uppercase text-[10px]">{act.user_role}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
