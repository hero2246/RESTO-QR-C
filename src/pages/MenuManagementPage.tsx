import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Category, Product, ProductOption } from '../types';
import { formatFCFA } from '../utils/format';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  ChefHat, 
  Layers, 
  Eye, 
  EyeOff, 
  ArrowUp,
  ArrowDown,
  Search,
  ShieldAlert,
  Store,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface MenuManagementPageProps {
  navigate: (path: string) => void;
}

export const MenuManagementPage: React.FC<MenuManagementPageProps> = ({ navigate }) => {
  const { 
    currentUser,
    activeRestaurant, 
    categories, 
    products, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    reorderCategories,
    toggleCategoryVisibility,
    canManageCategories,
    canViewCategories,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductAvailability,
    showToast 
  } = useApp();

  // Sub-view: 'products' | 'categories'
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Active Category Filter for products
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categoryVisibleInput, setCategoryVisibleInput] = useState(true);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form Fields
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<string>('');
  const [prodCategory, setProdCategory] = useState<string>('');
  const [prodImage, setProdImage] = useState<string>('');
  const [prodAvailable, setProdAvailable] = useState<boolean>(true);
  const [prodOptions, setProdOptions] = useState<ProductOption[]>([]);
  
  // New option inputs
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState('');

  // Strict Role & Permission Guards
  const isSaaSAdmin = currentUser && (
    currentUser.role === 'OWNER' || 
    currentUser.role === 'ADMIN' || 
    currentUser.role === 'SAAS_EMPLOYEE'
  );

  const hasCategoryPermission = canManageCategories(activeRestaurant?.id);
  const hasViewPermission = canViewCategories(activeRestaurant?.id);

  // Categories strictly isolated for active restaurant
  const restoCategories = useMemo(() => {
    if (!activeRestaurant) return [];
    return categories
      .filter(c => c.restaurant_id === activeRestaurant.id)
      .sort((a, b) => a.order - b.order);
  }, [categories, activeRestaurant]);

  // Products strictly isolated for active restaurant
  const restoProducts = useMemo(() => {
    if (!activeRestaurant) return [];
    return products.filter(p => {
      const matchResto = p.restaurant_id === activeRestaurant.id;
      const matchCat = activeCategoryId === 'all' || p.category_id === activeCategoryId;
      const matchSearch = !productSearch.trim() || 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(productSearch.toLowerCase());
      return matchResto && matchCat && matchSearch;
    });
  }, [products, activeRestaurant, activeCategoryId, productSearch]);

  // ============================================================================
  // GUARD 1 : SUPER ADMIN SaaS INTERCEPT
  // "refuser l'accès au Super Admin (redirection ou message clair)"
  // ============================================================================
  if (isSaaSAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
              Isolation SaaS / Restaurant
            </span>
            <h2 className="text-xl font-black text-stone-900">
              Fonctionnalité Restaurant Uniquement
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              La gestion des <strong>catégories</strong> et des plats est une fonction opérationnelle réservée exclusivement aux établissements de restauration.
              Le Super Administrateur SaaS n’héberge aucune catégorie globale dans son espace de gestion.
            </p>
          </div>
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left text-xs space-y-2">
            <div className="font-bold text-stone-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-stone-500" />
              <span>Règle d’architecture RESTO QR :</span>
            </div>
            <p className="text-stone-600">
              Chaque restaurant possède ses propres catégories étanches liées à son <code>restaurant_id</code>. Pour modifier la carte d'un restaurant, basculez sur son profil ou connectez-vous avec son compte propriétaire.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>Retour Tableau de bord SaaS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/admin/restaurants')}
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-stone-500" />
              <span>Voir les Restaurants</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // GUARD 2 : RESTAURANT MANAGER WITHOUT PERMISSION INTERCEPT
  // "Sans cette permission : ne pas afficher le menu ; ne pas permettre l'accès direct par URL"
  // ============================================================================
  if (!hasCategoryPermission && !hasViewPermission) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
              Permission Refusée
            </span>
            <h2 className="text-lg font-black text-stone-900">
              Accès aux Catégories Non Autorisé
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Votre compte (<strong>{currentUser?.name || 'Gérant'}</strong>) ne possède pas la permission <code>manage_categories</code> requise pour administrer les catégories et le menu.
            </p>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs text-stone-600">
            💡 Demandez au Propriétaire de <strong>{activeRestaurant?.name || 'votre restaurant'}</strong> de vous accorder la permission <strong>"Gestion des catégories (manage_categories)"</strong> dans l'onglet Équipe & Permissions.
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-xs"
          >
            Retour au Tableau de bord du Restaurant
          </button>
        </div>
      </div>
    );
  }

  if (!activeRestaurant) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center text-stone-500 text-sm">
          Aucun restaurant actif sélectionné.
        </div>
      </div>
    );
  }

  // Open Category Modal
  const openCategoryModal = (cat?: Category) => {
    if (!hasCategoryPermission) {
      showToast("Permission 'manage_categories' requise.", 'error');
      return;
    }
    if (cat) {
      setEditingCategory(cat);
      setCategoryNameInput(cat.name);
      setCategoryVisibleInput(cat.is_visible);
    } else {
      setEditingCategory(null);
      setCategoryNameInput('');
      setCategoryVisibleInput(true);
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryNameInput.trim(), categoryVisibleInput);
    } else {
      addCategory(categoryNameInput.trim());
    }
    setIsCategoryModalOpen(false);
  };

  // Reordering categories
  const handleMoveCategory = (catId: string, direction: 'up' | 'down') => {
    const currentIndex = restoCategories.findIndex(c => c.id === catId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= restoCategories.length) return;

    const newOrder = [...restoCategories];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    reorderCategories(newOrder.map(c => c.id));
  };

  // Open Product Modal
  const openProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProdName(prod.name);
      setProdDesc(prod.description);
      setProdPrice(prod.price.toString());
      setProdCategory(prod.category_id);
      setProdImage(prod.image);
      setProdAvailable(prod.is_available);
      setProdOptions([...prod.options]);
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdCategory(restoCategories[0]?.id || '');
      setProdImage('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80');
      setProdAvailable(true);
      setProdOptions([]);
    }
    setIsProductModalOpen(true);
  };

  const handleAddOptionToProduct = () => {
    if (!newOptionName.trim()) return;
    const priceNum = parseInt(newOptionPrice, 10) || 0;
    setProdOptions(prev => [
      ...prev,
      {
        id: `opt-${Date.now()}`,
        name: newOptionName.trim(),
        price: priceNum,
      }
    ]);
    setNewOptionName('');
    setNewOptionPrice('');
  };

  const handleRemoveOption = (index: number) => {
    setProdOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim()) {
      showToast('Le nom et le prix en FCFA sont obligatoires', 'error');
      return;
    }

    const priceNumber = parseFloat(prodPrice) || 0;
    const targetCatId = prodCategory || restoCategories[0]?.id || '';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: prodName.trim(),
        description: prodDesc.trim(),
        price: priceNumber,
        category_id: targetCatId,
        image: prodImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        is_available: prodAvailable,
        options: prodOptions,
      });
    } else {
      addProduct({
        name: prodName.trim(),
        description: prodDesc.trim(),
        price: priceNumber,
        category_id: targetCatId,
        image: prodImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        is_available: prodAvailable,
        options: prodOptions,
      });
    }

    setIsProductModalOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with multi-tenant context badges */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                Espace Restaurant
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                restaurant_id: {activeRestaurant.id}
              </span>
              {hasCategoryPermission && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>manage_categories: OK</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-1.5 flex items-center gap-2">
              <span>Menu & Catégories — {activeRestaurant.name}</span>
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Toutes les catégories et les plats ci-dessous appartiennent exclusivement à cet établissement et sont isolés de tout autre compte.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/r/${activeRestaurant.slug}`)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition flex items-center gap-1.5 shadow-xs"
              title="Voir le menu client en direct"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              <span>Voir Menu Public</span>
            </button>

            {hasCategoryPermission && (
              <>
                <button
                  id="btn-add-category-header"
                  onClick={() => openCategoryModal()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-black text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter Catégorie</span>
                </button>
                <button
                  id="btn-add-product"
                  onClick={() => openProductModal()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau Plat</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            id="tab-view-products"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Plats & Produits ({restoProducts.length})</span>
          </button>

          <button
            id="tab-view-categories"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Gestion des Catégories ({restoCategories.length})</span>
          </button>
        </div>

        {/* =======================================================================
            VIEW 1: CATEGORIES MANAGEMENT (REORDER, VISIBILITY, CRUD)
           ======================================================================= */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-600" />
                  <span>Catégories du restaurant ({activeRestaurant.name})</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Organisez l'ordre d'affichage sur le QR code client, masquez temporairement ou modifiez vos catégories.
                </p>
              </div>

              {hasCategoryPermission && (
                <button
                  id="btn-add-category-inner"
                  onClick={() => openCategoryModal()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer une Catégorie</span>
                </button>
              )}
            </div>

            {restoCategories.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-3">
                <Layers className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-600">
                  Aucune catégorie créée pour ce restaurant pour le moment.
                </p>
                {hasCategoryPermission && (
                  <button
                    onClick={() => openCategoryModal()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition"
                  >
                    Ajouter la première catégorie
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {restoCategories.map((cat, index) => {
                  const catProductCount = products.filter(p => p.restaurant_id === activeRestaurant.id && p.category_id === cat.id).length;
                  return (
                    <div 
                      key={cat.id} 
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 px-3 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 font-black text-xs flex items-center justify-center border border-stone-200">
                          {cat.order || index + 1}
                        </span>
                        <div>
                          <div className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                            <span>{cat.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cat.is_visible 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}>
                              {cat.is_visible ? 'Affiché au menu' : 'Masqué du menu'}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500">
                            {catProductCount} plat(s) rattaché(s) • restaurant_id: {cat.restaurant_id}
                          </div>
                        </div>
                      </div>

                      {/* Controls: Reorder, Visibility, Edit, Delete */}
                      {hasCategoryPermission && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {/* Reorder Up */}
                          <button
                            onClick={() => handleMoveCategory(cat.id, 'up')}
                            disabled={index === 0}
                            className={`p-1.5 rounded-lg border transition ${
                              index === 0 
                                ? 'text-stone-300 border-stone-100 cursor-not-allowed' 
                                : 'text-stone-700 hover:bg-white border-stone-200'
                            }`}
                            title="Monter la catégorie"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Reorder Down */}
                          <button
                            onClick={() => handleMoveCategory(cat.id, 'down')}
                            disabled={index === restoCategories.length - 1}
                            className={`p-1.5 rounded-lg border transition ${
                              index === restoCategories.length - 1 
                                ? 'text-stone-300 border-stone-100 cursor-not-allowed' 
                                : 'text-stone-700 hover:bg-white border-stone-200'
                            }`}
                            title="Descendre la catégorie"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Visibility */}
                          <button
                            onClick={() => toggleCategoryVisibility(cat.id)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                              cat.is_visible 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                            }`}
                            title={cat.is_visible ? 'Masquer du menu public' : 'Afficher sur le menu public'}
                          >
                            {cat.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{cat.is_visible ? 'Visible' : 'Masqué'}</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openCategoryModal(cat)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg border border-stone-200 transition"
                            title="Modifier le nom"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer la catégorie "${cat.name}" ? Les plats associés resteront sans catégorie.`)) {
                                deleteCategory(cat.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-stone-200 transition"
                            title="Supprimer la catégorie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =======================================================================
            VIEW 2: PRODUCTS VIEW (FILTER BY CATEGORY, SEARCH, DISH MANAGEMENT)
           ======================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Category Filter Bar */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Filtrer par Catégorie ({restoCategories.length})</span>
                </h3>
                {hasCategoryPermission && (
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <span>Gérer les catégories</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  id="cat-filter-all"
                  onClick={() => setActiveCategoryId('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeCategoryId === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Tous les plats ({products.filter(p => p.restaurant_id === activeRestaurant.id).length})
                </button>

                {restoCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      activeCategoryId === cat.id
                        ? 'bg-orange-50 border-orange-400 text-orange-800'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {!cat.is_visible && (
                      <span className="text-[10px] text-stone-400">(Masqué)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un plat dans la carte..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Products Grid */}
            {restoProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
                <ChefHat className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-stone-600 text-sm font-semibold">Aucun plat trouvé dans cette sélection.</p>
                {hasCategoryPermission && (
                  <button
                    onClick={() => openProductModal()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition"
                  >
                    Ajouter un nouveau plat
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restoProducts.map(product => {
                  const cat = categories.find(c => c.id === product.category_id);
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Image */}
                        <div className="relative h-40 w-full bg-stone-100">
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'}
                            alt={product.name}
                            className={`w-full h-full object-cover ${!product.is_available ? 'grayscale opacity-60' : ''}`}
                          />
                          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                            {cat?.name || 'Non classé'}
                          </div>

                          <button
                            onClick={() => toggleProductAvailability(product.id)}
                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs transition flex items-center gap-1 ${
                              product.is_available
                                ? 'bg-emerald-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}
                            title="Changer la disponibilité"
                          >
                            {product.is_available ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>{product.is_available ? 'Disponible' : 'Épuisé'}</span>
                          </button>
                        </div>

                        {/* Body details */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-extrabold text-sm text-stone-900 leading-snug">
                              {product.name}
                            </h4>
                            <span className="font-black text-sm text-orange-600 shrink-0">
                              {formatFCFA(product.price)}
                            </span>
                          </div>

                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                            {product.description || 'Aucune description.'}
                          </p>

                          {/* Options badges */}
                          {product.options && product.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {product.options.map(opt => (
                                <span key={opt.id} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                                  +{opt.name} ({formatFCFA(opt.price)})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card actions */}
                      {hasCategoryPermission && (
                        <div className="p-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
                          <span className="text-[11px] text-stone-400 font-mono">
                            Catégorie: {cat?.name || 'Aucune'}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openProductModal(product)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition"
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer le plat "${product.name}" ?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* =======================================================================
          MODAL: ADD / EDIT CATEGORY (STRICT RESTAURANT SCOPE)
         ======================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-stone-200">
            <h3 className="text-base font-extrabold text-stone-900 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" />
              <span>{editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Cette catégorie sera créée exclusivement pour <strong>{activeRestaurant.name}</strong> (restaurant_id: {activeRestaurant.id}).
            </p>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Entrées, Plats Chauds, Grillades, Desserts..."
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20"
                  autoFocus
                  required
                />
              </div>

              {editingCategory && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="cat-visibility-check"
                    checked={categoryVisibleInput}
                    onChange={(e) => setCategoryVisibleInput(e.target.checked)}
                    className="rounded text-orange-600"
                  />
                  <label htmlFor="cat-visibility-check" className="text-xs font-medium text-stone-800">
                    Visible sur le menu QR code client
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  {editingCategory ? 'Enregistrer les modifications' : 'Créer la catégorie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: ADD / EDIT PRODUCT (LINKING TO CATEGORY)
         ======================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-stone-900 mb-1 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-orange-600" />
              <span>{editingProduct ? 'Modifier le plat' : 'Ajouter un plat à la carte'}</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Liez ce plat à une catégorie du restaurant ({activeRestaurant.name}).
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom du plat *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Thiéboudienne Rouge Penda Mbaye"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Prix en FCFA *
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 3500"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Catégorie de rattachement *
                </label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium"
                  required
                >
                  {restoCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {!c.is_visible ? '(Masquée)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description & Ingrédients
                </label>
                <textarea
                  placeholder="Riz rouge brisé, mérou blanc, légumes du marché, tamarin..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  URL de la photo
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                />
              </div>

              {/* Options / Suppléments */}
              <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    Options & Suppléments payants
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Ex: Piment supplémentaire, Frites
                  </span>
                </div>

                {prodOptions.length > 0 && (
                  <div className="space-y-1.5">
                    {prodOptions.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-stone-200">
                        <span className="font-semibold text-stone-800">{opt.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600">+{formatFCFA(opt.price)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-1 text-stone-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nom option (ex: Double Fromage)"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Prix FCFA (ex: 500)"
                    value={newOptionPrice}
                    onChange={(e) => setNewOptionPrice(e.target.value)}
                    className="w-28 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddOptionToProduct}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-black"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prod-available-check"
                  checked={prodAvailable}
                  onChange={(e) => setProdAvailable(e.target.checked)}
                  className="rounded text-orange-600"
                />
                <label htmlFor="prod-available-check" className="text-xs font-medium text-stone-800">
                  Produit disponible immédiatement à la commande
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Enregistrer le plat
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
