import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductOption, SelectedOption, OrderItem } from '../types';
import { formatFCFA } from '../utils/format';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  MapPin, 
  Phone, 
  Search, 
  X, 
  Check, 
  ChefHat, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface PublicMenuPageProps {
  slug?: string;
  restaurantSlug?: string;
  navigate: (path: string) => void;
}

export const PublicMenuPage: React.FC<PublicMenuPageProps> = ({ slug, restaurantSlug, navigate }) => {
  const { restaurants, categories, products, tables, createOrder, showToast } = useApp();

  const targetSlug = slug || restaurantSlug || '';
  // Find restaurant by slug
  const restaurant = restaurants.find(r => r.slug.toLowerCase() === targetSlug.toLowerCase());
  const paymentConfig = restaurant as (typeof restaurant & { wave_payment_url?: string; orange_money_payment_url?: string; payment_qr_url?: string });

  // Selected Category
  const restoCategories = useMemo(() => {
    return categories
      .filter(c => c.restaurant_id === restaurant?.id && c.is_visible)
      .sort((a, b) => a.order - b.order);
  }, [categories, restaurant]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Table & Customer Details Form: a table QR identifies the client's table.
  const tableFromQr = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('table')
    : null;
  const [tableNumber, setTableNumber] = useState<string>(tableFromQr?.trim() || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [formError, setFormError] = useState('');

  // Product Customization Modal
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [chosenOptions, setChosenOptions] = useState<SelectedOption[]>([]);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Filtered products for this restaurant
  const restoProducts = useMemo(() => {
    if (!restaurant) return [];
    return products.filter(p => {
      const matchResto = p.restaurant_id === restaurant.id && p.is_available;
      const matchCat = selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchSearch = searchQuery.trim() === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchResto && matchCat && matchSearch;
    });
  }, [products, restaurant, selectedCategory, searchQuery]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Restaurant introuvable</h2>
          <p className="text-sm text-stone-600 mb-6">Le menu demandé n’existe pas ou n’est plus actif.</p>
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

  // SUSPENDED TENANT CHECK
  if (restaurant.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900">{restaurant.name}</h2>
            <p className="text-sm font-semibold text-stone-700 mt-2">
              Ce restaurant est temporairement indisponible.
            </p>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              La commande en ligne et le menu par QR code de cet établissement sont momentanément suspendus. Veuillez vous adresser directement au personnel en salle.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Restaurant theme styles
  const primaryColor = restaurant.primary_color || '#ea580c';

  // Handle open customization or direct add
  const handleProductClick = (product: Product) => {
    if (product.options && product.options.length > 0) {
      setCustomizingProduct(product);
      setChosenOptions([]);
      setModalQuantity(1);
    } else {
      // Direct add to cart
      addItemToCart(product, [], 1);
    }
  };

  const toggleOption = (option: ProductOption) => {
    setChosenOptions(prev => {
      const exists = prev.some(o => o.id === option.id);
      if (exists) {
        return prev.filter(o => o.id !== option.id);
      } else {
        return [...prev, { id: option.id, name: option.name, price: option.price }];
      }
    });
  };

  const addItemToCart = (product: Product, options: SelectedOption[], quantity: number) => {
    const optionsTotal = options.reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = product.price + optionsTotal;
    const subtotal = unitPrice * quantity;

    setCart(prev => {
      // Check if identical item with exact same options exists
      const existingIndex = prev.findIndex(item => 
        item.product_id === product.id &&
        JSON.stringify(item.selected_options.map(o => o.id).sort()) === JSON.stringify(options.map(o => o.id).sort())
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unit_price;
        return updated;
      } else {
        return [
          ...prev,
          {
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price: unitPrice,
            selected_options: options,
            subtotal,
          }
        ];
      }
    });

    showToast(`${quantity}x ${product.name} ajouté au panier`);
    setCustomizingProduct(null);
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      updated[index].subtotal = newQty * updated[index].unit_price;
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Cart total calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Available tables for this restaurant
  const restoTables = tables.filter(t => t.restaurant_id === restaurant.id && t.is_active);

  // Confirm Order Handler
  const handleConfirmOrder = () => {
    if (!tableNumber.trim()) {
      setFormError('Veuillez indiquer obligatoirement votre numéro de table.');
      return;
    }
    if (cart.length === 0) {
      setFormError('Votre panier est vide.');
      return;
    }

    setFormError('');

    const newOrder = createOrder({
      restaurant_id: restaurant.id,
      table_number: tableNumber.trim(),
      customer_name: customerName.trim() || undefined,
      customer_phone: customerPhone.trim() || undefined,
      customer_note: customerNote.trim() || undefined,
      items: cart,
      total_amount: cartTotal,
    });

    setCart([]);
    setIsCartOpen(false);
    showToast(`Commande ${newOrder.order_number} transmise en cuisine !`);
    navigate(`/order/${newOrder.id}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-28">
      
      {/* Restaurant Cover Header */}
      <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-stone-900">
        <img
          src={restaurant.cover_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
        
        {/* Top Badges / Navigation */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/60 transition"
          >
            ← Accueil RestoQR
          </button>
          
          <div className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Service Ouvert</span>
          </div>
        </div>

        {/* Restaurant Identity overlay */}
        <div className="absolute bottom-4 left-4 right-4 max-w-4xl mx-auto flex items-end gap-4">
          <img
            src={restaurant.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80'}
            alt={restaurant.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-white shrink-0"
          />
          <div className="text-white pb-1 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              {restaurant.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 line-clamp-1 mt-0.5">
              {restaurant.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-stone-300">
              {restaurant.address && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  {restaurant.address}
                </span>
              )}
              {restaurant.hours && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  {restaurant.hours}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-menu-search"
            type="text"
            placeholder="Rechercher un plat, burger, boisson..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sticky Category Navigation */}
        <div className="sticky top-16 z-30 bg-stone-50/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 border-b border-stone-200/60 overflow-x-auto no-scrollbar flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            Tous les plats ({products.filter(p => p.restaurant_id === restaurant.id && p.is_available).length})
          </button>
          {restoCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
              style={{
                backgroundColor: selectedCategory === cat.id ? primaryColor : undefined,
                borderColor: selectedCategory === cat.id ? primaryColor : undefined,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {restoProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
            <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">Aucun produit disponible</h3>
            <p className="text-xs text-stone-500 mt-1">
              {searchQuery ? "Aucun plat ne correspond à votre recherche." : "Le menu sera bientôt enrichi."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restoProducts.map(product => {
              const hasOptions = product.options && product.options.length > 0;
              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 flex gap-4 hover:shadow-md transition-shadow group relative overflow-hidden"
                >
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0 relative">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {hasOptions && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white uppercase">
                        Options
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                        {product.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                      <span className="font-extrabold text-stone-900 text-sm sm:text-base">
                        {formatFCFA(product.price)}
                      </span>

                      <button
                        onClick={() => handleProductClick(product)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs hover:opacity-95 active:scale-95 transition"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{hasOptions ? 'Choisir' : 'Ajouter'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Floating Bottom Cart Bar (Mobile & Desktop) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40">
          <button
            id="btn-open-cart"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between text-white font-bold text-sm transform hover:scale-[1.01] active:scale-[0.99] transition duration-200"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-xs">
                {cartItemCount}
              </div>
              <span>Voir mon panier</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{formatFCFA(cartTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Product Customization Modal (Options) */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Image & Header */}
            <div className="relative h-44 w-full bg-stone-900 shrink-0">
              <img
                src={customizingProduct.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                alt={customizingProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setCustomizingProduct(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/75 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <h3 className="text-lg font-bold text-stone-900">{customizingProduct.name}</h3>
              <p className="text-xs text-stone-500 mt-1">{customizingProduct.description}</p>
              <div className="font-extrabold text-stone-900 mt-2 text-base">
                Base : {formatFCFA(customizingProduct.price)}
              </div>

              {/* Options selection */}
              {customizingProduct.options && customizingProduct.options.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
                    Personnalisez votre plat (Options & Suppléments) :
                  </label>
                  <div className="space-y-2">
                    {customizingProduct.options.map(option => {
                      const isSelected = chosenOptions.some(o => o.id === option.id);
                      return (
                        <div
                          key={option.id}
                          onClick={() => toggleOption(option)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50/50 font-medium text-stone-900' 
                              : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border ${
                              isSelected ? 'bg-orange-600 border-orange-600 text-white' : 'border-stone-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span>{option.name}</span>
                          </div>
                          <span className="font-semibold text-xs text-stone-600">
                            +{formatFCFA(option.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="mt-6 flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-xs font-semibold text-stone-700">Quantité</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{modalQuantity}</span>
                  <button
                    onClick={() => setModalQuantity(q => q + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 shrink-0">
              <button
                onClick={() => addItemToCart(customizingProduct, chosenOptions, modalQuantity)}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-95 transition flex items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Ajouter à ma commande</span>
                <span>
                  {formatFCFA(
                    (customizingProduct.price + chosenOptions.reduce((s, o) => s + o.price, 0)) * modalQuantity
                  )}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Cart Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                  Votre Commande ({cartItemCount})
                </h3>
              </div>
              <button
                id="btn-close-cart"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <p className="text-stone-500 text-sm">Votre panier est vide.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
                  >
                    Parcourir le menu
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-stone-900 truncate">
                          {item.product_name}
                        </div>
                        {item.selected_options.length > 0 && (
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {item.selected_options.map(o => `+ ${o.name}`).join(', ')}
                          </div>
                        )}
                        <div className="font-semibold text-xs text-stone-900 mt-1">
                          {formatFCFA(item.unit_price)} x {item.quantity} = {formatFCFA(item.subtotal)}
                        </div>
                      </div>

                      {/* Quantity buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-white px-2 py-1 rounded-lg border border-stone-200">
                        <button
                          onClick={() => updateCartQuantity(index, -1)}
                          className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(index, 1)}
                          className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mandatory Table Selector & Details Form */}
              {cart.length > 0 && (
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Numéro de votre table * (Obligatoire)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        id="select-table-number"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {restoTables.map(t => (
                          <option key={t.id} value={t.name.replace('Table ', '')}>
                            {t.name}
                          </option>
                        ))}
                        <option value="Autre">Autre numéro / Emporter</option>
                      </select>
                      {tableNumber === 'Autre' && (
                        <input
                          type="text"
                          placeholder="Ex: 14"
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="w-24 px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Votre prénom (facultatif)
                    </label>
                    <input
                      id="input-customer-name"
                      type="text"
                      placeholder="Ex: Moussa"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Commentaire ou préférences cuisine (facultatif)
                    </label>
                    <input
                      id="input-customer-note"
                      type="text"
                      placeholder="Ex: Sans oignons, sauce à part..."
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  {formError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 shrink-0">
          <div className="mb-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-3.5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <p className="text-xs font-black text-stone-900">Payer maintenant</p>
                <p className="text-[11px] text-stone-500">Scannez le QR du restaurant ou ouvrez votre moyen de paiement.</p>
              </div>
              {paymentConfig?.payment_qr_url && <img src={paymentConfig.payment_qr_url} alt="QR code de paiement" className="w-16 h-16 rounded-lg border border-white bg-white object-contain" />}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {paymentConfig?.wave_payment_url && <a href={paymentConfig.wave_payment_url} target="_blank" rel="noreferrer" className="rounded-xl bg-[#19a9e5] px-3 py-2 text-center text-[11px] font-black text-white hover:opacity-90">Payer avec Wave</a>}
              {paymentConfig?.orange_money_payment_url && <a href={paymentConfig.orange_money_payment_url} target="_blank" rel="noreferrer" className="rounded-xl bg-[#ff7900] px-3 py-2 text-center text-[11px] font-black text-white hover:opacity-90">Payer avec Orange Money</a>}
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-stone-600 font-medium">Total à régler en caisse / table</span>
                  <span className="text-xl font-extrabold text-stone-900">{formatFCFA(cartTotal)}</span>
                </div>

                <button
                  id="btn-confirm-order"
                  onClick={handleConfirmOrder}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-sm shadow-lg hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>CONFIRMER LA COMMANDE</span>
                </button>
                <p className="text-[11px] text-center text-stone-400 mt-2">
                  Aucun paiement immédiat en ligne requis • Paiement à table
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
