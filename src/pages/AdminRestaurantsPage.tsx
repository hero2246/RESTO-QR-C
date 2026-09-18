import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Restaurant } from '../types';
import { 
  Store, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface AdminRestaurantsPageProps {
  navigate: (path: string) => void;
}

export const AdminRestaurantsPage: React.FC<AdminRestaurantsPageProps> = ({ navigate }) => {
  const { 
    restaurants, 
    orders, 
    addRestaurant, 
    updateRestaurant,
    setRestaurantStatus, 
    toggleRestaurantStatus, 
    deleteRestaurant,
    setActiveRestaurant,
    setCurrentRole,
    showToast 
  } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResto, setEditingResto] = useState<Restaurant | null>(null);
  const [approvingRestaurantId, setApprovingRestaurantId] = useState<string | null>(null);

  const handleApproveRestaurant = async (restaurant: Restaurant) => {
    setApprovingRestaurantId(restaurant.id);
    try {
      const saved = await setRestaurantStatus(restaurant.id, 'ACTIVE');
      if (!saved) throw new Error('database');
      const response = await fetch('/api/send-approval-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          to: restaurant.email,
          ownerName: restaurant.owner_name,
          restaurantName: restaurant.name,
          loginUrl: `${window.location.origin}/login`,
        }),
      });
      if (!response.ok) {
        const emailError = await response.json().catch(() => null) as { error?: string } | null;
        showToast(`Restaurant approuvé, email non envoyé : ${emailError?.error || response.statusText}`, 'error');
        return;
      }
      showToast('Restaurant approuvé et email envoyé au propriétaire.', 'success');
    } catch {
      showToast('Approbation impossible : vérifiez la connexion Supabase.', 'error');
    } finally {
      setApprovingRestaurantId(null);
    }
  };

  // Form inputs
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#ea580c');
  const [secondaryColor, setSecondaryColor] = useState('#0f172a');
  const [isActive, setIsActive] = useState(true);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [restaurants, search]);

  const openModal = (resto?: Restaurant) => {
    if (resto) {
      setEditingResto(resto);
      setName(resto.name);
      setSlug(resto.slug);
      setEmail(resto.email);
      setPhone(resto.phone);
      setAddress(resto.address);
      setDescription(resto.description);
      setLogo(resto.logo);
      setCoverImage(resto.cover_image);
      setPrimaryColor(resto.primary_color);
      setSecondaryColor(resto.secondary_color);
      setIsActive(resto.status === 'ACTIVE');
    } else {
      setEditingResto(null);
      setName('');
      setSlug('');
      setEmail('');
      setPhone('+221 77 000 00 00');
      setAddress('Dakar, Sénégal');
      setDescription('Restaurant gastronomique & cuisine savoureuse.');
      setLogo('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80');
      setCoverImage('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80');
      setPrimaryColor('#ea580c');
      setSecondaryColor('#0f172a');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingResto) {
      // Auto generate slug
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showToast('Le nom et l’identifiant URL sont obligatoires', 'error');
      return;
    }

    if (editingResto) {
      updateRestaurant(editingResto.id, {
        name: name.trim(),
        slug: slug.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        description: description.trim(),
        logo: logo.trim(),
        cover_image: coverImage.trim(),
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        is_active: isActive,
      });
    } else {
      addRestaurant({
        name: name.trim(),
        slug: slug.trim(),
        email: email.trim() || `contact@${slug.trim()}.sn`,
        phone: phone.trim(),
        address: address.trim(),
        description: description.trim(),
        logo: logo.trim(),
        cover_image: coverImage.trim(),
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        is_active: isActive,
        hours: 'Lun-Dim : 11h30 - 23h00',
        instagram: '',
        facebook: '',
      });
    }

    setIsModalOpen(false);
  };

  const handleManageAsRestaurant = (resto: Restaurant) => {
    setActiveRestaurant(resto);
    setCurrentRole('RESTAURANT');
    navigate('/dashboard');
    showToast(`Session basculée sur ${resto.name}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                Gestion des Restaurants Partenaires
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Ajoutez, suspendez ou gérez les comptes restaurants de la plateforme RESTO QR.
            </p>
          </div>

          <button
            onClick={() => openModal()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Restaurant</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, URL slug ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Restaurants List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(resto => {
            const restoOrdersCount = orders.filter(o => o.restaurant_id === resto.id).length;

            return (
              <div
                key={resto.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Cover */}
                  <div className="relative h-28 w-full bg-stone-900">
                    <img
                      src={resto.cover_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'}
                      alt={resto.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleRestaurantStatus(resto.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs flex items-center gap-1 ${
                          resto.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {resto.status === 'ACTIVE' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>{resto.status === 'ACTIVE' ? 'Actif' : resto.status === 'PENDING' ? 'En attente' : 'Suspendu'}</span>
                      </button>
                    </div>

                    <div className="absolute -bottom-5 left-4">
                      <img
                        src={resto.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80'}
                        alt={resto.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md bg-white"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 pt-8 space-y-2">
                    <h3 className="text-base font-extrabold text-stone-900 leading-snug">
                      {resto.name}
                    </h3>
                    <div className="text-xs font-mono text-orange-600 font-semibold">
                      /r/{resto.slug}
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {resto.description || 'Aucune description fournie.'}
                    </p>
                    <div className="pt-2 text-[11px] text-stone-400 space-y-0.5">
                      <div>📍 {resto.address}</div>
                      <div>📞 {resto.phone}</div>
                      <div>📊 {restoOrdersCount} commande(s) enregistrée(s)</div>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                  <div className="p-4 pt-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-2">
                  {resto.status === 'PENDING' && (
                    <button
                      type="button"
                      disabled={approvingRestaurantId === resto.id}
                      onClick={() => void handleApproveRestaurant(resto)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold transition"
                    >
                      {approvingRestaurantId === resto.id ? 'Envoi...' : 'Approuver & envoyer le lien'}
                    </button>
                  )}
                  <button
                    onClick={() => handleManageAsRestaurant(resto)}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Gérer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/r/${resto.slug}`)}
                      className="p-1.5 text-stone-600 hover:text-orange-600 hover:bg-white rounded-lg transition"
                      title="Voir le menu client"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openModal(resto)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition"
                      title="Modifier les informations"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer définitivement le restaurant "${resto.name}" ?`)) {
                          deleteRestaurant(resto.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Modal Add / Edit Restaurant */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-stone-900 mb-4">
              {editingResto ? 'Modifier le restaurant' : 'Inscrire un nouveau restaurant'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Le Dakar Gourmand"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Slug URL (identifiant web) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-stone-100 border border-r-0 border-stone-300 rounded-l-xl text-xs text-stone-500">
                    /r/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="le-dakar-gourmand"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-r-xl text-sm font-mono focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email contact
                  </label>
                  <input
                    type="email"
                    placeholder="contact@resto.sn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+221 77 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Adresse physique
                </label>
                <input
                  type="text"
                  placeholder="Almadies, Dakar, Sénégal"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Spécialités sénégalaises et internationales..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    URL Logo
                  </label>
                  <input
                    type="url"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    URL Image de couverture
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="resto-active-check"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-orange-600"
                />
                <label htmlFor="resto-active-check" className="text-xs font-medium text-stone-800">
                  Restaurant actif et ouvert aux commandes publiques
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Enregistrer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
